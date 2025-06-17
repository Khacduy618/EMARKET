// // app/(main)/checkout/components/CheckoutShopVoucherSection.tsx
// 'use client'; // Đảm bảo đây là client component nếu có useState, onChange

// import React from 'react';
// import Link from 'next/link';
// import { FaMoneyBill, FaCircleQuestion } from 'react-icons/fa6'; // FaQuestionCircle cần thiết cho "Được đồng kiểm"
// import { CheckoutShopOrder } from '@/types'; // Lấy types từ '@/types'

// const formatVND = (price: number): string => {
//   return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
// };

// interface CheckoutShopVoucherSectionProps {
//   shopOrder: CheckoutShopOrder;
//   // onSelectShopVoucher: (shopId: number) => void; // Nếu có logic chọn voucher shop
//   // onMessageChange: (shopId: number, message: string) => void; // Nếu bạn muốn cập nhật lời nhắn
// }

// const CheckoutShopVoucherSection: React.FC<CheckoutShopVoucherSectionProps> = ({ shopOrder }) => {
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
//             <span className="text-gray-500">-</span> // Hiển thị "-" nếu không có discount
//           )}
//           <button className="bg-orange-500 text-white px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-orange-600 transition-colors">
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
//             onChange={(e) => { /* handle message change: call a prop function like onMessageChange(shopOrder.ShopID, e.target.value) */ }}
//           />
//         </div>
//         <div className="col-span-1 flex flex-col items-end">
//           <div className="flex items-center text-gray-700 mb-1 whitespace-nowrap">
//             <span>Phương thức vận chuyển:</span>
//             <span className="font-semibold ml-1">{shopOrder.shippingMethod}</span>
//             <button className="text-blue-500 hover:text-blue-600 ml-2">Thay Đổi</button>
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

//       {/* Được đồng kiểm */}
//       <div className="flex justify-end items-center text-xs text-gray-500 px-4 pb-3">
//         <span>Được đồng kiểm.</span>
//         <FaCircleQuestion className="ml-1 text-xs text-gray-400 cursor-pointer hover:text-gray-600" title="Chi tiết về đồng kiểm" />
//       </div>
//     </>
//   );
// };

// export default CheckoutShopVoucherSection;

// app/(main)/checkout/components/CheckoutShopVoucherSection.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { FaMoneyBill } from 'react-icons/fa6';
import { CheckoutShopOrder } from '@/types';

const formatVND = (price: number): string => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

interface CheckoutShopVoucherSectionProps {
  shopOrder: CheckoutShopOrder;
  onSelectShopVoucher: (shopId: number) => void;
  onMessageChange: (shopId: number, message: string) => void; // Đảm bảo DÒNG NÀY CÓ Ở ĐÂY
  onShippingMethodChange: (shopId: number) => void; // Thêm prop này
}

const CheckoutShopVoucherSection: React.FC<CheckoutShopVoucherSectionProps> = ({ shopOrder, onSelectShopVoucher, onMessageChange, onShippingMethodChange }) => {
  return (
    <>
      {/* Shop Voucher Section */}
      <div className="flex justify-between items-center px-4 pt-4 pb-2 border-b border-gray-100">
        <div className="flex items-center text-sm text-gray-800">
          <FaMoneyBill className="mr-2 text-green-500 text-base" /> Voucher của Shop
        </div>
        <div className="flex items-center gap-2 text-sm">
          {shopOrder.shippingVoucherDiscount && shopOrder.shippingVoucherDiscount > 0 ? (
            <span className="text-orange-500 font-semibold">- đ{formatVND(shopOrder.shippingVoucherDiscount).replace('₫', '')}K</span>
          ) : (
            <span className="text-gray-500"></span>
          )}
          <button onClick={() => onSelectShopVoucher(shopOrder.ShopID)} className="bg-orange-500 text-white px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-orange-600 transition-colors">
             Chọn Voucher Khác
          </button>
        </div>
      </div>

      {/* Lời nhắn và Vận chuyển */}
      <div className="px-4 py-4 grid grid-cols-2 gap-x-4 text-sm">
        <div className="col-span-1 flex items-center">
          <span className="text-gray-700 mr-2 whitespace-nowrap">Lời nhắn:</span>
          <input
            type="text"
            placeholder="Lưu ý cho Người bán..."
            className="border border-gray-300 rounded-md px-3 py-1.5 text-gray-700 focus:outline-none focus:border-blue-500 w-full"
            value={shopOrder.messageToSeller}
            onChange={(e) => onMessageChange(shopOrder.ShopID, e.target.value)} // Dùng prop onMessageChange
          />
        </div>
        <div className="col-span-1 flex flex-col items-end">
          <div className="flex items-center text-gray-700 mb-1 whitespace-nowrap">
            <span>Phương thức vận chuyển:</span>
            <span className="font-semibold ml-1">{shopOrder.shippingMethod}</span>
            <button onClick={() => onShippingMethodChange(shopOrder.ShopID)} className="text-blue-500 hover:text-blue-600 ml-2">Thay Đổi</button>
          </div>
          <div className="text-xs text-gray-500 text-right mb-1">
            <p>
              Đảm bảo nhận hàng từ{' '}
              <span className="text-green-600">{shopOrder.deliveryEstimate}</span>
            </p>
            {shopOrder.shippingVoucherNote && <p>{shopOrder.shippingVoucherNote}</p>}
          </div>
          <div className="text-gray-700 font-semibold mt-2 text-right">
            {formatVND(shopOrder.shippingFee)}
          </div>
        </div>
      </div>
    </>
  );
};

export default CheckoutShopVoucherSection;