
import Link from 'next/link';
import Image from 'next/image';
import { Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Stall } from '@/lib/types';
import { StarRating } from './StarRating';

interface StallCardProps {
  stall: Stall;
}

export default function StallCard({ stall }: StallCardProps) {
  return (
    <Link href={`/stalls/${stall.id}`} className="group block">
      <Card className="overflow-hidden transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1 h-full flex flex-col">
        <CardContent className="p-0 flex flex-col flex-grow">
          <div className="relative">
            <Image
              src={stall.banner_url}
              alt={`${stall.name} banner`}
              width={400}
              height={200}
              className="h-24 w-full object-cover"
              data-ai-hint="food stall"
            />
          </div>
          <div className="p-3 flex-grow flex flex-col">
            <div className="relative -mt-10 mb-2">
                 <Image
                    src={stall.logo_url}
                    alt={`${stall.name} logo`}
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-full border-2 border-card object-cover"
                    data-ai-hint="company logo"
                  />
            </div>
            <h3 className="font-headline text-base font-bold truncate flex-grow">{stall.name}</h3>
            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
              {stall.rating && stall.rating > 0 ? (
                <>
                  <StarRating rating={stall.rating} starClassName="h-3 w-3" />
                  <span className="font-semibold">{stall.rating.toFixed(1)}</span>
                </>
              ) : (
                <Badge variant="outline" className="text-primary border-primary text-xs">New</Badge>
              )}
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {stall.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="secondary" className="font-normal text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
