'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, ChefHat, Bike, PartyPopper } from 'lucide-react';
import Image from 'next/image';
import { useParams } from 'next/navigation';

// Mock data for a single order, replace with actual data fetching
const mockOrder = {
  id: 'SSB-12345',
  customerName: 'Rohan Patel',
  paymentMethod: 'UPI',
  totalAmount: 470,
  orderDate: new Date(),
  itemsByStall: {
    s1: {
      stallName: 'Gopal Locho',
      items: [
        {
          id: 'm1-1-custom',
          menuItem: { id: 'm1-1', name: 'Butter Locho', price: 80, imageUrl: 'https://placehold.co/400x300.png', description: '', rating: 0, orders: 0 },
          quantity: 1,
          totalPrice: 80,
          status: 'Delivered',
        },
      ],
    },
    s2: {
      stallName: "La Pino'z Pizza",
      items: [
        {
          id: 'm2-2-custom',
          menuItem: { id: 'm2-2', name: 'Farmhouse Pizza', price: 350, imageUrl: 'https://placehold.co/400x300.png', description: '', rating: 0, orders: 0 },
          quantity: 1,
          totalPrice: 350,
          status: 'Preparing',
        },
      ],
    },
    s3: {
      stallName: 'Wok on Fire',
      items: [
         {
          id: 'm3-2-custom',
          menuItem: { id: 'm3-2', name: 'Hakka Noodles', price: 220, imageUrl: 'https://placehold.co/400x300.png', description: '', rating: 0, orders: 0 },
          quantity: 1,
          totalPrice: 220,
          status: 'Accepted',
        }
      ]
    }
  },
};

const statusInfo = {
  Accepted: { icon: CheckCircle, text: 'Order Accepted', color: 'text-green-500' },
  Preparing: { icon: ChefHat, text: 'Preparing your food', color: 'text-orange-500' },
  'On the Way': { icon: Bike, text: 'On its way!', color: 'text-blue-500' },
  Delivered: { icon: PartyPopper, text: 'Delivered & Delicious', color: 'text-primary' },
};

const OrderStatusTimeline = ({ status }: { status: keyof typeof statusInfo }) => {
    const statuses = Object.keys(statusInfo) as (keyof typeof statusInfo)[];
    const currentIndex = statuses.indexOf(status);

    return (
        <div className="flex items-center space-x-2 sm:space-x-4">
            {statuses.map((s, index) => {
                const isActive = index <= currentIndex;
                const { icon: Icon, text, color } = statusInfo[s];
                return (
                    <div key={s} className="flex flex-col items-center">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${isActive ? 'bg-primary/20' : 'bg-muted'}`}>
                           <Icon className={`h-6 w-6 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                        </div>
                        <p className={`mt-2 text-xs text-center ${isActive ? 'font-semibold' : 'text-muted-foreground'}`}>{text}</p>
                    </div>
                );
            })}
        </div>
    );
};


export default function OrderTrackingPage() {
  const params = useParams();
  const orderId = Array.isArray(params.orderId) ? params.orderId[0] : params.orderId;
  
  // In a real app, you'd fetch the order using orderId
  const order = mockOrder;
  order.id = orderId;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 md:px-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Track Your Order</CardTitle>
          <CardDescription>
            Order ID: <span className="font-mono font-semibold text-primary">{order.id}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {Object.entries(order.itemsByStall).map(([stallId, data]) => (
            <div key={stallId}>
              <h3 className="font-headline text-2xl font-semibold">{data.stallName}</h3>
              <Separator className="my-2" />
              {data.items.map(item => (
                <div key={item.id} className="mt-4 space-y-4 rounded-lg border p-4">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Image src={item.menuItem.imageUrl} alt={item.menuItem.name} width={64} height={64} className="rounded-md" data-ai-hint="food item" />
                            <div>
                                <p className="font-semibold">{item.menuItem.name}</p>
                                <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                            </div>
                        </div>
                        <p className="font-bold">₹{item.totalPrice.toFixed(2)}</p>
                    </div>
                    <Separator/>
                    <div className="overflow-x-auto pb-2">
                       <OrderStatusTimeline status={item.status} />
                    </div>
                </div>
              ))}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
