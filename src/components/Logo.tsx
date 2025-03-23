
import React from 'react';
import { motion } from 'framer-motion';

type LogoProps = {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  withText?: boolean;
};

const Logo: React.FC<LogoProps> = ({ size = 'md', withText = true }) => {
  const sizeMap = {
    sm: 'h-8',
    md: 'h-12',
    lg: 'h-20',
  };

  return (
    <div className="flex items-center justify-center">
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ rotate: -5 }}
        animate={{ rotate: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <img 
          src="/logos/barista-logo.png" 
          alt="Barista Logo" 
          className={`${sizeMap[size]}`}
        />
      </motion.div>
      {withText && (
        <motion.span 
          className="ml-2 text-xl font-bold text-cafe-dark"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
      
        </motion.span>
      )}
    </div>
  );
};

export default Logo;
