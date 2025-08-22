'use client';

import React from 'react';
import { Ticket, Ship } from 'lucide-react'; // Sử dụng icon Ship cho dễ phân biệt
import { AppliedVouchersCombined } from '@/types';
import { useSearchParams } from 'next/navigation';
import { formatVND } from '@/services/api';
 // Import hàm format tiền

interface CheckoutPlatformVoucherSectionProps {
  totalFreeship: number;
  totalSaleoff: number;
  platformVouchers: AppliedVouchersCombined;
  onSelectPlatformVoucher: () => void;
}

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
  
  const hasAppliedVouchers = (freeShipVoucher && totalFreeship > 0) || (saleOffVoucher && totalSaleoff > 0);

  return (
    <div className="mt-4 bg-white rounded-sm shadow-sm border border-gray-200 divide-y divide-gray-100">
      <div className="flex justify-between items-center py-4 px-4">
        <div className="flex items-center text-sm text-gray-800">
          <Ticket className="mr-2 text-orange-500 h-5 w-5" /> E-Market Voucher
        </div>
        
        <button 
          onClick={onSelectPlatformVoucher} 
          className="text-sm text-blue-500 hover:underline disabled:text-gray-500 disabled:no-underline disabled:cursor-not-allowed"
          disabled={!!orderId} // Vô hiệu hóa nút nếu đã có orderId
        >
          {hasAppliedVouchers ? (
            <div className="flex items-center gap-4 text-green-600 font-semibold text-xs">
              {/* === HIỂN THỊ VOUCHER FREESHIP NẾU CÓ === */}
              {freeShipVoucher && totalFreeship > 0 && (
                <div className="flex items-center justify-center bg-green-50 text-green-700 px-2 py-1 rounded">
                  <Ship size={14} className="mr-1.5" />
                  <span>Miễn phí vận chuyển {formatVND(totalFreeship)}</span>
                </div>
              )}

              {/* === HIỂN THỊ VOUCHER SALE-OFF NẾU CÓ === */}
              {saleOffVoucher && totalSaleoff > 0 && (
                <div className="flex items-center justify-center bg-red-50 text-red-700 px-2 py-1 rounded">
                  <Ticket size={14} className="mr-1.5" />
                  <span>Giảm {formatVND(totalSaleoff)}</span>
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