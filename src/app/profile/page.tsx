
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronRight, LogOut, Package, User as UserIcon, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

interface GuestSession {
  sessionId: string;
  tableId: string;
  foodCourtId: string;
  expiry: number;
}

interface Profile {
    full_name: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [guestSession, setGuestSession] = useState<GuestSession | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    const fetchUserAndProfile = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
            setUser(user);
            const { data: profileData, error } = await supabase
                .from('profiles')
                .select('full_name')
                .eq('id', user.id)
                .single();

            if (error) {
                console.error('Error fetching profile:', error);
            } else {
                setProfile(profileData);
            }
        } else {
            try {
                const sessionStr = localStorage.getItem('guestSession');
                if (sessionStr) {
                    setGuestSession(JSON.parse(sessionStr));
                } else {
                    router.replace('/scan');
                }
            } catch (error) {
                console.error("Failed to parse guest session", error);
                router.replace('/scan');
            }
        }
        setLoading(false);
    };

    fetchUserAndProfile();
  }, [router]);

  const handleLogout = async () => {
    if (user) {
        const supabase = createSupabaseBrowserClient();
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh();
    } else {
        localStorage.removeItem('guestSession');
        router.push('/scan');
    }
  };

  const displayName = profile?.full_name || 'User';
  const displayInitial = displayName.charAt(0).toUpperCase();

  if (loading) {
      // You can add a proper skeleton loader here
      return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8 md:px-6">
      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20">
          <AvatarFallback className="bg-primary/20 text-primary text-3xl">{user ? displayInitial : 'G'}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="font-headline text-2xl font-bold">{user ? displayName : 'Guest User'}</h1>
          <p className="text-muted-foreground">
            {guestSession ? `Currently at Table ${guestSession.tableId}` : (user ? user.email : 'No table selected')}
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
                <Link href="/orders/SSB-12345" className="flex items-center justify-between rounded-lg p-3 hover:bg-accent/50">
                    <div className="flex items-center gap-4">
                        <Package className="h-5 w-5 text-primary" />
                        <span className="font-medium">Order History</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </Link>
                <div className={`flex items-center justify-between rounded-lg p-3 ${!user && 'cursor-not-allowed text-muted-foreground/50'}`}>
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
