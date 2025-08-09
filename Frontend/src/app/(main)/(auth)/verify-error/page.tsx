"use client";

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { XCircle } from 'lucide-react';
import { Suspense } from 'react';

function ErrorContent() {
    const searchParams = useSearchParams();
    const message = searchParams.get('message') || 'Đã có lỗi xảy ra.';

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 text-center bg-white rounded-lg shadow-xl">
                <XCircle className="w-16 h-16 mx-auto text-red-500" />
                <h2 className="mt-6 text-2xl font-bold text-gray-800">Xác thực thất bại</h2>
                <p className="mt-4 text-gray-600">{message}</p>
                <Link href="/login" className="inline-block mt-8 px-6 py-3 text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                    Quay lại trang Đăng nhập
                </Link>
            </div>
        </div>
    );
}

// Bọc bằng Suspense
export default function VerifyErrorPage() {
    return (
        <Suspense fallback={<div>Đang tải...</div>}>
            <ErrorContent />
        </Suspense>
    );
}
