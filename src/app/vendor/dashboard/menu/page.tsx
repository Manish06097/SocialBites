
'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { PlusCircle, Pencil } from 'lucide-react'
import { stalls } from '@/lib/data' // We'll use mock data for now
import type { Stall, MenuItem } from '@/lib/types'
import { EditMenuItemDialog } from '@/components/EditMenuItemDialog'


// Let's assume the logged-in vendor is for 'Gopal Locho' (stall 's1')
const VENDOR_STALL_ID = 's1';

export default function VendorMenuPage() {
  const [stallData, setStallData] = useState<Stall | undefined>(stalls.find(s => s.id === VENDOR_STALL_ID));
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  if (!stallData) {
    return <div>Loading...</div>; // Or an error message
  }

  const handleAvailabilityChange = (itemId: string, newAvailability: boolean) => {
    // This is where you'd call an API. For now, we'll just update local state.
    console.log(`Setting item ${itemId} to ${newAvailability ? 'available' : 'sold out'}`);
    
    setStallData(prevStall => {
        if (!prevStall) return prevStall;
        
        const newMenu = prevStall.menu.map(category => ({
            ...category,
            items: category.items.map(item => 
                item.id === itemId ? { ...item, available: newAvailability } : item
            )
        }));

        return { ...prevStall, menu: newMenu };
    });
  };

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
  };
  
  const handleSaveChanges = (updatedItem: MenuItem) => {
    console.log("Saving changes for item:", updatedItem);
    // Here you would make an API call to save the changes
     setStallData(prevStall => {
        if (!prevStall) return prevStall;
        
        const newMenu = prevStall.menu.map(category => ({
            ...category,
            items: category.items.map(item => 
                item.id === updatedItem.id ? updatedItem : item
            )
        }));

        return { ...prevStall, menu: newMenu };
    });
    setEditingItem(null); // Close the dialog
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-lg font-semibold md:text-2xl">Menu Management</h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      <Accordion type="multiple" defaultValue={stallData.menu.map(cat => cat.title)} className="w-full mt-4 space-y-4">
        {stallData.menu.map((category) => (
          <AccordionItem key={category.title} value={category.title} className="border rounded-lg bg-card">
            <div className="flex w-full items-center justify-between p-4">
              <AccordionTrigger className="p-0 hover:no-underline font-headline text-xl flex-1 text-left">
                  {category.title}
              </AccordionTrigger>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                  <Pencil className="h-4 w-4" />
                  <span className="sr-only">Edit category name</span>
              </Button>
            </div>
            <AccordionContent className="p-4 pt-0">
                <div className="space-y-4">
                    {category.items.map((item: any) => (
                        <Card key={item.id}>
                            <CardContent className="flex items-center gap-4 p-4">
                                <Image 
                                    src={item.imageUrl} 
                                    alt={item.name} 
                                    width={80} 
                                    height={80} 
                                    className="h-20 w-20 rounded-md object-cover bg-muted"
                                    data-ai-hint="food item"
                                />
                                <div className="flex-grow">
                                    <h4 className="font-semibold">{item.name}</h4>
                                    <p className="text-sm text-primary font-bold">₹{item.price.toFixed(2)}</p>
                                     <div className="flex items-center space-x-2 mt-2">
                                        <Switch 
                                            id={`available-${item.id}`} 
                                            checked={item.available !== false} // Default to available if undefined
                                            onCheckedChange={(checked) => handleAvailabilityChange(item.id, checked)}
                                        />
                                        <Label htmlFor={`available-${item.id}`} className="text-xs text-muted-foreground">
                                            {item.available !== false ? 'Available' : 'Sold Out'}
                                        </Label>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" onClick={() => handleEditItem(item)}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                    <Button variant="outline" className="w-full">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add New Item
                    </Button>
                </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      
      {editingItem && (
        <EditMenuItemDialog 
            item={editingItem} 
            open={!!editingItem} 
            onOpenChange={(open) => !open && setEditingItem(null)}
            onSave={handleSaveChanges}
        />
      )}
    </>
  );
}
