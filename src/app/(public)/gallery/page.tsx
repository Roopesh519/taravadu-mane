'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/components/auth/AuthProvider';
import { auth } from '@/lib/firebase/config';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GalleryPhoto } from '@/lib/types';

export default function GalleryPage() {
    const { hasRole } = useAuth();
    const isAdmin = hasRole('admin');

    const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [title, setTitle] = useState('');
    const [files, setFiles] = useState<File[]>([]);

    const fetchPhotos = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/gallery', { cache: 'no-store' });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Failed to fetch gallery photos.');
            }
            setPhotos(data.photos || []);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch gallery photos.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPhotos();
    }, []);

    const handleUpload = async () => {
        if (!files.length) {
            setError('Please select one or more images.');
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
                throw new Error(data.error || 'Failed to upload images.');
            }

            setTitle('');
            setFiles([]);
            const input = document.getElementById('gallery-images') as HTMLInputElement | null;
            if (input) input.value = '';
            await fetchPhotos();
        } catch (err: any) {
            setError(err.message || 'Failed to upload images.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-start justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-4xl font-bold mb-2">Photo Gallery</h1>
                        <p className="text-muted-foreground max-w-2xl">
                            Memories from our Taravadu Mane: rituals, celebrations, and family moments.
                        </p>
                    </div>
                    <Button variant="outline" onClick={fetchPhotos} disabled={loading || uploading}>
                        Refresh
                    </Button>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                        <p className="text-sm text-destructive">{error}</p>
                    </div>
                )}

                {isAdmin && (
                    <Card className="mb-8">
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
                            <Button onClick={handleUpload} disabled={uploading || !files.length}>
                                {uploading ? 'Uploading...' : 'Upload Photos'}
                            </Button>
                        </CardContent>
                    </Card>
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
                                <CardContent className="py-3">
                                    <p className="text-sm font-medium truncate">{photo.title || 'Untitled'}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
