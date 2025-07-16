

// app/(main)/(account)/orders/[orderId]/components/OrderShippingInfo.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Order, ShippingTracking } from '@/types';
import { FaCheckCircle, FaMapMarkerAlt, FaQuestionCircle } from 'react-icons/fa';

interface OrderShippingInfoProps {
  order: Order;
}

const OrderShippingInfo: React.FC<OrderShippingInfoProps> = ({ order }) => {
  const [showAllTracking, setShowAllTracking] = useState(false);

  const displayedTracking = showAllTracking
    ? order.shippingTracking
    : order.shippingTracking?.slice(0, 3); // Mặc định chỉ hiển thị 3 item đầu

  return (
    <div className="bg-white rounded-sm shadow-sm border-b border-gray-100 px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold">Địa Chỉ Nhận Hàng</h2>
        <span className="text-sm text-gray-600">
            {order.shippingProvider} {order.trackingNumber && <span className="ml-2">{order.trackingNumber}</span>}
        </span>
      </div>

      {/* Địa chỉ */}
      <div className="flex items-start mb-6">
        <FaMapMarkerAlt className="text-orange-500 text-lg mt-1 mr-3 flex-shrink-0" />
        <div className="flex-1 text-sm">
          <p className="font-semibold text-gray-800">{order.ShippingFullName}</p>
          <p className="text-gray-600">({order.ShippingPhoneNumber})</p>
          {/* Sử dụng Notes cho địa chỉ chi tiết theo ảnh */}
          <p className="text-gray-600 mt-1">
            {order.Notes}
          </p>
        </div>
      </div>

      {/* Lịch sử theo dõi vận chuyển */}
      {order.shippingTracking && order.shippingTracking.length > 0 && (
        <div className="border-t border-gray-200 pt-6">
          {/* Không có tiêu đề "Lịch sử vận chuyển" trong ảnh */}
          <div className="relative border-l-2 border-green-500 ml-3 pl-4"> {/* Đổi border màu xanh lá */}
            {displayedTracking?.map((track, index) => (
              <div key={index} className="mb-4 relative last:mb-0">
                <div className={`absolute -left-4 top-0 -translate-x-1/2 w-4 h-4 rounded-full flex items-center justify-center text-white text-xs
                                ${track.status === 'Đã giao' ? 'bg-green-500' : 'bg-gray-300'}`}> {/* Điểm trên timeline */}
                    {track.status === 'Đã giao' && <FaCheckCircle className="text-sm" />} {/* Icon tích cho Đã giao */}
                </div>
                <p className={`font-semibold text-sm ${track.status === 'Đã giao' ? 'text-green-600' : 'text-gray-800'}`}>
                    {track.status} {track.location && <span className="text-gray-700 font-normal ml-1">{track.location}</span>}
                </p>
                <p className="text-gray-500 text-xs">{track.date} {track.time}</p>
              </div>
            ))}
            {order.shippingTracking.length > 3 && !showAllTracking && ( // Chỉ hiển thị "Xem thêm" nếu có nhiều hơn 3 và đang ẩn
              <div className="mt-6">
                <button onClick={() => setShowAllTracking(true)} className="text-blue-500 hover:underline text-sm">Xem thêm</button>
              </div>
            )}
            {order.shippingTracking.length > 3 && showAllTracking && ( // Chỉ hiển thị "Ẩn bớt" nếu đang hiển thị tất cả
                <div className="mt-6">
                    <button onClick={() => setShowAllTracking(false)} className="text-blue-500 hover:underline text-sm">Ẩn bớt</button>
                </div>
            )}

            {/* Đồng kiểm */}
            {/* <div className="flex items-center text-green-600 text-xs mt-4">
              <input type="checkbox" checked readOnly className="mr-2 accent-green-500" />
              <span>ĐỒNG KIỂM</span>
              <FaQuestionCircle className="ml-1 text-xs text-gray-400 cursor-pointer hover:text-gray-600" title="Chi tiết về đồng kiểm" />
              <Link href="#" className="text-blue-500 hover:underline ml-2">Tìm hiểu thêm</Link>
            </div> */}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderShippingInfo;