
'use server';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
    DollarSign,
    Package,
    Bell,
    CheckCircle,
    BarChart
} from 'lucide-react'
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

async function getDashboardData(stallId: string) {
    const supabase = createSupabaseServerClient();
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today in local time
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1); // Start of tomorrow

    const todayIso = today.toISOString();
    const tomorrowIso = tomorrow.toISOString();

    // Fetch order items for the given stall created today
    const { data: todayItems, error: itemsError } = await supabase
        .from('order_items')
        .select('total_price, status, order_id')
        .eq('stall_id', stallId)
        .gte('created_at', todayIso)
        .lt('created_at', tomorrowIso);

    if (itemsError) {
        console.error('Error fetching dashboard data:', itemsError);
        return {
            revenue: 0,
            totalOrders: 0,
            newOrdersCount: 0,
            completedItemsCount: 0,
            averageOrderValue: 0,
        };
    }
    
    const revenue = todayItems
        .filter(item => item.status === 'completed' || item.status === 'delivered')
        .reduce((sum, item) => sum + item.total_price, 0);

    const totalOrders = new Set(todayItems.map(item => item.order_id)).size;
    
    const newOrderIds = new Set(
        todayItems
            .filter(item => item.status === 'pending')
            .map(item => item.order_id)
    );
    const newOrdersCount = newOrderIds.size;
    
    const completedItemsCount = todayItems.filter(item => item.status === 'completed' || item.status === 'delivered').length;

    const averageOrderValue = totalOrders > 0 ? revenue / totalOrders : 0;

    return {
        revenue,
        totalOrders,
        newOrdersCount,
        completedItemsCount,
        averageOrderValue,
    };
}


export default async function VendorDashboard() {
  const supabase = await createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/vendor/login');
  }

  const { data: stall, error } = await supabase
    .from('stalls')
    .select('id, name')
    .eq('owner_id', user.id)
    .single();

  if (error || !stall) {
    console.error('Error fetching stall for user:', user.id, error);
    return (
        <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <h1 className="font-headline text-2xl">Error</h1>
            <p className="text-muted-foreground">Could not find a stall associated with your account.</p>
            <p className="text-muted-foreground mt-2 text-sm">Please contact support if you believe this is an error.</p>
            <Button asChild variant="link" className="mt-4"><Link href="/vendor/login">Return to Login</Link></Button>
        </div>
    );
  }
  
  const { revenue, totalOrders, newOrdersCount, completedItemsCount, averageOrderValue } = await getDashboardData(stall.id);


  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl font-headline">
          Welcome, {stall.name}!
        </h1>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Today's Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{revenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              From completed orders
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{totalOrders}</div>
             <p className="text-xs text-muted-foreground">
              Total orders received
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Orders</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{newOrdersCount}</div>
            <p className="text-xs text-muted-foreground">
              Waiting for acceptance
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{averageOrderValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Average across all orders
            </p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Items</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{completedItemsCount}</div>
            <p className="text-xs text-muted-foreground">
              Items served today
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
