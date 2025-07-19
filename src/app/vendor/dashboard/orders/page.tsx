
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
import { useSound } from '@/hooks/use-sound';

type OrderStatus = 'new' | 'preparing' | 'ready' | 'completed';

interface Order {
  id: string;
  customerName: string;
  table: string;
  status: OrderStatus;
  items: { name: string; quantity: number }[];
  total: number;
  timestamp: Date;
}

const OrderCard = ({ order, onUpdateStatus }: { order: Order; onUpdateStatus: (id: string, status: OrderStatus) => void }) => {
  const [timeAgo, setTimeAgo] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const calculateTimeSince = () => {
      const seconds = Math.floor((new Date().getTime() - new Date(order.timestamp).getTime()) / 1000);
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
  }, [order.timestamp]);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                 <CardTitle className="text-xl">Order #{order.id.split('-')[1]}</CardTitle>
                 <CardDescription>From {order.customerName} at Table {order.table}</CardDescription>
            </div>
            <div className="text-right">
                <p className="font-bold text-lg">₹{order.total.toFixed(2)}</p>
                {isClient ? <p className="text-xs text-muted-foreground">{timeAgo}</p> : <p className="text-xs text-muted-foreground">...</p>}
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
            {order.items.map((item, index) => (
                <li key={index} className="flex justify-between">
                    <span>{item.name}</span>
                    <span className="font-mono">x{item.quantity}</span>
                </li>
            ))}
        </ul>
      </CardContent>
      <Separator />
      <CardFooter className="py-3 px-4">
        {order.status === 'new' && (
            <div className="w-full flex gap-2">
                <Button variant="outline" className="w-full" onClick={() => onUpdateStatus(order.id, 'completed')}>
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject
                </Button>
                <Button className="w-full" onClick={() => onUpdateStatus(order.id, 'preparing')}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Accept
                </Button>
            </div>
        )}
         {order.status === 'preparing' && (
            <Button className="w-full" onClick={() => onUpdateStatus(order.id, 'ready')}>
                <Bike className="mr-2 h-4 w-4" />
                Mark as Ready
            </Button>
        )}
        {order.status === 'ready' && (
             <Button className="w-full" onClick={() => onUpdateStatus(order.id, 'completed')}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Mark as Completed
            </Button>
        )}
        {order.status === 'completed' && (
            <p className="text-sm text-green-600 font-medium flex items-center w-full justify-center">
                <CheckCircle className="mr-2 h-4 w-4" />
                Order Completed
            </p>
        )}
      </CardFooter>
    </Card>
  )
}

export default function VendorOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [playNotification] = useSound('/notification.mp3');

  useEffect(() => {
    // This ensures this code only runs on the client, preventing hydration mismatch
    // by ensuring mock data (with dynamic timestamps) is only created client-side.
    setIsClient(true);
    const initialOrders: Order[] = [
      {
        id: 'SSB-54321',
        customerName: 'Aisha Sharma',
        table: 'T05',
        status: 'new',
        items: [
          { name: 'Butter Locho', quantity: 2 },
          { name: 'Khaman', quantity: 1 },
        ],
        total: 220,
        timestamp: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
      },
      {
        id: 'SSB-54322',
        customerName: 'Vikram Singh',
        table: 'T02',
        status: 'preparing',
        items: [
          { name: 'Cheese Roll Locho', quantity: 1 },
        ],
        total: 120,
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
      },
      {
        id: 'SSB-54323',
        customerName: 'Priya Mehta',
        table: 'T08',
        status: 'new',
        items: [
          { name: 'Butter Locho', quantity: 1 },
        ],
        total: 80,
        timestamp: new Date(Date.now() - 1 * 60 * 1000),
      },
      {
        id: 'SSB-54324',
        customerName: 'Karan Desai',
        table: 'T01',
        status: 'ready',
        items: [
          { name: 'Khaman', quantity: 3 },
        ],
        total: 180,
        timestamp: new Date(Date.now() - 10 * 60 * 1000),
      },
      {
        id: 'SSB-54325',
        customerName: 'Sneha Patel',
        table: 'T11',
        status: 'completed',
        items: [
          { name: 'Butter Locho', quantity: 1 },
          { name: 'Cheese Roll Locho', quantity: 1 },
        ],
        total: 200,
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
      },
    ];
    setOrders(initialOrders);

    // Simulate new orders arriving
    const interval = setInterval(() => {
        const newOrderId = `SSB-${Math.floor(Math.random() * 90000) + 10000}`;
        const newOrder: Order = {
            id: newOrderId,
            customerName: "New Customer",
            table: `T${Math.floor(Math.random() * 20)}`,
            status: 'new',
            items: [{ name: 'Butter Locho', quantity: 1 }],
            total: 80,
            timestamp: new Date(),
        };
        setOrders(prevOrders => [newOrder, ...prevOrders]);
        playNotification();
    }, 15000); // Every 15 seconds

    return () => clearInterval(interval); // Cleanup on unmount

  }, [playNotification]);

  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };
  
  if (!isClient) {
    // Render a skeleton or loading state on the server and initial client render
    return (
        <>
            <div className="flex items-center justify-between">
                <h1 className="font-headline text-lg font-semibold md:text-2xl">
                Order Management
                </h1>
            </div>
            <Tabs defaultValue="new" className="mt-4">
              <TabsList className="grid w-full grid-cols-2 h-auto">
                <TabsTrigger value="new">New</TabsTrigger>
                <TabsTrigger value="preparing">Preparing</TabsTrigger>
                <TabsTrigger value="ready">Ready</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
               <TabsContent value="new" className="mt-4">
                  <p className="text-muted-foreground col-span-full text-center py-8">Loading orders...</p>
               </TabsContent>
            </Tabs>
        </>
    )
  }

  const newOrders = orders.filter(o => o.status === 'new');
  const preparingOrders = orders.filter(o => o.status === 'preparing');
  const readyOrders = orders.filter(o => o.status === 'ready');
  const completedOrders = orders.filter(o => o.status === 'completed');

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-lg font-semibold md:text-2xl">
          Order Management
        </h1>
      </div>
      <Tabs defaultValue="new" className="mt-4">
        <TabsList className="grid w-full grid-cols-2 h-auto">
          <TabsTrigger value="new">
            New <Badge variant="destructive" className="ml-2">{newOrders.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="preparing">
            Preparing <Badge className="ml-2">{preparingOrders.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="ready">
            Ready <Badge className="ml-2">{readyOrders.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        <TabsContent value="new" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
             {newOrders.length > 0 ? newOrders.map(order => <OrderCard key={order.id} order={order} onUpdateStatus={handleUpdateOrderStatus} />) : <p className="text-muted-foreground col-span-full text-center py-8">No new orders.</p>}
          </div>
        </TabsContent>
        <TabsContent value="preparing" className="mt-4">
           <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
             {preparingOrders.length > 0 ? preparingOrders.map(order => <OrderCard key={order.id} order={order} onUpdateStatus={handleUpdateOrderStatus} />) : <p className="text-muted-foreground col-span-full text-center py-8">No orders are being prepared.</p>}
          </div>
        </TabsContent>
        <TabsContent value="ready" className="mt-4">
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
