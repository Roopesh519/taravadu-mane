'use client';

import MembersNav from '@/components/protected/MembersNav';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function EventsPage() {
    return (
        <>
            <MembersNav />
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-4xl font-bold mb-2">Events</h1>
                <p className="text-muted-foreground mb-8">
                    Family celebrations, rituals, and gatherings
                </p>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card className="border-primary/20">
                        <CardHeader>
                            <Badge className="w-fit mb-2">Upcoming</Badge>
                            <CardTitle>Annual Family Pooja</CardTitle>
                            <CardDescription>March 15, 2026 • 10:00 AM</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Join us for our annual family pooja celebrating the deity of our Taravadu Mane.
                                All family members are invited.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="opacity-75">
                        <CardHeader>
                            <Badge variant="secondary" className="w-fit mb-2">Past Event</Badge>
                            <CardTitle>Diwali Celebration 2025</CardTitle>
                            <CardDescription>November 1, 2025</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Family Diwali celebration with traditional rituals and feast.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
