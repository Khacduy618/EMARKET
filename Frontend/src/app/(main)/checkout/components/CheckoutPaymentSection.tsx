// app/(main)/checkout/components/CheckoutPaymentSection.tsx
import React from 'react';
import { CheckoutData } from '@/types'; // Lấy types từ '@/types'

interface CheckoutPaymentSectionProps {
  paymentMethod: {
    method: string;
    canChange: boolean;
  };
  onPaymentMethodChange: () => void; // Hàm callback khi nhấn "Thay Đổi"
}

const CheckoutPaymentSection: React.FC<CheckoutPaymentSectionProps> = ({ paymentMethod, onPaymentMethodChange }) => {
  return (
    <div className="mt-4 bg-white rounded-md shadow-sm border border-gray-200 py-4 px-4 mb-4">
      <div className="flex justify-between items-center text-sm text-gray-800">
        <span className="font-semibold">Phương thức thanh toán</span>
        <span className="ml-auto mr-4">{paymentMethod.method}</span>
        {paymentMethod.canChange && (
          <button onClick={onPaymentMethodChange} className="text-blue-500 hover:text-blue-600">THAY ĐỔI</button>
        )}
      </div>
    </div>
  );
};

export default CheckoutPaymentSection;