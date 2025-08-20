
'use client';

import React from 'react';
import { Tag } from 'lucide-react';
import { CheckoutShopOrder, Voucher } from '@/types';
import { calculateDiscountForVoucher } from '@/utils/calculation';
import { useSearchParams } from 'next/navigation';

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};


interface CheckoutShopVoucherSectionProps {
  shopOrder: CheckoutShopOrder;
  onSelectShopVoucher: (shopId: number) => void;
  onMessageChange: (shopId: number, message: string) => void;
  onShippingMethodChange: (shopId: number) => void;
}

const CheckoutShopVoucherSection: React.FC<CheckoutShopVoucherSectionProps> = ({ 
  shopOrder, 
  onSelectShopVoucher, 
  onMessageChange, 
  onShippingMethodChange 
}) => {
  const shopSubtotal = shopOrder.items.reduce((sum, item) => sum + item.subtotal, 0);
  const discountAmount = shopOrder.appliedVoucher 
    ? calculateDiscountForVoucher(shopOrder.appliedVoucher, shopSubtotal) 
    : 0;
 const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  return (
    <>
      <div className="flex justify-between items-center px-4 pt-4 pb-3 border-t border-gray-100">
        <div className="flex items-center text-sm text-gray-800">
          <Tag className="mr-2 text-green-500 h-4 w-4" /> Voucher của Shop
        </div>
        <button onClick={() => onSelectShopVoucher(shopOrder.shopId)} className="text-sm text-blue-500 hover:underline disabled:text-gray-500 disabled:no-underline disabled:cursor-not-allowed"
          disabled={!!orderId} > 
          {discountAmount > 0 ? (
            <span className="font-semibold text-green-600"> -{formatPrice(discountAmount)}</span>
          ) : (
            <span>Chọn Voucher</span>
          )}
        </button>
      </div>
      <div className="px-4 pt-3 pb-4 border-t border-gray-100 grid grid-cols-2 gap-x-4 text-sm">
        <div className="col-span-1 flex items-center">
          <span className="text-gray-600 mr-2 whitespace-nowrap">Lời nhắn:</span>
          <input
            type="text"
            placeholder="Lưu ý cho Người bán..."
            className="border border-gray-300 rounded-md px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 w-full text-xs"
            value={shopOrder.messageToSeller}
            onChange={(e) => onMessageChange(shopOrder.shopId, e.target.value)}
          />
        </div>
        <div className="col-span-1 flex flex-col items-end">
          <div className="flex items-center text-gray-700 mb-1 whitespace-nowrap">
            <span className="font-semibold ml-1">{shopOrder.shippingMethod}</span>
            <button onClick={() => onShippingMethodChange(shopOrder.shopId)} className="text-blue-500 hover:text-blue-600 ml-2 font-medium">Thay Đổi</button>
            <span className="text-gray-800 font-semibold ml-4">{formatPrice(shopOrder.shippingFee)}</span>
          </div>
          <div className="text-xs text-gray-500 text-right">
            <p>Nhận hàng vào {shopOrder.deliveryEstimate}</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default CheckoutShopVoucherSection;