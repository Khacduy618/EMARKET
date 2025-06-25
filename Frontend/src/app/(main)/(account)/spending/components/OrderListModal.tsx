// (account)/spending/components/OrderListModal.tsx
'use client';
import React from 'react';

// Định nghĩa kiểu dữ liệu cho một đơn hàng tóm tắt
interface SummaryOrder {
  orderCode: string;
  productNames: string[]; // Có thể là tên sản phẩm đầu tiên hoặc danh sách tên rút gọn
  totalAmount: number;
  orderDate: string; // Hoặc Date object
}

interface OrderListModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: SummaryOrder[]; // Mảng các đơn hàng cần hiển thị
  title?: string;
}

const OrderListModal: React.FC<OrderListModalProps> = ({ isOpen, onClose, orders, title = "Danh sách Đơn hàng" }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
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

        <div className="p-6 overflow-y-auto">
          {orders && orders.length > 0 ? (
            <ul className="space-y-3">
              {orders.map((order, index) => (
                <li key={order.orderCode + index} className="p-3 bg-gray-50 rounded-md border border-gray-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-indigo-600">Mã ĐH: {order.orderCode}</p>
                      <p className="text-sm text-gray-700 mt-1">
                        Sản phẩm: {order.productNames.join(', ').substring(0, 100)}{order.productNames.join(', ').length > 100 ? '...' : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-800">
                        {order.totalAmount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                      </p>
                      <p className="text-xs text-gray-500">
                        Ngày: {new Date(order.orderDate).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                  {/* Bạn có thể thêm nút "Xem chi tiết" ở đây để dẫn đến trang chi tiết đơn hàng */}
                  {/* <a href={`/account/purchase/${order.orderCode}`} className="text-xs text-indigo-500 hover:underline mt-1 inline-block">Xem chi tiết</a> */}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-center py-4">Không có đơn hàng nào để hiển thị.</p>
          )}
        </div>

        <div className="p-4 border-t border-gray-200 text-right">
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