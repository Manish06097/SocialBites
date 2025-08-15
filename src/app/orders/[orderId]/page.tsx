
'use client';

import { useState, useEffect, Suspense } from 'react';
import OrderPageClient from '@/components/OrderPageClient';
import { Skeleton } from '@/components/ui/skeleton';

function OrderTrackingPageSkeleton() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 md:px-6 space-y-8">
      <div>
        <h2 className="font-headline text-3xl font-bold mb-4">Latest Orders</h2>
        <div className="space-y-6">
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      </div>
      <div>
        <h2 className="font-headline text-3xl font-bold mb-4">Past Orders</h2>
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    </div>
  );
}

function OrderTrackingPageContent() {
  // This component now only renders the client component that handles its own data fetching.
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 md:px-6 space-y-8">
      <OrderPageClient />
    </div>
  );
}

export default function OrderTrackingPage() {
    return (
        <Suspense fallback={<OrderTrackingPageSkeleton />}>
            <OrderTrackingPageContent />
        </Suspense>
    )
}
