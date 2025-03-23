import React, { forwardRef } from 'react';
import { formatDate } from '@/utils/formatUtils';

interface BillDisplayProps {
  orderId: string;
  orderData?: any;
}

const BillDisplay = forwardRef<HTMLDivElement, BillDisplayProps>(
  ({ orderId, orderData }, ref) => {
    if (!orderData) {
      return <div>Loading...</div>;
    }
    
    // Make sure we have all required data with default values if missing
    const { 
      items = [], 
      subtotal = 0, 
      taxes = 0, 
      total = 0, 
      payment_method = 'Cash', 
      created_at = new Date().toISOString(),
      customer_name,
      room_number
    } = orderData;
    
    return (
      <div ref={ref} className="bill-content">
        <div className="flex flex-col items-center mb-4">
          <h2 className="text-lg font-bold">Barista @ Star Hospital</h2>
          <p className="text-sm text-gray-500">Address: 1, Khajaguda - Nanakramguda Rd, Hyderabad, Makthakousarali, Telangana 500089</p>
          <p className="text-sm text-gray-500">Tel:+91 9701441539 </p>
        </div>
        
        <div className="border-t border-b border-dashed border-gray-200 py-2 mb-4">
          <div className="flex justify-between text-sm">
            <span>Order #:</span>
            <span className="font-medium">{orderId}</span>
          </div>
          {customer_name && (
            <div className="flex justify-between text-sm">
              <span>Customer:</span>
              <span>{customer_name}</span>
            </div>
          )}
          {room_number && (
            <div className="flex justify-between text-sm">
              <span>Room Number:</span>
              <span>{room_number}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span>Date:</span>
            <span>{formatDate(created_at)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Payment:</span>
            <span className="capitalize">{payment_method || 'Cash'}</span>
          </div>
        </div>
        
        <table className="w-full text-sm mb-4">
          <thead className="text-left text-xs text-gray-500">
            <tr>
              <th className="pb-1">Item</th>
              <th className="pb-1 text-center">Qty</th>
              <th className="pb-1 text-right">Price</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(items) && items.map((item: any, index: number) => (
              <tr key={index}>
                <td className="py-1">
                  {item.name}
                  {item.size && <span className="text-xs text-gray-500 ml-1">({item.size})</span>}
                </td>
                <td className="py-1 text-center">{item.quantity || 1}</td>
                <td className="py-1 text-right">₹{((item.price || 0) * (item.quantity || 1)).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="border-t border-gray-200 pt-2 mb-4">
          <div className="flex justify-between text-sm">
            <span>Subtotal:</span>
            <span>₹{(typeof subtotal === 'number' ? subtotal : 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold mt-1 text-base">
            <span>Total:</span>
            <span>₹{(typeof subtotal === 'number' ? subtotal : 0).toFixed(2)}</span>
          </div>
        </div>
        
        <div className="text-center text-xs text-gray-500 mt-6">
          <p>Thank you for your visit!</p>
          <p>We hope to see you again soon at Barista @ Star Hospital.</p>
        </div>
      </div>
    );
  }
);

BillDisplay.displayName = 'BillDisplay';

export default BillDisplay;
