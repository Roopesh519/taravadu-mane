import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';
import { requireAdmin } from '@/lib/firebase/adminAuth';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    try {
        const admin = await requireAdmin(req.headers.get('authorization'));
        const adminDb = getAdminDb();
        const requestId = params.id;

        const requestRef = adminDb.collection('access_requests').doc(requestId);
        const requestSnap = await requestRef.get();

        if (!requestSnap.exists) {
            return NextResponse.json({ error: 'Request not found.' }, { status: 404 });
        }

        const requestData = requestSnap.data();
        if (requestData?.status !== 'pending') {
            return NextResponse.json({ error: 'Request is not pending.' }, { status: 409 });
        }

        await requestRef.set(
            {
                status: 'denied',
                denied_at: new Date(),
                denied_by: admin.uid,
                updated_at: new Date(),
            },
            { merge: true }
        );

        return NextResponse.json({ ok: true });
    } catch (error: any) {
        const status = error.message === 'Forbidden' ? 403 : 401;
        return NextResponse.json({ error: error.message || 'Unauthorized' }, { status });
    }
}
