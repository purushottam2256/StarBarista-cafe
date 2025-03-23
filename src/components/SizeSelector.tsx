import React from 'react';
import { motion } from 'framer-motion';

type SizePricing = {
  small: number;
  medium: number;
  large: number;
};

type SizeSelectorProps = {
  sizes: SizePricing;
  selectedSize: 'small' | 'medium' | 'large';
  onSelectSize: (size: 'small' | 'medium' | 'large') => void;
};

const SizeSelector: React.FC<SizeSelectorProps> = ({ 
  sizes, 
  selectedSize, 
  onSelectSize 
}) => {
  return (
    <div className="flex items-center justify-between gap-2 mt-2 mb-2">
      <motion.button
        className={`flex-1 py-1 px-2 rounded-md text-xs font-medium transition-colors 
          ${selectedSize === 'small' 
            ? 'bg-cafe text-white' 
            : 'bg-amber-50 text-cafe-text hover:bg-amber-100'}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onSelectSize('small')}
      >
        <div className="flex flex-col items-center">
          <span>S</span>
          <span className="text-xs font-normal">₹{sizes.small}</span>
        </div>
      </motion.button>
      
      <motion.button
        className={`flex-1 py-1 px-2 rounded-md text-xs font-medium transition-colors 
          ${selectedSize === 'medium' 
            ? 'bg-cafe text-white' 
            : 'bg-amber-50 text-cafe-text hover:bg-amber-100'}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onSelectSize('medium')}
      >
        <div className="flex flex-col items-center">
          <span>M</span>
          <span className="text-xs font-normal">₹{sizes.medium}</span>
        </div>
      </motion.button>
      
      <motion.button
        className={`flex-1 py-1 px-2 rounded-md text-xs font-medium transition-colors 
          ${selectedSize === 'large' 
            ? 'bg-cafe text-white' 
            : 'bg-amber-50 text-cafe-text hover:bg-amber-100'}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onSelectSize('large')}
      >
        <div className="flex flex-col items-center">
          <span>L</span>
          <span className="text-xs font-normal">₹{sizes.large}</span>
        </div>
      </motion.button>
    </div>
  );
};

export default SizeSelector;