
'use client';

import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { StarRating } from '@/components/StarRating';
import type { OrderItem } from '@/lib/types';
import { cn } from '@/lib/utils';


export default function ReviewCardClient({ review, showRating = true }: { review: OrderItem, showRating?: boolean }) {
    const timeAgo = formatDistanceToNow(new Date(review.created_at!), { addSuffix: true });
    
    // Don't render if there's no review text and we're not showing ratings
    if (!review.review && !showRating) return null;

    return (
        <Card className={cn(!showRating && "bg-muted/50 border-dashed")}>
            <CardContent className="p-4">
                <div className="flex gap-4">
                   {showRating && review.menu_items && (
                     <Image 
                        src={review.menu_items?.image_url || 'https://placehold.co/64x64.png'} 
                        alt={review.menu_items?.name || 'Menu Item'} 
                        width={64} height={64} 
                        className="rounded-md bg-muted aspect-square object-cover"
                        data-ai-hint="food item"
                    />
                   )}
                    <div className="flex-1 space-y-2">
                        <div className="flex justify-between items-start">
                            <div>
                                {showRating && review.menu_items && <h4 className="font-semibold">{review.menu_items.name}</h4>}
                                {showRating && review.rating && <StarRating rating={review.rating} />}
                            </div>
                            <p className="text-xs text-muted-foreground">{timeAgo}</p>
                        </div>
                        {review.review && <p className="text-sm text-muted-foreground italic">"{review.review}"</p>}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
