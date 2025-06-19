// app/categoryDetail/[categoryId]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import axios from 'axios';

import CategoryProductView from '../components/CategoryProductView';
import CategorySidebar from '../components/CategorySidebar';

// ====================================================================
// ĐỊNH NGHĨA TYPESCRIPT
// ====================================================================
interface Variant {
    VariantID: number;
    Price: number;
    CompareAtPrice: number | null;
}
interface ProductImage {
    ImageID: number;
    ImageURL: string;
    IsPrimary: number;
}
interface Category {
    CategoryID: number;
    Name: string;
    ParentCategoryID: number | null;
    children?: Category[];
}
interface Product {
    ProductID: number;
    Name: string;
    images: ProductImage[];
    variants: Variant[];
    category: Category;
}
interface PaginatedResponse<T> {
    data: T[];
    total: number;
    current_page: number;
    last_page: number;
}

// ====================================================================
// COMPONENT TRANG CHÍNH ("NHẠC TRƯỞNG")
// ====================================================================
export default function CategoryDetailPage() {
    const params = useParams();
    const searchParams = useSearchParams();

    const categoryId = params.categoryId as string;
    const sort = searchParams.get('sort') || 'popular';
    const page = parseInt(searchParams.get('page') || '1');

    const [categoryTree, setCategoryTree] = useState<Category[] | null>(null);
    const [productResponse, setProductResponse] = useState<PaginatedResponse<Product> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!categoryId) return;

        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const [treeResponse, productsResponse] = await Promise.all([
                    axios.get<Category[]>(`http://localhost:8001/api/categorySubMenu/${categoryId}/products`),
                    axios.get<PaginatedResponse<Product>>(`http://localhost:8001/api/categories/${categoryId}/products`, {
                        params: { sort, page }
                    })
                ]);

                setCategoryTree(treeResponse.data);
                setProductResponse(productsResponse.data);

            } catch (err) {
                console.error("Lỗi khi tải dữ liệu trang:", err);
                setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [categoryId, sort, page]);

    if (isLoading) {
        return <div className="container mx-auto text-center p-10">Đang tải...</div>;
    }

    if (error) {
        return <div className="container mx-auto text-center p-10 text-red-500">{error}</div>;
    }

    if (!productResponse || !categoryTree) {
        return <div className="container mx-auto text-center p-10">Không tìm thấy dữ liệu.</div>;
    }

    return (
        <div className="bg-gray-100 min-h-screen w-[1440px] mx-auto">
            <div className="container mx-auto py-4 grid grid-cols-1 lg:grid-cols-12 gap-5">
                <aside className="col-span-1 lg:col-span-2">
                    <CategorySidebar
                        categoryTree={categoryTree}
                        activeCategoryId={parseInt(categoryId)}
                    />
                </aside>
                <main className="col-span-1 lg:col-span-10">
                    {/* Bây giờ việc truyền props sẽ hợp lệ và không còn lỗi */}
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
    );
}