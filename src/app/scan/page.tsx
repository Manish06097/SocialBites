
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { QrCode } from 'lucide-react';
import Logo from '@/components/Logo';

export default function ScanPage() {
  const router = useRouter();
  
  // These would come from the QR code in a real scenario
  const foodCourtId = 'fc1';
  const stallId = 's1';
  const tableId = 'T12';

  const handleScan = () => {
    // Redirect to the new welcome page with the scanned info as query parameters
    router.push(`/welcome?foodCourtId=${foodCourtId}&stallId=${stallId}&table=${tableId}`);
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm text-center">
        <CardHeader>
           <Logo className="mb-4" />
           <CardTitle className="font-headline text-2xl">
            Ready to Order?
           </CardTitle>
           <CardDescription>
            Scan the QR code on your table to begin.
           </CardDescription>
        </CardHeader>
        <CardContent>
            <>
              <div className="mx-auto flex h-48 w-48 items-center justify-center rounded-lg border-2 border-dashed border-primary bg-primary/10">
                  <QrCode className="h-24 w-24 text-primary/50" />
              </div>
              <p className="my-4 text-sm text-muted-foreground">Or, since this is a demo...</p>
              <Button size="lg" className="w-full font-bold" onClick={handleScan}>
                Simulate Table Scan
              </Button>
              <p className="mt-2 text-xs text-muted-foreground">
                  (Simulating scan for Table {tableId})
              </p>
            </>
        </CardContent>
      </Card>
    </div>
  );
}
