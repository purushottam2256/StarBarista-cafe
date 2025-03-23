import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { OrderType } from '@/pages/AdminDashboard';
import { CheckCheck, X, Eye, RefreshCcw } from 'lucide-react';

interface OrderManagementProps {
  onViewBill: (order: OrderType) => void;
  onOrderStatusChange: (orderId: string, status: 'approved' | 'rejected') => void;
}

const OrderManagement: React.FC<OrderManagementProps> = ({ onViewBill, onOrderStatusChange }) => {
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeFilter, setActiveFilter] = useState<string>('pending');
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  
  // Fetch orders from Supabase
  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Use the correct Supabase query structure
      let query = supabase
        .from('orders')
        .select('*');
      
      if (activeFilter !== 'all') {
        query = query.eq('status', activeFilter);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
          
      if (error) throw error;
      
      // Parse the items field if it's stored as a string
      const parsedOrders = (data || []).map(order => ({
        ...order,
        items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items
      }));
      
      setOrders(parsedOrders);
      setLastRefreshed(new Date());
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchOrders();
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('orders_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchOrders)
      .subscribe();
    
    // Set up auto-refresh every 30 seconds
    const refreshInterval = setInterval(() => {
      console.log('Auto-refreshing orders...');
      fetchOrders();
    }, 30000); // 30 seconds
      
    return () => {
      subscription.unsubscribe();
      clearInterval(refreshInterval);
    };
  }, [activeFilter]);
  
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
  
  // Handle approval/rejection of order
  const handleStatusChange = async (orderId: string, status: 'approved' | 'rejected') => {
    try {
      // First check the current status to avoid unnecessary updates
      const { data: currentOrder, error: fetchError } = await supabase
        .from('orders')
        .select('status')
        .eq('id', orderId)
        .single();
        
      if (fetchError) throw fetchError;
      
      // If status is already set, don't update
      if (currentOrder && currentOrder.status === status) {
        toast.info(`Order is already ${status}`);
        return;
      }
      
      // Update the order status with approved_at timestamp
      const updateData = {
        status,
        approved_at: status === 'approved' ? new Date().toISOString() : null
      };
      
      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId);
      
      if (error) throw error;
      
      onOrderStatusChange(orderId, status);
      toast.success(`Order ${status} successfully`);
      
      // Refresh the orders list
      fetchOrders();
    } catch (error) {
      console.error(`Error ${status} order:`, error);
      toast.error(`Failed to ${status} order`);
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-cafe-dark">Order Management</h2>
          <p className="text-cafe-text/70">Manage and track cafe orders</p>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-xs text-cafe-text/60">Last refreshed: {getTimeSinceRefresh()}</span>
          <Button 
            variant="outline"
            size="sm"
            onClick={fetchOrders}
            disabled={loading}
            title="Refresh orders"
            className="h-8"
          >
            <RefreshCcw size={14} className={`mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-4">
        <Button 
          variant={activeFilter === 'all' ? "default" : "outline"} 
          size="sm"
          onClick={() => setActiveFilter('all')}
          className={activeFilter === 'all' ? "bg-cafe hover:bg-cafe-dark" : ""}
        >
          All Orders
        </Button>
        <Button 
          variant={activeFilter === 'pending' ? "default" : "outline"} 
          size="sm"
          onClick={() => setActiveFilter('pending')}
          className={activeFilter === 'pending' ? "bg-cafe hover:bg-cafe-dark" : ""}
        >
          Pending
        </Button>
        <Button 
          variant={activeFilter === 'approved' ? "default" : "outline"} 
          size="sm"
          onClick={() => setActiveFilter('approved')}
          className={activeFilter === 'approved' ? "bg-cafe hover:bg-cafe-dark" : ""}
        >
          Approved
        </Button>
        <Button 
          variant={activeFilter === 'completed' ? "default" : "outline"} 
          size="sm"
          onClick={() => setActiveFilter('completed')}
          className={activeFilter === 'completed' ? "bg-cafe hover:bg-cafe-dark" : ""}
        >
          Completed
        </Button>
        <Button 
          variant={activeFilter === 'rejected' ? "default" : "outline"} 
          size="sm"
          onClick={() => setActiveFilter('rejected')}
          className={activeFilter === 'rejected' ? "bg-cafe hover:bg-cafe-dark" : ""}
        >
          Rejected
        </Button>
      </div>
      
      {loading ? (
        <div className="text-center py-8">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-8">
          No {activeFilter === 'all' ? '' : activeFilter} orders found.
        </div>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <Card key={order.id} className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">Order #{order.id}</h3>
                    <Badge variant={
                      order.status === 'pending' ? 'outline' :
                      order.status === 'approved' ? 'secondary' : 'destructive'
                    }>
                      {order.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{formatDate(order.created_at)}</p>
                  <p className="mt-1">₹{order.total.toFixed(2)}</p>
                  <p className="text-sm mt-1">
                    {Array.isArray(order.items) ? order.items.length : 0} items
                  </p>
                  {order.status === 'approved' && order.approved_at && (
                    <p className="text-xs text-green-600 mt-1">
                      Approved at: {formatDate(order.approved_at)}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 w-8 p-0" 
                    onClick={() => onViewBill(order)}
                  >
                    <Eye size={16} />
                  </Button>
                  
                  {order.status === 'pending' && (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 w-8 p-0 text-green-600 hover:text-green-700" 
                        onClick={() => handleStatusChange(order.id, 'approved')}
                      >
                        <CheckCheck size={16} />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700" 
                        onClick={() => handleStatusChange(order.id, 'rejected')}
                      >
                        <X size={16} />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderManagement;