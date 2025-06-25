'use client';

import React from 'react';
import { MapPin } from 'lucide-react';
import { Address } from '@/types';

interface CheckoutAddressSectionProps {
  address: Address | null;
  onAddressChange: () => void;
}

const CheckoutAddressSection: React.FC<CheckoutAddressSectionProps> = ({ address, onAddressChange }) => {
  if (!address) {
    return (
      <div className="py-4 mt-4 bg-white rounded-sm shadow-sm border border-gray-200">
        <div className="flex justify-between items-center text-sm px-4">
          <p className="text-red-500">Vui lòng chọn hoặc thêm địa chỉ nhận hàng.</p>
          <button onClick={onAddressChange} className="bg-orange-500 text-white px-4 py-2 rounded-md text-sm font-semibold">
            Thêm Địa Chỉ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4 mt-4 bg-white rounded-sm shadow-sm border border-gray-200">
      <div className="flex items-center text-orange-500 font-semibold mb-3 px-4">
        <MapPin className="mr-2 h-5 w-5" /> Địa Chỉ Nhận Hàng
      </div>
      <div className="flex justify-start gap-8 items-center text-sm text-gray-800 px-4">
        <div className="justify-start gap-2 items-center">
          <span className="font-semibold mr-2">{address.FullName}</span>
          <span className="text-gray-600">({address.PhoneNumber})</span>
          <span className="mt-1 text-gray-700">
            {address.Street}, {address.Ward ? `${address.Ward}, ` : ''}{address.District}, {address.City}
          </span>
          {!!address.IsDefault && (
            <span className="text-xs border border-orange-500 text-orange-500 px-2 py-0.5 rounded ml-2 inline-block">Mặc Định</span>
          )}
        </div>
        <button onClick={onAddressChange} className="text-blue-800 hover:text-blue-600 font-bold text-sm">
          Thay Đổi
        </button>
      </div>
    </div>
  );
};

export default CheckoutAddressSection;