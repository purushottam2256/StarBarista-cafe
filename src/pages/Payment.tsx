import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Banknote, CreditCard, QrCode as QrCodeIcon, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import Logo from '@/components/Logo';
import PageTransition from '@/components/PageTransition';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

type PaymentMethod = 'qr' | 'card' | 'cash';
type OrderStatus = 'pending' | 'approved' | 'rejected';

// Define order type to store in database
export type Order = {
  id: string;
  items: any[];
  total: number;
  payment_method: PaymentMethod;
  status: OrderStatus;
  created_at: string;
  approved_at?: string | null;
  customer_name?: string;
  table_number?: string;
  subtotal: number;
  taxes: number;
  room_number: string;
}

const Payment = () => {
  const navigate = useNavigate();
  const { total, items, clearCart } = useCart();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('qr');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCounterDialog, setShowCounterDialog] = useState(false);
  const [orderId] = useState(`ORD${Date.now().toString().slice(-6)}`);
  const [error, setError] = useState<string | null>(null);
  
  // Generate payment data for QR code
  const paymentData = JSON.stringify({
    amount: total.toFixed(2),
    currency: 'INR',
    merchantId: 'CAFE123',
    orderId: orderId,
    timestamp: new Date().toISOString()
  });
  
  const handlePayment = () => {
    if (selectedMethod === 'card' || selectedMethod === 'cash') {
      setShowCounterDialog(true);
      return;
    }
    
    // For QR payment
    setIsProcessing(true);
    toast.loading("Checking payment status...");
    
    // Simulate QR payment processing
    setTimeout(() => {
      setIsProcessing(false);
      toast.dismiss();
      saveOrderToDatabase();
    }, 2000);
  };

  const handleCounterPayment = () => {
    setShowCounterDialog(false);
    toast.loading("Checking payment status...");
    setTimeout(() => {
      toast.dismiss();
      saveOrderToDatabase();
    }, 1500);
  };

  const saveOrderToDatabase = async () => {
    let order: Order;
    
    try {
      // Calculate taxes (for example, 5% of the subtotal)
      const subtotal = typeof total === 'number' && !isNaN(total) ? total : 0;
      const totalWithTax = subtotal; // Remove tax calculation
      
      // Create order object
      order = {
        id: orderId,
        items: items.map(item => ({
          ...item,
          price: typeof item.price === 'number' && !isNaN(item.price) 
            ? item.price 
            : typeof item.price === 'string' 
              ? parseFloat(item.price) || 0 
              : 0
        })),
        total: totalWithTax,
        subtotal: subtotal,
        taxes: 0, // Set taxes to 0
        payment_method: selectedMethod,
        status: 'pending',
        created_at: new Date().toISOString(),
        room_number: localStorage.getItem('roomNumber') || 'Unknown',
      };
      
      // Save order to Supabase
      const { data, error } = await supabase
        .from('orders')
        .insert([order])
        .select();
      
      if (error) {
        console.error('Error saving order:', error);
        throw error;
      }
      
      // Clear cart after saving order
      clearCart();
      
      // Show waiting message
      toast.success("Order placed successfully!");
      
      // Navigate to waiting page with order ID
      navigate('/waiting', { state: { orderId } });
      
    } catch (error) {
      console.error('Error saving order:', error);
      toast.error("Error processing order");
      
      // Check if order was defined before the error occurred
      if (order) {
        // Fallback to localStorage if database fails
        const existingOrders = JSON.parse(localStorage.getItem('pendingOrders') || '[]');
        const updatedOrders = [...existingOrders, order];
        localStorage.setItem('pendingOrders', JSON.stringify(updatedOrders));
      }
      
      // Still proceed to waiting page
      navigate('/waiting', { state: { orderId } });
    }
  };

  return (
    <PageTransition className="min-h-screen coffee-pattern">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md shadow-sm">
        <div className="container max-w-md mx-auto p-4">
          <div className="flex items-center justify-between">
            <Link to="/cart" className="flex items-center gap-1 text-cafe-text hover:text-cafe">
              <ChevronLeft size={18} />
              <span>Back to Cart</span>
            </Link>
            
            <Logo withText={false} />
          </div>
          
          <div className="mt-3 flex items-center justify-center">
            <h1 className="text-xl font-semibold text-cafe-text">Payment</h1>
          </div>
        </div>
      </header>
      
      <main className="container max-w-md mx-auto p-4">
        <div className="cafe-card mb-6 p-4">
          <h3 className="font-semibold">Order Total</h3>
          <p className="mt-1 text-2xl font-bold text-cafe">₹{total.toFixed(2)}</p>
          <p className="text-xs text-cafe-text/70 mt-1">Order ID: {orderId}</p>
        </div>
        
        <div className="mb-8">
          <h3 className="mb-3 font-semibold">Select Payment Method</h3>
          
          <div className="space-y-3">
            <PaymentOption
              method="qr"
              icon={<QrCodeIcon size={20} />}
              title="Scan QR Code"
              description="Pay using any UPI app"
              selected={selectedMethod === 'qr'}
              onSelect={() => setSelectedMethod('qr')}
            />
            
            <PaymentOption
              method="card"
              icon={<CreditCard size={20} />}
              title="Card Payment"
              description="Credit or Debit card"
              selected={selectedMethod === 'card'}
              onSelect={() => setSelectedMethod('card')}
            />
            
            <PaymentOption
              method="cash"
              icon={<Banknote size={20} />}
              title="Cash Payment"
              description="Pay at counter"
              selected={selectedMethod === 'cash'}
              onSelect={() => setSelectedMethod('cash')}
            />
          </div>
        </div>
        
        {selectedMethod === 'qr' && (
          <motion.div 
            className="cafe-card mb-8 p-6 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h3 className="mb-4 font-semibold">Scan to Pay</h3>
            <div className="flex flex-col items-center">
              {/* Price information above QR code */}
              <div className="mb-3 rounded-md bg-cafe/10 px-4 py-2 text-center">
                <p className="text-xl font-bold text-cafe">₹{total.toFixed(2)}</p>
                <p className="text-xs text-cafe-text/70">UPI Payment</p>
              </div>
              
              {/* QR code container without overlay */}
              <div className="relative mx-auto h-52 w-52">
                {/* Static QR code image */}
                <img
                  src="./logos/scanner.png"
                  alt="Payment QR Code"
                  className="h-full w-full object-contain"
                />
                <motion.div
                  className="absolute inset-0 border-2 border-cafe"
                  animate={{
                    opacity: [0.2, 1, 0.2],
                    scale: [0.9, 1, 0.9],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
            </div>
            <p className="mt-4 text-sm text-cafe-text/70">Scan with any UPI app</p>
          </motion.div>
        )}
        
        <Button 
          className="w-full bg-cafe hover:bg-cafe-dark py-6"
          onClick={handlePayment}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </span>
          ) : (
            'Complete Payment'
          )}
        </Button>
        
        <p className="mt-4 text-center text-sm text-cafe-text/70">
          After payment, your order will be sent for staff approval
        </p>
      </main>
      
      {/* Counter Payment Dialog */}
      <Dialog open={showCounterDialog} onOpenChange={setShowCounterDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              Counter Payment Required
            </DialogTitle>
            <DialogDescription>
              For {selectedMethod === 'card' ? 'card' : 'cash'} payments, please proceed to the counter to complete your transaction.
              <div className="mt-3 p-3 bg-cafe/5 rounded-md">
                <p className="font-medium">Order Total: <span className="font-bold text-cafe">₹{total.toFixed(2)}</span></p>
                <p className="text-xs mt-1">Order ID: {orderId}</p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center mt-4">
            <Button onClick={handleCounterPayment}>
              Proceed to Counter
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
};

type PaymentOptionProps = {
  method: PaymentMethod;
  icon: React.ReactNode;
  title: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
};

const PaymentOption: React.FC<PaymentOptionProps> = ({
  method,
  icon,
  title,
  description,
  selected,
  onSelect,
}) => (
  <motion.div
    className={`menu-card flex cursor-pointer items-center gap-3 p-4 ${
      selected ? 'border-cafe bg-cafe/5' : ''
    }`}
    onClick={onSelect}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
  >
    <div className={`rounded-full p-2 ${selected ? 'bg-cafe text-white' : 'bg-cafe/10 text-cafe'}`}>
      {icon}
    </div>
    
    <div className="flex-1">
      <h4 className="font-medium">{title}</h4>
      <p className="text-sm text-cafe-text/70">{description}</p>
    </div>
    
    <div className="h-4 w-4 rounded-full border border-cafe">
      {selected && <div className="h-full w-full rounded-full bg-cafe" />}
    </div>
  </motion.div>
);

export default Payment;