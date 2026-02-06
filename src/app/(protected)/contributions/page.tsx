'use client';

import MembersNav from '@/components/protected/MembersNav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function ContributionsPage() {
    return (
        <>
            <MembersNav />
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-4xl font-bold mb-2">Contributions</h1>
                <p className="text-muted-foreground mb-8">
                    Track yearly contributions for Taravadu Mane maintenance
                </p>

                <Card>
                    <CardHeader>
                        <CardTitle>Contribution History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-muted/40 border border-dashed rounded-lg p-8 text-center">
                            <p className="text-muted-foreground">
                                No contribution records available yet. Admins will update this section.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
