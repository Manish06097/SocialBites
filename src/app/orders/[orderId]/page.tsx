
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This page is now deprecated in favor of the unified /orders page.
// We redirect any traffic here back to the main orders list.
export default function DeprecatedOrderTrackingPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/orders');
  }, [router]);

  return (
    <div className="container mx-auto flex h-[70vh] flex-col items-center justify-center text-center">
      <p className="text-muted-foreground">Redirecting to your orders...</p>
    </div>
  );
}
