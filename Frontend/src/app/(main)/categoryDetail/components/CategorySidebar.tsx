// // // app/categoryDetail/components/CategorySidebar.tsx
// // 'use client';
// // import Link from 'next/link';
// // import { useState, useMemo } from 'react';

// // // ====================================================================
// // // ĐỊNH NGHĨA TYPESCRIPT (Không đổi)
// // // ====================================================================
// // interface Category {
// //     CategoryID: number;
// //     Name: string;
// //     ParentCategoryID: number | null;
// //     children?: Category[];
// // }

// // interface CategorySidebarProps {
// //     categoryTree: Category[];
// //     activeCategoryId: number;
// // }

// // const findCategoryPath = (categories: Category[], targetId: number): number[] => {
// //     for (const category of categories) {
// //         if (category.CategoryID === targetId) return [category.CategoryID];
// //         if (category.children) {
// //             const path = findCategoryPath(category.children, targetId);
// //             if (path.length > 0) return [category.CategoryID, ...path];
// //         }
// //     }
// //     return [];
// // };

// // export default function CategorySidebar({ categoryTree, activeCategoryId }: CategorySidebarProps) {
// //     const initialOpenCategories = useMemo(
// //         () => findCategoryPath(categoryTree, activeCategoryId),
// //         [categoryTree, activeCategoryId]
// //     );

// //     const [openCategories, setOpenCategories] = useState<number[]>(initialOpenCategories);

// //     const renderCategory = (category: Category) => {
// //         const isActive = category.CategoryID === activeCategoryId;
// //         const isOpen = openCategories.includes(category.CategoryID);
// //         const hasChildren = category.children && category.children.length > 0;

// //         // ===> SỬA LOGIC Ở ĐÂY <===
// //         const handleToggle = (e: React.MouseEvent) => {
// //             // Chỉ xử lý logic đặc biệt cho các danh mục có con
// //             if (hasChildren) {
// //                 // Nếu click vào chính danh mục đang active,
// //                 // thì chỉ toggle đóng/mở và không điều hướng lại trang.
// //                 if (isActive) {
// //                     e.preventDefault();
// //                 }

// //                 // Luôn thực hiện việc toggle state
// //                 setOpenCategories(prev =>
// //                     prev.includes(category.CategoryID)
// //                         ? prev.filter(id => id !== category.CategoryID)
// //                         : [...prev, category.CategoryID]
// //                 );

// //                 // Nếu click vào danh mục cha khác, e.preventDefault() sẽ không được gọi,
// //                 // và <Link> sẽ tự động điều hướng.
// //             }
// //         };

// //         return (
// //             <li key={category.CategoryID} className="flex flex-col">
// //                 <Link
// //                     href={`/categoryDetail/${category.CategoryID}`}
// //                     onClick={handleToggle}
// //                     className={`block p-1 text-sm rounded-sm transition-colors ${isActive ? 'text-red-500 font-semibold' : 'text-gray-800 hover:text-red-500'}`}
// //                 >
// //                     {category.Name}
// //                 </Link>

// //                 {hasChildren && isOpen && (
// //                     <ul className="pl-4 mt-1 space-y-1">
// //                         {category.children?.map(child => renderCategory(child))}
// //                     </ul>
// //                 )}
// //             </li>
// //         );
// //     };

// //     return (
// //         <div className="bg-white p-4 rounded-md shadow-sm">
// //             <h3 className="font-bold text-gray-800 mb-2 pb-2 border-b">
// //                 DANH MỤC
// //             </h3>
// //             <ul className="space-y-1">
// //                 {categoryTree.map(cat => renderCategory(cat))}
// //             </ul>
// //         </div>
// //     );
// // }
// // app/categoryDetail/components/CategorySidebar.tsx
// 'use client';

// import Link from 'next/link';
// import { useState, useMemo } from 'react';
// import { useRouter } from 'next/navigation';

// // ====================================================================
// // ĐỊNH NGHĨA TYPESCRIPT (Giữ nguyên)
// // ====================================================================
// interface Category {
//     CategoryID: number;
//     Name: string;
//     ParentCategoryID: number | null;
//     children?: Category[];
// }

