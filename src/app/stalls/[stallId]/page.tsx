
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { notFound, useParams } from 'next/navigation';
import { getStallById } from '@/lib/data';
import type { MenuItem, Stall } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MenuItemDialog } from '@/components/MenuItemDialog';
import { Skeleton } from '@/components/ui/skeleton';

export default function StallPage() {
  const params = useParams();
  const stallId = Array.isArray(params.stallId) ? params.stallId[0] : params.stallId;
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  
  const stall = getStallById(stallId);

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
                src={stall.bannerUrl}
                alt={`${stall.name} banner`}
                fill
                style={{objectFit: 'cover'}}
                className="bg-muted"
                data-ai-hint="food stall"
              />
            </div>
            <div className="container mx-auto px-4 md:px-6">
                <div className="relative z-10 -mt-12 flex items-end gap-4 md:-mt-16">
                     <Image
                        src={stall.logoUrl}
                        alt={`${stall.name} logo`}
                        width={96}
                        height={96}
                        className="h-24 w-24 rounded-full border-4 border-background bg-card object-cover md:h-32 md:w-32"
                        data-ai-hint="company logo"
                      />
                    <div className="pb-2">
                      <h1 className="font-headline text-3xl font-extrabold text-white [text-shadow:1px_1px_3px_#000000a0] md:text-4xl">{stall.name}</h1>
                      <div className="mt-1 flex items-center gap-2 rounded-full bg-black/30 px-2 py-1 text-white backdrop-blur-sm">
                        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{stall.rating.toFixed(1)}</span>
                        <span className='hidden sm:inline'>•</span>
                        <span className='hidden sm:inline'>{stall.tags.join(', ')}</span>
                      </div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 md:px-6">
        <div className="mb-4 flex flex-wrap gap-2 sm:hidden">
            {stall.tags.map(tag => <div key={tag} className="text-sm text-muted-foreground">{tag}</div>)}
        </div>
        {stall.menu.map((category, index) => (
          <section key={index} className="mb-12">
            <h2 className="font-headline text-3xl font-bold">{category.title}</h2>
            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {category.items.map((item) => (
                <Card key={item.id} className="flex flex-col overflow-hidden">
                  <div className="relative">
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      width={400}
                      height={300}
                      className="h-48 w-full object-cover"
                      data-ai-hint="food item"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle className="font-headline text-xl">{item.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow space-y-2">
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                           <Star className="h-4 w-4 fill-yellow-400 text-yellow-500" />
                           <span className="font-medium">{item.rating}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Flame className="h-4 w-4 text-red-500" />
                            <span className="font-medium">{item.orders}+ ordered</span>
                        </div>
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
            stall={{id: stall.id, name: stall.name}} 
            open={!!selectedItem} 
            onOpenChange={(open) => !open && setSelectedItem(null)}
        />
      )}
    </>
  );
}
