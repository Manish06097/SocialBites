
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
    const foodCourtId = searchParams.get('foodCourtId');
    const tableId = searchParams.get('table');

    const redirectUrl = '/';
    const loginUrl = `/login?redirect=${encodeURIComponent(redirectUrl)}&foodCourtId=${foodCourtId}&table=${tableId}`;

    const handleGuest = () => {
        try {
            const guestSession = {
                sessionId: `guest-${Math.random().toString(36).substring(2, 9)}`,
                tableId: tableId,
                foodCourtId: foodCourtId,
                // Set expiry to 1 hour from now
                expiry: new Date().getTime() + 60 * 60 * 1000, 
            };
            localStorage.setItem('guestSession', JSON.stringify(guestSession));
        } catch (error)
 {
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
