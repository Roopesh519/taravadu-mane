'use client';

import MembersNav from '@/components/protected/MembersNav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ExpensesPage() {
    return (
        <>
            <MembersNav />
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-4xl font-bold mb-2">Expenses</h1>
                <p className="text-muted-foreground mb-8">
                    Transparent tracking of Taravadu Mane expenses
                </p>

                <Card>
                    <CardHeader>
                        <CardTitle>Expense Records</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-muted/40 border border-dashed rounded-lg p-8 text-center">
                            <p className="text-muted-foreground">
                                No expense records available yet. Admins will update financial data.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
