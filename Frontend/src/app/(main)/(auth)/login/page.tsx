// app/(main)/(auth)/login/page.tsx

"use client";

import { useState, FormEvent, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-toastify';
import Image from 'next/image';

// --- TIỆN ÍCH VALIDATION ---

const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};
const startsWithNumber = (email: string) => {
    return /^[0-9]/.test(email);
};

export default function LoginPage() {
    const { login, error: apiError, user, resendVerificationEmail } = useAuth();
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showResendLink, setShowResendLink] = useState(false);

    useEffect(() => {
        if (user) {
            router.push('/');
        }
    }, [user, router]);

    // Kiểm tra form có hợp lệ không để kích hoạt nút Đăng nhập
    const isFormValid = useMemo(() => {
        // Chỉ cần validate cơ bản ở đây, validate chi tiết sẽ thực hiện khi submit
        return email.length > 0 && password.length > 0;
    }, [email, password]);

    const validateForm = (): boolean => {
        const newErrors: { email?: string; password?: string } = {};
        let isValid = true;

        if (!email.trim()) {
            newErrors.email = "Vui lòng nhập email của bạn.";
            isValid = false;
        } else if (startsWithNumber(email)) {
            newErrors.email = "Email không được bắt đầu bằng số.";
            isValid = false;
        } else if (!isValidEmail(email)) {
            newErrors.email = "Định dạng email không hợp lệ.";
            isValid = false;
        }

        if (!password.trim()) {
            newErrors.password = "Vui lòng nhập mật khẩu của bạn.";
            isValid = false;
        } else if (password.length < 8) {
            newErrors.password = "Mật khẩu phải có ít nhất 8 ký tự.";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        console.log("Submitting with:", { email, password });
        setShowResendLink(false);

        if (!validateForm()) return;
        if (isSubmitting) return;

        setIsSubmitting(true);
        try {
            await login({ email, password });
        } catch (err: any) {
            const message = err.response?.data?.message || '';
            if (message.includes('xác minh email')) {
                setShowResendLink(true);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResendVerification = async () => {
        if (!email) {
            toast.error("Vui lòng nhập địa chỉ email vào ô bên trên.");
            return;
        }
        await resendVerificationEmail(email);
        setShowResendLink(false);
    };

    return (
        <div className="flex min-h-screen bg-white">
            {/* --- Cột bên trái - Hình ảnh --- */}
            <div className="hidden lg:flex w-1/2 items-center justify-center bg-gray-50 p-12">
                <Image
                    src="/images/app-logo.jpg" // Đặt ảnh của bạn vào thư mục /public
                    alt="EMARKET - Mua sắm trực tuyến"
                    width={550}
                    height={550}
                    className="object-contain"
                    priority
                />
            </div>

            {/* --- Cột bên phải - Form --- */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <div className="w-full max-w-sm">
                    <div className="text-left mb-10">
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                            Đăng nhập vào EMARKET
                        </h2>
                        <p className="mt-2 text-sm text-gray-500">
                            Nhập thông tin của bạn bên dưới
                        </p>
                    </div>

                    {apiError && !showResendLink && (
                        <div className="mb-4 p-3 text-sm text-red-700 bg-red-100 rounded-md" role="alert">
                            {apiError}
                        </div>
                    )}
                    {showResendLink && (
                        <div className="mb-4 text-center text-sm p-3 bg-yellow-50 rounded-md">
                            <span className="text-yellow-800">Tài khoản chưa được kích hoạt. </span>
                            <button onClick={handleResendVerification} className="font-semibold text-indigo-600 hover:underline">
                                Gửi lại email?
                            </button>
                        </div>
                    )}

                    <form className="space-y-8" onSubmit={handleSubmit} noValidate>
                        <div>
                            <input
                                id="email"
                                type="text"
                                autoComplete="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
                                    setShowResendLink(false);
                                }}
                                onBlur={validateForm}
                                className={`w-full py-2 bg-transparent border-b-2 ${errors.email ? 'border-red-500' : 'border-gray-300'} text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-600 transition-colors`}
                            />
                            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                        </div>

                        <div>
                            <input
                                id="password"
                                type="password"
                                autoComplete="current-password"
                                placeholder="Mật khẩu"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
                                }}
                                onBlur={validateForm}
                                className={`w-full py-2 bg-transparent border-b-2 ${errors.password ? 'border-red-500' : 'border-gray-300'} text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-600 transition-colors`}
                            />
                            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
                        </div>

                        <div className="flex items-center justify-between pt-4">
                            <button
                                type="submit"
                                disabled={isSubmitting || !isFormValid}
                                className="px-10 py-3 font-medium text-white bg-red-500 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-300 disabled:cursor-not-allowed transition-colors"
                            >
                                {isSubmitting ? 'Đang xử lý...' : 'Đăng nhập'}
                            </button>
                            <Link href="/forgot-password" className="text-sm font-medium text-red-500 hover:text-red-400">
                                Quên Mật khẩu?
                            </Link>
                        </div>
                    </form>

                    <p className="mt-10 text-center text-sm text-gray-500">
                        Chưa có tài khoản?{' '}
                        <Link href="/register" className="font-semibold leading-6 text-gray-500 hover:text-gray-900 underline">
                            Đăng ký
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}