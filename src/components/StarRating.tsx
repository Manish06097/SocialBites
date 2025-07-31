
'use client';

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  className?: string;
  starClassName?: string;
}

export const StarRating = ({ rating, maxRating = 5, className, starClassName }: StarRatingProps) => {
  const roundedRating = Math.round(rating);
  const emptyStars = maxRating - roundedRating;

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {[...Array(roundedRating)].map((_, i) => (
        <Star key={`full-${i}`} className={cn("h-4 w-4 fill-yellow-400 text-yellow-400", starClassName)} />
      ))}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} className={cn("h-4 w-4 text-gray-300", starClassName)} />
      ))}
    </div>
  );
};
