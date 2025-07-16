'use client';

import React from 'react';
import { X, CreditCard, DollarSign } from 'lucide-react';
import { PaymentMethodType } from '@/types'; // Import type của bạn

// Component cho từng lựa chọn để code gọn gàng hơn
const PaymentMethodOption = ({ icon, name, selected, onClick }: { icon: React.ReactNode, name: string, selected: boolean, onClick: () => void }) => (
    <div
        onClick={onClick}
        className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
            selected 
            ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
    >
        {icon}
        <span className="ml-4 font-medium text-gray-800">{name}</span>
        <div className="ml-auto">
            <div className={`w-5 h-5 rounded-full border-2 ${selected ? 'border-blue-500 bg-blue-500' : 'border-gray-400'}`}>
                {selected && <div className="w-full h-full flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-white"></div></div>}
            </div>
        </div>
    </div>
);

interface PaymentMethodSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMethod: PaymentMethodType;
  onConfirm: (selectedMethod: PaymentMethodType) => void;
}

const PaymentMethodSelectionModal: React.FC<PaymentMethodSelectionModalProps> = ({
  isOpen,
  onClose,
  currentMethod,
  onConfirm,
}) => {
  const [selectedMethod, setSelectedMethod] =
    React.useState<PaymentMethodType>(currentMethod);

  if (!isOpen) {
    return null;
  }

  const handleConfirm = () => {
    onConfirm(selectedMethod);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md m-4">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Chọn phương thức thanh toán</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <PaymentMethodOption
            icon={<DollarSign className="text-green-500" size={24} />}
            name="Thanh toán khi nhận hàng (COD)"
            selected={selectedMethod === 'COD'}
            onClick={() => setSelectedMethod('COD')}
          />
          <PaymentMethodOption
            icon={<img src="/images/icons/paypal.svg" alt="PayPal" className="w-6 h-6" />} // Thêm icon PayPal vào public/images/icons
            name="Thanh toán bằng PayPal"
            selected={selectedMethod === 'Paypal'}
            onClick={() => setSelectedMethod('Paypal')}
          />
          <PaymentMethodOption
            icon={<img src="/images/icons/vnpay.svg" alt="VNPay" className="w-6 h-6" />} // Thêm icon VNPay vào public/images/icons
            name="Cổng thanh toán VNPay"
            selected={selectedMethod === 'VNPay'}
            onClick={() => setSelectedMethod('VNPay')}
          />
        </div>
        <div className="p-4 bg-gray-50 border-t flex justify-end">
          <button
            onClick={handleConfirm}
            className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodSelectionModal;