import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';
import { requireAdmin } from '@/lib/firebase/adminAuth';
import { uploadGalleryImage } from '@/lib/cloudinary';

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

type UploadedFile = {
    name: string;
    type: string;
    size: number;
    arrayBuffer: () => Promise<ArrayBuffer>;
};

function isUploadedFile(value: FormDataEntryValue): value is UploadedFile {
    return (
        typeof value !== 'string' &&
        typeof (value as UploadedFile).arrayBuffer === 'function' &&
        typeof (value as UploadedFile).name === 'string' &&
        typeof (value as UploadedFile).size === 'number'
    );
}

export async function POST(req: Request) {
    try {
        const admin = await requireAdmin(req.headers.get('authorization'));
        const form = await req.formData();

        const title = String(form.get('title') || '').trim();
        const files = form
            .getAll('images')
            .filter((item): item is UploadedFile => isUploadedFile(item) && item.size > 0);

        if (!files.length) {
            return NextResponse.json({ error: 'Please upload at least one image.' }, { status: 400 });
        }

        const invalidType = files.find((file) => !file.type.startsWith('image/'));
        if (invalidType) {
            return NextResponse.json({ error: 'Only image files are allowed.' }, { status: 400 });
        }

        const oversized = files.find((file) => file.size > MAX_FILE_SIZE);
        if (oversized) {
            return NextResponse.json({ error: 'Each image must be 15MB or less.' }, { status: 400 });
        }

        const adminDb = getAdminDb();
        const now = new Date();

        const uploads = await Promise.all(
            files.map(async (file) => {
                const buffer = Buffer.from(await file.arrayBuffer());
                const uploaded = await uploadGalleryImage({
                    buffer,
                    fileName: file.name,
                    mimeType: file.type || 'application/octet-stream',
                });

                const docRef = await adminDb.collection('gallery_photos').add({
                    title: title || null,
                    image_url: uploaded.secureUrl,
                    public_id: uploaded.publicId,
                    width: uploaded.width,
                    height: uploaded.height,
                    bytes: uploaded.bytes,
                    format: uploaded.format,
                    compression: 'q_auto:good,f_auto,fl_progressive',
                    uploaded_by: admin.uid,
                    created_at: now,
                    updated_at: now,
                });

                await adminDb.collection('audit_logs').add({
                    action: 'uploaded_gallery_photo',
                    performed_by: admin.uid,
                    entity_type: 'gallery_photo',
                    entity_id: docRef.id,
                    timestamp: new Date(),
                });

                return {
                    id: docRef.id,
                    image_url: uploaded.secureUrl,
                    width: uploaded.width,
                    height: uploaded.height,
                };
            })
        );

        return NextResponse.json({ ok: true, uploads }, { status: 201 });
    } catch (error: any) {
        if (error.message === 'Forbidden') {
            return NextResponse.json({ error: error.message }, { status: 403 });
        }
        if (error.message === 'Missing auth token') {
            return NextResponse.json({ error: error.message }, { status: 401 });
        }
        return NextResponse.json({ error: error.message || 'Failed to upload gallery images.' }, { status: 500 });
    }
}
