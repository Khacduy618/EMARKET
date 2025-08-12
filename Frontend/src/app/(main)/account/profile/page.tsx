// app/(main)/(account)/profile/page.tsx

"use client";

import { useState, FormEvent, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { UpdateProfilePayload } from '@/types';
import { Input } from '@/components/ui/input';

export default function ProfileDetailsPage() {
    const { user, updateProfile } = useAuth();

    // State của form, khởi tạo rỗng
    const [formData, setFormData] = useState<UpdateProfilePayload>({
        FullName: '',
        Username: '',
        Email: '',
        Phone: '',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Điền dữ liệu ban đầu vào form khi có thông tin user
    useEffect(() => {
        if (user) {
            setFormData({
                FullName: user.FullName ?? '', 
                Username: user.Username ?? '',
                Email: user.Email ?? '',
                Phone: user.Phone ?? '',
            });
        }
    }, [user]); // Chạy lại khi user thay đổi

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await updateProfile(formData);
        } catch (error) {
            console.error("Failed to update profile", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!user) {
        return <div>Đang tải thông tin...</div>; // Màn hình loading
    }

    return (
        <div className="p-6 md:p-8 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Hồ Sơ Của Tôi</h2>
            <p className="mb-8 text-gray-600">Quản lý thông tin hồ sơ để bảo mật tài khoản.</p>

            <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
                <div>
                    <label className="text-sm font-medium text-gray-700" htmlFor="FullName">Họ và Tên</label>
                    <Input
                        id="FullName"
                        name="FullName"
                        type="text"
                        required
                        value={formData.FullName}
                        onChange={handleChange}
                        className="block w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    />
                </div>

                <div>
                    <label className="text-sm font-medium text-gray-700" htmlFor="Username">Tên đăng nhập</label>
                    <Input
                        id="Username"
                        name="Username"
                        type="text"
                        required
                        value={formData.Username}
                        onChange={handleChange}
                        className="block w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    />
                </div>

                <div>
                    <label className="text-sm font-medium text-gray-700" htmlFor="Email">Email</label>
                    <Input
                        id="Email"
                        name="Email"
                        type="email"
                        required
                        value={formData.Email}
                        onChange={handleChange}
                        className="block w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    />
                </div>

                <div>
                    <label className="text-sm font-medium text-gray-700" htmlFor="Phone">Số điện thoại</label>
                    <input
                        id="Phone"
                        name="Phone"
                        type="tel"
                        required
                        value={formData.Phone}
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
