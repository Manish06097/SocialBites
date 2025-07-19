
import Link from 'next/link';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User } from 'lucide-react';

export default function UserLoginPage() {
  // In a real app, this would redirect to the stored redirect URL after login.
  // For this demo, it will just go to the homepage.
  const successfulLoginRedirectPath = '/';

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-muted/40 p-4">
      <Card className="mx-auto w-full max-w-sm">
        <CardHeader className="text-center">
          <Logo className="mb-4" />
          <CardTitle className="font-headline text-2xl">Login or Sign Up</CardTitle>
          <CardDescription>Enter your details to get started.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email or Phone</Label>
              <Input id="email" type="email" placeholder="m@example.com" required />
            </div>
            <div className="space-y-2">
               <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required />
            </div>
            <Button type="submit" className="w-full font-bold">
               <Link href={successfulLoginRedirectPath}>Continue</Link>
            </Button>
             <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
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
