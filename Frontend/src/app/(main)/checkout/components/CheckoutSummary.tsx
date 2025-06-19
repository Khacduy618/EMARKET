// // app/(main)/checkout/components/CheckoutSummary.tsx
// import React from 'react';
// import Link from 'next/link';
// import { CheckoutSummaryDetails } from '@/types'; // Lấy types từ '@/types'

// const formatVND = (price: number): string => {
//   return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
// };

// interface CheckoutSummaryProps {
//   summary: CheckoutSummaryDetails;
// }

// const CheckoutSummary: React.FC<CheckoutSummaryProps> = ({ summary }) => {
//   return (
//     <>
//       <div className="sticky container bottom-0 left-0 rounded-lg bg-white shadow-lg border-t border-gray-200 py-4 px-6 z-20">
//         <div className="container mx-auto max-w-6xl flex justify-end items-center">
//           <div className="flex-1 grid grid-cols-2 gap-y-2 text-sm text-gray-700 pr-10">
//             <span className="col-span-1 text-right">Tổng tiền hàng:</span>
//             <span className="col-span-1 text-right">{formatVND(summary.totalProductsPrice)}</span>

//             <span className="col-span-1 text-right">Tổng tiền phí vận chuyển:</span>
//             <span className="col-span-1 text-right">{formatVND(summary.totalShippingFee)}</span>

//             <span className="col-span-1 text-right">Tổng cộng Voucher giảm giá:</span>
//             <span className="col-span-1 text-right text-orange-500 font-semibold">-{formatVND(summary.totalVoucherDiscount)}</span>

//             {summary.totalShopeeCoinsDiscount > 0 && (
//               <>
//                 <span className="col-span-1 text-right">Giảm giá từ Shopee Xu:</span>
//                 <span className="col-span-1 text-right text-orange-500 font-semibold">-{formatVND(summary.totalShopeeCoinsDiscount)}</span>
//               </>
//             )}

//             <span className="col-span-1 text-right text-base font-bold mt-2">Tổng thanh toán:</span>
//             <span className="col-span-1 text-right text-3xl font-bold text-orange-500 mt-2">{formatVND(summary.totalPayment)}</span>
//           </div>
//           <button className="bg-orange-500 text-white px-10 py-3 rounded-md text-base font-semibold hover:bg-orange-600 transition-colors flex-shrink-0">
//             Đặt hàng
//           </button>
//         </div>
//         {/* Thông báo "Nhấn Đặt hàng..." */}
//         <div className="py-2 px-6 z-10 text-xs text-gray-500 text-center">
//           <p>Nhấn "Đặt hàng" đồng nghĩa với việc bạn đồng ý với <Link href="#" className="text-blue-500 hover:underline">Điều khoản Emarket</Link></p>
//         </div>
//       </div>
//     </>
//   );
// };

// export default CheckoutSummary;
// app/(main)/checkout/components/CheckoutSummary.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { CheckoutSummaryDetails } from '@/types';

const formatVND = (price: number): string => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

interface CheckoutSummaryProps {
  summary: CheckoutSummaryDetails;
  onPlaceOrder: () => void; // Bắt buộc phải có hàm xử lý đặt hàng
}

const CheckoutSummary: React.FC<CheckoutSummaryProps> = ({ summary, onPlaceOrder }) => {
  return (
    <>
      <div className="sticky bottom-0 left-0 container bg-white shadow-lg border-t border-gray-200 py-4 px-6 z-20">
        <div className="container mx-auto max-w-6xl flex justify-end items-center">
          <div className="flex-1 grid grid-cols-2 gap-y-2 text-sm text-gray-700 pr-10">
            <span className="col-span-1 text-right">Tổng tiền hàng:</span>
            <span className="col-span-1 text-right">{formatVND(summary.totalProductsPrice)}</span>

            <span className="col-span-1 text-right">Tổng tiền phí vận chuyển:</span>
            <span className="col-span-1 text-right">{formatVND(summary.totalShippingFee)}</span>

            <span className="col-span-1 text-right">Tổng cộng Voucher giảm giá:</span>
            <span className="col-span-1 text-right text-orange-500 font-semibold">-{formatVND(summary.totalVoucherDiscount)}</span>

            {summary.totalShopeeCoinsDiscount > 0 && (
              <>
                <span className="col-span-1 text-right">Giảm giá từ Shopee Xu:</span>
                <span className="col-span-1 text-right text-orange-500 font-semibold">-{formatVND(summary.totalShopeeCoinsDiscount)}</span>
              </>
            )}

            <span className="col-span-1 text-right text-base font-bold mt-2">Tổng thanh toán:</span>
            <span className="col-span-1 text-right text-3xl font-bold text-orange-500 mt-2">{formatVND(summary.totalPayment)}</span>
          </div>
          <button
            onClick={onPlaceOrder}
            className="bg-orange-500 text-white px-10 py-3 rounded-md text-base font-semibold hover:bg-orange-600 transition-colors flex-shrink-0"
          >
            Đặt hàng
          </button>
        </div>
        {/* Thông báo "Nhấn Đặt hàng..." */}
      <div className=" text-xs text-gray-500 text-center">
        <p>Nhấn "Đặt hàng" đồng nghĩa với việc bạn đồng ý với <Link href="#" className="text-blue-500 hover:underline">Điều khoản Shopee</Link></p>
      </div>
      </div>

      
    </>
  );
};

export default CheckoutSummary;