
'use server';

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { CartItem, Order, PaymentStatus, PaymentMethod, OrderItem, OrderStatus } from "@/lib/types";
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
            status: 'pending', // Master status starts as pending
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
        status: 'pending' as OrderStatus // Each item starts as pending
    }));

    const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsToInsert);

    if (itemsError) {
        console.error("Error inserting order items:", itemsError);
        // In a real app, you might want to delete the order record here
        // if the items fail to insert.
        return { error: 'Could not save order items.' };
    }

    if (payload.paymentMethod === 'upi') {
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const { error: updateError } = await supabase
            .from('orders')
            .update({ payment_status: 'completed' })
            .eq('id', orderId);

        if (updateError) {
            console.error("Error updating payment status:", updateError);
            return { error: 'Payment processing failed.' };
        }
    }
    
    revalidatePath(`/orders/${orderId}`);
    revalidatePath(`/orders`);
    return { orderId };
}


export async function getOrderById(orderId: string): Promise<{ order: Order | null; error: string | null }> {
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
        .gte('created_at', oneHourAgo)
        .not('status', 'in', '("completed","rejected")') // Note the double quotes for SQL strings
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

interface ReviewPayload {
    orderId: string;
    reviews: {
        order_item_id: string;
        rating: number | null;
        review: string | null;
    }[];
}

export async function submitReview({ orderId, reviews }: ReviewPayload) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'You must be logged in to submit a review.' };
    }

    // Verify user owns the order
    const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('id, user_id')
        .eq('id', orderId)
        .single();
    
    if (orderError || order?.user_id !== user.id) {
        return { error: 'You do not have permission to review this order.' };
    }
    
    // Update each order item with its review and rating
    const updatePromises = reviews.map(r => 
        supabase
            .from('order_items')
            .update({ rating: r.rating, review: r.review })
            .eq('id', r.order_item_id)
            .eq('order_id', orderId) // Ensure item belongs to the order
    );
    
    const results = await Promise.all(updatePromises);
    const someFailed = results.some(res => res.error);

    if (someFailed) {
        console.error('One or more order items failed to update with review.');
        // Not returning an error to the user for now, as some might have succeeded.
        // A more robust implementation might use a transaction.
    }

    // Mark the entire order as reviewed
    const { error: finalOrderUpdateError } = await supabase
        .from('orders')
        .update({ is_reviewed: true })
        .eq('id', orderId);
    
    if (finalOrderUpdateError) {
        console.error('Failed to mark order as reviewed:', finalOrderUpdateError);
        return { error: 'Could not finalize the review submission.' };
    }

    revalidatePath('/orders');
    return { success: true };
}
