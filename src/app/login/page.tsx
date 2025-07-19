
'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User } from 'lucide-react';

export default function UserLoginPage() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');

  const successfulLoginRedirectPath = redirect || '/';
  const signupPath = redirect ? `/signup?redirect=${encodeURIComponent(redirect)}` : '/signup';

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-muted/40 p-4">
      <Card className="mx-auto w-full max-w-sm">
        <CardHeader className="text-center">
          <Logo className="mb-4" />
          <CardTitle className="font-headline text-2xl">Login</CardTitle>
          <CardDescription>Enter your email below to login to your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="m@example.com" required />
            </div>
            <div className="space-y-2">
               <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required />
            </div>
            <Button type="submit" className="w-full font-bold">
               <Link href={successfulLoginRedirectPath}>Login</Link>
            </Button>
             <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or</span>
                </div>
            </div>
             <Button variant="outline" className="w-full font-bold">
               <Link href={successfulLoginRedirectPath} className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                Continue as Guest
               </Link>
            </Button>
          </div>
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
