type ContributionStatus = 'paid' | 'pending';
type ExpenseCategory = 'pooja' | 'electricity' | 'maintenance' | 'renovation' | 'misc';

export interface ContributionPayload {
    user_id: string;
    year: number;
    amount: number;
    status: ContributionStatus;
    payment_mode: string | null;
    paid_on: Date | null;
    event_id: string | null;
}

export interface ExpensePayload {
    title: string;
    category: ExpenseCategory;
    amount: number;
    description: string | null;
    receipt_url: string | null;
    expense_date: Date;
    event_id: string | null;
}

type ValidationResult<T> =
    | { ok: true; data: T }
    | { ok: false; error: string };

function asRecord(value: unknown): Record<string, unknown> | null {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
        return value as Record<string, unknown>;
    }
    return null;
}

function parseRequiredString(value: unknown, field: string): ValidationResult<string> {
    if (typeof value !== 'string') {
        return { ok: false, error: `${field} is required.` };
    }
    const trimmed = value.trim();
    if (!trimmed) {
        return { ok: false, error: `${field} is required.` };
    }
    return { ok: true, data: trimmed };
}

function parseOptionalString(value: unknown): string | null {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    return trimmed || null;
}

function parsePositiveNumber(value: unknown, field: string): ValidationResult<number> {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) {
        return { ok: false, error: `${field} must be a number greater than 0.` };
    }
    return { ok: true, data: parsed };
}

function parseYear(value: unknown): ValidationResult<number> {
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed < 1900 || parsed > 2200) {
        return { ok: false, error: 'year must be a valid year.' };
    }
    return { ok: true, data: parsed };
}

function parseDate(value: unknown, field: string): ValidationResult<Date> {
    if (!value) {
        return { ok: false, error: `${field} is required.` };
    }
    const parsed = new Date(String(value));
    if (Number.isNaN(parsed.getTime())) {
        return { ok: false, error: `${field} must be a valid date.` };
    }
    return { ok: true, data: parsed };
}

function parseOptionalDate(value: unknown, field: string): ValidationResult<Date | null> {
    if (value === undefined || value === null || value === '') {
        return { ok: true, data: null };
    }
    const parsed = new Date(String(value));
    if (Number.isNaN(parsed.getTime())) {
        return { ok: false, error: `${field} must be a valid date.` };
    }
    return { ok: true, data: parsed };
}

function parseContributionStatus(value: unknown): ValidationResult<ContributionStatus> {
    if (value === 'paid' || value === 'pending') {
        return { ok: true, data: value };
    }
    return { ok: false, error: "status must be either 'paid' or 'pending'." };
}

function parseExpenseCategory(value: unknown): ValidationResult<ExpenseCategory> {
    if (
        value === 'pooja' ||
        value === 'electricity' ||
        value === 'maintenance' ||
        value === 'renovation' ||
        value === 'misc'
    ) {
        return { ok: true, data: value };
    }
    return { ok: false, error: 'category is invalid.' };
}

export function validateContributionCreate(body: unknown): ValidationResult<ContributionPayload> {
    const payload = asRecord(body);
    if (!payload) {
        return { ok: false, error: 'Invalid request body.' };
    }

    const userId = parseRequiredString(payload.user_id, 'user_id');
    if (!userId.ok) return userId;

    const year = parseYear(payload.year);
    if (!year.ok) return year;

    const amount = parsePositiveNumber(payload.amount, 'amount');
    if (!amount.ok) return amount;

    const status = parseContributionStatus(payload.status);
    if (!status.ok) return status;

    const paidOn = parseOptionalDate(payload.paid_on, 'paid_on');
    if (!paidOn.ok) return paidOn;

    if (status.data === 'paid' && !paidOn.data) {
        return { ok: false, error: 'Paid contributions must include a paid date.' };
    }

    return {
        ok: true,
        data: {
            user_id: userId.data,
            year: year.data,
            amount: amount.data,
            status: status.data,
            payment_mode: parseOptionalString(payload.payment_mode),
            paid_on: paidOn.data,
            event_id: parseOptionalString(payload.event_id),
        },
    };
}