// interface CategoryFilter {
//     CategoryID: number;
//     Name: string;
//     products_count: number;
// }

// interface CategorySidebarProps {
//     categoryTree: Category[];
//     categoryFilters: CategoryFilter[];

//     activeCategoryId: number;
// }

// // ====================================================================
// // HÀM HELPER (Giữ nguyên)
// // ====================================================================
// const findCategoryPath = (categories: Category[], targetId: number): number[] => {
//     // ... code giữ nguyên
//     for (const category of categories) {
//         if (category.CategoryID === targetId) return [category.CategoryID];
//         if (category.children) {
//             const path = findCategoryPath(category.children, targetId);
//             if (path.length > 0) return [category.CategoryID, ...path];
//         }
//     }
//     return [];
// };

// const formatCount = (count: number) => {
//     // ... code giữ nguyên
//     if (count >= 1000) {
//         return `${Math.floor(count / 1000)}k+`;
//     }
//     return count.toString();
// };

// // ====================================================================
// // COMPONENT CHÍNH (Đã nâng cấp giao diện)
// // ====================================================================
// export default function CategorySidebar({
//     categoryTree,
//     categoryFilters,
//     activeCategoryId
// }: CategorySidebarProps) {
//     const router = useRouter();

//     const initialOpenCategories = useMemo(
//         () => findCategoryPath(categoryTree, activeCategoryId),
//         [categoryTree, activeCategoryId]
//     );
//     const [openCategories, setOpenCategories] = useState<number[]>(initialOpenCategories);

//     const handleFilterClick = (filterCategoryId: number) => {
//         router.push(`/categoryDetail/${filterCategoryId}`);
//     };

//     // Hàm render cây danh mục được Tinh Chỉnh Giao Diện
//     const renderCategory = (category: Category, level: number = 0) => {
//         const isActive = category.CategoryID === activeCategoryId;
//         const isOpen = openCategories.includes(category.CategoryID);
//         const hasChildren = category.children && category.children.length > 0;

//         const handleToggle = (e: React.MouseEvent) => {
//             if (hasChildren) {
//                 if (isActive) {
//                     e.preventDefault();
//                 }
//                 setOpenCategories(prev =>
//                     prev.includes(category.CategoryID)
//                         ? prev.filter(id => id !== category.CategoryID)
//                         : [...prev, category.CategoryID]
//                 );
//             }
//         };

//         return (
//             <li key={category.CategoryID}>
//                 <div className="flex items-center">
//                     {/* Thêm icon mũi tên cho danh mục có con */}
//                     {hasChildren && (
//                         <button onClick={handleToggle} className="p-1 -ml-1 text-gray-500 hover:text-gray-800">
//                             <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-90' : 'rotate-0'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//                             </svg>
//                         </button>
//                     )}
//                     <Link
//                         href={`/categoryDetail/${category.CategoryID}`}
//                         onClick={handleToggle}
//                         className={`block py-1 text-sm transition-colors w-full ${level > 0 && !hasChildren ? 'pl-5' : 'pl-1'} ${isActive ? 'text-red-500 font-semibold' : 'text-gray-700 hover:text-red-500'}`}
//                     >
//                         {category.Name}
//                     </Link>
//                 </div>

//                 {hasChildren && isOpen && (
//                     <ul className={`pl-5 mt-1 space-y-1`}>
//                         {category.children?.map(child => renderCategory(child, level + 1))}
//                     </ul>
//                 )}
//             </li>
//         );
//     };

//     return (
//         <div className="bg-white p-0 rounded-md shadow-sm">
//             {/* === PHẦN DANH MỤC SẢN PHẨM (Ở TRÊN) === */}
//             <div className="p-4">
//                 <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-base">
//                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
//                     </svg>
//                     DANH MỤC
//                 </h3>
//                 <ul className="space-y-1">
//                     {categoryTree.map(cat => renderCategory(cat))}
//                 </ul>
//             </div>

//             {/* Đường kẻ ngang phân cách */}
//             <hr className="my-2" />

