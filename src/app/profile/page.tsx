
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronRight, LogOut, Package, User as UserIcon, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import { Skeleton } from '@/components/ui/skeleton';


interface TableInfo {
  tableId: string;
  foodCourtId: string;
}

interface Profile {
    full_name: string;
}

function ProfilePageSkeleton() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-8 md:px-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-20 w-20 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-5 w-64" />
        </div>
      </div>
      <Card className="mt-8">
        <CardHeader>
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-5 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
      <Skeleton className="mt-8 h-10 w-full" />
    </div>
  );
}

function ProfilePageContent() {
  const router = useRouter();
  const [tableInfo, setTableInfo] = useState<TableInfo | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    const fetchUserAndProfile = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
            setUser(user);
            if (!user.is_anonymous) {
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
            }
        } else {
            router.replace('/scan');
        }

        try {
            const tableInfoStr = localStorage.getItem('tableInfo');
            if (tableInfoStr) {
                setTableInfo(JSON.parse(tableInfoStr));
            }
        } catch (error) {
            console.error("Failed to parse table info", error);
        }

        setLoading(false);
    };

    fetchUserAndProfile();
  }, [router]);

  const handleLogout = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    localStorage.removeItem('tableInfo'); // Clear table info on logout
    router.push('/scan');
    router.refresh();
  };
  
  const isGuest = user?.is_anonymous;
  const displayName = isGuest ? 'Guest User' : (profile?.full_name || 'User');
  const displayInitial = displayName.charAt(0).toUpperCase();

  if (loading) {
      return <ProfilePageSkeleton />;
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8 md:px-6">
      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20">
          <AvatarFallback className="bg-primary/20 text-primary text-3xl">{displayInitial}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="font-headline text-2xl font-bold">{displayName}</h1>
          <p className="text-muted-foreground">
            {isGuest 
                ? (tableInfo ? `Currently at Table ${tableInfo.tableId}` : 'Welcome!')
                : user?.email
            }
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
                <Link href="/orders" className="flex items-center justify-between rounded-lg p-3 hover:bg-accent/50">
                    <div className="flex items-center gap-4">
                        <Package className="h-5 w-5 text-primary" />
                        <span className="font-medium">Order History</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </Link>
                <div className={`flex items-center justify-between rounded-lg p-3 ${isGuest && 'cursor-not-allowed text-muted-foreground/50'}`}>
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

export default function ProfilePage() {
    return (
        <Suspense fallback={<ProfilePageSkeleton />}>
            <ProfilePageContent />
        </Suspense>
    )
}
