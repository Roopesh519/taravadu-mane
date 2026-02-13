"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import HideWhenAuthed from '@/components/auth/HideWhenAuthed';
import { getRecentAnnouncements, getUpcomingEvents } from '@/lib/firebase/db';
import { Announcement, Event } from '@/lib/types';
import {
    BookOpen,
    CalendarDays,
    Clock,
    FileText,
    Landmark,
    LockKeyhole,
    Megaphone,
    ShieldCheck,
    Sparkles,
    Star,
    Users,
    Wallet,
} from 'lucide-react';

function parseDate(value: any): Date | null {
    if (!value) return null;
    if (value instanceof Date) return value;
    if (value.seconds) return new Date(value.seconds * 1000);
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value: any) {
    const date = parseDate(value);
    return date ? date.toLocaleString() : '-';
}

function formatEventDate(value: any) {
    const date = parseDate(value);
    if (!date) return { dateLabel: 'Date TBA', timeLabel: 'Time TBA' };
    return {
        dateLabel: date.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        }),
        timeLabel: date.toLocaleTimeString(undefined, {
            hour: 'numeric',
            minute: '2-digit',
        }),
    };
}

function truncate(text: string, maxLength: number) {
    if (text.length <= maxLength) return text;
    return `${text.slice(0, maxLength).trim()}...`;
}

