'use client';

import { useEffect, useState } from 'react';
import MembersNav from '@/components/protected/MembersNav';
import RoleGuard from '@/components/auth/RoleGuard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/components/auth/AuthProvider';
import { auth } from '@/lib/firebase/config';
import { getDocuments } from '@/lib/firebase/db';
import { Expense } from '@/lib/types';
import { orderBy } from 'firebase/firestore';

function parseDate(value: any): Date | null {
    if (!value) return null;
    if (value instanceof Date) return value;
    if (value.seconds) return new Date(value.seconds * 1000);
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value: any) {
    const date = parseDate(value);
    return date ? date.toLocaleDateString() : '-';
}

function toDateInputValue(date: Date) {
    const pad = (num: number) => num.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

const expenseCategories = ['pooja', 'electricity', 'maintenance', 'renovation', 'misc'];

export default function ExpensesPage() {
    const { hasAnyRole } = useAuth();
    const isFinanceAdmin = hasAnyRole(['admin', 'treasurer']);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState({
        title: '',
        category: expenseCategories[0],
        description: '',
        amount: '',
        expense_date: '',
        receipt_url: '',
    });
    const [editForm, setEditForm] = useState({
        title: '',
        category: expenseCategories[0],
        description: '',
        amount: '',
        expense_date: '',
        receipt_url: '',
    });

    const fetchExpenses = async () => {
        setLoading(true);
        setError('');
        const data = await getDocuments<Expense>('expenses', [orderBy('expense_date', 'desc')]);
        setExpenses(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchExpenses();
    }, []);

    const handleCreate = async () => {
        if (!form.title.trim() || !form.amount || !form.expense_date) {
            setError('Please provide a title, amount, and expense date.');
            return;
        }
        const payload = {
            title: form.title.trim(),
            category: form.category,
            description: form.description || null,
            amount: Number(form.amount),
            expense_date: form.expense_date,
            receipt_url: form.receipt_url || null,
        };
        setActionLoading(true);
        setError('');
        try {
            const token = await auth.currentUser?.getIdToken();
            const res = await fetch('/api/admin/expenses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Failed to create expense.');
            }
            setForm({
                title: '',
                category: expenseCategories[0],
                description: '',
                amount: '',
                expense_date: '',
                receipt_url: '',
            });
            await fetchExpenses();
        } catch (err: any) {
            setError(err.message || 'Failed to create expense.');
        } finally {
            setActionLoading(false);
        }
    };

    const startEdit = (expense: Expense) => {
        const expenseDate = parseDate(expense.expense_date);
        setEditingId(expense.id);
        setEditForm({
            title: expense.title,
            category: expense.category,
            description: expense.description || '',
            amount: expense.amount.toString(),
            expense_date: expenseDate ? toDateInputValue(expenseDate) : '',
            receipt_url: expense.receipt_url || '',
        });
    };

    const handleUpdate = async (id: string) => {
        if (!editForm.title.trim() || !editForm.amount || !editForm.expense_date) {
            setError('Please provide a title, amount, and expense date.');
            return;
        }
        const payload = {
            title: editForm.title.trim(),
            category: editForm.category,
            description: editForm.description || null,
            amount: Number(editForm.amount),
            expense_date: editForm.expense_date,
            receipt_url: editForm.receipt_url || null,
        };
        setActionLoading(true);
        setError('');
        try {
            const token = await auth.currentUser?.getIdToken();
            const res = await fetch(`/api/admin/expenses/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Failed to update expense.');
            }
            setEditingId(null);
            await fetchExpenses();
        } catch (err: any) {
            setError(err.message || 'Failed to update expense.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        setActionLoading(true);
        setError('');
        try {
            const token = await auth.currentUser?.getIdToken();
            const res = await fetch(`/api/admin/expenses/${id}`, {
                method: 'DELETE',
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Failed to delete expense.');
            }
            await fetchExpenses();
        } catch (err: any) {
            setError(err.message || 'Failed to delete expense.');
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <>
            <MembersNav />
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-start justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-4xl font-bold mb-2">Expenses</h1>
                        <p className="text-muted-foreground">
                            Transparent tracking of Taravadu Mane expenses
                        </p>
                    </div>
                    <Button variant="outline" onClick={fetchExpenses} disabled={loading}>
                        Refresh
                    </Button>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                        <p className="text-sm text-destructive">{error}</p>
                    </div>
                )}

                <RoleGuard allowedRoles={['admin', 'treasurer']} fallback={null}>
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>Record Expense</CardTitle>
                            <CardDescription>Log temple and maintenance expenses.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="expense-title">Title</Label>
                                <Input
                                    id="expense-title"
                                    value={form.title}
                                    onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="expense-category">Category</Label>
                                <select
                                    id="expense-category"
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={form.category}
                                    onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                                >
                                    {expenseCategories.map((category) => (
                                        <option key={category} value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="expense-amount">Amount</Label>
                                <Input
                                    id="expense-amount"
                                    type="number"
                                    value={form.amount}
                                    onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="expense-date">Expense Date</Label>
                                <Input
                                    id="expense-date"
                                    type="date"
                                    value={form.expense_date}
                                    onChange={(e) => setForm((prev) => ({ ...prev, expense_date: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="expense-description">Description</Label>
                                <textarea
                                    id="expense-description"
                                    value={form.description}
                                    onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                                    className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="expense-receipt">Receipt URL</Label>
                                <Input
                                    id="expense-receipt"
                                    value={form.receipt_url}
                                    onChange={(e) => setForm((prev) => ({ ...prev, receipt_url: e.target.value }))}
                                    placeholder="Optional link to receipt"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <Button onClick={handleCreate} disabled={actionLoading}>
                                    Save Expense
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </RoleGuard>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                    </div>
                ) : expenses.length === 0 ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>No Expenses Yet</CardTitle>
                            <CardDescription>Expenses will appear once recorded by admins.</CardDescription>
                        </CardHeader>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {expenses.map((expense) => (
                            <Card key={expense.id}>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg">{expense.title}</CardTitle>
                                    <CardDescription>{formatDate(expense.expense_date)}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {editingId === expense.id ? (
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor={`edit-title-${expense.id}`}>Title</Label>
                                                <Input
                                                    id={`edit-title-${expense.id}`}
                                                    value={editForm.title}
                                                    onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor={`edit-category-${expense.id}`}>Category</Label>
                                                <select
                                                    id={`edit-category-${expense.id}`}
                                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                    value={editForm.category}
                                                    onChange={(e) => setEditForm((prev) => ({ ...prev, category: e.target.value }))}
                                                >
                                                    {expenseCategories.map((category) => (
                                                        <option key={category} value={category}>
                                                            {category}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor={`edit-amount-${expense.id}`}>Amount</Label>
                                                <Input
                                                    id={`edit-amount-${expense.id}`}
                                                    type="number"
                                                    value={editForm.amount}
                                                    onChange={(e) => setEditForm((prev) => ({ ...prev, amount: e.target.value }))}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor={`edit-date-${expense.id}`}>Expense Date</Label>
                                                <Input
                                                    id={`edit-date-${expense.id}`}
                                                    type="date"
                                                    value={editForm.expense_date}
                                                    onChange={(e) => setEditForm((prev) => ({ ...prev, expense_date: e.target.value }))}
                                                />
                                            </div>
                                            <div className="space-y-2 md:col-span-2">
                                                <Label htmlFor={`edit-description-${expense.id}`}>Description</Label>
                                                <textarea
                                                    id={`edit-description-${expense.id}`}
                                                    value={editForm.description}
                                                    onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                                                    className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                />
                                            </div>
                                            <div className="space-y-2 md:col-span-2">
                                                <Label htmlFor={`edit-receipt-${expense.id}`}>Receipt URL</Label>
                                                <Input
                                                    id={`edit-receipt-${expense.id}`}
                                                    value={editForm.receipt_url}
                                                    onChange={(e) => setEditForm((prev) => ({ ...prev, receipt_url: e.target.value }))}
                                                />
                                            </div>
                                            <div className="md:col-span-2 flex gap-2">
                                                <Button onClick={() => handleUpdate(expense.id)} disabled={actionLoading}>
                                                    Save
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    onClick={() => setEditingId(null)}
                                                    disabled={actionLoading}
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <Badge variant="secondary">{expense.category}</Badge>
                                                <span className="text-sm text-muted-foreground">
                                                    Amount: ₹{expense.amount}
                                                </span>
                                            </div>
                                            {expense.description && (
                                                <p className="text-sm text-muted-foreground whitespace-pre-line">
                                                    {expense.description}
                                                </p>
                                            )}
                                            {expense.receipt_url && (
                                                <a
                                                    className="text-sm text-primary underline"
                                                    href={expense.receipt_url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    View Receipt
                                                </a>
                                            )}
                                            {isFinanceAdmin && (
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => startEdit(expense)}
                                                        disabled={actionLoading}
                                                    >
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        onClick={() => handleDelete(expense.id)}
                                                        disabled={actionLoading}
                                                    >
                                                        Delete
                                                    </Button>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
