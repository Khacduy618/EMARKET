// // app/(main)/checkout/components/CheckoutPlatformVoucherSection.tsx
// 'use client';

// import React from 'react';
// import { FaMoneyBill, FaCoins } from 'react-icons/fa6';
// import { CheckoutData, CheckoutVoucher } from '@/types';

// const formatVND = (price: number): string => {
//   return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
// };

// interface CheckoutPlatformVoucherSectionProps {
//   availablePlatformVouchers: CheckoutVoucher[];
//   shopeeCoins: {
//     currentCoins: number;
//     isApplied: boolean;
//     appliedAmount: number;
//   };
//   onSelectPlatformVoucher: () => void;
//   onToggleShopeeCoins: () => void;
// }

// const CheckoutPlatformVoucherSection: React.FC<CheckoutPlatformVoucherSectionProps> = ({
//   availablePlatformVouchers,
//   shopeeCoins,
//   onSelectPlatformVoucher,
//   onToggleShopeeCoins
// }) => {
//   const selectedPlatformVoucher = availablePlatformVouchers.find(v => v.isSelected);

//   return (
//     <div className="mt-4 bg-white rounded-md shadow-sm border border-gray-200 py-4 px-4">
//       <div className="flex justify-between items-center mb-4">
//         <div className="flex items-center text-sm text-gray-800">
//           <FaMoneyBill className="mr-2 text-orange-500 text-base" /> Shopee Voucher
//         </div>
//         <div className="flex items-center gap-2">
//           {selectedPlatformVoucher && selectedPlatformVoucher.discountAmount > 0 ? (
//              <span className="text-orange-500 font-semibold">- đ{formatVND(selectedPlatformVoucher.discountAmount).replace('₫', '')}K</span>
//           ) : (
//             <span className="text-gray-500">-</span>
//           )}
//           <button onClick={onSelectPlatformVoucher} className="text-blue-500 hover:text-blue-600 text-sm">Chọn Voucher</button>
//         </div>
//       </div>
//       <div className="flex justify-between items-center">
//         <div className="flex items-center text-sm text-gray-800">
//           <FaCoins className="mr-2 text-yellow-500 text-base" /> Shopee Xu
//         </div>
//         <div className="flex items-center gap-2">
//           <span className="text-gray-600 text-sm">{shopeeCoins.currentCoins > 0 ? `(${shopeeCoins.currentCoins} Xu)` : 'Không thể sử dụng Xu'}</span>
//           <input type="checkbox" checked={shopeeCoins.isApplied} onChange={onToggleShopeeCoins} className="accent-orange-500" />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CheckoutPlatformVoucherSection;
'use client';

import React from 'react';
import { Ticket, Coins } from 'lucide-react';
import { AppliedVouchersCombined } from '@/types';

interface CheckoutPlatformVoucherSectionProps {
  totalFreeship: number,
  totalSaleoff:number,
  platformVouchers: AppliedVouchersCombined;
  onSelectPlatformVoucher: () => void;
}
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};
const CheckoutPlatformVoucherSection: React.FC<CheckoutPlatformVoucherSectionProps> = ({
  totalFreeship,
  totalSaleoff,
  platformVouchers,
  onSelectPlatformVoucher,
}) => {
  const hasPlatformVoucher = platformVouchers.freeShipVoucher || platformVouchers.saleOffVoucher;

  return (
    <div className="mt-4 bg-white rounded-sm shadow-sm border border-gray-200 divide-y divide-gray-100">
      <div className="flex justify-between items-center py-4 px-4">
        <div className="flex items-center text-sm text-gray-800">
          <Ticket className="mr-2 text-orange-500 h-5 w-5" /> E-Market Voucher
        </div>
        <button onClick={onSelectPlatformVoucher} className="text-sm text-blue-500 hover:underline">
          {hasPlatformVoucher ? (<div className="flex gap-2">
            <div className="flex items-center justify-center">
            <Ticket size={16} className="mr-1.5" />
                                                <span>Giảm -{formatPrice((totalFreeship))}</span>
          </div>
          <div className="flex items-center justify-center">
            <Ticket size={16} className="mr-1.5" />
                                                <span>Giảm -{formatPrice((totalSaleoff))}</span>
          </div>
          </div>) : 'Chọn hoặc nhập mã'}
        </button>
      </div>
      
    </div>
  );
};

export default CheckoutPlatformVoucherSection;