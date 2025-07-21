
'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import VendorProfileClientPage from './client-page';
import type { Stall } from '@/lib/types';

export default async function VendorProfilePage() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/vendor/login');
  }

  const { data: stall, error } = await supabase
    .from('stalls')
    .select('*, logo_url, banner_url') // Select all columns for the type
    .eq('owner_id', user.id)
    .single();

  if (error || !stall) {
    console.error('Error fetching stall for user:', user.id, error);
    return (
        <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <h1 className="font-headline text-2xl">Error</h1>
            <p className="text-muted-foreground">Could not find a stall associated with your account.</p>
        </div>
    );
  }

  return <VendorProfileClientPage stall={stall as Stall} />
}
