
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { notFound, useParams } from 'next/navigation';
import { getStallWithMenuItems, getFoodCourtById } from '@/lib/supabase/queries';
import type { MenuItem, Stall } from '@/lib/types';
import { useFoodCourt } from '@/context/FoodCourtProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MenuItemDialog } from '@/components/MenuItemDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { StarRating } from '@/components/StarRating';
import { Dialog, DialogContent } from '@/components/ui/dialog';

export default function StallPage() {
  const params = useParams();
  const stallId = Array.isArray(params.stallId) ? params.stallId[0] : params.stallId;
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [stall, setStall] = useState<Stall | null>(null);
  const [loading, setLoading] = useState(true);
  const [largeImageView, setLargeImageView] = useState<string | null>(null);

  const { setSelectedFoodCourt } = useFoodCourt();

  useEffect(() => {
    async function fetchStallData() {
      if (!stallId) {
        notFound();
        return;
      }
      setLoading(true);
      const fetchedStall = await getStallWithMenuItems(stallId);
      setStall(fetchedStall);

      if (fetchedStall && fetchedStall.food_court_id) {
        const foodCourt = await getFoodCourtById(fetchedStall.food_court_id);
        setSelectedFoodCourt(foodCourt);
      }
      setLoading(false);
    }
    fetchStallData();
  }, [stallId, setSelectedFoodCourt]);

  if (loading) {
    return (
      <div className="w-full">
        <Skeleton className="relative h-48 w-full md:h-64" />
        <div className="container relative mx-auto px-4 md:px-6">
          <div className="relative z-10 -mt-12 flex items-end gap-4 md:-mt-16">
            <Skeleton className="h-24 w-24 rounded-full border-4 border-background bg-card md:h-32 md:w-32" />
            <div className="pb-2 space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-5 w-32" />
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 py-8 md:px-6 space-y-12">
          <Skeleton className="h-10 w-full" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!stall) {
    notFound();
  }
  
  const handleItemClick = (item: MenuItem) => {
    setSelectedItem(item);
  };

  return (
    <>
      <div className="w-full">
         <div className="relative">
            <div className="relative h-48 w-full md:h-64">
              <Image
                src={stall.banner_url}
                alt={`${stall.name} banner`}
                fill
                style={{objectFit: 'cover'}}
                className="bg-muted object-cover"
                data-ai-hint="food stall"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
             <div className="container relative mx-auto px-4 md:px-6">
                <div className="relative z-10 -mt-12 flex items-end gap-4 md:-mt-16">
                     <Image
                        src={stall.logo_url}
                        alt={`${stall.name} logo`}
                        width={96}
                        height={96}
                        className="h-24 w-24 rounded-full border-4 border-background bg-card object-cover md:h-32 md:w-32"
                        data-ai-hint="company logo"
                      />
                    <div className="pb-2">
                      <h1 className="font-headline text-2xl font-extrabold text-white [text-shadow:1px_1px_3px_#000000a0] md:text-4xl">{stall.name}</h1>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-white">
                        <div className="flex items-center gap-1 rounded-full bg-black/30 px-2 py-0.5 backdrop-blur-sm">
                            {stall.rating && stall.rating > 0 ? (
                              <>
                                <StarRating rating={stall.rating} starClassName="h-4 w-4" />
                                <span className="font-semibold">{stall.rating.toFixed(1)}</span>
                              </>
                            ) : (
                               <Badge variant="outline" className="border-white/50 text-white">New</Badge>
                            )}
                        </div>
                        <div className="hidden items-center gap-2 sm:flex">
                          <span className="hidden sm:inline">•</span>
                          <span className="hidden sm:inline">{stall.tags.join(', ')}</span>
                        </div>
                      </div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 md:px-6">
        <div className="mb-4 flex flex-wrap gap-2 sm:hidden">
            {stall.tags.map(tag => <div key={tag} className="text-xs text-muted-foreground">#{tag}</div>)}
        </div>
        {stall.menu.map((category, index) => (
          <section key={index} className="mb-12">
            <h2 className="font-headline text-2xl font-bold md:text-3xl">{category.title}</h2>
            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {category.items.map((item) => (
                <Card key={item.id} className="flex flex-col overflow-hidden">
                  <button className="relative block w-full" onClick={() => setLargeImageView(item.imageUrl)}>
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      width={400}
                      height={300}
                      className="h-40 w-full object-cover md:h-48"
                      data-ai-hint="food item"
                    />
                  </button>
                  <CardHeader>
                    <CardTitle className="font-headline text-xl">{item.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow space-y-2">
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                    <div className="flex items-center justify-between text-sm min-h-[20px]">
                        {item.rating && item.rating > 0 && (
                           <div className="flex items-center gap-2">
                             <StarRating rating={item.rating} />
                           </div>
                        )}
                        {item.orders && item.orders > 0 && (
                          <div className="flex items-center gap-2">
                              <Flame className="h-4 w-4 text-red-500" />
                              <span className="font-medium">{item.orders}+ ordered</span>
                          </div>
                        )}
                    </div>
                  </CardContent>
                  <div className="border-t p-4 flex justify-between items-center">
                     <p className="text-xl font-bold text-primary">₹{item.price}</p>
                     <Button onClick={() => handleItemClick(item)}>Add</Button>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        ))}
      </div>
      
      {selectedItem && (
        <MenuItemDialog 
            item={selectedItem} 
            stall={{id: stall.id, name: stall.name, food_court_id: stall.food_court_id}} 
            open={!!selectedItem} 
            onOpenChange={(open) => !open && setSelectedItem(null)}
        />
      )}

      {largeImageView && (
        <Dialog open={!!largeImageView} onOpenChange={(open) => !open && setLargeImageView(null)}>
            <DialogContent className="max-w-3xl p-0">
                 <Image
                    src={largeImageView}
                    alt="Enlarged menu item"
                    width={800}
                    height={600}
                    className="w-full h-auto object-contain rounded-lg"
                    data-ai-hint="food item"
                  />
            </DialogContent>
        </Dialog>
      )}
    </>
  );
}
