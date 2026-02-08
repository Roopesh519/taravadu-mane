'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { User, AuthContextType } from '@/lib/types';
import {
    signIn as firebaseSignIn,
    signOut as firebaseSignOut,
    onAuthChange,
    getUserData,
    hasRole as checkRole,
    hasAnyRole as checkAnyRole,
} from '@/lib/firebase/auth';
import { auth } from '@/lib/firebase/config';

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    signIn: async () => { },
    signOut: async () => { },
    hasRole: () => false,
    hasAnyRole: () => false,
    refreshUser: async () => { },
});

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthChange(async (firebaseUser: FirebaseUser | null) => {
            if (firebaseUser) {
                // Fetch full user data from Firestore
                const userData = await getUserData(firebaseUser.uid);
                setUser(userData);
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signIn = async (email: string, password: string) => {
        try {
            await firebaseSignIn(email, password);
            // User state will be updated in the onAuthChange listener
        } catch (error: any) {
            throw new Error(error.message || 'Failed to sign in');
        }
    };

    const signOut = async () => {
        try {
            await firebaseSignOut();
        } catch (error: any) {
            throw new Error(error.message || 'Failed to sign out');
        }
    };

    const hasRole = (role: string) => {
        return checkRole(user, role);
    };

    const hasAnyRole = (roles: string[]) => {
        return checkAnyRole(user, roles);
    };

    const refreshUser = async () => {
        const uid = auth.currentUser?.uid;
        if (!uid) return;
        const currentUser = await getUserData(uid);
        setUser(currentUser);
    };

    const value = {
        user,
        loading,
        signIn,
        signOut,
        hasRole,
        hasAnyRole,
        refreshUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