export default function HomePage() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [events, setEvents] = useState<Event[]>([]);
    const [announcementsLoading, setAnnouncementsLoading] = useState(true);
    const [eventsLoading, setEventsLoading] = useState(true);

    useEffect(() => {
        const fetchAnnouncements = async () => {
            setAnnouncementsLoading(true);
            const data = await getRecentAnnouncements(3);
            setAnnouncements(data as Announcement[]);
            setAnnouncementsLoading(false);
        };

        const fetchEvents = async () => {
            setEventsLoading(true);
            const data = await getUpcomingEvents(3);
            setEvents(data as Event[]);
            setEventsLoading(false);
        };

        fetchAnnouncements();
        fetchEvents();
    }, []);

    const upcomingEvent = useMemo(() => events[0] || null, [events]);
    const { dateLabel, timeLabel } = formatEventDate(upcomingEvent?.event_date);

    return (
        <div>
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-24 md:py-40">
                {/* Decorative elements */}
                <div className="absolute top-10 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary/5 rounded-full blur-3xl"></div>

                <div className="container relative mx-auto px-4 text-center">
                    <div className="max-w-4xl mx-auto">
                        <Badge variant="secondary" className="mb-6 text-sm px-4 py-1">
                            <span className="inline-flex items-center gap-2">
                                <Sparkles className="h-4 w-4" />
                                Preserving Our Legacy Since Generations
                            </span>
                        </Badge>
                        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent leading-tight">
                            Taravadu Mane
                            <br />
                            <span className="text-4xl md:text-5xl">Family Portal</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-muted-foreground mb-6 font-medium">
                            Digital home for our Taravadu family
                        </p>
                        <p className="text-base md:text-lg text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
                            Located in Someshwara, Ullala, Karnataka, our Taravadu Mane is the ancestral home of 13+
                            families and 50+ members. We preserve our traditions, strengthen family bonds, and carry
                            our heritage forward together.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <HideWhenAuthed>
                                <Link href="/login">
                                    <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-shadow">
                                        <LockKeyhole className="mr-2 h-5 w-5" />
                                        Member Login →
                                    </Button>
                                </Link>
                            </HideWhenAuthed>
                            <Link href="/about">
                                <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 py-6 border-2">
                                    Learn About Us
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="border-y bg-muted/20 py-12">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                        <div className="text-center">
                            <div className="text-3xl md:text-4xl font-bold text-primary mb-2">50+</div>
                            <div className="text-sm text-muted-foreground">Family Members</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl md:text-4xl font-bold text-secondary mb-2">13+</div>
                            <div className="text-sm text-muted-foreground">Families</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl md:text-4xl font-bold text-accent mb-2">3</div>
                            <div className="text-sm text-muted-foreground">Daivas Worshipped</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl md:text-4xl font-bold text-primary mb-2">12+</div>
                            <div className="text-sm text-muted-foreground">Sankramana Observances / Year</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Upcoming Event Section */}
            <section className="container mx-auto px-4 py-20">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4 flex items-center justify-center gap-2">
                            <Star className="h-6 w-6 text-primary" />
                            Upcoming Event
                        </h2>
                        <p className="text-muted-foreground">Join us in celebrating our family traditions</p>
                    </div>
                    {eventsLoading ? (
                        <Card className="border-2 border-primary/30 shadow-lg">
                            <CardHeader>
                                <CardTitle className="text-2xl">Loading upcoming event...</CardTitle>
                                <CardDescription>Fetching the latest schedule.</CardDescription>
                            </CardHeader>
                        </Card>
                    ) : upcomingEvent ? (
                        <Card className="border-2 border-primary/30 shadow-lg hover:shadow-xl transition-shadow">
                            <CardHeader className="pb-4">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="text-2xl md:text-3xl mb-2">{upcomingEvent.title}</CardTitle>
                                        <CardDescription className="text-base flex flex-wrap items-center gap-2">
                                            <span className="inline-flex items-center gap-2">
                                                <CalendarDays className="h-4 w-4 text-primary" />
                                                {dateLabel}
                                            </span>
                                            <span className="text-muted-foreground">•</span>
                                            <span className="inline-flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-primary" />
                                                {timeLabel}
                                            </span>
                                        </CardDescription>
                                    </div>
                                    <Badge className="text-xs">Upcoming</Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground mb-6 leading-relaxed">
                                    {upcomingEvent.description}
                                </p>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <HideWhenAuthed>
                                        <Link href="/login">
                                            <Button variant="default" className="w-full sm:w-auto">
                                                View Full Calendar →
                                            </Button>
                                        </Link>
                                    </HideWhenAuthed>
                                    <Link href="/events">
                                        <Button variant="outline" className="w-full sm:w-auto">
                                            See All Events
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="border-2 border-primary/30 shadow-lg">
                            <CardHeader>
                                <CardTitle className="text-2xl">No upcoming events yet</CardTitle>
                                <CardDescription>Check back soon for the next family gathering.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <HideWhenAuthed>
                                        <Link href="/login">
                                            <Button variant="default" className="w-full sm:w-auto">
                                                View Full Calendar →
                                            </Button>
                                        </Link>
                                    </HideWhenAuthed>
                                    <Link href="/events">
                                        <Button variant="outline" className="w-full sm:w-auto">
                                            See All Events
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </section>

            {/* Announcements Section */}
            <section className="container mx-auto px-4 pb-20">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4 flex items-center justify-center gap-2">
                            <Megaphone className="h-6 w-6 text-primary" />
                            Latest Announcements
                        </h2>
                        <p className="text-muted-foreground">
                            Important notices and family updates shared by admins
                        </p>
                    </div>
                    {announcementsLoading ? (
                        <Card className="border border-primary/10">
                            <CardHeader>
                                <CardTitle className="text-xl">Loading announcements...</CardTitle>
                                <CardDescription>Fetching the latest updates.</CardDescription>
                            </CardHeader>
                        </Card>
                    ) : announcements.length === 0 ? (
                        <Card className="border border-primary/10">
                            <CardHeader>
                                <CardTitle className="text-xl">No announcements yet</CardTitle>
                                <CardDescription>Admins will post updates here as needed.</CardDescription>
                            </CardHeader>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {announcements.map((announcement) => (
                                <Card key={announcement.id} className="hover:border-primary/40 transition-colors">
                                    <CardHeader>
                                        <CardTitle className="text-lg">{announcement.title}</CardTitle>
                                        <CardDescription>
                                            Published {formatDate(announcement.created_at)}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            {truncate(announcement.content, 160)}
                                        </p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                    <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
                        <HideWhenAuthed>
                            <Link href="/login">
                                <Button variant="outline" className="w-full sm:w-auto">
                                    Member Login to View All →
                                </Button>
                            </Link>
                        </HideWhenAuthed>
                    </div>
                </div>
            </section>

            {/* About Preview Section */}
            <section className="bg-gradient-to-b from-muted/40 to-background py-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4 flex items-center justify-center gap-2">
                                <Landmark className="h-6 w-6 text-primary" />
                                Our Sacred Heritage
                            </h2>
                            <div className="w-20 h-1 bg-gradient-to-r from-primary to-secondary mx-auto mb-6"></div>
                        </div>
                        <p className="text-lg text-muted-foreground text-center mb-8 max-w-2xl mx-auto leading-relaxed">
                            Taravadu Mane in Someshwara, Ullala, Karnataka, is the spiritual center of our extended
                            family. We mainly worship three daivas: Kallurti, Panjurli, and Mantradevate. Every year
                            we conduct our Bhootha celebration, and every month we observe Sankramana with devotion to
                            seek blessings and uphold our ancestral traditions.
                        </p>
                        <div className="text-center">
                            <Link href="/history">
                                <Button variant="outline" size="lg" className="border-2">
                                    <BookOpen className="mr-2 h-5 w-5" />
                                    Read Our Full History →
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="container mx-auto px-4 py-20">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 flex items-center justify-center gap-2">
                        <Sparkles className="h-6 w-6 text-primary" />
                        Portal Features
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Everything you need to stay connected with family and manage our ancestral home
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    <Card className="hover:border-primary/50 transition-colors hover:shadow-lg">
                        <CardHeader>
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                                <Megaphone className="h-6 w-6 text-primary" />
                            </div>
                            <CardTitle className="text-xl">Announcements</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Stay updated with family news, upcoming events, and important notices shared by admins.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="hover:border-secondary/50 transition-colors hover:shadow-lg">
                        <CardHeader>
                            <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                                <Wallet className="h-6 w-6 text-secondary" />
                            </div>
                            <CardTitle className="text-xl">Financial Transparency</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Track contributions and expenses with complete transparency. Every rupee accounted for.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="hover:border-accent/50 transition-colors hover:shadow-lg">
                        <CardHeader>
                            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                                <FileText className="h-6 w-6 text-accent" />
                            </div>
                            <CardTitle className="text-xl">Secure Documents</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Access important family documents, land records, and cherished photos in one secure place.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="hover:border-primary/50 transition-colors hover:shadow-lg">
                        <CardHeader>
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                                <CalendarDays className="h-6 w-6 text-primary" />
                            </div>
                            <CardTitle className="text-xl">Events Calendar</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Never miss a pooja, celebration, or family gathering with our centralized event calendar.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="hover:border-secondary/50 transition-colors hover:shadow-lg">
                        <CardHeader>
                            <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                                <Users className="h-6 w-6 text-secondary" />
                            </div>
                            <CardTitle className="text-xl">Family Directory</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Connect with family members across generations with our comprehensive directory.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="hover:border-accent/50 transition-colors hover:shadow-lg">
                        <CardHeader>
                            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                                <ShieldCheck className="h-6 w-6 text-accent" />
                            </div>
                            <CardTitle className="text-xl">Secure & Private</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Members-only access with role-based permissions ensuring family privacy and security.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* Call to Action */}
            <section className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 py-16">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Connect?</h2>
                    <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                        Join your family members on the portal and be part of our digital home
                    </p>
                    <HideWhenAuthed>
                        <Link href="/login">
                            <Button size="lg" className="px-10 py-6 text-lg shadow-lg">
                                Access Member Portal →
                            </Button>
                        </Link>
                    </HideWhenAuthed>
                </div>
            </section>
        </div>
    );
}
