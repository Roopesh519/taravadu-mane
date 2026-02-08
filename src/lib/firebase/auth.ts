import {
    signInWithEmailAndPassword,
    signOut as firebaseSignOut,
    sendPasswordResetEmail,
    onAuthStateChanged,
    updatePassword,
    User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './config';
import { User } from '@/lib/types';

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string): Promise<FirebaseUser> {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<void> {
    await firebaseSignOut(auth);
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email);
}

/**
 * Update current user password
 */
export async function changePassword(newPassword: string): Promise<void> {
    if (!auth.currentUser) {
        throw new Error('No authenticated user.');
    }
    await updatePassword(auth.currentUser, newPassword);
}

/**
 * Get user data from Firestore
 */
export async function getUserData(uid: string): Promise<User | null> {
    try {
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (userDoc.exists()) {
            const data = userDoc.data();
            return {
                id: userDoc.id,
                name: data.name,
                email: data.email,
                phone: data.phone,
                roles: data.roles || ['member'],
                family_branch: data.family_branch,
                city: data.city,
                photo_url: data.photo_url,
                must_change_password: data.must_change_password || false,
                created_at: data.created_at?.toDate(),
            } as User;
        }
        return null;
    } catch (error) {
        console.error('Error fetching user data:', error);
        return null;
    }
}

/**
 * Check if user has a specific role
 */
export function hasRole(user: User | null, role: string): boolean {
    return user?.roles.includes(role) || false;
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(user: User | null, roles: string[]): boolean {
    if (!user) return false;
    return roles.some(role => user.roles.includes(role));
}

/**
 * Listen to auth state changes
 */
export function onAuthChange(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, callback);
}
