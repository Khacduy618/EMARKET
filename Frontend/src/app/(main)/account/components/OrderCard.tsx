'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { FaTruckFast, FaCircleQuestion, FaCommentDots, FaStore, FaChevronDown } from 'react-icons/fa6';
import { Order, OrderStatus, OrderItem } from '@/types'; // Import thêm OrderItem nếu cần
import { getFullImageUrl } from '@/services/api';
import ReturnRequestModal from './modals/ReturnRequestModal';

// --- Helper Functions ---

const formatVND = (price: number): string => {
  if (isNaN(price)) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

const formatDate = (isoString: string): string => {
  if (!isoString) return '';
  const date = new Date(isoString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

// --- Main Component ---

const OrderCard: React.FC<{ order: Order }> = ({ order }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);

  
  const handleReturnSuccess = (message: string) => {
    alert(message);
    setIsReturnModalOpen(false);
    window.location.reload();
  };

  const renderDeliveryStatus = (status: OrderStatus) => {
    switch (status) {
      case 'Rated':
        return (
          <div className="flex items-center text-green-600 font-semibold text-xs">
            {/* <FaTruckFast className="mr-1 text-sm" /> Đã đánh giá{' '} */}
            <FaCircleQuestion className="ml-1 text-xs text-gray-500 cursor-pointer hover:text-gray-700" title="Chi tiết đánh giá" />
            <span className="ml-2 pl-2 border-l border-gray-300 text-green-600 uppercase">ĐÃ ĐÁNH GIÁ</span>
          </div>
        );
      case 'Completed':
        return (
          <div className="flex items-center text-green-600 font-semibold text-xs">
            {/* <FaTruckFast className="mr-1 text-sm" /> Đã hoàn thành{' '} */}
            <FaCircleQuestion className="ml-1 text-xs text-gray-500 cursor-pointer hover:text-gray-700" title="Chi tiết hoàn thành" />
            <span className="ml-2 pl-2 border-l border-gray-300 text-green-600 uppercase">ĐÃ HOÀN THÀNH</span>
          </div>
        );
      case 'Delivered':
        return (
          <div className="flex items-center text-green-600 font-semibold text-xs">
            <FaTruckFast className="mr-1 text-sm" /> Đã Giao {' '}
            <FaCircleQuestion className="ml-1 text-xs text-gray-500 cursor-pointer hover:text-gray-700" title="Chi tiết giao hàng" />
            <span className="ml-2 pl-2 border-l border-gray-300 text-green-600 uppercase">ĐÃ GIAO</span>
          </div>
        );
      case 'Shipped':
        return (
          <div className="flex items-center text-blue-600 font-semibold text-xs">
            <FaTruckFast className="mr-1 text-sm" /> Đang vận chuyển{' '}
            <FaCircleQuestion className="ml-1 text-xs text-gray-500 cursor-pointer hover:text-gray-700" title="Chi tiết vận chuyển" />
            <span className="ml-2 pl-2 border-l border-gray-300 text-blue-500 uppercase">VẬN CHUYỂN</span>
          </div>
        );
      case 'Pending':
        return (
          <div className="flex items-center text-gray-600 font-semibold text-xs">
            <span className="ml-2 pl-2 text-gray-500 uppercase">CHỜ XÁC NHẬN</span>
          </div>
        );
      case 'Processing':
        return (
          <div className="flex items-center text-gray-600 font-semibold text-xs">
            <span className="ml-2 pl-2 text-gray-500 uppercase">ĐANG XỬ LÝ</span>
          </div>
        );
      case 'CancelledByBuyer':
      case 'CancelledBySeller':
        return (
          <div className="flex items-center text-red-600 font-semibold text-xs">
            <span className="ml-2 pl-2 border-l border-gray-300 text-red-500 uppercase">ĐÃ HỦY</span>
          </div>
        );
      case 'Returned':
      case 'ReturnInProgress':
        return (
          <div className="flex items-center text-yellow-600 font-semibold text-xs">
            <span className="ml-2 pl-2 border-l border-gray-300 text-yellow-500 uppercase">TRẢ HÀNG/HOÀN TIỀN</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center text-gray-600 font-semibold text-xs">
            <span className="ml-2 pl-2 text-gray-500 uppercase">{order.Status}</span>
          </div>
        );
    }
  };

const detailPageUrl = `/account/purchase/seller-order/${order.SellerOrderID}`;

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4 transition-shadow duration-200">
        {/* Shop Header */}
        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            {order.shopLevel === 'Mall' && (
              <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded">Mall</span>
            )}
            {order.shopLevel === 'Favorite' && (
              <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded">Yêu thích+</span>
            )}
            <h3 className="font-semibold text-gray-800 text-sm">{order.ShopName}</h3>
            <span className="text-xs text-gray-400">|</span>
            <span className="text-xs font-medium text-gray-500">Mã gói hàng: {order.SellerOrderCode}</span>
            <button className="flex items-center px-2 py-1 border border-gray-300 rounded-md text-xs text-gray-700 hover:bg-gray-100 transition-colors">
              <FaCommentDots className="mr-1 text-sm" /> Chat
            </button>
            
              <Link href={`/shop/${order.ShopID}`} className="flex items-center px-2 py-1 border border-gray-300 rounded-md text-xs text-gray-700 hover:bg-gray-100 transition-colors"><FaStore className="mr-1 text-sm" /> Xem Shop</Link> 
           
          </div>
          {renderDeliveryStatus(order.Status)} 
        </div>

        {/* Danh sách sản phẩm */}
        <Link href={detailPageUrl} className="block cursor-pointer hover:bg-gray-50/50">
          {order.items.map((item, index) => (
            <div key={item.OrderItemID} className={`flex items-start px-4 py-3 ${index < order.items.length - 1 ? 'border-b border-gray-100' : ''}`}>
              <div className="flex-shrink-0 w-14 h-14 relative mr-3 border border-gray-200 rounded-md overflow-hidden">
                <img src={getFullImageUrl(item.productImageURL)} alt={item.productName} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 flex flex-col">
                <p className="font-semibold text-gray-800 text-sm leading-tight mb-0.5">{item.productName}</p>
                <p className="text-gray-600 text-xs mt-0.5">Loại: {item.classification}</p>
                {item.OriginalPrice > item.PriceAtPurchase && (
                  <p className="text-gray-400 line-through text-xs mt-0.5 whitespace-nowrap">{formatVND(item.OriginalPrice)}</p>
                )}
                <p className="text-xs text-gray-600">x{item.Quantity}</p>
              </div>
              <div className="flex-shrink-0 text-right ml-4">
                <p className="text-base font-bold text-orange-500">{formatVND(item.PriceAtPurchase)}</p>
              </div>
            </div>
          ))}
        </Link>

        {/* Tổng tiền */}
        <div className="flex justify-end items-center px-4 pt-3 pb-3 border-t border-gray-100">
          <span className="text-gray-700 text-sm mr-3">Thành tiền (Gói hàng này):</span>
          <span className="text-xl font-bold text-orange-500">{formatVND(order.TotalAmount)}</span>
        </div>

        {/* Các nút hành động */}
        <div className="px-4 pb-4 pt-3 border-t border-gray-100 flex flex-col items-end">
          {order.Status === 'Delivered' && order.items.some(item => item.canReview) && (
            <div className="w-full text-right">
              <p className="text-xs text-gray-500 mb-1">
                Đánh giá sản phẩm trước{' '}
                <span className="text-blue-500">{formatDate(order.items[0]?.reviewDeadline || '')}</span>
              </p>
              <p className="text-xs text-gray-500 mb-3">
                Đánh giá ngay và nhận{' '}
                <span className="text-orange-500">{order.items[0]?.reviewReward || 0} Xu</span>
              </p>
            </div>
          )}

          <div className="flex gap-2 justify-end w-full">
            {order.Status === 'Delivered' && (
              <>
                {order.items.some(item => item.canReview) && (
                  <Link
                    href={`/account/review?SellerOrderID=${order.SellerOrderID}`}
                    className="bg-orange-500 text-white px-6 py-2 rounded-md text-sm font-semibold hover:bg-orange-600 transition-colors block text-center"
                  >
                    Đánh Giá
                  </Link>
                )}
                <button
                  className="bg-white text-gray-700 px-4 py-1.5 rounded-md font-semibold text-xs border border-gray-300 hover:bg-gray-100 transition-colors flex-shrink-0"
                  onClick={() => {
                      setIsReturnModalOpen(true);
                  }}
                >
                  Yêu Cầu Trả Hàng
                </button>
                <div className="relative">
                  <button
                    className="flex items-center bg-white text-gray-700 px-4 py-1.5 rounded-md font-semibold text-xs border border-gray-300 hover:bg-gray-100 transition-colors"
                    onClick={(e) => { e.preventDefault(); setIsDropdownOpen(!isDropdownOpen); }}
                  >
                    Thêm <FaChevronDown className={`ml-1 text-xs transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-md shadow-lg py-0.5 z-10">
                      <button className="block w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100">
                        Liên Hệ Người Bán
                      </button>
                      <button className="block w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100">
                        Mua Lại
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Các điều kiện khác cho các nút */}
            {(order.Status === 'Shipped' || order.Status === 'Processing' || order.Status === 'Pending') && (
              <div className="flex gap-2">
                <button className="bg-white text-gray-700 px-4 py-1.5 rounded-md font-semibold text-xs border border-gray-300 hover:bg-gray-100">Liên Hệ Người Bán</button>
                <button className="bg-white text-gray-700 px-4 py-1.5 rounded-md font-semibold text-xs border border-gray-300 hover:bg-gray-100">Hủy Đơn</button>
              </div>
            )}
            {(order.Status === 'CancelledByBuyer' || order.Status === 'CancelledBySeller' || order.Status === 'Returned' || order.Status === 'ReturnInProgress') && (
              <div className="flex gap-2">
                <button className="bg-white text-gray-700 px-4 py-1.5 rounded-md font-semibold text-xs border border-gray-300 hover:bg-gray-100">Mua Lại</button>
                <button className="bg-white text-gray-700 px-4 py-1.5 rounded-md font-semibold text-xs border border-gray-300 hover:bg-gray-100">Liên Hệ Người Bán</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Logic render Modal */}
      {isReturnModalOpen && (
        <ReturnRequestModal
          isOpen={isReturnModalOpen}
          onClose={() => setIsReturnModalOpen(false)}
          onSuccess={handleReturnSuccess}
          order={order}
         
        />
      )}
    </>
  );
};

export default OrderCard;