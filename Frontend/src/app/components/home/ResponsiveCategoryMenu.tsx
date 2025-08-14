// src/components/home/ResponsiveCategoryMenu.tsx (TẠO FILE MỚI)

'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { getFullImageUrl, getPublicImageUrl } from '@/services/api';
import { API_URL } from '@/lib/config';

type Category = {
    CategoryID: number;
    Name: string;
    ImageURL: string | null;
    IsActive: boolean;
};

// Component này sẽ nhận props để điều khiển trạng thái từ bên ngoài
type ResponsiveCategoryMenuProps = {
    isOpen: boolean;
    onClose: () => void;
};

export default function ResponsiveCategoryMenu({ isOpen, onClose }: ResponsiveCategoryMenuProps) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [activeCategory, setActiveCategory] = useState<number | null>(null);

    useEffect(() => {
        axios
            .get(`${API_URL}/categorySubMenu`)
            .then((response) => {
                const activeCategories = response.data.filter((cat: Category) => cat.IsActive);
                setCategories(activeCategories);
                if (activeCategories.length > 0) {
                    setActiveCategory(activeCategories[0].CategoryID);
                }
            })
            .catch((error) => console.error('Lỗi khi tải danh mục:', error));
    }, []);

    const handleCategoryClick = (categoryId: number) => {
        setActiveCategory(categoryId);
        onClose(); // Tự động đóng menu sau khi người dùng chọn
    };

    // Component này chỉ render trên mobile, nên ta dùng lg:hidden
    return (
        <div className="lg:hidden">
            {/* Lớp phủ mờ phía sau */}
            <div
                className={`fixed inset-0 bg-black/50 z-40 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={onClose}
            ></div>

            {/* Khối menu chính */}
            <aside
                className={`fixed top-0 left-0 h-full w-72 bg-white shadow-xl z-50
                            transition-transform duration-300 ease-in-out
                            ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <div className="p-4 h-full overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold text-gray-800">Danh mục</h2>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <ul className="space-y-1">
                        {categories.map((cat) => (
                            <li key={cat.CategoryID}>
                                <a
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleCategoryClick(cat.CategoryID);
                                    }}
                                    className={`flex items-center p-2 text-sm font-medium rounded-md transition-colors ${activeCategory === cat.CategoryID
                                        ? 'bg-orange-100 text-orange-600'
                                        : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    {cat.ImageURL && (
                                        <img
                                            src={getPublicImageUrl(cat.ImageURL)}
                                            alt={cat.Name}
                                            className="w-5 h-5 mr-3 object-contain"
                                        />
                                    )}
                                    <span>{cat.Name}</span>
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            </aside>
        </div>
    );
}