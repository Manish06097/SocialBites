
'use client';

import { useState, useEffect, Suspense } from 'react';
import { getLatestOrders, getPastOrders } from '../actions';
import OrderPageClient from '@/components/OrderPageClient';
import type { Order } from '@/lib/types';
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
  const [initialLatestOrders, setInitialLatestOrders] = useState<Order[]>([]);
  const [initialPastOrders, setInitialPastOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const { orders: latestOrders, error: latestOrdersError } = await getLatestOrders();
        if (latestOrdersError) throw new Error(latestOrdersError);

        const latestOrderIds = latestOrders?.map(o => o.id) || [];
        const { orders: pastOrders, error: pastOrdersError } = await getPastOrders({ currentOrderIds: latestOrderIds, limit: 5 });
        if (pastOrdersError) throw new Error(pastOrdersError);
        
        setInitialLatestOrders(latestOrders || []);
        setInitialPastOrders(pastOrders || []);

      } catch (err: any) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return <OrderTrackingPageSkeleton />;
  }
  
  if (error) {
     return <div className="container mx-auto max-w-4xl px-4 py-8 md:px-6 text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 md:px-6 space-y-8">
      <OrderPageClient
        initialLatestOrders={initialLatestOrders}
        initialPastOrders={initialPastOrders}
      />
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
