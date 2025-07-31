
'use client';

import { useState, useEffect } from 'react';
import type { Order } from '@/lib/types';
import LatestOrdersTracker from '@/components/LatestOrdersTracker';
import PastOrdersList from '@/components/PastOrdersList';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

interface OrderPageClientProps {
  initialLatestOrders: Order[];
  initialPastOrders: Order[];
}

export default function OrderPageClient({ initialLatestOrders, initialPastOrders }: OrderPageClientProps) {
  const [latestOrders, setLatestOrders] = useState<Order[]>(initialLatestOrders);
  const [pastOrders, setPastOrders] = useState<Order[]>(initialPastOrders);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    const handleOrderUpdate = (payload: any) => {
        const updatedOrder = payload.new as Order;
        console.log('Realtime `orders` update received:', updatedOrder);

        const isCompleted = updatedOrder.status === 'completed';
        const isRejected = updatedOrder.status === 'rejected';

        // Update the latest orders list
        setLatestOrders(currentOrders => {
            // If the order is now completed or rejected, remove it from the latest list
            if (isCompleted || isRejected) {
                return currentOrders.filter(order => order.id !== updatedOrder.id);
            }
            // Otherwise, update its status if it's in the list
            return currentOrders.map(order => 
                order.id === updatedOrder.id ? { ...order, ...updatedOrder } : order
            );
        });
        
        // If completed or rejected, add it to the past orders list
        if (isCompleted || isRejected) {
             // We need the full order object for the past orders list
             // The payload.new should contain it.
            setPastOrders(currentPastOrders => {
                // Avoid adding duplicates
                if (currentPastOrders.some(o => o.id === updatedOrder.id)) {
                    return currentPastOrders;
                }
                // Add the completed/rejected order to the top of the past orders list
                return [updatedOrder, ...currentPastOrders];
            });
        }
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
