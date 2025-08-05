
'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

interface StallUpdateData {
  name?: string;
  tags?: string[];
  logoUrl?: string;
  bannerUrl?: string;
}

export async function updateStallDetails(prevState: any, stallId: string, data: StallUpdateData) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/vendor/login');
  }
  
  if (!stallId) {
    return { message: 'Stall ID is missing.', errors: { stallId: true }};
  }

  const { data: stall, error: stallError } = await supabase
    .from('stalls')
    .select('id')
    .eq('owner_id', user.id)
    .eq('id', stallId)
    .single();

  if (stallError || !stall) {
    console.error('Security check failed: User does not own stall', stallError);
    return { message: 'You do not have permission to edit this stall.', errors: { auth: true } };
  }
  
  const updatePayload: { name?: string, tags?: string[], logo_url?: string, banner_url?: string } = {};
  if (data.name) updatePayload.name = data.name;
  if (data.tags) updatePayload.tags = data.tags;
  if (data.logoUrl) updatePayload.logo_url = data.logoUrl;
  if (data.bannerUrl) updatePayload.banner_url = data.bannerUrl;
  
  if (Object.keys(updatePayload).length === 0) {
    return { message: 'No data to update.', errors: {} };
  }

  const { error: updateError } = await supabase
    .from('stalls')
    .update(updatePayload)
    .eq('id', stallId);

  if (updateError) {
    console.error('Error updating stall details:', updateError);
    return { message: updateError.message, errors: { db: true } };
  }

  revalidatePath('/vendor/dashboard/profile');
  revalidatePath(`/stalls/${stallId}`);
  
  return { message: 'Stall details updated successfully!', errors: {} };
}
