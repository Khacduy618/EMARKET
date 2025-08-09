'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FilterOptions {
    categories: string[];
    priceRange: { min: number; max: number };
    sortBy: 'newest' | 'price-asc' | 'price-desc' | 'best-selling' | 'rating';
}

interface ProductFilterProps {
    filters: FilterOptions;
    onFilterChange: (filters: Partial<FilterOptions>) => void;
}

export default function ProductFilter({ filters, onFilterChange }: ProductFilterProps) {
    const [expandedSections, setExpandedSections] = useState({
        category: true,
        price: true,
        rating: true,
    });

    const [priceRange, setPriceRange] = useState({
        min: filters.priceRange.min,
        max: filters.priceRange.max,
    });

    const categories = [
        'Điện thoại',
        'Laptop',
        'Tablet',
        'Phụ kiện',
        'Tai nghe',
        'Sạc cáp',
        'Ốp lưng',
        'Đồng hồ thông minh',
    ];

    const priceRanges = [
        { label: 'Dưới 1 triệu', min: 0, max: 1000000 },
        { label: '1 - 5 triệu', min: 1000000, max: 5000000 },
        { label: '5 - 10 triệu', min: 5000000, max: 10000000 },
        { label: '10 - 20 triệu', min: 10000000, max: 20000000 },
        { label: 'Trên 20 triệu', min: 20000000, max: 100000000 },
    ];

    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const handleCategoryChange = (category: string, checked: boolean) => {
        const newCategories = checked
            ? [...filters.categories, category]
            : filters.categories.filter(c => c !== category);
        
        onFilterChange({ categories: newCategories });
    };

    const handlePriceRangeSelect = (min: number, max: number) => {
        const newPriceRange = { min, max };
        setPriceRange(newPriceRange);
        onFilterChange({ priceRange: newPriceRange });
    };

    const handleCustomPriceChange = () => {
        onFilterChange({ priceRange: priceRange });
    };

    const clearFilters = () => {
        const defaultFilters = {
            categories: [],
            priceRange: { min: 0, max: 100000000 },
        };
        setPriceRange(defaultFilters.priceRange);
        onFilterChange(defaultFilters);
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-4 sticky top-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Bộ lọc</h3>
                <button
                    onClick={clearFilters}
                    className="text-sm text-orange-600 hover:text-orange-700"
                >
                    Xóa tất cả
                </button>
            </div>

            {/* Category Filter */}
            <div className="border-b border-gray-200 pb-4 mb-4">
                <button
                    onClick={() => toggleSection('category')}
                    className="flex items-center justify-between w-full text-left"
                >
                    <span className="font-medium text-gray-900">Danh mục</span>
                    {expandedSections.category ? (
                        <ChevronUp className="w-4 h-4 text-gray-500" />
                    ) : (
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                    )}
                </button>
                
                {expandedSections.category && (
                    <div className="mt-3 space-y-2">
                        {categories.map((category) => (
                            <label key={category} className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={filters.categories.includes(category)}
                                    onChange={(e) => handleCategoryChange(category, e.target.checked)}
                                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                                />
                                <span className="ml-2 text-sm text-gray-700">{category}</span>
                            </label>
                        ))}
                    </div>
                )}
            </div>

            {/* Price Filter */}
            <div className="border-b border-gray-200 pb-4 mb-4">
                <button
                    onClick={() => toggleSection('price')}
                    className="flex items-center justify-between w-full text-left"
                >
                    <span className="font-medium text-gray-900">Khoảng giá</span>
                    {expandedSections.price ? (
                        <ChevronUp className="w-4 h-4 text-gray-500" />
                    ) : (
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                    )}
                </button>
                
                {expandedSections.price && (
                    <div className="mt-3 space-y-2">
                        {priceRanges.map((range, index) => (
                            <button
                                key={index}
                                onClick={() => handlePriceRangeSelect(range.min, range.max)}
                                className={`block w-full text-left text-sm py-1 px-2 rounded hover:bg-gray-50 ${
                                    filters.priceRange.min === range.min && filters.priceRange.max === range.max
                                        ? 'text-orange-600 bg-orange-50'
                                        : 'text-gray-700'
                                }`}
                            >
                                {range.label}
                            </button>
                        ))}
                        
                        {/* Custom Price Range */}
                        <div className="mt-4 pt-3 border-t border-gray-100">
                            <div className="text-sm text-gray-700 mb-2">Tùy chỉnh</div>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    placeholder="Từ"
                                    value={priceRange.min || ''}
                                    onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) || 0 }))}
                                    onBlur={handleCustomPriceChange}
                                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                                />
                                <input
                                    type="number"
                                    placeholder="Đến"
                                    value={priceRange.max || ''}
                                    onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) || 100000000 }))}
                                    onBlur={handleCustomPriceChange}
                                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Rating Filter */}
            <div>
                <button
                    onClick={() => toggleSection('rating')}
                    className="flex items-center justify-between w-full text-left"
                >
                    <span className="font-medium text-gray-900">Đánh giá</span>
                    {expandedSections.rating ? (
                        <ChevronUp className="w-4 h-4 text-gray-500" />
                    ) : (
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                    )}
                </button>
                
                {expandedSections.rating && (
                    <div className="mt-3 space-y-2">
                        {[5, 4, 3, 2, 1].map((rating) => (
                            <label key={rating} className="flex items-center">
                                <input
                                    type="checkbox"
                                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                                />
                                <div className="ml-2 flex items-center">
                                    {Array.from({ length: 5 }, (_, index) => (
                                        <span
                                            key={index}
                                            className={`text-sm ${
                                                index < rating ? 'text-yellow-400' : 'text-gray-300'
                                            }`}
                                        >
                                            ★
                                        </span>
                                    ))}
                                    <span className="ml-1 text-sm text-gray-600">trở lên</span>
                                </div>
                            </label>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}