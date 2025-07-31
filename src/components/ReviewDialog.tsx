
'use client';

import { useState, useTransition } from 'react';
import type { Order, OrderItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import { Textarea } from './ui/textarea';
import Image from 'next/image';
import { Star, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface ReviewDialogProps {
  order: Order;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: { orderId: string, reviews: { order_item_id: string; rating: number | null; review: string | null; }[] }) => Promise<{ error?: string, success?: boolean }>;
  onSuccess: () => void;
}

interface ItemReview {
    order_item_id: string;
    rating: number | null;
    review: string | null;
}

const StarRating = ({ rating, setRating, disabled }: { rating: number; setRating: (rating: number) => void, disabled?: boolean }) => {
    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    type="button"
                    key={star}
                    onClick={() => !disabled && setRating(star)}
                    className={cn("disabled:cursor-not-allowed", !disabled && "cursor-pointer")}
                    disabled={disabled}
                >
                    <Star
                        className={cn(
                            'h-6 w-6',
                            rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                        )}
                    />
                </button>
            ))}
        </div>
    );
};

export function ReviewDialog({ order, open, onOpenChange, onSubmit, onSuccess }: ReviewDialogProps) {
  const [reviews, setReviews] = useState<ItemReview[]>(
    order.order_items.map(item => ({
      order_item_id: item.id,
      rating: item.rating || 0,
      review: item.review || '',
    }))
  );
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleRatingChange = (itemId: string, rating: number) => {
    setReviews(prev =>
      prev.map(r => (r.order_item_id === itemId ? { ...r, rating } : r))
    );
  };

  const handleReviewTextChange = (itemId: string, review: string) => {
    setReviews(prev =>
      prev.map(r => (r.order_item_id === itemId ? { ...r, review } : r))
    );
  };

  const handleSubmit = () => {
    startTransition(async () => {
        const result = await onSubmit({ orderId: order.id, reviews });
        if (result.error) {
            toast({
                variant: 'destructive',
                title: 'Submission Failed',
                description: result.error,
            })
        } else {
            onSuccess();
            onOpenChange(false);
        }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">Leave a Review</DialogTitle>
          <DialogDescription>
            Your feedback helps us improve! Let us know how we did.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4 -mr-4">
          <div className="space-y-6 py-2">
            {order.order_items.map((item, index) => (
                <div key={item.id} className="space-y-3">
                    <div className="flex items-center gap-4">
                        <Image
                            src={item.menu_items?.image_url ?? "https://placehold.co/64x64.png"}
                            alt={item.menu_items?.name ?? "Menu item"}
                            width={64}
                            height={64}
                            className="rounded-md bg-muted"
                            data-ai-hint="food item"
                        />
                        <div>
                            <p className="font-semibold">{item.menu_items?.name}</p>
                            <p className="text-sm text-muted-foreground">{item.stalls?.name}</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <StarRating
                            rating={reviews[index]?.rating || 0}
                            setRating={(rating) => handleRatingChange(item.id, rating)}
                            disabled={isPending}
                        />
                        <Textarea
                            placeholder={`How was the ${item.menu_items?.name}?`}
                            value={reviews[index]?.review || ''}
                            onChange={(e) => handleReviewTextChange(item.id, e.target.value)}
                            disabled={isPending}
                        />
                    </div>
                </div>
            ))}
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit} disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? 'Submitting...' : 'Submit Review'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
