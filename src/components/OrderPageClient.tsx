
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

        const isTerminal = updatedOrder.status === 'completed' || updatedOrder.status === 'rejected';

        // Update past orders first
        setPastOrders(currentPast => {
            const alreadyExists = currentPast.some(o => o.id === updatedOrder.id);
            if (isTerminal) {
                // If order is terminal and not in past orders, add it
                if (!alreadyExists) {
                    // We need the full order object, which we don't have from the initial load.
                    // This is a limitation, so we might need a fetch here if order_items are missing.
                    // For now, let's assume payload.new has enough info.
                    return [updatedOrder, ...currentPast];
                }
                // If it exists, update it
                return currentPast.map(o => o.id === updatedOrder.id ? updatedOrder : o);
            } else {
                // If order is not terminal, remove it from past orders
                return currentPast.filter(o => o.id !== updatedOrder.id);
            }
        });
        
        // Update latest orders
        setLatestOrders(currentLatest => {
            const alreadyExists = currentLatest.some(o => o.id === updatedOrder.id);
            if (!isTerminal) {
                // If order is active and not in latest orders, add it
                 if (!alreadyExists) {
                    return [updatedOrder, ...currentLatest];
                }
                // If it exists, update it
                return currentLatest.map(o => o.id === updatedOrder.id ? updatedOrder : o);
            } else {
                 // If order is terminal, remove it from latest orders
                 return currentLatest.filter(o => o.id !== updatedOrder.id);
            }
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
