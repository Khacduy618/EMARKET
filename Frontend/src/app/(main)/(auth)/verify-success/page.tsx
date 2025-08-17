"use client";

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import { Suspense } from 'react';

function SuccessContent() {
    const searchParams = useSearchParams();
    const message = searchParams.get('message') || 'Tài khoản của bạn đã được kích hoạt thành công!';

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 text-center bg-white rounded-lg shadow-xl">
                <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
                <h2 className="mt-6 text-2xl font-bold text-gray-800">Thành công!</h2>
                <p className="mt-4 text-gray-600">{message}</p>
                <Link href="/signin" className="inline-block mt-8 px-6 py-3 text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                    Đi đến trang Đăng nhập
                </Link>
            </div>
        </div>
    );
}

// Bọc bằng Suspense vì dùng useSearchParams
export default function VerifySuccessPage() {
    return (
        <Suspense fallback={<div>Đang tải...</div>}>
            <SuccessContent />
        </Suspense>
    );
}
