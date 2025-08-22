"use client";

import { useState, useEffect, FormEvent } from 'react';
import { toast } from 'react-toastify';
import { User, UserPayload } from '@/types';
import { X } from 'lucide-react';
import { createUser, updateUser } from '@/services/admin';
import { checkEmailAvailability, checkPhoneAvailability, checkUsernameAvailability } from '@/services/auth';

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

    const validateFullName = (value: string) => {
        if (/\d/.test(value)) {
            return "Họ và tên không được chứa số";
        }
        return undefined;
    };

    const validateEmailLocal = (value: string) => {
        if (/^\d/.test(value)) {
            return "Email không được bắt đầu bằng số";
        }
        return undefined;
    };

    const validatePhoneLocal = (value: string) => {
        if (value && !/^0\d{9}$/.test(value)) {
            return "Số điện thoại phải là 10 số và bắt đầu bằng 0";
        }
        return undefined;
    };

    const handleBlur = async (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        let error: string | undefined = undefined;

        switch (name) {
            case 'FullName':
                error = validateFullName(value);
                break;
            case 'Email':
                error = validateEmailLocal(value);
                if (!error && value && (!userToEdit || value !== userToEdit.Email)) {
                    try {
                        const { isAvailable } = await checkEmailAvailability(value);
                        if (!isAvailable) {
                            error = "Email này đã được sử dụng";
                        }
                    } catch {
                        error = "Lỗi kiểm tra email. Vui lòng thử lại.";
                    }
                }
                break;
            case 'Phone':
                error = validatePhoneLocal(value);
                if (!error && value && (!userToEdit || value !== userToEdit.Phone)) {
                    try {
                        const { isAvailable } = await checkPhoneAvailability(value);
                        if (!isAvailable) {
                            error = "Số điện thoại này đã được sử dụng";
                        }
                    } catch {
                        error = "Lỗi kiểm tra số điện thoại. Vui lòng thử lại.";
                    }
                }
                break;
            case 'Username':
                if (value && (!userToEdit || value !== userToEdit.Username)) {
                    try {
                        const { isAvailable } = await checkUsernameAvailability(value);
                        if (!isAvailable) {
                            error = "Tên đăng nhập này đã được sử dụng";
                        }
                    } catch {
                        error = "Lỗi kiểm tra tên đăng nhập. Vui lòng thử lại.";
                    }
                }
                break;
        }

        setErrors(prev => ({ ...prev, [name]: error }));
    };

    // Hàm submit form
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const newErrors: { [key: string]: string | undefined } = {};

            newErrors.FullName = validateFullName(formData.FullName || '');
            newErrors.Email = validateEmailLocal(formData.Email || '');
            newErrors.Phone = validatePhoneLocal(formData.Phone || '');

            // Kiểm tra availability nếu thay đổi hoặc tạo mới
            if (formData.Username && (!userToEdit || formData.Username !== userToEdit.Username)) {
                const { isAvailable } = await checkUsernameAvailability(formData.Username);
                if (!isAvailable) {
                    newErrors.Username = "Tên đăng nhập này đã được sử dụng";
                }
            }
            if (formData.Email && (!userToEdit || formData.Email !== userToEdit.Email)) {
                const { isAvailable } = await checkEmailAvailability(formData.Email);
                if (!isAvailable) {
                    newErrors.Email = "Email này đã được sử dụng";
                }
            }
            if (formData.Phone && (!userToEdit || formData.Phone !== userToEdit.Phone)) {
                const { isAvailable } = await checkPhoneAvailability(formData.Phone);
                if (!isAvailable) {
                    newErrors.Phone = "Số điện thoại này đã được sử dụng";
                }
            }

            // Nếu tạo mới, kiểm tra password
            if (!userToEdit && !formData.Password) {
                newErrors.Password = "Mật khẩu là bắt buộc khi tạo mới";
            }

            setErrors(newErrors);

            if (Object.values(newErrors).some(err => err)) {
                toast.error("Vui lòng sửa các lỗi trước khi lưu.");
                return;
            }

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
                setErrors(prev => ({ ...prev, ...error.response.data.errors }));
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
                                <input name="FullName" value={formData.FullName || ''} onChange={handleChange} onBlur={handleBlur} className="mt-1 w-full p-2 border rounded-md" />
                                {errors.FullName && <p className="text-xs text-red-500 mt-1">{errors.FullName}</p>}
                            </div>
                            <div>
                                <label className="text-sm font-medium">Tên đăng nhập</label>
                                <input name="Username" value={formData.Username || ''} onChange={handleChange} onBlur={handleBlur} className="mt-1 w-full p-2 border rounded-md" />
                                {errors.Username && <p className="text-xs text-red-500 mt-1">{errors.Username}</p>}
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Email</label>
                            <input name="Email" type="email" value={formData.Email || ''} onChange={handleChange} onBlur={handleBlur} className="mt-1 w-full p-2 border rounded-md" />
                            {errors.Email && <p className="text-xs text-red-500 mt-1">{errors.Email}</p>}
                        </div>
                        <div>
                            <label className="text-sm font-medium">Số điện thoại</label>
                            <input name="Phone" type="tel" value={formData.Phone || ''} onChange={handleChange} onBlur={handleBlur} className="mt-1 w-full p-2 border rounded-md" />
                            {errors.Phone && <p className="text-xs text-red-500 mt-1">{errors.Phone}</p>}
                        </div>

                        <div className="border-t pt-4">
                            <label className="text-sm font-medium">{isEditing ? 'Đặt mật khẩu mới (Bỏ trống nếu không đổi)' : 'Mật khẩu'}</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-1">
                                <input name="Password" type="password" placeholder="Mật khẩu mới" value={formData.Password || ''} onChange={handleChange} className="w-full p-2 border rounded-md" />
                                <input name="Password_confirmation" type="password" placeholder="Xác nhận mật khẩu" value={formData.Password_confirmation || ''} onChange={handleChange} className="w-full p-2 border rounded-md" />
                            </div>
                            {errors.Password && <p className="text-xs text-red-500 mt-1">{errors.Password}</p>}
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
