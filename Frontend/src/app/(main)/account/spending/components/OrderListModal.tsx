'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link'; // Import Link để điều hướng
import { SummaryOrder } from '@/types';
import { Badge } from '@/components/ui/badge';

// Định nghĩa kiểu dữ liệu cho một đơn hàng tóm tắt


interface OrderListModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: SummaryOrder[];
  title?: string;
}

const ORDERS_PER_PAGE = 10; // Số lượng đơn hàng hiển thị mỗi lần "Xem thêm"
const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status.toLowerCase()) {
        case 'delivered':
        case 'completed':
        case 'rated':
            return 'default'; // Màu xanh lá
        case 'processing':
        case 'shipped':
        case 'outfordelivery':
            return 'secondary'; // Màu xanh dương/xám
        case 'cancelledbybuyer':
        case 'cancelledbyseller':
        case 'failed':
            return 'destructive'; // Màu đỏ
        case 'pending':
        default:
            return 'outline'; // Màu xám
    }
};
const getPaymentStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status.toLowerCase()) {
        case 'paid':
            return 'default';
        case 'pending':
            return 'outline';
        case 'returned':
        case 'refunded':
            return 'destructive';
        default:
            return 'secondary';
    }
}
const translateStatus = (status: string): string => {
    const statusMap: { [key: string]: string } = {
        'Pending': 'Chờ xử lý',
        'Processing': 'Đang xử lý',
        'Shipped': 'Đã gửi hàng',
        'OutForDelivery': 'Đang giao',
        'Delivered': 'Đã giao',
        'Completed': 'Hoàn thành',
        'Rated': 'Đã đánh giá',
        'CancelledByBuyer': 'Đã hủy bởi người mua',
        'CancelledBySeller': 'Đã hủy bởi người bán',
        'Returned': 'Đã trả hàng',
        'ReturnInProgress': 'Đang trả hàng',
        'Failed': 'Thất bại'
    };
    return statusMap[status] || status; // Trả về giá trị gốc nếu không tìm thấy
};
// --- HÀM MỚI ĐỂ DỊCH TRẠNG THÁI THANH TOÁN ---
const translatePaymentStatus = (paymentStatus: string): string => {
    const paymentStatusMap: { [key: string]: string } = {
        'Pending': 'Chờ thanh toán',
        'Paid': 'Đã thanh toán',
        'Returned': 'Đã trả hàng', // Giữ nguyên hoặc có thể đổi thành "Đã hoàn tiền" tùy logic
        'Refunded': 'Đã hoàn tiền' // Thêm trạng thái này nếu có
    };
    return paymentStatusMap[paymentStatus] || paymentStatus;
};
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

       <div className="p-6 overflow-y-auto flex-grow">
          {orders && orders.length > 0 ? (
            <ul className="space-y-4">
              {visibleOrders.map((order) => (
                <li key={order.sellerOrderCode} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-grow">
                      <p className="font-semibold text-indigo-700">Mã gói hàng: {order.sellerOrderCode}</p>
                      <p className="text-sm text-gray-600 font-medium">{order.shopName}</p>
                      <p className="text-sm text-gray-700 mt-1">
                        Sản phẩm: {order.productNames.join(', ').substring(0, 100)}{order.productNames.join(', ').length > 100 ? '...' : ''}
                      </p>
                      {/* **THÊM HIỂN THỊ TRẠNG THÁI** */}
                      <div className="flex items-center gap-2 mt-2">
                          <Badge variant={getStatusBadgeVariant(order.status)}>{translateStatus(order.status)}</Badge>
                          <Badge variant={getPaymentStatusBadgeVariant(order.paymentStatus)}>{translatePaymentStatus(order.paymentStatus)}</Badge>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <p className="font-semibold text-gray-900 text-lg">
                        {order.totalAmount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Ngày đặt: {new Date(order.orderDate).toLocaleDateString('vi-VN')}
                      </p>
                       {/* **SỬA LẠI LINK ĐIỀU HƯỚNG** */}
                      <Link 
                        href={`/account/purchase/seller-order/${order.sellerOrderId}`} 
                        className="text-sm text-indigo-600 hover:underline mt-2 inline-block font-medium"
                      >
                        Xem chi tiết
                      </Link>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-center py-4">Không có gói hàng nào để hiển thị.</p>
          )}

          {hasMoreOrders && (
            <div className="text-center mt-6">
              <button
                onClick={handleShowMore}
                className="px-4 py-2 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 transition-colors text-sm font-medium"
              >
                Xem thêm {Math.min(ORDERS_PER_PAGE, orders.length - visibleCount)}
              </button>
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-gray-200 text-right flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors font-semibold"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderListModal;