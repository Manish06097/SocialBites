
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, ScanLine, ShoppingCart, Utensils, Star, Building } from 'lucide-react';
import Logo from '@/components/Logo';
import { getFoodCourts } from '@/lib/supabase/queries';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import StallCard from '@/components/StallCard';
import type { FoodCourt, Stall } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useFoodCourt } from '@/context/FoodCourtProvider';

export default function LandingPage() {
    const [foodCourts, setFoodCourts] = useState<FoodCourt[]>([]);
    const [loading, setLoading] = useState(true);
    const { setSelectedFoodCourt } = useFoodCourt();

    useEffect(() => {
        async function fetchFoodCourts() {
            try {
                const fetchedFoodCourts = await getFoodCourts();
                setFoodCourts(fetchedFoodCourts);
            } catch (error) {
                console.error("Failed to fetch food courts", error);
            } finally {
                setLoading(false);
            }
        }
        fetchFoodCourts();
    }, []);

    const handleFoodCourtClick = (court: FoodCourt) => {
        setSelectedFoodCourt(court);
    };

    return (
        <div className="flex min-h-screen flex-col bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm">
                <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
                    <Logo />
                    <nav className="hidden items-center gap-6 md:flex">
                        <Link href="#features" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                            How It Works
                        </Link>
                         <Link href="#food-courts" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                            Food Courts
                        </Link>
                        <Link href="#vendor" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                            For Vendors
                        </Link>
                    </nav>
                    <Button asChild>
                        <Link href="/stalls">
                            Order Now <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </header>

            <main className="flex-grow">
                {/* Hero Section */}
                <section className="relative w-full py-20 md:py-32 lg:py-40">
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                     <Image
                        src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHxmb29kfGVufDB8fHx8MTc1NDE2Mzk0OXww&ixlib=rb-4.1.0&q=80&w=1080"
                        alt="Delicious food background"
                        fill
                        className="object-cover -z-10"
                        data-ai-hint="food"
                      />
                    <div className="container relative mx-auto px-4 text-center text-white">
                        <h1 className="font-headline text-4xl font-extrabold tracking-tight [text-shadow:2px_2px_4px_#000] sm:text-5xl md:text-6xl lg:text-7xl">
                            The Entire Food Court, In Your Pocket.
                        </h1>
                        <p className="mx-auto mt-6 max-w-2xl text-lg [text-shadow:1px_1px_2px_#000] md:text-xl">
                            Discover, order, and pay from the best stalls at your favorite Surat food courts, right from your table.
                        </p>
                        <div className="mt-8">
                             <Button size="lg" asChild className="font-bold">
                                <Link href="/scan">
                                    <ScanLine className="mr-2 h-5 w-5" />
                                    Scan QR & Start Ordering
                                </Link>
                             </Button>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="w-full bg-muted py-16 md:py-24">
                    <div className="container mx-auto px-4">
                        <div className="text-center">
                            <h2 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">How It Works</h2>
                            <p className="mt-4 text-lg text-muted-foreground">Ordering your favorite food is just a few taps away.</p>
                        </div>
                        <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3">
                            <Card className="text-center">
                                <CardContent className="p-6">
                                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                                        <ScanLine className="h-8 w-8" />
                                    </div>
                                    <h3 className="mt-6 font-headline text-xl font-semibold">1. Scan the Code</h3>
                                    <p className="mt-2 text-muted-foreground">Use your phone to scan the unique QR code at your table.</p>
                                </CardContent>
                            </Card>
                            <Card className="text-center">
                                <CardContent className="p-6">
                                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                                        <ShoppingCart className="h-8 w-8" />
                                    </div>
                                    <h3 className="mt-6 font-headline text-xl font-semibold">2. Browse & Order</h3>
                                    <p className="mt-2 text-muted-foreground">Explore menus from all stalls, add items to your cart, and checkout.</p>
                                </CardContent>
                            </Card>
                             <Card className="text-center">
                                <CardContent className="p-6">
                                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                                        <Utensils className="h-8 w-8" />
                                    </div>
                                    <h3 className="mt-6 font-headline text-xl font-semibold">3. Enjoy Your Meal</h3>
                                    <p className="mt-2 text-muted-foreground">Sit back and relax. Your delicious food will be delivered right to your table.</p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>

                {/* Food Courts Section */}
                <section id="food-courts" className="w-full py-16 md:py-24">
                    <div className="container mx-auto px-4">
                        <div className="text-center">
                            <h2 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">Our Partner Food Courts</h2>
                            <p className="mt-4 text-lg text-muted-foreground">Find us at Surat's most popular foodie destinations.</p>
                        </div>
                        <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                           {loading ? (
                                Array.from({ length: 3 }).map((_, index) => (
                                    <Skeleton key={index} className="h-24 w-full" />
                                ))
                            ) : (
                                foodCourts.map((court) => (
                                    <Link key={court.id} href="/stalls" onClick={() => handleFoodCourtClick(court)}>
                                        <Card className="group flex h-full items-center gap-4 p-6 transition-all duration-300 hover:bg-primary hover:text-primary-foreground hover:shadow-lg">
                                            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary-foreground group-hover:text-primary">
                                                <Building className="h-6 w-6" />
                                            </div>
                                            <h3 className="font-headline text-xl font-semibold">{court.name}</h3>
                                        </Card>
                                    </Link>
                                ))
                            )}
                        </div>
                    </div>
                </section>

                {/* Vendor Section */}
                <section id="vendor" className="w-full bg-muted py-16 md:py-24">
                     <div className="container mx-auto grid grid-cols-1 items-center gap-12 px-4 md:grid-cols-2">
                        <div className="space-y-4">
                             <h2 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">Grow Your Business with Social Bites</h2>
                             <p className="text-lg text-muted-foreground">
                                Join our platform to connect with more customers, streamline your orders, and manage your menu with ease.
                             </p>
                             <ul className="space-y-3">
                                <li className="flex items-start gap-3">
                                    <Star className="h-5 w-5 flex-shrink-0 text-primary mt-1" />
                                    <div>
                                        <h4 className="font-semibold">Real-time Order Management</h4>
                                        <p className="text-muted-foreground">Accept and manage incoming orders from a simple, intuitive dashboard.</p>
                                    </div>
                                </li>
                                 <li className="flex items-start gap-3">
                                    <Star className="h-5 w-5 flex-shrink-0 text-primary mt-1" />
                                    <div>
                                        <h4 className="font-semibold">Easy Menu Updates</h4>
                                        <p className="text-muted-foreground">Update your menu, add new items, and set availability in just a few clicks.</p>
                                    </div>
                                </li>
                             </ul>
                             <Button size="lg" asChild className="font-bold">
                                <Link href="/vendor/login">
                                   Vendor Login <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                             </Button>
                        </div>
                        <div>
                             <Image
                                src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw1fHxmb29kfGVufDB8fHx8MTc1NDE2Mzk0OXww&ixlib=rb-4.1.0&q=80&w=1080"
                                alt="Vendor using a tablet"
                                width={600}
                                height={400}
                                className="rounded-lg shadow-lg"
                                data-ai-hint="food"
                              />
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="w-full border-t bg-background">
                <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row md:px-6">
                    <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} Surat Social Bites. All rights reserved.</p>
                    <nav className="flex items-center gap-4">
                         <Link href="/stalls" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                            Stalls
                        </Link>
                         <Link href="/vendor/login" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                            Vendors
                        </Link>
                    </nav>
                </div>
            </footer>
        </div>
    );
}
