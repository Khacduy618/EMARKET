
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react'; // Tùy chọn: tạo component loading

export default function SellerRootPage() {
    const router = useRouter();

    useEffect(() => {
        // Ngay khi component được render, thực hiện chuyển hướng
        router.replace('/seller/statistics');
    }, [router]);

    // Hiển thị một trạng thái loading trong khi chờ chuyển hướng
    // để tránh màn hình trắng
    return (
        <div className="flex items-center justify-center h-screen">
            <Loader2 /> 
            {/* Hoặc chỉ là một dòng text: <p>Đang chuyển hướng...</p> */}
        </div>
    );
}