
'use server';

import { redirect } from 'next/navigation';
import { getVendorStallId, getVendorReviews } from '@/app/vendor/actions';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import ReviewCardClient from '@/components/ReviewCardClient';

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
                            <ReviewCardClient key={review.id} review={review} />
                        ))}
                    </div>
                </ScrollArea>
            )}
        </div>
    );
}
