
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
    Bell
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type { OrderItem } from '@/lib/types'

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
        .select('total_price, status, order_id, orders(contact_name, table_id)')
        .eq('stall_id', stallId)
        .gte('created_at', todayIso)
        .lt('created_at', tomorrowIso);

    if (itemsError) {
        console.error('Error fetching dashboard data:', itemsError);
        return {
            revenue: 0,
            totalOrders: 0,
            newOrdersCount: 0,
            recentOrders: [],
        };
    }
    
    const revenue = todayItems
        .filter(item => item.status === 'completed')
        .reduce((sum, item) => sum + item.total_price, 0);

    const totalOrders = new Set(todayItems.map(item => item.order_id)).size;
    
    // Correctly count unique new orders
    const newOrderIds = new Set(
        todayItems
            .filter(item => item.status === 'pending')
            .map(item => item.order_id)
    );
    const newOrdersCount = newOrderIds.size;


    // Fetch last 5 unique orders
    const { data: recentOrderItems, error: recentOrdersError } = await supabase
        .from('order_items')
        .select('total_price, orders(display_id, contact_name, table_id)')
        .eq('stall_id', stallId)
        .order('created_at', { ascending: false })
        .limit(5);

     if (recentOrdersError) {
        console.error('Error fetching recent orders:', recentOrdersError);
     }
     
    // Process recent orders to group by order and sum total
    const recentOrdersMap = (recentOrderItems || []).reduce((acc, item) => {
        if (!item.orders) return acc;
        const { display_id, contact_name, table_id } = item.orders;
        if (!acc[display_id]) {
            acc[display_id] = {
                id: display_id,
                customerName: contact_name || 'Guest',
                table: table_id || 'N/A',
                total: 0
            };
        }
        acc[display_id].total += item.total_price;
        return acc;

    }, {} as Record<string, {id: string; customerName: string; table: string; total: number}>);

    const recentOrders = Object.values(recentOrdersMap);

    return {
        revenue,
        totalOrders,
        newOrdersCount,
        recentOrders,
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
  
  const { revenue, totalOrders, newOrdersCount, recentOrders } = await getDashboardData(stall.id);


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
              Based on completed orders today
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
              Total orders received today
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
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center">
             <div className="grid gap-2">
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>
                  A quick look at the most recent activity.
                </CardDescription>
            </div>
            <Button asChild size="sm" className="ml-auto gap-1">
                <Link href="/vendor/dashboard/orders">
                    View All
                    <ArrowUpRight className="h-4 w-4" />
                </Link>
            </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.map(order => (
                <TableRow key={order.id}>
                  <TableCell>
                    <div className="font-medium">{order.customerName}</div>
                    <div className="text-sm text-muted-foreground">
                      Table {order.table}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">₹{order.total.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  )
}
