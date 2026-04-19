import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';
import { requireAdmin } from '@/lib/firebase/adminAuth';
import { deleteGalleryImage, uploadGalleryImage } from '@/lib/cloudinary';

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

function mapError(error: any, defaultMessage: string) {
    const message = String(error?.message || defaultMessage);

    if (message === 'Forbidden') {
        return apiError(403, 'FORBIDDEN', 'Only admins can manage gallery photos.');
    }
    if (message === 'Missing auth token') {
        return apiError(401, 'MISSING_AUTH_TOKEN', 'You must be signed in to manage photos.');
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
        return apiError(502, prefixed.code, 'Could not send image request to storage service.', true);
    }
    if (prefixed?.code === 'CLOUDINARY_UPLOAD_ERROR') {
        return apiError(502, prefixed.code, prefixed.details || 'Image storage request failed.');
    }
    if (prefixed?.code === 'CLOUDINARY_CONFIG_ERROR') {
        return apiError(500, prefixed.code, 'Cloudinary server configuration is invalid.');
    }

    if (message === 'PHOTO_ID_REQUIRED') {
        return apiError(400, 'PHOTO_ID_REQUIRED', 'A gallery photo ID is required.');
    }
    if (message === 'PHOTO_NOT_FOUND') {
        return apiError(404, 'PHOTO_NOT_FOUND', 'Gallery photo not found.');
    }
    if (message === 'INVALID_FILE_TYPE') {
        return apiError(400, 'INVALID_FILE_TYPE', 'Only image files are allowed.');
    }
    if (message === 'FILE_TOO_LARGE') {
        return apiError(400, 'FILE_TOO_LARGE', 'Each image must be 15MB or less.');
    }

    return apiError(500, 'INTERNAL_ERROR', message);
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
        return mapError(error, 'Failed to upload gallery images.');
    }
}

export async function PATCH(req: Request) {
    try {
        const admin = await requireAdmin(req.headers.get('authorization'));
        const form = await req.formData();
        const photoId = String(form.get('photoId') || '').trim();
        const title = String(form.get('title') || '').trim();
        const image = form.get('image');

        if (!photoId) {
            throw new Error('PHOTO_ID_REQUIRED');
        }

        const adminDb = getAdminDb();
        const docRef = adminDb.collection('gallery_photos').doc(photoId);
        const snapshot = await docRef.get();

        if (!snapshot.exists) {
            throw new Error('PHOTO_NOT_FOUND');
        }

        const current = snapshot.data() || {};
        const updates: Record<string, any> = {
            title: title || null,
            updated_at: new Date(),
        };

        let previousPublicId = '';

        if (image && isUploadedFile(image) && image.size > 0) {
            if (!image.type.startsWith('image/')) {
                throw new Error('INVALID_FILE_TYPE');
            }
            if (image.size > MAX_FILE_SIZE) {
                throw new Error('FILE_TOO_LARGE');
            }

            const uploaded = await uploadGalleryImage({
                bytes: new Uint8Array(await image.arrayBuffer()),
                fileName: image.name,
                mimeType: image.type || 'application/octet-stream',
            });

            updates.image_url = uploaded.secureUrl;
            updates.public_id = uploaded.publicId;
            updates.width = uploaded.width;
            updates.height = uploaded.height;
            updates.bytes = uploaded.bytes;
            updates.format = uploaded.format;
            updates.compression = 'q_auto:good,f_auto,fl_progressive';
            previousPublicId = String(current.public_id || '');

            try {
                await docRef.update(updates);
            } catch (error) {
                await deleteGalleryImage(uploaded.publicId).catch(() => null);
                throw error;
            }

            if (previousPublicId && previousPublicId !== uploaded.publicId) {
                await deleteGalleryImage(previousPublicId);
            }
        } else {
            await docRef.update(updates);
        }

        await adminDb.collection('audit_logs').add({
            action: 'updated_gallery_photo',
            performed_by: admin.uid,
            entity_type: 'gallery_photo',
            entity_id: photoId,
            timestamp: new Date(),
        });

        return NextResponse.json({ ok: true });
    } catch (error: any) {
        return mapError(error, 'Failed to update gallery photo.');
    }
}

export async function DELETE(req: Request) {
    try {
        const admin = await requireAdmin(req.headers.get('authorization'));
        const body = await req.json().catch(() => ({}));
        const photoId = String(body?.photoId || '').trim();

        if (!photoId) {
            throw new Error('PHOTO_ID_REQUIRED');
        }

        const adminDb = getAdminDb();
        const docRef = adminDb.collection('gallery_photos').doc(photoId);
        const snapshot = await docRef.get();

        if (!snapshot.exists) {
            throw new Error('PHOTO_NOT_FOUND');
        }

        const current = snapshot.data() || {};
        const publicId = String(current.public_id || '');
        if (publicId) {
            await deleteGalleryImage(publicId);
        }

        await docRef.delete();
        await adminDb.collection('audit_logs').add({
            action: 'deleted_gallery_photo',
            performed_by: admin.uid,
            entity_type: 'gallery_photo',
            entity_id: photoId,
            timestamp: new Date(),
        });

        return NextResponse.json({ ok: true });
    } catch (error: any) {
        return mapError(error, 'Failed to delete gallery photo.');
    }
}
