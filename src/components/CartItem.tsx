import React from 'react';
import { motion } from 'framer-motion';
import { Trash2, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';

type SizeType = 'S' | 'R' | 'L';

type CartItemProps = {
  item: {
    id: string;
    name: string;
    price: number | string;
    quantity: number;
    size?: SizeType;
    category?: string;
    options?: Record<string, any>;
  };
};

const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const { updateItemQuantity, removeItem } = useCart();
  
  // Ensure price is a number
  const itemPrice = typeof item.price === 'string' 
    ? parseFloat(item.price) || 0 
    : (typeof item.price === 'number' ? item.price : 0);
    
  // Ensure quantity is a number
  const itemQuantity = typeof item.quantity === 'number' && !isNaN(item.quantity) 
    ? item.quantity 
    : 1;
  
  // Safely calculate the total
  const itemTotal = itemPrice * itemQuantity;
  
  const handleIncrease = () => {
    updateItemQuantity(item.id, itemQuantity + 1, item.size);
  };
  
  const handleDecrease = () => {
    if (itemQuantity > 1) {
      updateItemQuantity(item.id, itemQuantity - 1, item.size);
    } else {
      // If quantity becomes 0, remove the item
      handleRemove();
    }
  };
  
  const handleRemove = () => {
    removeItem(item.id, item.size);
  };

  return (
    <motion.div 
      className="flex items-center justify-between py-3 border-b border-cafe/10 last:border-0"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex-1">
        <h4 className="font-medium">{item.name}</h4>
        <div className="flex items-center gap-2 text-sm text-cafe-text/70">
          <span>₹{itemPrice.toFixed(2)}</span>
          {item.size && <span className="px-1 py-0.5 bg-amber-50 rounded text-xs">Size {item.size}</span>}
          {item.options && Object.entries(item.options).length > 0 && (
            <span className="px-1 py-0.5 bg-amber-50 rounded text-xs">
              {Object.entries(item.options)
                .filter(([_, value]) => value)
                .map(([key]) => key)
                .join(', ')}
            </span>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="flex items-center border border-cafe/20 rounded-md">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 rounded-none text-cafe-text/70"
            onClick={handleDecrease}
          >
            <Minus size={14} />
          </Button>
          <span className="w-8 text-center text-sm">{itemQuantity}</span>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 rounded-none text-cafe-text/70"
            onClick={handleIncrease}
          >
            <Plus size={14} />
          </Button>
        </div>
        
        <div className="w-20 text-right font-medium">
          ₹{isNaN(itemTotal) ? '0.00' : itemTotal.toFixed(2)}
        </div>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-7 w-7 text-red-500 hover:bg-red-50 hover:text-red-500"
          onClick={handleRemove}
        >
          <Trash2 size={14} />
        </Button>
      </div>
    </motion.div>
  );
};

export default CartItem;
