'use client';

import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Address } from '@/types';
import { createAddress, fetchAddressDetails, updateAddress } from '@/services/user';
import { toast } from 'react-toastify';
import AddressPicker from './AddressPicker'; // Import component mới


interface UpdateAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  addressId: number | null; // Nếu là null, có nghĩa là chế độ "Thêm mới"
  onSuccess: () => void; /// Callback để báo cho trang cha tải lại danh sách địa chỉ
}

const UpdateAddressModal: React.FC<UpdateAddressModalProps> = ({
  isOpen,
  onClose,
  addressId,
  onSuccess,
}) => {
    const [address, setAddress] = useState<Partial<Address>>({});
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const isCreateMode = addressId === null; // Xác định chế độ

    useEffect(() => {
        // Nếu là chế độ cập nhật, fetch dữ liệu
        if (isOpen && !isCreateMode) {
        setLoading(true);
        fetchAddressDetails(addressId)
            .then(data => setAddress(data))
            .catch(() => toast.error('Không thể tải thông tin địa chỉ.'))
            .finally(() => setLoading(false));
        } else {
        // Nếu là chế độ thêm mới hoặc đóng, reset form
        setAddress({ IsDefault: 0 }); // Mặc định không phải là địa chỉ mặc định
        }
    }, [isOpen, addressId, isCreateMode]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setAddress(prev => ({ ...prev, [name]: value }));
    };
    
    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress(prev => ({ ...prev, IsDefault: e.target.checked }));
  };
    const handleAddressPickerChange = (newAddress: { province: string | null; district: string | null; ward: string | null; }) => {
        setAddress(prev => ({
            ...prev,
            City: newAddress.province || '',
            District: newAddress.district || '',
            Ward: newAddress.ward || '',
        }));
    };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        
        try {
        if (isCreateMode) {
            // Gọi API tạo mới
            console.log("Data to be created:", address);
            const dataToCreate = {
            FullName: address.FullName || '',
            PhoneNumber: address.PhoneNumber || '',
            City: address.City || '', // Giả sử bạn có dropdown
            District: address.District || '', // Giả sử bạn có dropdown
            Ward: address.Ward || '',
            Street: address.Street || '',
            IsDefault: !!address.IsDefault
            // AddressType: address.AddressType || 'Home', // Ví dụ nếu có trường này
        }; 
            await createAddress(dataToCreate as Omit<Address, 'AddressID'>);
            toast.success('Thêm địa chỉ mới thành công!');
        } else {
            // Gọi API cập nhật
            await updateAddress(addressId!, address);
            toast.success('Cập nhật địa chỉ thành công!');
        }
        onSuccess(); // Báo cho component cha biết đã thành công
        onClose();   // Đóng modal
        } catch (error: any) {
        const message = error.response?.data?.message || (isCreateMode ? 'Thêm mới thất bại.' : 'Cập nhật thất bại.');
        toast.error(message);
        } finally {
        setSubmitting(false);
        }
    };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 mt-6 z-50 flex justify-center items-center p-4">
      <form onSubmit={handleSubmit} className="bg-white border-t rounded-sm shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            {isCreateMode ? 'Thêm địa chỉ mới' : 'Cập nhật địa chỉ'}
          </h2>
        </div>

        {loading ? (
            <div className="flex justify-center items-center h-96"><Loader2 className="animate-spin"/></div>
        ) : (
            <div className="p-6 flex-grow overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <label htmlFor="FullName" className="absolute -top-2 left-2 bg-white px-1 text-xs text-gray-500">Họ và tên</label>
                  <input type="text" name="FullName" value={address.FullName || ''} onChange={handleChange} className="w-full p-3 border text-black border-gray-300 rounded-md" required />
                </div>
                <div className="relative">
                  <label htmlFor="PhoneNumber" className="absolute -top-2 left-2 bg-white px-1 text-xs text-gray-500">Số điện thoại</label>
                  <input type="text" name="PhoneNumber" value={address.PhoneNumber || ''} onChange={handleChange} className="w-full p-3 border text-black border-gray-300 rounded-md" required />
                </div>
              </div>

              <AddressPicker
                value={{
                    province: address.City || null,
                    district: address.District || null,
                    ward: address.Ward || null,
                }}
                onChange={handleAddressPickerChange}
              />


              <div className="relative">
                <label htmlFor="Street" className="absolute -top-2 left-2 bg-white px-1 text-xs text-gray-500">Địa chỉ cụ thể</label>
                <textarea name="Street" value={address.Street || ''} onChange={handleChange} rows={3} className="w-full p-3 text-black border text-black border-gray-300 rounded-md resize-none" required></textarea>
              </div>

              {/* Google Map Placeholder */}
              <div className="h-40 bg-gray-200 rounded-md flex items-center justify-center text-gray-500">Bản đồ (placeholder)</div>

              <div className="flex items-center">
                <input type="checkbox" id="IsDefault" name="IsDefault" checked={!!address.IsDefault} onChange={handleCheckboxChange} className="h-4 w-4 accent-orange-500" />
                <label htmlFor="IsDefault" className="ml-2 text-sm text-gray-700">Đặt làm địa chỉ mặc định</label>
              </div>
            </div>
        )}

        <div className="p-4 border-t bg-gray-50 rounded-ee-sm rounded-es-sm flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-6 py-2 text-black bg-white border border-gray-300 rounded-md hover:bg-gray-100 font-semibold">
            Trở Lại
          </button>
          <button type="submit" disabled={submitting} className="px-6 py-2 bg-orange-500 text-white rounded-md font-semibold hover:bg-orange-600 disabled:bg-gray-400 flex items-center gap-2">
            {submitting && <Loader2 className="animate-spin" size={16} />}
            Hoàn thành
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateAddressModal;