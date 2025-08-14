
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
  const supabase = await createSupabaseServerClient();
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
  const supabase = await createSupabaseServerClient();
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Start of today in local time

  // Get all order_ids that have at least one item for this stall from today
  const { data: orderIdsData, error: orderIdsError } = await supabase
    .from('order_items')
    .select('order_id')
    .eq('stall_id', stallId)
    .gte('created_at', today.toISOString())
    
  if (orderIdsError) {
    console.error('Error fetching order IDs for vendor:', orderIdsError);
    return [];
  }
  
  if (!orderIdsData || orderIdsData.length === 0) {
      return [];
  }
  
  const uniqueOrderIds = [...new Set(orderIdsData.map(o => o.order_id))];

  // Now fetch the full order details for those order IDs
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        *,
        menu_items (name, image_url),
        stalls (name)
      )
    `)
    .in('id', uniqueOrderIds)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching vendor orders:', error);
    return [];
  }
  
  // Filter the order_items within each order to only include those for the current vendor.
  // And also ensure every order has an order_items array
  const ordersWithVendorSpecificItems = data.map(order => ({
      ...order,
      order_items: (order.order_items || []).filter(item => item.stall_id === stallId),
  }));

  // Finally, only return orders that still have items after filtering
  return ordersWithVendorSpecificItems.filter(order => order.order_items.length > 0) as any as Order[];
}


export async function updateOrderItemStatus(orderId: string, stallId: string, newStatus: OrderStatus) {
  const supabase = await createSupabaseServerClient();

  const { error: itemUpdateError } = await supabase
    .from('order_items')
    .update({ status: newStatus })
    .eq('order_id', orderId)
    .eq('stall_id', stallId); // This is the crucial part
  
  if (itemUpdateError) {
    console.error('Error updating order items status:', itemUpdateError);
    throw itemUpdateError;
  }
  
  // After updating items, we need to check if the overall order is completed.
  await updateMasterOrderStatus(orderId);
  
  revalidatePath('/vendor/dashboard/orders');
  revalidatePath(`/orders/${orderId}`);
}


// This new function determines the master order status based on item statuses
async function updateMasterOrderStatus(orderId: string) {
    const supabase = await createSupabaseServerClient();
    const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select('status')
        .eq('order_id', orderId);

    if (itemsError || !orderItems) {
        console.error("Could not fetch order items to update master status", itemsError);
        return;
    }

    const allItemStatuses = orderItems.map(item => item.status);
    let masterStatus: OrderStatus = 'pending';

    // Determine master status based on a priority order
    if (allItemStatuses.every(s => s === 'completed')) {
        masterStatus = 'completed';
    } else if (allItemStatuses.every(s => ['completed', 'rejected'].includes(s))) {
         masterStatus = 'completed'; // If all are done (either completed or rejected), mark as completed for customer.
    } else if (allItemStatuses.some(s => s === 'pending')) {
        masterStatus = 'pending';
    } else if (allItemStatuses.some(s => s === 'accepted')) {
        masterStatus = 'accepted';
    } else if (allItemStatuses.some(s => s === 'preparing')) {
        masterStatus = 'preparing';
    } else if (allItemStatuses.some(s => s === 'delivered')) {
        masterStatus = 'delivered';
    }
    
    // Now update the master `orders` table
    const { error: orderUpdateError } = await supabase
        .from('orders')
        .update({ status: masterStatus })
        .eq('id', orderId);

    if (orderUpdateError) {
        console.error("Failed to update master order status:", orderUpdateError);
    }
}


export async function markOrderAsPaid(orderId: string) {
    const supabase = await createSupabaseServerClient();

    const { error } = await supabase
        .from('orders')
        .update({ payment_status: 'completed' })
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
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
        .from('order_items')
        .select(`
            id,
            rating,
            review,
            created_at,
            menu_items (
                id,
                name,
                image_url
            )
        `)
        .eq('stall_id', stallId)
        .or('rating.not.is.null,review.not.is.null')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching vendor reviews:', error);
        return [];
    }

    return data as any as OrderItem[];
}
