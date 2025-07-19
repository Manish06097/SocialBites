
'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { CheckCircle, XCircle, CookingPot, Bike } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

// Mock data, in a real app this would come from a database in real-time
const mockOrders = [
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


function OrderCard({ order }: { order: (typeof mockOrders)[0] }) {
  
  const timeSince = (date: Date) => {
      const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
      let interval = seconds / 31536000;
      if (interval > 1) return Math.floor(interval) + " years ago";
      interval = seconds / 2592000;
      if (interval > 1) return Math.floor(interval) + " months ago";
      interval = seconds / 86400;
      if (interval > 1) return Math.floor(interval) + " days ago";
      interval = seconds / 3600;
      if (interval > 1) return Math.floor(interval) + " hours ago";
      interval = seconds / 60;
      if (interval > 1) return Math.floor(interval) + " minutes ago";
      return Math.floor(seconds) + " seconds ago";
  }

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
                <p className="text-xs text-muted-foreground">{timeSince(order.timestamp)}</p>
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
                <Button variant="outline" className="w-full">
                    <XCircle className="mr-2" />
                    Reject
                </Button>
                <Button className="w-full">
                    <CheckCircle className="mr-2" />
                    Accept
                </Button>
            </div>
        )}
         {order.status === 'preparing' && (
            <Button className="w-full">
                <Bike className="mr-2" />
                Mark as Ready for Pickup
            </Button>
        )}
        {order.status === 'ready' && (
             <Button className="w-full">
                <CheckCircle className="mr-2" />
                Mark as Completed
            </Button>
        )}
        {order.status === 'completed' && (
            <p className="text-sm text-green-600 font-medium flex items-center">
                <CheckCircle className="mr-2 h-4 w-4" />
                Order Completed
            </p>
        )}
      </CardFooter>
    </Card>
  )
}

export default function VendorOrdersPage() {

  const newOrders = mockOrders.filter(o => o.status === 'new');
  const preparingOrders = mockOrders.filter(o => o.status === 'preparing');
  const readyOrders = mockOrders.filter(o => o.status === 'ready');
  const completedOrders = mockOrders.filter(o => o.status === 'completed');

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-lg font-semibold md:text-2xl">
          Order Management
        </h1>
      </div>
      <Tabs defaultValue="new" className="mt-4">
        <TabsList className="grid w-full grid-cols-4">
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
             {newOrders.length > 0 ? newOrders.map(order => <OrderCard key={order.id} order={order} />) : <p className="text-muted-foreground col-span-full text-center">No new orders.</p>}
          </div>
        </TabsContent>
        <TabsContent value="preparing" className="mt-4">
           <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
             {preparingOrders.length > 0 ? preparingOrders.map(order => <OrderCard key={order.id} order={order} />) : <p className="text-muted-foreground col-span-full text-center">No orders are being prepared.</p>}
          </div>
        </TabsContent>
        <TabsContent value="ready" className="mt-4">
           <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
             {readyOrders.length > 0 ? readyOrders.map(order => <OrderCard key={order.id} order={order} />) : <p className="text-muted-foreground col-span-full text-center">No orders are ready for pickup.</p>}
          </div>
        </TabsContent>
        <TabsContent value="completed" className="mt-4">
           <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
             {completedOrders.length > 0 ? completedOrders.map(order => <OrderCard key={order.id} order={order} />) : <p className="text-muted-foreground col-span-full text-center">No completed orders yet.</p>}
          </div>
        </TabsContent>
      </Tabs>
    </>
  )
}
