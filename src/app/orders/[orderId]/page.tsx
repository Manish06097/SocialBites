
'use server';

import type { Order } from '@/lib/types';
import { getLatestOrders, getPastOrders } from '../actions';
import OrderPageClient from '@/components/OrderPageClient';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function OrderTrackingPage({ params }: { params: { orderId: string } }) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { orderId } = params;

  if (!user) {
    // This should ideally be handled by middleware, but as a safeguard
    redirect(`/login?redirect=/orders/${orderId}`);
  }
  
  const {orders: initialLatestOrders, error: latestOrdersError} = await getLatestOrders();
  
  if (latestOrdersError) {
    console.error(latestOrdersError);
    // Render an error state or a fallback
  }

  const latestOrderIds = initialLatestOrders?.map(o => o.id) || [];
  const {orders: initialPastOrders, error: pastOrdersError} = await getPastOrders({currentOrderIds: latestOrderIds, limit: 5});

   if (pastOrdersError) {
    console.error(pastOrdersError);
    // Render an error state or a fallback
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 md:px-6 space-y-8">
      <OrderPageClient
        initialLatestOrders={initialLatestOrders || []}
        initialPastOrders={initialPastOrders || []}
      />
    </div>
  );
}
