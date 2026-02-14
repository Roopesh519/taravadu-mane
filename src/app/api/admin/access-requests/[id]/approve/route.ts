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

        const tempPassword = generateTempPassword();

        let userRecord;
        try {
            const existingAuthUser = await adminAuth.getUserByEmail(email);
            const existingUserProfile = await adminDb.collection('users').doc(existingAuthUser.uid).get();

            if (existingUserProfile.exists) {
                return NextResponse.json(
                    { error: 'An account already exists for this email.' },
                    { status: 409 }
                );
            }

            userRecord = await adminAuth.updateUser(existingAuthUser.uid, {
                password: tempPassword,
                displayName: name,
            });
        } catch (err: any) {
            if (err?.code !== 'auth/user-not-found') {
                throw err;
            }

            userRecord = await adminAuth.createUser({
                email,
                password: tempPassword,
                displayName: name,
            });
        }

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
