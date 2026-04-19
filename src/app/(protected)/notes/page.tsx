'use client';

import { useEffect, useMemo, useState } from 'react';
import { orderBy } from 'firebase/firestore';
import {
    Archive,
    ArchiveRestore,
    CheckSquare,
    Pin,
    PinOff,
    Plus,
    Search,
    StickyNote,
    Tag,
    Trash2,
    UserPlus,
    X,
} from 'lucide-react';
import MembersNav from '@/components/protected/MembersNav';
import RoleGuard from '@/components/auth/RoleGuard';
import { useAuth } from '@/components/auth/AuthProvider';
import { addDocument, deleteDocument, getDocuments, updateDocument } from '@/lib/firebase/db';
import { Note, NoteChecklistItem, User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Modal } from '@/components/ui/modal';

const NOTE_COLORS = [
    { id: 'default', name: 'Sand', cardClass: 'bg-stone-50 border-stone-200', dotClass: 'bg-stone-300' },
    { id: 'sun', name: 'Sun', cardClass: 'bg-amber-50 border-amber-200', dotClass: 'bg-amber-300' },
    { id: 'mint', name: 'Mint', cardClass: 'bg-emerald-50 border-emerald-200', dotClass: 'bg-emerald-300' },
    { id: 'sky', name: 'Sky', cardClass: 'bg-sky-50 border-sky-200', dotClass: 'bg-sky-300' },
    { id: 'blush', name: 'Blush', cardClass: 'bg-rose-50 border-rose-200', dotClass: 'bg-rose-300' },
    { id: 'lavender', name: 'Lavender', cardClass: 'bg-violet-50 border-violet-200', dotClass: 'bg-violet-300' },
] as const;

type NoteColor = (typeof NOTE_COLORS)[number]['id'];
type NotesView = 'active' | 'archived';

type NoteFormState = {
    title: string;
    content: string;
    color: NoteColor;
    pinned: boolean;
    archived: boolean;
    labelsText: string;
    collaboratorIds: string[];
    checklist: NoteChecklistItem[];
};

const EMPTY_FORM: NoteFormState = {
    title: '',
    content: '',
    color: 'default',
    pinned: false,
    archived: false,
    labelsText: '',
    collaboratorIds: [],
    checklist: [],
};

