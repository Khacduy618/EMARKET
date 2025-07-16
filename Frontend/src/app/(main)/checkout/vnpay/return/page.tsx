'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { Loader2 } from 'lucide-react';

export default function VnPayReturnPage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        const success = searchParams.get('success');
        const orderCode = searchParams.get('orderCode');

        if (success === 'true') {
            toast.success(`Thanh toán thành công cho đơn hàng ${orderCode}!`);
            router.push('/account/purchase?status=Processing');
        } else {
            toast.error(`Thanh toán cho đơn hàng ${orderCode} đã thất bại hoặc bị hủy.`);
            router.push('/checkout'); // Hoặc về trang chi tiết đơn hàng thất bại
        }
    }, [searchParams, router]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
            <p className="mt-4 text-lg">Đang xử lý kết quả thanh toán...</p>
        </div>
    );
}