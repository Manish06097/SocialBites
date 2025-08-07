
'use client';

import Link from 'next/link';
import { MapPin } from 'lucide-react';
import Logo from './Logo';
import { useFoodCourt } from '@/context/FoodCourtProvider';

const Header = () => {
  const { selectedFoodCourt } = useFoodCourt();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/stalls">
          <Logo />
        </Link>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 rounded-md px-3 py-2 text-sm md:text-base">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="font-semibold">{selectedFoodCourt ? selectedFoodCourt.name : 'Loading...'}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
