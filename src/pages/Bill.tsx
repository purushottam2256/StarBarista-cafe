import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Check, ArrowRight, Download, Share2, Printer } from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import { useBillActions } from '@/hooks/useBillActions';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import BillDisplayComponent from '@/components/bill/BillDisplay';

// Missing component: Success Message
const SuccessMessage = () => (
  <div className="bg-green-50 border border-green-100 rounded-lg p-4 flex items-center">
    <div className="bg-green-100 rounded-full p-1 mr-3">
      <Check className="h-5 w-5 text-green-600" />
    </div>
    <div>
      <h3 className="text-green-800 font-medium">Order Confirmed</h3>
      <p className="text-green-700 text-sm">Your order has been processed successfully.</p>
    </div>
  </div>
);

// Missing component: Ratings Prompt
const RatingsPrompt = () => (
  <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
    <h3 className="font-medium text-cafe-dark mb-2">Enjoying your experience?</h3>
    <p className="text-sm text-cafe-text mb-3">We'd love to hear your feedback! Please consider rating us.</p>
    <div className="flex justify-center space-x-3">
      <Button 
        variant="outline" 
        size="sm" 
        className="border-cafe/30 hover:bg-amber-100/50"
        onClick={() => window.open("https://www.google.com/search?client=ms-android-oppo-rvo3&sca_esv=25cf531ee370dd12&sxsrf=AHTn8zqvcF1rYrJsfIQS_hxEk-8tKVmtPA:1742148674898&si=APYL9bs7Hg2KMLB-4tSoTdxuOx8BdRvHbByC_AuVpNyh0x2Kza64Xndqz5okBNTbmOJkQkTZbwOkmllAuFBK_dHbuccjcXvoFu9M7yriLiGSi-Ta2Rqoopg_TCrSsoEsus5l02VzPbmmcaA-n_h28j8DoCnOAojpoQ%3D%3D&q=Barista+@+Star+Hospital+Reviews&sa=X&ved=2ahUKEwjR8abHmY-MAxV8xjgGHUOFIJMQ0bkNegQIJRAD&cshid=1742148678693286&biw=1536&bih=702&dpr=1.25", "_blank")}
      >
        Rate on Google
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        className="border-cafe/30 hover:bg-amber-100/50"
        onClick={() => window.open("https://www.justdial.com/Hyderabad/Barista-Star-Hospital-Makthakousarali/040PXX40-XX40-240221161225-X8Q7_BZDET/writereview?city=Hyderabad&area=&fid=&prevRating=0&company_name=Barista+%40+Star+Hospital&nav=1&tapToRate=1", "_blank")}
      >
        Rate on JustDial
      </Button>
    </div>
  </div>
);

const BillDisplay = React.forwardRef<HTMLDivElement, { orderId: string, orderData: any }>(
  ({ orderId, orderData }, ref) => (
    <div 
      ref={ref} 
      className="bill-content" 
      style={{ fontFamily: "'Courier New', monospace" }}
    >
      <div className="mb-4 text-center">
        <h3 className="font-bold text-lg">BARISTA @ STAR HOSPITAL</h3>
        <div className="text-sm">Star Hospital, Ground Floor</div>
        <div className="text-sm mb-2">mob: +91 9701441539</div>
      </div>
      
      <div className="text-sm mb-4">
        <div className="flex justify-between">
          <span>Receipt #:</span>
          <span className="font-medium">{orderId.slice(0, 8).toUpperCase()}</span>
        </div>
        <div className="flex justify-between">
          <span>Date:</span>
          <span>{new Date(orderData.created_at).toLocaleDateString()}</span>
        </div>
        <div className="flex justify-between">
          <span>Time:</span>
          <span>{new Date(orderData.created_at).toLocaleTimeString()}</span>
        </div>
        {orderData.room_number && (
          <div className="flex justify-between">
            <span>Room/Ward:</span>
            <span>{orderData.room_number}</span>
          </div>
        )}
        {orderData.customer_name && (
          <div className="flex justify-between">
            <span>Customer:</span>
            <span>{orderData.customer_name}</span>
          </div>
        )}
      </div>
      
      {/* ...rest of the BillDisplay component... */}
    </div>
  )
);

