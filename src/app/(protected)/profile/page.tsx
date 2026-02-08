'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import MembersNav from '@/components/protected/MembersNav';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb } from 'lucide-react';

export default function ProfilePage() {
    const { user } = useAuth();

    return (
        <>
            <MembersNav />
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-4xl font-bold mb-2">My Profile</h1>
                <p className="text-muted-foreground mb-8">
                    View and manage your personal information
                </p>

                <div className="max-w-2xl">
                    <Card>
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                            <CardDescription>Your family portal account details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Name</p>
                                <p className="text-lg">{user?.name || 'Not set'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Email</p>
                                <p className="text-lg">{user?.email || 'Not set'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Phone</p>
                                <p className="text-lg">{user?.phone || 'Not set'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Family Branch</p>
                                <p className="text-lg">{user?.family_branch || 'Not set'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">City</p>
                                <p className="text-lg">{user?.city || 'Not set'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-2">Roles</p>
                                <div className="flex gap-2">
                                    {user?.roles && user.roles.length > 0 ? (
                                        user.roles.map((role) => (
                                            <Badge key={role} variant="secondary">
                                                {role}
                                            </Badge>
                                        ))
                                    ) : (
                                        <p className="text-sm text-muted-foreground">No roles assigned</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="mt-6 p-4 bg-muted/40 rounded-lg border">
                        <p className="text-sm text-muted-foreground flex items-start gap-2">
                            <Lightbulb className="h-4 w-4 text-primary mt-0.5" />
                            <span><strong>Note:</strong> To update your profile information, please contact an admin.</span>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
