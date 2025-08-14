
// app/(main)/categoryDetail/[categoryId]/page.tsx
'use client';

import { Suspense, useEffect, useState, useMemo } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import axios from 'axios';

import CategoryProductView from '../components/CategoryProductView';
import CategorySidebar from '../components/CategorySidebar';
import CategorySlider from '../components/SliderCatergory';
import { API_URL } from '@/lib/config';

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
                    axios.get<Category[]>(`${API_URL}/categorySubMenu/${categoryId}/products`,
                        {headers: {
        'ngrok-skip-browser-warning': 'true',
        'Content-Type': 'application/json'
    }}
                    ),
                    axios.get<PaginatedResponse<Product>>(`${API_URL}/categories/${categoryId}/products`, {
                        params: apiParams
                    }),
                    axios.get<CategoryFilter[]>(`${API_URL}/categories/${categoryId}/filters`)
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