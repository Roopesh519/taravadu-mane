'use client';

import { useAuth } from './AuthProvider';

interface RoleGuardProps {
    children: React.ReactNode;
    allowedRoles: string[];
    fallback?: React.ReactNode;
}

export default function RoleGuard({ children, allowedRoles, fallback }: RoleGuardProps) {
    const { user, hasAnyRole } = useAuth();

    if (!user || !hasAnyRole(allowedRoles)) {
        return fallback || (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-destructive font-medium">Access Denied</p>
                <p className="text-sm text-muted-foreground">
                    You don't have permission to view this content.
                </p>
            </div>
        );
    }

    return <>{children}</>;
}
