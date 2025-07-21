
'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { MenuItem } from '@/lib/types';
import { revalidatePath } from 'next/cache';

// The data coming from the form
export type MenuItemFormData = Omit<MenuItem, 'id' | 'stall_id' | 'imageUrl' | 'rating' | 'orders' | 'created_at' | 'updated_at'> & {
    id?: string; // id is optional for new items
    stall_id: string;
};

export async function saveMenuItem(formData: MenuItemFormData) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be logged in to save a menu item.' };
  }

  const { id, stall_id, name, description, price, category, available, customizations } = formData;
  
  // Verify the user owns the stall they are trying to edit
   const { data: stall, error: stallError } = await supabase
    .from('stalls')
    .select('id')
    .eq('owner_id', user.id)
    .eq('id', stall_id)
    .single();

  if (stallError || !stall) {
    console.error('Security check failed: User does not own stall', stallError);
    return { error: 'You do not have permission to edit this stall.' };
  }


  const itemToSave = {
    stall_id: stall_id,
    name,
    description,
    price,
    category,
    available,
    customizations,
    image_url: 'https://placehold.co/400x300.png', // Placeholder for now
    updated_at: new Date().toISOString(),
  };

  if (id) {
    // Update existing item
    const { data, error } = await supabase
      .from('menu_items')
      .update(itemToSave)
      .eq('id', id);
    
    if (error) {
      console.error('Error updating menu item:', error);
      return { error: error.message };
    }
  } else {
    // Create new item
    const { data, error } = await supabase
      .from('menu_items')
      .insert(itemToSave);

    if (error) {
      console.error('Error creating menu item:', error);
      return { error: error.message };
    }
  }

  // Revalidate the path to show the new data
  revalidatePath('/vendor/dashboard/menu');

  return { success: true };
}


export async function deleteMenuItem(itemId: string) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'You must be logged in to delete a menu item.' };
    }

    // Before deleting, verify the user owns the stall this item belongs to.
    const { data: itemData, error: itemError } = await supabase
        .from('menu_items')
        .select('stall_id')
        .eq('id', itemId)
        .single();
    
    if (itemError || !itemData) {
        return { error: 'Menu item not found.' };
    }

    const { data: stallData, error: stallError } = await supabase
        .from('stalls')
        .select('id')
        .eq('owner_id', user.id)
        .eq('id', itemData.stall_id)
        .single();

    if (stallError || !stallData) {
        return { error: 'You do not have permission to delete this item.' };
    }

    const { error: deleteError } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', itemId);

    if (deleteError) {
        console.error('Error deleting menu item:', deleteError);
        return { error: deleteError.message };
    }

    revalidatePath('/vendor/dashboard/menu');
    return { success: true };
}

