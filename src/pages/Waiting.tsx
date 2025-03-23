import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { Clock, Check, X, Printer, RefreshCcw } from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import Logo from '@/components/Logo';
import { toast } from 'sonner';
import FAQButton from '@/components/FAQButton';
import { supabase } from '@/integrations/supabase/client'; 
import BillDisplay from '@/components/bill/BillDisplay';
import { Button } from '@/components/ui/button';

const coffeeFacts = [
  "Coffee is the second most traded commodity in the world after oil.",
  "The world's most expensive coffee can cost up to $600 per pound.",
  "Coffee beans are actually the pit of a cherry-like berry.",
  "Brazil produces around one-third of the world's coffee.",
  "Espresso means 'pressed out' in Italian.",
  "Coffee was originally eaten, not drunk.",
  "The largest cup of coffee ever filled a 9-foot tall cup.",
  "Coffee was discovered by a goat herder in Ethiopia."
];

const Waiting = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const orderId = location.state?.orderId || "Unknown";
  const [orderStatus, setOrderStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [factIndex, setFactIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(600); // 600 seconds = 10 minutes
  const [error, setError] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<any>(null);
  const [showBill, setShowBill] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Format the time since last refresh
  const getTimeSinceRefresh = () => {
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - lastRefreshed.getTime()) / 1000);
    
    if (diffSeconds < 60) {
      return `${diffSeconds} seconds ago`;
    } else {
      const diffMinutes = Math.floor(diffSeconds / 60);
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    }
  };

  // Fetch complete order data
  const fetchOrderData = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      if (data) {
        console.log("Order data retrieved:", data);
        
        // Process the data to ensure dates are properly formatted as Date objects
        const processedData = {
          ...data,
          created_at: new Date(data.created_at),
          approved_at: data.approved_at ? new Date(data.approved_at) : null,
          items: typeof data.items === 'string' ? JSON.parse(data.items) : data.items
        };
        
        setOrderData(processedData);
        return processedData; // Return the processed data for promise chaining
      }
    } catch (error) {
      console.error("Error fetching order data:", error);
      setError("Failed to fetch order data");
      throw error; // Re-throw the error for promise handling
    }
  };

  // Check order status using Supabase
  useEffect(() => {
    const fetchOrderStatus = async () => {
      setIsRefreshing(true);
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')  // Changed to select all fields, not just status
          .eq('id', orderId)
          .single();
        
        if (error) throw error;
        
        if (!data) {
          // Handle case when order doesn't exist
          console.log(`Order ${orderId} not found`);
          setError("Order not found");
          return;
        }
        
        setOrderData(data);
        const newStatus = data.status as 'pending' | 'approved' | 'rejected';
        setOrderStatus(newStatus);
        setLastRefreshed(new Date());
        
        // If order is already approved when we load the page, show bill directly
        if (newStatus === 'approved') {
          console.log("Order already approved, navigating to bill");
          localStorage.setItem('lastApprovedOrderId', orderId);
          
          // Store the order data in localStorage before navigating
          localStorage.setItem('currentOrderData', JSON.stringify(data));
          
          // Use replace:true to prevent back button issues
          navigate('/bill', { 
            state: { 
              orderId,
              orderData: data,
              fromWaiting: true // Add a flag to know where we came from
            },
            replace: true
          });
        } else if (newStatus === 'rejected') {
          toast.error("Your order has been rejected.");
        }
      } catch (error) {
        console.error("Error fetching order status:", error);
        setError("Failed to fetch order status");
      } finally {
        setIsRefreshing(false);
      }
    };

    fetchOrderStatus();

    // Set up real-time subscription to order status changes
    const subscription = supabase
      .channel(`order-${orderId}`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'orders',
        filter: `id=eq.${orderId}`
      }, async (payload) => {
        console.log("Order status changed:", payload.new);
        const newStatus = payload.new.status as 'pending' | 'approved' | 'rejected';
        setOrderStatus(newStatus);
        setLastRefreshed(new Date());
        
        // Update the order data and show bill
        if (newStatus === 'approved') {
          console.log("Order just approved, navigating to bill");
          toast.success("Your order has been approved!");
          
          // Store the order ID for reference
          localStorage.setItem('lastApprovedOrderId', orderId);
          
          // Ensure we have the complete order data
          try {
            const { data, error } = await supabase
              .from('orders')
              .select('*')
              .eq('id', orderId)
              .single();
            
            if (error) throw error;
            
            // Store the complete order data in localStorage
            localStorage.setItem('currentOrderData', JSON.stringify(data));
            
            // Navigate with the fresh data and replace the current page
            navigate('/bill', { 
              state: { 
                orderId,
                orderData: data,
                fromWaiting: true // Add a flag to know where we came from
              },
              replace: true // Use replace to prevent back navigation issues
            });
          } catch (err) {
            console.error("Error fetching complete order data:", err);
            
            // Fallback to using payload data if fetch fails
            const fallbackData = payload.new;
            localStorage.setItem('currentOrderData', JSON.stringify(fallbackData));
            
            navigate('/bill', { 
              state: { 
                orderId,
                orderData: fallbackData,
                fromWaiting: true
              },
              replace: true
            });
          }
        } else if (newStatus === 'rejected') {
          toast.error("Your order has been rejected.");
        }
      })
      .subscribe();
      
    // Set up auto-refresh every 30 seconds
    const refreshInterval = setInterval(() => {
      console.log('Auto-refreshing order status...');
      fetchOrderStatus();
    }, 30000); // 30 seconds

    // Change coffee fact every 8 seconds
    const factInterval = setInterval(() => {
      setFactIndex(current => (current + 1) % coffeeFacts.length);
    }, 8000);

    // Countdown timer for 10 minutes
    const timerInterval = setInterval(() => {
      setTimeRemaining(prevTime => {
        if (prevTime <= 1) {
          // Time's up, check status one last time
          fetchOrderStatus();

          if (orderStatus === 'pending') {
            toast.error("Your order timed out. Please try again or speak to staff.");
            navigate('/menu');
          }
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => {
      subscription.unsubscribe();
      clearInterval(refreshInterval);
      clearInterval(factInterval);
      clearInterval(timerInterval);
    };
  }, [orderId, navigate]);

  // Format the remaining time
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <PageTransition className="min-h-screen coffee-pattern">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md shadow-sm">
        <div className="container max-w-md mx-auto p-4">
          <div className="flex items-center justify-between">
            <Logo />
            <div className="flex items-center gap-2">
              <span className="text-xs text-cafe-text/60">Updated {getTimeSinceRefresh()}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const fetchOrderStatus = async () => {
                    setIsRefreshing(true);
                    try {
                      const { data, error } = await supabase
                        .from('orders')
                        .select('*')
                        .eq('id', orderId)
                        .single();
                      
                      if (error) throw error;
                      
                      if (!data) {
                        console.log(`Order ${orderId} not found`);
                        setError("Order not found");
                        return;
                      }
                      
                      setOrderData(data);
                      const newStatus = data.status as 'pending' | 'approved' | 'rejected';
                      setOrderStatus(newStatus);
                      setLastRefreshed(new Date());
                      
                      if (newStatus === 'approved') {
                        console.log("Order already approved, navigating to bill");
                        localStorage.setItem('lastApprovedOrderId', orderId);
                        localStorage.setItem('currentOrderData', JSON.stringify(data));
                        navigate('/bill', { 
                          state: { 
                            orderId,
                            orderData: data,
                            fromWaiting: true
                          },
                          replace: true
                        });
                      } else if (newStatus === 'rejected') {
                        toast.error("Your order has been rejected.");
                      }
                    } catch (error) {
                      console.error("Error fetching order status:", error);
                      setError("Failed to fetch order status");
                    } finally {
                      setIsRefreshing(false);
                    }
                  };
                  fetchOrderStatus();
                }}
                disabled={isRefreshing}
                className="h-8"
              >
                <RefreshCcw size={14} className={`${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="container max-w-md mx-auto p-4 pt-8">
        <motion.div
          className="cafe-card mb-6 p-6 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-xl font-semibold text-cafe-text mb-8">
            {orderStatus === 'pending' && "Waiting for approval"}
            {orderStatus === 'approved' && "Order approved!"}
            {orderStatus === 'rejected' && "Order rejected"}
          </h2>
          
          {/* Show countdown timer */}
          {orderStatus === 'pending' && (
            <div className="mb-4 flex justify-center items-center gap-2 text-cafe">
              <Clock size={20} />
              <span className="font-mono">{formatTime(timeRemaining)}</span>
            </div>
          )}
          
          <div className="flex justify-center mb-8">
            {orderStatus === 'pending' && (
              <CoffeeMug />
            )}
            
            {orderStatus === 'approved' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="bg-green-100 text-green-700 rounded-full p-4"
              >
                <Check size={48} />
              </motion.div>
            )}
            
            {orderStatus === 'rejected' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="bg-red-100 text-red-600 rounded-full p-4"
              >
                <X size={48} />
              </motion.div>
            )}
          </div>
          
          <div className="mb-8">
            <p className="text-cafe-text mb-2">Order ID: <span className="font-semibold">{orderId}</span></p>
            <p className="text-cafe-text/70 text-sm">
              {orderStatus === 'pending' && "Your order is being reviewed by the staff. Please wait a moment."}
              {orderStatus === 'approved' && "Your order has been approved! Redirecting to your bill..."}
              {orderStatus === 'rejected' && "Your order could not be processed. Please try again or speak to the staff."}
            </p>
          </div>
          
          {orderStatus === 'pending' && (
            <div className="bg-cafe/10 rounded-lg p-4 mb-4">
              <h3 className="font-medium text-cafe mb-2">While you wait...</h3>
              <AnimatePresence mode="wait">
                <motion.p 
                  key={factIndex}
                  className="text-sm text-cafe-text/80"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  {coffeeFacts[factIndex]}
                </motion.p>
              </AnimatePresence>
            </div>
          )}
          
          {orderStatus === 'rejected' && (
            <div className="mt-4">
              <button 
                className="px-4 py-2 bg-cafe text-white rounded-md hover:bg-cafe-dark"
                onClick={() => navigate('/menu')}
              >
                Return to Menu
              </button>
            </div>
          )}
        </motion.div>
      </main>

      {/* Add FAQ Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <FAQButton variant="default" size="default" />
      </motion.div>
    </PageTransition>
  );
};

// Coffee mug loading animation component
const CoffeeMug = () => {
  return (
    <div className="relative h-32 w-32">
      {/* Mug base */}
      <motion.div 
        className="absolute bottom-0 left-1/2 h-20 w-16 rounded-b-lg bg-cafe -translate-x-1/2"
        animate={{ 
          boxShadow: ["0px 0px 5px rgba(93, 64, 55, 0.3)", "0px 0px 15px rgba(93, 64, 55, 0.5)", "0px 0px 5px rgba(93, 64, 55, 0.3)"]
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      
      {/* Mug handle */}
      <motion.div 
        className="absolute bottom-2 right-8 h-14 w-6 rounded-r-full border-4 border-cafe"
      />
      
      {/* Coffee filling animation */}
      <motion.div
        className="absolute bottom-0 left-1/2 w-16 rounded-b-lg bg-[#8B572A] -translate-x-1/2"
        initial={{ height: 0 }}
        animate={{ height: ["0px", "18px", "14px", "18px"] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      
      {/* Steam animations */}
      <motion.div
        className="absolute bottom-full left-1/4 h-4 w-2 bg-white/20 rounded-full"
        animate={{ 
          y: [-10, -20, -10],
          opacity: [0, 0.6, 0],
          scale: [0.8, 1.2, 0.8]
        }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
      />
      <motion.div
        className="absolute bottom-full left-2/4 h-5 w-2 bg-white/20 rounded-full"
        animate={{ 
          y: [-10, -25, -10],
          opacity: [0, 0.7, 0],
          scale: [0.8, 1.3, 0.8]
        }}
        transition={{ duration: 2.5, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-full left-3/4 h-4 w-2 bg-white/20 rounded-full"
        animate={{ 
          y: [-10, -20, -10],
          opacity: [0, 0.6, 0],
          scale: [0.8, 1.2, 0.8]
        }}
        transition={{ duration: 2.2, repeat: Infinity, delay: 0.8 }}
      />
      
      {/* Circular loading indicator */}
      <motion.div 
        className="absolute -bottom-6 left-1/2 h-40 w-40 rounded-full border-t-4 border-cafe -translate-x-1/2 -translate-y-1/2"
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
};

export default Waiting;