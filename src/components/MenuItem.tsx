import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PlusCircle, Minus, Plus, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/context/CartContext';
import { MenuItemType as BaseMenuItemType } from '@/utils/menuData';
import SizeSelector from '@/components/SizeSelector';

// Extended type to include properties from inventory data
interface MenuItemType extends BaseMenuItemType {
  quantity?: number;
  image_url?: string;
  item_name?: string;
  inventory_id?: string; // Add inventory_id reference
}

// Define which items should have size options
const itemsWithSizes = [
  'cappuccino', 'latte', 'americano', 'espresso', 'mocha',
  'macchiato', 'tea', 'coffee', 'cold brew', 'iced'
];

// Calculate if an item should have size options
const shouldHaveSizes = (item: MenuItemType): boolean => {
  const itemName = item.item_name || item.name || '';
  return itemsWithSizes.some(keyword => 
    itemName.toLowerCase().includes(keyword) || 
    (item.id && item.id.toLowerCase().includes(keyword))
  );
};

// Use a more robust method to check availability
const isItemAvailable = (item: MenuItemType): boolean => {
  // Check inventory-based availability first
  if (typeof item.quantity === 'number') {
    return item.quantity > 0;
  }
  
  // Then check is_available flag (can be set by either system)
  if (typeof item.is_available === 'boolean') {
    return item.is_available;
  }
  
  // Finally check unavailable flag (can be set by either system)
  if (typeof item.unavailable === 'boolean') {
    return !item.unavailable;
  }
  
  // Default to available if no availability info exists
  return true;
};

type MenuItemProps = {
  item: MenuItemType;
};

const MenuItem: React.FC<MenuItemProps> = ({ item }) => {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [selectedSize, setSelectedSize] = useState<'small' | 'medium' | 'large'>('medium');
  
  // Determine if this item should have size options
  const hasSizes = shouldHaveSizes(item);
  
  // Use our more robust availability checking function
  const isAvailable = isItemAvailable(item);
  
  // Calculate size-based pricing
  const sizePricing = {
    small: item.price ? Math.round(item.price * 0.85) : 0, // 15% less than base price
    medium: item.price || 0, // Base price is medium
    large: item.price ? Math.round(item.price * 1.2) : 0 // 20% more than base price
  };
  
  // Get current price based on selected size
  const currentPrice = hasSizes 
    ? (sizePricing[selectedSize] || 0) 
    : (typeof item.price === 'number' && !isNaN(item.price) ? item.price : 0);
  
  const increaseQuantity = () => {
    if (quantity < 10) {
      setQuantity(quantity + 1);
    }
  };
  
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  
  const handleAddToCart = () => {
    // Create a compatible item object that matches what CartContext expects
    const itemToAdd = {
      ...item,  // Preserve all original properties
      id: item.id,
      name: item.item_name || item.name || '',
      price: currentPrice,
      category: item.category || '',
    };
    
    // Map the UI size options to the expected cart sizes
    // Use type assertion to ensure correct type
    const cartSize = hasSizes ? 
      (selectedSize === 'small' ? 'S' : 
       selectedSize === 'medium' ? 'R' : 
       selectedSize === 'large' ? 'L' : undefined) as 'S' | 'R' | 'L' | undefined
      : undefined;
    
    // Pass the quantity separately as expected by CartContext
    addItem(itemToAdd, cartSize, quantity);
    
    // Show added animation
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
    
    // Update toast message to fix the "+2" issue - use template literals correctly
    toast.success(`Added ${quantity} ${item.item_name || item.name || ''} to cart`, {
      description: hasSizes ? `Size: ${selectedSize.charAt(0).toUpperCase()}` : ''
    });
    
    // Reset quantity after adding
    setQuantity(1);
  };

  // Fix the plus button click handler to add to cart directly when quantity is 1
  const handlePlusClick = () => {
    if (quantity === 1) {
      // When quantity is 1 and user clicks +, add directly to cart instead of increasing quantity
      handleAddToCart();
    } else {
      // Otherwise behave as normal increaser
      increaseQuantity();
    }
  };

  return (
    <div className={`relative bg-white rounded-xl overflow-hidden shadow-md border border-amber-100 ${!isAvailable ? 'opacity-70' : ''}`}>
      {!isAvailable && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] flex items-center justify-center z-10">
          <Badge variant="destructive" className="px-3 py-1 text-sm font-medium">
            Currently Unavailable
          </Badge>
        </div>
      )}
      
      <div className="flex p-3">
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-cafe-dark">{item.item_name || item.name}</h3>
              
              {item.description && (
                <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{item.description}</p>
              )}
            </div>
            
            {item.veg && (
              <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200 ml-2">
                Veg
              </Badge>
            )}
          </div>
          
          <div className="mt-3 flex items-end justify-between">
            <div>
              <div className="text-lg font-bold text-cafe">
                ₹{currentPrice.toFixed(0)}
              </div>
              
              {/* Size selector for applicable items */}
              {hasSizes && (
                <div className="mt-2">
                  <SizeSelector
                    selectedSize={selectedSize}
                    onSelectSize={setSelectedSize}
                    sizes={sizePricing}
                  />
                </div>
              )}
            </div>
            
            {isAvailable && (
              <div className="flex items-center">
                {added ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1, rotate: [0, 10, 0] }}
                    className="p-1 rounded-full bg-green-50 text-green-600"
                  >
                    <Check size={18} />
                  </motion.div>
                ) : quantity > 1 ? (
                  <div className="flex items-center space-x-1">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={decreaseQuantity}
                      className="w-6 h-6 rounded-full bg-cafe/10 flex items-center justify-center text-cafe hover:bg-cafe/20"
                    >
                      <Minus size={14} />
                    </motion.button>
                    
                    <span className="w-5 text-center text-cafe-dark font-medium">
                      {quantity}
                    </span>
                    
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={handlePlusClick}
                      className="w-6 h-6 rounded-full bg-cafe/10 flex items-center justify-center text-cafe hover:bg-cafe/20"
                    >
                      <Plus size={14} />
                    </motion.button>
                    
                    <motion.button
                      className="ml-1 p-1.5 rounded-full bg-cafe text-white shadow-sm hover:bg-cafe-dark"
                      whileTap={{ scale: 0.9 }}
                      onClick={handleAddToCart}
                    >
                      <PlusCircle size={18} />
                    </motion.button>
                  </div>
                ) : (
                  <motion.button
                    className="p-1.5 rounded-full bg-cafe text-white shadow-sm hover:bg-cafe-dark"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handlePlusClick}
                  >
                    <PlusCircle size={18} />
                  </motion.button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {item.recommended && (
        <div className="absolute top-0 right-0">
          <div className="bg-amber-500 text-white text-xs font-medium px-2 py-0.5 shadow-sm">
            Popular
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuItem;