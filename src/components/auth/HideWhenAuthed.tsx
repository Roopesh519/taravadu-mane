'use client';

import { useAuth } from './AuthProvider';

export default function HideWhenAuthed({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();

    if (loading || user) {
        return null;
    }

    return <>{children}</>;
}
