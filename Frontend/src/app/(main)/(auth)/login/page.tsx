// app/(main)/(auth)/login/page.tsx

"use client";

import { useState, FormEvent, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-toastify';

export default function LoginPage() {
    // 1. Lấy tất cả các state và hàm cần thiết từ AuthContext
    const {
        login,
        error: apiError,
        user,
        resendVerificationEmail
    } = useAuth();

    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // State để quyết định có hiển thị nút "Gửi lại" hay không
    const [showResendLink, setShowResendLink] = useState(false);

    // useEffect để chuyển hướng người dùng nếu họ đã login rồi
    useEffect(() => {
        if (user) {
            router.push('/');
        }
    }, [user, router]);

    // Hàm xử lý khi submit form
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);
        setShowResendLink(false); // Ẩn link đi mỗi khi thử đăng nhập

        try {
            await login({ email, password });
            // Logic chuyển hướng khi login thành công hoặc cần 2FA đã được AuthContext xử lý
        } catch (err: any) {
            // Sau khi login thất bại, kiểm tra thông báo lỗi
            const message = err?.response?.data?.message || '';
            // Backend của bạn trả về: 'Bạn cần xác minh email trước khi đăng nhập.'
            // Chúng ta kiểm tra từ khóa 'xác minh email'
            if (message.includes('xác minh email')) {
                setShowResendLink(true); // Nếu đúng, hiển thị nút "Gửi lại"
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // Hàm xử lý khi click nút "Gửi lại email"
    const handleResendVerification = async () => {
        if (!email) {
            toast.error("Vui lòng nhập địa chỉ email của bạn vào ô bên trên.");
            return;
        }
        // Gọi hàm từ context
        await resendVerificationEmail(email);
        setShowResendLink(false); // Ẩn link đi sau khi đã gửi thành công
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

                {/* Khối hiển thị lỗi đăng nhập chung */}
                {apiError && !showResendLink && (
                    <div className="p-3 text-sm text-red-700 bg-red-100 border-l-4 border-red-500" role="alert">
                        <p>{apiError}</p>
                    </div>
                )}

                {/* Khối hiển thị đặc biệt khi cần xác thực email */}
                {showResendLink && (
                    <div className="p-4 text-center text-sm bg-yellow-50 border border-yellow-300 rounded-md">
                        <p className="text-yellow-800 mb-2">Tài khoản của bạn chưa được kích hoạt.</p>
                        <button onClick={handleResendVerification} className="font-semibold text-indigo-600 hover:underline">
                            Gửi lại email xác thực?
                        </button>
                    </div>
                )}

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label className="text-sm font-bold text-gray-600" htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            required
                            autoComplete="email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setShowResendLink(false); // Tự động ẩn link nếu người dùng thay đổi email
                            }}
                            className="block w-full px-4 py-2 mt-1 border rounded-md"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-bold text-gray-600" htmlFor="password">Mật khẩu</label>
                        <input
                            id="password"
                            type="password"
                            required
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="block w-full px-4 py-2 mt-1 border rounded-md"
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
                            className="w-full px-4 py-3 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400">
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
