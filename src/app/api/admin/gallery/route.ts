import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';
import { requireAdmin } from '@/lib/firebase/adminAuth';
import { uploadGalleryImage } from '@/lib/cloudinary';

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

function apiError(status: number, code: string, error: string, retryable = false) {
    return NextResponse.json({ code, error, retryable }, { status });
}

function parsePrefixedError(message: string) {
    const index = message.indexOf(':');
    if (index === -1) return null;
    return {
        code: message.slice(0, index),
        details: message.slice(index + 1).trim(),
    };
}

function isUploadedFile(value: FormDataEntryValue): value is File {
    if (typeof value === 'string') return false;
    const candidate = value as File;
    return (
        typeof candidate.arrayBuffer === 'function' &&
        typeof candidate.name === 'string' &&
        typeof candidate.size === 'number' &&
        typeof candidate.type === 'string'
    );
}

export async function POST(req: Request) {
    try {
        const admin = await requireAdmin(req.headers.get('authorization'));
        const form = await req.formData();

        const title = String(form.get('title') || '').trim();
        const files = form
            .getAll('images')
            .filter((item): item is File => isUploadedFile(item) && item.size > 0);

        if (!files.length) {
            return apiError(400, 'NO_FILES', 'Please upload at least one image.');
        }

        const invalidType = files.find((file) => !file.type.startsWith('image/'));
        if (invalidType) {
            return apiError(400, 'INVALID_FILE_TYPE', `Only image files are allowed. Invalid file: ${invalidType.name}`);
        }

        const oversized = files.find((file) => file.size > MAX_FILE_SIZE);
        if (oversized) {
            return apiError(400, 'FILE_TOO_LARGE', `Each image must be 15MB or less. Invalid file: ${oversized.name}`);
        }

        const adminDb = getAdminDb();
        const now = new Date();

        const uploads = await Promise.all(
            files.map(async (file) => {
                const bytes = new Uint8Array(await file.arrayBuffer());
                const uploaded = await uploadGalleryImage({
                    bytes,
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
        const message = String(error?.message || 'Failed to upload gallery images.');

        if (message === 'Forbidden') {
            return apiError(403, 'FORBIDDEN', 'Only admins can upload gallery photos.');
        }
        if (message === 'Missing auth token') {
            return apiError(401, 'MISSING_AUTH_TOKEN', 'You must be signed in to upload photos.');
        }

        const prefixed = parsePrefixedError(message);
        if (prefixed?.code === 'CLOUDINARY_NETWORK_ERROR') {
            return apiError(
                503,
                prefixed.code,
                'Image storage is temporarily unreachable. Please try again.',
                true
            );
        }
        if (prefixed?.code === 'CLOUDINARY_REQUEST_ERROR') {
            return apiError(502, prefixed.code, 'Could not send image upload request to storage service.', true);
        }
        if (prefixed?.code === 'CLOUDINARY_UPLOAD_ERROR') {
            return apiError(502, prefixed.code, prefixed.details || 'Image upload was rejected by storage service.');
        }
        if (prefixed?.code === 'CLOUDINARY_CONFIG_ERROR') {
            return apiError(500, prefixed.code, 'Cloudinary server configuration is invalid.');
        }

        return apiError(500, 'INTERNAL_ERROR', message);
    }
}
