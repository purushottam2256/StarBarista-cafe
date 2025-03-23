import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

const SuccessMessage: React.FC = () => {
  return (
    <motion.div 
      className="bg-green-50 rounded-xl p-4 border border-green-100 flex items-center gap-3"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <div className="bg-green-100 rounded-full p-2">
        <motion.div
          animate={{ 
            scale: [0.8, 1.2, 1],
            rotate: [0, 10, 0]
          }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <CheckCircle2 className="h-6 w-6 text-green-600" />
        </motion.div>
      </div>
      <div>
        <h3 className="font-medium text-green-800">Payment Successful!</h3>
        <p className="text-sm text-green-600">Your order has been confirmed.</p>
      </div>
    </motion.div>
  );
};

export default SuccessMessage;
