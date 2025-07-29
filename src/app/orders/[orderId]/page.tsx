
'use server';

import type { Order } from '@/lib/types';
import { getLatestOrders, getPastOrders } from '../actions';
import PastOrdersList from '@/components/PastOrdersList';
import LatestOrdersTracker from '@/components/LatestOrdersTracker';

export default async function OrderTrackingPage({ params }: { params: { orderId: string } }) {
  const {orders: latestOrders, error: latestOrdersError} = await getLatestOrders();
  
  if (latestOrdersError) {
    // Handle error appropriately, maybe show an error message
    console.error(latestOrdersError);
  }

  const latestOrderIds = latestOrders?.map(o => o.id) || [];
  const {orders: initialPastOrders, error: pastOrdersError} = await getPastOrders({currentOrderIds: latestOrderIds, limit: 5});

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 md:px-6 space-y-8">
      <div>
        <h2 className="font-headline text-3xl font-bold mb-4">Latest Orders</h2>
        <LatestOrdersTracker initialOrders={latestOrders || []} />
      </div>

      <div>
        <h2 className="font-headline text-3xl font-bold mb-4">Past Orders</h2>
        <PastOrdersList 
            initialOrders={initialPastOrders || []} 
            latestOrderIds={latestOrderIds} 
        />
      </div>
    </div>
  );
}
