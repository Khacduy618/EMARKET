// app/(main)/checkout/components/CheckoutProductSection.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaCircleQuestion, FaCommentDots } from 'react-icons/fa6';
import { CheckoutShopOrder, CheckoutProductItem } from '@/types';

const formatVND = (price: number): string => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

interface CheckoutProductSectionProps {
  shopOrder: CheckoutShopOrder;
}

const CheckoutProductSection: React.FC<CheckoutProductSectionProps> = ({ shopOrder }) => {
  // Xác định chiều rộng các cột giá trị
  const priceColWidth = '200px'; // Ví dụ: đủ rộng cho 2.490.000 ₫
  const qtyColWidth = '100px';   // Ví dụ: đủ rộng cho số 1
  const subtotalColWidth = '200px'; // Ví dụ: đủ rộng cho 2.490.000 ₫

  return (
    <div className="px-4 py-3">
      {/* Shop Header */}
      <div className="flex justify-between items-center pb-3 border-b border-gray-100 mb-3">
        <div className="flex items-center gap-2 text-gray-800 text-sm flex-1"> {/* flex-1 để shop info chiếm hết không gian */}
          {shopOrder.shopLevel === 'Mall' && <span className="px-1.5 py-0.5 bg-red-500 text-white text-xs font-bold rounded">Mall</span>}
          {shopOrder.shopLevel === 'Yêu thích+' && <span className="px-1.5 py-0.5 bg-red-500 text-white text-xs font-bold rounded">Yêu thích+</span>}
          <span className="font-semibold">{shopOrder.shopName}</span>
          <button className="flex items-center text-blue-500 hover:text-blue-600 whitespace-nowrap"> {/* whitespace-nowrap */}
            <FaCommentDots className="mr-1" /> Chat ngay
          </button>
        </div>
        {/* Headers for columns - Sử dụng inline style hoặc custom Tailwind class để cố định width */}
        <div className="flex text-gray-600 text-xs font-semibold flex-shrink-0 justify-end" style={{ width: `calc(${priceColWidth} + ${qtyColWidth} + ${subtotalColWidth} + 50px)`}}> {/* Total width for 3 cols + gap */}
            <span style={{ width: priceColWidth }} className="text-end">Đơn giá</span>
            <span style={{ width: qtyColWidth }} className="text-center ms-4">Số lượng</span> {/* Giảm gap giữa các header */}
            <span style={{ width: subtotalColWidth }} className="text-right">Thành tiền</span>
        </div>
      </div>

      {/* Product Items */}
      {shopOrder.items.map(item => (
        <div key={item.VariantID} className="flex items-start py-3 border-b border-gray-100 last:border-b-0"> {/* items-start để tiêu đề sản phẩm căn trên cùng */}
          <div className="flex-shrink-0 w-16 h-16 relative mr-4 border border-gray-200 rounded-md overflow-hidden">
            <Image src={item.productImageURL} alt={item.productName} width={64} height={64} className="object-cover" />
          </div>
          <div className="flex-1 flex items-start text-sm"> {/* flex items-start cho hàng chứa tên/giá/số lượng */}
            <div className="flex-1 flex flex-col pr-4"> {/* pr-4 để tách tên sản phẩm khỏi cột đơn giá */}
              <p className="font-semibold text-gray-800 leading-tight">{item.productName}</p>
              <p className="text-gray-600 text-xs mt-0.5">Loại: {item.classification}</p>
              {item.originalPrice && item.originalPrice > item.price && (
                <p className="text-gray-400 line-through text-xs mt-0.5 whitespace-nowrap">{formatVND(item.originalPrice)}</p>
              )}
            </div>
            {/* Các cột giá trị - Sử dụng flex-shrink-0 và width cố định */}
            <div className="flex-shrink-0 flex items-center justify-end" style={{ width: priceColWidth }}> {/* justify-end cho text-right */}
              <span className="text-gray-800 whitespace-nowrap">{formatVND(item.price)}</span>
            </div>
            <div className="flex-shrink-0 flex items-center ms-4 justify-center" style={{ width: qtyColWidth }}> {/* justify-center cho text-center */}
              <span className="text-gray-800 whitespace-nowrap">{item.quantity}</span>
            </div>
            <div className="flex-shrink-0 flex items-center justify-end" style={{ width: subtotalColWidth }}> {/* justify-end cho text-right */}
              <span className="font-semibold text-gray-800 whitespace-nowrap">{formatVND(item.subtotal)}</span>
            </div>
          </div>
        </div>
      ))}

      {/* Product Insurance (if applicable) */}
      {shopOrder.items.some(item => item.hasInsurance) && (
        <div className="px-4 pt-3 pb-3 border-b border-gray-100">
          {shopOrder.items.filter(item => item.hasInsurance).map((item, idx) => (
            <div key={idx} className="flex items-center text-sm text-gray-600 mb-2 last:mb-0">
              <input type="checkbox" checked={item.hasInsurance} readOnly className="mr-2 accent-orange-500" />
              <span>Bảo hiểm thiết bị điện tử</span>
              <FaCircleQuestion className="ml-1 text-xs text-gray-400 cursor-pointer hover:text-gray-600" title={item.insuranceDescription} />
              {item.insuranceLearnMoreLink && (
                <Link href={item.insuranceLearnMoreLink} className="text-blue-500 hover:underline ml-1">Tìm hiểu thêm</Link>
              )}
              {/* Căn chỉnh cột cho Bảo hiểm - Sử dụng flex-shrink-0 và width cố định */}
              <div className="flex-1 flex items-center justify-end" style={{ width: `calc(${priceColWidth} + ${qtyColWidth} + ${subtotalColWidth} + 8px)`}}> {/* Chiếm hết phần còn lại, căn chỉnh theo cột */}
                <span className="text-gray-800 whitespace-nowrap" style={{ width: priceColWidth, textAlign: 'center' }}>{formatVND(item.insurancePrice || 0)}</span>
                <span className="text-gray-800 whitespace-nowrap" style={{ width: qtyColWidth, textAlign: 'center' }}>1</span>
                <span className="font-semibold text-gray-800 whitespace-nowrap" style={{ width: subtotalColWidth, textAlign: 'right' }}>{formatVND(item.insurancePrice || 0)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CheckoutProductSection;