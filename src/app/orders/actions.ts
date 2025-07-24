
'use server';

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { CartItem, Order } from "@/lib/types";
import { revalidatePath } from "next/cache";

interface CreateOrderPayload {
    paymentMethod: string;
    cartItems: CartItem[];
    cartTotal: number;
    tableId: string;
    contactName: string;
    contactPhone: string;
}

export async function createOrder(payload: CreateOrderPayload) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'You must be logged in to create an order.' };
    }

    if (payload.cartItems.length === 0) {
        return { error: 'Your cart is empty.' };
    }

    const foodCourtId = payload.cartItems[0].stall.food_court_id;
    // New, more robust display_id generation
    const timestamp = Date.now().toString(36); // a base-36 string of the current time
    const randomPart = Math.random().toString(36).substring(2, 7); // a 5-char random string
    const displayId = `SSB-${timestamp.toUpperCase()}-${randomPart.toUpperCase()}`;

    // 1. Create the main order
    const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
            display_id: displayId,
            user_id: user.id,
            food_court_id: foodCourtId,
            table_id: payload.tableId,
            total_amount: payload.cartTotal,
            status: 'pending', // All orders start as pending
            contact_name: payload.contactName,
            contact_phone: payload.contactPhone,
        })
        .select('id')
        .single();

    if (orderError) {
        console.error("Error creating order:", orderError);
        return { error: 'Could not create the order.' };
    }

    const orderId = orderData.id;

    // 2. Create the order items
    const orderItemsToInsert = payload.cartItems.map(item => ({
        order_id: orderId,
        stall_id: item.stall.id,
        menu_item_id: item.menuItem.id,
        quantity: item.quantity,
        unit_price: item.menuItem.price,
        total_price: item.totalPrice,
        customizations: item.customizationChoices,
        special_instructions: item.specialInstructions,
        status: 'pending' // Each item also starts as pending
    }));

    const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsToInsert);

    if (itemsError) {
        console.error("Error inserting order items:", itemsError);
        // Here you might want to delete the order that was just created
        // for data consistency, but we'll keep it simple for now.
        return { error: 'Could not save order items.' };
    }
    
    revalidatePath(`/orders/${orderId}`);
    return { orderId };
}


export async function getOrderById(orderId: string) {
    const supabase = await createSupabaseServerClient();
     const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { order: null, error: 'User not authenticated.' };
    }

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
        .eq('id', orderId)
        .eq('user_id', user.id)
        .single();
    
    return { order: data as Order | null, error: error?.message || null };
}

export async function getLatestOrders() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { orders: null, error: 'User not authenticated.' };
    }
    
    // Calculate the timestamp for 1 hour ago
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

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
        .eq('user_id', user.id)
        .gt('created_at', oneHourAgo) // created in the last hour
        .not('status', 'in', '(completed,rejected)') // not yet delivered or rejected
        .order('created_at', { ascending: false });

    return { orders: data as Order[] | null, error: error?.message || null };
}


export async function getPastOrders(currentOrderIds: string[]) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { orders: null, error: 'User not authenticated.' };
    }
    
    // Guard against empty array which would cause a SQL error with `in ()`
    if (currentOrderIds.length === 0) {
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
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
        return { orders: data as Order[] | null, error: error?.message || null };
    }


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
        .eq('user_id', user.id)
        .not('id', 'in', `(${currentOrderIds.join(',')})`) // Exclude all current live orders
        .order('created_at', { ascending: false });

    return { orders: data as Order[] | null, error: error?.message || null };
}
