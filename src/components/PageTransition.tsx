
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type PageTransitionProps = {
  children: React.ReactNode;
  className?: string;
};

const PageTransition: React.FC<PageTransitionProps> = ({ children, className }) => {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  return (
    <AnimatePresence mode="wait">
      {isMounted && (
        <motion.div
          className={className}
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: 1, 
            y: 0,
            transition: { 
              duration: 0.5, 
              ease: [0.22, 1, 0.36, 1],
              staggerChildren: 0.1
            }
          }}
          exit={{ 
            opacity: 0, 
            y: -20, 
            transition: { 
              duration: 0.3, 
              ease: [0.22, 1, 0.36, 1] 
            }
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PageTransition;
