
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useCart } from '@/context/CartProvider';
import type { MenuItem, Stall, Customization, CustomizationOption } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';

interface MenuItemDialogProps {
  item: MenuItem;
  stall: Pick<Stall, 'id' | 'name' | 'food_court_id'>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MenuItemDialog({ item, stall, open, onOpenChange }: MenuItemDialogProps) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [customizationChoices, setCustomizationChoices] = useState<{ [title: string]: string | string[] }>({});
  const [specialInstructions, setSpecialInstructions] = useState('');

  const handleAddToCart = () => {
    addToCart(item, stall, quantity, customizationChoices, specialInstructions);
    onOpenChange(false);
    // Reset state for next time
    setQuantity(1);
    setCustomizationChoices({});
    setSpecialInstructions('');
  };
  
  const handleRadioChange = (title: string, value: string) => {
    setCustomizationChoices(prev => ({ ...prev, [title]: value }));
  };
  
  const handleCheckboxChange = (title: string, label: string, checked: boolean) => {
    setCustomizationChoices(prev => {
      const existing = (prev[title] as string[] || []);
      if (checked) {
        return { ...prev, [title]: [...existing, label] };
      } else {
        return { ...prev, [title]: existing.filter(l => l !== label) };
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-md p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="font-headline text-2xl">{item.name}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh]">
          <div className="space-y-4 px-6 pb-6">
            <Image src={item.imageUrl} alt={item.name} width={400} height={200} className="rounded-lg object-cover" data-ai-hint="food item" />
            <p className="text-muted-foreground">{item.description}</p>
            
            {item.customizations && item.customizations.length > 0 && (
              <>
                {item.customizations.map((custom, index) => (
                  <div key={index} className="space-y-2">
                    <Label className="font-semibold">{custom.title}</Label>
                    {custom.type === 'radio' && custom.options && (
                      <RadioGroup onValueChange={(value) => handleRadioChange(custom.title, value)}>
                        {custom.options.map((opt, i) => (
                          <div key={i} className="flex items-center space-x-2">
                            <RadioGroupItem value={opt.label} id={`${custom.title}-${i}`} />
                            <Label htmlFor={`${custom.title}-${i}`}>{opt.label} {opt.price_modifier > 0 && `(+₹${opt.price_modifier})`}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    )}
                    {custom.type === 'checkbox' && custom.options && (
                       <div>
                        {custom.options.map((opt, i) => (
                           <div key={i} className="flex items-center space-x-2 my-2">
                             <Checkbox id={`${custom.title}-${i}`} onCheckedChange={(checked) => handleCheckboxChange(custom.title, opt.label, !!checked)} />
                             <Label htmlFor={`${custom.title}-${i}`}>{opt.label} {opt.price_modifier > 0 && `(+₹${opt.price_modifier})`}</Label>
                           </div>
                         ))}
                       </div>
                    )}
                  </div>
                ))}
                <Separator />
              </>
            )}
            
            <div className="space-y-2">
              <Label className="font-semibold">Special Instructions</Label>
              <Textarea placeholder="e.g. extra spicy, no onions..." value={specialInstructions} onChange={(e) => setSpecialInstructions(e.target.value)} />
            </div>

            <div className="flex items-center justify-between">
              <Label className="font-semibold">Quantity</Label>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</Button>
                <Input type="number" value={quantity} readOnly className="h-8 w-12 text-center" />
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setQuantity(quantity + 1)}>+</Button>
              </div>
            </div>
          </div>
        </ScrollArea>
        <DialogFooter className="p-6 pt-0 border-t">
          <Button type="submit" size="lg" className="w-full font-bold mt-6" onClick={handleAddToCart}>
            Add {quantity} to cart
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
