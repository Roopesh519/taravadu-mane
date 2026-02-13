import { Quote } from 'lucide-react';

export default function HistoryPage() {
    return (
        <div className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold mb-6">History & Deity</h1>

                <div className="prose prose-lg max-w-none space-y-6">
                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-primary">Our Ancestral Home</h2>
                        <p className="text-muted-foreground">
                            Taravadu Mane in Someshwara, Ullala, Karnataka, India, has stood for
                            generations as the heart of our family's spiritual and cultural life.
                            It is the ancestral home of 13+ families and 50+ members.
                        </p>
                    </section>

                    <section className="bg-primary/5 p-6 rounded-lg border border-primary/20">
                        <h2 className="text-2xl font-bold mb-4">Our Daivas</h2>
                        <p className="text-muted-foreground mb-4">
                            Our family mainly worships three daivas: Kallurti, Panjurli, and
                            Mantradevate. Their worship has remained central to our family identity,
                            devotion, and continuity across generations.
                        </p>
                        <p className="text-sm text-muted-foreground italic flex items-start gap-2">
                            <Quote className="h-4 w-4 text-primary" />
                            <span>"Through devotion and unity, we honor our ancestors and bless future generations."</span>
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">Traditional Ceremonies</h2>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-2">
                                <span className="text-primary font-bold">•</span>
                                <span><strong>Annual Bhootha Celebration:</strong> A major yearly observance where the family serves the deities, prays, and seeks blessings.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary font-bold">•</span>
                                <span><strong>Monthly Sankramana:</strong> A regular monthly observance where family members gather for prayer and offerings.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary font-bold">•</span>
                                <span><strong>Family Gatherings:</strong> Key ceremonies and life events observed with shared responsibility.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary font-bold">•</span>
                                <span><strong>Sacred Worship:</strong> Devotional practices that keep our traditions active across generations.</span>
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">Preserving Our Legacy</h2>
                        <p className="text-muted-foreground">
                            Each generation contributes to maintaining Taravadu Mane and preserving our
                            shared heritage. Through collective effort, we continue our observances with
                            devotion and pass these traditions on to future generations.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
