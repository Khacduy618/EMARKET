// In app/(main)/(account)/purchase/components/OrderDetailContent.tsx

'use client';

import React from 'react';
import Link from 'next/link';
import { FaChevronLeft, FaStore, FaTicketAlt, FaShippingFast } from 'react-icons/fa';
import { Order, OrderStatus } from '@/types'; 
import OrderProgressTracker from './OrderProgressTracker';
import OrderShippingInfo from './OrderShippingInfo';
import { formatVND, getFullImageUrl } from '@/services/api';


const DiscountRow: React.FC<{ icon: React.ReactNode; label: string; value: number }> = ({ icon, label, value }) => (
    <div className="flex justify-between items-center w-full max-w-md text-sm">
        <span className="flex items-center text-gray-700">
            {icon}
            {label}
        </span>
        <span className="text-orange-500 font-medium">- {formatVND(value)}</span>
    </div>
);

const getStatusInVietnamese = (status: OrderStatus) => {
    const statusMap: { [key in OrderStatus]: string } = {
        Pending: 'Chờ Xác Nhận', Processing: 'Đang Xử Lý', Shipped: 'Đang Giao Hàng',
        OutForDelivery: 'Đang Vận Chuyển', Delivered: 'Đã Giao Hàng', Completed: 'Hoàn Thành',
        Rated: 'Đã Đánh Giá', CancelledByBuyer: 'Đã Hủy Bởi Bạn', CancelledBySeller: 'Đã Hủy Bởi Người Bán',
        Returned: 'Đã Trả Hàng', ReturnInProgress: 'Đang Trả Hàng/Hoàn Tiền', DeliveryFailed: 'Giao Hàng Thất Bại',
    };
    return statusMap[status] || status;
}

interface OrderDetailContentProps {
  order: Order;
}

const OrderDetailContent: React.FC<OrderDetailContentProps> = ({ order }) => {
  const isCancelled = order.Status.startsWith('Cancelled');
  
  // **LOGIC PHÂN TÍCH VOUCHER AN TOÀN VÀ ĐẦY ĐỦ**
  // let platformSaleOffDiscount = 0;
  // let platformFreeshipDiscount = 0;
  let saleOffCode: string | null = null;
  let freeShipCode: string | null = null;
  let shopVoucherCode: string | null = null;
  
  try {

    if (order.PlatformVoucherCode) {
      const platformCodes = JSON.parse(order.PlatformVoucherCode);
      saleOffCode = platformCodes.saleOff;
      freeShipCode = platformCodes.freeShip;
    }
    // Lấy mã voucher của shop từ cột 'shopvoucher'
    if(order.shopvoucher){
        const shopVoucherDetails: {shopId: number; code: string}[] = JSON.parse(order.shopvoucher);
        // Tìm voucher cho shop hiện tại
        const currentShopVoucher = shopVoucherDetails.find(v => v.shopId === order.ShopID);
        if(currentShopVoucher) {
            shopVoucherCode = currentShopVoucher.code;
        }
    }
  } catch (e) {
    console.error("Lỗi phân tích JSON voucher:", e);
  }
  
  return (
    <div className="flex flex-col h-full">
      <div className="bg-white py-4 px-6 border-b">
        <div className="container mx-auto max-w-6xl flex justify-between items-center">
            <Link href="/account/purchase" className="flex items-center text-sm text-gray-600 hover:text-orange-500">
                <FaChevronLeft className="mr-2" /> TRỞ LẠI DANH SÁCH
            </Link>
            <div className="text-sm font-semibold">
                <span className="mr-4 text-gray-800">MÃ GÓI HÀNG. {order.SellerOrderCode}</span>
                <span className="text-orange-500 uppercase">{getStatusInVietnamese(order.Status)}</span>
            </div>
        </div>
      </div>
      
      <div className="container bg-gray-50/50 mx-auto max-w-6xl py-6">
        {!isCancelled && order.orderStatusHistory && <OrderProgressTracker statusHistory={order.orderStatusHistory} />}
        {!isCancelled && <OrderShippingInfo order={order} />}
        
        <div className="bg-white rounded-md shadow-sm mt-4">
            <div className="px-6 py-3 border-b">
              <div className="flex items-center gap-2 text-sm">
                {order.shopLevel === 'Mall' && <span className="px-1.5 py-0.5 bg-red-500 text-white text-xs font-bold rounded">Mall</span>}
                <FaStore className="text-gray-500" />
                <span className="font-semibold text-gray-800">{order.ShopName}</span>
              </div>
            </div>

            {order.items.map((item) => (
              <div key={item.OrderItemID} className="px-6 py-4 flex items-start text-sm border-b last:border-b-0">
                 <img src={getFullImageUrl(item.productImageURL)} alt={item.productName} className="w-20 h-20 object-cover rounded border mr-4"/>
                 <div className="flex-1">
                     <p className="font-semibold text-gray-800">{item.productName}</p>
                     <p className="text-gray-600 text-xs mt-1">Phân loại: {item.classification}</p>
                     <p className="text-sm text-gray-800 mt-1">x{item.Quantity}</p>
                 </div>
                 <div className="text-right ml-4">
                     {item.OriginalPrice > item.PriceAtPurchase && (
                       <p className="text-gray-400 line-through text-xs">{formatVND(item.OriginalPrice)}</p>
                     )}
                     <p className="text-base font-semibold text-gray-800">{formatVND(item.PriceAtPurchase)}</p>
                 </div>
              </div>
            ))}
            
             {order.Notes && (
              <div className="px-6 py-3 border-t bg-gray-50 text-sm text-gray-700">
                <strong>Ghi chú cho Shop:</strong> {order.Notes}
              </div>
            )}
        </div>

        {/* PHẦN TÓM TẮT ĐƠN HÀNG ĐÃ SỬA LỖI */}
        <div className="bg-white rounded-md shadow-sm px-6 py-5 flex flex-col items-end mt-4">
          <div className="w-full max-w-md space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-700">Tổng tiền hàng:</span>
              <span className="font-medium">{formatVND(order.SubtotalAmount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-700">Phí vận chuyển:</span>
              <span className="font-medium">{formatVND(order.ShippingFee)}</span>
            </div>
            
            {order.ShopVoucherDiscount > 0 && (
              <DiscountRow 
                icon={<FaStore className="mr-2 text-blue-500" />} 
                label={`Voucher từ Shop ${shopVoucherCode ? `(${shopVoucherCode})` : ''}`}
                value={order.ShopVoucherDiscount}
              />
            )}
             {/* **SỬ DỤNG GIÁ TRỊ FREESHIP ĐÃ PHÂN BỔ** */}
            {order.AllocatedPlatformFreeship > 0 && (
              <DiscountRow 
                icon={<FaShippingFast className="mr-2 text-green-500" />} 
                label={`Giảm giá vận chuyển ${freeShipCode ? `(${freeShipCode})` : ''}`}
                value={order.AllocatedPlatformFreeship}
              />
            )}

            {/* **SỬ DỤNG GIÁ TRỊ SALEOFF ĐÃ PHÂN BỔ** */}
            {order.AllocatedPlatformSaleOff > 0 && (
              <DiscountRow 
                icon={<FaTicketAlt className="mr-2 text-red-500" />} 
                label={`Giảm giá E-Market ${saleOffCode ? `(${saleOffCode})` : ''}`}
                value={order.AllocatedPlatformSaleOff}
              />
            )}
          
          
            <div className="flex justify-between items-center text-orange-500 font-bold text-xl pt-3 border-t mt-3">
              <span>Thành tiền:</span>
              <span>{formatVND(order.TotalAmount)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailContent;