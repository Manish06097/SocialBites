

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { getStallWithMenuItems, getFoodCourtById } from '@/lib/supabase/queries';
import type { MenuItem, Stall } from '@/lib/types';
import { useFoodCourt } from '@/context/FoodCourtProvider';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Flame, Utensils, ChevronsDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MenuItemDialog } from '@/components/MenuItemDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { StarRating } from '@/components/StarRating';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

function MenuItemCard({ item, onAddToCartClick }: { item: MenuItem, onAddToCartClick: (item: MenuItem) => void }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const descriptionTooLong = item.description && item.description.length > 60;

    return (
        <Card className="flex flex-col overflow-hidden">
             <div className="relative w-full aspect-[4/3]">
                <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    className="object-cover bg-muted"
                    data-ai-hint="food item"
                />
            </div>
            <CardContent className="p-3 flex flex-col flex-grow">
                <div className="flex-grow space-y-2">
                    <h3 className="font-headline text-lg font-semibold">{item.name}</h3>
                    {item.description && (
                        <>
                        <p className={cn("text-sm text-muted-foreground", !isExpanded && "line-clamp-2")}>
                            {item.description}
                        </p>
                        {descriptionTooLong && (
                            <button onClick={() => setIsExpanded(!isExpanded)} className="text-primary hover:underline text-xs font-semibold">
                                {isExpanded ? 'Read Less' : 'Read More'}
                            </button>
                        )}
                        </>
                    )}
                    <div className="flex items-center justify-between text-sm min-h-[20px] pt-1">
                        <div className="flex items-center gap-2">
                            {item.rating && item.rating > 0 ? (
                                <StarRating rating={item.rating} />
                            ) : (
                                <Badge variant="outline" className="text-xs">New</Badge>
                            )}
                        </div>
                        {item.orders > 0 && (
                            <div className="flex items-center gap-1 text-red-500">
                                <Flame className="h-4 w-4" />
                                <span className="text-xs font-medium">{item.orders}+ ordered</span>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
            <div className="border-t p-3 flex justify-between items-center bg-muted/30 mt-auto">
                <p className="text-xl font-bold text-primary">₹{item.price}</p>
                <Button size="sm" onClick={() => onAddToCartClick(item)}>Add</Button>
            </div>
        </Card>
    )
}


export default function StallPage() {
  const params = useParams();
  const stallId = Array.isArray(params.stallId) ? params.stallId[0] : params.stallId;
  const [selectedItemForCart, setSelectedItemForCart] = useState<MenuItem | null>(null);
  const [stall, setStall] = useState<Stall | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCategoryPopoverOpen, setIsCategoryPopoverOpen] = useState(false);

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
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!stall) {
    notFound();
  }
  
  const handleAddToCartClick = (item: MenuItem) => {
    setSelectedItemForCart(item);
  };
  
  const handleCategoryClick = () => {
    setIsCategoryPopoverOpen(false);
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
          <section key={index} id={category.title.replace(/\s+/g, '-').toLowerCase()} className="mb-12 scroll-mt-20">
            <h2 className="font-headline text-2xl font-bold md:text-3xl">{category.title}</h2>
            <div className="mt-6 grid grid-cols-2 gap-4 md:gap-6">
              {category.items.map((item) => (
                <MenuItemCard key={item.id} item={item} onAddToCartClick={handleAddToCartClick} />
              ))}
            </div>
          </section>
        ))}
      </div>
      
      {selectedItemForCart && (
        <MenuItemDialog 
            item={selectedItemForCart} 
            stall={{id: stall.id, name: stall.name, food_court_id: stall.food_court_id}} 
            open={!!selectedItemForCart} 
            onOpenChange={(open) => !open && setSelectedItemForCart(null)}
        />
      )}

       {stall.menu.length > 1 && (
         <Popover open={isCategoryPopoverOpen} onOpenChange={setIsCategoryPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              className="fixed bottom-20 right-4 z-40 h-14 w-14 rounded-full shadow-lg md:hidden"
              size="icon"
            >
              <Utensils className="h-6 w-6" />
              <span className="sr-only">Browse Categories</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-2" side="top" align="end">
              <h4 className="px-2 py-1.5 font-semibold font-headline">Categories</h4>
              <ScrollArea className="h-auto max-h-64">
                <div className="flex flex-col gap-1 p-1">
                    {stall.menu.map((category) => (
                      <Link
                        key={category.title}
                        href={`#${category.title.replace(/\s+/g, '-').toLowerCase()}`}
                        onClick={handleCategoryClick}
                        className="rounded-md px-3 py-2 text-sm hover:bg-accent"
                      >
                        {category.title}
                      </Link>
                    ))}
                </div>
              </ScrollArea>
          </PopoverContent>
        </Popover>
      )}
    </>
  );
}
