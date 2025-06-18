'use client';

import Link from 'next/link';
import SortBar from "./SortBar";

// ====================================================================
// ĐỊNH NGHĨA TYPESCRIPT
// Các type này cần phải khớp với dữ liệu được truyền từ trang cha.
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
}
interface Product {
    ProductID: number;
    Name: string;
    images: ProductImage[];
    variants: Variant[];
    category: Category;
}
// ===> ĐÂY LÀ PHẦN SỬA LỖI QUAN TRỌNG NHẤT <===
// Định nghĩa props mà component này sẽ nhận vào.
interface CategoryProductViewProps {
    products: Product[];
    pagination: {
        total: number;
        currentPage: number;
        lastPage: number;
    };
    categoryId: string;
}
// Component này chỉ có nhiệm vụ hiển thị, không tự fetch dữ liệu
export default function CategoryProductView({ products, pagination, categoryId }: CategoryProductViewProps) {
    if (products.length === 0) {
        return (
            <div className="bg-white p-10 rounded-md text-center">
                <p className="text-gray-600">Không tìm thấy sản phẩm nào trong danh mục này.</p>
            </div>
        );
    }
    return (
        <div className="flex flex-col gap-5">
            <SortBar />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">

                {products.map(product => (
                    <div key={product.ProductID} className="bg-white rounded-md shadow-sm overflow-hidden border border-transparent hover:border-red-500 transition-all">
                        <img
                            src={product.images.find(img => img.IsPrimary)?.ImageURL || '/placeholder.jpg'}
                            alt={product.Name}
                            className="w-full h-48 object-cover"
                        />
                        <div className="p-3">
                            <Link
                                href={`/productdetail/${product.ProductID}`} >
                                <h3 className="text-sm font-medium truncate h-10">{product.Name}</h3>
                            </Link>
                            <p className="text-red-500 font-semibold mt-1">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.variants[0]?.Price || 0)}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-4 flex justify-center">
                {/* Bạn có thể thêm component Pagination ở đây */}
            </div>
        </div>
    );
}