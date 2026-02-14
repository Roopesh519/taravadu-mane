'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';
import templeLogo from '@/app/temple.png';

export default function PublicHeader() {
    const { user, signOut } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [signOutModalOpen, setSignOutModalOpen] = useState(false);
    const [isSigningOut, setIsSigningOut] = useState(false);

    const handleSignOut = async () => {
        setIsSigningOut(true);
        try {
            await signOut();
            setSignOutModalOpen(false);
        } finally {
            setIsSigningOut(false);
        }
    };

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
                    Taravadu Mane
                </Link>

                <div className="hidden md:flex items-center gap-6">
                    <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
                        Home
                    </Link>
                    <Link href="/about" className="text-sm font-medium hover:text-primary transition-colors">
                        About
                    </Link>
                    <Link href="/history" className="text-sm font-medium hover:text-primary transition-colors">
                        History
                    </Link>
                    <Link href="/gallery" className="text-sm font-medium hover:text-primary transition-colors">
                        Gallery
                    </Link>
                    <Link href="/contact" className="text-sm font-medium hover:text-primary transition-colors">
                        Contact
                    </Link>
                </div>

                <div className="flex items-center gap-2">
                    {user ? (
                        <div className="flex items-center gap-4">
                            <Link href="/dashboard">
                                <Button variant="outline" size="sm" className="hidden md:inline-flex">Dashboard</Button>
                            </Link>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="hidden md:inline-flex"
                                onClick={() => setSignOutModalOpen(true)}
                            >
                                Sign Out
                            </Button>
                        </div>
                    ) : (
                        <Link href="/login">
                            <Button size="sm">Member Login</Button>
                        </Link>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden"
                        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                        onClick={() => setMobileOpen((open) => !open)}
                    >
                        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </Button>
                </div>
            </nav>

            {mobileOpen && (
                <div className="md:hidden border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="container mx-auto px-4 py-4 flex flex-col gap-3">
                        <Link
                            href="/"
                            className="text-sm font-medium hover:text-primary transition-colors"
                            onClick={() => setMobileOpen(false)}
                        >
                            Home
                        </Link>
                        <Link
                            href="/about"
                            className="text-sm font-medium hover:text-primary transition-colors"
                            onClick={() => setMobileOpen(false)}
                        >
                            About
                        </Link>
                        <Link
                            href="/history"
                            className="text-sm font-medium hover:text-primary transition-colors"
                            onClick={() => setMobileOpen(false)}
                        >
                            History
                        </Link>
                        <Link
                            href="/gallery"
                            className="text-sm font-medium hover:text-primary transition-colors"
                            onClick={() => setMobileOpen(false)}
                        >
                            Gallery
                        </Link>
                        <Link
                            href="/contact"
                            className="text-sm font-medium hover:text-primary transition-colors"
                            onClick={() => setMobileOpen(false)}
                        >
                            Contact
                        </Link>
                        {user && (
                            <>
                                <div className="my-1 border-t border-border/60" />
                                <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
                                    <Button variant="outline" size="sm" className="w-full justify-start">
                                        Dashboard
                                    </Button>
                                </Link>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    className="w-full justify-start"
                                    onClick={() => {
                                        setSignOutModalOpen(true);
                                    }}
                                >
                                    Sign Out
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            )}

            <Modal
                isOpen={signOutModalOpen}
                onClose={() => setSignOutModalOpen(false)}
                onConfirm={handleSignOut}
                title="Sign Out"
                description="Are you sure you want to sign out? You will be logged out from your account."
                confirmText="Sign Out"
                cancelText="Cancel"
                variant="destructive"
                isLoading={isSigningOut}
            />
        </header>
    );
}
