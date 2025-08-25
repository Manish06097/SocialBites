
'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Order, OrderStatus, OrderItem, Stall, MenuCategory, MenuItem } from '@/lib/types';
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

export async function getStallWithMenuItems(stallId: string): Promise<Stall | null> {
  const supabase = await createSupabaseServerClient();
  const { data: stallData, error: stallError } = await supabase
    .from('stalls')
    .select(`*`)
    .eq('id', stallId)
    .maybeSingle();

  if (stallError || !stallData) {
    console.error('Error fetching stall:', stallError);
    return null;
  }

  const { data: menuItemsData, error: menuItemsError } = await supabase
    .from('menu_items')
    .select(`*`)
    .eq('stall_id', stallId)
    .order('category, name');

  if (menuItemsError) {
    console.error('Error fetching menu items:', menuItemsError);
    return { ...stallData, menu: [] } as Stall;
  }

  const menuCategories: { [key: string]: MenuItem[] } = {};
  (menuItemsData || []).forEach((item: any) => {
    const menuItem: MenuItem = {
      id: item.id,
      stall_id: item.stall_id,
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      imageUrl: item.image_url,
      available: item.available,
      customizations: item.customizations,
      rating: item.rating,
      orders: item.orders_count,
      created_at: item.created_at,
      updated_at: item.updated_at,
    };
    const categoryTitle = item.category || 'Uncategorized';
    if (!menuCategories[categoryTitle]) {
      menuCategories[categoryTitle] = [];
    }
    menuCategories[categoryTitle].push(menuItem);
  });

  const menu: MenuCategory[] = Object.keys(menuCategories).map(title => ({
    title,
    items: menuCategories[title],
  }));

  return { ...stallData, menu } as Stall;
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


export async function updateOrderItemStatus(orderId: string, stallId: string, newStatus: OrderStatus, itemId: string) {
  const supabase = await createSupabaseServerClient();

  const { error: itemUpdateError } = await supabase
    .from('order_items')
    .update({ status: newStatus })
    .eq('id', itemId)
    .eq('order_id', orderId)
    .eq('stall_id', stallId);
  
  if (itemUpdateError) {
    console.error('Error updating order item status:', itemUpdateError);
    throw itemUpdateError;
  }
  
  // After updating an item, check if the overall order status needs an update.
  await updateMasterOrderStatus(orderId);
  
  revalidatePath('/vendor/dashboard/orders');
  revalidatePath(`/orders/${orderId}`);
}

const calculateMasterStatus = (statuses: OrderStatus[]): OrderStatus => {
    if (statuses.every(s => s === 'completed' || s === 'rejected' || s === 'delivered')) {
        return 'completed';
    }
    if (statuses.some(s => s === 'pending')) return 'pending';
    if (statuses.some(s => s === 'accepted')) return 'accepted';
    if (statuses.some(s => s === 'preparing')) return 'preparing';
    
    // If all items are delivered but the order isn't complete yet, it's considered 'delivered'
    if (statuses.every(s => s === 'delivered' || s === 'rejected' || s === 'completed')) {
        return 'delivered';
    }

    return 'pending'; // Default fallback
}


// This function determines the master order status based on item statuses
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

    const allItemStatuses = orderItems.map(item => item.status as OrderStatus);
    const masterStatus = calculateMasterStatus(allItemStatuses);
    
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
        .eq('payment_method', 'cod');

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
