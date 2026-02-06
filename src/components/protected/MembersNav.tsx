'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function MembersNav() {
    const pathname = usePathname();
    const { user, signOut } = useAuth();

    const navItems = [
        { name: 'Dashboard', href: '/dashboard' },
        { name: 'Announcements', href: '/announcements' },
        { name: 'Events', href: '/events' },
        { name: 'Contributions', href: '/contributions' },
        { name: 'Expenses', href: '/expenses' },
        { name: 'Documents', href: '/documents' },
        { name: 'Directory', href: '/directory' },
        { name: 'Profile', href: '/profile' },
    ];

    return (
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/dashboard" className="font-bold text-xl text-primary">
                    🌿 Taravadu Portal
                </Link>

                <div className="hidden lg:flex items-center gap-1">
                    {navItems.map((item) => (
                        <Link key={item.href} href={item.href}>
                            <Button
                                variant={pathname === item.href ? 'secondary' : 'ghost'}
                                size="sm"
                            >
                                {item.name}
                            </Button>
                        </Link>
                    ))}
                </div>

                <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground hidden sm:block">
                        {user?.name}
                    </span>
                    <Button variant="outline" size="sm" onClick={() => signOut()}>
                        Sign Out
                    </Button>
                </div>
            </nav>
        </header>
    );
}
