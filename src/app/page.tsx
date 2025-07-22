
'use client';

import { useState, useMemo, Suspense, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { Stall, FoodCourt, TrendingItem } from '@/lib/types';
import StallCard from '@/components/StallCard';
import { Input } from '@/components/ui/input';
import { Search, UtensilsCrossed } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useFoodCourt } from '@/context/FoodCourtProvider';
import { Skeleton } from '@/components/ui/skeleton';
import { getStalls, getFoodCourts } from '@/lib/supabase/queries';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { trendingItems } from '@/lib/data'; // Keep trending items for now

function WelcomeMessage() {
  const [table, setTable] = useState<string | null>(null);

  useEffect(() => {
    try {
      const tableInfoStr = localStorage.getItem('tableInfo');
      if (tableInfoStr) {
        const tableInfo = JSON.parse(tableInfoStr);
        setTable(tableInfo.tableId);
      }
    } catch (error) {
      console.error("Could not parse table info", error);
    }
  }, []);

  if (!table) return null;

  return (
    <div className="mb-8 rounded-lg border border-primary/20 bg-primary/10 p-4 text-center">
      <h2 className="font-headline text-2xl font-bold text-primary">
        Welcome to Surat Social Bites!
      </h2>
      <p className="text-foreground">You're at Table <span className="font-bold">{table}</span>. Ready for a feast?</p>
    </div>
  );
}

