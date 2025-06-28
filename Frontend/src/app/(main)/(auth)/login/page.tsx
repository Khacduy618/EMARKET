// app/(main)/(auth)/login/page.tsx
"use client";

import { useState, FormEvent, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// 1. Import hook để sử dụng context
import { useAuth } from '@/context/AuthContext';

// 2. Import icon (nếu bạn dùng)
import { LogIn } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // State để kiểm soát trạng thái của nút submit
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Lấy các state và hàm cần thiết từ AuthContext
    const { login, error, user, isLoading } = useAuth();
    const router = useRouter();

    // useEffect để chuyển hướng người dùng nếu họ đã đăng nhập rồi
    useEffect(() => {
        if (user) {
            router.push('/');
        }
    }, [user, router]);

    // Hàm xử lý việc submit form
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return; // Ngăn chặn việc click nhiều lần

        setIsSubmitting(true); // Bắt đầu quá trình submit, vô hiệu hóa nút

        try {
            // Gọi hàm login từ context.
            // Logic xử lý lỗi và hiển thị toast đã nằm trong AuthContext.
            await login({ email, password });

            // Nếu thành công, AuthContext sẽ tự động chuyển hướng.
            // Chúng ta không cần thêm router.push('/') ở đây nữa.

        } catch (err) {
            // Bắt lỗi ở đây để ngăn chặn "Uncaught (in promise)" trong console.
            // Chúng ta không cần làm gì cả vì AuthContext đã xử lý việc hiển thị lỗi.
            console.error("Login attempt failed:", err);
        } finally {
            // QUAN TRỌNG: Khối này luôn được thực thi sau khi try/catch kết thúc.
            // Kích hoạt lại nút submit dù cho đăng nhập thành công hay thất bại.
            setIsSubmitting(false);
        }
    };

    // Nếu AuthContext vẫn đang kiểm tra session ban đầu, hiển thị màn hình loading
    if (isLoading || user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-gray-100">
                <p className="text-xl text-gray-700">Đang tải...</p>
            </div>
        );
    }

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
                        <label htmlFor="password" className="text-sm font-bold text-gray-600">
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
                            className="flex items-center justify-center w-full px-4 py-2 tracking-wide text-white transition-colors duration-200 transform bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:bg-indigo-600 disabled:bg-indigo-400 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Đang xử lý...
                                </>
                            ) : (
                                'Đăng nhập'
                            )}
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
