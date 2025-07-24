
'use server';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Order, OrderItem, OrderStatus } from '@/lib/types';
import { getLatestOrders, getPastOrders } from '../actions';
import Image from 'next/image';
import { Accordion } from '@/components/ui/accordion';
import { formatInTimeZone } from 'date-fns-tz';
import PastOrdersList from '@/components/PastOrdersList';

const statusDisplayConfig: Record<OrderStatus, { text: string; className: string }> = {
  pending: { text: 'Pending', className: 'bg-gray-100 text-gray-800' },
  accepted: { text: 'Accepted', className: 'bg-blue-100 text-blue-800' },
  preparing: { text: 'Preparing', className: 'bg-orange-100 text-orange-800' },
  ready_for_pickup: { text: 'Ready for Pickup', className: 'bg-yellow-100 text-yellow-800' },
  completed: { text: 'Completed', className: 'bg-green-100 text-green-800' },
  rejected: { text: 'Rejected', className: 'bg-red-100 text-red-800' },
};

function groupItemsByStall(items: OrderItem[]) {
    return items.reduce((acc, item) => {
        const stallId = item.stall_id;
        if (!acc[stallId]) {
            acc[stallId] = {
                stallName: item.stalls.name,
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
        <Card>
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
                                    src={item.menu_items.image_url} 
                                    alt={item.menu_items.name} 
                                    width={64} 
                                    height={64} 
                                    className="rounded-md bg-muted"
                                    data-ai-hint="food item"
                                />
                                <div>
                                    <p className="font-semibold">{item.menu_items.name}</p>
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

export default async function OrderTrackingPage({ params }: { params: { orderId: string } }) {
  const {orders: latestOrders, error: latestOrdersError} = await getLatestOrders();
  
  if (latestOrdersError) {
    // Handle error appropriately, maybe show an error message
    console.error(latestOrdersError);
  }

  const latestOrderIds = latestOrders?.map(o => o.id) || [];
  const {orders: initialPastOrders, error: pastOrdersError} = await getPastOrders({currentOrderIds: latestOrderIds, limit: 5});

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 md:px-6 space-y-8">
      <div>
        <h2 className="font-headline text-3xl font-bold mb-4">Latest Orders</h2>
        {latestOrders && latestOrders.length > 0 ? (
            <div className="space-y-6">
                {latestOrders.map(order => <OrderCard key={order.id} order={order} />)}
            </div>
        ) : (
             <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                    You have no active orders from the last hour.
                </CardContent>
             </Card>
        )}
      </div>

      <div>
        <h2 className="font-headline text-3xl font-bold mb-4">Past Orders</h2>
        <PastOrdersList 
            initialOrders={initialPastOrders || []} 
            latestOrderIds={latestOrderIds} 
        />
      </div>
    </div>
  );
}
