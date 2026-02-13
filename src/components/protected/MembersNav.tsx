'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';
import templeLogo from '@/app/temple.png';

export default function MembersNav() {
    const pathname = usePathname();
    const { user, signOut, hasRole } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);

    const navItems = [
        { name: 'Dashboard', href: '/dashboard' },
        { name: 'Announcements', href: '/announcements' },
        { name: 'Events', href: '/events' },
        { name: 'Contributions', href: '/contributions' },
        { name: 'Expenses', href: '/expenses' },
        { name: 'Documents', href: '/documents' },
        { name: 'Directory', href: '/directory' },
        { name: 'Profile', href: '/profile' },
        { name: 'Access Requests', href: '/admin/access-requests', adminOnly: true },
    ];

    return (
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="font-bold text-xl text-primary flex items-center gap-2">
                    <Image
                        src={templeLogo}
                        alt="Taravadu Mane logo"
                        width={32}
                        height={32}
                        className="h-8 w-8 rounded-sm object-cover"
                        priority
                    />
                    Taravadu Portal
                </Link>

                <div className="hidden lg:flex items-center gap-1">
                    {navItems
                        .filter((item) => !item.adminOnly || hasRole('admin'))
                        .map((item) => (
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

                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground hidden sm:block">
                        {user?.name}
                    </span>
                    <Button variant="outline" size="sm" onClick={() => signOut()}>
                        Sign Out
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden"
                        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                        onClick={() => setMobileOpen((open) => !open)}
                    >
                        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </Button>
                </div>
            </nav>

            {mobileOpen && (
                <div className="lg:hidden border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="container mx-auto px-4 py-4 flex flex-col gap-2">
                        {navItems
                            .filter((item) => !item.adminOnly || hasRole('admin'))
                            .map((item) => (
                                <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>
                                    <Button
                                        variant={pathname === item.href ? 'secondary' : 'ghost'}
                                        size="sm"
                                        className="w-full justify-start"
                                    >
                                        {item.name}
                                    </Button>
                                </Link>
                            ))}
                    </div>
                </div>
            )}
        </header>
    );
}
