'use client';

import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Address } from '@/types';

interface AddressSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  addresses: Address[];
  currentSelectedAddressId: number | null; // ID của địa chỉ đang được chọn
  onConfirm: (selectedAddress: Address) => void; // Callback khi nhấn Xác nhận
  onAddNewAddress: () => void;
  onUpdateAddress: (addressId: number) => void;
}

const AddressSelectionModal: React.FC<AddressSelectionModalProps> = ({
  isOpen,
  onClose,
  addresses,
  currentSelectedAddressId,
  onConfirm,
  onAddNewAddress,
  onUpdateAddress,
}) => {
  // State nội bộ để theo dõi lựa chọn trong modal
  const [selectedIdInModal, setSelectedIdInModal] = useState<number | null>(currentSelectedAddressId);

  // Cập nhật lựa chọn trong modal khi địa chỉ hiện tại thay đổi
  useEffect(() => {
    setSelectedIdInModal(currentSelectedAddressId);
  }, [currentSelectedAddressId]);


  if (!isOpen) return null;

  const handleConfirm = () => {
    const selectedAddress = addresses.find(addr => addr.AddressID === selectedIdInModal);
    if (selectedAddress) {
      onConfirm(selectedAddress); // Gửi toàn bộ đối tượng địa chỉ đã chọn về component cha
    }
  };

  return (
    <div className="fixed inset-0 z-50 rounded-sm flex justify-center items-center p-4">
      <div className="bg-white rounded-sm border-t shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Địa Chỉ Của Tôi</h2>
        </div>

        <div className="p-4 flex-grow overflow-y-auto">
          {addresses.length > 0 ? (
            addresses.map(address => (
              <div
                key={address.AddressID}
                className="flex items-start gap-4 p-3 border-b last:border-b-0 cursor-pointer hover:bg-gray-50 rounded-md"
                onClick={() => setSelectedIdInModal(address.AddressID)}
              >
                <input
                  type="radio"
                  name="address-selection"
                  readOnly
                  checked={selectedIdInModal === address.AddressID}
                  className={`mt-1 h-5 w-5 accent-orange-500`}
                />
                <div className="flex-1 text-sm">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="font-semibold text-gray-800">{address.FullName}</span>
                      <span className="text-gray-500 mx-2">|</span>
                      <span className="text-gray-600">{address.PhoneNumber}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateAddress(address.AddressID);
                      }}
                      className="text-blue-500 hover:underline font-medium"
                    >
                      Cập nhật
                    </button>
                  </div>
                  <p className="mt-1 text-gray-600">
                    {address.Street}, {address.Ward ? `${address.Ward}, ` : ''}{address.District}, {address.City}
                  </p>
                  {!!address.IsDefault && (
                    <span className="text-xs border border-red-500 text-red-500 px-1.5 py-0.5 rounded mt-1 inline-block">Mặc định</span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500">Không tìm thấy địa chỉ nào.</p>
          )}

          <button
            onClick={onAddNewAddress}
            className="w-full mt-4 flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 rounded-md text-gray-600 hover:border-orange-500 hover:text-orange-500 transition"
          >
            <Plus size={18} /> Thêm Địa Chỉ Mới
          </button>
        </div>

        <div className="p-4 border-t bg-gray-50 flex rounded-es-sm rounded-ee-sm justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2 bg-white text-black border border-gray-300 rounded-md hover:bg-gray-100 font-semibold">
            Hủy
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedIdInModal || selectedIdInModal === currentSelectedAddressId}
            className="px-6 py-2 bg-orange-500 text-white rounded-md font-semibold hover:bg-orange-600 disabled:bg-gray-400"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddressSelectionModal;