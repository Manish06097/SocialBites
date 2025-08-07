
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function VendorLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const supabase = createSupabaseBrowserClient();
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: authError.message || 'Please check your credentials and try again.',
      });
      setLoading(false);
      return;
    }

    if (authData.user) {
        // After successful login, check if the user is a stall owner
        const { data: stall, error: stallError } = await supabase
            .from('stalls')
            .select('id')
            .eq('owner_id', authData.user.id)
            .maybeSingle();

        if (stallError || !stall) {
            // Not a vendor or error fetching stall, sign them out and show an error
            await supabase.auth.signOut();
            toast({
                variant: 'destructive',
                title: 'Access Denied',
                description: 'This account is not associated with a vendor stall.',
            });
            setLoading(false);
            return;
        }

        // If they own a stall, redirect to dashboard
        router.replace('/vendor/dashboard');
    }

    // Fallback in case user data is not available, though unlikely
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-muted/40 p-4">
      <Card className="mx-auto w-full max-w-sm">
        <CardHeader className="text-center">
          <Logo className="mb-4" />
          <CardTitle className="font-headline text-2xl">Vendor Portal</CardTitle>
          <CardDescription>Enter your credentials to access your stall dashboard.</CardDescription>
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
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <Link href="#" className="ml-auto inline-block text-sm underline">
                  Forgot your password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full font-bold" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Not a vendor?{' '}
            <Link href="/stalls" className="underline">
              Back to ordering
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
