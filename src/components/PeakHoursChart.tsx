
'use client'

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useTheme } from 'next-themes';

interface PeakHoursChartProps {
    data: { [hour: number]: number };
}

export function PeakHoursChart({ data }: PeakHoursChartProps) {
    const { theme } = useTheme();

    const chartData = Array.from({ length: 24 }, (_, i) => {
        const hour = i;
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 === 0 ? 12 : hour % 12;
        return {
            name: `${displayHour}${ampm}`,
            orders: data[hour] || 0,
        };
    });
    
    // Determine a sensible starting and ending hour to display on the chart
    const hoursWithOrders = Object.keys(data).map(Number);
    const minHour = hoursWithOrders.length > 0 ? Math.min(...hoursWithOrders) : 8;
    const maxHour = hoursWithOrders.length > 0 ? Math.max(...hoursWithOrders) : 22;
    
    // Show a window of 8 hours, centered around activity if possible
    let startHour = Math.max(0, minHour - 2);
    let endHour = Math.min(23, maxHour + 2);
    if(endHour - startHour < 8) {
        endHour = Math.min(23, startHour + 8);
    }
    if(endHour - startHour < 8) {
        startHour = Math.max(0, endHour - 8);
    }


    const visibleData = chartData.slice(startHour, endHour + 1);
    
    if (Object.keys(data).length === 0) {
        return (
            <div className="flex items-center justify-center h-60">
                <p className="text-muted-foreground text-sm">No order data for today yet.</p>
            </div>
        )
    }

    return (
        <ResponsiveContainer width="100%" height={240}>
            <BarChart data={visibleData}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                <XAxis 
                    dataKey="name" 
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                />
                <YAxis 
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    allowDecimals={false}
                />
                 <Tooltip
                    contentStyle={{
                        backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.5rem',
                    }}
                    cursor={{ fill: 'hsl(var(--primary) / 0.1)' }}
                />
                <Bar 
                    dataKey="orders" 
                    fill="hsl(var(--primary))" 
                    radius={[4, 4, 0, 0]} 
                />
            </BarChart>
        </ResponsiveContainer>
    )
}
