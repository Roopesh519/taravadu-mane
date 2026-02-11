import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';

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

        return NextResponse.json({ photos });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Failed to load gallery' }, { status: 500 });
    }
}
