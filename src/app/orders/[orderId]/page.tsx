'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, ChefHat, Bike, PartyPopper } from 'lucide-react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import type { CartItem } from '@/lib/types';

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

type OrderStatus = 'Accepted' | 'Preparing' | 'On the Way' | 'Delivered' | 'Rejected';

const statusDisplayConfig: Record<OrderStatus, { text: string; className: string }> = {
  Accepted: { text: 'Accepted', className: 'bg-blue-100 text-blue-800' },
  Preparing: { text: 'Preparing', className: 'bg-orange-100 text-orange-800' },
  'On the Way': { text: 'On the Way', className: 'bg-yellow-100 text-yellow-800' },
  Delivered: { text: 'Delivered', className: 'bg-green-100 text-green-800' },
  Rejected: { text: 'Rejected', className: 'bg-red-100 text-red-800' },
};

// A helper to determine the overall status for a stall's items
const getStallOverallStatus = (items: (CartItem & { status: OrderStatus })[]): OrderStatus => {
  const statuses = items.map(item => item.status);
  if (statuses.every(s => s === 'Delivered')) return 'Delivered';
  if (statuses.some(s => s === 'Preparing')) return 'Preparing';
  if (statuses.some(s => s === 'Accepted')) return 'Accepted';
  return statuses[0] || 'Accepted'; // Fallback
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
        <CardContent className="space-y-2">
           <Accordion type="multiple" className="w-full">
            {Object.entries(order.itemsByStall).map(([stallId, data]) => {
                const overallStatus = getStallOverallStatus(data.items as any);
                const statusConfig = statusDisplayConfig[overallStatus];

                return (
                    <AccordionItem value={stallId} key={stallId}>
                        <AccordionTrigger className="font-headline text-2xl font-semibold hover:no-underline">
                            <div className="flex items-center gap-4">
                                <span>{data.stallName}</span>
                                <Badge className={`border-transparent text-xs font-bold ${statusConfig.className}`}>{statusConfig.text}</Badge>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
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
                                </div>
                            ))}
                        </AccordionContent>
                    </AccordionItem>
                )
            })}
           </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
