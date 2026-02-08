import { NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase/admin';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const name = (body.name || '').trim();
        const email = (body.email || '').trim().toLowerCase();

        if (!name || !email) {
            return NextResponse.json({ error: 'Name and email are required.' }, { status: 400 });
        }

        // If user already exists, avoid duplicate access requests.
        const adminAuth = getAdminAuth();
        const adminDb = getAdminDb();

        try {
            await adminAuth.getUserByEmail(email);
            return NextResponse.json({ error: 'An account already exists for this email.' }, { status: 409 });
        } catch (err: any) {
            // Ignore "user not found" errors
        }

        const existing = await adminDb
            .collection('access_requests')
            .where('email', '==', email)
            .where('status', '==', 'pending')
            .limit(1)
            .get();

        if (!existing.empty) {
            return NextResponse.json(
                { error: 'A pending request already exists for this email.' },
                { status: 409 }
            );
        }

        await adminDb.collection('access_requests').add({
            name,
            email,
            status: 'pending',
            created_at: new Date(),
            updated_at: new Date(),
        });

        return NextResponse.json({ ok: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Failed to submit request.' }, { status: 500 });
    }
}
