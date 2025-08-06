
'use client';

import { useState, Suspense } from 'react'; // Import Suspense
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, LogIn } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);

  const redirect = searchParams.get('redirect');
  const foodCourtId = searchParams.get('foodCourtId');
  const stallId = searchParams.get('stallId');
  const tableId = searchParams.get('table');
  
  const successfulLoginRedirectPath = stallId ? `/stalls/${stallId}` : (redirect || '/');
  const signupPath = `/signup?${searchParams.toString()}`;

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: error.message || 'Please check your credentials and try again.',
      });
    } else {
      router.push(successfulLoginRedirectPath);
      router.refresh(); // Refresh to update server-side auth state
    }
    setLoading(false);
  };
  
  const handleGuest = async () => {
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
    } else {
        try {
            if (tableId && foodCourtId) {
                const tableInfo = { tableId, foodCourtId };
                localStorage.setItem('tableInfo', JSON.stringify(tableInfo));
            }
        } catch (e) {
            console.error("Could not save table info to localStorage", e);
        }
        router.push(successfulLoginRedirectPath);
        router.refresh();
    }
    setGuestLoading(false);
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-muted/40 p-4">
      <Card className="mx-auto w-full max-w-sm">
        <CardHeader className="text-center">
          <Logo className="mb-4" />
          <CardTitle className="font-headline text-2xl">Login</CardTitle>
          <CardDescription>Enter your email below to login to your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="m@example.com" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading || guestLoading}
              />
            </div>
            <div className="space-y-2">
               <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading || guestLoading}
              />
            </div>
            <Button type="submit" className="w-full font-bold" disabled={loading || guestLoading}>
               {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
          <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or</span>
              </div>
          </div>
          <Button variant="outline" className="w-full font-bold" onClick={handleGuest} disabled={loading || guestLoading}>
            {guestLoading ? 'Starting...' : <><User className="mr-2 h-5 w-5" /> Continue as Guest</>}
          </Button>
           <div className="mt-4 text-center text-sm">
            Don't have an account?{' '}
            <Link href={signupPath} className="underline">
              Sign up
            </Link>
          </div>
           <div className="mt-2 text-center text-sm">
            Are you a vendor?{' '}
            <Link href="/vendor/login" className="underline">
              Vendor Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function UserLoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
