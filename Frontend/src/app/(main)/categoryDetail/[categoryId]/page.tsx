// // // app/categoryDetail/[categoryId]/page.tsx
// // 'use client';

// // import { useEffect, useState } from 'react';
// // import { useParams, useSearchParams } from 'next/navigation';
// // import axios from 'axios';

// // import CategoryProductView from '../components/CategoryProductView';
// // import CategorySidebar from '../components/CategorySidebar';

// // // ====================================================================
// // // ĐỊNH NGHĨA TYPESCRIPT
// // // ====================================================================
// // interface Variant {
// //     VariantID: number;
// //     Price: number;
// //     CompareAtPrice: number | null;
// // }
// // interface ProductImage {
// //     ImageID: number;
// //     ImageURL: string;
// //     IsPrimary: number;
// // }
// // interface Category {
// //     CategoryID: number;
// //     Name: string;
// //     ParentCategoryID: number | null;
// //     children?: Category[];
// // }
// // interface Product {
// //     ProductID: number;
// //     Name: string;
// //     images: ProductImage[];
// //     variants: Variant[];
// //     category: Category;
// // }
// // interface PaginatedResponse<T> {
// //     data: T[];
// //     total: number;
// //     current_page: number;
// //     last_page: number;
// // }

// // // ====================================================================
// // // COMPONENT TRANG CHÍNH ("NHẠC TRƯỞNG")
// // // ====================================================================
// // export default function CategoryDetailPage() {
// //     const params = useParams();
// //     const searchParams = useSearchParams();

// //     const categoryId = params.categoryId as string;
// //     const sort = searchParams.get('sort') || 'popular';
// //     const page = parseInt(searchParams.get('page') || '1');

// //     const [categoryTree, setCategoryTree] = useState<Category[] | null>(null);
// //     const [productResponse, setProductResponse] = useState<PaginatedResponse<Product> | null>(null);
// //     const [isLoading, setIsLoading] = useState(true);
// //     const [error, setError] = useState<string | null>(null);

// //     useEffect(() => {
// //         if (!categoryId) return;

// //         const fetchData = async () => {
// //             setIsLoading(true);
// //             setError(null);
// //             try {
// //                 const [treeResponse, productsResponse] = await Promise.all([
// //                     axios.get<Category[]>(`http://localhost/api/categorySubMenu/${categoryId}/products`),
// //                     axios.get<PaginatedResponse<Product>>(`http://localhost/api/categories/${categoryId}/products`, {
// //                         params: { sort, page }
// //                     })
// //                 ]);

// //                 setCategoryTree(treeResponse.data);
// //                 setProductResponse(productsResponse.data);

// //             } catch (err) {
// //                 console.error("Lỗi khi tải dữ liệu trang:", err);
// //                 setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
// //             } finally {
// //                 setIsLoading(false);
// //             }
// //         };

// //         fetchData();
// //     }, [categoryId, sort, page]);

// //     if (isLoading) {
// //         return <div className="container mx-auto text-center p-10">Đang tải...</div>;
// //     }

// //     if (error) {
// //         return <div className="container mx-auto text-center p-10 text-red-500">{error}</div>;
// //     }

// //     if (!productResponse || !categoryTree) {
// //         return <div className="container mx-auto text-center p-10">Không tìm thấy dữ liệu.</div>;
// //     }

// //     return (
// //         <div className="bg-gray-100 min-h-screen w-[1440px] mx-auto">
// //             <div className="container mx-auto py-4 grid grid-cols-1 lg:grid-cols-12 gap-5">
// //                 <aside className="col-span-1 lg:col-span-2">
// //                     <CategorySidebar
// //                         categoryTree={categoryTree}
// //                         activeCategoryId={parseInt(categoryId)}
// //                     />
// //                 </aside>
// //                 <main className="col-span-1 lg:col-span-10">
// //                     {/* Bây giờ việc truyền props sẽ hợp lệ và không còn lỗi */}
// //                     <CategoryProductView
// //                         products={productResponse.data}
// //                         pagination={{
// //                             total: productResponse.total,
// //                             currentPage: productResponse.current_page,
// //                             lastPage: productResponse.last_page
// //                         }}
// //                         categoryId={categoryId}
// //                     />
// //                 </main>
// //             </div>
// //         </div>
// //     );
// // }
// // app/categoryDetail/[categoryId]/page.tsx
// 'use client';

// import { useEffect, useState } from 'react';
// import { useParams, useSearchParams } from 'next/navigation';
// import axios from 'axios';

// import CategoryProductView from '../components/CategoryProductView';
// import CategorySidebar from '../components/CategorySidebar';

