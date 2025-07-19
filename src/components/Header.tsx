
'use client';

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
import { useFoodCourt } from '@/context/FoodCourtProvider';
import { useCart } from '@/context/CartProvider';
import { useToast } from '@/hooks/use-toast';

const Header = () => {
  const { foodCourts, selectedFoodCourt, setSelectedFoodCourt } = useFoodCourt();
  const { cartItems, clearCart } = useCart();
  const { toast } = useToast();

  const handleFoodCourtChange = (court: typeof foodCourts[0]) => {
    if (cartItems.length > 0 && selectedFoodCourt.id !== court.id) {
       toast({
        variant: 'destructive',
        title: 'Clear your cart first!',
        description: `You have items from ${selectedFoodCourt.name}. You can only order from one food court at a time.`,
       });
    } else {
        setSelectedFoodCourt(court);
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/">
          <Logo />
        </Link>

        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 text-sm md:text-base">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="font-semibold">{selectedFoodCourt.name}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {foodCourts.map((court) => (
                <DropdownMenuItem
                  key={court.id}
                  onSelect={() => handleFoodCourtChange(court)}
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
