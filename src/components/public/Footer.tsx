import { Mail, MapPin, Phone } from 'lucide-react';
import Image from 'next/image';
import templeLogo from '@/app/temple.png';

export default function Footer() {
    return (
        <footer className="border-t bg-muted/40 mt-auto">
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <Image
                                src={templeLogo}
                                alt="Taravadu Mane logo"
                                width={32}
                                height={32}
                                className="h-8 w-8 rounded-sm object-cover"
                            />
                            <h3 className="font-semibold text-lg text-primary">Taravadu Mane</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Digital home for our Taravadu family, preserving traditions and connecting generations.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-3">Quick Links</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="/about" className="text-muted-foreground hover:text-primary transition-colors">About</a></li>
                            <li><a href="/history" className="text-muted-foreground hover:text-primary transition-colors">History</a></li>
                            <li><a href="/gallery" className="text-muted-foreground hover:text-primary transition-colors">Gallery</a></li>
                            <li><a href="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-3">Contact</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-primary" />
                                <span>Location: Taravadu Village</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-primary" />
                                <span>Email: contact@taravadumane.family</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-primary" />
                                <span>Phone: +91 XXXXX XXXXX</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t mt-8 pt-6 text-center text-sm text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} Taravadu Mane. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
