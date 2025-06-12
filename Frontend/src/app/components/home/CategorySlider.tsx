// src/components/home/CategoryMenu.tsx (Phiên bản chỉ dành cho Desktop)
'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

type Category = {
    CategoryID: number;
    Name: string;
    ImageURL: string | null;
    IsActive: boolean;
};

export default function CategoryMenu() { // <-- Không có props isOpen, onClose
    const [categories, setCategories] = useState<Category[]>([]);
    const [activeCategory, setActiveCategory] = useState<number | null>(null);

    useEffect(() => {
        axios.get('http://localhost:8001/api/categorySubMenu')
            .then((response) => {
                const activeCategories = response.data.filter((cat: Category) => cat.IsActive);
                setCategories(activeCategories);
                if (activeCategories.length > 0) setActiveCategory(activeCategories[0].CategoryID);
            })
            .catch((error) => console.error('Lỗi khi tải danh mục:', error));
    }, []);

    const handleCategoryClick = (categoryId: number) => {
        setActiveCategory(categoryId);
    };

    return (
        <div className="w-full bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-base font-bold mb-3 text-gray-800">Danh mục</h2>
            <ul className="space-y-1">
                {categories.map((cat) => (
                    <li key={cat.CategoryID}>
                        <a
                            href="#"
                            onClick={(e) => { e.preventDefault(); handleCategoryClick(cat.CategoryID); }}
                            className={`flex items-center p-2 text-sm font-medium rounded-md transition-colors ${activeCategory === cat.CategoryID
                                ? 'bg-orange-100 text-orange-600'
                                : 'text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            {cat.ImageURL && (
                                <img
                                    src={cat.ImageURL.startsWith('http') ? cat.ImageURL : `http://localhost:8001${cat.ImageURL}`}
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
    );
}