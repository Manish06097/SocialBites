
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, LogIn } from 'lucide-react';
import Logo from '@/components/Logo';

export default function WelcomePage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Reconstruct the redirect URL from the current search params
    const redirectUrl = `/?${searchParams.toString()}`;
    const loginUrl = `/login?redirect=${encodeURIComponent(redirectUrl)}`;

    const handleGuest = () => {
        try {
            const guestSession = {
                tableId: searchParams.get('table'),
                foodCourtId: searchParams.get('foodCourtId'),
                stallId: searchParams.get('stallId'),
                // Set expiry to 1 hour from now
                expiry: new Date().getTime() + 60 * 60 * 1000, 
            };
            localStorage.setItem('guestSession', JSON.stringify(guestSession));
        } catch (error) {
            console.error("Could not save guest session to localStorage", error);
        }
        router.push(redirectUrl);
    };

    return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center bg-muted/40 p-4">
            <Card className="w-full max-w-sm text-center">
                <CardHeader>
                    <Logo className="mb-4" />
                    <CardTitle className="font-headline text-2xl">Welcome!</CardTitle>
                    <CardDescription>How would you like to proceed?</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    <Button size="lg" className="w-full font-bold" onClick={handleGuest}>
                        <User className="mr-2 h-5 w-5" />
                        Continue as Guest
                    </Button>
                    <Link href={loginUrl}>
                        <Button size="lg" variant="outline" className="w-full font-bold">
                            <LogIn className="mr-2 h-5 w-5" />
                            Login / Sign Up
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        </div>
    );
}
