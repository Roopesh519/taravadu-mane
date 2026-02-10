import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';
import { requireAdminOrTreasurer } from '@/lib/firebase/adminAuth';

function parseNumber(value: any, fallback: number | null = null) {
    if (value === null || value === undefined || value === '') return fallback;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
}

function parseDate(value: any): Date | null {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

export async function POST(req: Request) {
    try {
        const admin = await requireAdminOrTreasurer(req.headers.get('authorization'));
        const adminDb = getAdminDb();
        const body = await req.json();

        const userId = body.user_id;
        const year = parseNumber(body.year);
        const amount = parseNumber(body.amount);
        const status = body.status;
        const paymentMode = body.payment_mode || '';
        const paidOn = parseDate(body.paid_on);

        if (!userId || year === null || amount === null || !status) {
            return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
        }

        if (status === 'paid' && !paidOn) {
            return NextResponse.json({ error: 'Paid contributions must include a paid date.' }, { status: 400 });
        }

        const now = new Date();
        const contributionRef = await adminDb.collection('contributions').add({
            user_id: userId,
            year,
            amount,
            status,
            paid_on: paidOn || null,
            payment_mode: paymentMode || null,
            created_by: admin.uid,
            created_at: now,
            updated_at: now,
        });

        await adminDb.collection('transactions').add({
            type: 'income',
            category: 'contribution',
            amount,
            reference_id: contributionRef.id,
            created_by: admin.uid,
            created_at: now,
        });

        await adminDb.collection('audit_logs').add({
            action: 'created_contribution',
            performed_by: admin.uid,
            entity_type: 'contribution',
            entity_id: contributionRef.id,
            timestamp: now,
        });

        return NextResponse.json({ ok: true, id: contributionRef.id });
    } catch (error: any) {
        const status = error.message === 'Forbidden' ? 403 : 401;
        return NextResponse.json({ error: error.message || 'Unauthorized' }, { status });
    }
}
