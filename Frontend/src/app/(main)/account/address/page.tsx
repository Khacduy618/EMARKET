// app/(main)/account/address/page.tsx

"use client";

import { useState, useEffect, FormEvent } from 'react';
import { toast } from 'react-toastify';
import useSWR from 'swr';
// --- Dịch vụ API (Giả định bạn có đủ các hàm này) ---
import {
    fetchUserAddresses,
    createAddress,
    updateAddress,
    fetchAddressDetails,
    deleteAddress,      // Tái tích hợp
    setDefaultAddress   // Tái tích hợp
} from '@/services/user'; // Đường dẫn tới file service của bạn
import { Address, AddressPayload } from '@/types';

// --- Icons ---
import { FaPlus } from 'react-icons/fa'; // Icon từ mẫu giao diện
import { Edit3, MapPin, Phone, X, Home, Loader2, Trash2 } from 'lucide-react'; // Icons cho panel và các hành động khác
import ConfirmModal from '@/app/components/ConfirmModal';

// ===================================================================
// =                  Component: Một Mục Địa chỉ                     =
// ===================================================================
// Component này được thiết kế lại để khớp với giao diện mẫu bạn cung cấp.
function AddressItem({
    address,
    isLast,
    onEdit,
    onDelete,
    onSetDefault,
    isProcessing,
}: {
    address: Address;
    isLast: boolean;
    onEdit: () => void;
    onDelete: () => void; 
    onSetDefault: () => Promise<void>;
    isProcessing: boolean;
}) {
    // Kết hợp Phường, Quận, Thành phố thành một dòng địa chỉ hoàn chỉnh
    const fullAddressLine2 = [address.Ward, address.District, address.City]
        .filter(Boolean) // Loại bỏ các giá trị null hoặc rỗng
        .join(', ');

    return (
        <div className={`py-6 ${!isLast ? 'border-b border-gray-200' : ''}`}>
            <div className="flex justify-between items-start mb-2">
                {/* Tên và số điện thoại */}
                <div>
                    <span className="font-semibold text-lg text-black">{address.FullName}</span>
                    <span className="text-gray-700 ml-3">{address.PhoneNumber}</span>
                </div>
                {/* Các nút hành động */}
                <div className="flex items-center text-sm">
                    <button onClick={onEdit} disabled={isProcessing} className="text-blue-500 hover:underline disabled:text-gray-400 disabled:no-underline">
                        Cập nhật
                    </button>
                    {!address.IsDefault && (
                        <>
                            <span className="mx-2 text-gray-300">|</span>
                            <button onClick={onDelete} disabled={isProcessing} className="text-red-500 hover:underline disabled:text-gray-400 disabled:no-underline">
                                Xóa
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Dòng địa chỉ */}
            <p className="text-gray-700 text-sm">{address.Street}</p>
            <p className="text-gray-700 text-sm mb-4">{fullAddressLine2}</p>

            {/* Các tag trạng thái */}
            <div className="flex gap-2 mb-4">
                {!!address.IsDefault && (
                    <span className="text-xs border border-red-400 text-red-500 px-2 py-0.5 rounded-sm">
                        Mặc định
                    </span>
                )}
                {/* Ghi chú: Giao diện mẫu có tag "Lấy hàng" & "Trả hàng". 
                    Nếu API của bạn trả về các trường này, bạn có thể thêm chúng ở đây.
                */}
            </div>

            {/* Nút Thiết lập mặc định */}
            {!address.IsDefault && (
                <button
                    onClick={onSetDefault}
                    disabled={isProcessing}
                    className="bg-gray-100 text-gray-700 py-2 px-4 rounded-md text-sm transition-colors duration-200 hover:bg-gray-200 disabled:opacity-50"
                >
                    {isProcessing ? <Loader2 className="animate-spin w-4 h-4 mx-auto" /> : 'Thiết lập mặc định'}
                </button>
            )}
        </div>
    );
}


// ===================================================================
// =               Component: Side Panel Thêm/Sửa Địa chỉ          =
// ===================================================================
// Component này được giữ nguyên, vì nó hoạt động độc lập với giao diện danh sách.
function AddressSidePanel({
    isOpen,
    onClose,
    addressToEdit,
    onSaveSuccess
}: {
    isOpen: boolean;
    onClose: () => void;
    addressToEdit: Partial<Address> | null;
    onSaveSuccess: () => void;
}) {
    const [formData, setFormData] = useState<Partial<Address>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isEditing = !!addressToEdit?.AddressID;

    useEffect(() => {
        if (isOpen) {
            setFormData(addressToEdit || { IsDefault: false });
        }
    }, [isOpen, addressToEdit]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const payload: AddressPayload = {
                FullName: formData.FullName || '',
                PhoneNumber: formData.PhoneNumber || '',
                Street: formData.Street || '',
                Ward: formData.Ward || undefined,
                District: formData.District || '',
                City: formData.City || '',
                IsDefault: !!formData.IsDefault,
            };

            if (isEditing && formData.AddressID) {
                await updateAddress(formData.AddressID, payload);
                toast.success("Cập nhật địa chỉ thành công!");
            } else {
                await createAddress(payload);
                toast.success("Thêm địa chỉ mới thành công!");
            }
            onSaveSuccess();
            onClose();
        } catch (error: any) {
            toast.error(error.message || "Đã có lỗi xảy ra.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={`fixed inset-0 z-50 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose}></div>
            <div className={`pt-32 relative ml-auto h-full w-full max-w-lg bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                {/* JSX của Panel giữ nguyên */}
                 <div className="flex flex-col h-full">
                    <div className="flex justify-between items-center p-6 border-b">
                        <h3 className="text-xl font-bold text-gray-800">{isEditing ? 'Cập nhật Địa chỉ' : 'Thêm Địa chỉ Mới'}</h3>
                        <button onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"><X size={24} /></button>
                    </div>

                    <form id="address-form" onSubmit={handleSubmit} className="flex-grow p-6 space-y-4 overflow-y-auto">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700">Họ và Tên</label>
                                <input type="text" name="FullName" placeholder="Nguyễn Văn An" value={formData.FullName || ''} onChange={handleChange} required className="mt-1 w-full p-2.5 border rounded-md" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Số điện thoại</label>
                                <input type="tel" name="PhoneNumber" placeholder="0901234567" value={formData.PhoneNumber || ''} onChange={handleChange} required className="mt-1 w-full p-2.5 border rounded-md" />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700">Tỉnh / Thành phố</label>
                            <input type="text" name="City" placeholder="Ví dụ: TP. Hồ Chí Minh" value={formData.City || ''} onChange={handleChange} required className="mt-1 w-full p-2.5 border rounded-md" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700">Quận / Huyện</label>
                            <input type="text" name="District" placeholder="Ví dụ: Quận 1" value={formData.District || ''} onChange={handleChange} required className="mt-1 w-full p-2.5 border rounded-md" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700">Phường / Xã</label>
                            <input type="text" name="Ward" placeholder="Ví dụ: Phường Bến Nghé" value={formData.Ward || ''} onChange={handleChange} className="mt-1 w-full p-2.5 border rounded-md" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700">Địa chỉ cụ thể</label>
                            <input type="text" name="Street" placeholder="Ví dụ: 123 Đường Lê Lợi" value={formData.Street || ''} onChange={handleChange} required className="mt-1 w-full p-2.5 border rounded-md" />
                        </div>
                        <div className="flex items-center pt-2">
                            <input type="checkbox" id="isDefault" name="IsDefault" checked={!!formData.IsDefault} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                            <label htmlFor="isDefault" className="ml-3 block text-sm text-gray-900">Đặt làm địa chỉ mặc định</label>
                        </div>
                    </form>

                    <div className="flex-shrink-0 flex justify-end gap-4 p-6 border-t bg-gray-50">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-50">Hủy</button>
                        <button type="submit" form="address-form" disabled={isSubmitting} className="px-5 py-2.5 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300">
                            {isSubmitting ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ===================================================================
// =                Component Chính: ProfileAddress                  =
// ===================================================================
export default function ProfileAddress() {
    const { data: addressData, error, mutate, isLoading } = useSWR('/user/addresses', fetchUserAddresses);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [addressToDelete, setAddressToDelete] = useState<Address | null>(null);
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);
    const [isFetchingDetails, setIsFetchingDetails] = useState(false);
    const [processingId, setProcessingId] = useState<number | null>(null); // State để quản lý item đang xử lý

    const handleOpenAddPanel = () => {
        setEditingAddress(null);
        setIsPanelOpen(true);
    };

    const handleOpenEditPanel = async (address: Address) => {
        setIsFetchingDetails(true);
        toast.info("Đang tải chi tiết địa chỉ...");
        try {
            const detailedAddress = await fetchAddressDetails(address.AddressID);
            setEditingAddress(detailedAddress);
            setIsPanelOpen(true);
        } catch (err: any) {
            toast.error(err.message || "Không thể tải chi tiết địa chỉ.");
        } finally {
            setIsFetchingDetails(false);
        }
    };

    // // Tái tích hợp hàm xóa
    // const handleDelete = async (addressId: number) => {
    //     if (window.confirm("Bạn có chắc chắn muốn xóa địa chỉ này?")) {
    //         setProcessingId(addressId);
    //         try {
    //             await deleteAddress(addressId);
    //             toast.success("Đã xóa địa chỉ.");
    //             mutate(); // Fetch lại dữ liệu
    //         } catch (error: any) {
    //             toast.error(error.response?.data?.message || "Xóa thất bại.");
    //         } finally {
    //             setProcessingId(null);
    //         }
    //     }
    // };
    // Hàm để mở modal xác nhận xóa
    const handleOpenDeleteConfirm = (address: Address) => {
        setAddressToDelete(address);
        setIsDeleteModalOpen(true);
    };

    // Hàm thực hiện việc xóa sau khi người dùng xác nhận
    const confirmDelete = async () => {
        if (!addressToDelete) return;

        setProcessingId(addressToDelete.AddressID);
        try {
            await deleteAddress(addressToDelete.AddressID);
            toast.success("Đã xóa địa chỉ thành công.");
            mutate(); // Tải lại danh sách
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Xóa thất bại.");
        } finally {
            setProcessingId(null);
            setIsDeleteModalOpen(false); // Đóng modal xác nhận
            setAddressToDelete(null);    // Reset state
        }
    };
    
    
    // Tái tích hợp hàm đặt mặc định
    const handleSetDefault = async (addressId: number) => {
        setProcessingId(addressId);
        try {
            await setDefaultAddress(addressId);
            toast.success("Đã đặt làm địa chỉ mặc định.");
            mutate(); // Fetch lại dữ liệu
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Thao tác thất bại.");
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div>
            <ConfirmModal
                    isOpen={isDeleteModalOpen}
                    message={`Bạn có chắc chắn muốn xóa địa chỉ "${addressToDelete?.FullName}"?`}
                    onConfirm={confirmDelete}
                    onCancel={() => setIsDeleteModalOpen(false)}
                />
            {/* Header theo mẫu giao diện mới */}
            <div className="flex justify-between items-center pb-6">
                <h1 className="text-2xl font-bold text-black">Địa chỉ của tôi</h1>
                <button 
                    onClick={handleOpenAddPanel} 
                    className="bg-orange-500 text-white py-2 px-4 rounded-md flex items-center transition-colors duration-200 hover:bg-orange-600 disabled:bg-orange-300"
                    disabled={isFetchingDetails || isLoading}
                >
                    {isFetchingDetails ? <Loader2 className="mr-2 animate-spin" /> : <FaPlus className="mr-2" />} 
                    Thêm địa chỉ mới
                </button>
            </div>

            {/* Phần danh sách theo mẫu giao diện mới */}
            <div className="pt-6 border-t border-gray-200">
                <h2 className="text-xl font-bold mb-6 text-black">Địa chỉ</h2>

                {isLoading && <div className="text-center py-8 text-gray-500">Đang tải danh sách địa chỉ...</div>}
                {error && <div className="text-center py-8 text-red-500">Lỗi khi tải dữ liệu. Vui lòng thử lại.</div>}
                
                {!isLoading && !error && (
                    <>
                        {addressData && addressData.addresses.length > 0 ? (
                            addressData.addresses.map((address, index) => (
                                <AddressItem
                                    key={address.AddressID}
                                    address={address}
                                    isLast={index === addressData.addresses.length - 1}
                                    onEdit={() => handleOpenEditPanel(address)}
                                    onDelete={() => handleOpenDeleteConfirm(address)}
                                    onSetDefault={() => handleSetDefault(address.AddressID)}
                                    isProcessing={processingId === address.AddressID}
                                />
                            ))
                        ) : (
                            <div className="text-center text-gray-400 py-16 border-2 border-dashed rounded-lg">
                                <Home size={48} className="mx-auto" />
                                <p className="mt-4 font-semibold text-lg text-gray-600">Bạn chưa có địa chỉ nào.</p>
                                <p className="text-sm mt-1">Hãy thêm một địa chỉ mới để giao hàng nhanh hơn!</p>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Panel thêm/sửa vẫn hoạt động như cũ */}
            <AddressSidePanel
                isOpen={isPanelOpen}
                onClose={() => setIsPanelOpen(false)}
                addressToEdit={editingAddress}
                onSaveSuccess={() => mutate()}
            />
        </div>
    );
}