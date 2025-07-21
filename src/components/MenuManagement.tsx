
'use client';

import { useState, useMemo, useTransition, useEffect } from 'react';
import Image from 'next/image';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { PlusCircle, Pencil } from 'lucide-react';
import type { MenuItem } from '@/lib/types';
import { EditMenuItemDialog } from '@/components/EditMenuItemDialog';
import { saveMenuItem, deleteMenuItem } from '@/app/vendor/dashboard/menu/actions';
import { useToast } from '@/hooks/use-toast';


interface MenuManagementProps {
    initialMenuItems: MenuItem[];
    stallId: string;
}

export function MenuManagement({ initialMenuItems, stallId }: MenuManagementProps) {
  const [menuItems, setMenuItems] = useState(initialMenuItems);
  const [editingItem, setEditingItem] = useState<Partial<MenuItem> & { isNew?: boolean } | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  
  useEffect(() => {
    setMenuItems(initialMenuItems);
  }, [initialMenuItems]);

  const menuItemsByCategory = useMemo(() => {
    return menuItems.reduce((acc, item) => {
        const category = item.category || 'Uncategorized';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(item);
        return acc;
    }, {} as Record<string, MenuItem[]>);
  }, [menuItems]);

  const allCategories = useMemo(() => {
    const categories = new Set(menuItems.map(item => item.category || 'Uncategorized'));
    return Array.from(categories);
  }, [menuItems]);


  const handleAvailabilityChange = (itemId: string, newAvailability: boolean) => {
    const itemToUpdate = menuItems.find(item => item.id === itemId);
    if (!itemToUpdate) return;
    
    const updatedItem = { ...itemToUpdate, available: newAvailability };
    
    // Optimistically update UI
    setMenuItems(prev => prev.map(item => item.id === itemId ? updatedItem : item));

    startTransition(async () => {
      const result = await saveMenuItem({...updatedItem, stall_id: stallId});
      if (result?.error) {
        toast({
          variant: 'destructive',
          title: 'Error updating item',
          description: result.error,
        });
        // Revert optimistic update
         setMenuItems(prev => prev.map(item => item.id === itemId ? itemToUpdate : item));
      }
    });
  };

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
  };

  const handleAddNewItem = () => {
    setEditingItem({
        name: '',
        price: 0,
        description: '',
        category: allCategories[0] || 'New Category',
        available: true,
        isNew: true,
        customizations: [],
    });
  };
  
  const handleSaveChanges = (updatedItem: Partial<MenuItem>) => {
    startTransition(async () => {
        const result = await saveMenuItem({...updatedItem, stall_id: stallId });
        if (result?.error) {
            toast({
                variant: 'destructive',
                title: 'Error saving item',
                description: result.error,
            });
        } else {
             toast({
                title: 'Success!',
                description: `Menu item "${updatedItem.name}" has been saved.`,
            });
            setEditingItem(null);
        }
    });
  }

  const handleDeleteItem = (itemId: string) => {
    startTransition(async () => {
        const result = await deleteMenuItem(itemId);
         if (result?.error) {
            toast({
                variant: 'destructive',
                title: 'Error deleting item',
                description: result.error,
            });
        } else {
             toast({
                title: 'Item Deleted',
                description: `The menu item has been successfully deleted.`,
            });
            setEditingItem(null);
        }
    });
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-lg font-semibold md:text-2xl">Menu Management</h1>
        <Button onClick={handleAddNewItem} disabled={isPending}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Item
        </Button>
      </div>

      <Accordion type="multiple" defaultValue={allCategories} className="w-full mt-4 space-y-4">
        {Object.entries(menuItemsByCategory).map(([categoryTitle, items]) => (
          <AccordionItem key={categoryTitle} value={categoryTitle} className="border rounded-lg bg-card">
            <div className="flex w-full items-center justify-between p-4">
               <AccordionTrigger className="p-0 hover:no-underline font-headline text-xl flex-1 text-left">
                  {categoryTitle}
              </AccordionTrigger>
               <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 opacity-50 cursor-not-allowed">
                  <Pencil className="h-4 w-4" />
                  <span className="sr-only">Edit category name</span>
              </Button>
            </div>
            <AccordionContent className="p-4 pt-0">
                <div className="space-y-4">
                    {items.map((item: MenuItem) => (
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
                                            disabled={isPending}
                                        />
                                        <Label htmlFor={`available-${item.id}`} className="text-xs text-muted-foreground">
                                            {item.available !== false ? 'Available' : 'Sold Out'}
                                        </Label>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" onClick={() => handleEditItem(item)} disabled={isPending}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      
      {editingItem && (
        <EditMenuItemDialog 
            item={editingItem}
            allCategories={allCategories}
            open={!!editingItem} 
            onOpenChange={(open) => !open && setEditingItem(null)}
            onSave={handleSaveChanges}
            onDelete={handleDeleteItem}
            isPending={isPending}
        />
      )}
    </>
  );
}
