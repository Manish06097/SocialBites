
'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Order, OrderStatus } from '@/lib/types';
import { revalidatePath } from 'next/cache';

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
      *,
      order_items (
        *,
        menu_items (
          name,
          image_url
        ),
        stalls (
          name
        )
      )
    `)
    // We fetch orders that contain at least one item from the vendor's stall.
    // The RLS policy on 'order_items' will ensure we can only see items for our stall.
    // The RLS policy on 'orders' will ensure we can only see orders containing our items.
    .in('id', 
        (await supabase
            .from('order_items')
            .select('order_id')
            .eq('stall_id', stallId)
        ).data?.map(o => o.order_id) || []
    )
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching vendor orders:', error);
    return [];
  }

  // Since RLS on order_items filters items, we need to filter out orders that now have 0 items visible to the vendor.
  const filteredOrders = data.filter(order => order.order_items && order.order_items.length > 0);

  return filteredOrders as any as Order[];
}


export async function updateOrderItemStatus(orderItemId: string, newStatus: OrderStatus) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from('order_items')
    .update({ status: newStatus })
    .eq('id', orderItemId);

  if (error) {
    console.error('Error updating order item status:', error);
    throw error;
  }
}

export async function updateOrderStatus(orderId: string, newStatus: OrderStatus) {
  const supabase = await createSupabaseServerClient();
  
  // First, update the parent order status
  const { error: orderUpdateError } = await supabase
    .from('orders')
    .update({ status: newStatus })
    .eq('id', orderId);

  if (orderUpdateError) {
    console.error('Error updating order status:', orderUpdateError);
    throw orderUpdateError;
  }

  // Then, update all associated order items to the same status
  const { error: itemUpdateError } = await supabase
    .from('order_items')
    .update({ status: newStatus })
    .eq('order_id', orderId);
  
  if (itemUpdateError) {
    // Note: In a real app, you might want to handle this more gracefully,
    // maybe by rolling back the parent order status update.
    console.error('Error updating order items status:', itemUpdateError);
    throw itemUpdateError;
  }
  
  revalidatePath('/vendor/dashboard/orders');
  // Revalidate the public order tracking page as well.
  revalidatePath(`/orders/${orderId}`);
}
