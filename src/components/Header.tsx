
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, MapPin } from 'lucide-react';
import Logo from './Logo';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { foodCourts } from '@/lib/data';

const Header = () => {
  const [selectedFoodCourt, setSelectedFoodCourt] = useState(foodCourts[0]);

  return (
    <header className="sticky top-0 z-40 hidden w-full border-b bg-background/80 backdrop-blur-sm md:block">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/">
          <Logo />
        </Link>

        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="font-semibold">{selectedFoodCourt.name}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {foodCourts.map((court) => (
                <DropdownMenuItem
                  key={court.id}
                  onSelect={() => setSelectedFoodCourt(court)}
                >
                  {court.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
