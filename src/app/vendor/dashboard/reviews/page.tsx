
'use server';

import { redirect } from 'next/navigation';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { getVendorStallId, getVendorReviews } from '@/app/vendor/actions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { StarRating } from '@/components/StarRating';
import { OrderItem } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';

function ReviewCard({ review }: { review: OrderItem }) {
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

export default async function VendorReviewsPage() {
    const stallId = await getVendorStallId();

    if (!stallId) {
        redirect('/vendor/login');
    }

    const reviews = await getVendorReviews(stallId);

    return (
        <div className="flex flex-col h-full">
            <CardHeader className="px-0 pt-0">
                <CardTitle className="font-headline text-2xl">Customer Reviews</CardTitle>
                <CardDescription>Here's what customers are saying about your food.</CardDescription>
            </CardHeader>

            {reviews.length === 0 ? (
                <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
                    <div className="flex flex-col items-center gap-1 text-center">
                        <h3 className="text-2xl font-bold tracking-tight">No reviews yet</h3>
                        <p className="text-sm text-muted-foreground">
                            Once customers leave feedback, you'll see it here.
                        </p>
                    </div>
                </div>
            ) : (
                <ScrollArea className="flex-1 -mx-4">
                    <div className="space-y-4 px-4">
                        {reviews.map(review => (
                            <ReviewCard key={review.id} review={review} />
                        ))}
                    </div>
                </ScrollArea>
            )}
        </div>
    );
}
