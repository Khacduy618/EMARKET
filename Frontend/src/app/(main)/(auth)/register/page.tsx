// app/(main)/(auth)/register/page.tsx

"use client";

import { useState, FormEvent, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { RegisterPayload } from '@/types';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        FullName: '',
        Username: '',
        Email: '',
        Phone: '',
        Password: '',
        Password_confirmation: '',
    });

    const [formError, setFormError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { register, user, isLoading, error: apiError } = useAuth();
    const router = useRouter();

    // Chuyển hướng nếu đã đăng nhập
    useEffect(() => {
        if (user) {
            router.push('/');
        }
    }, [user, router]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setFormError(null);

        if (formData.Password !== formData.Password_confirmation) {
            setFormError('Mật khẩu xác nhận không khớp.');
            return;
        }

        setIsSubmitting(true);

        // ---- ĐÂY LÀ THAY ĐỔI QUAN TRỌNG ----
        // Tạo payload cuối cùng để gửi đi, bao gồm các giá trị mặc định
        const payload: RegisterPayload = {
            ...formData,
            IsActive: true,   // Đặt giá trị mặc định
            Role: 'Buyer',  // Đặt giá trị mặc định là 'Buyer'
        };

        try {
            await register(payload);
        } catch (err) {
            console.error("Register attempt failed:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Hiển thị loading nếu context đang kiểm tra session
    if (isLoading || user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-gray-100">
                <p className="text-xl text-gray-700">Đang tải...</p>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen py-12 bg-gray-100">
            <div className="w-full max-w-lg p-8 space-y-6 bg-white rounded-lg shadow-xl">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900">
                        Tạo tài khoản mới
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Tham gia cộng đồng và bắt đầu mua sắm ngay!
                    </p>
                </div>

                {/* Hiển thị lỗi từ client hoặc từ API */}
                {(formError || apiError) && (
                    <div className="p-3 text-sm text-red-700 bg-red-100 border-l-4 border-red-500" role="alert">
                        <p className="font-bold">Lỗi:</p>
                        <p>{formError || apiError}</p>
                    </div>
                )}

                <form className="space-y-4" onSubmit={handleSubmit}>
                    {/* Form JSX không đổi */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-bold text-gray-600">Họ và Tên</label>
                            <input name="FullName" required onChange={handleChange} className="block w-full px-4 py-2 mt-1 text-gray-700 bg-gray-50 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                        </div>
                        <div>
                            <label className="text-sm font-bold text-gray-600">Tên đăng nhập</label>
                            <input name="Username" required onChange={handleChange} className="block w-full px-4 py-2 mt-1 text-gray-700 bg-gray-50 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-bold text-gray-600">Email</label>
                        <input name="Email" type="email" required onChange={handleChange} className="block w-full px-4 py-2 mt-1 text-gray-700 bg-gray-50 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                    </div>
                    <div>
                        <label className="text-sm font-bold text-gray-600">Số điện thoại</label>
                        <input name="Phone" type="tel" required onChange={handleChange} className="block w-full px-4 py-2 mt-1 text-gray-700 bg-gray-50 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                    </div>
                    <div>
                        <label className="text-sm font-bold text-gray-600">Mật khẩu</label>
                        <input name="Password" type="password" required onChange={handleChange} className="block w-full px-4 py-2 mt-1 text-gray-700 bg-gray-50 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                    </div>
                    <div>
                        <label className="text-sm font-bold text-gray-600">Xác nhận mật khẩu</label>
                        <input name="Password_confirmation" type="password" required onChange={handleChange} className="block w-full px-4 py-2 mt-1 text-gray-700 bg-gray-50 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex items-center justify-center w-full px-4 py-3 mt-4 tracking-wide text-white transition-colors duration-200 transform bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:bg-indigo-600 disabled:bg-indigo-400 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Đang xử lý...' : 'Đăng ký'}
                        </button>
                    </div>
                </form>

                <p className="mt-6 text-sm text-center text-gray-600">
                    Đã có tài khoản?{' '}
                    <Link href="/login" className="font-medium text-indigo-600 hover:underline">
                        Đăng nhập tại đây
                    </Link>
                </p>
            </div>
        </div>
    );
}
