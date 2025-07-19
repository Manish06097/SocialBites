'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartProvider';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { MinusCircle, PlusCircle, Trash2, X } from 'lucide-react';

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
      <SheetContent className="flex w-full flex-col pr-0 sm:max-w-lg">
        <SheetHeader className="px-6">
          <SheetTitle className="font-headline text-2xl">Your Food Fest</SheetTitle>
        </SheetHeader>
        <Separator />
        {cartItems.length > 0 ? (
          <>
            <ScrollArea className="my-4 flex-grow px-6">
              <div className="flex flex-col gap-8">
                {Object.entries(groupedByStall).map(([stallId, { stallName, items }]) => (
                  <div key={stallId}>
                    <h3 className="font-headline text-lg font-semibold">{stallName}</h3>
                    <div className="mt-2 flex flex-col gap-4">
                      {items.map((item) => (
                        <div key={item.id} className="flex items-start gap-4">
                          <Image
                            src={item.menuItem.imageUrl}
                            alt={item.menuItem.name}
                            width={64}
                            height={64}
                            className="rounded-md object-cover"
                            data-ai-hint="food item"
                          />
                          <div className="flex-grow">
                            <h4 className="font-semibold">{item.menuItem.name}</h4>
                            <p className="text-sm text-muted-foreground">₹{item.totalPrice.toFixed(2)}</p>
                            <div className="mt-2 flex items-center gap-2">
                              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                                <MinusCircle className="h-4 w-4" />
                              </Button>
                              <span className="w-4 text-center font-bold">{item.quantity}</span>
                              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                                <PlusCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => removeFromCart(item.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <Separator />
            <SheetFooter className="px-6 py-4">
              <div className="w-full space-y-4">
                <div className="flex items-center justify-between font-bold">
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
          <div className="flex flex-grow flex-col items-center justify-center gap-4 text-center">
            <h3 className="font-headline text-xl">Your cart is empty!</h3>
            <p className="text-muted-foreground">Time to start a food adventure. Why not add something delicious?</p>
            <SheetClose asChild>
                <Button>Start Ordering</Button>
            </SheetClose>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
