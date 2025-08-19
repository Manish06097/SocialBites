import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getPastOrders, getLatestOrders } from "./actions";
import OrdersPage from "./page"; // Import the client component

export default async function OrdersLayout() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const { orders: activeOrders, error: activeError } = await getLatestOrders();
    const { orders: pastOrders, latestOrderIds, error: pastError } = await getPastOrders({
        currentOrderIds: [],
        limit: 5,
        offset: 0
    });

    // Handle errors if necessary, though for now we'll just pass null/empty arrays
    if (activeError) console.error("Error fetching active orders:", activeError);
    if (pastError) console.error("Error fetching past orders:", pastError);

    const activeOrdersToPass = activeOrders || [];
    const pastOrdersToPass = pastOrders || [];
    const idsToPass = latestOrderIds || [];

    return (
        <OrdersPage 
            activeOrders={activeOrdersToPass} 
            pastOrders={pastOrdersToPass} 
            latestOrderIds={idsToPass} 
        />
    );
}
