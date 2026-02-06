'use client';

import MembersNav from '@/components/protected/MembersNav';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AnnouncementsPage() {
    return (
        <>
            <MembersNav />
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-4xl font-bold mb-2">Announcements</h1>
                <p className="text-muted-foreground mb-8">
                    Stay updated with family news and important notices
                </p>

                <div className="bg-muted/40 border-2 border-dashed rounded-lg p-12 text-center">
                    <div className="max-w-md mx-auto">
                        <svg className="mx-auto h-12 w-12 text-muted-foreground mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                        </svg>
                        <h3 className="text-lg font-semibold mb-2">No Announcements Yet</h3>
                        <p className="text-sm text-muted-foreground">
                            Announcements from admins will appear here. Check back later!
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
