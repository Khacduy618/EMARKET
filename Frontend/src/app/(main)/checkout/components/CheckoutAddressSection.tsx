// app/(main)/checkout/components/CheckoutAddressSection.tsx
import React from 'react';
import { FaMapLocation } from 'react-icons/fa6';
import { Address } from '@/types'; // Lấy Address từ '@/types'

interface CheckoutAddressSectionProps {
  address: Address;
  onAddressChange: () => void; // Hàm callback khi nhấn "Thay Đổi"
}

const CheckoutAddressSection: React.FC<CheckoutAddressSectionProps> = ({ address, onAddressChange }) => {
  return (
    <div className="py-4 mt-4 bg-white rounded-md shadow-sm border border-gray-200">
      <div className="flex items-center text-orange-500 font-semibold mb-3 px-4">
        <FaMapLocation className="mr-2 text-lg" /> Địa Chỉ Nhận Hàng
      </div>
      <div className="flex justify-between items-center text-sm text-gray-800 px-4 pb-4 border-b border-gray-100">
        <div>
          <span className="font-semibold mr-2">{address.FullName}</span>
          <span className="text-gray-600">({address.PhoneNumber})</span>
          <p className="mt-1 text-gray-700">
            {address.Street}, {address.Ward ? `${address.Ward}, ` : ''}{address.District}, {address.City}
          </p>
          {address.IsDefault && (
            <span className="text-xs border border-orange-500 text-orange-500 px-2 py-0.5 rounded ml-2">Mặc Định</span>
          )}
        </div>
        <button onClick={onAddressChange} className="text-blue-500 hover:text-blue-600 text-sm">Thay Đổi</button>
      </div>
      <div className="px-4 pt-4 text-gray-500 text-xs">
        <span className="text-blue-500">
          <FaMapLocation className="inline-block mr-1" />
          Lưu ý:
        </span> Vui lòng kiểm tra lại thông tin địa chỉ và số điện thoại trước khi đặt hàng.
      </div>
    </div>
  );
};

export default CheckoutAddressSection;