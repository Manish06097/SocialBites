
'use server';

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// This page now acts as a redirector to the user's most recent order.
export default async function OrdersPage() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const { data: latestOrder, error } = await supabase
        .from('orders')
        .select('id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
    
    if (error || !latestOrder) {
        // If there are no orders, you might want to show a specific message.
        // For now, we'll create a placeholder page for this case.
        // A better approach would be a dedicated "No Orders Yet" component.
        return (
            <div className="container mx-auto flex h-[70vh] flex-col items-center justify-center text-center">
                <h1 className="font-headline text-3xl font-bold">No Orders Found</h1>
                <p className="mt-4 text-muted-foreground">You haven't placed any orders yet. Let's get you some food!</p>
            </div>
        )
    }

    // Redirect to the latest order's tracking page.
    redirect(`/orders/${latestOrder.id}`);
}
