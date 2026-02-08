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
                            The Taravadu Mane has stood for generations as the heart of our family's
                            spiritual and cultural life. Built by our ancestors, this sacred space has
                            witnessed countless rituals, celebrations, and family gatherings.
                        </p>
                    </section>

                    <section className="bg-primary/5 p-6 rounded-lg border border-primary/20">
                        <h2 className="text-2xl font-bold mb-4">The Family Deity</h2>
                        <p className="text-muted-foreground mb-4">
                            At the center of our Taravadu Mane resides our family deity, who has been
                            worshipped and honored by countless generations. The deity serves as our
                            spiritual guardian and the focal point of our family's religious practices.
                        </p>
                        <p className="text-sm text-muted-foreground italic flex items-start gap-2">
                            <Quote className="h-4 w-4 text-primary" />
                            <span>"Through devotion and unity, we honor our ancestors and bless future generations"</span>
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">Traditional Ceremonies</h2>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-2">
                                <span className="text-primary font-bold">•</span>
                                <span><strong>Annual Pooja:</strong> Celebrated every year with the entire family</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary font-bold">•</span>
                                <span><strong>Festival Celebrations:</strong> Traditional festivals observed with devotion</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary font-bold">•</span>
                                <span><strong>Family Gatherings:</strong> Important life events and ceremonies</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary font-bold">•</span>
                                <span><strong>Sacred Rituals:</strong> Daily and weekly worship practices</span>
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">Preserving Our Legacy</h2>
                        <p className="text-muted-foreground">
                            Each generation has contributed to maintaining and enhancing the Taravadu Mane,
                            ensuring that our traditions continue unbroken. From renovations to daily upkeep,
                            every effort strengthens our connection to our heritage.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
