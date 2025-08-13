
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartProvider';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { MinusCircle, PlusCircle, Trash2, ShoppingBag } from 'lucide-react';
import { Card, CardContent } from './ui/card';

interface CartSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CartSheet({ open, onOpenChange }: CartSheetProps) {
  const { cartItems, cartTotal, updateQuantity, removeFromCart, clearCart } = useCart();
  const groupedByStall = cartItems.reduce((acc, item) => {
    (acc[item.stall.id] = acc[item.stall.id] || { stallName: item.stall.name, items: [] }).items.push(item);
    return acc;
  }, {} as Record<string, { stallName: string; items: typeof cartItems }>);


  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col p-0 sm:max-w-lg">
        <SheetHeader className="p-6 pb-4">
          <SheetTitle className="font-headline text-2xl">Your Food Fest</SheetTitle>
        </SheetHeader>
        <Separator />
        {cartItems.length > 0 ? (
          <>
            <ScrollArea className="my-4 flex-grow px-6">
              <div className="flex flex-col gap-6">
                {Object.entries(groupedByStall).map(([stallId, { stallName, items }]) => (
                  <div key={stallId}>
                    <h3 className="font-headline text-lg font-semibold mb-2">{stallName}</h3>
                    <Card>
                      <CardContent className="p-4 space-y-4">
                        {items.map((item) => (
                          <div key={item.id} className="flex items-start gap-4">
                            <Image
                              src={item.menuItem.imageUrl}
                              alt={item.menuItem.name}
                              width={64}
                              height={64}
                              className="rounded-md object-cover bg-muted"
                              data-ai-hint="food item"
                            />
                            <div className="flex-grow">
                              <h4 className="font-semibold">{item.menuItem.name}</h4>
                              <p className="text-sm text-primary font-bold">₹{item.totalPrice.toFixed(2)}</p>
                              <div className="mt-2 flex items-center gap-2">
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                                  <MinusCircle className="h-5 w-5" />
                                </Button>
                                <span className="w-5 text-center font-bold">{item.quantity}</span>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                                  <PlusCircle className="h-5 w-5" />
                                </Button>
                              </div>
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive shrink-0" onClick={() => removeFromCart(item.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <SheetFooter className="p-6 mt-auto border-t bg-background">
              <div className="w-full space-y-4">
                <div className="flex items-center justify-between font-bold text-lg">
                  <span>Subtotal</span>
                  <span>₹{cartTotal.toFixed(2)}</span>
                </div>
                <SheetClose asChild>
                  <Button asChild size="lg" className="w-full font-bold">
                    <Link href="/checkout">Proceed to Checkout</Link>
                  </Button>
                </SheetClose>
                <Button variant="outline" className="w-full" onClick={clearCart}>
                  Clear Cart
                </Button>
              </div>
            </SheetFooter>
          </>
        ) : (
          <div className="flex flex-grow flex-col items-center justify-center gap-4 text-center p-6">
            <ShoppingBag className="h-20 w-20 text-muted-foreground/30" />
            <h3 className="font-headline text-xl font-bold">Your cart is empty!</h3>
            <p className="text-muted-foreground">Time to start a food adventure. Why not add something delicious?</p>
            <SheetClose asChild>
                <Button asChild>
                    <Link href="/stalls">Browse Stalls</Link>
                </Button>
            </SheetClose>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