function HomePageContent() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>('All');
  const { selectedFoodCourt, setSelectedFoodCourt, setFoodCourts } = useFoodCourt();
  const [allStalls, setAllStalls] = useState<Stall[]>([]);
  const [loadingContent, setLoadingContent] = useState(true); // New loading state for overall content
  const [sessionChecked, setSessionChecked] = useState(false);

  // Effect to fetch food courts and set initial selected food court
  useEffect(() => {
    const initializeFoodCourts = async () => {
      setLoadingContent(true);
      try {
        const fetchedFoodCourts = await getFoodCourts();
        setFoodCourts(fetchedFoodCourts); // Update food courts in context

        let initialFoodCourt: FoodCourt | null = null;
        const tableInfoStr = localStorage.getItem('tableInfo');
        if (tableInfoStr) {
          const tableInfo = JSON.parse(tableInfoStr);
          if (tableInfo.foodCourtId) {
            initialFoodCourt = fetchedFoodCourts.find(fc => fc.id === tableInfo.foodCourtId) || null;
          }
        }

        if (!initialFoodCourt && fetchedFoodCourts.length > 0) {
          initialFoodCourt = fetchedFoodCourts[0]; // Default to the first food court if no table info or ID not found
        }
        setSelectedFoodCourt(initialFoodCourt);
      } catch (error) {
        console.error('Error initializing food courts:', error);
      } finally {
        // Do not set loadingContent to false here, as stalls still need to be fetched
      }
    };

    initializeFoodCourts();
  }, [setFoodCourts, setSelectedFoodCourt]);

  // Effect to fetch stalls based on selectedFoodCourt and check session
  useEffect(() => {
    const fetchDataAndCheckSession = async () => {
      if (!selectedFoodCourt) {
        setLoadingContent(true); // Keep loading if food court not yet selected
        return;
      }

      console.log('Fetching stalls for food court:', selectedFoodCourt.id);
      setLoadingContent(true); // Set loading true when fetching stalls
      try {
        const fetchedStalls = await getStalls(selectedFoodCourt.id);
        console.log('Fetched stalls:', fetchedStalls);
        setAllStalls(fetchedStalls);
      } catch (error) {
        console.error('Error fetching stalls:', error);
        setAllStalls([]); // Clear stalls on error
      } finally {
        setLoadingContent(false); // Set loading false after stalls are fetched
        console.log('Finished fetching stalls. Loading state set to false.');
      }

      console.log('Checking session and redirect...');
      const supabase = createSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        console.log('No session found, redirecting to /scan');
        router.replace('/scan');
        return;
      }
      setSessionChecked(true);
      console.log('Session checked and set to true.');
    };

    fetchDataAndCheckSession();
  }, [selectedFoodCourt, router]); // Re-run when selectedFoodCourt changes

  const allCuisines = useMemo(() => {
    const cuisines = new Set<string>();
    allStalls.forEach(stall => stall.tags.forEach(tag => cuisines.add(tag)));
    return ['All', ...Array.from(cuisines)];
  }, [allStalls]);

  const filteredStalls = useMemo(() => {
    if (!selectedFoodCourt) return []; // Return empty if no food court selected yet
    return allStalls.filter(stall => {
      const matchesSearch = searchTerm === '' || 
                            stall.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (stall.menu && stall.menu.some(cat => cat.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))));
      const matchesCuisine = !selectedCuisine || selectedCuisine === 'All' || stall.tags.includes(selectedCuisine);
      return matchesSearch && matchesCuisine;
    });
  }, [searchTerm, selectedCuisine, allStalls]);

  useEffect(() => {
    console.log('Current loadingContent:', loadingContent);
    console.log('Current sessionChecked:', sessionChecked);
    console.log('Current selectedFoodCourt:', selectedFoodCourt);
    console.log('Current allStalls:', allStalls);
    console.log('Current filteredStalls:', filteredStalls);
  }, [loadingContent, sessionChecked, selectedFoodCourt, allStalls, filteredStalls]);

  if (loadingContent || !sessionChecked || !selectedFoodCourt) {
    return (
        <div className="container mx-auto px-4 py-8 md:px-6 space-y-12">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-40 w-full" />
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:px-6">
      <WelcomeMessage />

      <section className="mb-12">
        <h1 className="text-center font-headline text-4xl font-extrabold tracking-tight lg:text-5xl">
          Your Next <span className="text-primary">Food Adventure</span> Awaits
        </h1>
        <p className="mt-4 text-center text-lg text-muted-foreground">
          Find your craving, from spicy street food to cheesy pizzas, all in one place.
        </p>
        <div className="relative mx-auto mt-8 max-w-2xl">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search for stalls or dishes..."
            className="w-full rounded-full bg-card py-6 pl-12 pr-4 text-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {allCuisines.map(cuisine => (
            <Button
              key={cuisine}
              variant={selectedCuisine === cuisine ? 'default' : 'outline'}
              onClick={() => setSelectedCuisine(cuisine === 'All' ? null : cuisine)}
              className="rounded-full"
            >
              {cuisine}
            </Button>
          ))}
        </div>
      </section>
      
      <section className="mb-12">
        <h2 className="font-headline text-3xl font-bold">What's Trending 🔥</h2>
        <Carousel opts={{ align: "start", loop: true }} className="mt-6 w-full">
          <CarouselContent>
            {trendingItems.map((item) => (
              <CarouselItem key={item.id} className="md:basis-1/2 lg:basis-1/3">
                <Card className="overflow-hidden">
                  <CardContent className="flex items-center gap-4 p-4">
                    <Image src={item.imageUrl} alt={item.name} width={80} height={80} className="h-20 w-20 rounded-md object-cover" data-ai-hint="food item" />
                    <div className="flex-grow">
                      <h4 className="font-semibold truncate">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">{item.stallName}</p>
                      <p className="font-bold text-primary">₹{item.price}</p>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex" />
          <CarouselNext className="hidden sm:flex" />
        </Carousel>
      </section>

      <section>
        <h2 className="font-headline text-3xl font-bold">All Stalls at {selectedFoodCourt.name}</h2>
        {filteredStalls.length > 0 ? (
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredStalls.map((stall: Stall) => (
              <StallCard key={stall.id} stall={stall} />
            ))}
          </div>
        ) : (
          <div className="mt-16 flex flex-col items-center justify-center text-center">
             <UtensilsCrossed className="h-16 w-16 text-muted-foreground" />
             <h3 className="mt-4 font-headline text-2xl font-bold">No Stalls Found</h3>
             <p className="mt-2 text-muted-foreground">Looks like we couldn't find a match. Try a different search or filter!</p>
          </div>
        )}
      </section>
    </div>
  );
}


export default function Home() {
  return (
    <Suspense>
      <HomePageContent />
    </Suspense>
  )
}
