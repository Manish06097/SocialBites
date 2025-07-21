
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
import { cookies } from 'next/headers';

const mockRecentOrders = [
    { id: 'SSB-54321', customerName: 'Aisha Sharma', table: 'T05', total: 220, status: 'New' },
    { id: 'SSB-54322', customerName: 'Vikram Singh', table: 'T02', total: 120, status: 'Preparing' },
    { id: 'SSB-54323', customerName: 'Priya Mehta', table: 'T08', total: 80, status: 'New' },
    { id: 'SSB-54324', customerName: 'Karan Desai', table: 'T01', total: 180, status: 'Ready' },
]

export default async function VendorDashboard() {
  const cookieStore = cookies();
  const supabase = createSupabaseServerClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/vendor/login');
  }

  const { data: stall, error } = await supabase
    .from('stalls')
    .select('name')
    .eq('owner_id', user.id)
    .single();

  if (error || !stall) {
    console.error('Error fetching stall for user:', user.id, error);
    // Redirect or show an error message if the vendor doesn't have a stall assigned
    return (
        <div className="flex flex-col items-center justify-center h-full">
            <h1 className="font-headline text-2xl">Error</h1>
            <p>Could not find a stall associated with your account.</p>
            <Button asChild variant="link"><Link href="/vendor/login">Logout</Link></Button>
        </div>
    );
  }


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
            <div className="text-2xl font-bold">₹1,250.00</div>
            <p className="text-xs text-muted-foreground">
              +15.1% from yesterday
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+32</div>
             <p className="text-xs text-muted-foreground">
              +12.2% from last hour
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Orders</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
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
              {mockRecentOrders.map(order => (
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
