'use client';

import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Address, AddressPayload } from '@/types';
import { createAddress, fetchAddressDetails, updateAddress } from '@/services/user';
import { toast } from 'react-toastify';
import AddressPicker from './AddressPicker'; // Import component mới
import MapPicker from './MapPicker'; // Import component bản đồ
import axios from 'axios';


interface UpdateAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  addressId: number | null;
  onSuccess: () => void; 
  shouldBeDefaultOnCreate?: boolean; 
}

const UpdateAddressModal: React.FC<UpdateAddressModalProps> = ({
  isOpen,
  onClose,
  addressId,
  onSuccess,
  shouldBeDefaultOnCreate = false,
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
        } else if (isOpen && isCreateMode) {
        // Chế độ THÊM MỚI (chỉ reset khi mở)
        setAddress({
            FullName: '',
            PhoneNumber: '',
            City: null, // Dùng null để AddressPicker nhận đúng
            District: null,
            Ward: null,
            Street: '',
            IsDefault: shouldBeDefaultOnCreate, 
        });
    }
    }, [isOpen, addressId, isCreateMode,shouldBeDefaultOnCreate]);

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
            Ward: newAddress.ward || null, 
        }));
    };
    // const handleSubmit = async (e: React.FormEvent) => {
    //     e.preventDefault();
    //     setSubmitting(true);
        
    //    const payload: AddressPayload = {
    //         FullName: address.FullName || '',
    //         PhoneNumber: address.PhoneNumber || '',
    //         City: address.City || '',
    //         District: address.District || '',
    //         Ward: address.Ward ? address.Ward : null, 
    //         Street: address.Street || '',
    //         IsDefault: !!address.IsDefault, // Đảm bảo luôn là boolean
    //     };

    //     // Kiểm tra validation đơn giản
    //     if (!payload.FullName || !payload.PhoneNumber || !payload.City || !payload.District || !payload.Street) {
    //         toast.error("Vui lòng điền đầy đủ các trường bắt buộc.");
    //         return;
    //     }
    //      setSubmitting(true);
    //     try {
    //       console.log("Dữ liệu gửi lên server:", payload); 

    //         if (isCreateMode) {
    //             // Gọi API tạo mới với payload đã được chuẩn hóa
    //             await createAddress(payload);
    //             toast.success('Thêm địa chỉ mới thành công!');
    //         } else {
    //             // Gọi API cập nhật với payload đã được chuẩn hóa
    //             await updateAddress(addressId!, payload);
    //             toast.success('Cập nhật địa chỉ thành công!');
    //         }
    //     onSuccess(); // Báo cho component cha biết đã thành công
    //     onClose();   // Đóng modal
    //     } catch (error: any) {
    //         const message = error.response?.data?.message || 'Đã xảy ra lỗi khi lưu địa chỉ.';
    //     toast.error(message);
    //     } finally {
    //     setSubmitting(false);
    //     }
    // };
     const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log("--- [SUBMIT] Bắt đầu quá trình submit ---");

        const payload: AddressPayload = {
            FullName: address.FullName || '',
            PhoneNumber: address.PhoneNumber || '',
            City: address.City || '',
            District: address.District || '',
            Ward: address.Ward ? address.Ward : null, 
            Street: address.Street || '',
            IsDefault: !!address.IsDefault,
        };
        console.log("[SUBMIT] Payload đã được tạo:", payload);

        // Kiểm tra validation phía client
        if (!payload.FullName || !payload.PhoneNumber || !payload.City || !payload.District || !payload.Street) {
            console.error("[SUBMIT] LỖI VALIDATION: Một hoặc nhiều trường bắt buộc bị rỗng.");
            toast.error("Vui lòng điền đầy đủ các trường bắt buộc.");
            return; // Thoát hàm
        }
        
        console.log("[SUBMIT] Validation phía client đã THÀNH CÔNG. Bắt đầu gọi API...");
        setSubmitting(true);

        try {
            if (isCreateMode) {
                console.log("[SUBMIT] Gọi API createAddress...");
                await createAddress(payload);
                toast.success('Thêm địa chỉ mới thành công!');
            } else {
                console.log(`[SUBMIT] Gọi API updateAddress cho addressId: ${addressId}...`);
                await updateAddress(addressId!, payload);
                toast.success('Cập nhật địa chỉ thành công!');
            }
            console.log("[SUBMIT] Lời gọi API đã thành công!");
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error("--- [SUBMIT] LỖI TRONG KHỐI CATCH ---");
            
            // Log toàn bộ đối tượng lỗi để xem chi tiết
            console.error("Đối tượng lỗi chi tiết:", error);

            // Kiểm tra xem có `error.response` không (đây là lỗi từ Axios)
            if (error.response) {
                console.error("Lỗi từ server (Axios):");
                console.error("  - Status:", error.response.status);
                console.error("  - Data (Response Body):", error.response.data);
                console.error("  - Headers:", error.response.headers);
            } else if (error.request) {
                // Lỗi request được gửi đi nhưng không nhận được phản hồi
                console.error("Lỗi mạng: Không nhận được phản hồi từ server. Request:", error.request);
            } else {
                // Lỗi xảy ra trong quá trình thiết lập request
                console.error("Lỗi thiết lập request:", error.message);
            }
            
            const message = error.response?.data?.message || (isCreateMode ? 'Thêm mới thất bại.' : 'Cập nhật thất bại.');
            toast.error(message);
        } finally {
            console.log("--- [SUBMIT] Kết thúc quá trình, chạy khối finally ---");
            setSubmitting(false);
        }
    };
    const handleLocationSelect = async (location: { lat: number; lng: number }) => {
    try {
        // Gọi Geocoding API của Google
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${location.lat},${location.lng}&key=${apiKey}&language=vi`;
        
        const response = await axios.get(url,
          {
                    headers: {
                        'Accept': 'application/json',
                    },
                    withCredentials: true,
                }
        );
        
        if (response.data.status === 'OK' && response.data.results.length > 0) {
            const result = response.data.results[0];
            const addressComponents = result.address_components;
            
            // Hàm helper để tìm giá trị từ components
            const findComponent = (type: string) => addressComponents.find((c: any) => c.types.includes(type))?.long_name || '';

            const streetNumber = findComponent('street_number');
            const route = findComponent('route');
            const ward = findComponent('sublocality_level_1') || findComponent('ward');
            const district = findComponent('administrative_area_level_2');
            const city = findComponent('administrative_area_level_1');

            const street = `${streetNumber} ${route}`.trim();

            setAddress(prev => ({
                ...prev,
                Street: street || prev.Street || '', // Giữ lại street cũ nếu không tìm thấy
                Ward: ward,
                District: district,
                City: city,
            }));
            
            toast.info("Đã cập nhật địa chỉ từ bản đồ.");
        } else if (response.data.status === 'ZERO_RESULTS') {
            toast.warn("Không tìm thấy địa chỉ chi tiết tại vị trí này. Vui lòng nhập tay.");
        } else {
            console.error("Geocoding API error:", response.data.status);
        }
    } catch (error) {
        console.error("Failed to call Geocoding API", error);
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
              <div className="h-60 bg-gray-200 rounded-md">
                <MapPicker onLocationSelect={handleLocationSelect} />
              </div>


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