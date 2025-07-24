
'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import { formatInTimeZone } from 'date-fns-tz';
import type { Order } from '@/lib/types';
import { getPastOrders } from '@/app/orders/actions';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

function getShortDisplayId(displayId: string) {
    const parts = displayId.split('-');
    if (parts.length > 2) {
        return `SSB-${parts[parts.length - 1]}`;
    }
    return displayId;
}

function PastOrder({order}: {order: Order}) {
    const IST_TIMEZONE = 'Asia/Kolkata';
    return (
        <AccordionItem value={order.id}>
            <AccordionTrigger className="hover:no-underline p-4 w-full">
                <div className="flex justify-between items-center w-full">
                    <div>
                        <p className="font-bold text-lg">Order #{getShortDisplayId(order.display_id)}</p>
                        <p className="text-sm text-muted-foreground">{formatInTimeZone(new Date(order.created_at), IST_TIMEZONE, "MMMM d, yyyy")}</p>
                    </div>
                    <p className="font-bold text-lg">₹{order.total_amount.toFixed(2)}</p>
                </div>
            </AccordionTrigger>
            <AccordionContent className="px-4">
                <div className="space-y-2">
                {order.order_items.map(item => (
                    <div key={item.id} className="flex items-center justify-between gap-4 p-2 rounded-md hover:bg-muted/50">
                        <div className="flex items-center gap-3">
                            <Image 
                                src={item.menu_items.image_url} 
                                alt={item.menu_items.name} 
                                width={40} 
                                height={40} 
                                className="rounded-md bg-muted"
                                data-ai-hint="food item"
                            />
                            <div>
                                <p className="font-semibold">{item.menu_items.name}</p>
                                <p className="text-xs text-muted-foreground">{item.stalls.name} • Qty: {item.quantity}</p>
                            </div>
                        </div>
                        <p className="font-semibold text-sm">₹{item.total_price.toFixed(2)}</p>
                    </div>
                ))}
                </div>
            </AccordionContent>
        </AccordionItem>
    )
}

interface PastOrdersListProps {
    initialOrders: Order[];
    latestOrderIds: string[];
}

export default function PastOrdersList({ initialOrders, latestOrderIds }: PastOrdersListProps) {
    const [orders, setOrders] = useState<Order[]>(initialOrders);
    const [offset, setOffset] = useState(initialOrders.length);
    const [hasMore, setHasMore] = useState(initialOrders.length === 5); // Assume there's more if we got the full initial limit
    const [isPending, startTransition] = useTransition();

    const handleLoadMore = () => {
        startTransition(async () => {
            const result = await getPastOrders({
                currentOrderIds: latestOrderIds,
                limit: 10,
                offset: offset
            });

            if (result.orders && result.orders.length > 0) {
                setOrders(prev => [...prev, ...result.orders!]);
                setOffset(prev => prev + result.orders!.length);
                if (result.orders.length < 10) {
                    setHasMore(false);
                }
            } else {
                setHasMore(false);
            }
        });
    }

    return (
        <Card>
            <CardContent className="p-0">
                <Accordion type="multiple" className="w-full">
                    {orders.length > 0 ? (
                        orders.map(order => <PastOrder key={order.id} order={order} />)
                    ) : (
                        <div className="p-6 text-center text-muted-foreground">
                            You have no past orders.
                        </div>
                    )}
                </Accordion>
                {hasMore && (
                    <div className="p-4 border-t">
                        <Button 
                            onClick={handleLoadMore} 
                            disabled={isPending}
                            className="w-full"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Loading...
                                </>
                            ) : 'View More'}
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
