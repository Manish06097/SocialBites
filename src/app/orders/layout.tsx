import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import OrdersPage from "./page";

// This layout now only handles authentication and renders the page component,
// which in turn renders the client component responsible for all data fetching.
export default async function OrdersLayout({
    children,
} : {
    children: React.ReactNode;
}) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    return <>{children}</>;
}
