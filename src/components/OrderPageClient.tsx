
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
  const [allOrders, setAllOrders] = useState({
      latest: initialLatestOrders,
      past: initialPastOrders
  });
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    const handleOrderUpdate = async (payload: any) => {
        const updatedOrderId = payload.new.id;
        console.log('Realtime `orders` update received for ID:', updatedOrderId, 'New status:', payload.new.status);

        const { order: fullOrder, error } = await getOrderById(updatedOrderId);

        if (error || !fullOrder) {
            console.error('Could not fetch updated order details:', error);
            return;
        }

        const isTerminal = fullOrder.status === 'completed' || fullOrder.status === 'rejected';

        setAllOrders(currentOrders => {
            let newLatest = [...currentOrders.latest];
            let newPast = [...currentOrders.past];

            if (isTerminal) {
                // It's finished, so move from latest to past.
                newLatest = newLatest.filter(o => o.id !== fullOrder.id);
                // Add to past if not already there, otherwise update it.
                if (!newPast.some(o => o.id === fullOrder.id)) {
                    newPast = [fullOrder, ...newPast];
                } else {
                    newPast = newPast.map(o => o.id === fullOrder.id ? fullOrder : o);
                }
            } else {
                // It's active, so move from past to latest.
                newPast = newPast.filter(o => o.id !== fullOrder.id);
                 // Add to latest if not already there, otherwise update it.
                if (!newLatest.some(o => o.id === fullOrder.id)) {
                    newLatest = [fullOrder, ...newLatest];
                } else {
                    newLatest = newLatest.map(o => o.id === fullOrder.id ? fullOrder : o);
                }
            }

            return { latest: newLatest, past: newPast };
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


  return (
    <>
      <div>
        <h2 className="font-headline text-3xl font-bold mb-4">Latest Orders</h2>
        <LatestOrdersTracker orders={allOrders.latest} />
      </div>

      <div>
        <h2 className="font-headline text-3xl font-bold mb-4">Past Orders</h2>
        <PastOrdersList 
            initialOrders={allOrders.past}
            setPastOrders={(newPastOrders) => setAllOrders(prev => ({...prev, past: newPastOrders}))}
            latestOrderIds={allOrders.latest.map(o => o.id)} 
        />
      </div>
    </>
  );
}
