'use client';

import { useEffect, useMemo, useState } from 'react';
import MembersNav from '@/components/protected/MembersNav';
import RoleGuard from '@/components/auth/RoleGuard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { auth } from '@/lib/firebase/config';

interface AccessRequestRow {
    id: string;
    name: string;
    email: string;
    status: 'pending' | 'approved' | 'denied';
    created_at?: any;
    updated_at?: any;
    approved_at?: any;
    denied_at?: any;
}

function formatTimestamp(value: any) {
    if (!value) return '-';
    if (value instanceof Date) return value.toLocaleString();
    if (typeof value === 'string') return new Date(value).toLocaleString();
    if (value.seconds) return new Date(value.seconds * 1000).toLocaleString();
    return '-';
}

export default function AccessRequestsPage() {
    const [requests, setRequests] = useState<AccessRequestRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [lastTempPassword, setLastTempPassword] = useState<string | null>(null);
    const [lastEmail, setLastEmail] = useState<string | null>(null);
    const [lastName, setLastName] = useState<string | null>(null);
    const [loginUrl, setLoginUrl] = useState<string>('/login');

    const mailtoLink = useMemo(() => {
        if (!lastEmail || !lastTempPassword) return '';
        const subject = encodeURIComponent('Taravadu Mane Portal Access Approved');
        const body = encodeURIComponent(
            `Namaskara ${lastName || ''},\n\n` +
            `Your Taravadu Mane portal access has been approved.\n\n` +
            `Login URL: ${loginUrl}\n` +
            `Temporary Password: ${lastTempPassword}\n\n` +
            `Please log in and change your password immediately.\n\n` +
            `Regards,\nTaravadu Mane Admin`
        );
        return `mailto:${lastEmail}?subject=${subject}&body=${body}`;
    }, [lastEmail, lastName, lastTempPassword, loginUrl]);

    const fetchRequests = async () => {
        setLoading(true);
        setError('');

        try {
            const token = await auth.currentUser?.getIdToken();
            const res = await fetch('/api/admin/access-requests', {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Failed to load requests.');
            }
            setRequests(data.data || []);
        } catch (err: any) {
            setError(err.message || 'Failed to load requests.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleApprove = async (id: string) => {
        setActionLoading(id);
        setError('');
        try {
            const token = await auth.currentUser?.getIdToken();
            const res = await fetch(`/api/admin/access-requests/${id}/approve`, {
                method: 'PATCH',
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Failed to approve request.');
            }
            setLastTempPassword(data.tempPassword);
            setLoginUrl(data.loginUrl || '/login');
            const request = requests.find((r) => r.id === id);
            setLastEmail(request?.email || null);
            setLastName(request?.name || null);
            await fetchRequests();
        } catch (err: any) {
            setError(err.message || 'Failed to approve request.');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDeny = async (id: string) => {
        setActionLoading(id);
        setError('');
        try {
            const token = await auth.currentUser?.getIdToken();
            const res = await fetch(`/api/admin/access-requests/${id}/deny`, {
                method: 'PATCH',
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Failed to deny request.');
            }
            await fetchRequests();
        } catch (err: any) {
            setError(err.message || 'Failed to deny request.');
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <>
            <MembersNav />
            <div className="container mx-auto px-4 py-8">
                <RoleGuard allowedRoles={['admin']}>
                    <div className="max-w-5xl mx-auto">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h1 className="text-3xl font-bold">Access Requests</h1>
                                <p className="text-muted-foreground">
                                    Review and approve new member access requests.
                                </p>
                            </div>
                            <Button variant="outline" onClick={fetchRequests} disabled={loading}>
                                Refresh
                            </Button>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                                <p className="text-sm text-destructive">{error}</p>
                            </div>
                        )}

                        {lastTempPassword && mailtoLink && (
                            <Card className="mb-6 border-primary/30">
                                <CardHeader>
                                    <CardTitle>Email Template Ready</CardTitle>
                                    <CardDescription>
                                        Open your email client with a pre-filled message for the approved member.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="text-sm text-muted-foreground">
                                        Temporary password generated. Use the button below to open your default email client.
                                    </div>
                                    <a href={mailtoLink}>
                                        <Button>Open Email Template</Button>
                                    </a>
                                </CardContent>
                            </Card>
                        )}

                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                            </div>
                        ) : requests.length === 0 ? (
                            <Card>
                                <CardHeader>
                                    <CardTitle>No Requests</CardTitle>
                                    <CardDescription>There are no pending requests at the moment.</CardDescription>
                                </CardHeader>
                            </Card>
                        ) : (
                            <div className="space-y-4">
                                {requests.map((request) => (
                                    <Card key={request.id}>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-lg">{request.name}</CardTitle>
                                            <CardDescription>{request.email}</CardDescription>
                                        </CardHeader>
                                        <CardContent className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                            <div className="text-sm text-muted-foreground">
                                                <div>Status: <span className="font-medium text-foreground">{request.status}</span></div>
                                                <div>Requested: {formatTimestamp(request.created_at)}</div>
                                                {request.approved_at && <div>Approved: {formatTimestamp(request.approved_at)}</div>}
                                                {request.denied_at && <div>Denied: {formatTimestamp(request.denied_at)}</div>}
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    onClick={() => handleApprove(request.id)}
                                                    disabled={actionLoading === request.id || request.status !== 'pending'}
                                                >
                                                    Approve
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    onClick={() => handleDeny(request.id)}
                                                    disabled={actionLoading === request.id || request.status !== 'pending'}
                                                >
                                                    Deny
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </RoleGuard>
            </div>
        </>
    );
}
