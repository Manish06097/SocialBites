'use client';

import { useState } from 'react';
import PastOrdersList from "@/components/PastOrdersList";
import LatestOrdersTracker from "@/components/LatestOrdersTracker";
import type { Order } from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface OrdersPageProps {
    activeOrders: Order[];
    pastOrders: Order[];
    latestOrderIds: string[];
}

export default function OrdersPage({ activeOrders, pastOrders: initialPastOrders, latestOrderIds }: OrdersPageProps) {
    const [pastOrders, setPastOrders] = useState<Order[]>(initialPastOrders);

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="font-headline text-3xl font-bold mb-6">My Orders</h1>
            <Tabs defaultValue="active" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="active">Active Orders</TabsTrigger>
                    <TabsTrigger value="past">Past Orders</TabsTrigger>
                </TabsList>
                <TabsContent value="active" className="mt-6">
                    {activeOrders.length > 0 ? (
                        <LatestOrdersTracker initialOrders={activeOrders} />
                    ) : (
                        <div className="text-center text-muted-foreground p-6">
                            You have no active orders.
                        </div>
                    )}
                </TabsContent>
                <TabsContent value="past" className="mt-6">
                    {pastOrders.length > 0 ? (
                        <PastOrdersList 
                            initialOrders={pastOrders} 
                            setPastOrders={setPastOrders} 
                            latestOrderIds={latestOrderIds} 
                        />
                    ) : (
                        <div className="text-center text-muted-foreground p-6">
                            You have no past orders.
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
