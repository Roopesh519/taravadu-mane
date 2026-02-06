'use client';

import MembersNav from '@/components/protected/MembersNav';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function DirectoryPage() {
    return (
        <>
            <MembersNav />
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-4xl font-bold mb-2">Family Directory</h1>
                <p className="text-muted-foreground mb-8">
                    Connect with family members
                </p>

                <div className="bg-muted/40 border-2 border-dashed rounded-lg p-12 text-center">
                    <div className="max-w-md mx-auto">
                        <svg className="mx-auto h-12 w-12 text-muted-foreground mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <h3 className="text-lg font-semibold mb-2">Directory Coming Soon</h3>
                        <p className="text-sm text-muted-foreground">
                            Family member profiles and contact information will be available here.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
