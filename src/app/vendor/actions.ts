
'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Order, OrderStatus, OrderItem } from '@/lib/types';
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
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Start of today in local time

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        id,
        quantity,
        total_price,
        customizations,
        special_instructions,
        menu_items (
          name,
          image_url
        ),
        stalls (
          name
        )
      )
    `)
    .in('id', 
        (await supabase
            .from('order_items')
            .select('order_id')
            .eq('stall_id', stallId)
        ).data?.map(o => o.order_id) || []
    )
    .gte('created_at', today.toISOString())
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching vendor orders:', error);
    return [];
  }

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
  
  let finalStatus = newStatus;

  // If marking as delivered, check if it was paid by UPI and auto-complete it
  if (newStatus === 'delivered') {
    const { data: order } = await supabase
      .from('orders')
      .select('payment_method')
      .eq('id', orderId)
      .single();

    if (order?.payment_method === 'upi') {
      finalStatus = 'completed';
    }
  }

  const { error: orderUpdateError } = await supabase
    .from('orders')
    .update({ status: finalStatus })
    .eq('id', orderId);

  if (orderUpdateError) {
    console.error('Error updating order status:', orderUpdateError);
    throw orderUpdateError;
  }

  const { error: itemUpdateError } = await supabase
    .from('order_items')
    .update({ status: finalStatus })
    .eq('order_id', orderId);
  
  if (itemUpdateError) {
    console.error('Error updating order items status:', itemUpdateError);
    throw itemUpdateError;
  }
  
  revalidatePath('/vendor/dashboard/orders');
  revalidatePath(`/orders/${orderId}`);
}

export async function markOrderAsPaid(orderId: string) {
    const supabase = await createSupabaseServerClient();

    const { error } = await supabase
        .from('orders')
        .update({ status: 'completed', payment_status: 'completed' })
        .eq('id', orderId)
        .eq('payment_method', 'cod'); // Only for COD orders

    if (error) {
        console.error('Error marking order as paid:', error);
        throw error;
    }

    revalidatePath('/vendor/dashboard/orders');
    revalidatePath(`/orders/${orderId}`);
}

export async function getVendorReviews(stallId: string): Promise<OrderItem[]> {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
        .from('order_items')
        .select(`
            id,
            rating,
            review,
            created_at,
            menu_items (
                name,
                image_url
            )
        `)
        .eq('stall_id', stallId)
        .or('rating.is.not.null,review.is.not.null')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching vendor reviews:', error);
        return [];
    }

    return data as any as OrderItem[];
}
