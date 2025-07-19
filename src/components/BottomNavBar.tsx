'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ClipboardList, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', icon: Home, label: 'Stalls' },
  { href: '/orders/SSB-12345', icon: ClipboardList, label: 'My Order' },
  // NOTE: A proper profile page doesn't exist yet, so this links home.
  { href: '/', icon: User, label: 'Profile' }, 
];

export default function BottomNavBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-sm md:hidden">
      <div className="container mx-auto flex h-16 max-w-md items-center justify-around px-4">
        {navItems.map(({ href, icon: Icon, label }) => {
          // A more robust check might be needed if you have nested routes
          const isActive = pathname === href;

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 text-muted-foreground transition-colors hover:text-primary',
                isActive && 'text-primary'
              )}
            >
              <Icon className="h-6 w-6" />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
