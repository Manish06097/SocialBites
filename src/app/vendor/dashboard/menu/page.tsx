
'use server';

import { Suspense } from 'react';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { MenuManagement } from '@/components/MenuManagement';
import type { MenuItem } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

async function fetchVendorData() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/vendor/login');
  }

  const { data: stall, error: stallError } = await supabase
    .from('stalls')
    .select('id, name')
    .eq('owner_id', user.id)
    .single();

  if (stallError || !stall) {
    console.error('Error fetching stall:', stallError);
    // You might want a better error page here
    return { user: null, stall: null, menuItems: [] };
  }

  const { data: menuItems, error: menuItemsError } = await supabase
    .from('menu_items')
    .select('*, stall_id')
    .eq('stall_id', stall.id)
    .order('category, name');
    
  if (menuItemsError) {
    console.error('Error fetching menu items:', menuItemsError);
    return { user, stall, menuItems: [] };
  }

  // The DB returns snake_case, the frontend expects camelCase for some fields
  const formattedMenuItems = menuItems.map(item => ({
    ...item,
    imageUrl: item.image_url,
    orders: item.orders_count,
  })) as MenuItem[];

  return { user, stall, menuItems: formattedMenuItems };
}

function MenuPageSkeleton() {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="font-headline text-lg font-semibold md:text-2xl">Menu Management</h1>
                <Skeleton className="h-10 w-36" />
            </div>
            <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
        </div>
    );
}

async function MenuPageContent() {
  const { stall, menuItems } = await fetchVendorData();

  if (!stall) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
        <h1 className="font-headline text-2xl">Stall Not Found</h1>
        <p className="text-muted-foreground">We couldn't find a stall associated with your account.</p>
      </div>
    );
  }

  return <MenuManagement initialMenuItems={menuItems} stallId={stall.id} />;
}

export default async function VendorMenuPage() {
  return (
    <Suspense fallback={<MenuPageSkeleton />}>
        <MenuPageContent />
    </Suspense>
  );
}
