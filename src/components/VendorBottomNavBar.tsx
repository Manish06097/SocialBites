'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ClipboardList, Utensils, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/vendor/dashboard', icon: Home, label: 'Dashboard' },
  { href: '/vendor/dashboard/orders', icon: ClipboardList, label: 'Orders' },
  { href: '/vendor/dashboard/menu', icon: Utensils, label: 'Menu' },
  { href: '/vendor/dashboard/profile', icon: Settings, label: 'Profile' },
];

export default function VendorBottomNavBar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/vendor/dashboard') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-sm md:hidden">
      <div className="container mx-auto grid h-16 max-w-lg grid-cols-4 items-center justify-around px-4">
        {navItems.map(({ href, icon: Icon, label }) => (
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
        ))}
      </div>
    </nav>
  );
}
