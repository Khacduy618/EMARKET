// Frontend/src/app/admin/reviews/components/Pagination.tsx
"use client";

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { AdminReview } from './ReviewCard'; // Import để lấy kiểu dữ liệu

// Định nghĩa kiểu dữ liệu cho props
interface PaginatedData {
    current_page: number;
    last_page: number;
    total: number;
    from: number;
    to: number;
}

export function Pagination({ pagination }: { pagination: Omit<PaginatedData, 'data'> }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const handlePageChange = (page: number) => {
        // Chỉ thay đổi trang nếu nó nằm trong giới hạn hợp lệ
        if (page < 1 || page > pagination.last_page) {
            return;
        }
        
        // Tạo một bản sao của các query params hiện tại
        const params = new URLSearchParams(searchParams.toString());
        // Đặt hoặc cập nhật tham số 'page'
        params.set('page', page.toString());
        // Đẩy URL mới, Next.js sẽ tự động re-render
        router.push(`${pathname}?${params.toString()}`);
    };

    // Không hiển thị gì nếu chỉ có 1 trang
    if (pagination.last_page <= 1) {
        return null;
    }

    return (
        <div className="mt-8 flex items-center justify-between bg-white px-6 py-4 rounded-lg border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-700">
                Hiển thị từ <span className="font-medium">{pagination.from}</span> đến <span className="font-medium">{pagination.to}</span> của <span className="font-medium">{pagination.total}</span> kết quả
            </p>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => handlePageChange(pagination.current_page - 1)}
                    disabled={pagination.current_page === 1}
                    className="px-4 py-2 text-sm font-medium bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Trước
                </button>
                <span className="px-4 py-2 text-sm text-gray-600">
                    Trang {pagination.current_page} / {pagination.last_page}
                </span>
                <button
                    onClick={() => handlePageChange(pagination.current_page + 1)}
                    disabled={pagination.current_page === pagination.last_page}
                    className="px-4 py-2 text-sm font-medium bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Sau
                </button>
            </div>
        </div>
    );
};