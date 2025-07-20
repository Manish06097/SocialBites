
'use client';

import { useState, useEffect } from 'react';
import type { MenuItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface EditMenuItemDialogProps {
  item: MenuItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedItem: MenuItem) => void;
}

export function EditMenuItemDialog({ item, open, onOpenChange, onSave }: EditMenuItemDialogProps) {
  const [name, setName] = useState(item.name);
  const [price, setPrice] = useState(item.price);
  const [description, setDescription] = useState(item.description);

  // When a new item is passed in, update the form state
  useEffect(() => {
    setName(item.name);
    setPrice(item.price);
    setDescription(item.description);
  }, [item]);

  const handleSave = () => {
    const updatedItem = {
      ...item,
      name,
      price: Number(price),
      description,
    };
    onSave(updatedItem);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">Edit Menu Item</DialogTitle>
          <DialogDescription>
            Make changes to your menu item here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="text-right">
              Price (₹)
            </Label>
            <Input id="price" type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="description" className="text-right mt-2">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" onClick={handleSave}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
