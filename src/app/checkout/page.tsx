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
import { useState, useEffect } from 'react';

export default function CheckoutPage() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const router = useRouter();
  const { toast } = useToast();
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Client-side state to avoid hydration mismatch
  const [showConfetti, setShowConfetti] = useState(false);
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => setShowConfetti(true), 100);
      return () => clearTimeout(timer);
    }
  }, [isSuccess]);


  if (cartItems.length === 0 && !isSuccess) {
    // Redirect if cart is empty and not on success screen
    if (typeof window !== 'undefined') {
        router.push('/');
    }
    return (
        <div className="flex h-full flex-col items-center justify-center p-8 text-center">
            <h2 className="font-headline text-2xl">Your cart is empty.</h2>
            <p className="text-muted-foreground">Redirecting you to the homepage to find some yummy food!</p>
        </div>
    );
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get('name');
    const phone = formData.get('phone');
    const payment = formData.get('payment');
    
    if (!name || !phone || !payment) {
        toast({
            variant: "destructive",
            title: "Uh oh! Something is missing.",
            description: "Please fill out all the required fields.",
        });
        return;
    }

    // This is where you would normally call an API to create the order.
    // For now, we'll simulate a successful order.
    const orderId = `SSB-${Math.floor(Math.random() * 90000) + 10000}`;
    console.log("Order placed:", { orderId, name, phone, payment, items: cartItems, total: cartTotal });
    
    clearCart();
    setIsSuccess(true);
    // Don't redirect immediately, show the success message first.
    setTimeout(() => router.push(`/orders/${orderId}`), 4000);
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
        <div className="space-y-6">
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
        </div>
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
            <Button type="submit" size="lg" className="w-full font-bold">
              Place Order
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
