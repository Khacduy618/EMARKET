// app/categoryDetail/components/SortBar.tsx
'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

// --- Cấu hình các lựa chọn sắp xếp ---
// Các `key` này phải khớp chính xác với những gì Backend của bạn mong đợi
const buttonOptions = [
    { key: 'popular', label: 'Phổ Biến' },
    { key: 'newest', label: 'Mới Nhất' },
    { key: 'bestselling', label: 'Bán Chạy' },
];

const priceOptions = [
    { key: 'price_asc', label: 'Giá: Thấp đến Cao' },
    { key: 'price_desc', label: 'Giá: Cao đến Thấp' },
];

export default function SortBar() {
    // Hooks để tương tác với URL
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Lấy giá trị 'sort' hiện tại từ URL, nếu không có thì mặc định là 'popular'
    const currentSort = searchParams.get('sort') || 'popular';

    /**
     * Hàm xử lý khi người dùng chọn một kiểu sắp xếp mới.
     * Nó sẽ cập nhật URL, và trang cha sẽ tự động gọi lại API.
     * @param sortKey Key của kiểu sắp xếp (ví dụ: 'newest', 'price_asc')
     */
    const handleSortChange = (sortKey: string) => {
        // Nếu người dùng click vào nút đã active thì không làm gì cả
        if (sortKey === currentSort) return;

        // Tạo một đối tượng URLSearchParams mới để dễ dàng quản lý
        // quan trọng: new URLSearchParams(searchParams.toString()) để giữ lại các filter khác nếu có
        const params = new URLSearchParams(searchParams.toString());

        // Đặt giá trị sort mới
        params.set('sort', sortKey);

        // Rất quan trọng: Khi đổi kiểu sắp xếp, luôn reset về trang 1
        params.set('page', '1');

        // Điều hướng đến URL mới mà không tải lại toàn bộ trang
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="bg-white p-3 rounded-md flex items-center gap-4 text-sm shadow-sm border border-gray-200 flex-wrap">
            <span className="text-gray-600 font-medium">Sắp xếp theo</span>
            <div className="flex items-center gap-2 flex-wrap">
                {/* Render các nút bấm chính */}
                {buttonOptions.map(option => (
                    <button
                        key={option.key}
                        onClick={() => handleSortChange(option.key)}
                        className={`px-4 py-1.5 rounded-sm transition-colors duration-200 ${currentSort === option.key
                            ? 'bg-red-500 text-white shadow-sm' // Style khi active
                            : 'bg-gray-100 text-gray-800 hover:bg-red-50' // Style mặc định
                            }`}
                    >
                        {option.label}
                    </button>
                ))}

                {/* Render Dropdown cho giá */}
                <select
                    value={currentSort.startsWith('price_') ? currentSort : ''}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="px-4 py-1.5 rounded-sm bg-white border border-gray-300 focus:border-red-500 focus:ring-red-500 transition-colors"
                >
                    <option value="" disabled className="text-gray-400">
                        Giá
                    </option>
                    {priceOptions.map(option => (
                        <option key={option.key} value={option.key}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}