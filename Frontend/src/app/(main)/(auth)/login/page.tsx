// app/(main)/(auth)/login/page.tsx
"use client";

import { useState, FormEvent, useEffect } from 'react';
import { getCsrfCookie } from '@/services/auth'; // << Phải import hàm này
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
    // useEffect để đảm bảo cookie được lấy khi trang tải
    useEffect(() => {
        getCsrfCookie();
    }, []);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login, error } = useAuth();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        await login({ email, password });
        setIsSubmitting(false);
    };


    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900">
                        Chào mừng trở lại!
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Đăng nhập để tiếp tục mua sắm
                    </p>
                </div>

                {/* Vùng hiển thị lỗi */}
                {error && (
                    <div className="p-3 text-sm text-red-800 bg-red-100 border border-red-200 rounded-lg">
                        {error}
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4 rounded-md shadow-sm">
                        <div>
                            <label htmlFor="email-address" className="sr-only">
                                Địa chỉ Email
                            </label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Địa chỉ Email"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">
                                Mật khẩu
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Mật khẩu"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end">
                        <div className="text-sm">
                            <Link href="/forgot-password">
                                <span className="font-medium text-indigo-600 cursor-pointer hover:text-indigo-500">
                                    Quên mật khẩu?
                                </span>
                            </Link>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="relative flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md group hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
                        >
                            {isSubmitting ? 'Đang xử lý...' : 'Đăng nhập'}
                        </button>
                    </div>
                </form>

                <p className="mt-4 text-sm text-center text-gray-600">
                    Chưa có tài khoản?{' '}
                    <Link href="/register">
                        <span className="font-medium text-indigo-600 cursor-pointer hover:text-indigo-500">
                            Đăng ký ngay
                        </span>
                    </Link>
                </p>
            </div>
        </div>
    );
}

