"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import type { CartItem, MenuItem, Stall } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { useFoodCourt } from './FoodCourtProvider';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"


interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: MenuItem, stall: Pick<Stall, 'id' | 'name' | 'food_court_id'>, quantity: number, customizationChoices?: { [title: string]: string | string[] }, specialInstructions?: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { toast } = useToast();
  const { selectedFoodCourt } = useFoodCourt();
  const [showClearCartDialog, setShowClearCartDialog] = useState(false);
  const [pendingCartItem, setPendingCartItem] = useState<{ item: MenuItem; stall: Pick<Stall, 'id' | 'name' | 'food_court_id'>; quantity: number; customizationChoices?: { [title: string]: string | string[] }, specialInstructions?: string; } | null>(null);


  const calculateTotalPrice = useCallback((menuItem: MenuItem, quantity: number, customizationChoices?: { [title: string]: string | string[] }) => {
    let total = menuItem.price;
    if (customizationChoices && menuItem.customizations) {
      menuItem.customizations.forEach(customization => {
        const choice = customizationChoices[customization.title];
        if (choice && customization.options) {
          if (Array.isArray(choice)) { // Checkbox
            choice.forEach(c => {
              const option = customization.options?.find(opt => opt.label === c);
              if (option) total += option.price_modifier;
            });
          } else { // Radio
            const option = customization.options?.find(opt => opt.label === choice);
            if (option) total += option.price_modifier;
          }
        }
      });
    }
    return total * quantity;
  }, []);

  const generateCartItemId = (menuItemId: string, customizationChoices?: { [title: string]: string | string[] }, specialInstructions?: string) => {
    const customizationsString = customizationChoices 
      ? Object.entries(customizationChoices).map(([key, value]) => `${key}:${Array.isArray(value) ? value.join(',') : value}`).sort().join(';')
      : '';
    return `${menuItemId}-${customizationsString}-${specialInstructions || ''}`;
  };

  const performAddToCart = (menuItem: MenuItem, stall: Pick<Stall, 'id' | 'name' | 'food_court_id'>, quantity: number, customizationChoices?: { [title: string]: string | string[] }, specialInstructions?: string) => {
     setCartItems(prevItems => {
      const cartItemId = generateCartItemId(menuItem.id, customizationChoices, specialInstructions);
      const existingItem = prevItems.find(item => item.id === cartItemId);
      
      const totalPrice = calculateTotalPrice(menuItem, quantity, customizationChoices);

      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        const newTotalPrice = calculateTotalPrice(menuItem, newQuantity, customizationChoices);
        return prevItems.map(item =>
          item.id === cartItemId ? { ...item, quantity: newQuantity, totalPrice: newTotalPrice } : item
        );
      } else {
        const newCartItem: CartItem = {
          id: cartItemId,
          menuItem,
          stall,
          quantity,
          customizationChoices,
          specialInstructions,
          totalPrice,
        };
        return [...prevItems, newCartItem];
      }
    });

    toast({
      title: "Added to Cart! 🛒",
      description: `${quantity} x ${menuItem.name} is now in your food fest.`,
    });
  }

  const addToCart = (menuItem: MenuItem, stall: Pick<Stall, 'id' | 'name' | 'food_court_id'>, quantity: number, customizationChoices?: { [title: string]: string | string[] }, specialInstructions?: string) => {
    if (cartItems.length > 0 && cartItems[0].stall.food_court_id !== stall.food_court_id) {
        setPendingCartItem({ item: menuItem, stall, quantity, customizationChoices, specialInstructions });
        setShowClearCartDialog(true);
    } else {
        performAddToCart(menuItem, stall, quantity, customizationChoices, specialInstructions);
    }
  };

  const handleConfirmClearCart = () => {
    clearCart();
    if (pendingCartItem) {
        performAddToCart(pendingCartItem.item, pendingCartItem.stall, pendingCartItem.quantity, pendingCartItem.customizationChoices, pendingCartItem.specialInstructions);
    }
    setShowClearCartDialog(false);
    setPendingCartItem(null);
  };

  const handleCancelClearCart = () => {
    setShowClearCartDialog(false);
    setPendingCartItem(null);
  }

  const updateQuantity = (cartItemId: string, quantity: number) => {
    setCartItems(prevItems =>
      prevItems.map(item => {
        if (item.id === cartItemId) {
          if (quantity <= 0) {
            return null; // Will be filtered out
          }
          const newTotalPrice = calculateTotalPrice(item.menuItem, quantity, item.customizationChoices);
          return { ...item, quantity, totalPrice: newTotalPrice };
        }
        return item;
      }).filter(Boolean) as CartItem[]
    );
  };
  
  const removeFromCart = (cartItemId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== cartItemId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);
  const cartTotal = cartItems.reduce((total, item) => total + item.totalPrice, 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, updateQuantity, removeFromCart, clearCart, cartCount, cartTotal }}>
      {children}
      <AlertDialog open={showClearCartDialog} onOpenChange={setShowClearCartDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Start a New Order?</AlertDialogTitle>
            <AlertDialogDescription>
              You have items from a different food court in your cart. You can only order from one food court at a time.
              Do you want to clear your current cart and start a new order?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelClearCart}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmClearCart}>Clear Cart & Add</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
