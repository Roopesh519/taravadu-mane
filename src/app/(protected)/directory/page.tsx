'use client';

import { useEffect, useMemo, useState } from 'react';
import MembersNav from '@/components/protected/MembersNav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/auth/AuthProvider';
import { getDocuments, updateDocument } from '@/lib/firebase/db';
import { User } from '@/lib/types';
import { orderBy } from 'firebase/firestore';

export default function DirectoryPage() {
    const { hasRole } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({
        name: '',
        email: '',
        phone: '',
        family_branch: '',
        city: '',
        roles: '',
    });

    const fetchUsers = async () => {
        setLoading(true);
        setError('');
        const data = await getDocuments<User>('users', [orderBy('name', 'asc')]);
        setUsers(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const filteredUsers = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return users;
        return users.filter((person) =>
            [person.name, person.email, person.phone, person.family_branch, person.city]
                .filter(Boolean)
                .some((value) => value!.toLowerCase().includes(term))
        );
    }, [users, search]);

    const startEdit = (person: User) => {
        setEditingId(person.id);
        setEditForm({
            name: person.name || '',
            email: person.email || '',
            phone: person.phone || '',
            family_branch: person.family_branch || '',
            city: person.city || '',
            roles: (person.roles || []).join(', '),
        });
    };

    const handleUpdate = async (id: string) => {
        if (!editForm.name.trim() || !editForm.email.trim()) {
            setError('Name and email are required.');
            return;
        }
        setActionLoading(true);
        setError('');
        const roles = editForm.roles
            .split(',')
            .map((role) => role.trim())
            .filter(Boolean);
        const ok = await updateDocument('users', id, {
            name: editForm.name.trim(),
            email: editForm.email.trim(),
            phone: editForm.phone.trim() || null,
            family_branch: editForm.family_branch.trim() || null,
            city: editForm.city.trim() || null,
            roles: roles.length > 0 ? roles : ['member'],
            updated_at: new Date(),
        });
        if (!ok) {
            setError('Failed to update user.');
        } else {
            setEditingId(null);
            await fetchUsers();
        }
        setActionLoading(false);
    };

    return (
        <>
            <MembersNav />
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-start justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-4xl font-bold mb-2">Family Directory</h1>
                        <p className="text-muted-foreground">
                            Connect with family members
                        </p>
                    </div>
                    <Button variant="outline" onClick={fetchUsers} disabled={loading}>
                        Refresh
                    </Button>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                        <p className="text-sm text-destructive">{error}</p>
                    </div>
                )}

                <div className="mb-6 max-w-md">
                    <Label htmlFor="directory-search">Search</Label>
                    <Input
                        id="directory-search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name, email, city..."
                    />
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>No Members Found</CardTitle>
                            <CardDescription>Try adjusting your search.</CardDescription>
                        </CardHeader>
                    </Card>
                ) : (
                    <div className="grid md:grid-cols-2 gap-6">
                        {filteredUsers.map((person) => (
                            <Card key={person.id}>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg">{person.name}</CardTitle>
                                    <CardDescription>{person.email}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {editingId === person.id ? (
                                        <div className="space-y-3">
                                            <div className="space-y-2">
                                                <Label htmlFor={`edit-name-${person.id}`}>Name</Label>
                                                <Input
                                                    id={`edit-name-${person.id}`}
                                                    value={editForm.name}
                                                    onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor={`edit-email-${person.id}`}>Email</Label>
                                                <Input
                                                    id={`edit-email-${person.id}`}
                                                    value={editForm.email}
                                                    onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor={`edit-phone-${person.id}`}>Phone</Label>
                                                <Input
                                                    id={`edit-phone-${person.id}`}
                                                    value={editForm.phone}
                                                    onChange={(e) => setEditForm((prev) => ({ ...prev, phone: e.target.value }))}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor={`edit-branch-${person.id}`}>Family Branch</Label>
                                                <Input
                                                    id={`edit-branch-${person.id}`}
                                                    value={editForm.family_branch}
                                                    onChange={(e) => setEditForm((prev) => ({ ...prev, family_branch: e.target.value }))}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor={`edit-city-${person.id}`}>City</Label>
                                                <Input
                                                    id={`edit-city-${person.id}`}
                                                    value={editForm.city}
                                                    onChange={(e) => setEditForm((prev) => ({ ...prev, city: e.target.value }))}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor={`edit-roles-${person.id}`}>Roles</Label>
                                                <Input
                                                    id={`edit-roles-${person.id}`}
                                                    value={editForm.roles}
                                                    onChange={(e) => setEditForm((prev) => ({ ...prev, roles: e.target.value }))}
                                                    placeholder="admin, treasurer, member"
                                                />
                                            </div>
                                            <div className="flex gap-2">
                                                <Button onClick={() => handleUpdate(person.id)} disabled={actionLoading}>
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
                                            <div className="text-sm text-muted-foreground space-y-1">
                                                <div>Phone: {person.phone || '-'}</div>
                                                <div>Branch: {person.family_branch || '-'}</div>
                                                <div>City: {person.city || '-'}</div>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {(person.roles || []).map((role) => (
                                                    <Badge key={`${person.id}-${role}`} variant="secondary">
                                                        {role}
                                                    </Badge>
                                                ))}
                                            </div>
                                            {hasRole('admin') && (
                                                <Button
                                                    variant="outline"
                                                    onClick={() => startEdit(person)}
                                                    disabled={actionLoading}
                                                >
                                                    Edit
                                                </Button>
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
