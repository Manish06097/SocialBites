
'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function updateStallDetails(prevState: any, formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/vendor/login');
  }

  const stallId = formData.get('stallId') as string;
  const name = formData.get('stallName') as string;
  const tags = (formData.get('tags') as string).split(',').map(tag => tag.trim());

  if (!stallId || !name) {
    return { message: 'Stall ID and Name are required.', errors: { name: !name } };
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

  const { error: updateError } = await supabase
    .from('stalls')
    .update({ 
        name: name, 
        tags: tags
    })
    .eq('id', stallId);

  if (updateError) {
    console.error('Error updating stall details:', updateError);
    return { message: updateError.message, errors: { db: true } };
  }

  revalidatePath('/vendor/dashboard/profile');
  revalidatePath(`/stalls/${stallId}`);
  
  return { message: 'Stall details updated successfully!', errors: {} };
}

export async function updateStallImageUrl({ stallId, imageUrl, type }: { stallId: string; imageUrl: string; type: 'logo' | 'banner' }) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'You must be logged in.' };
    }

    const { data: stall, error: stallError } = await supabase
        .from('stalls')
        .select('id')
        .eq('owner_id', user.id)
        .eq('id', stallId)
        .single();
    
    if (stallError || !stall) {
        return { error: 'You do not have permission to edit this stall.' };
    }

    const columnToUpdate = type === 'logo' ? 'logo_url' : 'banner_url';

    const { error: updateError } = await supabase
        .from('stalls')
        .update({ [columnToUpdate]: imageUrl })
        .eq('id', stallId);
    
    if (updateError) {
        return { error: updateError.message };
    }

    revalidatePath('/vendor/dashboard/profile');
    revalidatePath(`/stalls/${stallId}`);
    return { success: true };
}
