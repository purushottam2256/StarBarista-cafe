import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ImageOff } from 'lucide-react';
import { MenuItemType } from '@/utils/menuData';
import { useCart } from '@/context/CartContext';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

// Extended menu item type to include inventory properties
interface EnhancedMenuItem extends MenuItemType {
  quantity?: number;
  unavailable?: boolean;
  is_available?: boolean;
}

type RecommendedItemsProps = {
  items: EnhancedMenuItem[];
  title?: string;
};

// Define the defaultImages array with paths to the food images
const defaultImages = [
  '/food-images/BROWNIE WALNUT CAKE.jpg',
  '/food-images/CHICKEN LEG PIECE.jpg',
  '/food-images/CHICKEN TIKKA PIZZA.jpg',
  '/food-images/DEATH BY CHOCOLATE PST.jpg',
  '/food-images/SMOKE CHICKEN SANDWICH.jpg',
  '/food-images/TANDOORI BURGER.jpg',
  '/food-images/BLUE BERRY CHEESE CAKE.jpg',
  '/food-images/LEMON ICE TEA.jpg',
  '/food-images/MASALA TEA.jpg',
  '/food-images/LATTEE.jpg',
  '/food-images/GREEN APPLE MAJITO.jpg',
  '/food-images/BROWNIE FRAPPE.jpg',
  '/food-images/ICED CAFE MOCHA.jpg',
  '/food-images/TRIPLE BERRY.jpg'
];

// Enhanced map with normalized keys and alternative spellings
const itemImageMap: Record<string, string> = {
  // Original mappings
  'BROWNIE WALNUT CAKE': '/food-images/BROWNIE WALNUT CAKE.jpg',
  'CHICKEN LEG PIECE': '/food-images/CHICKEN LEG PIECE.jpg',
  'CHICKEN TIKKA SANDWICH': '/food-images/CHICKEN TIKKA SANDWITCH.jpg',
  'CHICKEN TIKKA SANDWITCH': '/food-images/CHICKEN TIKKA SANDWITCH.jpg',
  'CHICKEN TIKKA PIZZA': '/food-images/CHICKEN TIKKA PIZZA.jpg',
  'DEATH BY CHOCOLATE PASTRY': '/food-images/DEATH BY CHOCOLATE PST.jpg',
  'DEATH BY CHOCOLATE PST': '/food-images/DEATH BY CHOCOLATE PST.jpg',
  'SMOKE CHICKEN SANDWICH': '/food-images/SMOKE CHICKEN SANDWICH.jpg',
  'TANDOORI BURGER': '/food-images/TANDOORI BURGER.jpg',
  'BLUE BERRY CHEESE CAKE': '/food-images/BLUE BERRY CHEESE CAKE.jpg',
  'LEMON ICE TEA': '/food-images/LEMON ICE TEA.jpg',
  'MASALA TEA': '/food-images/MASALA TEA.jpg',
  'LATTEE': '/food-images/LATTEE.jpg',
  'LATTE': '/food-images/LATTEE.jpg',
  'GREEN APPLE MAJITO': '/food-images/GREEN APPLE MAJITO.jpg',
  'GREEN APPLE MOJITO': '/food-images/GREEN APPLE MAJITO.jpg',
  'BROWNIE FRAPPE': '/food-images/BROWNIE FRAPPE.jpg',
  'ICED CAFÉ MOCHA': '/food-images/ICED CAFE MOCHA.jpg',
  'ICED CAFE MOCHA': '/food-images/ICED CAFE MOCHA.jpg',
  'TRIPLE BERRY': '/food-images/TRIPLE BERRY.jpg',
  
  // Additional common variations
  'CHICKEN SANDWICH': '/food-images/SMOKE CHICKEN SANDWICH.jpg',
  'CHOCOLATE PASTRY': '/food-images/DEATH BY CHOCOLATE PST.jpg',
  'BLUEBERRY CHEESECAKE': '/food-images/BLUE BERRY CHEESE CAKE.jpg',
  'WALNUT BROWNIE': '/food-images/BROWNIE WALNUT CAKE.jpg'
};

// Create a normalized version of the image map for case-insensitive matching
const normalizedImageMap: Record<string, string> = {};
Object.entries(itemImageMap).forEach(([key, value]) => {
  normalizedImageMap[key.toLowerCase().trim()] = value;
});