//             {/* === PHẦN BỘ LỌC TÌM KIẾM (Ở DƯỚI) === */}
//             <div className="p-4">
//                 <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-base">
//                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
//                         <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
//                     </svg>
//                     BỘ LỌC TÌM KIẾM
//                 </h3>
//                 {/* Phần lọc theo danh mục con */}
//                 {categoryFilters && categoryFilters.length > 0 && (
//                     <div className="space-y-2 mt-3">
//                         <h4 className="font-semibold text-sm text-gray-600">Theo Danh Mục</h4>
//                         {categoryFilters.map((filter) => (
//                             <div key={filter.CategoryID} className="flex items-center">
//                                 <input
//                                     type="checkbox"
//                                     id={`filter-${filter.CategoryID}`}
//                                     className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer"
//                                     onClick={() => handleFilterClick(filter.CategoryID)}
//                                 />
//                                 <label
//                                     htmlFor={`filter-${filter.CategoryID}`}
//                                     className="ml-3 text-sm text-gray-700 cursor-pointer"
//                                     onClick={() => handleFilterClick(filter.CategoryID)}
//                                 >
//                                     {filter.Name} ({formatCount(filter.products_count)})
//                                 </label>
//                             </div>
//                         ))}
//                     </div>
//                 )}
//                 {/* Bạn có thể thêm các bộ lọc khác ở đây: Theo khoảng giá, theo thương hiệu, v.v. */}
//             </div>
//         </div>
//     );
// }
// app/(main)/categoryDetail/components/CategorySidebar.tsx
// 'use client';

// import Link from 'next/link';
// import { useState, useMemo } from 'react';
// import { usePathname, useRouter, useSearchParams } from 'next/navigation';
// import PriceRangeFilter from './PriceRangeFilter';

// // ====================================================================
// // ĐỊNH NGHĨA TYPESCRIPT
// // ====================================================================
// interface Category { CategoryID: number; Name: string; ParentCategoryID: number | null; children?: Category[]; }
// interface CategoryFilter { CategoryID: number; Name: string; products_count: number; }
// interface CategorySidebarProps {
//     categoryTree: Category[];
//     categoryFilters: CategoryFilter[];
//     activeCategoryId: number;
// }

// // ====================================================================
// // HÀM HELPER
// // ====================================================================
// const findCategoryPath = (categories: Category[], targetId: number): number[] => {
//     for (const category of categories) {
//         if (category.CategoryID === targetId) return [category.CategoryID];
//         if (category.children) {
//             const path = findCategoryPath(category.children, targetId);
//             if (path.length > 0) return [category.CategoryID, ...path];
//         }
//     }
//     return [];
// };
// const formatCount = (count: number) => {
//     if (count >= 1000) return `${Math.floor(count / 1000)}k+`;
//     return count.toString();
// };

// // ====================================================================
// // COMPONENT CHÍNH
// // ====================================================================
// export default function CategorySidebar({ categoryTree, categoryFilters, activeCategoryId }: CategorySidebarProps) {
//     const router = useRouter();
//     const pathname = usePathname();
//     const searchParams = useSearchParams();

//     // Logic cho cây danh mục
//     const initialOpenCategories = useMemo(() => findCategoryPath(categoryTree, activeCategoryId), [categoryTree, activeCategoryId]);
//     const [openCategories, setOpenCategories] = useState<number[]>(initialOpenCategories);

//     // Logic cho bộ lọc danh mục
//     const selectedCategoryIds = useMemo(() => {
//         const cats = searchParams.get('categories');
//         return cats ? cats.split(',').map(Number) : [];
//     }, [searchParams]);

//     const handleCategoryFilterChange = (filterCategoryId: number) => {
//         const newSelectedIds = new Set(selectedCategoryIds);
//         if (newSelectedIds.has(filterCategoryId)) {
//             newSelectedIds.delete(filterCategoryId);
//         } else {
//             newSelectedIds.add(filterCategoryId);
//         }

//         const params = new URLSearchParams(searchParams.toString());
//         if (newSelectedIds.size > 0) {
//             params.set('categories', Array.from(newSelectedIds).join(','));
//         } else {
//             params.delete('categories');
//         }
//         params.set('page', '1');
//         router.push(`${pathname}?${params.toString()}`);
//     };

