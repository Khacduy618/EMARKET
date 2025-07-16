
// app/(main)/(account)/orders/[orderId]/components/OrderProgressTracker.tsx
'use client';

import React from 'react';
// Import icons từ Fa và Fa6 để có sự đa dạng và khớp với ảnh
import { FaRegFileAlt, FaCheckCircle, FaTruck, FaBoxOpen, FaStar, FaDollarSign, FaCircle } from 'react-icons/fa';
import { OrderStatusHistory } from '@/types';

interface OrderProgressTrackerProps {
  statusHistory: OrderStatusHistory[];
}

const OrderProgressTracker: React.FC<OrderProgressTrackerProps> = ({ statusHistory }) => {
  // Hàm chọn icon dựa trên trạng thái (cập nhật để khớp ảnh)
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Đơn Hàng Đã Đặt': return <FaRegFileAlt className="text-lg" />;
      case 'Đã Xác Nhận Thông Tin Thanh Toán': return <FaDollarSign className="text-lg" />;
      case 'Đã Giao Cho ĐVVC': return <FaTruck className="text-lg" />;
      case 'Đã Nhận Được Hàng': return <FaBoxOpen className="text-lg" />;
      case 'Đánh Giá': return <FaStar className="text-lg" />;
      default: return <FaCircle className="text-sm" />;
    }
  };

  const totalSteps = statusHistory.length;
  // Tính toán khoảng cách giữa các icon. Ví dụ 5 bước => 4 khoảng trống. Mỗi khoảng 25%.
  // Total width của các icon và khoảng trống giữa chúng
  // Nếu có 1 bước, khoảng cách là 0.
  const segmentWidthPercentage = totalSteps > 1 ? 100 / (totalSteps - 1) : 0;


  return (
    <div className="bg-white rounded-sm shadow-sm border-b border-gray-100 px-6 py-6">
      {/* Container cho timeline: relative và overflow-hidden để chứa các absolute elements */}
      {/* Đã thêm padding ngang vào đây để đường nối không tràn ra ngoài padding của px-6 */}
      <div className="pb-4 pt-4 px-10">
        <div className="relative py-8"> {/* px-4 để đường nối không tràn ra ngoài div này */}
        {/* Đường nối chung (nền xám) */}
        <div className="absolute top-[10px] left-0 right-0 h-0.5 bg-gray-200 z-0"></div>

        {/* Đường nối màu xanh lá cây theo tiến độ */}
        <div className="absolute top-[10px] left-0 h-0.5 bg-green-500 z-0 transition-all duration-300"
             style={{ width: `${(statusHistory.filter(s => s.isCompleted).length > 0 ? (statusHistory.filter(s => s.isCompleted).length - 1) : 0) * segmentWidthPercentage}%` }}>
        </div>

        {/* Các nút (icon tròn) */}
        {statusHistory.map((step, index) => {
          // Vị trí của icon: 0% cho đầu tiên, 25%, 50%, 75%, 100% cho cuối cùng
          const leftPosition = index * segmentWidthPercentage;

          return (
            <div key={index} className="absolute flex flex-col items-center text-center"
                 style={{ left: `${leftPosition}%`, transform: 'translateX(-50%)', top: -10, width: `calc(${segmentWidthPercentage}% - 50px)` }}> {/* width cho text căn giữa */}
              <div className={`relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300
                              ${step.isCompleted ? 'bg-green-500 border-green-500 text-white' :
                                step.isActive ? 'bg-white border-orange-500 text-orange-500' :
                                'bg-gray-200 border-gray-200 text-gray-500'}`}>
                {getStatusIcon(step.status)}
                {step.isCompleted && step.status !== 'Đánh Giá' && (
                  <FaCheckCircle className="absolute -bottom-1 -right-1 text-green-500 text-lg bg-white rounded-full" />
                )}
                {step.status === 'Đánh Giá' && step.isActive && !step.isCompleted && (
                   <FaStar className="absolute text-orange-500 text-xl" />
                )}
                {step.status === 'Đánh Giá' && step.isCompleted && (
                  <FaStar className="absolute text-white text-xl" />
                )}
              </div>
              <p className={`text-xs mt-2 transition-colors duration-300 ${step.isActive ? 'text-orange-500 font-semibold' : step.isCompleted ? 'text-green-600 font-semibold' : 'text-gray-600'}`}>
                {step.status}
              </p>
              {(step.date || step.time) && (
                <p className="text-xs text-gray-500 mt-0.5">{step.time} {step.date}</p>
              )}
            </div>
          );
        })}
      </div>
      </div>
    </div>
  );
};

export default OrderProgressTracker;