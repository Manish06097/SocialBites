
'use client';

import React, { useMemo, useState, useEffect } from 'react';
import Image from 'next/image';
import { formatInTimeZone } from 'date-fns-tz';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Order, OrderItem, OrderStatus } from '@/lib/types';
import { Separator } from './ui/separator';
import { cn } from '@/lib/utils';
import { Check, ChefHat, PackageCheck, List } from 'lucide-react';


const OrderStatusTimeline = ({ status }: { status: OrderStatus }) => {
    const statuses: OrderStatus[] = ['pending', 'accepted', 'preparing', 'delivered'];
    const currentStatusIndex = statuses.indexOf(status);

    const getStatusIcon = (s: OrderStatus) => {
        switch(s) {
            case 'pending': return <List className="h-5 w-5" />;
            case 'accepted': return <Check className="h-5 w-5" />;
            case 'preparing': return <ChefHat className="h-5 w-5" />;
            case 'delivered': return <PackageCheck className="h-5 w-5" />;
            default: return <List className="h-5 w-5" />;
        }
    }

    const getStatusLabel = (s: OrderStatus) => {
        if (s === 'delivered') return 'Out for Delivery';
        return s.charAt(0).toUpperCase() + s.slice(1);
    }
    
    if (status === 'completed' || status === 'rejected') {
        return <Badge variant={status === 'completed' ? 'default' : 'destructive'} className="capitalize">{status}</Badge>;
    }

    return (
        <div className="w-full pt-2">
            <div className="relative flex items-center justify-between">
                <div className="absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 bg-border" />
                <div className="absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 bg-primary transition-all duration-500" style={{ width: `${(currentStatusIndex / (statuses.length - 1)) * 100}%` }} />
                {statuses.map((s, index) => (
                    <div key={s} className="relative z-10 flex flex-col items-center">
                        <div
                            className={cn(
                                'flex h-8 w-8 items-center justify-center rounded-full bg-background border-2 transition-colors duration-500',
                                index <= currentStatusIndex ? 'border-primary' : 'border-border'
                            )}
                        >
                            <div className={cn('flex h-6 w-6 items-center justify-center rounded-full transition-colors duration-500', index <= currentStatusIndex ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                               {getStatusIcon(s)}
                            </div>
                        </div>
                        <span className="mt-1.5 text-xs text-center font-medium text-muted-foreground">{getStatusLabel(s)}</span>
                    </div>
                ))}
            </div>
        </div>
    );
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


    return (
        <Card className="transition-all duration-300">
            <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="font-headline text-2xl">Order #{getShortDisplayId(order.display_id)}</CardTitle>
                        <CardDescription className="text-xs">
                            Placed on {formatInTimeZone(new Date(order.created_at), IST_TIMEZONE, "MMMM d, yyyy 'at' h:mm a")}
                        </CardDescription>
                    </div>
                </div>
                 <OrderStatusTimeline status={order.status} />
            </CardHeader>
            <Separator />
            <CardContent className="space-y-4 pt-4">
               {Object.entries(itemsByStall).map(([stallName, stallData]) => (
                 <div key={stallName}>
                    <h3 className="font-headline text-lg font-semibold mb-2">{stallData.stallName}</h3>
                    <div className="space-y-3">
                    {stallData.items.map(item => (
                        <div key={item.id} className="flex items-center justify-between gap-3 rounded-md border p-3">
                            <div className="flex items-center gap-3">
                                <Image 
                                    src={item.menu_items?.image_url ?? "https://placehold.co/48x48.png"} 
                                    alt={item.menu_items?.name ?? "Menu item"} 
                                    width={48} 
                                    height={48} 
                                    className="rounded-md bg-muted"
                                    data-ai-hint="food item"
                                />
                                <div>
                                    <p className="font-semibold text-sm">{item.menu_items?.name}</p>
                                    <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                                </div>
                            </div>
                             <Badge variant="outline" className={`font-semibold text-xs capitalize`}>{item.status || 'N/A'}</Badge>
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

// This component is now simplified to just render the orders it receives as props.
// The real-time logic is handled by its parent, OrderPageClient.
export default function LatestOrdersTracker({ initialOrders }: LatestOrdersTrackerProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);

  useEffect(() => {
    setOrders(initialOrders); // Update state if the initialOrders prop changes
  }, [initialOrders]);
  
  if (orders.length === 0) {
    return null; // The parent component will handle the empty state message.
  }

  return (
    <div className="space-y-6">
      {orders.map(order => <OrderCard key={order.id} order={order} />)}
    </div>
  );
}
