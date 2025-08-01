
'use client';

import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { StarRating } from '@/components/StarRating';
import type { OrderItem } from '@/lib/types';

export default function ReviewCardClient({ review }: { review: OrderItem }) {
    const timeAgo = formatDistanceToNow(new Date(review.created_at!), { addSuffix: true });

    return (
        <Card>
            <CardContent className="p-4">
                <div className="flex gap-4">
                    <Image 
                        src={review.menu_items?.image_url || 'https://placehold.co/64x64.png'} 
                        alt={review.menu_items?.name || 'Menu Item'} 
                        width={64} height={64} 
                        className="rounded-md bg-muted aspect-square object-cover"
                        data-ai-hint="food item"
                    />
                    <div className="flex-1 space-y-2">
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="font-semibold">{review.menu_items?.name}</h4>
                                {review.rating && <StarRating rating={review.rating} />}
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
