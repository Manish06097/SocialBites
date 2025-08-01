
'use server';

import Image from 'next/image';
import { redirect } from 'next/navigation';
import { getVendorStallId, getVendorReviews } from '@/app/vendor/actions';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import ReviewCardClient from '@/components/ReviewCardClient';
import type { OrderItem } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

interface ReviewsByItem {
    [itemId: string]: {
        name: string;
        imageUrl: string;
        reviews: OrderItem[];
    }
}

export default async function VendorReviewsPage() {
    const stallId = await getVendorStallId();

    if (!stallId) {
        redirect('/vendor/login');
    }

    const reviews = await getVendorReviews(stallId);
    
    const reviewsByItem = reviews.reduce<ReviewsByItem>((acc, review) => {
        if (!review.menu_items || !review.review) { // Only include items with an actual review text
            return acc;
        }
        const menuItemId = review.menu_items.id;
        if (!acc[menuItemId]) {
            acc[menuItemId] = {
                name: review.menu_items.name,
                imageUrl: review.menu_items.image_url,
                reviews: [],
            };
        }
        acc[menuItemId].reviews.push(review);
        return acc;
    }, {});
    
    const itemsWithReviews = Object.values(reviewsByItem);

    return (
        <div className="flex flex-col h-full">
            <CardHeader className="px-0 pt-0">
                <CardTitle className="font-headline text-2xl">Customer Reviews</CardTitle>
                <CardDescription>Here's what customers are saying about your food.</CardDescription>
            </CardHeader>

            {itemsWithReviews.length === 0 ? (
                <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm mt-4">
                    <div className="flex flex-col items-center gap-1 text-center">
                        <h3 className="text-2xl font-bold tracking-tight">No written reviews yet</h3>
                        <p className="text-sm text-muted-foreground">
                            Once customers leave comments, you'll see them here.
                        </p>
                    </div>
                </div>
            ) : (
                 <Accordion type="multiple" className="w-full mt-4 space-y-4">
                    {Object.entries(reviewsByItem).map(([itemId, itemData]) => (
                      <AccordionItem key={itemId} value={itemId} className="border rounded-lg bg-card">
                         <AccordionTrigger className="p-4 hover:no-underline w-full">
                             <div className="flex items-center gap-4 text-left">
                                <Image
                                  src={itemData.imageUrl}
                                  alt={itemData.name}
                                  width={56}
                                  height={56}
                                  className="h-14 w-14 rounded-md object-cover bg-muted"
                                  data-ai-hint="food item"
                                />
                                <div>
                                    <h4 className="font-semibold">{itemData.name}</h4>
                                    <Badge variant="secondary">{itemData.reviews.length} review{itemData.reviews.length > 1 ? 's' : ''}</Badge>
                                </div>
                            </div>
                         </AccordionTrigger>
                         <AccordionContent className="p-4 pt-0">
                           <div className="space-y-4">
                            {itemData.reviews.map(review => (
                                <ReviewCardClient key={review.id} review={review} showRating={false} />
                            ))}
                           </div>
                         </AccordionContent>
                      </AccordionItem>
                    ))}
                 </Accordion>
            )}
        </div>
    );
}
