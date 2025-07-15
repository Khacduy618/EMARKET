// app/(main)/(account)/address/page.tsx

"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-toastify';
import useSWR from 'swr'; // Dùng SWR để fetch và cache dữ liệu
import { Address } from '@/types/address.interface'; // Import interface
import { PlusCircle, Edit, Trash2, Home, MapPin, Phone, User } from 'lucide-react';
// import các hàm service (bạn cần tạo file này)
import { getAddresses, addAddress, updateAddress, deleteAddress, setDefaultAddress } from '@/services/address';


// Component cho một thẻ địa chỉ
function AddressCard({ address, onEdit, onDelete, onSetDefault }: { address: Address; onEdit: () => void; onDelete: () => void; onSetDefault: () => void; }) {
    return (
        <div className={`p-4 border rounded-lg ${address.IsDefault ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'}`}>
            <div className="flex justify-between items-start">
                <div>
                    <div className="flex items-center font-bold text-gray-800">
                        {address.FullName}
                        {address.IsDefault && <span className="ml-3 text-xs font-semibold text-white bg-indigo-500 px-2 py-0.5 rounded-full">Mặc định</span>}
                    </div>
                    <div className="text-sm text-gray-600 mt-2 space-y-1">
                        <p><span className="font-medium">SĐT:</span> {address.PhoneNumber}</p>
                        <p>{address.Street}, {address.Ward}, {address.District}, {address.City}</p>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                    <button onClick={onEdit} className="text-xs text-blue-600 hover:underline">Sửa</button>
                    <button onClick={onDelete} className="text-xs text-red-600 hover:underline">Xóa</button>
                </div>
            </div>
            {!address.IsDefault && (
                <button onClick={onSetDefault} className="mt-3 text-sm font-semibold text-indigo-600 hover:underline">
                    Đặt làm mặc định
                </button>
            )}
        </div>
    )
}

// Component cho Modal Thêm/Sửa
function AddressModal({ isOpen, onClose, address, onSave }: { isOpen: boolean, onClose: () => void, address: Partial<Address> | null, onSave: () => void }) {
    if (!isOpen) return null;

    const [formData, setFormData] = useState(address || {});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if ('AddressID' in formData && formData.AddressID) {
                // Đây là trường hợp Sửa
                await updateAddress(formData.AddressID, formData);
                toast.success("Cập nhật địa chỉ thành công!");
            } else {
                // Đây là trường hợp Thêm mới
                await addAddress(formData);
                toast.success("Thêm địa chỉ mới thành công!");
            }
            onSave(); // Gọi callback để re-fetch dữ liệu
            onClose(); // Đóng modal
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Đã có lỗi xảy ra.");
        } finally {
            setIsSubmitting(false);
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
                <h3 className="text-xl font-bold mb-4">{'AddressID' in formData ? 'Cập nhật Địa chỉ' : 'Thêm Địa chỉ Mới'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" name="FullName" placeholder="Họ và Tên" value={formData.FullName || ''} onChange={handleChange} required className="w-full p-2 border rounded" />
                    <input type="tel" name="PhoneNumber" placeholder="Số điện thoại" value={formData.PhoneNumber || ''} onChange={handleChange} required className="w-full p-2 border rounded" />
                    <input type="text" name="Street" placeholder="Số nhà, Tên đường" value={formData.Street || ''} onChange={handleChange} required className="w-full p-2 border rounded" />
                    <input type="text" name="Ward" placeholder="Phường / Xã" value={formData.Ward || ''} onChange={handleChange} className="w-full p-2 border rounded" />
                    <input type="text" name="District" placeholder="Quận / Huyện" value={formData.District || ''} onChange={handleChange} required className="w-full p-2 border rounded" />
                    <input type="text" name="City" placeholder="Tỉnh / Thành phố" value={formData.City || ''} onChange={handleChange} required className="w-full p-2 border rounded" />

                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Hủy</button>
                        <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-indigo-600 text-white rounded disabled:bg-indigo-300">
                            {isSubmitting ? 'Đang lưu...' : 'Lưu địa chỉ'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Component Trang Chính
export default function AddressPage() {
    // Fetch dữ liệu bằng SWR
    const { data: addresses, error, mutate } = useSWR('/api/addresses', getAddresses);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Partial<Address> | null>(null);

    const handleOpenAddModal = () => {
        setEditingAddress(null); // Đảm bảo form trống
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (address: Address) => {
        setEditingAddress(address);
        setIsModalOpen(true);
    };

    const handleDeleteAddress = async (addressId: number) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa địa chỉ này?")) {
            try {
                await deleteAddress(addressId);
                toast.success("Đã xóa địa chỉ.");
                mutate(); // Re-fetch danh sách địa chỉ
            } catch (error: any) {
                toast.error(error.response?.data?.message || "Xóa địa chỉ thất bại.");
            }
        }
    };

    const handleSetDefault = async (addressId: number) => {
        try {
            await setDefaultAddress(addressId);
            toast.success("Đã đặt làm địa chỉ mặc định.");
            mutate();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Thao tác thất bại.");
        }
    };


    if (error) return <div className="p-4 bg-red-100 text-red-700 rounded">Lỗi khi tải danh sách địa chỉ.</div>;
    if (!addresses) return <div>Đang tải...</div>;

    return (
        <div className="p-6 md:p-8 bg-white rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Sổ Địa chỉ</h2>
                <button onClick={handleOpenAddModal} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                    <PlusCircle size={20} />
                    Thêm địa chỉ mới
                </button>
            </div>

            <div className="space-y-4">
                {addresses.length > 0 ? (
                    addresses.map(address => (
                        <AddressCard
                            key={address.AddressID}
                            address={address}
                            onEdit={() => handleOpenEditModal(address)}
                            onDelete={() => handleDeleteAddress(address.AddressID)}
                            onSetDefault={() => handleSetDefault(address.AddressID)}
                        />
                    ))
                ) : (
                    <p className="text-center text-gray-500 py-8">Bạn chưa có địa chỉ nào được lưu.</p>
                )}
            </div>

            <AddressModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                address={editingAddress}
                onSave={mutate} // Khi lưu thành công, re-fetch dữ liệu
            />
        </div>
    );
}
