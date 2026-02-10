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

        const title = body.title;
        const category = body.category;
        const amount = parseNumber(body.amount);
        const description = body.description || '';
        const receiptUrl = body.receipt_url || '';
        const expenseDate = parseDate(body.expense_date);

        if (!title || !category || amount === null || !expenseDate) {
            return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
        }

        const now = new Date();
        const expenseRef = await adminDb.collection('expenses').add({
            title,
            category,
            description: description || null,
            amount,
            receipt_url: receiptUrl || null,
            expense_date: expenseDate,
            created_by: admin.uid,
            created_at: now,
            updated_at: now,
        });

        await adminDb.collection('transactions').add({
            type: 'expense',
            category,
            amount,
            reference_id: expenseRef.id,
            created_by: admin.uid,
            created_at: now,
        });

        await adminDb.collection('audit_logs').add({
            action: 'created_expense',
            performed_by: admin.uid,
            entity_type: 'expense',
            entity_id: expenseRef.id,
            timestamp: now,
        });

        return NextResponse.json({ ok: true, id: expenseRef.id });
    } catch (error: any) {
        const status = error.message === 'Forbidden' ? 403 : 401;
        return NextResponse.json({ error: error.message || 'Unauthorized' }, { status });
    }
}
