import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import HideWhenAuthed from '@/components/auth/HideWhenAuthed';

export default function ContactPage() {
    return (
        <div className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold mb-6 text-center">Contact Us</h1>
                <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
                    Get in touch with the Taravadu Mane family committee
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-primary" />
                                Location
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">
                                Taravadu Village<br />
                                District, State<br />
                                PIN Code
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Mail className="h-5 w-5 text-primary" />
                                Email
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">
                                contact@taravadumane.family<br />
                                admin@taravadumane.family
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Phone className="h-5 w-5 text-primary" />
                                Phone
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">
                                +91 XXXXX XXXXX<br />
                                +91 XXXXX XXXXX
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5 text-primary" />
                                Committee Hours
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">
                                Available for queries:<br />
                                Saturday & Sunday<br />
                                10:00 AM - 5:00 PM
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Card className="mt-8 border-primary/20">
                    <CardHeader>
                        <CardTitle>For Family Members</CardTitle>
                        <CardDescription>Already a registered member?</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-4">
                            Access more features and connect with family by logging into the member portal.
                        </p>
                        <HideWhenAuthed>
                            <a
                                href="/login"
                                className="text-primary hover:underline font-medium"
                            >
                                Login to Member Portal →
                            </a>
                        </HideWhenAuthed>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
