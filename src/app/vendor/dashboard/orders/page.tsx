
'use client';

import { useState, useEffect } from 'react';
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
import { CheckCircle, XCircle, Bike } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Order, OrderStatus } from '@/lib/types';
import { getVendorStallId, getVendorOrders, updateOrderItemStatus } from '@/app/vendor/actions';
import { useRouter } from 'next/navigation';

const OrderCard = ({ order, onUpdateStatus }: { order: Order; onUpdateStatus: (orderId: string, newStatus: OrderStatus) => void }) => {
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
    }, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [order.created_at]);

  // Determine the overall status of the order based on its items
  const overallStatus: OrderStatus = order.order_items.every(item => item.status === 'completed')
    ? 'completed'
    : order.order_items.every(item => item.status === 'rejected')
    ? 'rejected'
    : order.order_items.some(item => item.status === 'ready_for_pickup')
    ? 'ready_for_pickup'
    : order.order_items.some(item => item.status === 'preparing')
    ? 'preparing'
    : order.order_items.some(item => item.status === 'accepted')
    ? 'accepted'
    : 'pending';

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                 <CardTitle className="text-xl">Order #{order.display_id}</CardTitle>
                 <CardDescription>From {order.contact_name || 'Guest'} at Table {order.table_id || 'N/A'}</CardDescription>
            </div>
            <div className="text-right">
                <p className="font-bold text-lg">₹{order.total_amount.toFixed(2)}</p>
                {isClient ? <p className="text-xs text-muted-foreground">{timeAgo}</p> : <p className="text-xs text-muted-foreground">...</p>}
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
            {order.order_items.map((item) => (
                <li key={item.id} className="flex justify-between">
                    <span>{item.menu_items?.name}</span>
                    <span className="font-mono">x{item.quantity}</span>
                </li>
            ))}
        </ul>
      </CardContent>
      <Separator />
      <CardFooter className="py-3 px-4">
        {overallStatus === 'pending' && (
            <div className="w-full flex gap-2">
                <Button variant="outline" className="w-full" onClick={() => onUpdateStatus(order.id, 'rejected')}>
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject
                </Button>
                <Button className="w-full" onClick={() => onUpdateStatus(order.id, 'accepted')}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Accept
                </Button>
            </div>
        )}
        {overallStatus === 'accepted' && (
            <Button className="w-full" onClick={() => onUpdateStatus(order.id, 'preparing')}>
                <Bike className="mr-2 h-4 w-4" />
                Mark as Preparing
            </Button>
        )}
        {overallStatus === 'preparing' && (
            <Button className="w-full" onClick={() => onUpdateStatus(order.id, 'ready_for_pickup')}>
                <Bike className="mr-2 h-4 w-4" />
                Mark as Ready
            </Button>
        )}
        {overallStatus === 'ready_for_pickup' && (
             <Button className="w-full" onClick={() => onUpdateStatus(order.id, 'completed')}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Mark as Completed
            </Button>
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

export default function VendorOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      const stallId = await getVendorStallId();
      if (stallId) {
        const fetchedOrders = await getVendorOrders(stallId);
        setOrders(fetchedOrders);
      } else {
        console.error('Could not retrieve vendor stall ID.');
        setOrders([]);
      }
      setIsLoading(false);
    };

    fetchOrders();
    // Removed setInterval for continuous refreshing as per user feedback
  }, []);

  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      // Find the order and update all its items
      const orderToUpdate = orders.find(order => order.id === orderId);
      if (orderToUpdate) {
        for (const item of orderToUpdate.order_items) {
          await updateOrderItemStatus(item.id, newStatus);
        }
        // Re-fetch orders to reflect the changes
        const stallId = await getVendorStallId();
        if (stallId) {
          const updatedOrders = await getVendorOrders(stallId);
          setOrders(updatedOrders);
        }
      }
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };
  
  if (isLoading) {
    return (
        <>
            <div className="flex items-center justify-between">
                <h1 className="font-headline text-lg font-semibold md:text-2xl">
                Order Management
                </h1>
            </div>
            <Tabs defaultValue="pending" className="mt-4">
              <TabsList className="grid w-full grid-cols-4 h-auto">
                <TabsTrigger value="pending">New</TabsTrigger>
                <TabsTrigger value="preparing">Preparing</TabsTrigger>
                <TabsTrigger value="ready_for_pickup">Ready</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
               <TabsContent value="pending" className="mt-4">
                  <p className="text-muted-foreground col-span-full text-center py-8">Loading orders...</p>
               </TabsContent>
            </Tabs>
        </>
    )
  }

  const pendingOrders = orders.filter(o => o.order_items.some(item => item.status === 'pending' || item.status === 'accepted'));
  const preparingOrders = orders.filter(o => o.order_items.some(item => item.status === 'preparing'));
  const readyOrders = orders.filter(o => o.order_items.some(item => item.status === 'ready_for_pickup'));
  const completedOrders = orders.filter(o => o.order_items.every(item => item.status === 'completed' || item.status === 'rejected'));

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
          <TabsTrigger value="ready_for_pickup">
            Ready <Badge className="ml-2">{readyOrders.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        <TabsContent value="pending" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
             {pendingOrders.length > 0 ? pendingOrders.map(order => <OrderCard key={order.id} order={order} onUpdateStatus={handleUpdateOrderStatus} />) : <p className="text-muted-foreground col-span-full text-center py-8">No new orders.</p>}
          </div>
        </TabsContent>
        <TabsContent value="preparing" className="mt-4">
           <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
             {preparingOrders.length > 0 ? preparingOrders.map(order => <OrderCard key={order.id} order={order} onUpdateStatus={handleUpdateOrderStatus} />) : <p className="text-muted-foreground col-span-full text-center py-8">No orders are being prepared.</p>}
          </div>
        </TabsContent>
        <TabsContent value="ready_for_pickup" className="mt-4">
           <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
             {readyOrders.length > 0 ? readyOrders.map(order => <OrderCard key={order.id} order={order} onUpdateStatus={handleUpdateOrderStatus} />) : <p className="text-muted-foreground col-span-full text-center py-8">No orders are ready for pickup.</p>}
          </div>
        </TabsContent>
        <TabsContent value="completed" className="mt-4">
           <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
             {completedOrders.length > 0 ? completedOrders.map(order => <OrderCard key={order.id} order={order} onUpdateStatus={handleUpdateOrderStatus} />) : <p className="text-muted-foreground col-span-full text-center py-8">No completed orders yet.</p>}
          </div>
        </TabsContent>
      </Tabs>
    </>
  )
}
