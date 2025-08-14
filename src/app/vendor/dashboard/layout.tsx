
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Bell,
  Home,
  Package2,
  Utensils,
  Settings,
  QrCode,
  LogOut,
  ClipboardList,
  Star
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import VendorBottomNavBar from '@/components/VendorBottomNavBar'
import { signOut } from '../actions'
import { LogoutButton } from '@/components/LogoutButton'

const navItems = [
    { href: '/vendor/dashboard', icon: Home, label: 'Dashboard' },
    { href: '/vendor/dashboard/orders', icon: ClipboardList, label: 'Orders' },
    { href: '/vendor/dashboard/reviews', icon: Star, label: 'Reviews' },
    { href: '/vendor/dashboard/menu', icon: Utensils, label: 'Menu' },
    { href: '/vendor/dashboard/profile', icon: Settings, label: 'Profile' },
    { href: '/vendor/dashboard/qr', icon: QrCode, label: 'QR Codes' },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

   const isActive = (href: string) => {
    // Exact match for the dashboard, otherwise check for start.
    if (href === '/vendor/dashboard') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };


  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Package2 className="h-6 w-6 text-primary" />
              <span className="">Surat Social Bites</span>
            </Link>
            <Button variant="outline" size="icon" className="ml-auto h-8 w-8">
              <Bell className="h-4 w-4" />
              <span className="sr-only">Toggle notifications</span>
            </Button>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {navItems.map(({ href, icon: Icon, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                    isActive(href) && 'bg-muted text-primary'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="mt-auto p-4">
            <LogoutButton action={signOut} />
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 md:hidden">
            <Link
                href="#"
                className="flex items-center gap-2 text-lg font-semibold"
            >
                <Package2 className="h-6 w-6 text-primary" />
                <span>SSB Vendor</span>
            </Link>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background pb-20 md:pb-6">
          {children}
        </main>
        <VendorBottomNavBar />
      </div>
    </div>
  )
}
