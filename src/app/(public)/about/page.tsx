import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AboutPage() {
    return (
        <div className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold mb-6">About Taravadu Mane</h1>

                <div className="prose prose-lg max-w-none">
                    <p className="text-xl text-muted-foreground mb-8">
                        The Taravadu Mane is the ancestral home and spiritual center of our family,
                        representing generations of tradition, culture, and togetherness.
                    </p>

                    <div className="grid md:grid-cols-2 gap-6 my-12">
                        <Card>
                            <CardHeader>
                                <CardTitle>Our Purpose</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">
                                    The Taravadu Mane serves as a sacred space for family rituals, festivals,
                                    and gatherings. It houses our family deity and connects us to our ancestral roots.
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Community Spirit</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">
                                    Through collective participation and contribution, we maintain this sacred
                                    space for future generations, ensuring our traditions continue to thrive.
                                </p>
                            </CardContent>
                        </Card>
                    </div>

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
                        This family portal was created to modernize how we manage our Taravadu Mane
                        while preserving our traditions. It provides a transparent, accessible platform
                        for all family members to stay connected and participate in our community.
                    </p>
                </div>
            </div>
        </div>
    );
}
