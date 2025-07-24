// // src/components/home/CategoryMenu.tsx (Phiên bản chỉ dành cho Desktop)
// 'use client';

// import { useEffect, useState } from 'react';
// import axios from 'axios';
// import Link from 'next/link';

// type Category = {
//     CategoryID: number;
//     Name: string;
//     ImageURL: string | null;
//     IsActive: boolean;
// };

// export default function CategoryMenu() { // <-- Không có props isOpen, onClose
//     const [categories, setCategories] = useState<Category[]>([]);
//     const [activeCategory, setActiveCategory] = useState<number | null>(null);

//     useEffect(() => {
//         axios.get('http://localhost/api/categorySubMenu')
//             .then((response) => {
//                 const activeCategories = response.data.filter((cat: Category) => cat.IsActive);
//                 setCategories(activeCategories);
//                 if (activeCategories.length > 0) setActiveCategory(activeCategories[0].CategoryID);
//             })
//             .catch((error) => console.error('Lỗi khi tải danh mục:', error));
//     }, []);

//     const handleCategoryClick = (categoryId: number) => {
//         setActiveCategory(categoryId);
//     };

//     return (
//         <div className="w-full bg-white p-4 rounded-lg shadow-sm border border-gray-200">
//             <h2 className="text-base font-bold mb-3 text-gray-800">Danh mục</h2>
//             <ul className="space-y-1">
//                 {categories.map((cat) => (
//                     <li key={cat.CategoryID}>
//                         <Link
//                             href="/categoryDetail"
//                             onClick={(e) => { e.preventDefault(); handleCategoryClick(cat.CategoryID); }}
//                             className={`flex items-center p-2 text-sm font-medium rounded-md transition-colors ${activeCategory === cat.CategoryID
//                                 ? 'bg-orange-100 text-orange-600'
//                                 : 'text-gray-700 hover:bg-gray-100'
//                                 }`}
//                         >
//                             {cat.ImageURL && (
//                                 <img
//                                     src={cat.ImageURL.startsWith('http') ? cat.ImageURL : `http://localhost${cat.ImageURL}`}
//                                     alt={cat.Name}
//                                     className="w-5 h-5 mr-3 object-contain"
//                                 />
//                             )}
//                             <span>{cat.Name}</span>
//                         </Link>
//                     </li>
//                 ))}
//             </ul>
//         </div>
//     );
// }
// src/components/home/CategoryMenu.tsx
'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { usePathname } from 'next/navigation'; // <-- BƯỚC 1: Import hook usePathname
import type { IHome } from '@/types/Ihome';
import { getFullImageUrl } from '@/services/api';



export default function CategoryMenu() {
    const [categories, setCategories] = useState<IHome.Category[]>([]);
    const pathname = usePathname(); // <-- BƯỚC 2: Lấy đường dẫn URL hiện tại

    // useEffect để lấy danh sách categories không thay đổi, giữ nguyên
    useEffect(() => {
        axios.get('http://localhost/api/categorySubMenu')
            .then((response) => {
                const activeCategories = response.data.filter((cat: IHome.Category) => cat.IsActive);
                setCategories(activeCategories);
            })
            .catch((error) => console.error('Lỗi khi tải danh mục:', error));
    }, []);

    // Không cần state activeCategory và hàm handleCategoryClick nữa

    return (
        <div className="w-full bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-base font-bold mb-3 text-gray-800">Danh mục</h2>
            <ul className="space-y-1">
                {categories.map((cat) => {
                    // Tạo đường dẫn động cho mỗi danh mục
                    const href = `/categoryDetail/${cat.CategoryID}`;

                    // So sánh đường dẫn của link với URL hiện tại để xác định active
                    const isActive = pathname === href;

                    return (
                        <li key={cat.CategoryID}>
                            {/* === BƯỚC 3: SỬA LẠI COMPONENT LINK === */}
                            <Link
                                // 3.1. Sửa href thành đường dẫn động
                                href={href}
                                // 3.2. Xóa bỏ hoàn toàn onClick
                                className={`flex items-center p-2 text-sm font-medium rounded-md transition-colors ${isActive // 3.3. Dùng biến `isActive` để thêm class
                                    ? 'bg-orange-100 text-orange-600'
                                    : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                {cat.ImageURL && (
                                    <img
                                        src={getFullImageUrl(cat.ImageURL)}
                                        alt={cat.Name}
                                        className="w-5 h-5 mr-3 object-contain"
                                    />
                                )}
                                <span>{cat.Name}</span>
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}