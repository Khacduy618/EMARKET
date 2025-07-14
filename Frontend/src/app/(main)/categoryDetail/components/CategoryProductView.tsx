// 'use client';

// import Link from 'next/link';
// import SortBar from "./SortBar";

// // ====================================================================
// // ĐỊNH NGHĨA TYPESCRIPT
// // Các type này cần phải khớp với dữ liệu được truyền từ trang cha.
// // ====================================================================
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
// }
// interface Product {
//     ProductID: number;
//     Name: string;
//     images: ProductImage[];
//     variants: Variant[];
//     category: Category;
// }
// // ===> ĐÂY LÀ PHẦN SỬA LỖI QUAN TRỌNG NHẤT <===
// // Định nghĩa props mà component này sẽ nhận vào.
// interface CategoryProductViewProps {
//     products: Product[];
//     pagination: {
//         total: number;
//         currentPage: number;
//         lastPage: number;
//     };
//     categoryId: string;
// }
// // Component này chỉ có nhiệm vụ hiển thị, không tự fetch dữ liệu
// export default function CategoryProductView({ products, pagination, categoryId }: CategoryProductViewProps) {
//     if (products.length === 0) {
//         return (
//             <div className="bg-white p-10 rounded-md text-center">
//                 <p className="text-gray-600">Không tìm thấy sản phẩm nào trong danh mục này.</p>
//             </div>
//         );
//     }
//     return (
//         <div className="flex flex-col gap-5">
//             <SortBar />
//             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">

//                 {products.map(product => (
//                     <div key={product.ProductID} className="bg-white rounded-md shadow-sm overflow-hidden border border-transparent hover:border-red-500 transition-all">
//                         <img
//                             src={product.images.find(img => img.IsPrimary)?.ImageURL || '/placeholder.jpg'}
//                             alt={product.Name}
//                             className="w-full h-48 object-cover"
//                         />
//                         <div className="p-3">
//                             <Link
//                                 href={`/productdetail/${product.ProductID}`} >
//                                 <h3 className="text-sm font-medium truncate h-10">{product.Name}</h3>
//                             </Link>
//                             <p className="text-red-500 font-semibold mt-1">
//                                 {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.variants[0]?.Price || 0)}
//                             </p>
//                         </div>
//                     </div>
//                 ))}
//             </div>

//             <div className="mt-4 flex justify-center">
//                 {/* Bạn có thể thêm component Pagination ở đây */}
//             </div>
//         </div>
//     );
// }
"use client"
import Link from "next/link"
import { Heart, ShoppingCart, Star } from "lucide-react"
import SortBar from "./SortBar"

// ====================================================================
// ĐỊNH NGHĨA TYPESCRIPT
// Các type này cần phải khớp với dữ liệu được truyền từ trang cha.
// ====================================================================
interface Variant {
    VariantID: number
    Price: number
    CompareAtPrice: number | null
}

interface ProductImage {
    ImageID: number
    ImageURL: string
    IsPrimary: number
}

interface Category {
    CategoryID: number
    Name: string
    ParentCategoryID: number | null
}

interface Product {
    ProductID: number
    Name: string
    images: ProductImage[]
    variants: Variant[]
    category: Category
    rating?: number
    SoldCount?: number
    discount?: number
}

// ===> ĐÂY LÀ PHẦN SỬA LỖI QUAN TRỌNG NHẤT <===
// Định nghĩa props mà component này sẽ nhận vào.
interface CategoryProductViewProps {
    products: Product[]
    pagination: {
        total: number
        currentPage: number
        lastPage: number
    }
    categoryId: string
}

