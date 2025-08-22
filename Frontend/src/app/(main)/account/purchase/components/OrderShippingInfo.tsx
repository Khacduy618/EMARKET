// purchase/components/OrderShippingInfo.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Order } from '@/types'; // Import Order type
import { FaCheckCircle, FaMapMarkerAlt } from 'react-icons/fa';

interface OrderShippingInfoProps {
  order: Order; // Nhận toàn bộ object Order
}

const OrderShippingInfo: React.FC<OrderShippingInfoProps> = ({ order }) => {
  const [showAllTracking, setShowAllTracking] = useState(false);

  // Giả sử tracking info nằm trong order.shippingTracking, nếu không có thì trả về mảng rỗng
  const trackingHistory = order.shippingTracking || []; 
  const displayedTracking = showAllTracking ? trackingHistory : trackingHistory.slice(0, 3);
  
  // Xây dựng chuỗi địa chỉ đầy đủ
const fullAddress = [order.Street, order.Ward, order.District, order.City].filter(Boolean).join(', ');

  return (
    <div className="bg-white rounded-sm shadow-sm border-b px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold">Địa Chỉ Nhận Hàng</h2>
        <span className="text-sm text-gray-600">
          {order.ShippingCarrier || 'Giao Hàng Nhanh'}{' '}
          {order.TrackingCode && <span className="ml-2 font-medium">{order.TrackingCode}</span>}
        </span>
      </div>

      <div className="flex items-start">
        <FaMapMarkerAlt className="text-orange-500 text-lg mt-1 mr-4 flex-shrink-0" />
        <div className="flex-1 text-sm">
          <p className="font-semibold text-gray-800">{order.ShippingFullName}</p>
          <p className="text-gray-600">{order.ShippingPhoneNumber}</p>
          <p className="text-gray-600 mt-1">{fullAddress}</p>
        </div>
      </div>
    </div>
  );
};

export default OrderShippingInfo;