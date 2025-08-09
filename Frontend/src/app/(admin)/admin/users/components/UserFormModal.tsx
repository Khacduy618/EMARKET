"use client";

import { useState, useEffect, FormEvent } from 'react';
import { toast } from 'react-toastify';
import { User, UserPayload } from '@/types';
import { X } from 'lucide-react';
import { createUser, updateUser } from '@/services/admin';

interface UserFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    userToEdit: User | null;
    onSaveSuccess: () => void; // Callback để báo cho trang chính fetch lại dữ liệu
}

export default function UserFormModal({ isOpen, onClose, userToEdit, onSaveSuccess }: UserFormModalProps) {
    // State để lưu trữ dữ liệu của form
    const [formData, setFormData] = useState<Partial<UserPayload>>({});
    // State để quản lý lỗi validation phía client
    const [errors, setErrors] = useState<{ [key: string]: string | undefined }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Xác định xem đây là form Sửa (Edit) hay form Thêm mới
    const isEditing = !!userToEdit;

    // useEffect này sẽ reset form mỗi khi modal được mở
    useEffect(() => {
        if (isOpen) {
            // Nếu là form Sửa, điền dữ liệu của user vào
            if (userToEdit) {
                setFormData({
                    FullName: userToEdit.FullName,
                    Username: userToEdit.Username,
                    Email: userToEdit.Email,
                    Phone: userToEdit.Phone,
                    Role: userToEdit.Role,
                    IsActive: userToEdit.IsActive,
                });
            } else {
                // Nếu là form Thêm mới, đặt các giá trị mặc định
                setFormData({
                    Role: 'Buyer', // Mặc định là Buyer
                    IsActive: true,
                    Password: '',
                    Password_confirmation: ''
                });
            }
            setErrors({}); // Xóa lỗi cũ
        }
    }, [isOpen, userToEdit]);

    // Hàm xử lý khi người dùng thay đổi input
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

        setFormData(prev => ({ ...prev, [name]: finalValue }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    // Hàm submit form
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            // Loại bỏ các trường mật khẩu rỗng trước khi gửi đi (trong trường hợp Sửa)
            const payload = { ...formData };
            if (isEditing && !payload.Password) {
                delete payload.Password;
                delete payload.Password_confirmation;
            }

            if (isEditing) {
                await updateUser(userToEdit!.UserID, payload);
                toast.success("Cập nhật người dùng thành công!");
            } else {
                await createUser(payload as UserPayload);
                toast.success("Thêm người dùng mới thành công!");
            }

            onSaveSuccess(); // Gọi callback để refresh bảng
            onClose(); // Đóng modal
        } catch (error: any) {
            // Xử lý lỗi validation từ backend
            if (error.response && error.response.data && error.response.data.errors) {
                setErrors(error.response.data.errors);
                toast.error("Vui lòng kiểm tra lại các lỗi trong form.");
            } else {
                toast.error(error.response?.data?.message || "Đã có lỗi xảy ra.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={`fixed inset-0 z-50 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
            {/* Nền mờ */}
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose}></div>

            {/* Nội dung panel trượt ra từ bên phải */}
            <div className={`relative ml-auto h-full w-full max-w-lg bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex flex-col h-full">
                    {/* Header Panel */}
                    <div className="flex justify-between items-center p-6 border-b">
                        <h3 className="text-xl font-bold text-gray-800">
                            {isEditing ? `Chỉnh sửa Người dùng #${userToEdit?.UserID}` : 'Thêm Người dùng Mới'}
                        </h3>
                        <button onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"><X size={24} /></button>
                    </div>

                    {/* Form */}
                    <form id="user-form" onSubmit={handleSubmit} className="flex-grow p-6 space-y-4 overflow-y-auto">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium">Họ và Tên</label>
                                <input name="FullName" value={formData.FullName || ''} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md" />
                                {errors.FullName && <p className="text-xs text-red-500 mt-1">{errors.FullName[0]}</p>}
                            </div>
                            <div>
                                <label className="text-sm font-medium">Tên đăng nhập</label>
                                <input name="Username" value={formData.Username || ''} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md" />
                                {errors.Username && <p className="text-xs text-red-500 mt-1">{errors.Username[0]}</p>}
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Email</label>
                            <input name="Email" type="email" value={formData.Email || ''} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md" />
                            {errors.Email && <p className="text-xs text-red-500 mt-1">{errors.Email[0]}</p>}
                        </div>
                        <div>
                            <label className="text-sm font-medium">Số điện thoại</label>
                            <input name="Phone" type="tel" value={formData.Phone || ''} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md" />
                            {errors.Phone && <p className="text-xs text-red-500 mt-1">{errors.Phone[0]}</p>}
                        </div>

                        <div className="border-t pt-4">
                            <label className="text-sm font-medium">{isEditing ? 'Đặt mật khẩu mới (Bỏ trống nếu không đổi)' : 'Mật khẩu'}</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-1">
                                <input name="Password" type="password" placeholder="Mật khẩu mới" value={formData.Password || ''} onChange={handleChange} className="w-full p-2 border rounded-md" />
                                <input name="Password_confirmation" type="password" placeholder="Xác nhận mật khẩu" value={formData.Password_confirmation || ''} onChange={handleChange} className="w-full p-2 border rounded-md" />
                            </div>
                            {errors.Password && <p className="text-xs text-red-500 mt-1">{errors.Password[0]}</p>}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium">Vai trò</label>
                                <select name="Role" value={formData.Role || 'Buyer'} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md bg-white">
                                    <option value="Buyer">Buyer</option>
                                    <option value="Seller">Seller</option>
                                    <option value="Admin">Admin</option>
                                </select>
                            </div>
                            <div className="flex items-end pb-1">
                                <div className="flex items-center">
                                    <input id="isActive" name="IsActive" type="checkbox" checked={formData.IsActive || false} onChange={handleChange} className="h-4 w-4 rounded text-indigo-600" />
                                    <label htmlFor="isActive" className="ml-2 text-sm text-gray-800">Kích hoạt tài khoản</label>
                                </div>
                            </div>
                        </div>
                    </form>

                    {/* Footer */}
                    <div className="flex-shrink-0 flex justify-end gap-4 p-6 border-t bg-gray-50 m-6 mt-6">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-medium bg-white border rounded-lg">Hủy</button>
                        <button type="submit" form="user-form" disabled={isSubmitting} className="px-5 py-2.5 text-sm font-medium bg-indigo-600 text-white rounded-lg">
                            {isSubmitting ? 'Đang lưu...' : (isEditing ? 'Cập nhật' : 'Thêm mới')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
