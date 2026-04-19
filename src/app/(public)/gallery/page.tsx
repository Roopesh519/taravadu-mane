'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Pencil, Trash2 } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { auth } from '@/lib/firebase/config';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Modal } from '@/components/ui/modal';
import { GalleryPhoto } from '@/lib/types';

const MAX_FILE_SIZE = 15 * 1024 * 1024;

function mapApiErrorToMessage(code?: string, fallback?: string) {
    switch (code) {
        case 'MISSING_AUTH_TOKEN':
            return 'Your session expired. Please sign in again and retry.';
        case 'FORBIDDEN':
            return 'Only admins can manage gallery photos.';
        case 'NO_FILES':
            return 'Please select at least one image.';
        case 'INVALID_FILE_TYPE':
            return 'Only image files are allowed (JPG, PNG, WebP, etc).';
        case 'FILE_TOO_LARGE':
            return 'Each image must be 15MB or less.';
        case 'CLOUDINARY_NETWORK_ERROR':
            return 'Upload failed due to a temporary network issue while reaching image storage. Please retry.';
        case 'CLOUDINARY_REQUEST_ERROR':
            return 'Could not reach the image storage service. Please retry.';
        case 'CLOUDINARY_UPLOAD_ERROR':
            return 'The image storage service rejected the request. Please try again.';
        case 'CLOUDINARY_CONFIG_ERROR':
            return 'Image storage is not configured correctly on the server.';
        case 'GALLERY_FETCH_ERROR':
            return 'Could not load gallery photos right now. Please refresh and try again.';
        case 'PHOTO_ID_REQUIRED':
            return 'Please choose a photo and try again.';
        case 'PHOTO_NOT_FOUND':
            return 'That photo no longer exists. Refresh the gallery and try again.';
        default:
            return fallback || 'Something went wrong. Please try again.';
    }
}

