'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, Eye, EyeOff } from 'lucide-react';

const ADMIN_WHATSAPP_NUMBER = '918495824810';
const ADMIN_WHATSAPP_TEXT = encodeURIComponent(
    'Namaskara Admin, I need help with access to the Taravadu Mane Family Portal.'
);
const ADMIN_WHATSAPP_URL = `https://wa.me/${ADMIN_WHATSAPP_NUMBER}?text=${ADMIN_WHATSAPP_TEXT}`;

export default function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [requestName, setRequestName] = useState('');
    const [requestEmail, setRequestEmail] = useState('');
    const [requestError, setRequestError] = useState('');
    const [requestSuccess, setRequestSuccess] = useState('');
    const [requestLoading, setRequestLoading] = useState(false);
    const { signIn } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await signIn(email, password);
            router.push('/dashboard');
        } catch (err: any) {
            const message = err.message || 'Failed to sign in. Please check your credentials.';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const handleRequestAccess = async (e: React.FormEvent) => {
        e.preventDefault();
        setRequestError('');
        setRequestSuccess('');
        setRequestLoading(true);

        try {
            const res = await fetch('/api/access-requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: requestName, email: requestEmail }),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Failed to submit request.');
            }

            setRequestSuccess('Request submitted. An admin will review your access soon.');
            setRequestName('');
            setRequestEmail('');
        } catch (err: any) {
            setRequestError(err.message || 'Failed to submit request.');
        } finally {
            setRequestLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-md shadow-sm m-2">
            <CardHeader className="space-y-1 pb-4">
                <CardTitle className="text-2xl text-center tracking-tight">Member Login</CardTitle>
                <CardDescription className="text-center">
                    Enter your credentials to access the family portal
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4 pb-5">
                    {error && (
                        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                            <p className="text-sm text-destructive">{error}</p>
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="your.email@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="email"
                            required
                            disabled={loading}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="current-password"
                                required
                                disabled={loading}
                                className="pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={loading}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                            >
                                {showPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-2 pt-0">
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </Button>
                    <button
                        type="button"
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                        onClick={() => {
                            // TODO: Implement forgot password
                            alert('Please contact an admin to reset your password.');
                        }}
                    >
                        Forgot password?
                    </button>
                </CardFooter>
            </form>

            <div className="px-6 py-1">
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase tracking-wide">
                        <span className="bg-card px-2 text-muted-foreground">Or</span>
                    </div>
                </div>
            </div>

            <div className="px-6 pb-6 pt-3">
                <h3 className="font-semibold text-lg mb-1 text-center tracking-tight">Request Member Access</h3>
                <p className="text-sm text-muted-foreground text-center mb-4">
                    Not registered yet? Submit a request for admin approval.
                </p>
                <form onSubmit={handleRequestAccess} className="space-y-3">
                    {requestError && (
                        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                            <p className="text-sm text-destructive">{requestError}</p>
                        </div>
                    )}
                    {requestSuccess && (
                        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
                            <p className="text-sm text-emerald-600">{requestSuccess}</p>
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="requestName">Full Name</Label>
                        <Input
                            id="requestName"
                            type="text"
                            placeholder="Your name"
                            value={requestName}
                            onChange={(e) => setRequestName(e.target.value)}
                            required
                            disabled={requestLoading}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="requestEmail">Email</Label>
                        <Input
                            id="requestEmail"
                            type="email"
                            placeholder="your.email@example.com"
                            value={requestEmail}
                            onChange={(e) => setRequestEmail(e.target.value)}
                            required
                            disabled={requestLoading}
                        />
                    </div>
                    <Button type="submit" variant="outline" className="w-full" disabled={requestLoading}>
                        {requestLoading ? 'Submitting...' : 'Request Access'}
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                        After submitting, an admin will review your request. You will receive an email notification once it's approved.
                    </p>
                    <p className="text-s text-muted-foreground text-center">
                        Or
                    </p>
                    <a
                        href={ADMIN_WHATSAPP_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center gap-2 rounded-md border border-emerald-600 bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
                    >
                        <MessageCircle className="h-4 w-4" />
                        Contact Admin on WhatsApp
                    </a>
                </form>
            </div>
        </Card>
    );
}