const RecommendedItems: React.FC<RecommendedItemsProps> = ({ 
  items, 
  title = "Recommended For You" 
}) => {
  const { addItem } = useCart();
  const [loadingItems, setLoadingItems] = useState<Record<string, boolean>>({});
  
  if (!items || !items.length) return null;

  // Safely format price with proper handling
  const formatPrice = (price: number | string | undefined): string => {
    if (price === undefined || price === null) return '0.00';
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    return isNaN(numericPrice) ? '0.00' : numericPrice.toFixed(2);
  };

  // Check if an item is available
  const isItemAvailable = (item: EnhancedMenuItem): boolean => {
    return !(
      item.unavailable === true || 
      item.is_available === false || 
      (typeof item.quantity === 'number' && item.quantity <= 0)
    );
  };

  // Handle adding item to cart with loading state
  const handleAddItem = (item: EnhancedMenuItem) => {
    // Check if item is available
    if (!isItemAvailable(item)) {
      return;
    }
    
    setLoadingItems(prev => ({ ...prev, [item.id]: true }));
    
    // Ensure price is always a number
    const price = typeof item.price === 'string' ? parseFloat(item.price) || 0 : item.price || 0;
    
    // Create a compatible item object that matches CartContext expectations
    const itemToAdd = {
      ...item,
      id: item.id,
      name: item.name || '',
      price: price,
      category: item.category || ''
    };
    
    // Use the CartContext's expected parameter order
    addItem(itemToAdd, undefined, 1);
    
    // Show success toast
    toast.success(`Added ${item.name || 'Item'} to cart`);
    
    // Reset loading state after a small delay to show feedback
    setTimeout(() => {
      setLoadingItems(prev => ({ ...prev, [item.id]: false }));
    }, 300);
  };

  // Improved getImageSrc function with better matching
  const getImageSrc = (item: EnhancedMenuItem, index: number): string => {
    // First, use the item's explicit image if available
    if (item.image) return item.image;
    
    if (item.name) {
      // Try exact match in original case
      if (itemImageMap[item.name]) {
        return itemImageMap[item.name];
      }
      
      // Try normalized match (lowercase, trimmed)
      const normalizedName = item.name.toLowerCase().trim();
      if (normalizedImageMap[normalizedName]) {
        return normalizedImageMap[normalizedName];
      }
      
      // Try partial match (check if any key contains this item name or vice versa)
      const itemNameWords = normalizedName.split(' ').filter(word => word.length > 3);
      for (const word of itemNameWords) {
        for (const [key, path] of Object.entries(normalizedImageMap)) {
          if (key.includes(word) || word.includes(key)) {
            console.log(`Found partial match for "${item.name}" using "${key}"`);
            return path;
          }
        }
      }
    }
    
    // If category-based mapping exists, match by category
    const categoryMap: Record<string, string> = {
      'coffee': '/food-images/LATTEE.jpg',
      'tea': '/food-images/MASALA TEA.jpg',
      'sandwich': '/food-images/SMOKE CHICKEN SANDWICH.jpg',
      'burger': '/food-images/TANDOORI BURGER.jpg',
      'pizza': '/food-images/CHICKEN TIKKA PIZZA.jpg',
      'cake': '/food-images/BLUE BERRY CHEESE CAKE.jpg',
      'dessert': '/food-images/DEATH BY CHOCOLATE PST.jpg',
      'cold': '/food-images/ICED CAFE MOCHA.jpg',
      'beverage': '/food-images/GREEN APPLE MAJITO.jpg'
    };
    
    if (item.category) {
      const lowerCategory = item.category.toLowerCase();
      for (const [catKey, catPath] of Object.entries(categoryMap)) {
        if (lowerCategory.includes(catKey)) {
          return catPath;
        }
      }
    }
    
    // If no matches, use a default image based on index
    return defaultImages[index % defaultImages.length] || '/placeholder.svg';
  };

  return (
    <div className="mb-6">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles size={18} className="text-cafe-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-cafe-text">{title}</h2>
      </div>
      
      <div className="hide-scrollbar flex overflow-x-auto pb-2 -mx-4 px-4">
        {items.map((item, index) => {
          const available = isItemAvailable(item);
          const imageSrc = getImageSrc(item, index);
          
          return (
            <motion.div
              key={item.id}
              className="menu-card mr-3 flex min-w-[200px] flex-col relative"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: Math.min(index * 0.1, 0.5), duration: 0.3 }}
              whileHover={{ y: -5 }}
            >
              {!available && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] flex items-center justify-center z-10 rounded-xl">
                  <Badge variant="destructive" className="px-3 py-1 text-sm font-medium">
                    Currently Unavailable
                  </Badge>
                </div>
              )}
              
              <div className="h-40 w-full overflow-hidden rounded-t-xl">
                <motion.img 
                  src={imageSrc}
                  alt={item.name}
                  className="h-full w-full object-cover transition-all hover:scale-105"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/placeholder.svg';
                  }}
                />
              </div>
              
              <div className="p-3 bg-white rounded-b-xl shadow-md border border-amber-100 border-t-0">
                <h3 className="text-sm font-semibold text-cafe-dark truncate" title={item.name}>
                  {item.name}
                </h3>
                
                {item.description && (
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                )}
                
                <div className="mt-2 flex items-end justify-between">
                  <span className="text-cafe text-base font-bold">₹{formatPrice(item.price)}</span>
                  <motion.button
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      available 
                        ? 'bg-cafe text-white shadow-sm' 
                        : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    }`}
                    onClick={() => available && handleAddItem(item)}
                    whileTap={available ? { scale: 0.95 } : {}}
                    whileHover={available ? { scale: 1.05 } : {}}
                    disabled={!available || loadingItems[item.id]}
                    aria-label={available ? `Add ${item.name} to cart` : `${item.name} unavailable`}
                  >
                    {loadingItems[item.id] ? 'Adding...' : available ? 'Add +' : 'Unavailable'}
                  </motion.button>
                </div>
              </div>
              
              {item.recommended && (
                <div className="absolute top-0 right-0">
                  <div className="bg-amber-500 text-white text-xs font-medium px-2 py-0.5 shadow-sm rounded-bl-md">
                    Popular
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default RecommendedItems;