// // ====================================================================
// // ĐỊNH NGHĨA TYPESCRIPT (THÊM TYPE CHO BỘ LỌC)
// // ====================================================================
// interface CategoryFilter { // <-- TYPE MỚI
//     CategoryID: number;
//     Name: string;
//     products_count: number;
// }
// interface Variant {
//     VariantID: number;
//     Price: number;
//     CompareAtPrice: number | null;
// }
// interface ProductImage {
//     ImageID: number;
//     ImageURL: string;
//     IsPrimary: number;
// }
// interface Category {
//     CategoryID: number;
//     Name: string;
//     ParentCategoryID: number | null;
//     children?: Category[];
// }
// interface Product {
//     ProductID: number;
//     Name: string;
//     images: ProductImage[];
//     variants: Variant[];
//     category: Category;
// }
// interface PaginatedResponse<T> {
//     data: T[];
//     total: number;
//     current_page: number;
//     last_page: number;
// }

// // ====================================================================
// // COMPONENT TRANG CHÍNH ("NHẠC TRƯỞNG")
// // ====================================================================
// export default function CategoryDetailPage() {
//     const params = useParams();
//     const searchParams = useSearchParams();

//     const categoryId = params.categoryId as string;
//     const sort = searchParams.get('sort') || 'popular';
//     const page = parseInt(searchParams.get('page') || '1');

//     const [categoryTree, setCategoryTree] = useState<Category[] | null>(null);
//     const [productResponse, setProductResponse] = useState<PaginatedResponse<Product> | null>(null);
//     const [categoryFilters, setCategoryFilters] = useState<CategoryFilter[]>([]); // <-- STATE MỚI CHO BỘ LỌC
//     const [isLoading, setIsLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);

//     useEffect(() => {
//         if (!categoryId) return;

//         const fetchData = async () => {
//             setIsLoading(true);
//             setError(null);
//             try {
//                 // Sửa: Gọi 3 API song song
//                 const [treeResponse, productsResponse, filtersResponse] = await Promise.all([
//                     axios.get<Category[]>(`http://localhost/api/categorySubMenu/${categoryId}/products`), // API lấy cây danh mục
//                     axios.get<PaginatedResponse<Product>>(`http://localhost/api/categories/${categoryId}/products`, {
//                         params: { sort, page } // API lấy sản phẩm
//                     }),
//                     axios.get<CategoryFilter[]>(`http://localhost/api/categories/${categoryId}/filters`) // API LẤY BỘ LỌC
//                 ]);

//                 setCategoryTree(treeResponse.data);
//                 setProductResponse(productsResponse.data);
//                 setCategoryFilters(filtersResponse.data); // Cập nhật state bộ lọc

//             } catch (err) {
//                 console.error("Lỗi khi tải dữ liệu trang:", err);
//                 setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
//             } finally {
//                 setIsLoading(false);
//             }
//         };

//         fetchData();
//     }, [categoryId, sort, page]); // Dependencies không đổi

//     if (isLoading) {
//         return <div className="container mx-auto text-center p-10">Đang tải...</div>;
//     }

//     if (error) {
//         return <div className="container mx-auto text-center p-10 text-red-500">{error}</div>;
//     }

//     if (!productResponse || !categoryTree) {
//         return <div className="container mx-auto text-center p-10">Không tìm thấy dữ liệu.</div>;
//     }

//     return (
//         <div className="bg-gray-100 min-h-screen w-[1440px] mx-auto">
//             <div className="container mx-auto py-4 grid grid-cols-1 lg:grid-cols-12 gap-5">
//                 <aside className="col-span-1 lg:col-span-2">
//                     {/* Sửa: Truyền cả 3 props xuống Sidebar */}
//                     <CategorySidebar
//                         categoryTree={categoryTree}
//                         categoryFilters={categoryFilters}
//                         activeCategoryId={parseInt(categoryId)}
//                     />
//                 </aside>
//                 <main className="col-span-1 lg:col-span-10">
//                     <CategoryProductView
//                         products={productResponse.data}
//                         pagination={{
//                             total: productResponse.total,
//                             currentPage: productResponse.current_page,
//                             lastPage: productResponse.last_page
//                         }}
//                         categoryId={categoryId}
//                     />
//                 </main>
//             </div>
//         </div>
//     );
// }
// app/(main)/categoryDetail/[categoryId]/page.tsx
'use client';

import { Suspense, useEffect, useState, useMemo } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import axios from 'axios';

import CategoryProductView from '../components/CategoryProductView';
import CategorySidebar from '../components/CategorySidebar';
import CategorySlider from '../components/SliderCatergory';

// ====================================================================
// ĐỊNH NGHĨA TYPESCRIPT
// ====================================================================
interface CategoryFilter { CategoryID: number; Name: string; products_count: number; }
interface Variant { VariantID: number; Price: number; CompareAtPrice: number | null; }
interface ProductImage { ImageID: number; ImageURL: string; IsPrimary: number; }
interface Category { CategoryID: number; Name: string; ParentCategoryID: number | null; children?: Category[]; }
interface Product { ProductID: number; Name: string; images: ProductImage[]; variants: Variant[]; category: Category; }
interface PaginatedResponse<T> { data: T[]; total: number; current_page: number; last_page: number; }


