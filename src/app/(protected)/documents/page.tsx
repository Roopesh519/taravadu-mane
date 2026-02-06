'use client';

import MembersNav from '@/components/protected/MembersNav';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function DocumentsPage() {
    return (
        <>
            <MembersNav />
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-4xl font-bold mb-2">Documents Vault</h1>
                <p className="text-muted-foreground mb-8">
                    Access important family documents and records
                </p>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                        <CardHeader>
                            <div className="text-4xl mb-2">📄</div>
                            <CardTitle className="text-lg">Land Documents</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">0 documents</p>
                        </CardContent>
                    </Card>

                    <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                        <CardHeader>
                            <div className="text-4xl mb-2">🕉️</div>
                            <CardTitle className="text-lg">Temple Documents</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">0 documents</p>
                        </CardContent>
                    </Card>

                    <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                        <CardHeader>
                            <div className="text-4xl mb-2">📝</div>
                            <CardTitle className="text-lg">Meeting Minutes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">0 documents</p>
                        </CardContent>
                    </Card>

                    <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                        <CardHeader>
                            <div className="text-4xl mb-2">📸</div>
                            <CardTitle className="text-lg">Photos Archive</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">0 photos</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
