
'use client';

import { useState, useEffect, useTransition, useCallback, Suspense, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle, ChefHat, PackageCheck, DollarSign, Phone, Home, MessageSquareQuote } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Order, OrderStatus, OrderItem } from '@/lib/types';
import { getVendorStallId, getVendorOrders, updateOrderItemStatus, markOrderAsPaid } from '@/app/vendor/actions';
import { useToast } from '@/hooks/use-toast';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import type { Session } from '@supabase/supabase-js';

const OrderItemCustomizations = ({ customizations }: { customizations: any }) => {
    if (!customizations || Object.keys(customizations).length === 0) return null;

    const entries = Object.entries(customizations).flatMap(([key, value]) => {
        if (Array.isArray(value)) {
            return value.map(v => ({ title: key, value: v as string }));
        }
        return { title: key, value: value as string };
    });

    if (entries.length === 0) return null;

    return (
        <div className="text-xs text-muted-foreground pl-4 mt-1">
            {entries.map((c, i) => (
              <span key={i}>
                {c.value}
                {i < entries.length - 1 && ' • '}
              </span>
            ))}
        </div>
    );
};

const OrderCard = ({ order, stallId, onUpdateStatus, onMarkAsPaid, isUpdating, isCompletedView }: { order: Order; stallId: string, onUpdateStatus: (orderId: string, itemId: string, newStatus: OrderStatus) => void, onMarkAsPaid: (orderId: string) => void, isUpdating: boolean, isCompletedView: boolean }) => {
  const [timeAgo, setTimeAgo] = useState('');
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
    const calculateTimeSince = () => {
      const seconds = Math.floor((new Date().getTime() - new Date(order.created_at).getTime()) / 1000);
      if (seconds < 60) return 'Just now';
      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
      const hours = Math.floor(minutes / 60);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    };
    
    setTimeAgo(calculateTimeSince());
    const interval = setInterval(() => {
        setTimeAgo(calculateTimeSince());
    }, 60000);
    return () => clearInterval(interval);
  }, [order.created_at]);

  const isPaid = order.payment_status === 'completed';

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                 <CardTitle className="text-xl">Order #{order.display_id.split('-').pop()}</CardTitle>
                 <CardDescription>From {order.contact_name || 'Guest'} at Table {order.table_id || 'N/A'}</CardDescription>
                 <div className="flex items-center gap-2 mt-1">
                    {order.contact_phone && (
                        <CardDescription className="flex items-center gap-1.5">
                            <Phone className="h-3 w-3" />
                            {order.contact_phone}
                        </CardDescription>
                    )}
                 </div>
            </div>
            <div className="text-right space-y-1">
                <Badge variant={isPaid ? "default" : "secondary"} className={cn(isPaid ? "bg-green-600 text-white" : "bg-yellow-500 text-white")}>
                    {isPaid ? "PAID" : "COD"}
                </Badge>
                {isClient ? <p className="text-xs text-muted-foreground">{timeAgo}</p> : <p className="text-xs text-muted-foreground">...</p>}
            </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {order.order_items.map((item) => (
            <div key={item.id} className="space-y-3 rounded-md border p-3">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="font-semibold">{item.menu_items?.name}</p>
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity} • ₹{item.total_price.toFixed(2)}</p>
                    </div>
                     <Badge variant="outline" className="capitalize">{item.status}</Badge>
                </div>
                <OrderItemCustomizations customizations={item.customizations} />
                {item.special_instructions && (
                  <div className="flex items-start gap-2 rounded-md bg-yellow-50 border border-yellow-200 p-2 text-yellow-800">
                    <MessageSquareQuote className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <p className="text-xs">{item.special_instructions}</p>
                  </div>
                )}
                 <div className="flex gap-2">
                    {item.status === 'pending' && (
                        <>
                            <Button size="sm" variant="outline" className="w-full" onClick={() => onUpdateStatus(order.id, item.id, 'rejected')} disabled={isUpdating}>
                                <XCircle className="mr-2 h-4 w-4" /> Reject
                            </Button>
                            <Button size="sm" className="w-full" onClick={() => onUpdateStatus(order.id, item.id, 'accepted')} disabled={isUpdating}>
                                <CheckCircle className="mr-2 h-4 w-4" /> Accept
                            </Button>
                        </>
                    )}
                    {item.status === 'accepted' && (
                        <Button size="sm" className="w-full" onClick={() => onUpdateStatus(order.id, item.id, 'preparing')} disabled={isUpdating}>
                            <ChefHat className="mr-2 h-4 w-4" /> Mark as Preparing
                        </Button>
                    )}
                    {item.status === 'preparing' && (
                        <Button size="sm" className="w-full" onClick={() => onUpdateStatus(order.id, item.id, 'delivered')} disabled={isUpdating}>
                            <PackageCheck className="mr-2 h-4 w-4" /> Mark as Delivered
                        </Button>
                    )}
                </div>
            </div>
        ))}
      </CardContent>
      { isCompletedView && order.payment_method === 'cod' && order.payment_status !== 'completed' && (
        <CardFooter className="py-3 px-4 border-t">
          <Button className="w-full" onClick={() => onMarkAsPaid(order.id)} disabled={isUpdating}>
              <DollarSign className="mr-2 h-4 w-4" />
              Confirm COD Payment Received
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}

const KitchenItemCard = ({ item, order, onUpdateStatus, isUpdating }: { item: OrderItem; order: Order; onUpdateStatus: (orderId: string, itemId: string, newStatus: OrderStatus) => void; isUpdating: boolean }) => {
    return (
        <Card className="flex flex-col">
            <CardHeader className="pb-2">
                <CardTitle className="text-xl leading-tight">{item.menu_items?.name}</CardTitle>
                <CardDescription>For Order #{order.display_id.split('-').pop()} at Table {order.table_id}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-3">
                <div className="text-2xl font-bold">Qty: {item.quantity}</div>
                <OrderItemCustomizations customizations={item.customizations} />
                {item.special_instructions && (
                    <div className="flex items-start gap-2 rounded-md bg-yellow-50 border border-yellow-200 p-2 text-yellow-800">
                        <MessageSquareQuote className="h-4 w-4 flex-shrink-0 mt-0.5" />
                        <p className="text-sm">{item.special_instructions}</p>
                    </div>
                )}
            </CardContent>
            <CardFooter>
                <Button size="lg" className="w-full" onClick={() => onUpdateStatus(order.id, item.id, 'delivered')} disabled={isUpdating}>
                    <PackageCheck className="mr-2 h-5 w-5" /> Food is Ready
                </Button>
            </CardFooter>
        </Card>
    )
}

function OrdersDisplay() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stallId, setStallId] = useState<string | null>(null);
  const [isUpdating, startTransition] = useTransition();
  const { toast } = useToast();
  const supabase = createSupabaseBrowserClient();
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    // This effect runs once on mount to initialize the audio element.
    // It's safe because it doesn't depend on any props or state that change.
    setAudio(new Audio('/notification.mp3'));
  }, []);

  const fetchOrders = useCallback(async (id: string) => {
    const fetchedOrders = await getVendorOrders(id);
    setOrders(fetchedOrders);
    setIsLoading(false);
  }, []);
  
  useEffect(() => {
    // This effect initializes the stallId and fetches initial orders.
    // It runs once or if fetchOrders changes (which it doesn't).
    const initStall = async () => {
      const id = await getVendorStallId();
      setStallId(id);
      if (id) {
        fetchOrders(id);
      } else {
        console.error('Could not retrieve vendor stall ID.');
        setOrders([]);
        setIsLoading(false);
      }
    };
    initStall();
  }, [fetchOrders]);


  useEffect(() => {
    // This effect sets up the real-time subscription.
    // It depends on stallId, so it runs when stallId is set.
    if (!stallId) return;

    const channel = supabase
      .channel(`public:order_items:stall_id=eq.${stallId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'order_items', filter: `stall_id=eq.${stallId}` }, 
        (payload) => {
            console.log('New order item change received:', payload);
            if(payload.eventType === 'INSERT') {
                toast({
                    title: "🎉 New Order!",
                    description: "You have a new order waiting for acceptance.",
                });
                audio?.play().catch(e => console.error("Error playing notification sound:", e));
            }
            fetchOrders(stallId);
        }
      )
      .subscribe((status, err) => {
        if (err) {
            console.error(`Subscription error for stall ${stallId}:`, err);
        }
      });
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [stallId, supabase, fetchOrders, toast, audio]);

  const handleUpdateStatus = (orderId: string, itemId: string, newStatus: OrderStatus) => {
    if (!stallId) return;
    
    // Optimistic UI update
    setOrders(prevOrders => prevOrders.map(order => {
        if (order.id === orderId) {
            return {
                ...order,
                order_items: order.order_items.map(item =>
                    item.id === itemId ? { ...item, status: newStatus } : item
                ),
            };
        }
        return order;
    }));


    startTransition(async () => {
      try {
        await updateOrderItemStatus(orderId, stallId, newStatus, itemId);
        // The server action revalidates, so we don't strictly need to refetch,
        // but it can help ensure consistency if something goes wrong.
        await fetchOrders(stallId);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Update Failed",
          description: "Could not update the order status. Please try again.",
        });
        console.error('Failed to update order status:', error);
        // Revert UI on error
        fetchOrders(stallId);
      }
    });
  };

  const handleMarkAsPaid = (orderId: string) => {
    if (!stallId) return;

    // Optimistic UI update
    setOrders(prevOrders => prevOrders.map(order => 
      order.id === orderId ? { ...order, payment_status: 'completed' } : order
    ));

    startTransition(async () => {
      try {
        await markOrderAsPaid(orderId);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Update Failed",
          description: "Could not mark order as paid.",
        });
        console.error('Failed to mark order as paid:', error);
        fetchOrders(stallId); // Revert UI on error
      }
    });
  };
  
  const isOrderActive = (order: Order): boolean => {
      // An order is active if ANY of its items are not in a terminal state.
      // This is now based on the master order status, which is derived from item statuses.
      return order.status !== 'completed' && order.status !== 'rejected';
  };
  
  const activeOrders = useMemo(() => orders.filter(isOrderActive), [orders]);
  const completedOrders = useMemo(() => orders.filter(o => !isOrderActive(o)), [orders]);
  
  const kitchenQueueItems = useMemo(() => {
    return activeOrders
        .flatMap(order => order.order_items.map(item => ({...item, parentOrder: order})))
        .filter(item => item.status === 'preparing');
  }, [activeOrders]);

  if (isLoading || !stallId) {
    return <OrdersPageSkeleton />;
  }
  
  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-lg font-semibold md:text-2xl">
          Order Management
        </h1>
      </div>
      <Tabs defaultValue="active" className="mt-4">
        <TabsList className="grid w-full grid-cols-3 h-auto">
          <TabsTrigger value="active">
            Active <Badge variant="destructive" className="ml-2">{activeOrders.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="kitchen">
            Kitchen Queue <Badge variant="destructive" className="ml-2">{kitchenQueueItems.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
             {activeOrders.length > 0 ? activeOrders.map(order => <OrderCard key={order.id} order={order} stallId={stallId} onUpdateStatus={handleUpdateStatus} onMarkAsPaid={handleMarkAsPaid} isUpdating={isUpdating} isCompletedView={false} />) : <p className="text-muted-foreground col-span-full text-center py-8">No active orders.</p>}
          </div>
        </TabsContent>
        <TabsContent value="kitchen" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {kitchenQueueItems.length > 0 ? kitchenQueueItems.map(item => <KitchenItemCard key={item.id} item={item} order={item.parentOrder} onUpdateStatus={handleUpdateStatus} isUpdating={isUpdating} />) : <p className="text-muted-foreground col-span-full text-center py-8">No items in the kitchen queue.</p>}
          </div>
        </TabsContent>
        <TabsContent value="completed" className="mt-4">
           <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
             {completedOrders.length > 0 ? completedOrders.map(order => <OrderCard key={order.id} order={order} stallId={stallId} onUpdateStatus={handleUpdateStatus} onMarkAsPaid={handleMarkAsPaid} isUpdating={isUpdating} isCompletedView={true} />) : <p className="text-muted-foreground col-span-full text-center py-8">No completed orders yet today.</p>}
          </div>
        </TabsContent>
      </Tabs>
    </>
  )
}

function OrdersPageSkeleton() {
  return (
    <div className="space-y-4">
        <div className="flex items-center justify-between">
            <h1 className="font-headline text-lg font-semibold md:text-2xl">
            Order Management
            </h1>
        </div>
        <Skeleton className="h-12 w-full" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
    </div>
  )
}


export default function VendorOrdersPage() {
  return (
    <Suspense fallback={<OrdersPageSkeleton />}>
      <OrdersDisplay />
    </Suspense>
  )
}
