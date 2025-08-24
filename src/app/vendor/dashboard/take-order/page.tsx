
'use client';

import { useState, useEffect, useMemo, useTransition } from 'react';
import type { MenuItem, Stall, CartItem } from '@/lib/types';
import { getStallWithMenuItems, getVendorStallId } from '@/app/vendor/actions';
import { createOrder } from '@/app/orders/actions';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Image from 'next/image';
import { MinusCircle, PlusCircle, Trash2, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

// Helper to calculate total price for a cart item
const calculateTotalPrice = (menuItem: MenuItem, quantity: number): number => {
    // This simple version doesn't handle customizations.
    // A more complex version would iterate through choices.
    return menuItem.price * quantity;
};

// Helper to generate a unique ID for a cart item
const generateCartItemId = (menuItemId: string): string => {
    // This simple version assumes no customizations.
    return menuItemId;
};

export default function TakeOrderPage() {
    const [stall, setStall] = useState<Stall | null>(null);
    const [loading, setLoading] = useState(true);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [tableId, setTableId] = useState('');
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    useEffect(() => {
        async function fetchStall() {
            const stallId = await getVendorStallId();
            if (stallId) {
                const fetchedStall = await getStallWithMenuItems(stallId);
                setStall(fetchedStall as Stall);
            }
            setLoading(false);
        }
        fetchStall();
    }, []);

    const menuItemsByCategory = useMemo(() => {
        if (!stall) return {};
        return (stall.menu || []).reduce((acc, category) => {
            acc[category.title] = category.items;
            return acc;
        }, {} as Record<string, MenuItem[]>);
    }, [stall]);

    const cartTotal = useMemo(() => {
        return cart.reduce((total, item) => total + item.totalPrice, 0);
    }, [cart]);

    const handleAddToCart = (menuItem: MenuItem) => {
        setCart(prevCart => {
            const cartItemId = generateCartItemId(menuItem.id);
            const existingItem = prevCart.find(item => item.id === cartItemId);

            if (existingItem) {
                const newQuantity = existingItem.quantity + 1;
                return prevCart.map(item =>
                    item.id === cartItemId
                        ? { ...item, quantity: newQuantity, totalPrice: calculateTotalPrice(menuItem, newQuantity) }
                        : item
                );
            } else {
                const newCartItem: CartItem = {
                    id: cartItemId,
                    menuItem,
                    stall: { id: stall!.id, name: stall!.name, food_court_id: stall!.food_court_id },
                    quantity: 1,
                    totalPrice: calculateTotalPrice(menuItem, 1),
                };
                return [...prevCart, newCartItem];
            }
        });
    };

    const handleUpdateQuantity = (cartItemId: string, change: number) => {
        setCart(prevCart => {
            const itemToUpdate = prevCart.find(item => item.id === cartItemId);
            if (!itemToUpdate) return prevCart;

            const newQuantity = itemToUpdate.quantity + change;

            if (newQuantity <= 0) {
                return prevCart.filter(item => item.id !== cartItemId);
            }

            return prevCart.map(item =>
                item.id === cartItemId
                    ? { ...item, quantity: newQuantity, totalPrice: calculateTotalPrice(item.menuItem, newQuantity) }
                    : item
            );
        });
    };

    const handleRemoveFromCart = (cartItemId: string) => {
        setCart(prevCart => prevCart.filter(item => item.id !== cartItemId));
    };

    const handlePlaceOrder = () => {
        if (cart.length === 0) {
            toast({ variant: 'destructive', title: 'Cart is empty' });
            return;
        }
        if (!tableId.trim()) {
            toast({ variant: 'destructive', title: 'Table number is required' });
            return;
        }
        if (!customerName.trim()) {
            toast({ variant: 'destructive', title: 'Customer name is required' });
            return;
        }

        startTransition(async () => {
            const result = await createOrder({
                cartItems: cart,
                cartTotal,
                tableId,
                contactName: customerName,
                contactPhone: customerPhone,
                paymentMethod: 'cod', // Assume COD for vendor-placed orders
                isVendorOrder: true, // Flag to indicate this is a vendor-placed order
            });

            if (result.error) {
                toast({ variant: 'destructive', title: 'Failed to place order', description: result.error });
            } else {
                toast({ title: 'Order Placed!', description: `Order for ${customerName} has been submitted.` });
                // Reset form
                setCart([]);
                setCustomerName('');
                setCustomerPhone('');
                setTableId('');
            }
        });
    };

    if (loading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="lg:col-span-2"><Skeleton className="h-96 w-full" /></div>
                <div><Skeleton className="h-96 w-full" /></div>
            </div>
        )
    }

    if (!stall) {
        return <p>Could not load stall information. Please try again.</p>;
    }

    return (
        <div className="grid gap-8 md:grid-cols-3">
            <div className="md:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl">{stall.name}'s Menu</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Accordion type="multiple" defaultValue={Object.keys(menuItemsByCategory)} className="w-full">
                            {Object.entries(menuItemsByCategory).map(([category, items]) => (
                                <AccordionItem key={category} value={category}>
                                    <AccordionTrigger className="font-headline text-xl">{category}</AccordionTrigger>
                                    <AccordionContent>
                                        <div className="space-y-4">
                                            {items.map(item => (
                                                <div key={item.id} className="flex items-center justify-between gap-4">
                                                    <div className="flex items-center gap-4">
                                                        <Image src={item.imageUrl} alt={item.name} width={56} height={56} className="h-14 w-14 rounded-md object-cover bg-muted" />
                                                        <div>
                                                            <p className="font-semibold">{item.name}</p>
                                                            <p className="text-sm text-muted-foreground">₹{item.price.toFixed(2)}</p>
                                                        </div>
                                                    </div>
                                                    <Button onClick={() => handleAddToCart(item)} disabled={!item.available}>
                                                        {item.available ? 'Add' : 'Sold Out'}
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </CardContent>
                </Card>
            </div>

            <div className="md:col-span-1">
                <Card className="sticky top-20">
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl">New Order</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {cart.length > 0 ? (
                            <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                                {cart.map(item => (
                                    <div key={item.id} className="flex items-start justify-between gap-2">
                                        <div className="flex-grow">
                                            <p className="font-semibold text-sm">{item.menuItem.name}</p>
                                            <p className="text-xs text-primary font-bold">₹{item.totalPrice.toFixed(2)}</p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleUpdateQuantity(item.id, -1)}><MinusCircle className="h-4 w-4" /></Button>
                                            <span className="w-5 text-center text-sm font-bold">{item.quantity}</span>
                                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleUpdateQuantity(item.id, 1)}><PlusCircle className="h-4 w-4" /></Button>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleRemoveFromCart(item.id)}><Trash2 className="h-4 w-4" /></Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">Cart is empty. Add items from the menu.</p>
                        )}
                        <Separator />
                        <div className="space-y-2">
                            <div className="flex justify-between text-lg font-bold">
                                <span>Total</span>
                                <span>₹{cartTotal.toFixed(2)}</span>
                            </div>
                        </div>
                        <Separator />
                         <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="tableId">Table Number</Label>
                                <Input id="tableId" value={tableId} onChange={(e) => setTableId(e.target.value)} placeholder="e.g., T5" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="customerName">Customer Name</Label>
                                <Input id="customerName" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="John Doe" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="customerPhone">Customer Phone (Optional)</Label>
                                <Input id="customerPhone" type="tel" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="9876543210" />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full font-bold" onClick={handlePlaceOrder} disabled={isPending || cart.length === 0}>
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isPending ? 'Placing Order...' : 'Place Order'}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
