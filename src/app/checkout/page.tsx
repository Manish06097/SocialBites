
'use client';

import { useCart } from '@/context/CartProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import Confetti from 'react-dom-confetti';
import { useState, useEffect, useTransition } from 'react';
import { createOrder } from '../orders/actions';
import { Loader2 } from 'lucide-react';

export default function CheckoutPage() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const router = useRouter();
  const { toast } = useToast();
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();
  
  // Client-side state to avoid hydration mismatch
  const [showConfetti, setShowConfetti] = useState(false);
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => setShowConfetti(true), 100);
      return () => clearTimeout(timer);
    }
  }, [isSuccess]);


  useEffect(() => {
    // Redirect if cart is empty and not on success screen
    if (cartItems.length === 0 && !isSuccess) {
      router.replace('/');
    }
  }, [cartItems, isSuccess, router]);


  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const paymentMethod = formData.get('payment') as string;
    const contactName = formData.get('name') as string;
    const contactPhone = formData.get('phone') as string;
    
    startTransition(async () => {
        const tableInfoStr = localStorage.getItem('tableInfo');
        if (!tableInfoStr) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Table information is missing. Please scan a QR code again.",
            });
            return;
        }
        const { tableId } = JSON.parse(tableInfoStr);

        const result = await createOrder({
            paymentMethod,
            cartItems,
            cartTotal,
            tableId,
            contactName,
            contactPhone,
        });

        if (result.error) {
            toast({
                variant: "destructive",
                title: "Failed to place order",
                description: result.error,
            });
        } else if (result.orderId) {
            clearCart();
            setIsSuccess(true);
            setTimeout(() => router.push(`/orders/${result.orderId}`), 4000);
        }
    });
  };
  
  const confettiConfig = {
    angle: 90,
    spread: 360,
    startVelocity: 40,
    elementCount: 100,
    dragFriction: 0.12,
    duration: 3000,
    stagger: 3,
    width: "10px",
    height: "10px",
    colors: ["#FF6B00", "#00A7E1", "#FFFFFF", "#FFC107"]
  };

  if (isSuccess) {
    return (
        <div className="container mx-auto flex h-[70vh] flex-col items-center justify-center text-center">
            <div className="absolute">
              <Confetti active={showConfetti} config={confettiConfig} />
            </div>
            <h1 className="font-headline text-5xl font-extrabold text-primary">Awesome!</h1>
            <p className="mt-4 text-xl text-foreground">Your order is in and the kitchens are cookin'!</p>
            <p className="mt-2 text-muted-foreground">You will be redirected to your order tracking page shortly.</p>
        </div>
    )
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 md:px-6">
      <h1 className="mb-8 font-headline text-4xl font-bold">Checkout</h1>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-8 md:grid-cols-2 md:items-start">
        <fieldset disabled={isPending} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" placeholder="John Doe" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Contact Number</Label>
                <Input id="phone" name="phone" type="tel" placeholder="9876543210" required />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup name="payment" defaultValue="upi" className="space-y-2">
                <Label
                  htmlFor="upi"
                  className="flex cursor-pointer items-center gap-4 rounded-md border p-4 hover:bg-accent/50 has-[input:checked]:border-primary"
                >
                  <RadioGroupItem value="upi" id="upi" />
                  <span className="font-semibold">UPI / QR Code</span>
                </Label>
                <Label
                  htmlFor="cod"
                  className="flex cursor-pointer items-center gap-4 rounded-md border p-4 hover:bg-accent/50 has-[input:checked]:border-primary"
                >
                  <RadioGroupItem value="cod" id="cod" />
                  <span className="font-semibold">Cash on Delivery</span>
                </Label>
              </RadioGroup>
            </CardContent>
          </Card>
        </fieldset>
        <Card className="sticky top-24">
          <CardHeader>
            <CardTitle className="font-headline">Your Order</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-64 space-y-4 overflow-y-auto pr-2">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                     <Image src={item.menuItem.imageUrl} alt={item.menuItem.name} width={48} height={48} className="rounded-md" data-ai-hint="food item" />
                    <div>
                      <p className="font-semibold">{item.menuItem.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Qty: {item.quantity} • From: {item.stall.name}
                      </p>
                    </div>
                  </div>
                  <p className="font-semibold">₹{item.totalPrice.toFixed(2)}</p>
                </div>
              ))}
            </div>
            <Separator className="my-4" />
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Taxes & Charges</span>
                <span>Calculated at next step</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between text-lg font-bold">
                <span>To Pay</span>
                <span>₹{cartTotal.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" size="lg" className="w-full font-bold" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isPending ? 'Placing Order...' : 'Place Order'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
