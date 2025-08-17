// app/(main)/(auth)/forgot-password/page.tsx

"use client";

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { KeyRound } from 'lucide-react';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // state để hiển thị thông báo thành công trên trang
    const [statusMessage, setStatusMessage] = useState<string | null>(null);

    const { forgotPassword } = useAuth();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);
        setStatusMessage(null); // Xóa thông báo cũ

        try {
            // Gọi hàm từ context
            await forgotPassword({ email: email });
            // Nếu thành công, toast sẽ hiện. Chúng ta cũng có thể set một thông báo tĩnh.
            setStatusMessage('Yêu cầu đã được gửi. Nếu email của bạn tồn tại trong hệ thống, bạn sẽ nhận được một link để đặt lại mật khẩu trong ít phút.');
        } catch (err) {
            // AuthContext đã xử lý toast báo lỗi.
            // Không cần làm gì ở đây.
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-xl">
                <div className="text-center">
                    <div className="flex justify-center mb-4">
                        <KeyRound className="w-12 h-12 text-indigo-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">
                        Quên Mật khẩu?
                    </h2>
                    <p className="mt-2 text-gray-600">
                        Đừng lo lắng! Hãy nhập email của bạn và chúng tôi sẽ gửi một link để bạn đặt lại mật khẩu.
                    </p>
                </div>

                {/* Form sẽ bị ẩn đi sau khi gửi thành công */}
                {!statusMessage ? (
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
                                className="block w-full px-4 py-2 mt-1 text-gray-700 bg-gray-50 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                placeholder="you@example.com"
                            />
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full px-4 py-3 tracking-wide text-white transition-colors duration-200 transform bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:bg-indigo-600 disabled:bg-indigo-400"
                            >
                                {isSubmitting ? 'Đang xử lý...' : 'Gửi link reset'}
                            </button>
                        </div>
                    </form>
                ) : (
                    // Hiển thị thông báo thành công
                    <div className="p-4 text-center text-green-800 bg-green-100 border border-green-200 rounded-md">
                        <p>{statusMessage}</p>
                    </div>
                )}

                <p className="text-sm text-center text-gray-600">
                    Chợt nhớ ra?{' '}
                    <Link href="/signin" className="font-medium text-indigo-600 hover:underline">
                        Quay lại Đăng nhập
                    </Link>
                </p>
            </div>
        </div>
    );
}
