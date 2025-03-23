import React, { useState, useEffect, useRef, forwardRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Receipt, List, Menu, BarChart4, FileText, Download, MessageSquare } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import PageTransition from '@/components/PageTransition';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Logo from '@/components/Logo';

// Import the admin components
import AdminHeader from '@/components/admin/AdminHeader';
import InventoryManagement from '@/components/admin/InventoryManagement';
import OrderManagement from '@/components/admin/OrderManagement';
import SalesAnalytics from '@/components/admin/SalesAnalytics';
import ContactMessages from '@/components/admin/ContactMessages';

// Define types for the order item
export type OrderItemType = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  category?: string;
  options?: Record<string, any>;
};

// Define types for the order
export type OrderType = {
  id: string;
  items: OrderItemType[];
  subtotal: number;
  taxes: number;
  total: number;
  status: string;
  payment_method: string | null;
  created_at: string;
  approved_at: string | null;
  table_number?: string;
  room_number?: string;
  customer_name?: string;
  timestamp?: string;
};

interface BillDisplayProps {
  order: OrderType;
  isGeneratingBill: boolean;
  setIsGeneratingBill: React.Dispatch<React.SetStateAction<boolean>>;
  formatDate: (dateString: string) => string;
  onClose: () => void;
}

const BillDisplay = forwardRef<HTMLDivElement, BillDisplayProps>(({ order, isGeneratingBill, setIsGeneratingBill, formatDate, onClose }, ref) => {
  return (
    <div ref={ref} className="p-4 bg-white rounded-lg">
      <div className="text-center mb-4 pb-2 border-b">
        <h3 className="font-bold text-lg">Cafe Receipt</h3>
        <p className="text-sm text-gray-500">Order #{order.id}</p>
        <p className="text-sm text-gray-500">Date: {formatDate(order.created_at)}</p>
        <p className="text-sm text-gray-500">Room: {order.room_number || order.table_number || 'Not specified'}</p>
        {order.customer_name && (
          <p className="text-sm text-gray-500">Customer: {order.customer_name}</p>
        )}
        <p className="text-sm text-gray-500">
          Payment: {order.payment_method === 'card' ? 'Card' : 
                    order.payment_method === 'cash' ? 'Cash' : 
                    order.payment_method === 'qr' ? 'QR / UPI' : 'Unknown'}
        </p>
      </div>
      
      <div className="mt-4 mb-4">
        <h4 className="font-semibold border-b pb-1 mb-2">Order Items</h4>
        {Array.isArray(order.items) && order.items.length > 0 ? (
          <div className="space-y-2">
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <div>
                  <span className="font-medium">{item.quantity} x </span>
                  <span>{item.name}</span>
                  {item.size && <span className="text-xs ml-1">({item.size})</span>}
                </div>
                <span>₹{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No items found</p>
        )}
      </div>
      
      <div className="mt-4 pt-2 border-t">
        <div className="flex justify-between text-sm">
          <span>Subtotal:</span>
          <span>₹{order.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Taxes:</span>
          <span>₹{order.taxes.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold mt-2 pt-2 border-t">
          <span>Total:</span>
          <span>₹{order.total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
});

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [selectedOrder, setSelectedOrder] = useState<OrderType | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isGeneratingBill, setIsGeneratingBill] = useState(false);
  const billRefObject = useRef<HTMLDivElement>(null);
  
  // Check if user is authenticated with security key
  useEffect(() => {
    const checkAuth = async () => {
      const isAdmin = localStorage.getItem('isAdmin');
      const securityKey = localStorage.getItem('adminSecurityKey');
      
      if (isAdmin !== 'true' || securityKey !== 'barista-secured-dashboard-key') {
        navigate('/admin');
        toast.error('Please login first');
      }
    };
    
    checkAuth();
  }, [navigate]);
  
  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('adminSecurityKey');
    toast.success('Logged out successfully');
    navigate('/admin');
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // View order details and bill
  const viewOrderDetails = (order: OrderType) => {
    // Ensure order items are properly parsed if they're stored as a string
    if (typeof order.items === 'string') {
      try {
        order.items = JSON.parse(order.items);
      } catch (error) {
        console.error('Error parsing order items:', error);
        toast.error('Failed to parse order items');
        order.items = [];
      }
    }
    
    setSelectedOrder(order);
    setDialogOpen(true);
  };

  const handleOrderStatusChange = async (orderId: string, status: 'approved' | 'rejected') => {
    try {
      // Include approved_at timestamp when approving
      const updateData = {
        status,
        approved_at: status === 'approved' ? new Date().toISOString() : null
      };
      
      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId);
      
      if (error) throw error;
      
      toast.success(`Order ${status === 'approved' ? 'approved' : 'rejected'} successfully`);
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };
  
  // Function to download bill as text
  const downloadBill = () => {
    if (!selectedOrder) return;
    
    try {
      setIsGeneratingBill(true);
      
      const billText = generateBillText(selectedOrder);
      const blob = new Blob([billText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bill-${selectedOrder.id}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Bill downloaded successfully');
    } catch (error) {
      console.error('Error downloading bill:', error);
      toast.error('Failed to download bill');
    } finally {
      setIsGeneratingBill(false);
    }
  };
  
  // Generate text content for bill
  const generateBillText = (order: OrderType): string => {
    let text = '';
    text += '======== CAFE RECEIPT ========\n\n';
    text += `Order: #${order.id}\n`;
    text += `Date: ${formatDate(order.created_at)}\n`;
    text += `Table: ${order.table_number || 'Takeaway'}\n`;
    text += `Payment: ${order.payment_method === 'card' ? 'Card' : 
              order.payment_method === 'cash' ? 'Cash' : 
              order.payment_method === 'qr' ? 'QR / UPI' : 'Unknown'}\n\n`;
    
    text += '----------- ITEMS ------------\n\n';
    
    if (Array.isArray(order.items) && order.items.length > 0) {
      order.items.forEach(item => {
        text += `${item.quantity} x ${item.name}`;
        if (item.size) text += ` (${item.size})`;
        text += `\t₹${(item.price * item.quantity).toFixed(2)}\n`;
      });
    } else {
      text += 'No items found\n';
    }
    
    text += '\n-----------------------------\n\n';
    text += `Subtotal:\t₹${order.subtotal.toFixed(2)}\n`;
    text += `Taxes:\t\t₹${order.taxes.toFixed(2)}\n`;
    text += `TOTAL:\t\t₹${order.total.toFixed(2)}\n\n`;
    text += '========= THANK YOU =========\n';
    
    return text;
  };

  return (
    <PageTransition className="min-h-screen bg-cafe-bg">
      <AdminHeader />
      
      <main className="container mx-auto max-w-4xl p-4 pb-20">
        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="inventory" className="flex items-center gap-2">
              <List size={16} />
              Inventory
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <Receipt size={16} />
              Orders
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart4 size={16} />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center gap-2">
              <MessageSquare size={16} />
              Messages
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="inventory">
            <InventoryManagement />
          </TabsContent>
          
          <TabsContent value="orders">
            <OrderManagement onViewBill={viewOrderDetails} onOrderStatusChange={handleOrderStatusChange} />
          </TabsContent>
          
          <TabsContent value="analytics">
            <SalesAnalytics />
          </TabsContent>
          
          <TabsContent value="messages">
            <ContactMessages />
          </TabsContent>
        </Tabs>
      </main>
      
      {/* Bill Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Order #{selectedOrder?.id}</DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <>
              <BillDisplay 
                ref={billRefObject}
                order={selectedOrder}
                isGeneratingBill={isGeneratingBill}
                setIsGeneratingBill={setIsGeneratingBill}
                formatDate={formatDate}
                onClose={() => setDialogOpen(false)}
              />
              
              <DialogFooter className="mt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setDialogOpen(false)} 
                  disabled={isGeneratingBill}
                >
                  Close
                </Button>
                <Button 
                  variant="default"
                  onClick={downloadBill}
                  disabled={isGeneratingBill}
                  className="bg-cafe hover:bg-cafe-dark"
                >
                  {isGeneratingBill ? (
                    <>
                      <span className="mr-2">Generating...</span>
                      <span className="animate-spin">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                        </svg>
                      </span>
                    </>
                  ) : (
                    <>
                      <Download size={16} className="mr-2" />
                      Download Bill
                    </>
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
};

export default AdminDashboard;