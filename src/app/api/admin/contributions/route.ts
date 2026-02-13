import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';
import { requireAdminOrTreasurer } from '@/lib/firebase/adminAuth';
import { validateContributionCreate } from '@/lib/api/financeValidation';

export async function POST(req: Request) {
    try {
        const admin = await requireAdminOrTreasurer(req.headers.get('authorization'));
        const adminDb = getAdminDb();
        const body = await req.json();
        const parsed = validateContributionCreate(body);
        if (!parsed.ok) {
            return NextResponse.json({ error: parsed.error }, { status: 400 });
        }

        const now = new Date();
        const contributionRef = adminDb.collection('contributions').doc();
        const transactionRef = adminDb.collection('transactions').doc();
        const auditRef = adminDb.collection('audit_logs').doc();

        await adminDb.runTransaction(async (tx) => {
            if (parsed.data.event_id) {
                const eventRef = adminDb.collection('events').doc(parsed.data.event_id);
                const eventSnap = await tx.get(eventRef);
                if (!eventSnap.exists) {
                    throw new Error('INVALID_EVENT');
                }
            }

            tx.create(contributionRef, {
                ...parsed.data,
                created_by: admin.uid,
                created_at: now,
                updated_at: now,
            });

            tx.create(transactionRef, {
                type: 'income',
                category: 'contribution',
                amount: parsed.data.amount,
                reference_id: contributionRef.id,
                created_by: admin.uid,
                created_at: now,
            });

            tx.create(auditRef, {
                action: 'created_contribution',
                performed_by: admin.uid,
                entity_type: 'contribution',
                entity_id: contributionRef.id,
                timestamp: now,
            });
        });

        return NextResponse.json({ ok: true, id: contributionRef.id });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'INTERNAL_ERROR';
        if (message === 'INVALID_EVENT') {
            return NextResponse.json({ error: 'Selected event was not found.' }, { status: 400 });
        }
        if (message === 'Forbidden') {
            return NextResponse.json({ error: message }, { status: 403 });
        }
        if (message === 'Missing auth token') {
            return NextResponse.json({ error: message }, { status: 401 });
        }
        return NextResponse.json({ error: 'Failed to create contribution.' }, { status: 500 });
    }
}
