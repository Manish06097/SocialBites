
'use client';

import { useState, useEffect, useTransition, useCallback, Suspense } from 'react';
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
import { CheckCircle, XCircle, Bike, ChefHat, MessageSquareQuote, CookingPot, PackageCheck, DollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Order, OrderStatus } from '@/lib/types';
import { getVendorStallId, getVendorOrders, updateOrderStatus, markOrderAsPaid } from '@/app/vendor/actions';
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

const OrderCard = ({ order, onUpdateStatus, onMarkAsPaid, isUpdating }: { order: Order; onUpdateStatus: (orderId: string, newStatus: OrderStatus) => void, onMarkAsPaid: (orderId: string) => void, isUpdating: boolean }) => {
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

  const overallStatus = order.status;
  const isPaid = order.payment_method === 'upi' || order.payment_status === 'completed';

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                 <CardTitle className="text-xl">Order #{order.display_id.split('-').pop()}</CardTitle>
                 <CardDescription>From {order.contact_name || 'Guest'} at Table {order.table_id || 'N/A'}</CardDescription>
            </div>
            <div className="text-right space-y-1">
                <Badge variant={isPaid ? "default" : "secondary"} className={cn(isPaid ? "bg-green-600 text-white" : "bg-yellow-500 text-white")}>
                    {isPaid ? "PAID" : "COD"}
                </Badge>
                {isClient ? <p className="text-xs text-muted-foreground">{timeAgo}</p> : <p className="text-xs text-muted-foreground">...</p>}
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
            {order.order_items.map((item) => (
                <li key={item.id} className="text-sm">
                    <div className="flex justify-between">
                        <span className="font-semibold">{item.menu_items?.name}</span>
                        <span className="font-mono font-semibold">x{item.quantity}</span>
                    </div>
                     <OrderItemCustomizations customizations={item.customizations} />
                    {item.special_instructions && (
                      <div className="mt-1 flex items-start gap-2 rounded-md bg-yellow-50 border border-yellow-200 p-2 text-yellow-800">
                        <MessageSquareQuote className="h-4 w-4 flex-shrink-0 mt-0.5" />
                        <p className="text-xs">{item.special_instructions}</p>
                      </div>
                    )}
                </li>
            ))}
        </ul>
      </CardContent>
      <Separator />
      <CardFooter className="py-3 px-4">
        {overallStatus === 'pending' && (
            <div className="w-full flex gap-2">
                <Button variant="outline" className="w-full" onClick={() => onUpdateStatus(order.id, 'rejected')} disabled={isUpdating}>
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject
                </Button>
                <Button className="w-full" onClick={() => onUpdateStatus(order.id, 'accepted')} disabled={isUpdating}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Accept
                </Button>
            </div>
        )}
        {overallStatus === 'accepted' && (
            <Button className="w-full" onClick={() => onUpdateStatus(order.id, 'preparing')} disabled={isUpdating}>
                <ChefHat className="mr-2 h-4 w-4" />
                Mark as Preparing
            </Button>
        )}
        {overallStatus === 'preparing' && (
            <Button className="w-full" onClick={() => onUpdateStatus(order.id, 'ready_for_pickup')} disabled={isUpdating}>
                <CookingPot className="mr-2 h-4 w-4" />
                Mark as Ready
            </Button>
        )}
        {overallStatus === 'ready_for_pickup' && (
             <Button className="w-full" onClick={() => onUpdateStatus(order.id, 'delivered')} disabled={isUpdating}>
                <PackageCheck className="mr-2 h-4 w-4" />
                Mark as Delivered
            </Button>
        )}
        {overallStatus === 'delivered' && (
            order.payment_method === 'cod' ? (
                <Button className="w-full" onClick={() => onMarkAsPaid(order.id)} disabled={isUpdating}>
                    <DollarSign className="mr-2 h-4 w-4" />
                    Mark as Paid (COD)
                </Button>
            ) : (
                <p className="text-sm text-green-600 font-medium flex items-center w-full justify-center">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Order Completed
                </p>
            )
        )}
        {overallStatus === 'completed' && (
            <p className="text-sm text-green-600 font-medium flex items-center w-full justify-center">
                <CheckCircle className="mr-2 h-4 w-4" />
                Order Completed
            </p>
        )}
        {overallStatus === 'rejected' && (
            <p className="text-sm text-red-600 font-medium flex items-center w-full justify-center">
                <XCircle className="mr-2 h-4 w-4" />
                Order Rejected
            </p>
        )}
      </CardFooter>
    </Card>
  )
}

