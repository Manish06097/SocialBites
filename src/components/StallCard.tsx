
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
      <Card className="overflow-hidden transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1">
        <CardContent className="p-0">
          <div className="relative">
            <Image
              src={stall.banner_url}
              alt={`${stall.name} banner`}
              width={600}
              height={300}
              className="h-40 w-full object-cover"
              data-ai-hint="food stall"
            />
            <div className="absolute -bottom-8 left-4">
              <Image
                src={stall.logo_url}
                alt={`${stall.name} logo`}
                width={64}
                height={64}
                className="h-16 w-16 rounded-full border-4 border-card object-cover"
                data-ai-hint="company logo"
              />
            </div>
          </div>
          <div className="p-4 pt-6">
            <h3 className="font-headline text-xl font-bold truncate">{stall.name}</h3>
            <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
              {stall.rating && stall.rating > 0 ? (
                <>
                  <StarRating rating={stall.rating} />
                  <span className="font-semibold">{stall.rating.toFixed(1)}</span>
                </>
              ) : (
                <Badge variant="outline" className="text-primary border-primary">New</Badge>
              )}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {stall.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="font-normal">
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
