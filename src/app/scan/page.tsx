
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { QrCode, Loader2 } from 'lucide-react';
import Logo from '@/components/Logo';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export default function ScanPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  // These would come from the QR code in a real scenario
  const foodCourtId = '0b54bf5a-badf-4c17-9558-33f1168ab0df';
  const stallId = '198f7665-8ddc-4574-bc6d-2ae076f3a520';
  const tableId = 'T1';
  
  // No changes needed here, as the intelligent redirect logic is on the /welcome page.
  // This page simply simulates the scan and forwards the user.
  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      // If a session exists, we let the /welcome page handle the logic
      // of whether to update table info or just redirect.
      // For a clean start, we always go to /welcome after a scan.
      setLoading(false);
    };
    checkSession();
  }, [router]);

  const handleScan = () => {
    // Redirect to the welcome page with the scanned info as query parameters
    router.replace(`/welcome?foodCourtId=${foodCourtId}&stallId=${stallId}&table=${tableId}`);
  };
  
  if (loading) {
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