export function validateContributionPatch(body: unknown): ValidationResult<Partial<ContributionPayload>> {
    const payload = asRecord(body);
    if (!payload) {
        return { ok: false, error: 'Invalid request body.' };
    }

    const update: Partial<ContributionPayload> = {};

    if (payload.user_id !== undefined) {
        const userId = parseRequiredString(payload.user_id, 'user_id');
        if (!userId.ok) return userId;
        update.user_id = userId.data;
    }

    if (payload.year !== undefined) {
        const year = parseYear(payload.year);
        if (!year.ok) return year;
        update.year = year.data;
    }

    if (payload.amount !== undefined) {
        const amount = parsePositiveNumber(payload.amount, 'amount');
        if (!amount.ok) return amount;
        update.amount = amount.data;
    }

    if (payload.status !== undefined) {
        const status = parseContributionStatus(payload.status);
        if (!status.ok) return status;
        update.status = status.data;
    }

    if (payload.paid_on !== undefined) {
        const paidOn = parseOptionalDate(payload.paid_on, 'paid_on');
        if (!paidOn.ok) return paidOn;
        update.paid_on = paidOn.data;
    }

    if (payload.payment_mode !== undefined) {
        update.payment_mode = parseOptionalString(payload.payment_mode);
    }

    if (payload.event_id !== undefined) {
        update.event_id = parseOptionalString(payload.event_id);
    }

    if (Object.keys(update).length === 0) {
        return { ok: false, error: 'At least one field is required for update.' };
    }

    return { ok: true, data: update };
}

export function validateExpenseCreate(body: unknown): ValidationResult<ExpensePayload> {
    const payload = asRecord(body);
    if (!payload) {
        return { ok: false, error: 'Invalid request body.' };
    }

    const title = parseRequiredString(payload.title, 'title');
    if (!title.ok) return title;

    const category = parseExpenseCategory(payload.category);
    if (!category.ok) return category;

    const amount = parsePositiveNumber(payload.amount, 'amount');
    if (!amount.ok) return amount;

    const expenseDate = parseDate(payload.expense_date, 'expense_date');
    if (!expenseDate.ok) return expenseDate;

    return {
        ok: true,
        data: {
            title: title.data,
            category: category.data,
            amount: amount.data,
            description: parseOptionalString(payload.description),
            receipt_url: parseOptionalString(payload.receipt_url),
            expense_date: expenseDate.data,
            event_id: parseOptionalString(payload.event_id),
        },
    };
}

export function validateExpensePatch(body: unknown): ValidationResult<Partial<ExpensePayload>> {
    const payload = asRecord(body);
    if (!payload) {
        return { ok: false, error: 'Invalid request body.' };
    }

    const update: Partial<ExpensePayload> = {};

    if (payload.title !== undefined) {
        const title = parseRequiredString(payload.title, 'title');
        if (!title.ok) return title;
        update.title = title.data;
    }

    if (payload.category !== undefined) {
        const category = parseExpenseCategory(payload.category);
        if (!category.ok) return category;
        update.category = category.data;
    }

    if (payload.amount !== undefined) {
        const amount = parsePositiveNumber(payload.amount, 'amount');
        if (!amount.ok) return amount;
        update.amount = amount.data;
    }

    if (payload.expense_date !== undefined) {
        const expenseDate = parseDate(payload.expense_date, 'expense_date');
        if (!expenseDate.ok) return expenseDate;
        update.expense_date = expenseDate.data;
    }

    if (payload.description !== undefined) {
        update.description = parseOptionalString(payload.description);
    }

    if (payload.receipt_url !== undefined) {
        update.receipt_url = parseOptionalString(payload.receipt_url);
    }

    if (payload.event_id !== undefined) {
        update.event_id = parseOptionalString(payload.event_id);
    }

    if (Object.keys(update).length === 0) {
        return { ok: false, error: 'At least one field is required for update.' };
    }

    return { ok: true, data: update };
}
