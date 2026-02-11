'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { Contribution, User } from '@/lib/types';
import { orderBy, where } from 'firebase/firestore';

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

export default function ContributionsPage() {
    const { user, hasAnyRole } = useAuth();
    const isFinanceAdmin = hasAnyRole(['admin', 'treasurer']);
    const [contributions, setContributions] = useState<Contribution[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const currentYear = new Date().getFullYear();
    const [form, setForm] = useState({
        user_id: '',
        year: currentYear.toString(),
        amount: '',
        status: 'pending',
        paid_on: '',
        payment_mode: '',
    });
    const [editForm, setEditForm] = useState({
        user_id: '',
        year: '',
        amount: '',
        status: 'pending',
        paid_on: '',
        payment_mode: '',
    });

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError('');
        const constraints = [];
        if (!isFinanceAdmin && !user?.id) {
            setLoading(false);
            return;
        }
        if (!isFinanceAdmin && user?.id) {
            constraints.push(where('user_id', '==', user.id));
        }
        constraints.push(orderBy('year', 'desc'));
        const data = await getDocuments<Contribution>('contributions', constraints);
        setContributions(data);
        if (isFinanceAdmin) {
            const people = await getDocuments<User>('users', [orderBy('name', 'asc')]);
            setUsers(people);
            if (people.length > 0) {
                setForm((prev) => (prev.user_id ? prev : { ...prev, user_id: people[0].id }));
            }
        }
        setLoading(false);
    }, [currentYear, isFinanceAdmin, user?.id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const userMap = useMemo(() => {
        const map = new Map<string, User>();
        users.forEach((u) => map.set(u.id, u));
        return map;
    }, [users]);

    const handleCreate = async () => {
        if (!form.user_id || !form.year || !form.amount) {
            setError('Please fill out user, year, and amount.');
            return;
        }
        const payload = {
            user_id: form.user_id,
            year: Number(form.year),
            amount: Number(form.amount),
            status: form.status,
            paid_on: form.paid_on || null,
            payment_mode: form.payment_mode || null,
        };
        setActionLoading(true);
        setError('');
        try {
            const token = await auth.currentUser?.getIdToken();
            const res = await fetch('/api/admin/contributions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Failed to create contribution.');
            }
            setForm({
                user_id: form.user_id,
                year: currentYear.toString(),
                amount: '',
                status: 'pending',
                paid_on: '',
                payment_mode: '',
            });
            setIsCreateModalOpen(false);
            await fetchData();
        } catch (err: any) {
            setError(err.message || 'Failed to create contribution.');
        } finally {
            setActionLoading(false);
        }
    };

    const startEdit = (contribution: Contribution) => {
        const paidOn = parseDate(contribution.paid_on);
        setEditingId(contribution.id);
        setEditForm({
            user_id: contribution.user_id,
            year: contribution.year.toString(),
            amount: contribution.amount.toString(),
            status: contribution.status,
            paid_on: paidOn ? toDateInputValue(paidOn) : '',
            payment_mode: contribution.payment_mode || '',
        });
    };

    const handleUpdate = async (id: string) => {
        if (!editForm.user_id || !editForm.year || !editForm.amount) {
            setError('Please fill out user, year, and amount.');
            return;
        }
        const payload = {
            user_id: editForm.user_id,
            year: Number(editForm.year),
            amount: Number(editForm.amount),
            status: editForm.status,
            paid_on: editForm.paid_on || null,
            payment_mode: editForm.payment_mode || null,
        };
        setActionLoading(true);
        setError('');
        try {
            const token = await auth.currentUser?.getIdToken();
            const res = await fetch(`/api/admin/contributions/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Failed to update contribution.');
            }
            setEditingId(null);
            await fetchData();
        } catch (err: any) {
            setError(err.message || 'Failed to update contribution.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        setActionLoading(true);
        setError('');
        try {
            const token = await auth.currentUser?.getIdToken();
            const res = await fetch(`/api/admin/contributions/${id}`, {
                method: 'DELETE',
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Failed to delete contribution.');
            }
            await fetchData();
        } catch (err: any) {
            setError(err.message || 'Failed to delete contribution.');
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <>
            <MembersNav />
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-4xl font-bold mb-2">Contributions</h1>
                        <p className="text-muted-foreground">
                            Track yearly contributions for Taravadu Mane maintenance
                        </p>
                    </div>
                    <div className="flex w-full sm:w-auto items-center gap-2">
                        <Button className="w-full sm:w-auto" variant="outline" onClick={fetchData} disabled={loading}>
                            Refresh
                        </Button>
                    </div>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                        <p className="text-sm text-destructive">{error}</p>
                    </div>
                )}
                <RoleGuard allowedRoles={['admin', 'treasurer']} fallback={null}>
                    <div className="mb-6">
                        <Button
                            className="w-full sm:w-auto"
                            onClick={() => {
                                setError('');
                                setIsCreateModalOpen(true);
                            }}
                        >
                            Record Contribution
                        </Button>
                    </div>
                </RoleGuard>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                    </div>
                ) : contributions.length === 0 ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>No Contributions Yet</CardTitle>
                            <CardDescription>Contributions will appear once recorded by admins.</CardDescription>
                        </CardHeader>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {contributions.map((contribution) => {
                            const member = userMap.get(contribution.user_id);
                            return (
                                <Card key={contribution.id}>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-lg">
                                            {member?.name || contribution.user_id}
                                        </CardTitle>
                                        <CardDescription>
                                            Year {contribution.year} • {formatDate(contribution.paid_on)}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {editingId === contribution.id ? (
                                            <div className="grid md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor={`edit-user-${contribution.id}`}>Member</Label>
                                                    <select
                                                        id={`edit-user-${contribution.id}`}
                                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                        value={editForm.user_id}
                                                        onChange={(e) => setEditForm((prev) => ({ ...prev, user_id: e.target.value }))}
                                                    >
                                                        {users.map((person) => (
                                                            <option key={person.id} value={person.id}>
                                                                {person.name} ({person.email})
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor={`edit-year-${contribution.id}`}>Year</Label>
                                                    <Input
                                                        id={`edit-year-${contribution.id}`}
                                                        type="number"
                                                        value={editForm.year}
                                                        onChange={(e) => setEditForm((prev) => ({ ...prev, year: e.target.value }))}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor={`edit-amount-${contribution.id}`}>Amount</Label>
                                                    <Input
                                                        id={`edit-amount-${contribution.id}`}
                                                        type="number"
                                                        value={editForm.amount}
                                                        onChange={(e) => setEditForm((prev) => ({ ...prev, amount: e.target.value }))}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor={`edit-status-${contribution.id}`}>Status</Label>
                                                    <select
                                                        id={`edit-status-${contribution.id}`}
                                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                        value={editForm.status}
                                                        onChange={(e) => setEditForm((prev) => ({ ...prev, status: e.target.value }))}
                                                    >
                                                        <option value="pending">Pending</option>
                                                        <option value="paid">Paid</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor={`edit-paid-${contribution.id}`}>Paid On</Label>
                                                    <Input
                                                        id={`edit-paid-${contribution.id}`}
                                                        type="date"
                                                        value={editForm.paid_on}
                                                        onChange={(e) => setEditForm((prev) => ({ ...prev, paid_on: e.target.value }))}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor={`edit-mode-${contribution.id}`}>Payment Mode</Label>
                                                    <Input
                                                        id={`edit-mode-${contribution.id}`}
                                                        value={editForm.payment_mode}
                                                        onChange={(e) => setEditForm((prev) => ({ ...prev, payment_mode: e.target.value }))}
                                                    />
                                                </div>
                                                <div className="md:col-span-2 flex gap-2">
                                                    <Button onClick={() => handleUpdate(contribution.id)} disabled={actionLoading}>
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
                                                    <Badge variant={contribution.status === 'paid' ? 'secondary' : 'warning'}>
                                                        {contribution.status}
                                                    </Badge>
                                                    <span className="text-sm text-muted-foreground">
                                                        Amount: ₹{contribution.amount}
                                                    </span>
                                                    {contribution.payment_mode && (
                                                        <span className="text-sm text-muted-foreground">
                                                            Mode: {contribution.payment_mode}
                                                        </span>
                                                    )}
                                                </div>
                                                {isFinanceAdmin && (
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="outline"
                                                            onClick={() => startEdit(contribution)}
                                                            disabled={actionLoading}
                                                        >
                                                            Edit
                                                        </Button>
                                                        <Button
                                                            variant="destructive"
                                                            onClick={() => handleDelete(contribution.id)}
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
                            );
                        })}
                    </div>
                )}
            </div>
            <RoleGuard allowedRoles={['admin', 'treasurer']} fallback={null}>
                {isCreateModalOpen && (
                    <div
                        className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/50 p-3 sm:p-4"
                        onClick={() => {
                            if (!actionLoading) setIsCreateModalOpen(false);
                        }}
                    >
                        <Card
                            className="w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto mt-4 sm:mt-0"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <CardHeader>
                                <CardTitle>Record Contribution</CardTitle>
                                <CardDescription>Log payments and yearly contributions.</CardDescription>
                            </CardHeader>
                            <CardContent className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="contribution-user">Member</Label>
                                    <select
                                        id="contribution-user"
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={form.user_id}
                                        onChange={(e) => setForm((prev) => ({ ...prev, user_id: e.target.value }))}
                                    >
                                        {users.map((person) => (
                                            <option key={person.id} value={person.id}>
                                                {person.name} ({person.email})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="contribution-year">Year</Label>
                                    <Input
                                        id="contribution-year"
                                        type="number"
                                        value={form.year}
                                        onChange={(e) => setForm((prev) => ({ ...prev, year: e.target.value }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="contribution-amount">Amount</Label>
                                    <Input
                                        id="contribution-amount"
                                        type="number"
                                        value={form.amount}
                                        onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="contribution-status">Status</Label>
                                    <select
                                        id="contribution-status"
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={form.status}
                                        onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="paid">Paid</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="contribution-paid-on">Paid On</Label>
                                    <Input
                                        id="contribution-paid-on"
                                        type="date"
                                        value={form.paid_on}
                                        onChange={(e) => setForm((prev) => ({ ...prev, paid_on: e.target.value }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="contribution-payment-mode">Payment Mode</Label>
                                    <Input
                                        id="contribution-payment-mode"
                                        value={form.payment_mode}
                                        onChange={(e) => setForm((prev) => ({ ...prev, payment_mode: e.target.value }))}
                                        placeholder="UPI, Cash, Bank Transfer..."
                                    />
                                </div>
                                <div className="md:col-span-2 flex flex-col-reverse sm:flex-row justify-end gap-2">
                                    <Button
                                        className="w-full sm:w-auto"
                                        variant="outline"
                                        onClick={() => setIsCreateModalOpen(false)}
                                        disabled={actionLoading}
                                    >
                                        Cancel
                                    </Button>
                                    <Button className="w-full sm:w-auto" onClick={handleCreate} disabled={actionLoading}>
                                        Save Contribution
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </RoleGuard>
        </>
    );
}
