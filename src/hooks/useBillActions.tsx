import { useState, useRef, RefObject } from 'react';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';

interface UseBillActionsProps {
  orderId: string;
  orderData?: {
    total?: number;
    subtotal?: number;
  };
}

export const useBillActions = ({ orderId, orderData }: UseBillActionsProps) => {
  const navigate = useNavigate();
  const { clearCart, total } = useCart();
  const [isSending, setIsSending] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const billRef = useRef<HTMLDivElement>(null);

  const handleFinish = () => {
    clearCart();
    navigate('/');
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      if (billRef.current) {
        const canvas = await html2canvas(billRef.current);
        const imageUrl = canvas.toDataURL('image/png');
        
        // Create a link and trigger download
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = `Barista-Bill-${orderId}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success('Receipt saved successfully!');
      }
    } catch (error) {
      console.error('Error generating bill image:', error);
      toast.error('Could not save receipt');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    try {
      // Get total amount from props or default to 0
      const total = typeof orderData?.total === 'number' 
        ? orderData.total 
        : (typeof orderData?.subtotal === 'number' ? orderData.subtotal : 0);
      
      // Try to use Web Share API
      if (navigator.share) {
        await navigator.share({
          title: `Barista @ Star Hospital - Bill ${orderId}`,
          text: `My bill from Barista @ Star Hospital totaling ₹${total.toFixed(2)}`,
          url: window.location.href
        });
        toast.success('Receipt shared successfully!');
      } else {
        // Fallback
        toast.info('Share option not available on this device');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error('Could not share receipt');
    }
  };

  const handleSendEmail = () => {
    setIsSending(true);
    
    // Simulate sending email to admin
    setTimeout(() => {
      setIsSending(false);
      toast.success('Bill sent to userexample@gmail.com');
    }, 1500);
  };

  return {
    billRef,
    isSending,
    isDownloading,
    handleFinish,
    handleDownload,
    handleShare,
    handleSendEmail
  };
};
