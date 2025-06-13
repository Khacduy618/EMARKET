// src/app/components/ConfirmModal.tsx
import React from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ isOpen, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white  rounded-lg shadow-xl max-w-sm w-full">
        <div className="shadow-inner rounded-lg p-6 w-full">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Xác nhận</h3>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="flex justify-end space-x-3">
            <button
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
                Hủy
            </button>
            <button
                onClick={onConfirm}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
                Đồng ý
            </button>
            </div>
        </div>
        
      </div>
    </div>
  );
};

export default ConfirmModal;