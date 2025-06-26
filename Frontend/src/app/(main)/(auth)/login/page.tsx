// app/(main)/(auth)/login/page.tsx
"use client";

import { useState, FormEvent, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext'; // Đảm bảo đường dẫn chính xác
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Dùng state riêng cho form để vô hiệu hóa nút ngay lập tức
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Lấy hàm login và lỗi từ context
    const { login, error, user } = useAuth();
    const router = useRouter();

    // Chuyển hướng nếu người dùng đã đăng nhập rồi (ví dụ: họ back lại trang login)
    useEffect(() => {
        if (user) {
            router.push('/');
        }
    }, [user, router]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return; // Không cho submit lại khi đang xử lý

        setIsSubmitting(true);

        // Hàm login trong context sẽ xử lý logic gọi API và hiển thị toast
        // Ở đây chỉ cần gọi nó
        await login({ email, password });

        // Sau khi login xong (dù thành công hay thất bại), bật lại nút
        setIsSubmitting(false);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-xl">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900">
                        Đăng Nhập
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        để tiếp tục trải nghiệm mua sắm tuyệt vời!
                    </p>
                </div>

                {/* 
          Hiển thị lỗi trả về từ Context. 
          Toast sẽ hiện thông báo tức thời, còn lỗi này sẽ nằm lại trên form.
        */}
                {error && (
                    <div className="p-3 text-sm text-red-700 bg-red-100 border-l-4 border-red-500" role="alert">
                        <p className="font-bold">Lỗi:</p>
                        <p>{error}</p>
                    </div>
                )}

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email" className="text-sm font-bold text-gray-600">
                            Địa chỉ Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="block w-full px-4 py-2 mt-2 text-gray-700 bg-gray-50 border rounded-md focus:border-indigo-400 focus:ring-indigo-300 focus:ring-opacity-40 focus:outline-none focus:ring"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="text-sm font-bold text-gray-600"
                        >
                            Mật khẩu
                        </label>
                        <input
                            id="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="block w-full px-4 py-2 mt-2 text-gray-700 bg-gray-50 border rounded-md focus:border-indigo-400 focus:ring-indigo-300 focus:ring-opacity-40 focus:outline-none focus:ring"
                            placeholder="********"
                        />
                    </div>

                    <div className="flex items-center justify-end">
                        <Link href="/forgot-password" className="text-sm text-indigo-600 hover:underline">
                            Quên mật khẩu?
                        </Link>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full px-4 py-2 tracking-wide text-white transition-colors duration-200 transform bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:bg-indigo-600 disabled:bg-indigo-400"
                        >
                            {isSubmitting ? 'Đang xử lý...' : 'Đăng nhập'}
                        </button>
                    </div>
                </form>

                <p className="mt-6 text-sm text-center text-gray-600">
                    Chưa có tài khoản?{' '}
                    <Link href="/register" className="font-medium text-indigo-600 hover:underline">
                        Đăng ký ngay
                    </Link>
                </p>
            </div>
        </div>
    );
}
