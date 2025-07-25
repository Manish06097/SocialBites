'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Order, OrderStatus } from '@/lib/types';

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  return redirect('/vendor/login');
}

export async function getVendorStallId(): Promise<string | null> {
  const supabase = createSupabaseServerClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error('Error getting user:', userError);
    return null;
  }

  const { data, error } = await supabase
    .from('stalls')
    .select('id')
    .eq('owner_id', user.id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching vendor stall ID:', error);
    return null;
  }

  return data?.id || null;
}

export async function getVendorOrders(stallId: string): Promise<Order[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('orders')
    .select(`
      id,
      display_id,
      user_id,
      food_court_id,
      table_id,
      total_amount,
      status,
      created_at,
      contact_name,
      contact_phone,
      order_items (
        id,
        order_id,
        stall_id,
        menu_item_id,
        quantity,
        unit_price,
        total_price,
        customizations,
        special_instructions,
        status,
        menu_items (
          name,
          image_url
        ),
        stalls (
          name
        )
      )
    `)
    .eq('order_items.stall_id', stallId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching vendor orders:', error);
    return [];
  }

  return data as any as Order[]; // Temporary cast to bypass TypeScript error for now
}

export async function updateOrderItemStatus(orderItemId: string, newStatus: OrderStatus) {
  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from('order_items')
    .update({ status: newStatus })
    .eq('id', orderItemId);

  if (error) {
    console.error('Error updating order item status:', error);
    throw error;
  }
}
