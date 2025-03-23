import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { MenuCategoryType } from '@/utils/menuData';
import MenuItem from './MenuItem';

interface MenuCategoryProps {
  category: MenuCategoryType;
  isActive: boolean;
  onCategoryEnter: () => void;
}

const MenuCategory = ({ category, isActive, onCategoryEnter }: MenuCategoryProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: { type: 'spring', stiffness: 300, damping: 30 }
    }
  };

  return (
    <motion.section 
      className="mb-8" 
      initial="hidden"
      animate="show"
      variants={containerVariants}
      onViewportEnter={onCategoryEnter}
    >
      <motion.div 
        className={`flex items-center justify-between py-3 px-4 rounded-lg mb-4 cursor-pointer ${
          isActive ? 'bg-cafe/10' : 'bg-white/60'
        }`}
        onClick={() => setIsExpanded(!isExpanded)}
        whileHover={{ backgroundColor: 'rgba(146, 104, 69, 0.15)' }}
        whileTap={{ scale: 0.98 }}
        layout
      >
        <h2 className="text-xl font-bold text-cafe-dark">{category.name}</h2>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown size={20} className="text-cafe" />
        </motion.div>
      </motion.div>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <motion.div className="grid gap-4" variants={containerVariants}>
              {category.items.map((item) => (
                <motion.div key={item.id} variants={itemVariants}>
                  <MenuItem item={item} />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
};

export default MenuCategory;