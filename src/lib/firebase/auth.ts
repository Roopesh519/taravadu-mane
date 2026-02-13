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

function getFriendlyAuthErrorMessage(error: unknown): string {
    const fallback = 'Failed to sign in. Please try again.';

    if (!error || typeof error !== 'object') {
        return fallback;
    }

    const code = 'code' in error && typeof error.code === 'string' ? error.code : '';
    const message =
        'message' in error && typeof error.message === 'string'
            ? error.message
            : '';

    if (
        code === 'auth/invalid-credential' ||
        code === 'auth/invalid-login-credentials' ||
        message.includes('INVALID_LOGIN_CREDENTIALS')
    ) {
        return 'Invalid email or password. Please try again.';
    }

    if (code === 'auth/invalid-email') {
        return 'Please enter a valid email address.';
    }

    if (code === 'auth/user-disabled') {
        return 'This account has been disabled. Please contact an administrator.';
    }

    if (code === 'auth/too-many-requests') {
        return 'Too many failed attempts. Please wait a while and try again.';
    }

    if (code === 'auth/network-request-failed') {
        return 'Network error. Check your internet connection and try again.';
    }

    return fallback;
}

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string): Promise<FirebaseUser> {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error: unknown) {
        throw new Error(getFriendlyAuthErrorMessage(error));
    }
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
