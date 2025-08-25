
'use client';

import OrderPageClient from '@/components/OrderPageClient';
import { Skeleton } from '@/components/ui/skeleton';
import { Suspense } from 'react';


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


export default function OrdersPage() {
    // This page component now simply wraps the client component
    // that handles all data fetching and real-time updates.
    return (
        <div className="container mx-auto px-4 py-8">
            <Suspense fallback={<OrderTrackingPageSkeleton />}>
                <OrderPageClient />
            </Suspense>
        </div>
    );
}
