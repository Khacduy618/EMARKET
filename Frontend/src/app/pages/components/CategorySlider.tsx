// 'use client';

// import { useEffect, useRef, useState } from 'react';
// import axios from 'axios';
// import { MdArrowBackIos, MdArrowForwardIos } from 'react-icons/md';

// type Category = {
//     CategoryID: number;
//     Name: string;
//     Description: string | null;
//     ParentCategoryID: number | null;
//     Slug: string;
//     icon: string;
//     ImageURL: string | null;
//     IsActive: boolean;
//     CreatedAt: string;
//     UpdatedAt: string;
// };

// export default function CategorySlider() {
//     const [categories, setCategories] = useState<Category[]>([]);
//     const [active, setActive] = useState<number | null>(null);
//     const containerRef = useRef<HTMLDivElement>(null);

//     useEffect(() => {
//         axios
//             .get('http://localhost:8001/api/category')
//             .then((response) => {
//                 // Filter only active categories and ensure they have ImageURL
//                 const activeCategories = response.data.filter(
//                     (cat: Category) => cat.IsActive && cat.ImageURL
//                 );
//                 setCategories(activeCategories);
//             })
//             .catch((error) => {
//                 console.error('Error fetching categories:', error);
//             });
//     }, []);

//     const scrollLeft = () => {
//         if (containerRef.current) {
//             containerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
//         }
//     };

//     const scrollRight = () => {
//         if (containerRef.current) {
//             containerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
//         }
//     };

//     return (
//         <div className="max-w-8xl w-[1422px] mx-auto px-4 py-10">
//             <div className="mb-6 flex items-center justify-between">
//                 <div>
//                     <p className="text-red-500 font-semibold">Danh mục</p>
//                     <h2 className="text-2xl font-bold">Duyệt theo danh mục</h2>
//                 </div>
//                 <div className="flex space-x-2">
//                     <button
//                         onClick={scrollLeft}
//                         className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
//                     >
//                         <MdArrowBackIos />
//                     </button>
//                     <button
//                         onClick={scrollRight}
//                         className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
//                     >
//                         <MdArrowForwardIos />
//                     </button>
//                 </div>
//             </div>

//             <div
//                 ref={containerRef}
//                 className="flex space-x-4 overflow-x-auto no-scrollbar"
//                 style={{ scrollBehavior: 'smooth' }}
//             >
//                 {categories.map((cat) => (
//                     <div
//                         key={cat.CategoryID}
//                         onClick={() => setActive(cat.CategoryID)}
//                         className={`min-w-[150px] flex-shrink-0 border rounded-md cursor-pointer flex flex-col items-center justify-center py-6 gap-2 transition-all
//                             ${active === cat.CategoryID
//                                 ? 'bg-red-500 text-white border-red-500'
//                                 : 'hover:shadow-md'}
//                         `}
//                     >
//                         <div className="w-12 h-12 flex items-center justify-center">
//                             {cat.ImageURL && (
//                                 <img
//                                     src={cat.ImageURL.startsWith('http')
//                                         ? cat.ImageURL
//                                         : `http://localhost:8001${cat.ImageURL}`}
//                                     alt={cat.Name}
//                                     className="max-w-full max-h-full object-contain"
//                                 />
//                             )}
//                         </div>
//                         <p className="font-medium text-center">{cat.Name}</p>
//                     </div>
//                 ))}
//             </div>

//             <style jsx>{`
//                 .no-scrollbar::-webkit-scrollbar {
//                     display: none;
//                 }
//                 .no-scrollbar {
//                     -ms-overflow-style: none;
//                     scrollbar-width: none;
//                 }
//             `}</style>
//         </div>
//     );
// }
'use client';

import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { MdArrowBackIos, MdArrowForwardIos } from 'react-icons/md';
import { FaListAlt } from 'react-icons/fa';

type Category = {
    CategoryID: number;
    Name: string;
    ImageURL: string | null;
    IsActive: boolean;
};

export default function CategorySlider() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [active, setActive] = useState<number | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        axios
            .get('http://localhost:8001/api/category')
            .then((response) => {
                const activeCategories = response.data.filter(
                    (cat: Category) => cat.IsActive
                );
                setCategories(activeCategories);
            })
            .catch(console.error);
    }, []);

    const scrollLeft = () => {
        containerRef.current?.scrollBy({ left: -300, behavior: 'smooth' });
    };

    const scrollRight = () => {
        containerRef.current?.scrollBy({ left: 300, behavior: 'smooth' });
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <p className="text-red-500 text-sm font-semibold">Danh mục sản phẩm</p>
                    <h2 className="text-xl font-bold">Khám phá theo danh mục</h2>
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={scrollLeft}
                        className="p-1.5 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-600"
                    >
                        <MdArrowBackIos size={16} />
                    </button>
                    <button
                        onClick={scrollRight}
                        className="p-1.5 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-600"
                    >
                        <MdArrowForwardIos size={16} />
                    </button>
                </div>
            </div>

            <div className="relative">
                <div
                    ref={containerRef}
                    className="flex space-x-3 overflow-x-auto no-scrollbar pb-2"
                >
                    {/* Nút "Tất cả danh mục" */}
                    <div
                        onClick={() => setActive(null)}
                        className={`min-w-[110px] flex-shrink-0 border rounded-lg cursor-pointer flex flex-col items-center justify-center p-3 gap-1 transition-all
              ${active === null
                                ? 'bg-red-500 text-white border-red-500'
                                : 'hover:border-red-300 hover:bg-red-50'}
            `}
                    >
                        <div className="w-10 h-10 flex items-center justify-center text-red-500">
                            <FaListAlt size={20} className={active === null ? 'text-white' : 'text-red-500'} />
                        </div>
                        <p className="font-medium text-sm text-center">Tất cả</p>
                    </div>

                    {/* Các danh mục sản phẩm */}
                    {categories.map((cat) => (
                        <div
                            key={cat.CategoryID}
                            onClick={() => setActive(cat.CategoryID)}
                            className={`min-w-[110px] flex-shrink-0 border rounded-lg cursor-pointer flex flex-col items-center justify-center p-3 gap-1 transition-all
                ${active === cat.CategoryID
                                    ? 'bg-red-500 text-white border-red-500'
                                    : 'hover:border-red-300 hover:bg-red-50'}
              `}
                        >
                            <div className="w-10 h-10 flex items-center justify-center">
                                {cat.ImageURL ? (
                                    <img
                                        src={cat.ImageURL.startsWith('http')
                                            ? cat.ImageURL
                                            : `http://localhost:8001${cat.ImageURL}`}
                                        alt={cat.Name}
                                        className="max-w-full max-h-full object-contain"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-100 rounded-full"></div>
                                )}
                            </div>
                            <p className={`font-medium text-sm text-center ${active === cat.CategoryID ? 'text-white' : ''}`}>
                                {cat.Name}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
        </div>
    );
}