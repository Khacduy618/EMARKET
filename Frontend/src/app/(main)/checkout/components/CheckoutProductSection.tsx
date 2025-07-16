

'use client';

import React from 'react';
import Image from 'next/image';
import { FaCircleQuestion, FaCommentDots } from 'react-icons/fa6';
import { Building, MessageSquare } from 'lucide-react';
import { CheckoutShopOrder } from '@/types';
import { getFullImageUrl } from '@/services/api';

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

interface CheckoutProductSectionProps {
  shopOrder: CheckoutShopOrder;
}
// Hàm tính giá cuối cùng của một sản phẩm, đã tính discount
const calculateFinalItemPrice = (price: number, originalPrice: number | null, discount: number | undefined): number => {
    // Ưu tiên giá gốc nếu có để tính discount
    const basePrice = originalPrice ?? price;
    return Math.floor(basePrice * (1 - (discount ?? 0) / 100));
}
const priceColWidth = '180px'; // Ví dụ: đủ rộng cho 2.490.000 ₫
const qtyColWidth = '200px';   // Ví dụ: đủ rộng cho số 1
const subtotalColWidth = '180px'; // Ví dụ: đủ rộng cho 2.490.000 ₫
const CheckoutProductSection: React.FC<CheckoutProductSectionProps> = ({ shopOrder }) => {
  return (
    <div className="px-4 py-3">
      {/* Shop Header */}
      <div className="flex justify-between items-center pb-3 border-b border-gray-100 mb-3">
         <div className="flex items-center gap-2 text-gray-800 text-sm flex-1">
           {shopOrder.shopLevel === 'Mall' && <span className="px-1.5 py-0.5 bg-red-500 text-white text-xs font-bold rounded">Mall</span>}
           {shopOrder.shopLevel === 'Favorite' && <span className="px-1.5 py-0.5 bg-red-500 text-white text-xs font-bold rounded">Yêu thích+</span>}
           <span className="font-semibold">{shopOrder.shopName}</span>
           <button className="flex items-center text-blue-500 hover:text-blue-600 whitespace-nowrap">
             <FaCommentDots className="mr-1" /> Chat ngay
           </button>
         </div>
         {/* Headers for columns - Sử dụng inline style hoặc custom Tailwind class để cố định width */}
         <div className="flex text-gray-600 text-xs font-semibold flex-shrink-0" style={{ width: `calc(${priceColWidth} + ${qtyColWidth} + ${subtotalColWidth} + 8px)`}}>
             <span style={{ width: priceColWidth }} className="text-right">Đơn giá</span>
             <span style={{ width: qtyColWidth }} className="text-end ml-4">Số lượng</span>
             <span style={{ width: subtotalColWidth }} className="text-right">Thành tiền</span>
         </div>
       </div>

      {/* Product Items */}
      {shopOrder.items.map(item =>
      {const finalPrice = calculateFinalItemPrice(item.price, item.originalPrice, item.product?.Discount); 
        return (
        
        <div key={item.variantId} className="flex items-start py-3 border-b border-gray-100 last:border-b-0">
          <div className="flex-shrink-0 w-16 h-16 relative mr-4 border border-gray-200 rounded-md overflow-hidden">
            <img src={getFullImageUrl(item.imageUrl)} alt={item.name} width={64} height={64} className="object-cover" />
          </div>
          <div className="flex-1 flex items-start text-sm">
            <div className="flex-1 flex flex-col pr-4">
              <p className="font-semibold text-gray-800 leading-tight">{item.name}</p>
              <p className="text-gray-600 text-xs mt-0.5">Loại: {item.classification}</p>
              {item.originalPrice && item.originalPrice > item.price && (
                <p className="text-gray-400 line-through text-xs mt-0.5 whitespace-nowrap">{formatPrice(item.originalPrice)}</p>
              )}
            </div>
            {/* Các cột giá trị - Sử dụng flex-shrink-0 và width cố định */}
            <div className="flex-shrink-0 flex items-center justify-end" style={{ width: priceColWidth }}>
              <span className="text-gray-800 whitespace-nowrap">{formatPrice((item.originalPrice ?? item.price) * (1 - (item.product?.Discount ? item.product?.Discount : 0) / 100))}</span>
            </div>
            <div className="flex-shrink-0 flex items-center justify-end" style={{ width: qtyColWidth }}>
              <span className="text-gray-800 whitespace-nowrap">{item.quantity}</span>
            </div>
            <div className="flex-shrink-0 flex items-center justify-end" style={{ width: subtotalColWidth }}>
              <span className="font-semibold text-gray-800 whitespace-nowrap">{formatPrice(finalPrice * item.quantity)}</span>
            </div>
          </div>
        </div>
      );
      } )}
    </div>
  );
};

export default CheckoutProductSection;