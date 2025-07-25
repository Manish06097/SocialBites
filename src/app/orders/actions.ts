
'use server';

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { CartItem, Order, PaymentStatus, PaymentMethod } from "@/lib/types";
import { revalidatePath } from "next/cache";

interface CreateOrderPayload {
    paymentMethod: PaymentMethod;
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
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 7);
    const displayId = `SSB-${timestamp.toUpperCase()}-${randomPart.toUpperCase()}`;

    // For UPI, we initially set payment_status to 'pending'.
    // For COD, payment is also 'pending' until collected.
    const initialPaymentStatus: PaymentStatus = 'pending';
    
    // Simulate a unique payment ID for UPI for now
    const paymentId = payload.paymentMethod === 'upi' ? `PAY-${displayId}` : null;

    const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
            display_id: displayId,
            user_id: user.id,
            food_court_id: foodCourtId,
            table_id: payload.tableId,
            total_amount: payload.cartTotal,
            status: 'pending',
            contact_name: payload.contactName,
            contact_phone: payload.contactPhone,
            payment_method: payload.paymentMethod,
            payment_status: initialPaymentStatus,
            payment_id: paymentId,
        })
        .select('id')
        .single();

    if (orderError) {
        console.error("Error creating order:", orderError);
        return { error: 'Could not create the order.' };
    }

    const orderId = orderData.id;

    const orderItemsToInsert = payload.cartItems.map(item => ({
        order_id: orderId,
        stall_id: item.stall.id,
        menu_item_id: item.menuItem.id,
        quantity: item.quantity,
        unit_price: item.menuItem.price,
        total_price: item.totalPrice,
        customizations: item.customizationChoices,
        special_instructions: item.specialInstructions,
        status: 'pending'
    }));

    const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsToInsert);

    if (itemsError) {
        console.error("Error inserting order items:", itemsError);
        // TODO: In a real app, you might want to delete the order record here
        // if the items fail to insert.
        return { error: 'Could not save order items.' };
    }

    // In a real UPI integration, you would now call the PhonePe API,
    // get a redirect URL, and return that URL to the client.
    // For this simulation, we'll assume the payment is successful for UPI.
    if (payload.paymentMethod === 'upi') {
        // Simulate a delay for payment processing
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Update payment status to 'completed'
        const { error: updateError } = await supabase
            .from('orders')
            .update({ payment_status: 'completed' })
            .eq('id', orderId);

        if (updateError) {
            console.error("Error updating payment status:", updateError);
            // Even if payment status update fails, the order is still placed.
            // A background job could retry this. For now, we'll return an error.
            return { error: 'Payment processing failed.' };
        }
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
        .gt('created_at', oneHourAgo)
        .not('status', 'in', '(completed,rejected)')
        .order('created_at', { ascending: false });

    return { orders: data as Order[] | null, error: error?.message || null };
}


export async function getPastOrders({ currentOrderIds = [], limit = 5, offset = 0 }: { currentOrderIds: string[], limit?: number, offset?: number }) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { orders: null, error: 'User not authenticated.' };
    }
    
    let query = supabase
        .from('orders')
        .select(`
            *,
            order_items (
                *,
                menu_items (name, image_url),
                stalls (name)
            )
        `)
        .eq('user_id', user.id);
    
    if (currentOrderIds.length > 0) {
        query = query.not('id', 'in', `(${currentOrderIds.join(',')})`);
    }

    query = query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    const { data, error } = await query;

    return { orders: data as Order[] | null, error: error?.message || null };
}
