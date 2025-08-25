
'use server';

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { CartItem, Order, PaymentStatus, PaymentMethod, OrderItem, OrderStatus } from "@/lib/types";
import { revalidatePath } from "next/cache";

const calculateMasterStatus = (statuses: OrderStatus[]): OrderStatus => {
    if (statuses.every(s => s === 'rejected')) return 'rejected';
    // If all items are delivered or rejected (but not all rejected), mark as delivered.
    if (statuses.every(s => s === 'delivered' || s === 'rejected')) return 'delivered';
    if (statuses.some(s => s === 'preparing')) return 'preparing';
    if (statuses.some(s => s === 'accepted')) return 'accepted';
    if (statuses.some(s => s === 'pending')) return 'pending';
    
    // Explicitly check for completed. This should only happen when manually set.
    if (statuses.every(s => s === 'completed')) return 'completed';

    return 'pending'; // Default fallback
}

interface CreateOrderPayload {
    paymentMethod: PaymentMethod;
    cartItems: CartItem[];
    cartTotal: number;
    tableId: string;
    contactName: string;
    contactPhone: string;
    isVendorOrder?: boolean;
    // stallId is now crucial for identifying the unique table context
    stallId: string; 
}

// Helper function to find an active order for a table within a specific food court, anchored to a stall
async function findActiveOrderByTable(tableId: string, foodCourtId: string, stallId: string) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
        .from('orders')
        .select('id, total_amount, user_id, contact_name, contact_phone')
        .eq('table_id', tableId)
        .eq('food_court_id', foodCourtId)
        .eq('anchor_stall_id', stallId) // Use the anchor stall to find the correct tab
        .not('status', 'in', '("completed","rejected")')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (error) {
        console.error("Error finding active order by table:", error);
        return null;
    }
    return data;
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
    if (!foodCourtId) {
        return { error: 'Could not determine the food court for this order.' };
    }

    // Now we pass all three identifiers to find the unique active order
    const activeOrder = await findActiveOrderByTable(payload.tableId, foodCourtId, payload.stallId);

    if (activeOrder) {
        // --- Logic to append to existing order ---
        const orderId = activeOrder.id;

        const orderItemsToInsert = payload.cartItems.map(item => ({
            order_id: orderId,
            stall_id: item.stall.id,
            menu_item_id: item.menuItem.id,
            quantity: item.quantity,
            unit_price: item.menuItem.price,
            total_price: item.totalPrice,
            customizations: item.customizationChoices,
            special_instructions: item.specialInstructions,
            status: payload.isVendorOrder ? 'accepted' : 'pending' as OrderStatus,
        }));

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItemsToInsert);

        if (itemsError) {
            console.error("Error appending order items:", itemsError);
            return { error: 'Could not add items to your existing order.' };
        }
        
        const newTotalAmount = activeOrder.total_amount + payload.cartTotal;
        
        const { data: allItems } = await supabase.from('order_items').select('status').eq('order_id', orderId);
        const newMasterStatus = calculateMasterStatus(allItems?.map(i => i.status) as OrderStatus[] || []);

        const { error: orderUpdateError } = await supabase
            .from('orders')
            .update({ 
                total_amount: newTotalAmount,
                status: newMasterStatus 
            })
            .eq('id', orderId);
            
        if (orderUpdateError) {
             console.error("Error updating order total:", orderUpdateError);
             return { error: 'Could not update your order total.' };
        }

        revalidatePath(`/orders`);
        revalidatePath(`/vendor/dashboard/orders`);
        revalidatePath(`/orders/${orderId}`);
        return { orderId: orderId, appended: true };

    } else {
        // --- Logic to create a new order ---
        const timestamp = Date.now().toString(36);
        const randomPart = Math.random().toString(36).substring(2, 7);
        const displayId = `SSB-${timestamp.toUpperCase()}-${randomPart.toUpperCase()}`;

        const initialPaymentStatus: PaymentStatus = payload.isVendorOrder && payload.paymentMethod === 'cod'
            ? 'pending' // Vendor orders are COD by default
            : 'pending';
        
        const initialMasterStatus: OrderStatus = payload.isVendorOrder ? 'accepted' : 'pending';
        const initialItemStatus: OrderStatus = payload.isVendorOrder ? 'accepted' : 'pending';


        // Fetch the anchor stall name
        const { data: anchorStall, error: anchorStallError } = await supabase
            .from('stalls')
            .select('name')
            .eq('id', payload.stallId)
            .single();

        if (anchorStallError || !anchorStall) {
            console.error("Error fetching anchor stall name:", anchorStallError);
            return { error: 'Could not determine the anchor stall name.' };
        }

        const { data: orderData, error: orderError } = await supabase
            .from('orders')
            .insert({
                display_id: displayId,
                user_id: user?.id,
                food_court_id: foodCourtId,
                table_id: payload.tableId,
                anchor_stall_id: payload.stallId, // Save the anchor stall ID
                anchor_stall_name: anchorStall.name, // Save the anchor stall name
                total_amount: payload.cartTotal,
                status: initialMasterStatus, 
                contact_name: payload.contactName,
                contact_phone: payload.contactPhone,
                payment_method: payload.paymentMethod,
                payment_status: initialPaymentStatus,
                payment_id: null,
            })
            .select('id')
            .single();

        if (orderError) {
            console.error("Error creating order:", orderError);
            return { error: 'Could not create the order. ' + orderError.message };
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
            status: initialItemStatus
        }));

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItemsToInsert);

        if (itemsError) {
            console.error("Error inserting order items:", itemsError);
            // Attempt to delete the parent order if items fail, to avoid orphaned orders
            await supabase.from('orders').delete().eq('id', orderId);
            return { error: 'Could not save order items.' };
        }
        
        revalidatePath(`/orders`);
        revalidatePath(`/vendor/dashboard/orders`);
        return { orderId };
    }
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
            anchor_stall_name,
            order_items (
                *,
                menu_items (name, image_url),
                stalls (name)
            )
        `)
        .eq('id', orderId)
        .single();
    
    if (data && data.user_id !== user.id) {
    }
    
    return { order: data as Order | null, error: error?.message || null };
}

export async function getLatestOrders() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { orders: null, error: 'User not authenticated.' };
    }
    
    const { data, error } = await supabase
        .from('orders')
        .select(`
            *,
            anchor_stall_name,
            order_items (
                *,
                menu_items (name, image_url),
                stalls (name)
            )
        `)
        .eq('user_id', user.id)
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
            anchor_stall_name,
            order_items (
                *,
                menu_items (name, image_url),
                stalls (name)
            )
        `)
        .eq('user_id', user.id)
        .in('status', ['completed', 'rejected']);

    if (currentOrderIds.length > 0) {
        query = query.not('id', 'in', `(${currentOrderIds.join(',')})`);
    }

    query = query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    const { data, error } = await query;

    const fetchedOrderIds = data ? data.map(order => order.id) : [];

    return { 
        orders: data as Order[] | null, 
        latestOrderIds: fetchedOrderIds,
        error: error?.message || null 
    };
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

    const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('id, user_id')
        .eq('id', orderId)
        .single();
    
    if (orderError || order?.user_id !== user.id) {
        return { error: 'You do not have permission to review this order.' };
    }
    
    const updatePromises = reviews.map(r => 
        supabase
            .from('order_items')
            .update({ rating: r.rating, review: r.review })
            .eq('id', r.order_item_id)
            .eq('order_id', orderId)
    );
    
    const results = await Promise.all(updatePromises);
    const someFailed = results.some(res => res.error);

    if (someFailed) {
        console.error('One or more order items failed to update with review.');
    }

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
