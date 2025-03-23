import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { HelpCircle } from "lucide-react";
import { Button, ButtonProps } from "@/components/ui/button";

interface FAQButtonProps extends ButtonProps {
  tooltip?: boolean;
}

const FAQButton: React.FC<FAQButtonProps> = ({
  tooltip = true,
  variant = "default",
  size = "default",
  className = "",
  ...props
}) => {
  const navigate = useNavigate();
  
  const handleFAQClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    navigate('/faq');
  };
  
  return (
    <div className="relative group">
      {tooltip && (
        <motion.div 
          className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap opacity-0 invisible group-hover:visible"
          initial={{ opacity: 0, y: 5 }}
          animate={{
            opacity: 0,
            y: 5,
            transition: { duration: 0.2 }
          }}
          whileHover={{
            opacity: 1,
            y: 0,
            transition: { duration: 0.2 }
          }}
        >
          FAQs & Help
          <div className="absolute left-1/2 transform -translate-x-1/2 top-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-black/80"></div>
        </motion.div>
      )}
      
      <Button 
        variant={variant} 
        size={size}
        className={`relative rounded-full ${className}`}
        onClick={handleFAQClick}
        {...props}
      >
        <motion.div
          className="relative flex items-center justify-center"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <HelpCircle 
            className="h-[1.2em] w-[1.2em]" 
            aria-hidden="true"
          />
          <span className="sr-only">FAQs and Help</span>
        </motion.div>
      </Button>
    </div>
  );
};

export default FAQButton;