function parseDate(value: any): Date | null {
    if (!value) return null;
    if (value instanceof Date) return value;
    if (value.seconds) return new Date(value.seconds * 1000);
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatUpdatedAt(value: any) {
    const date = parseDate(value);
    if (!date) return 'No timestamp';
    return date.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}

function getColorMeta(color?: string) {
    return NOTE_COLORS.find((item) => item.id === color) || NOTE_COLORS[0];
}

function parseLabels(labelsText: string) {
    return Array.from(
        new Set(
            labelsText
                .split(',')
                .map((label) => label.trim())
                .filter(Boolean)
        )
    );
}

function sanitizeChecklist(items: NoteChecklistItem[]) {
    return items
        .map((item) => ({
            id: item.id,
            text: item.text.trim(),
            checked: item.checked,
        }))
        .filter((item) => item.text);
}

function sanitizeNoteForm(form: NoteFormState) {
    return {
        title: form.title.trim(),
        content: form.content.trim(),
        color: form.color,
        pinned: form.pinned,
        archived: form.archived,
        labels: parseLabels(form.labelsText),
        collaborator_ids: Array.from(new Set(form.collaboratorIds)),
        checklist: sanitizeChecklist(form.checklist),
    };
}

function isBlankNote(form: NoteFormState) {
    const labels = parseLabels(form.labelsText);
    const checklist = sanitizeChecklist(form.checklist);
    return !form.title.trim() && !form.content.trim() && labels.length === 0 && checklist.length === 0;
}

function createChecklistItem(text = ''): NoteChecklistItem {
    return {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        text,
        checked: false,
    };
}

function hydrateFormFromNote(note: Note): NoteFormState {
    return {
        title: note.title || '',
        content: note.content || '',
        color: (note.color as NoteColor) || 'default',
        pinned: Boolean(note.pinned),
        archived: Boolean(note.archived),
        labelsText: (note.labels || []).join(', '),
        collaboratorIds: note.collaborator_ids || [],
        checklist: (note.checklist || []).map((item) => ({
            id: item.id || createChecklistItem().id,
            text: item.text || '',
            checked: Boolean(item.checked),
        })),
    };
}

export default function NotesPage() {
    const { user, hasRole } = useAuth();
    const isAdmin = hasRole('admin');

    const [notes, setNotes] = useState<Note[]>([]);
    const [members, setMembers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [membersLoading, setMembersLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [view, setView] = useState<NotesView>('active');
    const [actionLoading, setActionLoading] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [deleteCandidate, setDeleteCandidate] = useState<Note | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<NoteFormState>(EMPTY_FORM);
    const [editForm, setEditForm] = useState<NoteFormState>(EMPTY_FORM);

    const memberMap = useMemo(
        () =>
            members.reduce<Record<string, User>>((acc, member) => {
                acc[member.id] = member;
                return acc;
            }, {}),
        [members]
    );

    const fetchNotes = async () => {
        setLoading(true);
        setError('');
        const data = await getDocuments<Note>('notes', [orderBy('updated_at', 'desc')]);
        setNotes(data);
        setLoading(false);
    };

    const fetchMembers = async () => {
        setMembersLoading(true);
        const data = await getDocuments<User>('users', [orderBy('name', 'asc')]);
        setMembers(data);
        setMembersLoading(false);
    };

    useEffect(() => {
        fetchNotes();
        fetchMembers();
    }, []);

    const filteredNotes = useMemo(() => {
        const needle = search.trim().toLowerCase();
        const viewFiltered = notes.filter((note) => Boolean(note.archived) === (view === 'archived'));
        const sorted = [...viewFiltered].sort((a, b) => {
            if (Boolean(a.pinned) !== Boolean(b.pinned)) {
                return a.pinned ? -1 : 1;
            }
            const aTime = parseDate(a.updated_at)?.getTime() || parseDate(a.created_at)?.getTime() || 0;
            const bTime = parseDate(b.updated_at)?.getTime() || parseDate(b.created_at)?.getTime() || 0;
            return bTime - aTime;
        });

        if (!needle) return sorted;

        return sorted.filter((note) => {
            const title = note.title?.toLowerCase() || '';
            const content = note.content?.toLowerCase() || '';
            const labels = (note.labels || []).join(' ').toLowerCase();
            const checklist = (note.checklist || []).map((item) => item.text).join(' ').toLowerCase();
            const collaborators = (note.collaborator_ids || [])
                .map((id) => memberMap[id]?.name || memberMap[id]?.email || '')
                .join(' ')
                .toLowerCase();
            return (
                title.includes(needle) ||
                content.includes(needle) ||
                labels.includes(needle) ||
                checklist.includes(needle) ||
                collaborators.includes(needle)
            );
        });
    }, [memberMap, notes, search, view]);

    const pinnedNotes = filteredNotes.filter((note) => note.pinned);
    const otherNotes = filteredNotes.filter((note) => !note.pinned);

    const stats = useMemo(
        () => ({
            active: notes.filter((note) => !note.archived).length,
            archived: notes.filter((note) => note.archived).length,
        }),
        [notes]
    );

    const resetCreateForm = () => {
        setForm(EMPTY_FORM);
        setIsCreateModalOpen(false);
    };

    const startEdit = (note: Note) => {
        setError('');
        setEditingId(note.id);
        setEditForm(hydrateFormFromNote(note));
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditForm(EMPTY_FORM);
    };

    const handleCreate = async () => {
        if (isBlankNote(form)) {
            setError('Please add a title, content, label, or checklist item.');
            return;
        }
        if (!user?.id) {
            setError('You must be signed in to create a note.');
            return;
        }

        setActionLoading(true);
        setError('');

        const payload = sanitizeNoteForm(form);
        const now = new Date();
        const id = await addDocument<Note>('notes', {
            ...payload,
            created_by: user.id,
            updated_at: now,
        });

        if (!id) {
            setError('Failed to create note.');
        } else {
            resetCreateForm();
            await fetchNotes();
        }

        setActionLoading(false);
    };

    const handleUpdate = async (id: string) => {
        if (isBlankNote(editForm)) {
            setError('Please add a title, content, label, or checklist item.');
            return;
        }

        setActionLoading(true);
        setError('');

        const ok = await updateDocument('notes', id, {
            ...sanitizeNoteForm(editForm),
            updated_at: new Date(),
        });

        if (!ok) {
            setError('Failed to update note.');
        } else {
            cancelEdit();
            await fetchNotes();
        }

        setActionLoading(false);
    };

    const handleDelete = async () => {
        if (!deleteCandidate) return;

        setActionLoading(true);
        setError('');

        const ok = await deleteDocument('notes', deleteCandidate.id);
        if (!ok) {
            setError('Failed to delete note.');
        } else {
            setDeleteCandidate(null);
            if (editingId === deleteCandidate.id) {
                cancelEdit();
            }
            await fetchNotes();
        }

        setActionLoading(false);
    };

    const handleQuickUpdate = async (id: string, patch: Record<string, any>, failureMessage: string) => {
        setActionLoading(true);
        setError('');

        const ok = await updateDocument('notes', id, {
            ...patch,
            updated_at: new Date(),
        });

        if (!ok) {
            setError(failureMessage);
        } else {
            await fetchNotes();
        }

        setActionLoading(false);
    };

    const toggleCollaborator = (
        state: NoteFormState,
        setState: React.Dispatch<React.SetStateAction<NoteFormState>>,
        collaboratorId: string
    ) => {
        const hasId = state.collaboratorIds.includes(collaboratorId);
        setState((prev) => ({
            ...prev,
            collaboratorIds: hasId
                ? prev.collaboratorIds.filter((id) => id !== collaboratorId)
                : [...prev.collaboratorIds, collaboratorId],
        }));
    };

    const updateChecklistItem = (
        setState: React.Dispatch<React.SetStateAction<NoteFormState>>,
        itemId: string,
        patch: Partial<NoteChecklistItem>
    ) => {
        setState((prev) => ({
            ...prev,
            checklist: prev.checklist.map((item) => (item.id === itemId ? { ...item, ...patch } : item)),
        }));
    };

    const removeChecklistItem = (
        setState: React.Dispatch<React.SetStateAction<NoteFormState>>,
        itemId: string
    ) => {
        setState((prev) => ({
            ...prev,
            checklist: prev.checklist.filter((item) => item.id !== itemId),
        }));
    };

    const addChecklistItemToForm = (
        setState: React.Dispatch<React.SetStateAction<NoteFormState>>
    ) => {
        setState((prev) => ({
            ...prev,
            checklist: [...prev.checklist, createChecklistItem()],
        }));
    };

    const renderCollaborators = (ids: string[]) => {
        if (!ids.length) return null;

        return (
            <div className="flex flex-wrap gap-2">
                {ids.map((id) => {
                    const member = memberMap[id];
                    return (
                        <Badge key={id} variant="secondary" className="gap-1">
                            <UserPlus className="h-3 w-3" />
                            {member?.name || member?.email || 'Unknown member'}
                        </Badge>
                    );
                })}
            </div>
        );
    };

    const renderNoteEditor = (
        currentForm: NoteFormState,
        updateForm: React.Dispatch<React.SetStateAction<NoteFormState>>,
        noteId?: string
    ) => (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor={noteId ? `note-title-${noteId}` : 'new-note-title'}>Title</Label>
                <Input
                    id={noteId ? `note-title-${noteId}` : 'new-note-title'}
                    value={currentForm.title}
                    onChange={(e) => updateForm((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Title"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor={noteId ? `note-content-${noteId}` : 'new-note-content'}>Note</Label>
                <textarea
                    id={noteId ? `note-content-${noteId}` : 'new-note-content'}
                    value={currentForm.content}
                    onChange={(e) => updateForm((prev) => ({ ...prev, content: e.target.value }))}
                    className="w-full min-h-[140px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="Capture a reminder, decision, checklist, or family update..."
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor={noteId ? `note-labels-${noteId}` : 'new-note-labels'}>Labels</Label>
                <Input
                    id={noteId ? `note-labels-${noteId}` : 'new-note-labels'}
                    value={currentForm.labelsText}
                    onChange={(e) => updateForm((prev) => ({ ...prev, labelsText: e.target.value }))}
                    placeholder="festival, kitchen, volunteers"
                />
                <p className="text-xs text-muted-foreground">Separate labels with commas.</p>
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                    <Label>Checklist</Label>
                    <Button type="button" variant="outline" size="sm" onClick={() => addChecklistItemToForm(updateForm)}>
                        <CheckSquare className="h-4 w-4" />
                        Add Item
                    </Button>
                </div>
                {currentForm.checklist.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No checklist items yet.</p>
                ) : (
                    <div className="space-y-2">
                        {currentForm.checklist.map((item) => (
                            <div key={item.id} className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={item.checked}
                                    onChange={(e) => updateChecklistItem(updateForm, item.id, { checked: e.target.checked })}
                                    className="h-4 w-4 rounded border-input"
                                />
                                <Input
                                    value={item.text}
                                    onChange={(e) => updateChecklistItem(updateForm, item.id, { text: e.target.value })}
                                    placeholder="Checklist item"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeChecklistItem(updateForm, item.id)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="space-y-3">
                <Label>Collaborators</Label>
                {membersLoading ? (
                    <p className="text-sm text-muted-foreground">Loading members...</p>
                ) : (
                    <div className="max-h-40 space-y-2 overflow-y-auto rounded-md border bg-background p-3">
                        {members.map((member) => {
                            const selected = currentForm.collaboratorIds.includes(member.id);
                            return (
                                <button
                                    key={member.id}
                                    type="button"
                                    className={`flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-sm transition ${
                                        selected ? 'border-primary bg-primary/10' : 'border-transparent hover:border-border hover:bg-muted/60'
                                    }`}
                                    onClick={() => toggleCollaborator(currentForm, updateForm, member.id)}
                                >
                                    <span className="min-w-0">
                                        <span className="block truncate font-medium">{member.name}</span>
                                        <span className="block truncate text-xs text-muted-foreground">{member.email}</span>
                                    </span>
                                    {selected && <Badge variant="secondary">Added</Badge>}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                    <Label className="text-sm">Color</Label>
                    <div className="flex flex-wrap gap-2">
                        {NOTE_COLORS.map((color) => {
                            const selected = currentForm.color === color.id;
                            return (
                                <button
                                    key={color.id}
                                    type="button"
                                    className={`h-7 w-7 rounded-full border-2 transition ${color.dotClass} ${selected ? 'border-foreground scale-110' : 'border-transparent'}`}
                                    aria-label={`Choose ${color.name} note color`}
                                    onClick={() => updateForm((prev) => ({ ...prev, color: color.id }))}
                                />
                            );
                        })}
                    </div>
                </div>
                <Button
                    type="button"
                    variant={currentForm.pinned ? 'secondary' : 'outline'}
                    size="sm"
                    onClick={() => updateForm((prev) => ({ ...prev, pinned: !prev.pinned }))}
                >
                    {currentForm.pinned ? <Pin className="h-4 w-4" /> : <PinOff className="h-4 w-4" />}
                    {currentForm.pinned ? 'Pinned' : 'Pin Note'}
                </Button>
                <Button
                    type="button"
                    variant={currentForm.archived ? 'secondary' : 'outline'}
                    size="sm"
                    onClick={() => updateForm((prev) => ({ ...prev, archived: !prev.archived }))}
                >
                    {currentForm.archived ? <ArchiveRestore className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
                    {currentForm.archived ? 'Archived' : 'Archive'}
                </Button>
            </div>
        </div>
    );

    const renderChecklistPreview = (checklist: NoteChecklistItem[]) => {
        if (!checklist.length) return null;

        return (
            <div className="space-y-2">
                {checklist.slice(0, 5).map((item) => (
                    <label key={item.id} className="flex items-start gap-2 text-sm text-foreground/85">
                        <input
                            type="checkbox"
                            checked={item.checked}
                            disabled
                            className="mt-0.5 h-4 w-4 rounded border-input"
                        />
                        <span className={item.checked ? 'line-through text-muted-foreground' : ''}>{item.text}</span>
                    </label>
                ))}
                {checklist.length > 5 && (
                    <p className="text-xs text-muted-foreground">+{checklist.length - 5} more checklist items</p>
                )}
            </div>
        );
    };

    const renderNotesSection = (title: string, items: Note[]) => {
        if (!items.length) return null;

        return (
            <section className="space-y-4">
                <div className="flex items-center gap-2">
                    <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">{title}</h2>
                    <div className="h-px flex-1 bg-border" />
                </div>
                <div className="columns-1 gap-4 md:columns-2 xl:columns-4">
                    {items.map((note) => {
                        const color = getColorMeta(note.color);
                        const isEditing = editingId === note.id;

                        return (
                            <div key={note.id} className="mb-4 break-inside-avoid">
                                <Card className={`${color.cardClass} shadow-sm transition-shadow hover:shadow-md`}>
                                    <CardContent className="space-y-3 p-4">
                                        {isEditing ? (
                                            <>
                                                {renderNoteEditor(editForm, setEditForm, note.id)}
                                                <div className="flex flex-wrap gap-2">
                                                    <Button onClick={() => handleUpdate(note.id)} disabled={actionLoading}>
                                                        Save Changes
                                                    </Button>
                                                    <Button variant="outline" onClick={cancelEdit} disabled={actionLoading}>
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0 flex-1">
                                                        {note.title ? (
                                                            <h3 className="break-words text-base font-semibold">{note.title}</h3>
                                                        ) : (
                                                            <p className="text-sm font-medium text-muted-foreground">Untitled note</p>
                                                        )}
                                                    </div>
                                                    <div className="flex shrink-0 items-center gap-1 text-foreground/70">
                                                        {note.archived && <Archive className="h-4 w-4" />}
                                                        {note.pinned && <Pin className="h-4 w-4" />}
                                                    </div>
                                                </div>

                                                {note.content ? (
                                                    <p className="break-words whitespace-pre-line text-sm text-foreground/85">
                                                        {note.content}
                                                    </p>
                                                ) : null}

                                                {renderChecklistPreview(note.checklist || [])}

                                                {(note.labels || []).length > 0 && (
                                                    <div className="flex flex-wrap gap-2">
                                                        {note.labels?.map((label) => (
                                                            <Badge key={label} variant="outline" className="gap-1">
                                                                <Tag className="h-3 w-3" />
                                                                {label}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                )}

                                                {renderCollaborators(note.collaborator_ids || [])}

                                                <p className="text-xs text-muted-foreground">
                                                    Updated {formatUpdatedAt(note.updated_at || note.created_at)}
                                                </p>

                                                {isAdmin && (
                                                    <div className="flex flex-wrap gap-2 pt-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => startEdit(note)}
                                                            disabled={actionLoading}
                                                        >
                                                            Edit
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() =>
                                                                handleQuickUpdate(
                                                                    note.id,
                                                                    { pinned: !note.pinned },
                                                                    'Failed to update note pin.'
                                                                )
                                                            }
                                                            disabled={actionLoading}
                                                        >
                                                            {note.pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                                                            {note.pinned ? 'Unpin' : 'Pin'}
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() =>
                                                                handleQuickUpdate(
                                                                    note.id,
                                                                    { archived: !note.archived, pinned: note.archived ? note.pinned : false },
                                                                    'Failed to update archive state.'
                                                                )
                                                            }
                                                            disabled={actionLoading}
                                                        >
                                                            {note.archived ? <ArchiveRestore className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
                                                            {note.archived ? 'Restore' : 'Archive'}
                                                        </Button>
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={() => setDeleteCandidate(note)}
                                                            disabled={actionLoading}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                            Delete
                                                        </Button>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        );
                    })}
                </div>
            </section>
        );
    };

    return (
        <>
            <MembersNav />
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-2xl">
                        <h1 className="mb-2 text-4xl font-bold">Family Notes</h1>
                        <p className="text-muted-foreground">
                            Shared reminders, decisions, checklists, and collaborator notes in one Keep-style board.
                        </p>
                    </div>
                    <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
                        <div className="relative min-w-0 sm:min-w-[300px]">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search notes, labels, checklist items, or collaborators"
                                className="pl-9"
                            />
                        </div>
                        <Button variant={view === 'active' ? 'default' : 'outline'} onClick={() => setView('active')}>
                            Active ({stats.active})
                        </Button>
                        <Button variant={view === 'archived' ? 'default' : 'outline'} onClick={() => setView('archived')}>
                            Archived ({stats.archived})
                        </Button>
                        <Button variant="outline" onClick={() => { fetchNotes(); fetchMembers(); }} disabled={loading || actionLoading}>
                            Refresh
                        </Button>
                        <RoleGuard allowedRoles={['admin']} fallback={null}>
                            <Button
                                onClick={() => {
                                    setError('');
                                    setIsCreateModalOpen(true);
                                }}
                                disabled={actionLoading}
                            >
                                <Plus className="h-4 w-4" />
                                New Note
                            </Button>
                        </RoleGuard>
                    </div>
                </div>

                {error && (
                    <div className="mb-4 rounded-md border border-destructive/20 bg-destructive/10 p-3">
                        <p className="text-sm text-destructive">{error}</p>
                    </div>
                )}

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-primary" />
                    </div>
                ) : filteredNotes.length === 0 ? (
                    <div className="rounded-2xl border border-dashed bg-muted/40 px-6 py-16 text-center">
                        <StickyNote className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                        <h3 className="text-lg font-semibold">No {view} notes yet</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            {search
                                ? 'No notes match your search right now.'
                                : view === 'archived'
                                    ? 'Archive notes you want to keep without cluttering the main board.'
                                    : 'Admins can add notes here for the whole family to see.'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {renderNotesSection('Pinned', pinnedNotes)}
                        {renderNotesSection(view === 'archived' ? 'Archived Notes' : 'Others', otherNotes)}
                    </div>
                )}
            </div>

            <RoleGuard allowedRoles={['admin']} fallback={null}>
                {isCreateModalOpen && (
                    <div
                        className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-3 sm:items-center sm:p-4"
                        onClick={() => {
                            if (!actionLoading) resetCreateForm();
                        }}
                    >
                        <Card
                            className="mt-4 max-h-[95vh] w-full max-w-3xl overflow-y-auto sm:mt-0"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <CardHeader>
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <CardTitle>Create Note</CardTitle>
                                        <CardDescription>Write something quick, add labels, assign collaborators, or turn it into a checklist.</CardDescription>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={resetCreateForm} disabled={actionLoading}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {renderNoteEditor(form, setForm)}
                                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                                    <Button variant="outline" onClick={resetCreateForm} disabled={actionLoading}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleCreate} disabled={actionLoading}>
                                        Create Note
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </RoleGuard>

            <Modal
                isOpen={Boolean(deleteCandidate)}
                onClose={() => {
                    if (!actionLoading) setDeleteCandidate(null);
                }}
                onConfirm={handleDelete}
                title="Delete Note"
                description="This note will be permanently removed for all members."
                confirmText="Delete Note"
                cancelText="Cancel"
                variant="destructive"
                isLoading={actionLoading}
            />
        </>
    );
}
