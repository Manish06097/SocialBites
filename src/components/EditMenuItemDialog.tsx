
'use client';

import { useState, useEffect } from 'react';
import type { MenuItem, Customization, CustomizationOption } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, PlusCircle, AlertTriangle } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Combobox } from './ui/combobox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface EditMenuItemDialogProps {
  item: Partial<MenuItem>;
  allCategories: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedItem: Partial<MenuItem>) => void;
  onDelete: (itemId: string) => void;
  isPending: boolean;
}

export function EditMenuItemDialog({ item, allCategories, open, onOpenChange, onSave, onDelete, isPending }: EditMenuItemDialogProps) {
  const [editedItem, setEditedItem] = useState(item);

  useEffect(() => {
    // Deep copy of item to avoid direct mutation
    setEditedItem(JSON.parse(JSON.stringify(item)));
  }, [item]);

  const handleFieldChange = (field: keyof MenuItem, value: any) => {
    setEditedItem(prev => ({ ...prev, [field]: value }));
  };

  const handleCustomizationChange = (custIndex: number, field: keyof Customization, value: any) => {
    const newCustomizations = [...(editedItem.customizations || [])];
    newCustomizations[custIndex] = { ...newCustomizations[custIndex], [field]: value };
    handleFieldChange('customizations', newCustomizations);
  };

  const handleOptionChange = (custIndex: number, optIndex: number, field: keyof CustomizationOption, value: any) => {
    const newCustomizations = [...(editedItem.customizations || [])];
    const newOptions = [...(newCustomizations[custIndex].options || [])];
    newOptions[optIndex] = { ...newOptions[optIndex], [field]: value };
    newCustomizations[custIndex].options = newOptions;
    handleFieldChange('customizations', newCustomizations);
  };

  const addCustomization = () => {
    const newCustomization: Customization = { title: 'New Customization', type: 'radio', options: [{ label: 'Option 1', price_modifier: 0 }] };
    handleFieldChange('customizations', [...(editedItem.customizations || []), newCustomization]);
  };
  
  const removeCustomization = (custIndex: number) => {
    const newCustomizations = [...(editedItem.customizations || [])];
    newCustomizations.splice(custIndex, 1);
    handleFieldChange('customizations', newCustomizations);
  };
  
  const addOption = (custIndex: number) => {
    const newCustomizations = [...(editedItem.customizations || [])];
    const newOptions = [...(newCustomizations[custIndex].options || []), { label: 'New Option', price_modifier: 0 }];
    newCustomizations[custIndex].options = newOptions;
    handleFieldChange('customizations', newCustomizations);
  };

  const removeOption = (custIndex: number, optIndex: number) => {
     const newCustomizations = [...(editedItem.customizations || [])];
     const newOptions = [...(newCustomizations[custIndex].options || [])];
     newOptions.splice(optIndex, 1);
     newCustomizations[custIndex].options = newOptions;
     handleFieldChange('customizations', newCustomizations);
  }

  const handleSave = () => {
    onSave(editedItem);
  };

  const handleDelete = () => {
      if(editedItem.id) {
          onDelete(editedItem.id);
      }
  }
  
  const isNew = 'isNew' in item && item.isNew;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">{isNew ? 'Add New Item' : 'Edit Menu Item'}</DialogTitle>
          <DialogDescription>
            {isNew ? 'Fill in the details for your new menu item.' : "Make changes to your menu item here. Click save when you're done."}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] pr-4">
        <fieldset disabled={isPending} className="space-y-6 py-4 group">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="name">Item Name</Label>
                <Input id="name" value={editedItem.name || ''} onChange={(e) => handleFieldChange('name', e.target.value)} />
            </div>
             <div className="space-y-2">
              <Label htmlFor="price">Base Price (₹)</Label>
              <Input id="price" type="number" value={editedItem.price || 0} onChange={(e) => handleFieldChange('price', Number(e.target.value))} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Combobox 
                options={allCategories.map(c => ({ label: c, value: c }))}
                value={editedItem.category || ''}
                onChange={(value) => handleFieldChange('category', value)}
                placeholder="Select or create a category..."
                emptyMessage="No categories found."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={editedItem.description || ''}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              rows={3}
            />
          </div>
          
          <Separator />

          <div>
             <h3 className="text-lg font-semibold font-headline mb-4">Customizations</h3>
             <div className="space-y-4">
                {(editedItem.customizations || []).map((cust, custIndex) => (
                    <div key={custIndex} className="space-y-4 rounded-md border p-4">
                        <div className="flex items-center justify-between">
                            <h4 className="font-semibold">Customization Group</h4>
                             <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeCustomization(custIndex)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Title</Label>
                                <Input value={cust.title} onChange={(e) => handleCustomizationChange(custIndex, 'title', e.target.value)} placeholder="e.g. Spice Level" />
                            </div>
                            <div className="space-y-2">
                                <Label>Selection Type</Label>
                                <Select value={cust.type} onValueChange={(value) => handleCustomizationChange(custIndex, 'type', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="radio">Single Choice (Radio)</SelectItem>
                                        <SelectItem value="checkbox">Multiple Choice (Checkbox)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <Label>Options</Label>
                            {(cust.options || []).map((opt, optIndex) => (
                                <div key={optIndex} className="flex items-center gap-2">
                                    <Input value={opt.label} onChange={(e) => handleOptionChange(custIndex, optIndex, 'label', e.target.value)} placeholder="Option name"/>
                                    <Input type="number" value={opt.price_modifier} onChange={(e) => handleOptionChange(custIndex, optIndex, 'price_modifier', Number(e.target.value))} className="w-24" placeholder="Price"/>
                                    <Button variant="ghost" size="icon" onClick={() => removeOption(custIndex, optIndex)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            ))}
                            <Button variant="outline" size="sm" onClick={() => addOption(custIndex)}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add Option
                            </Button>
                        </div>
                    </div>
                ))}
                <Button variant="outline" className="w-full" onClick={addCustomization}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Customization Group
                </Button>
             </div>
          </div>
        </fieldset>
        </ScrollArea>
        <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-between">
          {!isNew ? (
             <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button type="button" variant="destructive" disabled={isPending}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Item
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the menu item
                            from your records.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
          ) : <div></div>}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isPending}>Cancel</Button>
            </DialogClose>
            <Button type="submit" onClick={handleSave} disabled={isPending}>
                {isPending ? 'Saving...' : 'Save changes'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
