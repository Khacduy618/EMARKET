'use client';

import React from 'react';
import { Ticket, Coins } from 'lucide-react';
import { AppliedVouchersCombined } from '@/types';
import { useSearchParams } from 'next/navigation';

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
  
   const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  // Lấy ra các voucher thực tế đã được áp dụng một cách an toàn
  const freeShipVoucher = platformVouchers?.freeShipVoucher;
  const saleOffVoucher = platformVouchers?.saleOffVoucher;
  
const hasAnyPlatformVoucher = freeShipVoucher || saleOffVoucher;

  return (
    <div className="mt-4 bg-white rounded-sm shadow-sm border border-gray-200 divide-y divide-gray-100">
      <div className="flex justify-between items-center py-4 px-4">
        <div className="flex items-center text-sm text-gray-800">
          <Ticket className="mr-2 text-orange-500 h-5 w-5" /> E-Market Voucher
        </div>
       <button 
          onClick={onSelectPlatformVoucher} 
          className="text-sm text-blue-500 hover:underline disabled:text-gray-500 disabled:no-underline"
          disabled={!!orderId} // Vô hiệu hóa nút nếu đã có orderId
        >
          {hasAnyPlatformVoucher ? (
            <div className="flex items-center gap-4 text-green-600 font-semibold">
              {/* === HIỂN THỊ VOUCHER FREESHIP NẾU CÓ === */}
              {freeShipVoucher && totalFreeship > 0 && (
                <div className="flex items-center justify-center">
                  <Ticket size={16} className="mr-1" />
                  <span>Freeship -{formatPrice(totalFreeship)}</span>
                </div>
              )}

              {/* === HIỂN THỊ VOUCHER SALE-OFF NẾU CÓ === */}
              {saleOffVoucher && totalSaleoff > 0 && (
                <div className="flex items-center justify-center">
                  <Ticket size={16} className="mr-1" />
                  {/* Hiển thị mã voucher nếu có */}
                  <span>{saleOffVoucher.Code}: -{formatPrice(totalSaleoff)}</span>
                </div>
              )}
            </div>
          ) : (
            // Nếu không có voucher nào, hiển thị nút chọn
            'Chọn hoặc nhập mã'
          )}
        </button>
      </div>
      
    </div>
  );
};

export default CheckoutPlatformVoucherSection;