import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AboutPage() {
    return (
        <div className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold mb-6">About Taravadu Mane</h1>

                <div className="prose prose-lg max-w-none">
                    <p className="text-xl text-muted-foreground mb-8">
                        Taravadu Mane, located in Someshwara, Ullala, Karnataka, India, is the ancestral
                        home and spiritual center of our extended family. It is home to 13+ families and
                        50+ members connected through shared faith, culture, and tradition.
                    </p>

                    <div className="grid md:grid-cols-2 gap-6 my-12">
                        <Card>
                            <CardHeader>
                                <CardTitle>Our Purpose</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">
                                    Taravadu Mane is a sacred space for rituals, festivals, and family
                                    gatherings. We mainly worship three daivas: Kallurti, Panjurli, and
                                    Mantradevate, and seek their blessings for the well-being of all members.
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Community Spirit</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">
                                    Through collective participation and contribution, all branches of the
                                    family maintain this sacred home for future generations and keep our
                                    ancestral customs alive.
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <h2 className="text-2xl font-bold mt-12 mb-4">Sacred Observances</h2>
                    <ul className="space-y-3">
                        <li className="flex items-start gap-2">
                            <span className="text-primary">•</span>
                            <span><strong>Annual Bhootha Celebration:</strong> A major yearly observance where we serve the deities, pray, and seek blessings.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-primary">•</span>
                            <span><strong>Monthly Sankramana:</strong> A regular devotional event where family members gather for prayer and offerings.</span>
                        </li>
                    </ul>

                    <h2 className="text-2xl font-bold mt-12 mb-4">Our Values</h2>
                    <ul className="space-y-3">
                        <li className="flex items-start gap-2">
                            <span className="text-primary">•</span>
                            <span><strong>Tradition:</strong> Honoring our ancestral customs and rituals</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-primary">•</span>
                            <span><strong>Unity:</strong> Bringing family members together across generations</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-primary">•</span>
                            <span><strong>Transparency:</strong> Managing contributions and expenses openly</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-primary">•</span>
                            <span><strong>Preservation:</strong> Maintaining our heritage for future generations</span>
                        </li>
                    </ul>

                    <h2 className="text-2xl font-bold mt-12 mb-4">Digital Portal</h2>
                    <p>
                        This family portal helps us coordinate events, share updates, and manage Taravadu
                        activities while preserving tradition. It provides an accessible platform for all
                        family members to stay informed and connected.
                    </p>
                </div>
            </div>
        </div>
    );
}
