import { NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase/admin';
import { requireAdmin } from '@/lib/firebase/adminAuth';
import crypto from 'crypto';

function generateTempPassword() {
    return crypto.randomBytes(12).toString('hex');
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    try {
        const admin = await requireAdmin(req.headers.get('authorization'));
        const adminAuth = getAdminAuth();
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

        const email = requestData?.email;
        const name = requestData?.name;

        if (!email || !name) {
            return NextResponse.json({ error: 'Invalid request data.' }, { status: 400 });
        }

        // Ensure user doesn't already exist
        try {
            await adminAuth.getUserByEmail(email);
            return NextResponse.json(
                { error: 'An account already exists for this email.' },
                { status: 409 }
            );
        } catch (err: any) {
            // Continue if user not found
        }

        const tempPassword = generateTempPassword();
        const userRecord = await adminAuth.createUser({
            email,
            password: tempPassword,
            displayName: name,
        });

        const userRef = adminDb.collection('users').doc(userRecord.uid);
        const existingUser = await userRef.get();

        await userRef.set(
            {
                name,
                email,
                roles: ['member'],
                must_change_password: true,
                created_at: existingUser.exists ? existingUser.data()?.created_at : new Date(),
                updated_at: new Date(),
            },
            { merge: true }
        );

        await requestRef.set(
            {
                status: 'approved',
                approved_at: new Date(),
                approved_by: admin.uid,
                updated_at: new Date(),
                temp_password_issued_at: new Date(),
            },
            { merge: true }
        );

        const origin = req.headers.get('origin') || '';
        const loginUrl = origin ? `${origin}/login` : '/login';

        return NextResponse.json({
            ok: true,
            tempPassword,
            loginUrl,
        });
    } catch (error: any) {
        const status = error.message === 'Forbidden' ? 403 : 401;
        return NextResponse.json({ error: error.message || 'Unauthorized' }, { status });
    }
}
