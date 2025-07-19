

'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { CartProvider } from '@/context/CartProvider';
import { FoodCourtProvider } from '@/context/FoodCourtProvider';
import Header from '@/components/Header';
import BottomNavBar from '@/components/BottomNavBar';
import { CartSheet } from '@/components/CartSheet';

// This is a client component, so metadata should be exported from a server component or a layout.ts file if needed.
// export const metadata: Metadata = {
//   title: 'Surat Social Bites',
//   description: 'Order from the best food stalls in Surat!',
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Check for expired guest session on component mount
    try {
      const guestSessionStr = localStorage.getItem('guestSession');
      if (guestSessionStr) {
        const guestSession = JSON.parse(guestSessionStr);
        if (new Date().getTime() > guestSession.expiry) {
          localStorage.removeItem('guestSession');
          console.log('Expired guest session cleared.');
        }
      }
    } catch (error) {
      console.error("Could not process guest session from localStorage", error);
    }
  }, []);
  
  // Define routes that should have a clean layout (no header/footer)
  const cleanLayoutRoutes = ['/scan', '/vendor', '/login', '/signup', '/welcome'];
  const isCleanLayout = cleanLayoutRoutes.some(route => pathname.startsWith(route));

  if (isCleanLayout) {
    return (
       <html lang="en" className="scroll-smooth" suppressHydrationWarning={true}>
         <body className="font-body antialiased">
            {children}
            <Toaster />
         </body>
       </html>
    )
  }

  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning={true}>
      <head>
        <title>Surat Social Bites</title>
        <meta name="description" content="Order from the best food stalls in Surat!" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Satoshi:wght@400;500;700;900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <FoodCourtProvider>
          <CartProvider>
            <div className="flex min-h-screen flex-col pb-16 md:pb-0">
              <Header />
              <main className="flex-grow">{children}</main>
              <BottomNavBar onCartClick={() => setIsCartOpen(true)} />
            </div>
            <CartSheet open={isCartOpen} onOpenChange={setIsCartOpen} />
            <Toaster />
          </CartProvider>
        </FoodCourtProvider>
      </body>
    </html>
  );
}