// Modern Product Card Component
const ModernProductCard = ({ product }: { product: Product }) => {
    const primaryImage = product.images.find((img) => img.IsPrimary)?.ImageURL || "/placeholder.svg"
    const mainVariant = product.variants[0]
    const hasDiscount = mainVariant?.CompareAtPrice && mainVariant.CompareAtPrice > mainVariant.Price
    const discountPercent = hasDiscount
        ? Math.round(((mainVariant.CompareAtPrice || 0) - mainVariant.Price) / (mainVariant.CompareAtPrice || 1) * 100)
        : 0

    return (
        <div className="bg-white rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group border border-gray-100 overflow-hidden">
            <div className="relative overflow-hidden">
                <div className="aspect-square bg-gray-50 flex items-center justify-center relative">
                    <img
                        src={primaryImage || "/placeholder.svg"}
                        alt={product.Name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />

                    {/* Discount Badge */}
                    {hasDiscount && (
                        <div className="absolute top-2 left-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-2 py-1 rounded-md shadow-lg">
                            -{discountPercent}%
                        </div>
                    )}

                    {/* Hover Actions */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col gap-2">
                        <button className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-colors">
                            <Heart className="w-4 h-4 text-gray-600 hover:text-red-500" />
                        </button>
                        <button className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-colors">
                            <ShoppingCart className="w-4 h-4 text-gray-600 hover:text-blue-500" />
                        </button>
                    </div>

                    {/* Quick View Overlay */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <span className="text-white text-sm font-medium bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                            Xem nhanh
                        </span>
                    </div>
                </div>
            </div>

            <div className="p-4">
                <Link href={`/productdetail/${product.ProductID}`} className="block group-hover:text-red-500 transition-colors">
                    <h3 className="text-sm font-medium text-gray-900 line-clamp-2 h-12 leading-6 mb-2 hover:text-red-500 transition-colors duration-200 group-hover:text-red-600">
                        {product.Name}
                    </h3>
                </Link>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-3">
                    <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                className={`w-3 h-3 ${i < Math.floor(product.rating || 4.5)
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "fill-gray-200 text-gray-200"
                                    }`}
                            />
                        ))}
                    </div>
                    <span className="text-xs text-gray-500 ml-1">({product.rating || "4.5"})</span>
                    {product.SoldCount && product.SoldCount > 0 && (
                        <span className="text-xs text-gray-400 ml-auto">
                            Đã bán {product.SoldCount > 1000 ? `${(product.SoldCount / 1000).toFixed(1)}k` : product.SoldCount}
                        </span>
                    )}
                </div>

                {/* Price Section */}
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="text-red-500 font-bold text-lg">
                            ₫{new Intl.NumberFormat("vi-VN").format(mainVariant?.Price || 0)}
                        </span>
                        {hasDiscount && (
                            <span className="text-gray-400 text-sm line-through">
                                ₫{new Intl.NumberFormat("vi-VN").format(mainVariant.CompareAtPrice || 0)}
                            </span>
                        )}
                    </div>

                    {/* Free Shipping Badge */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full font-medium">
                            Miễn phí vận chuyển
                        </span>
                    </div>
                </div>
            </div>

            {/* Bottom Gradient Border */}
            <div className="h-1 bg-gradient-to-r from-red-500 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
    )
}

// Component này chỉ có nhiệm vụ hiển thị, không tự fetch dữ liệu
export default function CategoryProductView({ products, pagination, categoryId }: CategoryProductViewProps) {
    if (products.length === 0) {
        return (
            <div className="bg-white rounded-lg p-20 text-center shadow-sm border border-gray-100">
                <div className="text-gray-300 mb-6">
                    <ShoppingCart className="w-20 h-20 mx-auto mb-4" />
                </div>
                <h3 className="text-xl font-bold text-gray-700 mb-3">Không tìm thấy sản phẩm nào</h3>
                <p className="text-gray-500 mb-6 text-lg">Danh mục này hiện chưa có sản phẩm nào</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6">
            <SortBar />

            {/* Products Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {products.map((product) => (
                    <ModernProductCard key={product.ProductID} product={product} />
                ))}
            </div>

            {/* Pagination Placeholder */}
            <div className="mt-4 flex justify-center">
                {pagination.lastPage > 1 && (
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                        <p className="text-sm text-gray-500">
                            Trang {pagination.currentPage} / {pagination.lastPage}
                            <span className="ml-2 text-red-500 font-medium">({pagination.total.toLocaleString()} sản phẩm)</span>
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
