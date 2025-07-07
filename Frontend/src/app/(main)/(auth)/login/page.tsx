// app/(main)/(auth)/login/page.tsx

"use client";

import { useState, FormEvent, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// 1. Import hook để sử dụng context
import { useAuth } from '@/context/AuthContext';
// 2. Import component Form 2FA chúng ta vừa tạo
import TwoFactorChallengeForm from './components/TwoFactorChallengePage';

export default function LoginPage() {
    // Lấy các state và hàm cần thiết từ AuthContext
    // requiresTwoFactor sẽ quyết định chúng ta hiển thị cái gì
    const { login, error, user, isLoading, requiresTwoFactor, cancelTwoFactor } = useAuth();

    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Chuyển hướng người dùng nếu họ đã đăng nhập rồi
    useEffect(() => {
        if (user) {
            router.push('/');
        }
    }, [user, router]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);
        try {
            await login({ email, password });
            // Logic chuyển hướng hoặc hiển thị form 2FA sẽ do context và điều kiện render bên dưới xử lý
        } catch (err) {
            console.error("Login attempt failed:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Toàn bộ màn hình được bọc trong một flex container
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            {/* 
              Đây là logic hiển thị có điều kiện.
              Nếu `requiresTwoFactor` là true, hiển thị form 2FA.
              Nếu không, hiển thị form đăng nhập.
            */}
            {requiresTwoFactor ? (
                <TwoFactorChallengeForm onCancel={cancelTwoFactor} />
            ) : (
                <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-xl">
                    <div className="text-center">
                        <h2 className="text-3xl font-extrabold text-gray-900">
                            Đăng Nhập
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            để tiếp tục trải nghiệm mua sắm tuyệt vời!
                        </p>
                    </div>

                    {error && (
                        <div className="p-3 text-sm text-red-700 bg-red-100 border-l-4 border-red-500" role="alert">
                            <p className="font-bold">Lỗi:</p>
                            <p>{error}</p>
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label className="text-sm font-bold text-gray-600" htmlFor="email">Email</label>
                            <input
                                id="email" type="email" required
                                value={email} onChange={(e) => setEmail(e.target.value)}
                                className="block w-full px-4 py-2 mt-1 border rounded-md"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-bold text-gray-600" htmlFor="password">Mật khẩu</label>
                            <input
                                id="password" type="password" required
                                value={password} onChange={(e) => setPassword(e.target.value)}
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
            )}
        </div>
    );
}
