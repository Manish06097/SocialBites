
'use client';

import Image from 'next/image';
import { useMemo, useState, useEffect } from 'react';
import { formatInTimeZone } from 'date-fns-tz';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Order, OrderItem, OrderStatus } from '@/lib/types';
import { Separator } from './ui/separator';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

const statusDisplayConfig: Record<OrderStatus, { text: string; className: string, description: string }> = {
  pending: { text: 'Pending', className: 'bg-gray-100 text-gray-800 animate-pulse', description: 'Your order is waiting for the stalls to accept.' },
  accepted: { text: 'Accepted', className: 'bg-blue-100 text-blue-800', description: 'The stalls have accepted your order and will start preparing it soon!' },
  preparing: { text: 'Preparing', className: 'bg-orange-100 text-orange-800 animate-pulse', description: 'Your delicious food is being prepared by the chefs.' },
  delivered: { text: 'Delivered', className: 'bg-purple-100 text-purple-800', description: 'Your order has been delivered. Enjoy your meal!' },
  completed: { text: 'Completed', className: 'bg-green-100 text-green-800', description: 'Your order is complete. Hope you enjoyed it!' },
  rejected: { text: 'Rejected', className: 'bg-red-100 text-red-800', description: 'Unfortunately, your order could not be processed.' },
};

const itemStatusDisplayConfig: Record<OrderStatus, { text: string; className: string }> = {
  pending: { text: 'Pending', className: 'bg-gray-200 text-gray-700' },
  accepted: { text: 'Accepted', className: 'bg-blue-200 text-blue-800' },
  preparing: { text: 'Preparing', className: 'bg-orange-200 text-orange-800' },
  delivered: { text: 'Delivered', className: 'bg-purple-200 text-purple-800' },
  completed: { text: 'Completed', className: 'bg-green-200 text-green-800' },
  rejected: { text: 'Rejected', className: 'bg-red-200 text-red-800' },
};


function groupItemsByStall(items: OrderItem[]) {
    if (!items) return {};
    return items.reduce((acc, item) => {
        const stallId = item.stalls?.name ?? 'Unknown Stall';
        if (!acc[stallId]) {
            acc[stallId] = {
                stallName: stallId,
                items: [],
            };
        }
        acc[stallId].items.push(item);
        return acc;
    }, {} as Record<string, { stallName: string; items: OrderItem[] }>);
}

function getShortDisplayId(displayId: string) {
    const parts = displayId.split('-');
    if (parts.length > 2) {
        return `SSB-${parts[parts.length - 1]}`;
    }
    return displayId;
}

function OrderCard({order}: {order: Order}) {
    const itemsByStall = groupItemsByStall(order.order_items);
    const IST_TIMEZONE = 'Asia/Kolkata';

    const overallStatus = useMemo(() => {
        const allItemStatuses = order.order_items.map(item => item.status);
        if (allItemStatuses.every(s => s === 'completed')) return 'completed';
        if (allItemStatuses.every(s => ['completed', 'rejected'].includes(s))) return 'completed';
        if (allItemStatuses.some(s => s === 'pending')) return 'pending';
        if (allItemStatuses.some(s => s === 'accepted')) return 'accepted';
        if (allItemStatuses.some(s => s === 'preparing')) return 'preparing';
        if (allItemStatuses.some(s => s === 'delivered')) return 'delivered';
        return 'pending'; // Fallback
    }, [order.order_items]);

    const statusConfig = statusDisplayConfig[overallStatus];

    return (
        <Card className="transition-all duration-300">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="font-headline text-3xl">Order #{getShortDisplayId(order.display_id)}</CardTitle>
                        <CardDescription>
                            Placed on {formatInTimeZone(new Date(order.created_at), IST_TIMEZONE, "MMMM d, yyyy 'at' h:mm a")}
                        </CardDescription>
                    </div>
                    <Badge className={`border-transparent text-sm font-bold capitalize ${statusConfig?.className || ''}`}>{statusConfig?.text || 'Unknown'}</Badge>
                </div>
                 <p className="text-sm text-muted-foreground pt-2">{statusConfig?.description}</p>
            </CardHeader>
            <Separator />
            <CardContent className="space-y-6 pt-6">
               {Object.entries(itemsByStall).map(([stallName, stallData]) => (
                 <div key={stallName}>
                    <h3 className="font-headline text-xl font-semibold mb-3">{stallData.stallName}</h3>
                    <div className="space-y-4">
                    {stallData.items.map(item => (
                        <div key={item.id} className="flex items-center justify-between gap-4 rounded-md border p-4">
                            <div className="flex items-center gap-4">
                                <Image 
                                    src={item.menu_items?.image_url ?? "https://placehold.co/64x64.png"} 
                                    alt={item.menu_items?.name ?? "Menu item"} 
                                    width={64} 
                                    height={64} 
                                    className="rounded-md bg-muted"
                                    data-ai-hint="food item"
                                />
                                <div>
                                    <p className="font-semibold">{item.menu_items?.name}</p>
                                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                </div>
                            </div>
                             <Badge variant="outline" className={`font-semibold ${itemStatusDisplayConfig[item.status]?.className}`}>{itemStatusDisplayConfig[item.status]?.text || 'N/A'}</Badge>
                        </div>
                    ))}
                    </div>
                 </div>
               ))}
            </CardContent>
        </Card>
    )
}

interface LatestOrdersTrackerProps {
  initialOrders: Order[];
}

export default function LatestOrdersTracker({ initialOrders }: LatestOrdersTrackerProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);

  useEffect(() => {
    setOrders(initialOrders); // Update state if initialOrders prop changes
  }, [initialOrders]);

  useEffect(() => {
    console.log("LatestOrdersTracker: Component mounted, setting up subscription.");
    const supabase = createSupabaseBrowserClient();
    let channel: any = null; // Use 'any' for RealtimeChannel to avoid import issues for now

    const setupSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log("LatestOrdersTracker: No user found, cannot set up subscription.");
        return;
      }
      console.log("LatestOrdersTracker: User found, setting up subscription for user ID:", user.id);

      channel = supabase
        .channel('orders_status_changes')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'orders',
            filter: `user_id=eq.${user.id}` // Subscribe to all orders for the current user
          },
          (payload) => {
            console.log("LatestOrdersTracker: Received real-time update for order:", payload.new);
            const updatedOrder = payload.new as Order;
            setOrders(prevOrders => {
              const newOrders = prevOrders.map(order => 
                order.id === updatedOrder.id ? updatedOrder : order
              );
              console.log("LatestOrdersTracker: Orders state updated.", newOrders);
              return newOrders;
            });
          }
        )
        .subscribe((status) => {
          console.log("LatestOrdersTracker: Supabase channel subscription status:", status);
        });
    };

    setupSubscription();

    return () => {
      if (channel) {
        console.log("LatestOrdersTracker: Cleaning up subscription.");
        supabase.removeChannel(channel);
      }
    };
  }, []); // Empty dependency array: subscribe once on mount

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          You have no active orders from the last hour.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {orders.map(order => <OrderCard key={order.id} order={order} />)}
    </div>
  );
}
