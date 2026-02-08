'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import MembersNav from '@/components/protected/MembersNav';
import { Bell, CalendarDays, FolderOpen, ReceiptText, User, Users, Wallet } from 'lucide-react';

export default function DashboardPage() {
    const { user } = useAuth();

    return (
        <>
            <MembersNav />
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">
                        Namaskara, {user?.name}
                    </h1>
                    <p className="text-muted-foreground">
                        Welcome to the Taravadu Mane Family Portal
                    </p>
                    {user?.roles && user.roles.length > 0 && (
                        <div className="mt-2 flex gap-2">
                            {user.roles.map((role) => (
                                <Badge key={role} variant="secondary">
                                    {role}
                                </Badge>
                            ))}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Next Event Card */}
                    <Link href="/events">
                        <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <CalendarDays className="h-5 w-5 text-primary" />
                                    Next Event
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="font-semibold mb-1">Annual Family Pooja</p>
                                <p className="text-sm text-muted-foreground">March 15, 2026</p>
                                <p className="text-xs text-muted-foreground mt-2">Click to view calendar</p>
                            </CardContent>
                        </Card>
                    </Link>

                    {/* Pending Contributions Card */}
                    <Link href="/contributions">
                        <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Wallet className="h-5 w-5 text-secondary" />
                                    Pending Contributions
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold">₹0</p>
                                <p className="text-sm text-muted-foreground">Year: 2026</p>
                                <Badge variant="warning" className="mt-2">Pending</Badge>
                            </CardContent>
                        </Card>
                    </Link>

                    {/* Recent Announcements Card */}
                    <Link href="/announcements">
                        <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Bell className="h-5 w-5 text-primary" />
                                    Recent Announcements
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="font-semibold mb-1">No announcements yet</p>
                                <p className="text-sm text-muted-foreground">Check back later</p>
                                <p className="text-xs text-muted-foreground mt-2">Click to view all</p>
                            </CardContent>
                        </Card>
                    </Link>

                    {/* Latest Expense Summary Card */}
                    <Link href="/expenses">
                        <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <ReceiptText className="h-5 w-5 text-accent" />
                                    Expense Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold">₹0</p>
                                <p className="text-sm text-muted-foreground">This month</p>
                                <p className="text-xs text-muted-foreground mt-2">Click for details</p>
                            </CardContent>
                        </Card>
                    </Link>
                </div>

                <div className="mt-12 grid md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                            <CardDescription>Common tasks</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Link href="/profile" className="block p-3 rounded-md hover:bg-muted transition-colors">
                                <p className="font-medium flex items-center gap-2">
                                    <User className="h-4 w-4 text-primary" />
                                    Update Profile
                                </p>
                                <p className="text-sm text-muted-foreground">Edit your personal information</p>
                            </Link>
                            <Link href="/documents" className="block p-3 rounded-md hover:bg-muted transition-colors">
                                <p className="font-medium flex items-center gap-2">
                                    <FolderOpen className="h-4 w-4 text-primary" />
                                    View Documents
                                </p>
                                <p className="text-sm text-muted-foreground">Access family documents</p>
                            </Link>
                            <Link href="/directory" className="block p-3 rounded-md hover:bg-muted transition-colors">
                                <p className="font-medium flex items-center gap-2">
                                    <Users className="h-4 w-4 text-primary" />
                                    Family Directory
                                </p>
                                <p className="text-sm text-muted-foreground">View member contacts</p>
                            </Link>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Portal Statistics</CardTitle>
                            <CardDescription>Community overview</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Total Members</p>
                                <p className="text-2xl font-bold">--</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Upcoming Events</p>
                                <p className="text-2xl font-bold">1</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Documents</p>
                                <p className="text-2xl font-bold">--</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