export default function GalleryPage() {
    const { hasRole } = useAuth();
    const isAdmin = hasRole('admin');

    const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const [editingPhoto, setEditingPhoto] = useState<GalleryPhoto | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editFile, setEditFile] = useState<File | null>(null);
    const [editPreviewUrl, setEditPreviewUrl] = useState('');
    const [savingPhoto, setSavingPhoto] = useState(false);
    const [photoPendingDelete, setPhotoPendingDelete] = useState<GalleryPhoto | null>(null);
    const [deletingPhotoId, setDeletingPhotoId] = useState('');

    const fetchPhotos = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/gallery', { cache: 'no-store' });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(mapApiErrorToMessage(data?.code, data?.error));
            }
            setPhotos(data.photos || []);
        } catch (err: any) {
            setError(err.message || 'Could not load gallery photos right now.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPhotos();
    }, []);

    useEffect(() => {
        if (!editFile) {
            setEditPreviewUrl('');
            return;
        }

        const previewUrl = URL.createObjectURL(editFile);
        setEditPreviewUrl(previewUrl);

        return () => URL.revokeObjectURL(previewUrl);
    }, [editFile]);

    const resetUploadState = () => {
        setTitle('');
        setFiles([]);
        setIsUploadModalOpen(false);
        const input = document.getElementById('gallery-images') as HTMLInputElement | null;
        if (input) input.value = '';
    };

    const resetEditState = () => {
        setEditingPhoto(null);
        setEditTitle('');
        setEditFile(null);
        setEditPreviewUrl('');
        const input = document.getElementById('gallery-edit-image') as HTMLInputElement | null;
        if (input) input.value = '';
    };

    const handleUpload = async () => {
        if (!files.length) {
            setError('Please select one or more images.');
            return;
        }
        const invalidType = files.find((file) => !file.type.startsWith('image/'));
        if (invalidType) {
            setError(`Only image files are allowed. Invalid file: ${invalidType.name}`);
            return;
        }
        const oversized = files.find((file) => file.size > MAX_FILE_SIZE);
        if (oversized) {
            setError(`Each image must be 15MB or less. Invalid file: ${oversized.name}`);
            return;
        }

        setUploading(true);
        setError('');

        try {
            const token = await auth.currentUser?.getIdToken();
            if (!token) {
                throw new Error('You must be logged in as admin to upload images.');
            }

            const form = new FormData();
            if (title.trim()) {
                form.append('title', title.trim());
            }
            files.forEach((file) => form.append('images', file));

            const res = await fetch('/api/admin/gallery', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: form,
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(mapApiErrorToMessage(data?.code, data?.error));
            }

            resetUploadState();
            await fetchPhotos();
        } catch (err: any) {
            const message = String(err?.message || '');
            if (message.toLowerCase().includes('failed to fetch')) {
                setError('Unable to reach the server. Please check your connection and retry.');
            } else {
                setError(message || 'Failed to upload images.');
            }
        } finally {
            setUploading(false);
        }
    };

    const openEditModal = (photo: GalleryPhoto) => {
        setError('');
        setEditingPhoto(photo);
        setEditTitle(photo.title || '');
        setEditFile(null);
        setEditPreviewUrl('');
        const input = document.getElementById('gallery-edit-image') as HTMLInputElement | null;
        if (input) input.value = '';
    };

    const handleEditSave = async () => {
        if (!editingPhoto) return;

        if (editFile && !editFile.type.startsWith('image/')) {
            setError(`Only image files are allowed. Invalid file: ${editFile.name}`);
            return;
        }
        if (editFile && editFile.size > MAX_FILE_SIZE) {
            setError(`Each image must be 15MB or less. Invalid file: ${editFile.name}`);
            return;
        }

        setSavingPhoto(true);
        setError('');

        try {
            const token = await auth.currentUser?.getIdToken();
            if (!token) {
                throw new Error('You must be logged in as admin to edit images.');
            }

            const form = new FormData();
            form.append('photoId', editingPhoto.id);
            form.append('title', editTitle.trim());
            if (editFile) {
                form.append('image', editFile);
            }

            const res = await fetch('/api/admin/gallery', {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: form,
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(mapApiErrorToMessage(data?.code, data?.error));
            }

            resetEditState();
            await fetchPhotos();
        } catch (err: any) {
            const message = String(err?.message || '');
            if (message.toLowerCase().includes('failed to fetch')) {
                setError('Unable to reach the server. Please check your connection and retry.');
            } else {
                setError(message || 'Failed to update the photo.');
            }
        } finally {
            setSavingPhoto(false);
        }
    };

    const handleDelete = async () => {
        if (!photoPendingDelete) return;

        setDeletingPhotoId(photoPendingDelete.id);
        setError('');

        try {
            const token = await auth.currentUser?.getIdToken();
            if (!token) {
                throw new Error('You must be logged in as admin to delete images.');
            }

            const res = await fetch('/api/admin/gallery', {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ photoId: photoPendingDelete.id }),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(mapApiErrorToMessage(data?.code, data?.error));
            }

            setPhotoPendingDelete(null);
            await fetchPhotos();
        } catch (err: any) {
            const message = String(err?.message || '');
            if (message.toLowerCase().includes('failed to fetch')) {
                setError('Unable to reach the server. Please check your connection and retry.');
            } else {
                setError(message || 'Failed to delete the photo.');
            }
        } finally {
            setDeletingPhotoId('');
        }
    };

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-4xl font-bold mb-2">Photo Gallery</h1>
                        <p className="text-muted-foreground max-w-2xl">
                            Memories from our Taravadu Mane: rituals, celebrations, and family moments.
                        </p>
                    </div>
                    <div className="flex w-full sm:w-auto items-center gap-2">
                        {isAdmin && (
                            <Button
                                className="w-full sm:w-auto"
                                onClick={() => {
                                    setError('');
                                    setIsUploadModalOpen(true);
                                }}
                            >
                                Upload Gallery Photos
                            </Button>
                        )}
                        <Button
                            className="w-full sm:w-auto"
                            variant="outline"
                            onClick={fetchPhotos}
                            disabled={loading || uploading || savingPhoto || Boolean(deletingPhotoId)}
                        >
                            Refresh
                        </Button>
                    </div>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                        <p className="text-sm text-destructive">{error}</p>
                    </div>
                )}

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                    </div>
                ) : photos.length === 0 ? (
                    <div className="bg-muted/40 border-2 border-dashed rounded-lg p-12 text-center">
                        <h3 className="text-lg font-semibold mb-2">No Photos Yet</h3>
                        <p className="text-sm text-muted-foreground">
                            Gallery photos uploaded by admins will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {photos.map((photo) => (
                            <Card key={photo.id} className="overflow-hidden">
                                <div className="relative aspect-[4/3]">
                                    <Image
                                        src={photo.image_url}
                                        alt={photo.title || 'Taravadu Mane gallery photo'}
                                        fill
                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                        className="object-cover"
                                    />
                                </div>
                                <CardContent className="py-3 space-y-3">
                                    <p className="text-sm font-medium truncate">{photo.title || 'Untitled'}</p>
                                    {isAdmin && (
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1"
                                                onClick={() => openEditModal(photo)}
                                                disabled={uploading || savingPhoto || deletingPhotoId === photo.id}
                                            >
                                                <Pencil className="h-4 w-4" />
                                                Edit
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                className="flex-1"
                                                onClick={() => {
                                                    setError('');
                                                    setPhotoPendingDelete(photo);
                                                }}
                                                disabled={uploading || savingPhoto || deletingPhotoId === photo.id}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                {deletingPhotoId === photo.id ? 'Deleting...' : 'Delete'}
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {isAdmin && isUploadModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/50 p-3 sm:p-4"
                    onClick={() => {
                        if (!uploading) resetUploadState();
                    }}
                >
                    <Card
                        className="w-full max-w-xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto mt-4 sm:mt-0"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <CardHeader>
                            <CardTitle>Upload Gallery Photos</CardTitle>
                            <CardDescription>
                                Images are uploaded to Cloudinary with automatic optimization.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="gallery-title">Title (optional)</Label>
                                <Input
                                    id="gallery-title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Festival 2026"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="gallery-images">Images</Label>
                                <Input
                                    id="gallery-images"
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={(e) => setFiles(Array.from(e.target.files || []))}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Up to 15MB per image. You can select multiple files.
                                </p>
                            </div>
                            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2">
                                <Button
                                    className="w-full sm:w-auto"
                                    variant="outline"
                                    onClick={resetUploadState}
                                    disabled={uploading}
                                >
                                    Cancel
                                </Button>
                                <Button className="w-full sm:w-auto" onClick={handleUpload} disabled={uploading || !files.length}>
                                    {uploading ? 'Uploading...' : 'Upload Photos'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {isAdmin && editingPhoto && (
                <div
                    className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/50 p-3 sm:p-4"
                    onClick={() => {
                        if (!savingPhoto) resetEditState();
                    }}
                >
                    <Card
                        className="w-full max-w-xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto mt-4 sm:mt-0"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <CardHeader>
                            <CardTitle>Edit Gallery Photo</CardTitle>
                            <CardDescription>
                                Update the title or replace the image file. Replacing the image removes the old file from Cloudinary.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="relative aspect-[4/3] overflow-hidden rounded-md border">
                                <Image
                                    src={editPreviewUrl || editingPhoto.image_url}
                                    alt={editingPhoto.title || 'Gallery photo preview'}
                                    fill
                                    sizes="(max-width: 768px) 100vw, 640px"
                                    className="object-cover"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="gallery-edit-title">Title</Label>
                                <Input
                                    id="gallery-edit-title"
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    placeholder="Festival 2026"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="gallery-edit-image">Replace Image (optional)</Label>
                                <Input
                                    id="gallery-edit-image"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setEditFile(e.target.files?.[0] || null)}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Leave this empty if you only want to rename the photo.
                                </p>
                            </div>
                            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2">
                                <Button
                                    className="w-full sm:w-auto"
                                    variant="outline"
                                    onClick={resetEditState}
                                    disabled={savingPhoto}
                                >
                                    Cancel
                                </Button>
                                <Button className="w-full sm:w-auto" onClick={handleEditSave} disabled={savingPhoto}>
                                    {savingPhoto ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            <Modal
                isOpen={Boolean(isAdmin && photoPendingDelete)}
                onClose={() => {
                    if (!deletingPhotoId) setPhotoPendingDelete(null);
                }}
                onConfirm={handleDelete}
                title="Delete Gallery Photo"
                description="This will remove the image from the gallery and permanently delete the file from Cloudinary."
                confirmText="Delete Photo"
                cancelText="Cancel"
                variant="destructive"
                isLoading={Boolean(deletingPhotoId)}
            />
        </div>
    );
}
