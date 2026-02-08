import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';
import { requireAdmin } from '@/lib/firebase/adminAuth';

export async function GET(req: Request) {
    try {
        await requireAdmin(req.headers.get('authorization'));
        const adminDb = getAdminDb();

        const snapshot = await adminDb
            .collection('access_requests')
            .orderBy('created_at', 'desc')
            .get();

        const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        return NextResponse.json({ data });
    } catch (error: any) {
        const status = error.message === 'Forbidden' ? 403 : 401;
        return NextResponse.json({ error: error.message || 'Unauthorized' }, { status });
    }
}
