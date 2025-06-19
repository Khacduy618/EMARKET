// app/(main)/(account)/components/OrderDetailsModal.tsx
'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import { FaTimes } from 'react-icons/fa'; // Icon X cho nút đóng
import { Order, OrderItem } from '@/types/order.interface';

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
};

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ isOpen, onClose, order }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close modal on escape key press
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // If modal is not open or no order selected, don't render
  if (!isOpen || !order) return null;

  return (
    <>
    <div
      className="fixed inset-0 flex mt-[100px] items-center justify-center z-50 p-4"
      onClick={onClose} // Close when clicking outside modal content
    >
      <div
        ref={modalRef}
        className="bg-white  rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] text-black overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal content
      >
        <div className="rounded-lg p-6 shadow-inner w-full">
            {/* Close Button */}
            <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-lg p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
            <FaTimes />
            </button>

            {/* Modal Header */}
            <h2 className="text-xl font-bold mb-4 border-b pb-2">Order Details - #{order.OrderCode}</h2>

            {/* Order Summary (Optional, but good to include) */}
            <div className="mb-6 text-sm">
            <p><strong>Order Date:</strong> {new Date(order.OrderDate).toLocaleDateString()}</p>
            <p><strong>Total Amount:</strong> {formatPrice(order.TotalAmount)}</p>
            <p><strong>Status:</strong> {order.OverallStatus}</p>
            </div>

            {/* List of Order Items */}
            <div className="space-y-4">
            <h3 className="font-semibold text-gray-700 text-lg mb-3">Items ({order.items.length})</h3>
            {order.items.map((item) => (
                <div key={item.OrderItemID} className="flex items-center border border-gray-200 rounded-lg p-3">
                <div className="flex-shrink-0 w-20 h-20 relative mr-4 border border-gray-200 rounded-md overflow-hidden">
                    <Image
                    src={item.productImageURL}
                    alt={item.productName}
                    layout="fill"
                    objectFit="cover"
                    />
                </div>
                <div className="flex-1">
                    <p className="font-semibold text-gray-800">{item.productName}</p>
                    <p className="text-sm text-gray-600">Quantity: {item.Quantity}</p>
                    <p className="text-sm text-gray-600">Price: {formatPrice(item.PriceAtPurchase)}</p>
                    {item.productAttributes && item.productAttributes.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                        {item.productAttributes.map(attr => `${attr.attributeName}: ${attr.attributeValue}`).join(', ')}
                    </p>
                    )}
                    {item.ReturnStatus !== 'None' && (
                    <p className="text-xs text-yellow-600 mt-1">Return Status: {item.ReturnStatus}</p>
                    )}
                </div>
                <div className="flex-shrink-0 text-right">
                    <p className="font-semibold text-gray-800">{formatPrice(item.Subtotal)}</p>
                </div>
                </div>
            ))}
            </div>

            {/* Footer Summary (Optional) */}
            <div className="mt-6 pt-4 border-t border-gray-200 text-right text-sm">
            <p>Subtotal: {formatPrice(order.SubtotalAmount)}</p>
            <p>Shipping Fee: {formatPrice(order.ShippingFee)}</p>
            {order.DiscountAmount > 0 && <p>Discount: -{formatPrice(order.DiscountAmount)}</p>}
            <p className="text-lg font-bold mt-2">Total: {formatPrice(order.TotalAmount)}</p>
            </div>
        </div>
      </div>
    </div>
    </>
    
  );
};

export default OrderDetailsModal;