function OrdersDisplay() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stallId, setStallId] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isUpdating, startTransition] = useTransition();
  const { toast } = useToast();
  const supabase = createSupabaseBrowserClient();
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    setAudio(new Audio('/notification.mp3'));
  }, []);

  const fetchOrders = useCallback(async (id: string) => {
    const fetchedOrders = await getVendorOrders(id);
    setOrders(fetchedOrders);
    setIsLoading(false);
  }, []);
  
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth event:', event);
      setSession(session);
      // If the token has been refreshed, we might need to update the realtime client
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        supabase.realtime.setAuth(session?.access_token || null);
      }
    });

    // Also get the initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
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
    if (!stallId || !session) return;

    const channel = supabase
      .channel(`public:orders:stall=${stallId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, 
        (payload) => {
            console.log('New order received:', payload);
            toast({
                title: "🎉 New Order!",
                description: "You have a new order waiting for acceptance.",
            });
            audio?.play().catch(e => console.error("Error playing notification sound:", e));
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
  }, [stallId, supabase, fetchOrders, toast, audio, session]);

  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    const originalOrders = orders;
    setOrders(prevOrders => 
        prevOrders.map(order => 
            order.id === orderId ? { ...order, status: newStatus } : order
        )
    );

    startTransition(async () => {
      try {
        await updateOrderStatus(orderId, newStatus);
        // No success toast for better UX, the card moves column instead
        if (stallId) {
            // Re-sync to get the final state from DB, especially for auto-completion
            fetchOrders(stallId); 
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Update Failed",
          description: "Could not update the order status. Please try again.",
        })
        console.error('Failed to update order status:', error);
        setOrders(originalOrders);
      }
    });
  };

  const handleMarkAsPaid = async (orderId: string) => {
     setOrders(prevOrders => 
        prevOrders.map(order => 
            order.id === orderId ? { ...order, status: 'completed' } : order
        )
    );
    startTransition(async () => {
         try {
            await markOrderAsPaid(orderId);
         } catch(error) {
            toast({
              variant: "destructive",
              title: "Update Failed",
              description: "Could not mark order as paid.",
            });
            console.error('Failed to mark order as paid:', error);
            if (stallId) {
                fetchOrders(stallId);
            }
         }
    });
  }
  
  if (isLoading) {
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

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const preparingOrders = orders.filter(o => o.status === 'accepted' || o.status === 'preparing');
  const readyOrders = orders.filter(o => o.status === 'ready_for_pickup');
  const deliveredOrders = orders.filter(o => ['delivered', 'completed', 'rejected'].includes(o.status));

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-lg font-semibold md:text-2xl">
          Order Management
        </h1>
      </div>
      <Tabs defaultValue="pending" className="mt-4">
        <TabsList className="grid w-full grid-cols-4 h-auto">
          <TabsTrigger value="pending">
            New <Badge variant="destructive" className="ml-2">{pendingOrders.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="preparing">
            Preparing <Badge className="ml-2">{preparingOrders.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="ready">
            Ready <Badge className="ml-2">{readyOrders.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="delivered">Delivered</TabsTrigger>
        </TabsList>
        <TabsContent value="pending" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
             {pendingOrders.length > 0 ? pendingOrders.map(order => <OrderCard key={order.id} order={order} onUpdateStatus={handleUpdateOrderStatus} onMarkAsPaid={handleMarkAsPaid} isUpdating={isUpdating} />) : <p className="text-muted-foreground col-span-full text-center py-8">No new orders.</p>}
          </div>
        </TabsContent>
        <TabsContent value="preparing" className="mt-4">
           <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
             {preparingOrders.length > 0 ? preparingOrders.map(order => <OrderCard key={order.id} order={order} onUpdateStatus={handleUpdateOrderStatus} onMarkAsPaid={handleMarkAsPaid} isUpdating={isUpdating} />) : <p className="text-muted-foreground col-span-full text-center py-8">No orders are being prepared.</p>}
          </div>
        </TabsContent>
        <TabsContent value="ready" className="mt-4">
           <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
             {readyOrders.length > 0 ? readyOrders.map(order => <OrderCard key={order.id} order={order} onUpdateStatus={handleUpdateOrderStatus} onMarkAsPaid={handleMarkAsPaid} isUpdating={isUpdating} />) : <p className="text-muted-foreground col-span-full text-center py-8">No orders are ready for pickup.</p>}
          </div>
        </TabsContent>
        <TabsContent value="delivered" className="mt-4">
           <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
             {deliveredOrders.length > 0 ? deliveredOrders.map(order => <OrderCard key={order.id} order={order} onUpdateStatus={handleUpdateOrderStatus} onMarkAsPaid={handleMarkAsPaid} isUpdating={isUpdating} />) : <p className="text-muted-foreground col-span-full text-center py-8">No delivered or completed orders yet today.</p>}
          </div>
        </TabsContent>
      </Tabs>
    </>
  )
}

export default function VendorOrdersPage() {
  return (
    <Suspense fallback={
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
    }>
      <OrdersDisplay />
    </Suspense>
  )
}

    