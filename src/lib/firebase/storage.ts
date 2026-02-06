import {
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject,
    UploadMetadata
} from 'firebase/storage';
import { storage } from './config';

/**
 * Upload a file to Firebase Storage
 * NOTE: In production, use API routes for better security and validation
 */
export async function uploadFile(
    file: File,
    path: string,
    metadata?: UploadMetadata
): Promise<string | null> {
    try {
        const storageRef = ref(storage, path);
        const snapshot = await uploadBytes(storageRef, file, metadata);
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
    } catch (error) {
        console.error('Error uploading file:', error);
        return null;
    }
}

/**
 * Delete a file from Firebase Storage
 */
export async function deleteFile(path: string): Promise<boolean> {
    try {
        const storageRef = ref(storage, path);
        await deleteObject(storageRef);
        return true;
    } catch (error) {
        console.error('Error deleting file:', error);
        return false;
    }
}

/**
 * Get file download URL
 */
export async function getFileURL(path: string): Promise<string | null> {
    try {
        const storageRef = ref(storage, path);
        const url = await getDownloadURL(storageRef);
        return url;
    } catch (error) {
        console.error('Error getting file URL:', error);
        return null;
    }
}

/**
 * Generate a unique file path
 */
export function generateFilePath(
    folder: string,
    userId: string,
    filename: string
): string {
    const timestamp = Date.now();
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    return `${folder}/${userId}/${timestamp}_${sanitizedFilename}`;
}
