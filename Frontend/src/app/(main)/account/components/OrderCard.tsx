// app/(main)/(account)/components/OrderCard.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import { FaChevronRight } from 'react-icons/fa';
import { Order, OrderStatus } from '@/types/order.interface';

interface OrderCardProps {
  order: Order;
  // THÊM PROPS MỚI
  onSeeMoreClick: (order: Order) => void;
}

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
};

const formatDateTime = (isoString: string): string => {
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${year}/${month}/${day} - ${hours}:${minutes} ${ampm}`;
};

const getStatusClasses = (status: OrderStatus): string => {
  switch (status) {
    case 'Pending':
      return 'bg-purple-100 text-purple-700';
    case 'Processing':
      return 'bg-blue-100 text-blue-700';
    case 'Delivered':
    case 'Completed':
      return 'bg-green-100 text-green-700';
    case 'Returned':
    case 'ReturnInProgress':
      return 'bg-yellow-100 text-yellow-700';
    case 'CancelledByBuyer':
    case 'CancelledBySeller':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

const OrderCard: React.FC<OrderCardProps> = ({ order, onSeeMoreClick }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
      {/* Top Bar of Card */}
      <div className="flex justify-between items-center text-sm text-gray-600 mb-4 pb-2 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span>{formatDateTime(order.OrderDate)}</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusClasses(order.OverallStatus)}`}>
            {order.OverallStatus}
          </span>
        </div>
        <div className="font-semibold text-gray-800">
          Total: {formatPrice(order.TotalAmount)}
        </div>
      </div>

      {/* Content Area - Images and Items List */}
      <div className="flex gap-4">
        {/* Product Images Section */}
        <div className="flex-shrink-0 flex flex-wrap gap-2 w-[160px] max-h-32 overflow-hidden">
          {order.items.slice(0, 6).map((item, index) => (
            <div key={item.OrderItemID} className="relative w-12 h-12 border border-gray-200 rounded-md overflow-hidden">
              <Image
                src={item.productImageURL}
                alt={item.productName}
                layout="fill"
                objectFit="cover"
                className="hover:scale-105 transition-transform duration-200"
              />
              {item.Quantity > 1 && (
                <span className="absolute top-0 right-0 bg-gray-800 text-white text-xs rounded-bl-sm px-1 leading-tight">
                  x{item.Quantity}
                </span>
              )}
            </div>
          ))}
          {order.items.length > 6 && (
            <div className="w-12 h-12 bg-gray-100 flex items-center justify-center text-xs text-gray-500 rounded-md">
                +{order.items.length - 6}
            </div>
          )}
        </div>

        {/* Items List */}
        <div className="flex-1 flex flex-wrap gap-x-8 text-sm text-gray-700">
          <ul className="list-disc list-inside space-y-1">
            {order.items.slice(0, 3).map((item, index) => (
              <li key={index} className="text-sm">
                {item.Quantity} x {item.productName}
                {item.productAttributes && item.productAttributes.length > 0 && (
                  <span className="text-gray-500 text-xs ml-1">
                    ({item.productAttributes.map(attr => `${attr.attributeName}: ${attr.attributeValue}`).join(', ')})
                  </span>
                )}
              </li>
            ))}
          </ul>
          {order.items.length > 3 && (
            <ul className="list-disc list-inside space-y-1 ml-8">
              {order.items.slice(3, 6).map((item, index) => (
                <li key={index} className="text-sm">
                  {item.Quantity} x {item.productName}
                   {item.productAttributes && item.productAttributes.length > 0 && (
                  <span className="text-gray-500 text-xs ml-1">
                    ({item.productAttributes.map(attr => `${attr.attributeName}: ${attr.attributeValue}`).join(', ')})
                  </span>
                )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* See more link (button) */}
      <div className="flex justify-end mt-4">
        {/* THAY ĐỔI TỪ LINK SANG BUTTON VÀ DÙNG ONCLICK */}
        <button
          onClick={() => onSeeMoreClick(order)}
          className="text-sm text-blue-500 hover:underline flex items-center bg-transparent border-none cursor-pointer p-0"
        >
          See more <FaChevronRight className="ml-1 text-xs" />
        </button>
      </div>
    </div>
  );
};

export default OrderCard;