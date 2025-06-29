// // app/(main)/checkout/components/CheckoutShopVoucherSection.tsx
// 'use client';

// import React from 'react';
// import Link from 'next/link';
// import { FaMoneyBill } from 'react-icons/fa6';
// import { CheckoutShopOrder } from '@/types';

// const formatVND = (price: number): string => {
//   return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
// };

// interface CheckoutShopVoucherSectionProps {
//   shopOrder: CheckoutShopOrder;
//   onSelectShopVoucher: (shopId: number) => void;
//   onMessageChange: (shopId: number, message: string) => void;
//   onShippingMethodChange: (shopId: number) => void;
// }

// const CheckoutShopVoucherSection: React.FC<CheckoutShopVoucherSectionProps> = ({ shopOrder, onSelectShopVoucher, onMessageChange, onShippingMethodChange }) => {
//   return (
//     <>
//       {/* Shop Voucher Section */}
//       <div className="flex justify-between items-center px-4 pt-4 pb-2 border-b border-gray-100">
//         <div className="flex items-center text-sm text-gray-800">
//           <FaMoneyBill className="mr-2 text-green-500 text-base" /> Voucher của Shop
//         </div>
//         <div className="flex items-center gap-2 text-sm">
//           {shopOrder.shippingVoucherDiscount && shopOrder.shippingVoucherDiscount > 0 ? (
//             <span className="text-orange-500 font-semibold">- đ{formatVND(shopOrder.shippingVoucherDiscount).replace('₫', '')}K</span>
//           ) : (
//             <span className="text-gray-500"></span>
//           )}
//           <button onClick={() => onSelectShopVoucher(shopOrder.ShopID)} className="bg-orange-500 text-white px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-orange-600 transition-colors">
//              Chọn Voucher Khác
//           </button>
//         </div>
//       </div>

//       {/* Lời nhắn và Vận chuyển */}
//       <div className="px-4 py-4 grid grid-cols-2 gap-x-4 text-sm">
//         <div className="col-span-1 flex items-center">
//           <span className="text-gray-700 mr-2 whitespace-nowrap">Lời nhắn:</span>
//           <input
//             type="text"
//             placeholder="Lưu ý cho Người bán..."
//             className="border border-gray-300 rounded-md px-3 py-1.5 text-gray-700 focus:outline-none focus:border-blue-500 w-full"
//             value={shopOrder.messageToSeller}
//             onChange={(e) => onMessageChange(shopOrder.ShopID, e.target.value)}
//           />
//         </div>
//         <div className="col-span-1 flex flex-col items-end">
//           <div className="flex items-center text-gray-700 mb-1 whitespace-nowrap">
//             <span>Phương thức vận chuyển:</span>
//             <span className="font-semibold ml-1">{shopOrder.shippingMethod}</span>
//             <button onClick={() => onShippingMethodChange(shopOrder.ShopID)} className="text-blue-500 hover:text-blue-600 ml-2">Thay Đổi</button>
//           </div>
//           <div className="text-xs text-gray-500 text-right mb-1">
//             <p>
//               Đảm bảo nhận hàng từ{' '}
//               <span className="text-green-600">{shopOrder.deliveryEstimate}</span>
//             </p>
//             {shopOrder.shippingVoucherNote && <p>{shopOrder.shippingVoucherNote}</p>}
//           </div>
//           <div className="text-gray-700 font-semibold mt-2 text-right">
//             {formatVND(shopOrder.shippingFee)}
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default CheckoutShopVoucherSection;
'use client';

import React from 'react';
import { Tag } from 'lucide-react';
import { CheckoutShopOrder, Voucher } from '@/types';

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

const calculateDiscountForVoucher = (voucher: Voucher, subtotal: number): number => {
    if (!voucher || subtotal < voucher.MinOrderValue) return 0;
    let discount = 0;
    if (voucher.DiscountType === 'FixedAmount') {
        discount = voucher.DiscountValue;
    } else if (voucher.DiscountType === 'Percentage') {
        discount = subtotal * (voucher.DiscountValue / 100);
        if (voucher.MaxValueForPercentage != null && discount > voucher.MaxValueForPercentage) {
            discount = voucher.MaxValueForPercentage;
        }
    }
    return Math.round(discount);
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

  return (
    <>
      <div className="flex justify-between items-center px-4 pt-4 pb-3 border-t border-gray-100">
        <div className="flex items-center text-sm text-gray-800">
          <Tag className="mr-2 text-green-500 h-4 w-4" /> Voucher của Shop
        </div>
        <button onClick={() => onSelectShopVoucher(shopOrder.shopId)} className="text-sm text-blue-500 hover:underline">
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