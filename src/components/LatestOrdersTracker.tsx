
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { formatInTimeZone } from 'date-fns-tz';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import type { Order, OrderItem, OrderStatus } from '@/lib/types';

const statusDisplayConfig: Record<OrderStatus, { text: string; className: string }> = {
  pending: { text: 'Pending', className: 'bg-gray-100 text-gray-800 animate-pulse' },
  accepted: { text: 'Accepted', className: 'bg-blue-100 text-blue-800' },
  preparing: { text: 'Preparing', className: 'bg-orange-100 text-orange-800 animate-pulse' },
  ready_for_pickup: { text: 'Ready for Pickup', className: 'bg-yellow-100 text-yellow-800 animate-pulse' },
  completed: { text: 'Completed', className: 'bg-green-100 text-green-800' },
  rejected: { text: 'Rejected', className: 'bg-red-100 text-red-800' },
};

function groupItemsByStall(items: OrderItem[]) {
    return items.reduce((acc, item) => {
        const stallId = item.stall_id;
        if (!acc[stallId]) {
            acc[stallId] = {
                stallName: item.stalls?.name ?? 'Unknown Stall',
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
                    <Badge className={`border-transparent text-sm font-bold capitalize ${statusDisplayConfig[order.status].className}`}>{statusDisplayConfig[order.status].text}</Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
               {Object.entries(itemsByStall).map(([stallId, stallData]) => (
                 <div key={stallId}>
                    <h3 className="font-headline text-xl font-semibold mb-2">{stallData.stallName}</h3>
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
                                    <Badge variant="secondary" className={`capitalize mt-1 ${statusDisplayConfig[item.status].className}`}>{statusDisplayConfig[item.status].text}</Badge>
                                </div>
                            </div>
                            <p className="font-bold">₹{item.total_price.toFixed(2)}</p>
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
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    // Make sure we only run this on the client
    if (typeof window === 'undefined') {
      return;
    }

    const determineOverallStatus = (items: OrderItem[]): OrderStatus => {
        const itemStatuses = items.map(item => item.status);
        if (itemStatuses.every(s => s === 'completed')) return 'completed';
        if (itemStatuses.every(s => s === 'rejected')) return 'rejected';
        if (itemStatuses.some(s => s === 'ready_for_pickup')) return 'ready_for_pickup';
        if (itemStatuses.some(s => s === 'preparing')) return 'preparing';
        if (itemStatuses.some(s => s === 'accepted')) return 'accepted';
        return 'pending';
    };

    const handleOrderUpdate = (payload: any) => {
        const updatedOrder = payload.new as Order;
        console.log('Realtime `orders` update received:', updatedOrder);
        setOrders(currentOrders => 
            currentOrders.map(order => 
                order.id === updatedOrder.id ? { ...order, ...updatedOrder, status: determineOverallStatus(order.order_items) } : order
            )
        );
    };
    
    const handleOrderItemUpdate = (payload: any) => {
        const updatedItem = payload.new as OrderItem;
        console.log('Realtime `order_items` update received:', updatedItem);
        setOrders(currentOrders => {
            return currentOrders.map(order => {
                if (order.id === updatedItem.order_id) {
                    // This is the order that contains the updated item.
                    const updatedItems = order.order_items.map(item =>
                        item.id === updatedItem.id ? { ...item, status: updatedItem.status } : item
                    );
                    
                    const newOverallStatus = determineOverallStatus(updatedItems);
                    
                    return { ...order, order_items: updatedItems, status: newOverallStatus };
                }
                return order;
            });
        });
    };

    const ordersSubscription = supabase
        .channel('public:orders:userId=eq.123') // A unique channel name is good practice
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, handleOrderUpdate)
        .subscribe((status, err) => {
            console.log('`orders` subscription status:', status);
            if (err) {
                console.error('`orders` subscription error:', err);
            }
        });
        
    const orderItemsSubscription = supabase
      .channel('public:order_items:userId=eq.123') // A unique channel name is good practice
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'order_items' }, handleOrderItemUpdate)
      .subscribe((status, err) => {
            console.log('`order_items` subscription status:', status);
            if (err) {
                console.error('`order_items` subscription error:', err);
            }
      });


    return () => {
      supabase.removeChannel(ordersSubscription);
      supabase.removeChannel(orderItemsSubscription);
    };
  }, [supabase]);

  // Filter out orders that are completed/rejected from the real-time view
  const activeOrders = orders.filter(order => order.status !== 'completed' && order.status !== 'rejected');

  if (activeOrders.length === 0) {
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
      {activeOrders.map(order => <OrderCard key={order.id} order={order} />)}
    </div>
  );
}
