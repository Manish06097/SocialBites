
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
        className="sm:max-w-md p-0 flex flex-col h-full max-h-[90vh]"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-start gap-4">
             <Image 
                src={item.imageUrl} 
                alt={item.name} 
                width={80} 
                height={80} 
                className="rounded-lg object-cover aspect-square bg-muted" 
                data-ai-hint="food item" 
              />
            <div className="flex-grow">
                <DialogTitle className="font-headline text-2xl leading-tight">{item.name}</DialogTitle>
                <p className="text-muted-foreground text-sm mt-1">{item.description}</p>
            </div>
          </div>
        </DialogHeader>
        <ScrollArea className="flex-grow">
          <div className="space-y-4 px-6 pb-6">
            
            {item.customizations && item.customizations.length > 0 && (
              <>
                <Separator />
                {item.customizations.map((custom, index) => (
                  <div key={index} className="space-y-3">
                    <Label className="font-semibold text-base">{custom.title}</Label>
                    {custom.type === 'radio' && custom.options && (
                      <RadioGroup onValueChange={(value) => handleRadioChange(custom.title, value)} className="space-y-2">
                        {custom.options.map((opt, i) => (
                          <Label htmlFor={`${custom.title}-${i}`} key={i} className="flex items-center gap-3 p-3 rounded-md border has-[:checked]:border-primary has-[:checked]:bg-primary/5 cursor-pointer">
                            <RadioGroupItem value={opt.label} id={`${custom.title}-${i}`} />
                            <span>{opt.label} {opt.price_modifier > 0 && `(+₹${opt.price_modifier})`}</span>
                          </Label>
                        ))}
                      </RadioGroup>
                    )}
                    {custom.type === 'checkbox' && custom.options && (
                       <div className="space-y-2">
                        {custom.options.map((opt, i) => (
                           <Label htmlFor={`${custom.title}-${i}`} key={i} className="flex items-center gap-3 p-3 rounded-md border has-[:checked]:border-primary has-[:checked]:bg-primary/5 cursor-pointer">
                             <Checkbox id={`${custom.title}-${i}`} onCheckedChange={(checked) => handleCheckboxChange(custom.title, opt.label, !!checked)} />
                             <span>{opt.label} {opt.price_modifier > 0 && `(+₹${opt.price_modifier})`}</span>
                           </Label>
                         ))}
                       </div>
                    )}
                  </div>
                ))}
                <Separator />
              </>
            )}
            
            <div className="space-y-2">
              <Label className="font-semibold text-base">Special Instructions</Label>
              <Textarea placeholder="e.g. extra spicy, no onions..." value={specialInstructions} onChange={(e) => setSpecialInstructions(e.target.value)} />
            </div>

          </div>
        </ScrollArea>
        <DialogFooter className="p-4 border-t bg-background mt-auto">
          <div className="flex items-center justify-between w-full gap-4">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" className="h-10 w-10" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</Button>
                <span className="font-bold text-lg w-8 text-center">{quantity}</span>
                <Button variant="outline" size="icon" className="h-10 w-10" onClick={() => setQuantity(quantity + 1)}>+</Button>
              </div>
              <Button type="submit" size="lg" className="w-full font-bold" onClick={handleAddToCart}>
                Add to cart
              </Button>
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
