
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, ScanLine, ShoppingCart, Utensils, Star, Building } from 'lucide-react';
import Logo from '@/components/Logo';
import { getFoodCourts } from '@/lib/supabase/queries';
import type { FoodCourt } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useFoodCourt } from '@/context/FoodCourtProvider';
import { cn } from '@/lib/utils';

export default function LandingPage() {
    const [foodCourts, setFoodCourts] = useState<FoodCourt[]>([]);
    const [loading, setLoading] = useState(true);
    const { setSelectedFoodCourt } = useFoodCourt();
    const [isHeaderScrolled, setIsHeaderScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsHeaderScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

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
            <header className={cn(
                "fixed top-0 z-50 w-full transition-all duration-300",
                isHeaderScrolled ? "border-b bg-background/95 backdrop-blur-sm" : "bg-transparent border-b border-transparent"
            )}>
                <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
                    <Logo />
                    <nav className="hidden items-center gap-6 md:flex">
                        <Link href="#features" className={cn("text-sm font-medium transition-colors hover:text-primary", isHeaderScrolled ? "text-muted-foreground" : "text-white/80 hover:text-white")}>
                            How It Works
                        </Link>
                         <Link href="#food-courts" className={cn("text-sm font-medium transition-colors hover:text-primary", isHeaderScrolled ? "text-muted-foreground" : "text-white/80 hover:text-white")}>
                            Food Courts
                        </Link>
                        <Link href="#vendor" className={cn("text-sm font-medium transition-colors hover:text-primary", isHeaderScrolled ? "text-muted-foreground" : "text-white/80 hover:text-white")}>
                            For Vendors
                        </Link>
                    </nav>
                    <Button asChild>
                        <Link href="/scan">
                            Order Now <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </header>

            <main className="flex-grow">
                {/* Hero Section */}
                <section className="relative w-full py-20 md:py-32 lg:py-40 flex items-center justify-center">
                     <Image
                        src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHxmb29kfGVufDB8fHx8MTc1NDE2Mzk0OXww&ixlib=rb-4.1.0&q=80&w=1080"
                        alt="Delicious food background"
                        fill
                        className="object-cover"
                        data-ai-hint="food"
                        priority
                      />
                    <div className="absolute inset-0 bg-black/60 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.2),rgba(255,255,255,0))]" />
                    <div className="container relative mx-auto px-4 text-center text-white">
                        <h1 className="font-headline text-4xl font-extrabold tracking-tight [text-shadow:1px_1px_4px_rgba(0,0,0,0.6)] sm:text-5xl md:text-6xl lg:text-7xl">
                            The Entire Food Court, In Your Pocket.
                        </h1>
                        <p className="mx-auto mt-6 max-w-2xl text-lg [text-shadow:1px_1px_2px_rgba(0,0,0,0.6)] md:text-xl">
                            Discover, order, and pay from every stall at your favorite Surat food courts, right from your table.
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
                            <h2 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">Your Feast, Simplified</h2>
                            <p className="mt-4 text-lg text-muted-foreground">Ordering your favorite food is just a few taps away.</p>
                        </div>
                        <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3">
                            <Card className="text-center transform transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl">
                                <CardContent className="p-6">
                                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                                        <ScanLine className="h-8 w-8" />
                                    </div>
                                    <h3 className="mt-6 font-headline text-xl font-semibold">1. Scan &amp; Sit</h3>
                                    <p className="mt-2 text-muted-foreground">Scan the unique QR code at your table to instantly access all menus.</p>
                                </CardContent>
                            </Card>
                            <Card className="text-center transform transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl">
                                <CardContent className="p-6">
                                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                                        <ShoppingCart className="h-8 w-8" />
                                    </div>
                                    <h3 className="mt-6 font-headline text-xl font-semibold">2. Mix &amp; Match</h3>
                                    <p className="mt-2 text-muted-foreground">Explore and order from multiple stalls in one unified cart.</p>
                                </CardContent>
                            </Card>
                             <Card className="text-center transform transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl">
                                <CardContent className="p-6">
                                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                                        <Utensils className="h-8 w-8" />
                                    </div>
                                    <h3 className="mt-6 font-headline text-xl font-semibold">3. Eat &amp; Enjoy</h3>
                                    <p className="mt-2 text-muted-foreground">Pay seamlessly and get food delivered right to your table. No queues, no hassle.</p>
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
                                    <Link key={court.id} href="/stalls" onClick={() => handleFoodCourtClick(court)} className="block">
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
                                data-ai-hint="busy kitchen"
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

    