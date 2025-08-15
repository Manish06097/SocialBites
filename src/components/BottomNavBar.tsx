'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ClipboardList, User, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/context/CartProvider';
import { Button } from './ui/button';

interface BottomNavBarProps {
  onCartClick: () => void;
}

const navItems = [
  { href: '/stalls', icon: Home, label: 'Stalls' },
  { href: '/orders', icon: ClipboardList, label: 'My Orders' },
  { href: '/profile', icon: User, label: 'Profile' }, 
];

export default function BottomNavBar({ onCartClick }: BottomNavBarProps) {
  const pathname = usePathname();
  const { cartCount } = useCart();

  const isActive = (href: string) => {
    // This logic ensures that /orders is active for /orders/[orderId]
    // but not for anything else, and /stalls is active for /stalls and /stalls/[stallId]
    if (href === '/stalls') {
      return pathname === href || pathname.startsWith('/stalls/');
    }
     if (href === '/orders') {
      return pathname === href || pathname.startsWith('/orders/');
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-sm md:hidden">
      <div className="container mx-auto grid h-16 max-w-md grid-cols-4 items-center justify-around px-4">
        {navItems.map(({ href, icon: Icon, label }) => {
          return (
            <Link
              key={label}
              href={href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 text-muted-foreground transition-colors hover:text-primary',
                isActive(href) && 'text-primary'
              )}
            >
              <Icon className="h-6 w-6" />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          );
        })}
        <div className="flex flex-col items-center justify-center gap-1">
           <Button variant="ghost" size="icon" onClick={onCartClick} className="relative h-auto p-0 text-muted-foreground hover:bg-transparent hover:text-primary">
              <ShoppingCart className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {cartCount}
                </span>
              )}
              <span className="sr-only">Open Cart</span>
            </Button>
          <span className="text-xs font-medium">Cart</span>
        </div>
      </div>
    </nav>
  );
}
