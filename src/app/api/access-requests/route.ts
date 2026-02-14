import { NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase/admin';
import { enforceIpRateLimit } from '@/lib/api/rateLimit';

function isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const name = (body.name || '').trim();
        const email = (body.email || '').trim().toLowerCase();

        if (!name || !email) {
            return NextResponse.json({ error: 'Name and email are required.' }, { status: 400 });
        }
        if (!isValidEmail(email)) {
            return NextResponse.json({ error: 'Please provide a valid email address.' }, { status: 400 });
        }
        if (name.length > 120) {
            return NextResponse.json({ error: 'Name is too long.' }, { status: 400 });
        }

        // If user already exists, avoid duplicate access requests.
        const adminAuth = getAdminAuth();
        const adminDb = getAdminDb();
        const rateLimit = await enforceIpRateLimit({
            db: adminDb,
            req,
            routeKey: 'access_requests:create',
            maxRequests: 5,
            windowMs: 60 * 60 * 1000,
        });

        if (!rateLimit.allowed) {
            return NextResponse.json(
                {
                    error: 'Too many requests. Please try again later.',
                    retry_after_seconds: rateLimit.retryAfterSeconds,
                },
                {
                    status: 429,
                    headers: rateLimit.retryAfterSeconds
                        ? { 'Retry-After': String(rateLimit.retryAfterSeconds) }
                        : {},
                }
            );
        }

        // A Firebase Auth record alone is not always a usable portal account.
        // Treat it as an existing account only when a user profile document also exists.
        try {
            const authUser = await adminAuth.getUserByEmail(email);
            const existingUserProfile = await adminDb.collection('users').doc(authUser.uid).get();
            if (existingUserProfile.exists) {
                return NextResponse.json({ error: 'An account already exists for this email.' }, { status: 409 });
            }
        } catch (err: any) {
            if (err?.code !== 'auth/user-not-found') {
                throw err;
            }
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
