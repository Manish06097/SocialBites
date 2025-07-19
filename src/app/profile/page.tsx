
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronRight, LogOut, Package, User as UserIcon, HelpCircle } from 'lucide-react';
import Link from 'next/link';

interface GuestSession {
  sessionId: string;
  tableId: string;
  foodCourtId: string;
  stallId: string;
  expiry: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const [guestSession, setGuestSession] = useState<GuestSession | null>(null);

  useEffect(() => {
    try {
      const sessionStr = localStorage.getItem('guestSession');
      if (sessionStr) {
        setGuestSession(JSON.parse(sessionStr));
      } else {
        // If no session, they shouldn't be here
        router.replace('/scan');
      }
    } catch (error) {
      console.error("Failed to parse guest session", error);
      router.replace('/scan');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('guestSession');
    router.push('/scan');
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8 md:px-6">
      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20">
          <AvatarFallback className="bg-primary/20 text-primary text-3xl">G</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="font-headline text-2xl font-bold">Guest User</h1>
          <p className="text-muted-foreground">
            {guestSession ? `Currently at Table ${guestSession.tableId}` : 'No table selected'}
          </p>
        </div>
      </div>
      
      <Card className="mt-8">
        <CardHeader>
            <CardTitle className="font-headline text-xl">My Account</CardTitle>
            <CardDescription>Manage your orders and settings.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex flex-col gap-1">
                 {/* This would link to a list of all past orders */}
                <Link href="/orders/SSB-12345" className="flex items-center justify-between rounded-lg p-3 hover:bg-accent/50">
                    <div className="flex items-center gap-4">
                        <Package className="h-5 w-5 text-primary" />
                        <span className="font-medium">Order History</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </Link>
                <div className="flex items-center justify-between rounded-lg p-3 text-muted-foreground/50 cursor-not-allowed">
                    <div className="flex items-center gap-4">
                        <UserIcon className="h-5 w-5" />
                        <span className="font-medium">Account Details</span>
                    </div>
                    <ChevronRight className="h-5 w-5" />
                </div>
                 <div className="flex items-center justify-between rounded-lg p-3 text-muted-foreground/50 cursor-not-allowed">
                    <div className="flex items-center gap-4">
                        <HelpCircle className="h-5 w-5" />
                        <span className="font-medium">Help & Support</span>
                    </div>
                    <ChevronRight className="h-5 w-5" />
                </div>
            </div>
        </CardContent>
      </Card>

      <div className="mt-8">
        <Button onClick={handleLogout} variant="outline" className="w-full">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
        </Button>
      </div>
    </div>
  );
}
