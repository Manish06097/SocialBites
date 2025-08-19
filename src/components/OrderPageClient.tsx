
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Order } from '@/lib/types';
import LatestOrdersTracker from '@/components/LatestOrdersTracker';
import PastOrdersList from '@/components/PastOrdersList';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { getOrderById, getLatestOrders, getPastOrders } from '@/app/orders/actions';
import { Skeleton } from '@/components/ui/skeleton';

function OrderTrackingPageSkeleton() {
  return (
    <>
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
    </>
  );
}


export default function OrderPageClient() {
  const [allOrders, setAllOrders] = useState<{
      latest: Order[];
      past: Order[];
  }>({ latest: [], past: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createSupabaseBrowserClient();

  const fetchInitialOrders = useCallback(async () => {
    try {
        setLoading(true);
        const { orders: latestOrders, error: latestOrdersError } = await getLatestOrders();
        if (latestOrdersError) throw new Error(latestOrdersError);

        const latestOrderIds = latestOrders?.map(o => o.id) || [];
        const { orders: pastOrders, error: pastOrdersError } = await getPastOrders({ currentOrderIds: latestOrderIds, limit: 5 });
        if (pastOrdersError) throw new Error(pastOrdersError);
        
        setAllOrders({
            latest: latestOrders || [],
            past: pastOrders || [],
        });

      } catch (err: any) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
  }, []);


  useEffect(() => {
    // Fetch initial data, then subscribe.
    fetchInitialOrders();

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
                // It's active, move from past to latest if it exists there.
                newPast = newPast.filter(o => o.id !== fullOrder.id);
                 // Add to latest if not already there, otherwise update it.
                if (!newLatest.some(o => o.id === fullOrder.id)) {
                    newLatest = [fullOrder, ...newLatest];
                } else {
                    newLatest = newLatest.map(o => o.id === fullOrder.id ? fullOrder : o);
                }
            }

            return { latest: newLatest.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()), past: newPast };
        });
    };

    const ordersSubscription = supabase
        .channel('public:orders')
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, handleOrderUpdate)
        .subscribe((status, err) => {
            if (status === 'SUBSCRIBED') {
              console.log('Successfully subscribed to order updates!');
            }
            if (err) {
                console.error('`orders` subscription error:', err);
            }
        });

    return () => {
      supabase.removeChannel(ordersSubscription);
    };
  }, [supabase, fetchInitialOrders]);

  if (loading) {
    return <OrderTrackingPageSkeleton />;
  }

  if (error) {
     return <div className="text-center text-red-500">Error: {error}</div>;
  }

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
