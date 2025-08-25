// purchase/components/OrderShippingInfo.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Order } from '@/types'; // Import Order type
import { FaCheckCircle, FaMapMarkerAlt } from 'react-icons/fa';
import { Badge } from '@/components/ui/badge';

interface OrderShippingInfoProps {
  order: Order; // Nhận toàn bộ object Order
}
// Hàm helper để dịch Payment Method
const translatePaymentMethod = (method: string) => {
    const map: { [key: string]: string } = {
        'COD': 'Thanh toán khi nhận hàng',
        'Paypal': 'PayPal',
        'VNPay': 'Cổng thanh toán VNPay'
    };
    return map[method] || method;
}

// Hàm helper để dịch Payment Status và lấy màu badge
const getPaymentStatusInfo = (status: string) => {
    switch (status.toLowerCase()) {
        case 'paid':
            return { text: 'Đã thanh toán', variant: 'default' as const };
        case 'pending':
            return { text: 'Chờ thanh toán', variant: 'outline' as const };
        case 'returned':
            return { text: 'Đã hoàn tiền', variant: 'destructive' as const };
        default:
            return { text: status, variant: 'secondary' as const };
    }
}
const OrderShippingInfo: React.FC<OrderShippingInfoProps> = ({ order }) => {
  const [showAllTracking, setShowAllTracking] = useState(false);

  // Giả sử tracking info nằm trong order.shippingTracking, nếu không có thì trả về mảng rỗng
  const trackingHistory = order.shippingTracking || []; 
  const displayedTracking = showAllTracking ? trackingHistory : trackingHistory.slice(0, 3);
  
  // Xây dựng chuỗi địa chỉ đầy đủ
const fullAddress = [order.Street, order.Ward, order.District, order.City].filter(Boolean).join(', ');
    const paymentStatusInfo = getPaymentStatusInfo(order.PaymentStatus);

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
        {/* --- PHẦN MỚI THÊM VÀO --- */}
                    <div className="mt-2 flex flex-col items-end gap-1">
                        <p className="text-gray-500">{translatePaymentMethod(order.PaymentMethod)}</p>
                        <Badge  variant={paymentStatusInfo.variant}>{paymentStatusInfo.text}</Badge>
                    </div>
                    {/* --- KẾT THÚC PHẦN MỚI --- */}
      </div>
    </div>
  );
};

export default OrderShippingInfo;