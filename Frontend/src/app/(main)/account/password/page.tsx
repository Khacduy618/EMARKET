// app/(main)/(account)/password/page.tsx

"use client";

import { useState, FormEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
import { UpdatePasswordPayload } from '@/types';
import { toast } from 'react-toastify';

export default function ChangePasswordPage() {
    const { updatePassword } = useAuth();

    const [formData, setFormData] = useState<UpdatePasswordPayload>({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.password_confirmation) {
            toast.error('Mật khẩu mới không khớp.');
            return;
        }

        setIsSubmitting(true);
        try {
            await updatePassword(formData);
            // Nếu thành công, AuthContext sẽ hiển thị toast
            // Reset form sau khi thành công
            setFormData({
                current_password: '',
                password: '',
                password_confirmation: '',
            });
        } catch (error) {
            // Lỗi cũng đã được AuthContext xử lý
            console.error("Failed to update password", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-6 md:p-8 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Thay Đổi Mật Khẩu</h2>
            <p className="mb-8 text-gray-600">Để bảo mật tài khoản, vui lòng không chia sẻ mật khẩu cho người khác.</p>

            <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
                <div>
                    <label className="text-sm font-medium text-gray-700" htmlFor="current_password">
                        Mật khẩu hiện tại
                    </label>
                    <input
                        id="current_password"
                        name="current_password"
                        type="password"
                        required
                        value={formData.current_password}
                        onChange={handleChange}
                        className="block w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    />
                </div>

                <div>
                    <label className="text-sm font-medium text-gray-700" htmlFor="password">
                        Mật khẩu mới
                    </label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        value={formData.password}
                        onChange={handleChange}
                        className="block w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    />
                </div>

                <div>
                    <label className="text-sm font-medium text-gray-700" htmlFor="password_confirmation">
                        Xác nhận mật khẩu mới
                    </label>
                    <input
                        id="password_confirmation"
                        name="password_confirmation"
                        type="password"
                        required
                        value={formData.password_confirmation}
                        onChange={handleChange}
                        className="block w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    />
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-3 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                    </button>
                </div>
            </form>
        </div>
    );
}
