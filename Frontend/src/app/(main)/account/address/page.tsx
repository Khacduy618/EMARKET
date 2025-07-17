// app/(main)/(account)/address/page.tsx

"use client";

import { useState, useEffect, FormEvent } from 'react';
import { toast } from 'react-toastify';
import useSWR from 'swr';
import { Address, AddressPayload } from '@/types/address.interface';
import { PlusCircle, Edit3, Trash2, MapPin, Phone, X, Home } from 'lucide-react';
import { getAddresses, addAddress, updateAddress, deleteAddress, setDefaultAddress } from '@/services/address';

// ===================================================================
// =                  Component: Một Thẻ Địa chỉ                    =
// ===================================================================
function AddressCard({
    address,
    onEdit,
    onDelete,
    onSetDefault,
    isProcessing,
}: {
    address: Address;
    onEdit: () => void;
    onDelete: () => Promise<void>;
    onSetDefault: () => Promise<void>;
    isProcessing: boolean;
}) {
    return (
        <div className={`p-5 border-l-4 ${address.IsDefault ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 bg-white'} rounded-lg shadow-sm transition-all duration-300`}>
            <div className="flex justify-between items-start gap-4">
                <div className="space-y-2 flex-grow">
                    <div className="flex items-center gap-3">
                        <span className="font-bold text-lg text-gray-900">{address.FullName}</span>
                        {address.IsDefault && (
                            <span className="text-xs font-semibold text-white bg-indigo-600 px-2.5 py-1 rounded-full">MẶC ĐỊNH</span>
                        )}
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center gap-2"><Phone size={14} className="text-gray-400" /><span>{address.PhoneNumber}</span></div>
                        <div className="flex items-start gap-2"><MapPin size={14} className="text-gray-400 mt-0.5 flex-shrink-0" /><span>{`${address.Street}, ${address.Ward || ''}, ${address.District}, ${address.City}`}</span></div>
                    </div>
                </div>
                <div className="flex-shrink-0 flex items-center gap-1 sm:gap-2">
                    <button onClick={onEdit} className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 rounded-full transition-colors"><Edit3 size={16} /></button>
                    <button onClick={onDelete} disabled={isProcessing} className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"><Trash2 size={16} /></button>
                </div>
            </div>
            {!address.IsDefault && (
                <div className="mt-4 pt-4 border-t border-dashed">
                    <button onClick={onSetDefault} disabled={isProcessing} className="text-sm font-semibold text-gray-700 hover:text-indigo-600 disabled:opacity-50">
                        {isProcessing ? 'Đang xử lý...' : 'Đặt làm địa chỉ mặc định'}
                    </button>
                </div>
            )}
        </div>
    );
}

// ===================================================================
// =                    Component: Side Panel                      =
// ===================================================================
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
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const payload: AddressPayload = {
                FullName: formData.FullName || '',
                PhoneNumber: formData.PhoneNumber || '',
                Street: formData.Street || '',
                Ward: formData.Ward,
                District: formData.District || '',
                City: formData.City || '',
                IsDefault: formData.IsDefault || false,
            };
            if (isEditing) {
                await updateAddress((formData as Address).AddressID, payload);
                toast.success("Cập nhật địa chỉ thành công!");
            } else {
                await addAddress(payload);
                toast.success("Thêm địa chỉ mới thành công!");
            }
            onSaveSuccess();
            onClose();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Đã có lỗi xảy ra.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={`fixed inset-0 z-50 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose}></div>
            <div className={`pt-32 relative ml-auto h-full w-full max-w-lg bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
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
                            <label className="text-sm font-medium text-gray-700">Địa chỉ cụ thể (Số nhà, tên đường...)</label>
                            <input type="text" name="Street" placeholder="Ví dụ: 123 Đường Lê Lợi" value={formData.Street || ''} onChange={handleChange} required className="mt-1 w-full p-2.5 border rounded-md" />
                        </div>
                        {!isEditing && (
                            <div className="flex items-center pt-2">
                                <input type="checkbox" id="isDefault" name="IsDefault" checked={!!formData.IsDefault} onChange={(e) => setFormData(prev => ({ ...prev, IsDefault: e.target.checked }))} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                                <label htmlFor="isDefault" className="ml-3 block text-sm text-gray-900">Đặt làm địa chỉ mặc định</label>
                            </div>
                        )}
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
// =                     Component Trang Chính                        =
// ===================================================================
export default function AddressPage() {
    const { data: addresses, error, mutate, isLoading } = useSWR('/api/addresses', getAddresses);
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);
    const [processingId, setProcessingId] = useState<number | null>(null);

    const handleOpenAddPanel = () => {
        setEditingAddress(null);
        setIsPanelOpen(true);
    };

    const handleOpenEditPanel = (address: Address) => {
        setEditingAddress(address);
        setIsPanelOpen(true);
    };

    const handleDelete = async (addressId: number) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa địa chỉ này?")) {
            setProcessingId(addressId);
            try {
                await deleteAddress(addressId);
                toast.success("Đã xóa địa chỉ.");
                mutate();
            } catch (error: any) {
                toast.error(error.response?.data?.message || "Xóa thất bại.");
            } finally {
                setProcessingId(null);
            }
        }
    };

    const handleSetDefault = async (addressId: number) => {
        setProcessingId(addressId);
        try {
            await setDefaultAddress(addressId);
            toast.success("Đã đặt làm địa chỉ mặc định.");
            mutate();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Thao tác thất bại.");
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="p-1">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Sổ Địa Chỉ Của Tôi</h1>
                <button onClick={handleOpenAddPanel} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm">
                    <PlusCircle size={18} />
                    <span className="text-sm font-semibold">Thêm địa chỉ mới</span>
                </button>
            </div>

            {isLoading && <div className="p-8 text-center text-gray-500">Đang tải danh sách địa chỉ của bạn...</div>}
            {error && <div className="p-4 bg-red-100 text-red-700 rounded-lg">Lỗi khi tải danh sách địa chỉ. Vui lòng thử lại.</div>}

            {!isLoading && !error && (
                <div className="space-y-4">
                    {addresses && addresses.length > 0 ? (
                        addresses.map(address => (
                            <AddressCard
                                key={address.AddressID}
                                address={address}
                                onEdit={() => handleOpenEditPanel(address)}
                                onDelete={() => handleDelete(address.AddressID)}
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
                </div>
            )}

            <AddressSidePanel
                isOpen={isPanelOpen}
                onClose={() => setIsPanelOpen(false)}
                addressToEdit={editingAddress}
                onSaveSuccess={() => mutate()}
            />
        </div>
    );
}
