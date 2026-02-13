import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';
import { requireAdminOrTreasurer } from '@/lib/firebase/adminAuth';
import { validateExpensePatch } from '@/lib/api/financeValidation';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    try {
        const admin = await requireAdminOrTreasurer(req.headers.get('authorization'));
        const adminDb = getAdminDb();
        const body = await req.json();
        const expenseId = params.id;
        const parsed = validateExpensePatch(body);

        if (!parsed.ok) {
            return NextResponse.json({ error: parsed.error }, { status: 400 });
        }

        const expenseRef = adminDb.collection('expenses').doc(expenseId);
        const txQuery = adminDb
            .collection('transactions')
            .where('reference_id', '==', expenseId)
            .limit(1);
        const auditRef = adminDb.collection('audit_logs').doc();
        const now = new Date();

        await adminDb.runTransaction(async (tx) => {
            const existing = await tx.get(expenseRef);
            if (!existing.exists) {
                throw new Error('NOT_FOUND');
            }

            if (parsed.data.event_id) {
                const eventRef = adminDb.collection('events').doc(parsed.data.event_id);
                const eventSnap = await tx.get(eventRef);
                if (!eventSnap.exists) {
                    throw new Error('INVALID_EVENT');
                }
            }

            tx.update(expenseRef, { ...parsed.data, updated_at: now });

            if (parsed.data.amount !== undefined || parsed.data.category !== undefined) {
                const txSnap = await tx.get(txQuery);
                if (!txSnap.empty) {
                    const txUpdate: Record<string, unknown> = { updated_at: now };
                    if (parsed.data.amount !== undefined) txUpdate.amount = parsed.data.amount;
                    if (parsed.data.category !== undefined) txUpdate.category = parsed.data.category;
                    tx.update(txSnap.docs[0].ref, txUpdate);
                }
            }

            tx.create(auditRef, {
                action: 'updated_expense',
                performed_by: admin.uid,
                entity_type: 'expense',
                entity_id: expenseId,
                timestamp: now,
            });
        });

        return NextResponse.json({ ok: true });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unauthorized';
        if (message === 'NOT_FOUND') {
            return NextResponse.json({ error: 'Expense not found.' }, { status: 404 });
        }
        if (message === 'INVALID_EVENT') {
            return NextResponse.json({ error: 'Selected event was not found.' }, { status: 400 });
        }
        if (message === 'Forbidden') {
            return NextResponse.json({ error: message }, { status: 403 });
        }
        if (message === 'Missing auth token') {
            return NextResponse.json({ error: message }, { status: 401 });
        }
        return NextResponse.json({ error: 'Failed to update expense.' }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        const admin = await requireAdminOrTreasurer(req.headers.get('authorization'));
        const adminDb = getAdminDb();
        const expenseId = params.id;

        const expenseRef = adminDb.collection('expenses').doc(expenseId);
        const txQuery = adminDb
            .collection('transactions')
            .where('reference_id', '==', expenseId)
            .limit(25);
        const auditRef = adminDb.collection('audit_logs').doc();
        const now = new Date();

        await adminDb.runTransaction(async (tx) => {
            const existing = await tx.get(expenseRef);
            if (!existing.exists) {
                throw new Error('NOT_FOUND');
            }

            tx.delete(expenseRef);

            const txSnap = await tx.get(txQuery);
            for (const doc of txSnap.docs) {
                tx.delete(doc.ref);
            }

            tx.create(auditRef, {
                action: 'deleted_expense',
                performed_by: admin.uid,
                entity_type: 'expense',
                entity_id: expenseId,
                timestamp: now,
            });
        });

        return NextResponse.json({ ok: true });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unauthorized';
        if (message === 'NOT_FOUND') {
            return NextResponse.json({ error: 'Expense not found.' }, { status: 404 });
        }
        if (message === 'Forbidden') {
            return NextResponse.json({ error: message }, { status: 403 });
        }
        if (message === 'Missing auth token') {
            return NextResponse.json({ error: message }, { status: 401 });
        }
        return NextResponse.json({ error: 'Failed to delete expense.' }, { status: 500 });
    }
}
