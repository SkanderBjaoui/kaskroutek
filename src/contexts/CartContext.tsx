'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { Cart, CartItem, Bread, Topping } from '@/types';

interface CartContextType {
  cart: Cart;
  addToCart: (bread: Bread, toppings: Topping[]) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart>({
    items: [],
    totalPrice: 0,
  });

  const addToCart = (bread: Bread, toppings: Topping[]) => {
    const itemPrice = bread.price + toppings.reduce((sum, topping) => sum + topping.price, 0);
    
    setCart(prevCart => {
      // Check if identical item already exists
      const existingItemIndex = prevCart.items.findIndex(item => 
        item.bread.id === bread.id && 
        item.toppings.length === toppings.length &&
        item.toppings.every((topping, index) => topping.id === toppings[index].id)
      );

      if (existingItemIndex !== -1) {
        // Update quantity of existing item
        const updatedItems = [...prevCart.items];
        updatedItems[existingItemIndex].quantity += 1;
        updatedItems[existingItemIndex].totalPrice = updatedItems[existingItemIndex].quantity * itemPrice;
        
        const newTotalPrice = updatedItems.reduce((sum, item) => sum + item.totalPrice, 0);
        return {
          items: updatedItems,
          totalPrice: newTotalPrice,
        };
      } else {
        // Add new item
        const newItem: CartItem = {
          id: Date.now().toString(),
          bread,
          toppings,
          quantity: 1,
          totalPrice: itemPrice,
        };

        const newItems = [...prevCart.items, newItem];
        const newTotalPrice = newItems.reduce((sum, item) => sum + item.totalPrice, 0);
        
        return {
          items: newItems,
          totalPrice: newTotalPrice,
        };
      }
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prevCart => {
      const newItems = prevCart.items.filter(item => item.id !== itemId);
      const newTotalPrice = newItems.reduce((sum, item) => sum + item.totalPrice, 0);
      
      return {
        items: newItems,
        totalPrice: newTotalPrice,
      };
    });
  };

  const clearCart = () => {
    setCart({
      items: [],
      totalPrice: 0,
    });
  };

  const getTotalPrice = () => {
    return cart.items.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setCart(prevCart => {
      const updatedItems = prevCart.items.map(item => {
        if (item.id === itemId) {
          const itemPrice = item.bread.price + item.toppings.reduce((sum, topping) => sum + topping.price, 0);
          return {
            ...item,
            quantity,
            totalPrice: quantity * itemPrice,
          };
        }
        return item;
      });

      const newTotalPrice = updatedItems.reduce((sum, item) => sum + item.totalPrice, 0);
      
      return {
        items: updatedItems,
        totalPrice: newTotalPrice,
      };
    });
  };

  const getItemCount = () => {
    return cart.items.reduce((sum, item) => sum + item.quantity, 0);
  };

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getItemCount,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
