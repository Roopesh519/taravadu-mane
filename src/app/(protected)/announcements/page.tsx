'use client';

import { useEffect, useState } from 'react';
import MembersNav from '@/components/protected/MembersNav';
import RoleGuard from '@/components/auth/RoleGuard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/components/auth/AuthProvider';
import { addDocument, deleteDocument, getDocuments, updateDocument } from '@/lib/firebase/db';
import { Announcement } from '@/lib/types';
import { orderBy } from 'firebase/firestore';

function formatDate(value: any) {
    if (!value) return '-';
    if (value instanceof Date) return value.toLocaleString();
    if (value.seconds) return new Date(value.seconds * 1000).toLocaleString();
    return '-';
}

export default function AnnouncementsPage() {
    const { user, hasRole } = useAuth();
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [form, setForm] = useState({ title: '', content: '' });
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({ title: '', content: '' });

    const fetchAnnouncements = async () => {
        setLoading(true);
        setError('');
        const data = await getDocuments<Announcement>('announcements', [
            orderBy('created_at', 'desc'),
        ]);
        setAnnouncements(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const handleCreate = async () => {
        if (!form.title.trim() || !form.content.trim()) {
            setError('Please provide both a title and content.');
            return;
        }
        if (!user?.id) {
            setError('You must be signed in to create announcements.');
            return;
        }
        setActionLoading(true);
        setError('');
        const id = await addDocument<Announcement>('announcements', {
            title: form.title.trim(),
            content: form.content.trim(),
            created_by: user.id,
        });
        if (!id) {
            setError('Failed to create announcement.');
        } else {
            setForm({ title: '', content: '' });
            setIsCreateModalOpen(false);
            await fetchAnnouncements();
        }
        setActionLoading(false);
    };

    const startEdit = (announcement: Announcement) => {
        setEditingId(announcement.id);
        setEditForm({ title: announcement.title, content: announcement.content });
    };

    const handleUpdate = async (id: string) => {
        if (!editForm.title.trim() || !editForm.content.trim()) {
            setError('Please provide both a title and content.');
            return;
        }
        setActionLoading(true);
        setError('');
        const ok = await updateDocument('announcements', id, {
            title: editForm.title.trim(),
            content: editForm.content.trim(),
            updated_at: new Date(),
        });
        if (!ok) {
            setError('Failed to update announcement.');
        } else {
            setEditingId(null);
            await fetchAnnouncements();
        }
        setActionLoading(false);
    };

    const handleDelete = async (id: string) => {
        setActionLoading(true);
        setError('');
        const ok = await deleteDocument('announcements', id);
        if (!ok) {
            setError('Failed to delete announcement.');
        } else {
            await fetchAnnouncements();
        }
        setActionLoading(false);
    };

    return (
        <>
            <MembersNav />
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-4xl font-bold mb-2">Announcements</h1>
                        <p className="text-muted-foreground">
                            Stay updated with family news and important notices
                        </p>
                    </div>
                    <div className="flex w-full sm:w-auto items-center gap-2">
                        <Button className="w-full sm:w-auto" variant="outline" onClick={fetchAnnouncements} disabled={loading}>
                            Refresh
                        </Button>
                    </div>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                        <p className="text-sm text-destructive">{error}</p>
                    </div>
                )}
                <RoleGuard allowedRoles={['admin']} fallback={null}>
                    <div className="mb-6">
                        <Button
                            className="w-full sm:w-auto"
                            onClick={() => {
                                setError('');
                                setIsCreateModalOpen(true);
                            }}
                        >
                            Create Announcement
                        </Button>
                    </div>
                </RoleGuard>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                    </div>
                ) : announcements.length === 0 ? (
                    <div className="bg-muted/40 border-2 border-dashed rounded-lg p-12 text-center">
                        <div className="max-w-md mx-auto">
                            <svg className="mx-auto h-12 w-12 text-muted-foreground mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                            </svg>
                            <h3 className="text-lg font-semibold mb-2">No Announcements Yet</h3>
                            <p className="text-sm text-muted-foreground">
                                Announcements from admins will appear here. Check back later!
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {announcements.map((announcement) => (
                            <Card key={announcement.id}>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-xl">{announcement.title}</CardTitle>
                                    <CardDescription>Published {formatDate(announcement.created_at)}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {editingId === announcement.id ? (
                                        <>
                                            <div className="space-y-2">
                                                <Label htmlFor={`edit-title-${announcement.id}`}>Title</Label>
                                                <Input
                                                    id={`edit-title-${announcement.id}`}
                                                    value={editForm.title}
                                                    onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor={`edit-content-${announcement.id}`}>Content</Label>
                                                <textarea
                                                    id={`edit-content-${announcement.id}`}
                                                    value={editForm.content}
                                                    onChange={(e) => setEditForm((prev) => ({ ...prev, content: e.target.value }))}
                                                    className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                />
                                            </div>
                                            <div className="flex gap-2">
                                                <Button onClick={() => handleUpdate(announcement.id)} disabled={actionLoading}>
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
                                        </>
                                    ) : (
                                        <>
                                            <p className="text-sm text-muted-foreground whitespace-pre-line">
                                                {announcement.content}
                                            </p>
                                            {hasRole('admin') && (
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => startEdit(announcement)}
                                                        disabled={actionLoading}
                                                    >
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        onClick={() => handleDelete(announcement.id)}
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
            <RoleGuard allowedRoles={['admin']} fallback={null}>
                {isCreateModalOpen && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                        onClick={() => {
                            if (!actionLoading) setIsCreateModalOpen(false);
                        }}
                    >
                        <Card className="w-full max-w-xl" onClick={(e) => e.stopPropagation()}>
                            <CardHeader>
                                <CardTitle>Create Announcement</CardTitle>
                                <CardDescription>Share important updates with the family.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="announcement-title">Title</Label>
                                    <Input
                                        id="announcement-title"
                                        value={form.title}
                                        onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                                        placeholder="Announcement title"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="announcement-content">Content</Label>
                                    <textarea
                                        id="announcement-content"
                                        value={form.content}
                                        onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
                                        className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        placeholder="Write the announcement details..."
                                    />
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsCreateModalOpen(false)}
                                        disabled={actionLoading}
                                    >
                                        Cancel
                                    </Button>
                                    <Button onClick={handleCreate} disabled={actionLoading}>
                                        Publish
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
