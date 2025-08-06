'use client';

import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface SortBarProps {
    sortBy: 'newest' | 'price-asc' | 'price-desc' | 'best-selling' | 'rating';
    onSortChange: (sortBy: 'newest' | 'price-asc' | 'price-desc' | 'best-selling' | 'rating') => void;
}

export default function SortBar({ sortBy, onSortChange }: SortBarProps) {
    const [isOpen, setIsOpen] = useState(false);

    const sortOptions = [
        { value: 'newest', label: 'Mới nhất' },
        { value: 'best-selling', label: 'Bán chạy nhất' },
        { value: 'price-asc', label: 'Giá thấp đến cao' },
        { value: 'price-desc', label: 'Giá cao đến thấp' },
        { value: 'rating', label: 'Đánh giá cao nhất' },
    ] as const;

    const currentSort = sortOptions.find(option => option.value === sortBy);

    return (
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                    Sản phẩm của cửa hàng
                </h2>
                
                <div className="relative">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
                    >
                        <span className="text-sm text-gray-700">
                            Sắp xếp: {currentSort?.label}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isOpen && (
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                            {sortOptions.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => {
                                        onSortChange(option.value);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                                        sortBy === option.value ? 'text-orange-600 bg-orange-50' : 'text-gray-700'
                                    }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}