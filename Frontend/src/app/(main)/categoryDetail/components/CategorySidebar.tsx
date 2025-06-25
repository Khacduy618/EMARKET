// app/categoryDetail/components/CategorySidebar.tsx
'use client';
import Link from 'next/link';
import { useState, useMemo } from 'react';

// ====================================================================
// ĐỊNH NGHĨA TYPESCRIPT (Không đổi)
// ====================================================================
interface Category {
    CategoryID: number;
    Name: string;
    ParentCategoryID: number | null;
    children?: Category[];
}

interface CategorySidebarProps {
    categoryTree: Category[];
    activeCategoryId: number;
}

const findCategoryPath = (categories: Category[], targetId: number): number[] => {
    for (const category of categories) {
        if (category.CategoryID === targetId) return [category.CategoryID];
        if (category.children) {
            const path = findCategoryPath(category.children, targetId);
            if (path.length > 0) return [category.CategoryID, ...path];
        }
    }
    return [];
};

export default function CategorySidebar({ categoryTree, activeCategoryId }: CategorySidebarProps) {
    const initialOpenCategories = useMemo(
        () => findCategoryPath(categoryTree, activeCategoryId),
        [categoryTree, activeCategoryId]
    );

    const [openCategories, setOpenCategories] = useState<number[]>(initialOpenCategories);

    const renderCategory = (category: Category) => {
        const isActive = category.CategoryID === activeCategoryId;
        const isOpen = openCategories.includes(category.CategoryID);
        const hasChildren = category.children && category.children.length > 0;

        // ===> SỬA LOGIC Ở ĐÂY <===
        const handleToggle = (e: React.MouseEvent) => {
            // Chỉ xử lý logic đặc biệt cho các danh mục có con
            if (hasChildren) {
                // Nếu click vào chính danh mục đang active,
                // thì chỉ toggle đóng/mở và không điều hướng lại trang.
                if (isActive) {
                    e.preventDefault();
                }

                // Luôn thực hiện việc toggle state
                setOpenCategories(prev =>
                    prev.includes(category.CategoryID)
                        ? prev.filter(id => id !== category.CategoryID)
                        : [...prev, category.CategoryID]
                );

                // Nếu click vào danh mục cha khác, e.preventDefault() sẽ không được gọi,
                // và <Link> sẽ tự động điều hướng.
            }
        };

        return (
            <li key={category.CategoryID} className="flex flex-col">
                <Link
                    href={`/categoryDetail/${category.CategoryID}`}
                    onClick={handleToggle}
                    className={`block p-1 text-sm rounded-sm transition-colors ${isActive ? 'text-red-500 font-semibold' : 'text-gray-800 hover:text-red-500'}`}
                >
                    {category.Name}
                </Link>

                {hasChildren && isOpen && (
                    <ul className="pl-4 mt-1 space-y-1">
                        {category.children?.map(child => renderCategory(child))}
                    </ul>
                )}
            </li>
        );
    };

    return (
        <div className="bg-white p-4 rounded-md shadow-sm">
            <h3 className="font-bold text-gray-800 mb-2 pb-2 border-b">
                DANH MỤC
            </h3>
            <ul className="space-y-1">
                {categoryTree.map(cat => renderCategory(cat))}
            </ul>
        </div>
    );
}