'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link'; // Import Link để điều hướng
import { SummaryOrder } from '@/types';

// Định nghĩa kiểu dữ liệu cho một đơn hàng tóm tắt


interface OrderListModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: SummaryOrder[];
  title?: string;
}

const ORDERS_PER_PAGE = 10; // Số lượng đơn hàng hiển thị mỗi lần "Xem thêm"

const OrderListModal: React.FC<OrderListModalProps> = ({ isOpen, onClose, orders, title = "Danh sách Đơn hàng" }) => {
  // State để quản lý số lượng đơn hàng đang được hiển thị
  const [visibleCount, setVisibleCount] = useState(ORDERS_PER_PAGE);

  // Reset lại số lượng hiển thị mỗi khi modal được mở lại hoặc danh sách đơn hàng thay đổi
  useEffect(() => {
    if (isOpen) {
      setVisibleCount(ORDERS_PER_PAGE);
    }
  }, [isOpen, orders]);

  if (!isOpen) return null;

  // Lấy ra danh sách đơn hàng để hiển thị dựa trên visibleCount
  const visibleOrders = orders.slice(0, visibleCount);
  const hasMoreOrders = orders.length > visibleCount;

  const handleShowMore = () => {
    setVisibleCount(prevCount => prevCount + ORDERS_PER_PAGE);
  };

  return (
    // Lớp `bg-black/50` để làm mờ nền
    <div className="fixed inset-0 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        {/* Header (giữ nguyên) */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 flex-shrink-0">
          <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Đóng modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Thân Modal (với thanh cuộn) */}
        <div className="p-6 overflow-y-auto flex-grow">
          {orders && orders.length > 0 ? (
            <ul className="space-y-3">
              {visibleOrders.map((order) => (
                <li key={order.orderCode} className="p-3 bg-gray-50 rounded-md border border-gray-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-indigo-600">Mã ĐH: {order.orderCode}</p>
                      <p className="text-sm text-gray-700 mt-1">
                        Sản phẩm: {order.productNames.join(', ').substring(0, 100)}{order.productNames.join(', ').length > 100 ? '...' : ''}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <p className="font-medium text-gray-800">
                        {order.totalAmount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                      </p>
                      <p className="text-xs text-gray-500">
                        Ngày: {new Date(order.orderDate).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                  {/* Sửa lại nút thành thẻ <Link> */}
                  <Link 
                    href={`/account/purchase/order/${order.orderId}`} // Link đến trang chi tiết đơn hàng tổng
                    className="text-xs text-indigo-500 hover:underline mt-1 inline-block"
                  >
                    Xem chi tiết
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-center py-4">Không có đơn hàng nào để hiển thị.</p>
          )}

          {/* Nút "Xem thêm" */}
          {hasMoreOrders && (
            <div className="text-center mt-4">
              <button
                onClick={handleShowMore}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-sm font-medium"
              >
                Xem thêm {Math.min(ORDERS_PER_PAGE, orders.length - visibleCount)} đơn hàng nữa
              </button>
            </div>
          )}
        </div>

        {/* Footer (giữ nguyên) */}
        <div className="p-4 border-t border-gray-200 text-right flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-sm font-medium"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderListModal;