'use client';

import { useEffect, useMemo, useState } from 'react';
import MembersNav from '@/components/protected/MembersNav';
import RoleGuard from '@/components/auth/RoleGuard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/components/auth/AuthProvider';
import { addDocument, deleteDocument, getDocuments, updateDocument } from '@/lib/firebase/db';
import { Event } from '@/lib/types';
import { orderBy } from 'firebase/firestore';

function parseEventDate(value: any): Date | null {
    if (!value) return null;
    if (value instanceof Date) return value;
    if (value.seconds) return new Date(value.seconds * 1000);
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value: any) {
    const date = parseEventDate(value);
    return date ? date.toLocaleString() : '-';
}

function toLocalInputValue(date: Date) {
    const pad = (num: number) => num.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function EventsPage() {
    const { user, hasRole } = useAuth();
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [form, setForm] = useState({ title: '', description: '', eventDate: '' });
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({ title: '', description: '', eventDate: '' });

    const fetchEvents = async () => {
        setLoading(true);
        setError('');
        const data = await getDocuments<Event>('events', [orderBy('event_date', 'asc')]);
        setEvents(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const { upcomingEvents, pastEvents } = useMemo(() => {
        const now = new Date();
        const upcoming: Event[] = [];
        const past: Event[] = [];
        events.forEach((event) => {
            const eventDate = parseEventDate(event.event_date);
            if (eventDate && eventDate >= now) {
                upcoming.push(event);
            } else {
                past.push(event);
            }
        });
        return { upcomingEvents: upcoming, pastEvents: past };
    }, [events]);

    const handleCreate = async () => {
        if (!form.title.trim() || !form.description.trim() || !form.eventDate) {
            setError('Please provide a title, description, and event date.');
            return;
        }
        if (!user?.id) {
            setError('You must be signed in to create events.');
            return;
        }
        const eventDate = parseEventDate(form.eventDate);
        if (!eventDate) {
            setError('Please provide a valid event date.');
            return;
        }
        setActionLoading(true);
        setError('');
        const id = await addDocument<Event>('events', {
            title: form.title.trim(),
            description: form.description.trim(),
            event_date: eventDate,
            created_by: user.id,
        });
        if (!id) {
            setError('Failed to create event.');
        } else {
            setForm({ title: '', description: '', eventDate: '' });
            await fetchEvents();
        }
        setActionLoading(false);
    };

    const startEdit = (event: Event) => {
        const eventDate = parseEventDate(event.event_date);
        setEditingId(event.id);
        setEditForm({
            title: event.title,
            description: event.description,
            eventDate: eventDate ? toLocalInputValue(eventDate) : '',
        });
    };

    const handleUpdate = async (id: string) => {
        if (!editForm.title.trim() || !editForm.description.trim() || !editForm.eventDate) {
            setError('Please provide a title, description, and event date.');
            return;
        }
        const eventDate = parseEventDate(editForm.eventDate);
        if (!eventDate) {
            setError('Please provide a valid event date.');
            return;
        }
        setActionLoading(true);
        setError('');
        const ok = await updateDocument('events', id, {
            title: editForm.title.trim(),
            description: editForm.description.trim(),
            event_date: eventDate,
            updated_at: new Date(),
        });
        if (!ok) {
            setError('Failed to update event.');
        } else {
            setEditingId(null);
            await fetchEvents();
        }
        setActionLoading(false);
    };

    const handleDelete = async (id: string) => {
        setActionLoading(true);
        setError('');
        const ok = await deleteDocument('events', id);
        if (!ok) {
            setError('Failed to delete event.');
        } else {
            await fetchEvents();
        }
        setActionLoading(false);
    };

    return (
        <>
            <MembersNav />
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-start justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-4xl font-bold mb-2">Events</h1>
                        <p className="text-muted-foreground">
                            Family celebrations, rituals, and gatherings
                        </p>
                    </div>
                    <Button variant="outline" onClick={fetchEvents} disabled={loading}>
                        Refresh
                    </Button>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                        <p className="text-sm text-destructive">{error}</p>
                    </div>
                )}

                <RoleGuard allowedRoles={['admin']} fallback={null}>
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>Create Event</CardTitle>
                            <CardDescription>Schedule a new family event.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="event-title">Title</Label>
                                <Input
                                    id="event-title"
                                    value={form.title}
                                    onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                                    placeholder="Event title"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="event-description">Description</Label>
                                <textarea
                                    id="event-description"
                                    value={form.description}
                                    onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                                    className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    placeholder="Event details..."
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="event-date">Event Date & Time</Label>
                                <Input
                                    id="event-date"
                                    type="datetime-local"
                                    value={form.eventDate}
                                    onChange={(e) => setForm((prev) => ({ ...prev, eventDate: e.target.value }))}
                                />
                            </div>
                            <Button onClick={handleCreate} disabled={actionLoading}>
                                Publish Event
                            </Button>
                        </CardContent>
                    </Card>
                </RoleGuard>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                    </div>
                ) : events.length === 0 ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>No Events Yet</CardTitle>
                            <CardDescription>Events added by admins will show here.</CardDescription>
                        </CardHeader>
                    </Card>
                ) : (
                    <div className="space-y-8">
                        {upcomingEvents.length > 0 && (
                            <div>
                                <h2 className="text-xl font-semibold mb-4">Upcoming Events</h2>
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {upcomingEvents.map((event) => (
                                        <Card key={event.id} className="border-primary/20">
                                            <CardHeader>
                                                <Badge className="w-fit mb-2">Upcoming</Badge>
                                                <CardTitle>{event.title}</CardTitle>
                                                <CardDescription>{formatDate(event.event_date)}</CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-3">
                                                {editingId === event.id ? (
                                                    <>
                                                        <div className="space-y-2">
                                                            <Label htmlFor={`edit-title-${event.id}`}>Title</Label>
                                                            <Input
                                                                id={`edit-title-${event.id}`}
                                                                value={editForm.title}
                                                                onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))}
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label htmlFor={`edit-description-${event.id}`}>Description</Label>
                                                            <textarea
                                                                id={`edit-description-${event.id}`}
                                                                value={editForm.description}
                                                                onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                                                                className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label htmlFor={`edit-date-${event.id}`}>Event Date & Time</Label>
                                                            <Input
                                                                id={`edit-date-${event.id}`}
                                                                type="datetime-local"
                                                                value={editForm.eventDate}
                                                                onChange={(e) => setEditForm((prev) => ({ ...prev, eventDate: e.target.value }))}
                                                            />
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <Button onClick={() => handleUpdate(event.id)} disabled={actionLoading}>
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
                                                            {event.description}
                                                        </p>
                                                        {hasRole('admin') && (
                                                            <div className="flex gap-2">
                                                                <Button
                                                                    variant="outline"
                                                                    onClick={() => startEdit(event)}
                                                                    disabled={actionLoading}
                                                                >
                                                                    Edit
                                                                </Button>
                                                                <Button
                                                                    variant="destructive"
                                                                    onClick={() => handleDelete(event.id)}
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
                            </div>
                        )}

                        {pastEvents.length > 0 && (
                            <div>
                                <h2 className="text-xl font-semibold mb-4">Past Events</h2>
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {pastEvents.map((event) => (
                                        <Card key={event.id} className="opacity-90">
                                            <CardHeader>
                                                <Badge variant="secondary" className="w-fit mb-2">Past Event</Badge>
                                                <CardTitle>{event.title}</CardTitle>
                                                <CardDescription>{formatDate(event.event_date)}</CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-3">
                                                {editingId === event.id ? (
                                                    <>
                                                        <div className="space-y-2">
                                                            <Label htmlFor={`edit-title-${event.id}`}>Title</Label>
                                                            <Input
                                                                id={`edit-title-${event.id}`}
                                                                value={editForm.title}
                                                                onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))}
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label htmlFor={`edit-description-${event.id}`}>Description</Label>
                                                            <textarea
                                                                id={`edit-description-${event.id}`}
                                                                value={editForm.description}
                                                                onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                                                                className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label htmlFor={`edit-date-${event.id}`}>Event Date & Time</Label>
                                                            <Input
                                                                id={`edit-date-${event.id}`}
                                                                type="datetime-local"
                                                                value={editForm.eventDate}
                                                                onChange={(e) => setEditForm((prev) => ({ ...prev, eventDate: e.target.value }))}
                                                            />
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <Button onClick={() => handleUpdate(event.id)} disabled={actionLoading}>
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
                                                            {event.description}
                                                        </p>
                                                        {hasRole('admin') && (
                                                            <div className="flex gap-2">
                                                                <Button
                                                                    variant="outline"
                                                                    onClick={() => startEdit(event)}
                                                                    disabled={actionLoading}
                                                                >
                                                                    Edit
                                                                </Button>
                                                                <Button
                                                                    variant="destructive"
                                                                    onClick={() => handleDelete(event.id)}
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
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}
