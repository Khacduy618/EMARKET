// app/(main)/(auth)/reset-password/page.tsx

"use client";

import { useState, FormEvent, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ResetPasswordPayload } from '@/types';
import { KeyRound } from 'lucide-react';

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { resetPassword } = useAuth();

    // States cho dữ liệu từ form và URL
    const [email, setEmail] = useState('');
    const [token, setToken] = useState<string | null>(null);
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');

    // States cho việc quản lý UI
    const [formError, setFormError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        // ---- BẮT ĐẦU GHI LOG ----
        console.log("=====================================");
        console.log("useEffect trong ResetPasswordForm đã chạy!");

        // In ra toàn bộ URL mà component đang thấy
        console.log("URL hiện tại:", window.location.href);

        // Dùng một cách khác để parse URL, để so sánh
        const url = new URL(window.location.href);
        const tokenFromUrl = url.searchParams.get('token');
        const emailFromUrl = url.searchParams.get('email');

        console.log("Đã đọc từ URL:");
        console.log("-> Token:", tokenFromUrl);
        console.log("-> Email:", emailFromUrl);
        console.log("=====================================");
        // ---- KẾT THÚC GHI LOG ----

        if (tokenFromUrl && emailFromUrl) {
            console.log("SUCCESS: Tìm thấy cả Token và Email. Đang set state...");
            setToken(tokenFromUrl);
            setEmail(emailFromUrl);
            // Tạm thời comment dòng này lại để URL không bị thay đổi trong lúc debug
            // window.history.replaceState(null, '', window.location.pathname);
        } else {
            console.error("ERROR: Không tìm thấy Token hoặc Email trên URL!");
            setFormError("URL không hợp lệ hoặc đã hết hạn. Vui lòng thử lại từ đầu.");
            setTimeout(() => router.push('/forgot-password'), 3000);
        }

    }, [router]); // Bỏ searchParams đi để đảm bảo chỉ chạy 1 lần lúc đầu

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setFormError(null);

        if (password !== passwordConfirmation) {
            setFormError('Mật khẩu xác nhận không khớp.');
            return;
        }

        if (!token || !email) {
            setFormError("Thông tin không hợp lệ để reset mật khẩu.");
            return;
        }

        setIsSubmitting(true);
        const payload: ResetPasswordPayload = {
            token,
            email,
            password,
            password_confirmation: passwordConfirmation
        };

        try {
            await resetPassword(payload);
        } catch (error) {
            // lỗi đã được xử lý bởi context, chỉ cần log ra để debug
            console.error("Reset password failed:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Nếu token chưa được load, hiển thị màn hình loading hoặc lỗi
    if (!token) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="p-8 text-center bg-white rounded-lg shadow-lg max-w-sm">
                    <p className="text-gray-700 text-lg">{formError || "Đang xác thực link..."}</p>
                    {formError && <p className="mt-4 text-sm text-gray-500">Đang chuyển hướng...</p>}
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-xl">
                <div className="text-center">
                    <KeyRound className="w-12 h-12 mx-auto text-indigo-600" />
                    <h2 className="mt-4 text-2xl font-bold text-gray-800">Đặt Lại Mật Khẩu</h2>
                    <p className="mt-2 text-gray-600">Nhập mật khẩu mới cho tài khoản của bạn.</p>
                </div>

                {formError && (
                    <div className="p-3 text-sm text-red-700 bg-red-100 border-l-4 border-red-500" role="alert">
                        <p className="font-bold">Đã xảy ra lỗi:</p>
                        <p>{formError}</p>
                    </div>
                )}

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label className="text-sm font-bold text-gray-600">Tài khoản Email</label>
                        <input
                            type="email"
                            readOnly
                            value={email}
                            className="block w-full px-4 py-2 mt-1 text-gray-500 bg-gray-200 border border-gray-300 rounded-md cursor-not-allowed focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-bold text-gray-600">Mật khẩu mới</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="block w-full px-4 py-2 mt-1 text-gray-700 bg-gray-50 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-300"
                            placeholder="Nhập ít nhất 8 ký tự"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-bold text-gray-600">Xác nhận mật khẩu mới</label>
                        <input
                            type="password"
                            required
                            value={passwordConfirmation}
                            onChange={(e) => setPasswordConfirmation(e.target.value)}
                            className="block w-full px-4 py-2 mt-1 text-gray-700 bg-gray-50 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-300"
                            placeholder="Nhập lại mật khẩu mới"
                        />
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex items-center justify-center w-full px-4 py-3 mt-2 font-semibold tracking-wide text-white transition-colors duration-200 transform bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:bg-indigo-600 disabled:bg-indigo-400 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Đang lưu...
                                </>
                            ) : 'Lưu mật khẩu mới'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen text-lg">
                Đang tải trang...
            </div>
        }>
            <ResetPasswordForm />
        </Suspense>
    );
}