//     // Hàm render cây danh mục
//     const renderCategory = (category: Category, level: number = 0) => {
//         const isActive = category.CategoryID === activeCategoryId && selectedCategoryIds.length === 0;
//         const isOpen = openCategories.includes(category.CategoryID);
//         const hasChildren = category.children && category.children.length > 0;

//         const handleToggle = (e: React.MouseEvent) => {
//             if (hasChildren) {
//                 if (isActive) e.preventDefault();
//                 setOpenCategories(prev => prev.includes(category.CategoryID) ? prev.filter(id => id !== category.CategoryID) : [...prev, category.CategoryID]);
//             }
//         };

//         return (
//             <li key={category.CategoryID}>
//                 <div className="flex items-center">
//                     {hasChildren && <button onClick={handleToggle} className="p-1 -ml-1 text-gray-500 hover:text-gray-800"><svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-90' : 'rotate-0'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></button>}
//                     <Link href={`/categoryDetail/${category.CategoryID}`} onClick={handleToggle} className={`block py-1 text-sm transition-colors w-full ${level > 0 && !hasChildren ? 'pl-5' : 'pl-1'} ${isActive ? 'text-red-500 font-semibold' : 'text-gray-700 hover:text-red-500'}`}>
//                         {category.Name}
//                     </Link>
//                 </div>
//                 {hasChildren && isOpen && <ul className={`pl-5 mt-1 space-y-1`}>{category.children?.map(child => renderCategory(child, level + 1))}</ul>}
//             </li>
//         );
//     };

//     return (
//         <div className="bg-white rounded-md shadow-sm">
//             <div className="p-4"><h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-base"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>DANH MỤC</h3><ul className="space-y-1">{categoryTree.map(cat => renderCategory(cat))}</ul></div>
//             <hr className="my-0" />
//             <div className="p-4"><h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-base"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" /></svg>BỘ LỌC TÌM KIẾM</h3>
//                 {categoryFilters.length > 0 && <div className="space-y-2 mt-3"><h4 className="font-semibold text-sm text-gray-600">Theo Danh Mục</h4>{categoryFilters.map((filter) => (<div key={filter.CategoryID} className="flex items-center"><input type="checkbox" id={`filter-${filter.CategoryID}`} checked={selectedCategoryIds.includes(filter.CategoryID)} onChange={() => handleCategoryFilterChange(filter.CategoryID)} className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer" /><label htmlFor={`filter-${filter.CategoryID}`} className="ml-3 text-sm text-gray-700 cursor-pointer">{filter.Name} ({formatCount(filter.products_count)})</label></div>))}</div>}
//                 <div className="mt-4 pt-4 border-t border-gray-200"><PriceRangeFilter /></div>
//             </div>
//         </div>
//     );
// }
// app/(main)/categoryDetail/components/CategorySidebar.tsx
'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import PriceRangeFilter from './PriceRangeFilter';

// ====================================================================
// ĐỊNH NGHĨA TYPESCRIPT
// ====================================================================
interface Category { CategoryID: number; Name: string; ParentCategoryID: number | null; children?: Category[]; }
interface CategoryFilter { CategoryID: number; Name: string; products_count: number; }
interface CategorySidebarProps {
    categoryTree: Category[];
    categoryFilters: CategoryFilter[];
    activeCategoryId: number;
}

// ====================================================================
// HÀM HELPER
// ====================================================================
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
const formatCount = (count: number) => {
    if (count >= 1000) return `${Math.floor(count / 1000)}k+`;
    return count.toString();
};

