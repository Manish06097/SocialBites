
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { QrCode, User, LogIn } from 'lucide-react';
import Logo from '@/components/Logo';

export default function ScanPage() {
  const router = useRouter();
  const [scanCompleted, setScanCompleted] = useState(false);

  // These would come from the QR code in a real scenario
  const foodCourtId = 'fc1';
  const stallId = 's1';
  const tableId = 'T12';

  const handleScan = () => {
    setScanCompleted(true);
  };

  const handleGuest = () => {
    // Redirect to the home page with the scanned info as query parameters
    router.push(`/?foodCourtId=${foodCourtId}&stallId=${stallId}&table=${tableId}`);
  };

  const handleLogin = () => {
      // Redirect to a login page (using vendor login as a placeholder)
      router.push(`/vendor/login?redirect=/?foodCourtId=${foodCourtId}&stallId=${stallId}&table=${tableId}`);
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm text-center">
        <CardHeader>
           <Logo className="mb-4" />
           <CardTitle className="font-headline text-2xl">
            {scanCompleted ? 'Welcome!' : 'Ready to Order?'}
           </CardTitle>
           <CardDescription>
            {scanCompleted ? 'How would you like to proceed?' : 'Scan the QR code on your table to begin.'}
           </CardDescription>
        </CardHeader>
        <CardContent>
          {!scanCompleted ? (
            <>
              <div className="mx-auto flex h-48 w-48 items-center justify-center rounded-lg border-2 border-dashed border-primary bg-primary/10">
                  <QrCode className="h-24 w-24 text-primary/50" />
              </div>
              <p className="my-4 text-sm text-muted-foreground">Or, since this is a demo...</p>
              <Button size="lg" className="w-full font-bold" onClick={handleScan}>
                Simulate Table Scan
              </Button>
              <p className="mt-2 text-xs text-muted-foreground">
                  (Simulating scan for Table {tableId} at Food Court {foodCourtId})
              </p>
            </>
          ) : (
            <div className="flex flex-col gap-4">
                <Button size="lg" className="w-full font-bold" onClick={handleGuest}>
                    <User className="mr-2 h-5 w-5" />
                    Continue as Guest
                </Button>
                <Button size="lg" variant="outline" className="w-full font-bold" onClick={handleLogin}>
                   <LogIn className="mr-2 h-5 w-5" />
                   Login / Sign Up
                </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
