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

function parseOptionalString(value: any): string | null {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    try {
        const admin = await requireAdminOrTreasurer(req.headers.get('authorization'));
        const adminDb = getAdminDb();
        const body = await req.json();
        const expenseId = params.id;

        const updateData: Record<string, any> = {};
        if (body.title !== undefined) updateData.title = body.title;
        if (body.category !== undefined) updateData.category = body.category;
        if (body.amount !== undefined) updateData.amount = parseNumber(body.amount);
        if (body.description !== undefined) updateData.description = body.description || null;
        if (body.receipt_url !== undefined) updateData.receipt_url = body.receipt_url || null;
        if (body.expense_date !== undefined) updateData.expense_date = parseDate(body.expense_date);
        if (body.event_id !== undefined) updateData.event_id = parseOptionalString(body.event_id);

        const now = new Date();
        updateData.updated_at = now;

        const expenseRef = adminDb.collection('expenses').doc(expenseId);
        const existing = await expenseRef.get();
        if (!existing.exists) {
            return NextResponse.json({ error: 'Expense not found.' }, { status: 404 });
        }

        if (updateData.event_id) {
            const eventRef = adminDb.collection('events').doc(updateData.event_id);
            const eventSnap = await eventRef.get();
            if (!eventSnap.exists) {
                return NextResponse.json({ error: 'Selected event was not found.' }, { status: 400 });
            }
        }

        await expenseRef.update(updateData);

        const txSnap = await adminDb
            .collection('transactions')
            .where('reference_id', '==', expenseId)
            .limit(1)
            .get();
        if (!txSnap.empty) {
            const txUpdate: Record<string, any> = { updated_at: now };
            if (updateData.amount !== undefined) txUpdate.amount = updateData.amount;
            if (updateData.category) txUpdate.category = updateData.category;
            await txSnap.docs[0].ref.update(txUpdate);
        }

        await adminDb.collection('audit_logs').add({
            action: 'updated_expense',
            performed_by: admin.uid,
            entity_type: 'expense',
            entity_id: expenseId,
            timestamp: now,
        });

        return NextResponse.json({ ok: true });
    } catch (error: any) {
        const status = error.message === 'Forbidden' ? 403 : 401;
        return NextResponse.json({ error: error.message || 'Unauthorized' }, { status });
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        const admin = await requireAdminOrTreasurer(req.headers.get('authorization'));
        const adminDb = getAdminDb();
        const expenseId = params.id;

        const expenseRef = adminDb.collection('expenses').doc(expenseId);
        const existing = await expenseRef.get();
        if (!existing.exists) {
            return NextResponse.json({ error: 'Expense not found.' }, { status: 404 });
        }

        await expenseRef.delete();

        const txSnap = await adminDb
            .collection('transactions')
            .where('reference_id', '==', expenseId)
            .get();
        for (const doc of txSnap.docs) {
            await doc.ref.delete();
        }

        await adminDb.collection('audit_logs').add({
            action: 'deleted_expense',
            performed_by: admin.uid,
            entity_type: 'expense',
            entity_id: expenseId,
            timestamp: new Date(),
        });

        return NextResponse.json({ ok: true });
    } catch (error: any) {
        const status = error.message === 'Forbidden' ? 403 : 401;
        return NextResponse.json({ error: error.message || 'Unauthorized' }, { status });
    }
}
