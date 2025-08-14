
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
    BarChart,
    TrendingUp,
    Clock
} from 'lucide-react'
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PeakHoursChart } from '@/components/PeakHoursChart';

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
        .select('total_price, status, order_id, created_at, menu_items(id, name)')
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
            bestsellers: [],
            peakHours: {},
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
    
    // Calculate Bestsellers
    const itemCounts: { [key: string]: { name: string; count: number } } = {};
    todayItems.forEach(item => {
        if (item.menu_items) {
            const id = item.menu_items.id;
            if (!itemCounts[id]) {
                itemCounts[id] = { name: item.menu_items.name, count: 0 };
            }
            itemCounts[id].count += 1;
        }
    });

    const bestsellers = Object.values(itemCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);
        
    // Calculate Peak Hours
    const peakHours: { [hour: number]: number } = {};
    const orderTimestamps: { [orderId: string]: string } = {};
    todayItems.forEach(item => {
        if (!orderTimestamps[item.order_id]) {
            orderTimestamps[item.order_id] = item.created_at;
        }
    });

    Object.values(orderTimestamps).forEach(timestamp => {
        const hour = new Date(timestamp).getHours();
        peakHours[hour] = (peakHours[hour] || 0) + 1;
    });


    return {
        revenue,
        totalOrders,
        newOrdersCount,
        completedItemsCount,
        averageOrderValue,
        bestsellers,
        peakHours,
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
  
  const { revenue, totalOrders, newOrdersCount, completedItemsCount, averageOrderValue, bestsellers, peakHours } = await getDashboardData(stall.id);


  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl font-headline">
          Welcome, {stall.name}!
        </h1>
      </div>
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
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

       <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="lg:col-span-1">
              <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Today's Bestsellers
                  </CardTitle>
                  <CardDescription>
                      Your most popular items today.
                  </CardDescription>
              </CardHeader>
              <CardContent>
                  {bestsellers.length > 0 ? (
                      <ul className="space-y-3">
                          {bestsellers.map((item, index) => (
                              <li key={item.name} className="flex justify-between items-center text-sm">
                                  <span className="font-medium">{index + 1}. {item.name}</span>
                                  <span className="font-bold text-primary">{item.count} sold</span>
                              </li>
                          ))}
                      </ul>
                  ) : (
                      <p className="text-sm text-muted-foreground">No orders yet today.</p>
                  )}
              </CardContent>
          </Card>
           <Card className="lg:col-span-2">
              <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Peak Hours
                  </CardTitle>
                   <CardDescription>
                      Orders by hour for today.
                  </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                 <PeakHoursChart data={peakHours} />
              </CardContent>
          </Card>
      </div>
    </div>
  )
}