// ====================================================================
// COMPONENT CON CHỨA TOÀN BỘ LOGIC CỦA TRANG
// ====================================================================
function PageContent() {
    const params = useParams();
    const searchParams = useSearchParams();

    // Lấy tất cả các tham số từ URL để lọc và phân trang
    const categoryId = params.categoryId as string;
    const sort = searchParams.get('sort') || 'popular';
    const page = searchParams.get('page') || '1';
    const minPrice = searchParams.get('min_price');
    const maxPrice = searchParams.get('max_price');
    const categoriesParam = searchParams.get('categories');

    // State để lưu trữ dữ liệu từ các API
    const [categoryTree, setCategoryTree] = useState<Category[] | null>(null);
    const [productResponse, setProductResponse] = useState<PaginatedResponse<Product> | null>(null);
    const [categoryFilters, setCategoryFilters] = useState<CategoryFilter[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // useEffect sẽ chạy lại mỗi khi một tham số lọc trên URL thay đổi
    useEffect(() => {
        if (!categoryId) return;

        const fetchData = async () => {
            setIsLoading(true);
            setError(null);

            // Xây dựng object params để gửi đến API sản phẩm
            const apiParams: any = { sort, page };
            if (minPrice) apiParams.min_price = minPrice;
            if (maxPrice) apiParams.max_price = maxPrice;
            if (categoriesParam) apiParams.categories = categoriesParam;

            try {
                // Gọi đồng thời 3 API cần thiết cho trang
                const [treeResponse, productsResponse, filtersResponse] = await Promise.all([
                    axios.get<Category[]>(`http://localhost/api/categorySubMenu/${categoryId}/products`),
                    axios.get<PaginatedResponse<Product>>(`http://localhost/api/categories/${categoryId}/products`, {
                        params: apiParams
                    }),
                    axios.get<CategoryFilter[]>(`http://localhost/api/categories/${categoryId}/filters`)
                ]);

                setCategoryTree(treeResponse.data);
                setProductResponse(productsResponse.data);
                setCategoryFilters(filtersResponse.data);

            } catch (err: any) {
                console.error("Lỗi khi tải dữ liệu trang:", err);
                const message = err.response?.data?.message || "Không thể tải dữ liệu. Vui lòng thử lại sau.";
                setError(message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [categoryId, sort, page, minPrice, maxPrice, categoriesParam]);

    // Render các trạng thái của trang (loading, error, no data)
    if (isLoading) {
        return <div className="container mx-auto text-center p-10">Đang tải dữ liệu...</div>;
    }
    if (error) {
        return <div className="container mx-auto text-center p-10 text-red-500">{error}</div>;
    }
    if (!productResponse || !categoryTree) {
        return <div className="container mx-auto text-center p-10">Không tìm thấy dữ liệu cho danh mục này.</div>;
    }
    return (
        <div className="bg-gray-100 min-h-screen py-4">
            {/* 
          Div cha này sẽ chứa và căn giữa tất cả nội dung.
          max-w-7xl tương đương khoảng 1280px, rất gần với 1200px bạn muốn.
        */}
            <div className="container mx-auto max-w-7xl flex flex-col gap-5">

                {/* 1. SLIDER */}
                <div className="w-full">
                    {/* Component Slider sẽ tự chiếm toàn bộ chiều rộng của container */}
                    <CategorySlider />
                </div>

                {/* 2. PHẦN GRID CHỨA SIDEBAR VÀ SẢN PHẨM */}
                <div className="grid grid-cols-12 gap-5">
                    {/* Cột trái cho Sidebar */}
                    <aside className="col-span-12 lg:col-span-2">
                        <CategorySidebar
                            categoryTree={categoryTree}
                            categoryFilters={categoryFilters}
                            activeCategoryId={parseInt(categoryId)}
                        />
                    </aside>

                    {/* Cột phải cho Nội dung chính */}
                    <main className="col-span-12 lg:col-span-10">
                        <CategoryProductView
                            products={productResponse.data}
                            pagination={{
                                total: productResponse.total,
                                currentPage: productResponse.current_page,
                                lastPage: productResponse.last_page
                            }}
                            categoryId={categoryId}
                        />
                    </main>
                </div>
            </div>
        </div>
    );
}

// ====================================================================
// COMPONENT CHA EXPORT RA, BỌC SUSPENSE
// ====================================================================
export default function CategoryDetailPage() {
    return (
        <Suspense fallback={
            <div className="bg-gray-100 min-h-screen">
                <div className="container mx-auto max-w-7xl py-4 text-center">Đang tải trang...</div>
            </div>
        }>
            <PageContent />
        </Suspense>
    );
}