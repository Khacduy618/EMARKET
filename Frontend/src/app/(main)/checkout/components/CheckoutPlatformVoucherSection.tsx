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