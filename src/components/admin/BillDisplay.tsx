import React from 'react';
import { Printer, Download, Share2, User, Building, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import Logo from '@/components/Logo';
import { OrderType } from '@/pages/AdminDashboard';

interface BillDisplayProps {
  order: OrderType;
  billRef: React.RefObject<HTMLDivElement>;
  isGeneratingBill: boolean;
  setIsGeneratingBill: React.Dispatch<React.SetStateAction<boolean>>;
  formatDate: (date: string) => string;
  onClose: () => void;
}

const BillDisplay: React.FC<BillDisplayProps> = ({
  order,
  billRef,
  isGeneratingBill,
  setIsGeneratingBill,
  formatDate,
  onClose
}) => {
  const printBill = () => {
    if (!billRef.current) return;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write('<html><head><title>Cafe Bill</title>');
      printWindow.document.write('<style>body { font-family: Arial, sans-serif; }</style>');
      printWindow.document.write('</head><body>');
      printWindow.document.write(billRef.current.innerHTML);
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.print();
    } else {
      toast.error('Unable to open print window');
    }
  };

  const downloadPDF = async () => {
    if (!billRef.current) return;
    
    setIsGeneratingBill(true);
    try {
      const canvas = await html2canvas(billRef.current);
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a5',
      });
      
      const width = pdf.internal.pageSize.getWidth();
      const height = (canvas.height * width) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, width, height);
      pdf.save(`cafe-bill-${order.id}.pdf`);
      
      toast.success('Bill downloaded as PDF');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to download PDF');
    } finally {
      setIsGeneratingBill(false);
    }
  };

  const shareBill = async () => {
    if (!billRef.current) return;
    
    try {
      const canvas = await html2canvas(billRef.current);
      const imgBlob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        }, 'image/png');
      });
      
      if (navigator.share) {
        await navigator.share({
          title: `Cafe Bill - Order #${order.id}`,
          files: [new File([imgBlob], `bill-${order.id}.png`, { type: 'image/png' })],
        });
      } else {
        toast.error('Sharing not supported on this browser');
      }
    } catch (error) {
      console.error('Error sharing bill:', error);
      toast.error('Failed to share bill');
    }
  };

  return (
    <div className="flex flex-col">
      <div ref={billRef} className="p-4 bg-white rounded-md">
        <div className="text-center mb-4">
          <div className="flex justify-center mb-2">
            <Logo withText={false} />
          </div>
          <h2 className="text-lg font-semibold">Barista @ Star Hospital</h2>
          <p className="text-sm text-gray-500">Thank you for your order!</p>
          <div className="text-xs text-gray-500 mt-1">
            <br />
            Tel: +91 9701441539
          </div>
        </div>
        
        {/* Order details - First show customer info prominently */}
        <div className="bg-amber-50 border-2 border-amber-200 rounded-md p-3 mb-3">
          <h3 className="font-semibold text-amber-800 mb-2 text-center border-b border-amber-200 pb-1">
            Delivery Details
          </h3>
          
          <div className="space-y-3">
            {/* Always show customer name field */}
            <div className="flex items-center gap-2">
              <User size={16} className="text-amber-700" />
              <span className="text-sm font-medium">Customer:</span>
              <span className="text-sm font-bold ml-auto">
                {order.customer_name || "Walk-in Customer"}
              </span>
            </div>
            
            {/* Always show room number field */}
            <div className="flex items-center gap-2">
              <Building size={16} className="text-amber-700" />
              <span className="text-sm font-medium">Room/Ward:</span>
              <span className="text-sm font-bold ml-auto">
                {order.room_number || "Counter Pickup"}
              </span>
            </div>
            
            {/* Payment method */}
            <div className="flex items-center gap-2">
              <CreditCard size={16} className="text-amber-700" />
              <span className="text-sm font-medium">Payment:</span>
              <span className="text-sm font-bold capitalize ml-auto">{order.payment_method}</span>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          <span>Order ID:</span>
          <span>{order.id.slice(0, 8).toUpperCase()}</span>
        </div>
        
        <div className="flex justify-between text-xs text-gray-500 mb-3">
          <span>Date & Time:</span>
          <span>{formatDate(order.created_at)}</span>
        </div>
        
        <div className="flex justify-between text-xs text-gray-500 mb-3">
          <span>Status:</span>
          <span className={order.status === 'completed' ? 'text-green-500 font-medium' : 'text-amber-500 font-medium'}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
        </div>
        
        {/* Rest of bill content remains the same */}
        <div className="border-t border-b border-gray-200 py-2 mb-4">
          <h3 className="font-semibold mb-2">Items</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-500">
                <th className="text-left font-normal pb-1">Item</th>
                <th className="text-right font-normal pb-1">Amount</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, index) => (
                <tr key={index}>
                  <td className="py-1">
                    {item.quantity}x {item.name}
                    {item.size && <span className="text-xs text-gray-500"> ({item.size})</span>}
                  </td>
                  <td className="text-right py-1">₹{(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>₹{order.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Taxes:</span>
            <span>₹{order.taxes.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-base pt-1.5 border-t border-gray-200">
            <span>Total:</span>
            <span>₹{order.total.toFixed(2)}</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between mt-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={printBill}
          disabled={isGeneratingBill}
        >
          <Printer size={16} className="mr-2" />
          Print
        </Button>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={downloadPDF}
          disabled={isGeneratingBill}
        >
          <Download size={16} className="mr-2" />
          {isGeneratingBill ? 'Generating...' : 'Download'}
        </Button>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={shareBill}
          disabled={isGeneratingBill || !('share' in navigator)}
        >
          <Share2 size={16} className="mr-2" />
          Share
        </Button>
      </div>
      
      <Button 
        variant="ghost" 
        className="mt-2" 
        onClick={onClose}
      >
        Close
      </Button>
    </div>
  );
};

export default BillDisplay;