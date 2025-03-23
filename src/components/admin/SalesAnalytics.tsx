import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  PieChart, 
  LineChart,
  Calendar, 
  TrendingUp, 
  Download, 
  Filter,
  DollarSign,
  Coffee,
  ShoppingBag
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const SalesAnalytics = () => {
  const [period, setPeriod] = useState('today');
  const [salesData, setSalesData] = useState<any>(null);
  const [topSellingItems, setTopSellingItems] = useState<any[]>([]);
  const [revenueByCategory, setRevenueByCategory] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [salesTrend, setSalesTrend] = useState<any>(null);
  
  // Fetch analytics data based on selected period
  useEffect(() => {
    fetchSalesAnalytics();
  }, [period]);
  
  const fetchSalesAnalytics = async () => {
    setIsLoading(true);
    try {
      // Calculate date range based on period
      const { startDate, endDate } = getDateRange(period);
      
      // Fetch total sales from Supabase
      const { data: salesData, error: salesError } = await supabase
        .from('orders')
        .select('id, total, created_at, items, payment_method, status')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .eq('status', 'approved');
      
      if (salesError) throw salesError;

      // Process data for analytics
      const totalRevenue = salesData?.reduce((sum, order) => sum + order.total, 0) || 0;
      const orderCount = salesData?.length || 0;
      const avgOrderValue = orderCount ? totalRevenue / orderCount : 0;
      
      // Process items data for top selling products
      const itemsMap = new Map();
      const categoryMap = new Map();
      
      salesData?.forEach(order => {
        order.items.forEach((item: any) => {
          // Track item sales
          const itemId = item.id;
          const itemName = item.name;
          const itemQty = item.quantity;
          const itemPrice = item.price * item.quantity;
          const itemCategory = item.category || 'uncategorized';
          
          // Update items map
          if (itemsMap.has(itemId)) {
            const existingItem = itemsMap.get(itemId);
            itemsMap.set(itemId, {
              ...existingItem,
              quantity: existingItem.quantity + itemQty,
              revenue: existingItem.revenue + itemPrice
            });
          } else {
            itemsMap.set(itemId, {
              id: itemId,
              name: itemName,
              quantity: itemQty,
              revenue: itemPrice,
              category: itemCategory
            });
          }
          
          // Update category map
          if (categoryMap.has(itemCategory)) {
            categoryMap.set(itemCategory, categoryMap.get(itemCategory) + itemPrice);
          } else {
            categoryMap.set(itemCategory, itemPrice);
          }
        });
      });
      
      // Sort items by quantity for top selling items
      const topItems = Array.from(itemsMap.values())
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);
      
      // Format category data for pie chart
      const categoryData = {
        labels: Array.from(categoryMap.keys()),
        datasets: [{
          label: 'Revenue by Category',
          data: Array.from(categoryMap.values()),
          backgroundColor: [
            '#926845', 
            '#B87333', 
            '#CD7F32', 
            '#A47551', 
            '#C19A6B',
            '#D2B48C'
          ],
        }]
      };
      
      // Get daily sales trend for the period
      const trendData = await getDailySalesTrend(startDate, endDate);
      
      setSalesData({
        totalRevenue,
        orderCount,
        avgOrderValue
      });
      setTopSellingItems(topItems);
      setRevenueByCategory(categoryData);
      setSalesTrend(trendData);
      
    } catch (error) {
      console.error("Error fetching sales analytics:", error);
      toast.error("Failed to load sales analytics");
      
      // Use mock data for development if needed
      setMockData();
    } finally {
      setIsLoading(false);
    }
  };
  
  const getDateRange = (period: string) => {
    const endDate = new Date();
    let startDate = new Date();
    
    switch (period) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'yesterday':
        startDate.setDate(startDate.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
        endDate.setDate(endDate.getDate() - 1);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setHours(0, 0, 0, 0); // Default to today
    }
    
    return { startDate, endDate };
  };
  
  const getDailySalesTrend = async (startDate: Date, endDate: Date) => {
    try {
      const { data: salesData, error } = await supabase
        .from('orders')
        .select('total, created_at')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .eq('status', 'approved');
      
      if (error) throw error;
      
      // Group by date
      const salesByDate = salesData?.reduce((acc: any, order) => {
        const date = new Date(order.created_at).toLocaleDateString();
        if (!acc[date]) {
          acc[date] = 0;
        }
        acc[date] += order.total;
        return acc;
      }, {}) || {};
      
      // Fill in missing dates in range
      const dateLabels = [];
      const salesValues = [];
      
      let currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        const dateStr = currentDate.toLocaleDateString();
        dateLabels.push(dateStr);
        salesValues.push(salesByDate[dateStr] || 0);
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      return {
        labels: dateLabels,
        datasets: [{
          label: 'Daily Sales',
          data: salesValues,
          borderColor: '#926845',
          backgroundColor: 'rgba(146, 104, 69, 0.2)',
          tension: 0.3
        }]
      };
    } catch (error) {
      console.error("Error getting sales trend:", error);
      return null;
    }
  };
  
  const setMockData = () => {
    setSalesData({
      totalRevenue: 15760,
      orderCount: 42,
      avgOrderValue: 375.24
    });
    
    setTopSellingItems([
      { id: 1, name: 'Cappuccino', quantity: 28, revenue: 3360 },
      { id: 2, name: 'Espresso', quantity: 22, revenue: 2200 },
      { id: 3, name: 'Chocolate Cake', quantity: 15, revenue: 1800 },
      { id: 4, name: 'Cold Brew', quantity: 12, revenue: 1680 },
      { id: 5, name: 'Croissant', quantity: 10, revenue: 800 }
    ]);
    
    setRevenueByCategory({
      labels: ['Coffee', 'Desserts', 'Food', 'Cold Beverages'],
      datasets: [{
        label: 'Revenue by Category',
        data: [8500, 3200, 2800, 1260],
        backgroundColor: ['#926845', '#B87333', '#CD7F32', '#A47551'],
      }]
    });
    
    setSalesTrend({
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
        label: 'Daily Sales',
        data: [1800, 2200, 1950, 2400, 2600, 2800, 2010],
        borderColor: '#926845',
        backgroundColor: 'rgba(146, 104, 69, 0.2)',
        tension: 0.3
      }]
    });
  };
  
  const exportCSV = () => {
    if (!salesData) return;
    
    // Create CSV content
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Add header
    csvContent += "Report Period: " + period + "\r\n\r\n";
    csvContent += "Total Revenue,Order Count,Average Order Value\r\n";
    csvContent += `${salesData.totalRevenue},${salesData.orderCount},${salesData.avgOrderValue.toFixed(2)}\r\n\r\n`;
    
    // Add top selling items
    csvContent += "Top Selling Items\r\n";
    csvContent += "Name,Quantity,Revenue\r\n";
    topSellingItems.forEach(item => {
      csvContent += `${item.name},${item.quantity},${item.revenue}\r\n`;
    });
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sales-report-${period}-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-cafe-dark">Sales Analytics</h2>
        
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="week">Last 7 days</SelectItem>
              <SelectItem value="month">Last 30 days</SelectItem>
              <SelectItem value="year">Last 365 days</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={exportCSV} disabled={!salesData}>
            <Download size={16} className="mr-2" />
            Export
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="h-80 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cafe mx-auto mb-4"></div>
            <p className="text-cafe-text">Loading sales data...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Key metrics cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium text-muted-foreground">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <DollarSign className="mr-2 h-5 w-5 text-cafe" />
                  <div className="text-2xl font-bold">
                    ₹{salesData?.totalRevenue?.toLocaleString() || '0'}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium text-muted-foreground">Order Count</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <ShoppingBag className="mr-2 h-5 w-5 text-cafe" />
                  <div className="text-2xl font-bold">
                    {salesData?.orderCount || '0'}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium text-muted-foreground">Average Order</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5 text-cafe" />
                  <div className="text-2xl font-bold">
                    ₹{salesData?.avgOrderValue?.toFixed(2) || '0.00'}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Sales Trend</CardTitle>
                <CardDescription>
                  Revenue trend for the selected period
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {salesTrend ? (
                  <Line 
                    data={salesTrend} 
                    options={{
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true
                        }
                      }
                    }} 
                  />
                ) : (
                  <div className="h-full flex items-center justify-center">No data available</div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Category</CardTitle>
                <CardDescription>
                  Sales distribution across menu categories
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center">
                {revenueByCategory ? (
                  <div className="h-64 w-64">
                    <Pie 
                      data={revenueByCategory} 
                      options={{ 
                        maintainAspectRatio: true,
                        plugins: {
                          legend: {
                            position: 'right'
                          }
                        }
                      }} 
                    />
                  </div>
                ) : (
                  <div>No category data available</div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Top selling items */}
          <Card>
            <CardHeader>
              <CardTitle>Top Selling Items</CardTitle>
              <CardDescription>
                Best performing menu items by quantity sold
              </CardDescription>
            </CardHeader>
            <CardContent>
              {topSellingItems.length > 0 ? (
                <div className="space-y-4">
                  {topSellingItems.map((item, index) => (
                    <div key={item.id} className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-amber-50 flex items-center justify-center mr-3">
                        <Coffee size={20} className="text-cafe" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{item.name}</div>
                        <div className="text-xs text-muted-foreground">Qty: {item.quantity}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">₹{item.revenue}</div>
                        <div className="text-xs text-muted-foreground">Revenue</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No sales data available for this period
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default SalesAnalytics;