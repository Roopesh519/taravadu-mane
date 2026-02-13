import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';
import { requireAdminOrTreasurer } from '@/lib/firebase/adminAuth';
import { validateContributionPatch } from '@/lib/api/financeValidation';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    try {
        const admin = await requireAdminOrTreasurer(req.headers.get('authorization'));
        const adminDb = getAdminDb();
        const body = await req.json();
        const contributionId = params.id;
        const parsed = validateContributionPatch(body);

        if (!parsed.ok) {
            return NextResponse.json({ error: parsed.error }, { status: 400 });
        }

        const contributionRef = adminDb.collection('contributions').doc(contributionId);
        const txQuery = adminDb
            .collection('transactions')
            .where('reference_id', '==', contributionId)
            .limit(1);
        const auditRef = adminDb.collection('audit_logs').doc();
        const now = new Date();

        await adminDb.runTransaction(async (tx) => {
            const existing = await tx.get(contributionRef);
            if (!existing.exists) {
                throw new Error('NOT_FOUND');
            }

            const existingData = existing.data() || {};
            const mergedStatus = parsed.data.status ?? existingData.status;
            const mergedPaidOn =
                parsed.data.paid_on !== undefined
                    ? parsed.data.paid_on
                    : (existingData.paid_on ?? null);

            if (mergedStatus === 'paid' && !mergedPaidOn) {
                throw new Error('MISSING_PAID_ON');
            }

            if (parsed.data.event_id) {
                const eventRef = adminDb.collection('events').doc(parsed.data.event_id);
                const eventSnap = await tx.get(eventRef);
                if (!eventSnap.exists) {
                    throw new Error('INVALID_EVENT');
                }
            }

            tx.update(contributionRef, { ...parsed.data, updated_at: now });

            if (parsed.data.amount !== undefined) {
                const txSnap = await tx.get(txQuery);
                if (!txSnap.empty) {
                    tx.update(txSnap.docs[0].ref, {
                        amount: parsed.data.amount,
                        updated_at: now,
                    });
                }
            }

            tx.create(auditRef, {
                action: 'updated_contribution',
                performed_by: admin.uid,
                entity_type: 'contribution',
                entity_id: contributionId,
                timestamp: now,
            });
        });

        return NextResponse.json({ ok: true });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unauthorized';
        if (message === 'NOT_FOUND') {
            return NextResponse.json({ error: 'Contribution not found.' }, { status: 404 });
        }
        if (message === 'INVALID_EVENT') {
            return NextResponse.json({ error: 'Selected event was not found.' }, { status: 400 });
        }
        if (message === 'MISSING_PAID_ON') {
            return NextResponse.json({ error: 'Paid contributions must include a paid date.' }, { status: 400 });
        }
        if (message === 'Forbidden') {
            return NextResponse.json({ error: message }, { status: 403 });
        }
        if (message === 'Missing auth token') {
            return NextResponse.json({ error: message }, { status: 401 });
        }
        return NextResponse.json({ error: 'Failed to update contribution.' }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        const admin = await requireAdminOrTreasurer(req.headers.get('authorization'));
        const adminDb = getAdminDb();
        const contributionId = params.id;

        const contributionRef = adminDb.collection('contributions').doc(contributionId);
        const txQuery = adminDb
            .collection('transactions')
            .where('reference_id', '==', contributionId)
            .limit(25);
        const auditRef = adminDb.collection('audit_logs').doc();
        const now = new Date();

        await adminDb.runTransaction(async (tx) => {
            const existing = await tx.get(contributionRef);
            if (!existing.exists) {
                throw new Error('NOT_FOUND');
            }

            tx.delete(contributionRef);

            const txSnap = await tx.get(txQuery);
            for (const doc of txSnap.docs) {
                tx.delete(doc.ref);
            }

            tx.create(auditRef, {
                action: 'deleted_contribution',
                performed_by: admin.uid,
                entity_type: 'contribution',
                entity_id: contributionId,
                timestamp: now,
            });
        });

        return NextResponse.json({ ok: true });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unauthorized';
        if (message === 'NOT_FOUND') {
            return NextResponse.json({ error: 'Contribution not found.' }, { status: 404 });
        }
        if (message === 'Forbidden') {
            return NextResponse.json({ error: message }, { status: 403 });
        }
        if (message === 'Missing auth token') {
            return NextResponse.json({ error: message }, { status: 401 });
        }
        return NextResponse.json({ error: 'Failed to delete contribution.' }, { status: 500 });
    }
}
