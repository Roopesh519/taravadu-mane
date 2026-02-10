'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import MembersNav from '@/components/protected/MembersNav';
import { Bell, CalendarDays, FolderOpen, ReceiptText, User, Users, Wallet } from 'lucide-react';
import { getDocuments, getRecentAnnouncements, getUpcomingEvents } from '@/lib/firebase/db';
import { Announcement, Event } from '@/lib/types';
import { orderBy, Timestamp, where } from 'firebase/firestore';

function parseDate(value: any): Date | null {
    if (!value) return null;
    if (value instanceof Date) return value;
    if (value.seconds) return new Date(value.seconds * 1000);
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

function formatShortDate(value: any) {
    const date = parseDate(value);
    return date
        ? date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
        : '-';
}

function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(
        amount
    );
}

export default function DashboardPage() {
    const { user } = useAuth();
    const [nextEvent, setNextEvent] = useState<Event | null>(null);
    const [recentAnnouncement, setRecentAnnouncement] = useState<Announcement | null>(null);
    const [pendingContributionTotal, setPendingContributionTotal] = useState<number | null>(null);
    const [expenseMonthTotal, setExpenseMonthTotal] = useState<number | null>(null);
    const [stats, setStats] = useState({ members: 0, upcomingEvents: 0, documents: 0 });
    const [loading, setLoading] = useState(true);

    const currentYear = useMemo(() => new Date().getFullYear(), []);

    useEffect(() => {
        if (!user?.id) return;

        const fetchDashboard = async () => {
            setLoading(true);

            const [
                announcementsData,
                upcomingData,
                pendingContributions,
                monthlyExpenses,
                usersData,
                upcomingEventsAll,
                documentsData,
            ] = await Promise.all([
                getRecentAnnouncements(1),
                getUpcomingEvents(1),
                getDocuments('contributions', [
                    where('user_id', '==', user.id),
                    where('year', '==', currentYear),
                    where('status', '==', 'pending'),
                ]),
                (() => {
                    const now = new Date();
                    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
                    return getDocuments('expenses', [
                        where('expense_date', '>=', Timestamp.fromDate(startOfMonth)),
                        where('expense_date', '<=', Timestamp.fromDate(endOfMonth)),
                        orderBy('expense_date', 'desc'),
                    ]);
                })(),
                getDocuments('users', []),
                getDocuments('events', [
                    where('event_date', '>=', Timestamp.now()),
                    orderBy('event_date', 'asc'),
                ]),
                getDocuments('documents', []),
            ]);

            const pendingTotal = pendingContributions.reduce((sum: number, item: any) => sum + (item.amount || 0), 0);
            const expenseTotal = monthlyExpenses.reduce((sum: number, item: any) => sum + (item.amount || 0), 0);

            const announcements = announcementsData as Announcement[];
            const upcoming = upcomingData as Event[];

            setRecentAnnouncement((announcements[0] || null) as Announcement | null);
            setNextEvent((upcoming[0] || null) as Event | null);
            setPendingContributionTotal(pendingTotal);
            setExpenseMonthTotal(expenseTotal);
            setStats({
                members: usersData.length,
                upcomingEvents: upcomingEventsAll.length,
                documents: documentsData.length,
            });
            setLoading(false);
        };

        fetchDashboard();
    }, [currentYear, user?.id]);

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
                                {loading ? (
                                    <>
                                        <p className="font-semibold mb-1">Loading...</p>
                                        <p className="text-sm text-muted-foreground">Fetching next event</p>
                                    </>
                                ) : nextEvent ? (
                                    <>
                                        <p className="font-semibold mb-1">{nextEvent.title}</p>
                                        <p className="text-sm text-muted-foreground">{formatShortDate(nextEvent.event_date)}</p>
                                    </>
                                ) : (
                                    <>
                                        <p className="font-semibold mb-1">No upcoming events</p>
                                        <p className="text-sm text-muted-foreground">Check back later</p>
                                    </>
                                )}
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
                                <p className="text-3xl font-bold">
                                    {pendingContributionTotal === null ? '—' : formatCurrency(pendingContributionTotal)}
                                </p>
                                <p className="text-sm text-muted-foreground">Year: {currentYear}</p>
                                <Badge variant="warning" className="mt-2">
                                    {pendingContributionTotal && pendingContributionTotal > 0 ? 'Pending' : 'Up to date'}
                                </Badge>
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
                                {loading ? (
                                    <>
                                        <p className="font-semibold mb-1">Loading...</p>
                                        <p className="text-sm text-muted-foreground">Fetching latest update</p>
                                    </>
                                ) : recentAnnouncement ? (
                                    <>
                                        <p className="font-semibold mb-1">{recentAnnouncement.title}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {formatShortDate(recentAnnouncement.created_at)}
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <p className="font-semibold mb-1">No announcements yet</p>
                                        <p className="text-sm text-muted-foreground">Check back later</p>
                                    </>
                                )}
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
                                <p className="text-3xl font-bold">
                                    {expenseMonthTotal === null ? '—' : formatCurrency(expenseMonthTotal)}
                                </p>
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
                                <p className="text-2xl font-bold">{loading ? '--' : stats.members}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Upcoming Events</p>
                                <p className="text-2xl font-bold">{loading ? '--' : stats.upcomingEvents}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Documents</p>
                                <p className="text-2xl font-bold">{loading ? '--' : stats.documents}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