const Bill: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { clearCart } = useCart();
  
  // Log the incoming state immediately
  console.log("Bill page mounted with location state:", location.state);
  
  const orderId = location.state?.orderId || localStorage.getItem('lastApprovedOrderId') || '';
  console.log("Using orderId:", orderId);
  
  // Don't remove currentOrderData on unmount to prevent refresh issues
  useEffect(() => {
    // Load from localStorage if not already done
    const savedData = localStorage.getItem('currentOrderData');
    console.log("Initial localStorage data:", savedData ? "Found" : "Not found");
    
    // Set lastApprovedOrderId to ensure persistence
    if (orderId) {
      localStorage.setItem('lastApprovedOrderId', orderId);
    }
  }, [orderId]);
  
  // Try to get order data from multiple sources with more logging
  const initialOrderData = (() => {
    if (location.state?.orderData) {
      console.log("Using order data from navigation state");
      return location.state.orderData;
    }
    
    try {
      const savedData = localStorage.getItem('currentOrderData');
      if (savedData) {
        console.log("Using order data from localStorage");
        const parsedData = JSON.parse(savedData);
        return parsedData;
      }
    } catch (e) {
      console.error('Error parsing saved order data:', e);
    }
    
    console.log("No initial order data found, will fetch from API");
    return null;
  })();
  
  const [orderData, setOrderData] = useState<any>(initialOrderData);
  const [isLoading, setIsLoading] = useState(!initialOrderData);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);
  
  const {
    billRef,
    isDownloading,
    handleFinish,
    handleDownload
  } = useBillActions({ orderId, orderData });

  // Fetch order data from Supabase only if we don't have it
  useEffect(() => {
    console.log("Effect running with orderId:", orderId);
    console.log("Current orderData:", orderData ? "Present" : "Not present");
    console.log("Has fetched before:", hasFetched);
    
    const fetchOrder = async () => {
      // If we already have order data, skip fetching
      if (orderData) {
        console.log("Using existing order data, skipping fetch");
        setIsLoading(false);
        return;
      }

      if (!orderId) {
        console.log("No orderId found, redirecting to menu");
        toast.error("Order ID not found");
        navigate('/menu');
        return;
      }
      
      // Prevent multiple fetches
      if (hasFetched) {
        console.log("Already tried fetching once, not fetching again");
        return;
      }
      
      setIsLoading(true);
      setFetchError(null);
      setHasFetched(true);
      
      try {
        console.log("Fetching order data for ID:", orderId);
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .single();
        
        if (error) {
          console.error("Supabase error:", error);
          throw error;
        }
        
        if (data) {
          console.log("Order data retrieved successfully:", data);
          setOrderData(data);
          // Store in localStorage for persistence
          localStorage.setItem('currentOrderData', JSON.stringify(data));
          clearCart();
        } else {
          console.error("Order not found in database");
          throw new Error("Order not found");
        }
      } catch (error) {
        console.error("Error fetching order:", error);
        setFetchError("Failed to fetch order");
        toast.error("Failed to load order details");
        
        // Try localStorage one last time
        checkLocalStorage(orderId);
      } finally {
        setIsLoading(false);
      }
    };

    const checkLocalStorage = (id: string) => {
      console.log("Checking localStorage as last resort for ID:", id);
      try {
        const savedData = localStorage.getItem('currentOrderData');
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          console.log("Found data in localStorage:", parsedData);
          if (parsedData.id === id || !id) {
            console.log("Setting order data from localStorage");
            setOrderData(parsedData);
            clearCart();
            return true;
          }
        }
      } catch (e) {
        console.error('Error checking localStorage:', e);
      }
      return false;
    };

    // Start the fetch process
    fetchOrder();
    
    // We are NOT removing currentOrderData on unmount anymore
    // to prevent refresh issues
  }, [orderId, clearCart, orderData, hasFetched, navigate]);

  // Implement share functionality
  const handleShare = async () => {
    if (!orderData) return;

    const receiptText = `
Barista @ Star Hospital - Receipt
---------------------------
Order #${orderId.slice(0, 8).toUpperCase()}
Date: ${new Date(orderData.created_at).toLocaleDateString()}
Time: ${new Date(orderData.created_at).toLocaleTimeString()}
${orderData.customer_name ? `Customer: ${orderData.customer_name}` : ''}
${orderData.room_number ? `Room/Ward: ${orderData.room_number}` : ''}
---------------------------
Items:
${orderData.items.map((item: any) => 
  `${item.name} x${item.quantity || 1} - ₹${((item.price || 0) * (item.quantity || 1)).toFixed(2)}`
).join('\n')}
---------------------------
Subtotal: ₹${orderData.subtotal.toFixed(2)}
${orderData.taxes ? `Taxes: ₹${orderData.taxes.toFixed(2)}` : ''}
Total: ₹${orderData.total.toFixed(2)}
---------------------------
Thank you for visiting Barista @ Star Hospital!
`.trim();

    try {
      // First try native sharing
      if (navigator.share && navigator.canShare) {
        const shareData = {
          title: 'Barista @ Star Hospital - Receipt',
          text: receiptText,
          url: window.location.href
        };

        if (navigator.canShare(shareData)) {
          await navigator.share(shareData);
          toast.success("Receipt shared successfully!");
          return;
        }
      }

      // Fallback to clipboard
      await navigator.clipboard.writeText(receiptText);
      toast.success("Receipt copied to clipboard! You can now paste and share it.");
      
    } catch (error) {
      console.error('Error sharing:', error);
      
      // Try alternate clipboard API if primary fails
      try {
        const textArea = document.createElement('textarea');
        textArea.value = receiptText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        toast.success("Receipt copied to clipboard! You can now paste and share it.");
      } catch (fallbackError) {
        console.error('Fallback sharing failed:', fallbackError);
        toast.error("Couldn't share receipt. Please try again.");
      }
    }
  };

  // Implement print functionality
  const handlePrint = () => {
    if (billRef.current) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Barista @ Star Hospital - Receipt #${orderId}</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                .bill-content { max-width: 400px; margin: 0 auto; }
              </style>
            </head>
            <body>
              ${billRef.current.outerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      } else {
        toast.error("Please allow pop-ups to print receipt");
      }
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <PageTransition className="min-h-screen pb-6 bg-gradient-to-b from-amber-50/60 to-white">
        <div className="container max-w-md mx-auto px-4 py-12 flex flex-col items-center">
          <Logo size="lg" />
          <div className="mt-8 text-center">
            <h2 className="text-xl font-semibold text-cafe-dark">Loading your receipt...</h2>
            <div className="mt-4 animate-pulse">
              <div className="h-6 w-48 bg-gray-200 rounded mb-3 mx-auto"></div>
              <div className="h-4 w-32 bg-gray-200 rounded mx-auto"></div>
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  // Show error state
  if (fetchError && !orderData) {
    return (
      <PageTransition className="min-h-screen pb-6 bg-gradient-to-b from-amber-50/60 to-white">
        <div className="container max-w-md mx-auto px-4 py-12 flex flex-col items-center">
          <Logo size="lg" />
          <div className="mt-8 text-center">
            <h2 className="text-xl font-semibold text-red-600">Error Loading Receipt</h2>
            <p className="mt-2 text-cafe-text">{fetchError || "Unable to load order details"}</p>
            <button 
              className="mt-4 px-4 py-2 bg-cafe text-white rounded-md hover:bg-cafe-dark"
              onClick={() => {
                // Clear error state and try again
                setFetchError(null);
                setHasFetched(false);
                window.location.reload();
              }}
            >
              Try Again
            </button>
            <button 
              className="mt-4 ml-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              onClick={() => navigate('/menu')}
            >
              Back to Menu
            </button>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition className="min-h-screen pb-6 bg-gradient-to-b from-amber-50/60 to-white">
      {/* Decorative elements */}
      <motion.div 
        className="absolute top-0 left-0 right-0 h-32 overflow-hidden z-0 opacity-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="coffee-beans-pattern h-full" />
      </motion.div>

      {/* Logo and header section */}
      <motion.div 
        className="relative z-10 pt-6 pb-4 flex flex-col items-center"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <div className="mb-2">
          <Logo size="lg" />
        </div>
        <motion.div 
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h1 className="text-xl font-semibold text-cafe-dark">Your Receipt</h1>
          <p className="text-sm text-cafe-text/60">Thank you for your order!</p>
        </motion.div>
      </motion.div>
      
      <div className="container max-w-md mx-auto px-4">
        {/* Success message with enhanced animation */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.3 }}
          className="mb-6"
        >
          <SuccessMessage />
        </motion.div>
        
        {/* Bill display with paper effect */}
        <motion.div
          className="relative mb-6"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <div className="absolute inset-0 bg-white rounded-2xl shadow-lg transform rotate-1 translate-x-1 translate-y-1 opacity-30" />
          <div className="absolute inset-0 bg-white rounded-2xl shadow-lg transform -rotate-1 -translate-x-1 -translate-y-1 opacity-30" />
          <div className="bg-white rounded-2xl shadow-md p-6 relative z-10 border border-amber-100">
            <BillDisplayComponent 
              ref={billRef}
              orderId={orderData.id}
              orderData={orderData}
            />
          </div>
        </motion.div>
        
        {/* Bill actions with enhanced buttons */}
        <motion.div
          className="space-y-4 mb-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <div className="grid grid-cols-3 gap-3">
            <motion.div whileHover={{ y: -2 }} whileTap={{ y: 2 }}>
              <Button 
                variant="outline" 
                className="w-full border-cafe/20 hover:border-cafe/40 hover:bg-amber-50 flex flex-col items-center justify-center py-4 h-auto"
                onClick={handleDownload}
                disabled={isDownloading}
              >
                <Download className="h-5 w-5 mb-1 text-cafe" />
                <span className="text-xs font-normal">{isDownloading ? "Saving..." : "Save"}</span>
              </Button>
            </motion.div>
            
            <motion.div whileHover={{ y: -2 }} whileTap={{ y: 2 }}>
              <Button 
                variant="outline" 
                className="w-full border-cafe/20 hover:border-cafe/40 hover:bg-amber-50 flex flex-col items-center justify-center py-4 h-auto"
                onClick={handleShare}
              >
                <Share2 className="h-5 w-5 mb-1 text-cafe" />
                <span className="text-xs font-normal">Share</span>
              </Button>
            </motion.div>
            
            <motion.div whileHover={{ y: -2 }} whileTap={{ y: 2 }}>
              <Button 
                variant="outline" 
                className="w-full border-cafe/20 hover:border-cafe/40 hover:bg-amber-50 flex flex-col items-center justify-center py-4 h-auto"
                onClick={handlePrint}
              >
                <Printer className="h-5 w-5 mb-1 text-cafe" />
                <span className="text-xs font-normal">Print</span>
              </Button>
            </motion.div>
          </div>
          
          <motion.div 
            className="flex justify-center mt-6"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button 
              className="bg-cafe hover:bg-cafe-dark text-white flex items-center gap-2 px-8"
              onClick={handleFinish}
            >
              <Check size={16} />
              Return to Menu
              <ArrowRight size={16} className="ml-1" />
            </Button>
          </motion.div>
        </motion.div>
        
        {/* Enhanced ratings prompt */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="mb-8"
        >
          <RatingsPrompt />
        </motion.div>
        
        {/* Added footer with branding */}
        <motion.footer
          className="text-center text-xs text-cafe-text/40 pt-4 pb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <p>Order #{orderData.id} • {new Date(orderData.created_at).toLocaleDateString()}</p>
          <p className="mt-1">Thank you for visiting Barista @ Star Hospital</p>
        </motion.footer>
      </div>
    </PageTransition>
  );
};

export default Bill;