// ====================================================================
// COMPONENT CHÍNH
// ====================================================================
export default function CategorySidebar({ categoryTree, categoryFilters, activeCategoryId }: CategorySidebarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Logic cho cây danh mục
    const initialOpenCategories = useMemo(() => findCategoryPath(categoryTree, activeCategoryId), [categoryTree, activeCategoryId]);
    const [openCategories, setOpenCategories] = useState<number[]>(initialOpenCategories);

    // Logic cho bộ lọc danh mục
    const selectedCategoryIds = useMemo(() => {
        const cats = searchParams.get('categories');
        return cats ? cats.split(',').map(Number) : [];
    }, [searchParams]);

    const handleCategoryFilterChange = (filterCategoryId: number) => {
        const newSelectedIds = new Set(selectedCategoryIds);
        if (newSelectedIds.has(filterCategoryId)) {
            newSelectedIds.delete(filterCategoryId);
        } else {
            newSelectedIds.add(filterCategoryId);
        }

        const params = new URLSearchParams(searchParams.toString());
        if (newSelectedIds.size > 0) {
            params.set('categories', Array.from(newSelectedIds).join(','));
        } else {
            params.delete('categories');
        }
        params.set('page', '1');
        router.push(`${pathname}?${params.toString()}`);
    };

    // Hàm render cây danh mục
    const renderCategory = (category: Category, level: number = 0) => {
        const isActive = category.CategoryID === activeCategoryId && selectedCategoryIds.length === 0;
        const isOpen = openCategories.includes(category.CategoryID);
        const hasChildren = category.children && category.children.length > 0;

        const handleToggle = (e: React.MouseEvent) => {
            if (hasChildren) {
                if (isActive) e.preventDefault();
                setOpenCategories(prev => prev.includes(category.CategoryID) ? prev.filter(id => id !== category.CategoryID) : [...prev, category.CategoryID]);
            }
        };

        return (
            <li key={category.CategoryID}>
                <div className="flex items-center">
                    {hasChildren && <button onClick={handleToggle} className="p-1 -ml-1 text-gray-500 hover:text-gray-800"><svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-90' : 'rotate-0'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></button>}
                    <Link href={`/categoryDetail/${category.CategoryID}`} onClick={handleToggle} className={`block py-1 text-sm transition-colors w-full ${level > 0 && !hasChildren ? 'pl-5' : 'pl-1'} ${isActive ? 'text-red-500 font-semibold' : 'text-gray-700 hover:text-red-500'}`}>
                        {category.Name}
                    </Link>
                </div>
                {hasChildren && isOpen && <ul className={`pl-5 mt-1 space-y-1`}>{category.children?.map(child => renderCategory(child, level + 1))}</ul>}
            </li>
        );
    };

    // ====================================================================
    // === PHẦN LOGIC CHO NÚT "XÓA TẤT CẢ" (ĐÃ THÊM) ===
    // ====================================================================
    const isFilterActive = useMemo(() => {
        return searchParams.has('categories') || searchParams.has('min_price') || searchParams.has('max_price');
    }, [searchParams]);

    const handleClearAllFilters = () => {
        router.push(pathname);
    };

    return (
        <div className="bg-white rounded-md shadow-sm">
            {/* === PHẦN DANH MỤC === */}
            <div className="p-4">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-base">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>
                    DANH MỤC
                </h3>
                <ul className="space-y-1">{categoryTree.map(cat => renderCategory(cat))}</ul>
            </div>

            <hr className="my-0" />

            {/* === PHẦN BỘ LỌC TÌM KIẾM === */}
            <div className="p-4">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-base">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" /></svg>
                    BỘ LỌC TÌM KIẾM
                </h3>
                {categoryFilters.length > 0 &&
                    <div className="space-y-2 mt-3">
                        <h4 className="font-semibold text-sm text-gray-600">Theo Danh Mục</h4>
                        {categoryFilters.map((filter) => (
                            <div key={filter.CategoryID} className="flex items-center">
                                <input type="checkbox" id={`filter-${filter.CategoryID}`} checked={selectedCategoryIds.includes(filter.CategoryID)} onChange={() => handleCategoryFilterChange(filter.CategoryID)} className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer" />
                                <label htmlFor={`filter-${filter.CategoryID}`} className="ml-3 text-sm text-gray-700 cursor-pointer">{filter.Name} ({formatCount(filter.products_count)})</label>
                            </div>
                        ))}
                    </div>
                }
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <PriceRangeFilter />
                </div>

                {/* === NÚT XÓA TẤT CẢ (ĐÃ THÊM) === */}
                {isFilterActive && (
                    <button
                        onClick={handleClearAllFilters}
                        className="w-full bg-red-600 text-white py-1.5 rounded-sm text-sm font-semibold uppercase hover:bg-red-700 transition-colors duration-200 mt-4"
                    >
                        Xóa tất cả
                    </button>
                )}
            </div>
        </div>
    );
}