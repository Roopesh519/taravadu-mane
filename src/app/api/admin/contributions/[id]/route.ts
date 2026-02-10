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

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    try {
        const admin = await requireAdminOrTreasurer(req.headers.get('authorization'));
        const adminDb = getAdminDb();
        const body = await req.json();
        const contributionId = params.id;

        const updateData: Record<string, any> = {};
        if (body.user_id) updateData.user_id = body.user_id;
        if (body.year !== undefined) updateData.year = parseNumber(body.year);
        if (body.amount !== undefined) updateData.amount = parseNumber(body.amount);
        if (body.status) updateData.status = body.status;
        if (body.payment_mode !== undefined) updateData.payment_mode = body.payment_mode || null;

        if (body.paid_on !== undefined) {
            const paidOn = parseDate(body.paid_on);
            updateData.paid_on = paidOn;
        }

        if (updateData.status === 'paid' && !updateData.paid_on) {
            return NextResponse.json({ error: 'Paid contributions must include a paid date.' }, { status: 400 });
        }

        const now = new Date();
        updateData.updated_at = now;

        const contributionRef = adminDb.collection('contributions').doc(contributionId);
        const existing = await contributionRef.get();
        if (!existing.exists) {
            return NextResponse.json({ error: 'Contribution not found.' }, { status: 404 });
        }

        await contributionRef.update(updateData);

        if (updateData.amount !== undefined) {
            const txSnap = await adminDb
                .collection('transactions')
                .where('reference_id', '==', contributionId)
                .limit(1)
                .get();
            if (!txSnap.empty) {
                await txSnap.docs[0].ref.update({
                    amount: updateData.amount,
                    updated_at: now,
                });
            }
        }

        await adminDb.collection('audit_logs').add({
            action: 'updated_contribution',
            performed_by: admin.uid,
            entity_type: 'contribution',
            entity_id: contributionId,
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
        const contributionId = params.id;

        const contributionRef = adminDb.collection('contributions').doc(contributionId);
        const existing = await contributionRef.get();
        if (!existing.exists) {
            return NextResponse.json({ error: 'Contribution not found.' }, { status: 404 });
        }

        await contributionRef.delete();

        const txSnap = await adminDb
            .collection('transactions')
            .where('reference_id', '==', contributionId)
            .get();
        for (const doc of txSnap.docs) {
            await doc.ref.delete();
        }

        await adminDb.collection('audit_logs').add({
            action: 'deleted_contribution',
            performed_by: admin.uid,
            entity_type: 'contribution',
            entity_id: contributionId,
            timestamp: new Date(),
        });

        return NextResponse.json({ ok: true });
    } catch (error: any) {
        const status = error.message === 'Forbidden' ? 403 : 401;
        return NextResponse.json({ error: error.message || 'Unauthorized' }, { status });
    }
}
