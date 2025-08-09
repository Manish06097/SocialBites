
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, LogIn, Loader2 } from 'lucide-react';
import Logo from '@/components/Logo';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useState, Suspense, useEffect } from 'react';


function WelcomeContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const [guestLoading, setGuestLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);

    const foodCourtId = searchParams.get('foodCourtId');
    const stallId = searchParams.get('stallId');
    const tableId = searchParams.get('table');

    useEffect(() => {
        const supabase = createSupabaseBrowserClient();
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                // If user is already logged in, redirect them away.
                router.replace('/stalls');
            } else {
                setPageLoading(false);
            }
        };
        checkSession();
    }, [router]);

    const redirectUrl = stallId ? `/stalls/${stallId}` : '/stalls';
    const loginUrl = `/login?${searchParams.toString()}`;

    const handleGuest = async () => {
        if (guestLoading) return;
        setGuestLoading(true);
        const supabase = createSupabaseBrowserClient();
        const { error } = await supabase.auth.signInAnonymously({
            options: {
                data: {}
            }
        });

        if (error) {
            toast({
                variant: 'destructive',
                title: 'Guest Login Failed',
                description: 'Could not create a guest session. Please try again.',
            });
             setGuestLoading(false);
            return;
        }

        try {
            if (tableId && foodCourtId) {
                const tableInfo = {
                    tableId,
                    foodCourtId,
                    stallId,
                };
                localStorage.setItem('tableInfo', JSON.stringify(tableInfo));
            }
        } catch (e) {
            console.error("Could not save table info to localStorage", e);
        }
        router.replace(redirectUrl);
    };
    
    if (pageLoading) {
      return (
         <div className="flex min-h-screen w-full flex-col items-center justify-center bg-muted/40 p-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center bg-muted/40 p-4">
            <Card className="w-full max-w-sm text-center">
                <CardHeader>
                    <Logo className="mb-4" />
                    <CardTitle className="font-headline text-2xl">Welcome!</CardTitle>
                    <CardDescription>How would you like to proceed?</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    <Button size="lg" className="w-full font-bold" onClick={handleGuest} disabled={guestLoading}>
                        {guestLoading ? 'Starting...' : <><User className="mr-2 h-5 w-5" />Continue as Guest</>}
                    </Button>
                    <Link href={loginUrl}>
                        <Button size="lg" variant="outline" className="w-full font-bold" disabled={guestLoading}>
                            <LogIn className="mr-2 h-5 w-5" />
                            Login / Sign Up
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        </div>
    );
}

export default function WelcomePage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen w-full flex-col items-center justify-center bg-muted/40 p-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        }>
            <WelcomeContent />
        </Suspense>
    );
}
