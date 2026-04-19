import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NO_STORE_HEADERS = {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
    Pragma: 'no-cache',
    Expires: '0',
};

function apiError(status: number, code: string, error: string, retryable = false) {
    return NextResponse.json({ code, error, retryable }, { status, headers: NO_STORE_HEADERS });
}

function asIso(value: any): string | null {
    if (!value) return null;
    if (value instanceof Date) return value.toISOString();
    if (typeof value.toDate === 'function') return value.toDate().toISOString();
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

export async function GET() {
    try {
        const adminDb = getAdminDb();
        const snapshot = await adminDb
            .collection('gallery_photos')
            .orderBy('created_at', 'desc')
            .limit(200)
            .get();

        const photos = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                title: data.title || '',
                image_url: data.image_url || '',
                width: data.width || null,
                height: data.height || null,
                created_at: asIso(data.created_at),
            };
        });

        return NextResponse.json({ photos }, { headers: NO_STORE_HEADERS });
    } catch (error: any) {
        return apiError(500, 'GALLERY_FETCH_ERROR', error.message || 'Failed to load gallery photos.', true);
    }
}
