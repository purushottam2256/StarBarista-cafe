import React, { createContext, useContext, useState, useEffect } from 'react';
import { MenuItemType } from '@/utils/menuData';
import { toast } from 'sonner';

export type CartItem = {
  id: string;
  name: string;
  price: number;
  category: string;
  quantity: number;
  size?: 'S' | 'R' | 'L';
  options?: Record<string, any>;
};
type CartContextType = {
  items: CartItem[];
  addItem: (item: MenuItemType, size?: 'S' | 'R' | 'L', quantity?: number, options?: Record<string, any>) => void;
  removeItem: (id: string, size?: 'S' | 'R' | 'L') => void;
  updateItemQuantity: (id: string, quantity: number, size?: 'S' | 'R' | 'L') => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  total: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  // Fix the addItem implementation to properly handle cart items
  const addItem = (item: MenuItemType, size?: 'S' | 'R' | 'L', quantity: number = 1, options?: Record<string, any>) => {
    // Validate inputs to prevent invalid data
    if (!item || !item.id) {
      console.error("Cannot add invalid item to cart:", item);
      return;
    }
    
    // Ensure quantity is a valid number
    const validQuantity = typeof quantity === 'number' && !isNaN(quantity) && quantity > 0 ? quantity : 1;
    
    // Generate a consistent ID for the cart item, including size if present
    const itemId = size ? `${item.id}-${size}` : item.id;
    
    // Create a normalized cart item to ensure all required properties are present
    const newItem: CartItem = {
      id: itemId,
      name: typeof item.name === 'string' ? item.name : 'Unknown Item',
      price: typeof item.price === 'number' && !isNaN(item.price) ? item.price : 0,
      category: typeof item.category === 'string' ? item.category : 'uncategorized',
      quantity: validQuantity,
      size: size,
      options: options
    };
    
    console.log("Adding item to cart:", newItem);
    
    setItems(currentItems => {
      // Check if item already exists in cart with the same size and options
      const existingItemIndex = currentItems.findIndex(
        cartItem => 
          cartItem.id === itemId && 
          JSON.stringify(cartItem.options) === JSON.stringify(options)
      );
      
      if (existingItemIndex > -1) {
        // Increase quantity of existing item
        const updatedItems = [...currentItems];
        updatedItems[existingItemIndex].quantity += validQuantity;
        toast.success(`Updated quantity of ${newItem.name}`);
        return updatedItems;
      } else {
        // Add new item
        toast.success(`Added ${newItem.name} to cart`);
        return [...currentItems, newItem];
      }
    });
  };

  const removeItem = (id: string, size?: 'S' | 'R' | 'L') => {
    setItems(items.filter(item => item.id !== id));
    toast.info("Item removed from cart");
  };

  const updateItemQuantity = (id: string, quantity: number, size?: 'S' | 'R' | 'L') => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    
    setItems(items.map(item => 
      item.id === id ? { ...item, quantity } : item
    ));
  };

  const clearCart = () => {
    setItems([]);
    toast.info("Cart cleared");
  };

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = subtotal; // No tax calculation for now
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  // Load cart from localStorage on component mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Failed to parse cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  return (
    <CartContext.Provider value={{
      items,
      addItem,
      removeItem,
      updateItemQuantity,
      clearCart,
      totalItems,
      subtotal,
      total
    }}>
      {children}
    </CartContext.Provider>
  );
};

export default useCart;
