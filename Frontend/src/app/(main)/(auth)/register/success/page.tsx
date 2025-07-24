// app/(main)/(auth)/register/success/page.tsx

"use client";

import Link from 'next/link';
import { MailCheck } from 'lucide-react';

export default function RegisterSuccessPage() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 text-center bg-white rounded-lg shadow-xl">
                <div className="flex justify-center mb-6">
                    <div className="p-4 bg-green-100 rounded-full">
                        <MailCheck className="w-12 h-12 text-green-600" />
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-800">
                    Đăng ký thành công!
                </h2>
                <p className="mt-4 text-gray-600">
                    Cảm ơn bạn đã đăng ký. Một email xác thực đã được gửi đến địa chỉ của bạn. Vui lòng kiểm tra hộp thư đến (và cả thư mục spam) để hoàn tất quá trình.
                </p>

                <div className="mt-8">
                    <Link
                        href="/login"
                        className="w-full px-6 py-3 tracking-wide text-white transition-colors duration-200 transform bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:bg-indigo-600"
                    >
                        Quay lại trang Đăng nhập
                    </Link>
                </div>
            </div>
        </div>
    );
}
