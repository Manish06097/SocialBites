
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Order } from '@/lib/types';
import LatestOrdersTracker from '@/components/LatestOrdersTracker';
import PastOrdersList from '@/components/PastOrdersList';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { getOrderById, getLatestOrders, getPastOrders } from '@/app/orders/actions';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();

  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    const fetchInitialOrders = async () => {
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
    };
    
    // Fetch initial data once on mount
    fetchInitialOrders();
    
    const handleOrderUpdate = async (payload: any) => {
        const updatedOrderId = payload.new.id;
        console.log('Realtime `orders` update received for ID:', updatedOrderId, 'New status:', payload.new.status);
        const isNewItem = payload.new.total_amount > (payload.old.total_amount ?? 0);

        if (isNewItem) {
            toast({
                title: "Order Updated!",
                description: "New items have been added to your order."
            })
        }

        const { order: fullOrder, error } = await getOrderById(updatedOrderId);

        if (error || !fullOrder) {
            console.error('Could not fetch updated order details:', error);
            return;
        }

        setAllOrders(currentOrders => {
            let newLatest = [...currentOrders.latest];
            let newPast = [...currentOrders.past];
            const isTerminal = fullOrder.status === 'completed' || fullOrder.status === 'rejected';

            // Check if the order is currently in the 'latest' list
            const latestIndex = newLatest.findIndex(o => o.id === fullOrder.id);
            // Check if the order is currently in the 'past' list
            const pastIndex = newPast.findIndex(o => o.id === fullOrder.id);

            if (isTerminal) {
                // Order is finished.
                // If it was in the latest list, move it to the past list.
                if (latestIndex > -1) {
                    newLatest.splice(latestIndex, 1);
                }
                // If it's not already in the past list, add it. Otherwise, update it.
                if (pastIndex === -1) {
                    newPast.unshift(fullOrder); // Add to the beginning of past orders
                } else {
                    newPast[pastIndex] = fullOrder;
                }
            } else {
                // Order is active.
                // If it was in the past list, move it to the latest list.
                if (pastIndex > -1) {
                    newPast.splice(pastIndex, 1);
                }
                // If it's not already in the latest list, add it. Otherwise, update it.
                if (latestIndex === -1) {
                    newLatest.unshift(fullOrder);
                } else {
                    newLatest[latestIndex] = fullOrder;
                }
            }
            
            newLatest.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

            return { latest: newLatest, past: newPast };
        });
    };

    const ordersSubscription = supabase
        .channel('public:orders:client') // Using a unique channel name
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, handleOrderUpdate)
        .subscribe((status, err) => {
            if (status === 'SUBSCRIBED') {
              console.log('Successfully subscribed to order updates!');
            }
            if (status === 'CHANNEL_ERROR' || err) {
                console.error('`orders` subscription error:', err);
                toast({
                    variant: 'destructive',
                    title: 'Connection Error',
                    description: 'Could not connect to real-time updates. Please refresh.'
                });
            }
        });

    return () => {
      supabase.removeChannel(ordersSubscription);
    };
  // We only want this effect to run once on mount. The state updates are handled by the callback.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase, toast]);

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
        {allOrders.latest.length > 0 ? (
           <LatestOrdersTracker initialOrders={allOrders.latest} />
        ) : (
            <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                    You have no active orders.
                </CardContent>
            </Card>
        )}
      </div>

      <div className="mt-8">
        <h2 className="font-headline text-3xl font-bold mb-4">Past Orders</h2>
        {allOrders.past.length > 0 ? (
            <PastOrdersList 
                initialOrders={allOrders.past}
                setPastOrders={(newPastOrders) => setAllOrders(prev => ({...prev, past: newPastOrders}))}
                latestOrderIds={allOrders.latest.map(o => o.id)} 
            />
        ) : (
             <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                    You have no past orders.
                </CardContent>
            </Card>
        )}
      </div>
    </>
  );
}
