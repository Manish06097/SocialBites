
'use client';

import { useState, useEffect } from 'react';
import type { Order } from '@/lib/types';
import LatestOrdersTracker from '@/components/LatestOrdersTracker';
import PastOrdersList from '@/components/PastOrdersList';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { getOrderById } from '@/app/orders/actions';

interface OrderPageClientProps {
  initialLatestOrders: Order[];
  initialPastOrders: Order[];
}

export default function OrderPageClient({ initialLatestOrders, initialPastOrders }: OrderPageClientProps) {
  const [latestOrders, setLatestOrders] = useState<Order[]>(initialLatestOrders);
  const [pastOrders, setPastOrders] = useState<Order[]>(initialPastOrders);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    const handleOrderUpdate = async (payload: any) => {
        const updatedOrderId = payload.new.id;
        console.log('Realtime `orders` update received for ID:', updatedOrderId);

        // Refetch the full order data to ensure we have order_items
        const { order: fullOrder, error } = await getOrderById(updatedOrderId);

        if (error || !fullOrder) {
            console.error('Could not fetch updated order details:', error);
            return;
        }

        const isTerminal = fullOrder.status === 'completed' || fullOrder.status === 'rejected';

        setLatestOrders(currentLatest => {
            // Remove the order from the current latest list, if present
            const filteredLatest = currentLatest.filter(o => o.id !== fullOrder.id);
            if (!isTerminal) {
                // If it's active again, add it to the latest list.
                return [fullOrder, ...filteredLatest];
            }
            // If it's terminal, just return the filtered list.
            return filteredLatest;
        });

        setPastOrders(currentPast => {
            // Remove the order from the current past list, if present
            const filteredPast = currentPast.filter(o => o.id !== fullOrder.id);
            if (isTerminal) {
                // If it's terminal, add it to the past list.
                return [fullOrder, ...filteredPast];
            }
            // If it's active again, just return the filtered list.
            return filteredPast;
        });
    };

    const ordersSubscription = supabase
        .channel('public:orders')
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, handleOrderUpdate)
        .subscribe((status, err) => {
            if (err) {
                console.error('`orders` subscription error:', err);
            }
        });

    return () => {
      supabase.removeChannel(ordersSubscription);
    };
  }, [supabase]);

  const latestOrderIds = latestOrders.map(o => o.id);

  return (
    <>
      <div>
        <h2 className="font-headline text-3xl font-bold mb-4">Latest Orders</h2>
        <LatestOrdersTracker orders={latestOrders} />
      </div>

      <div>
        <h2 className="font-headline text-3xl font-bold mb-4">Past Orders</h2>
        <PastOrdersList 
            initialOrders={pastOrders} 
            latestOrderIds={latestOrderIds} 
        />
      </div>
    </>
  );
}
