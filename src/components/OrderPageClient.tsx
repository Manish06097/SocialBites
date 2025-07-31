
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

        // Update latest orders
        setLatestOrders(currentLatest => {
            const existingIndex = currentLatest.findIndex(o => o.id === fullOrder.id);
            if (isTerminal) {
                // If terminal, remove from latest
                return currentLatest.filter(o => o.id !== fullOrder.id);
            } else {
                // If not terminal, update or add to latest
                if (existingIndex > -1) {
                    const newLatest = [...currentLatest];
                    newLatest[existingIndex] = fullOrder;
                    return newLatest;
                }
                return [fullOrder, ...currentLatest];
            }
        });

        // Update past orders
        setPastOrders(currentPast => {
            const existingIndex = currentPast.findIndex(o => o.id === fullOrder.id);
            if (isTerminal) {
                 // If terminal, update or add to past
                if (existingIndex > -1) {
                    const newPast = [...currentPast];
                    newPast[existingIndex] = fullOrder;
                    return newPast;
                }
                return [fullOrder, ...currentPast];
            } else {
                // If not terminal, remove from past
                return currentPast.filter(o => o.id !== fullOrder.id);
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
