// app/categoryDetail/components/PriceRangeFilter.tsx
'use client';

import { useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export default function PriceRangeFilter() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [minPrice, setMinPrice] = useState(searchParams.get('min_price') || '');
    const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '');

    const handleApplyFilter = () => {
        const params = new URLSearchParams(searchParams.toString());
        if (minPrice) params.set('min_price', minPrice); else params.delete('min_price');
        if (maxPrice) params.set('max_price', maxPrice); else params.delete('max_price');
        params.set('page', '1');
        router.push(`${pathname}?${params.toString()}`);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') handleApplyFilter();
    };

    return (
        <div className="space-y-3">
            <h4 className="font-semibold text-sm text-gray-600">Khoảng Giá</h4>
            <div className="flex items-center gap-2">
                <input
                    type="number"
                    placeholder="₫ TỪ"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-sm focus:border-red-500 focus:ring-red-500"
                />
                <span className="text-gray-400">-</span>
                <input
                    type="number"
                    placeholder="₫ ĐẾN"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-sm focus:border-red-500 focus:ring-red-500"
                />
            </div>
            <button
                onClick={handleApplyFilter}
                className="w-full bg-red-500 text-white py-1.5 rounded-sm text-sm hover:bg-red-600 transition-colors"
            >
                ÁP DỤNG
            </button>
        </div>
    );
}