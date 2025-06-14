// 'use client';
// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import Link from 'next/link';

// // Interfaces (Giữ nguyên)
// interface ApiProduct {
//     ProductID: number;
//     ProductName: string;
//     ProductLevelDiscount: number;
//     Price: number;
//     CompareAtPrice?: number | null;
//     ImageURL?: string | null;
//     FinalPrice: number;
//     average_rating?: number | null;
//     SoldCount?: number;
// }

// interface ProcessedProduct {
//     ProductID: number;
//     ProductName: string;
//     ImageURL: string | null;
//     FinalPrice: number;
//     originalPrice: number | null;
//     discountPercent: number;
//     averageRatingValue: number;
//     reviewCount: number;
// }

// export default function BestSellingProducts() {
//     const [products, setProducts] = useState<ProcessedProduct[]>([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);

//     // --- useEffect và logic fetch data giữ nguyên ---
//     useEffect(() => {
//         setLoading(true);
//         setError(null);
//         axios.get<ApiProduct[]>('http://localhost:8001/api/products/best-selling')
//             .then(res => {
//                 const fetchedProducts = res.data.map((p): ProcessedProduct | null => {
//                     if (p.FinalPrice === null || p.Price === null) return null;
//                     const finalPrice = p.FinalPrice;
//                     const originalPrice = p.CompareAtPrice ?? p.Price;
//                     const discountPercent = originalPrice > finalPrice ? ((originalPrice - finalPrice) / originalPrice) * 100 : p.ProductLevelDiscount;
//                     return {
//                         ProductID: p.ProductID,
//                         ProductName: p.ProductName,
//                         ImageURL: p.ImageURL ?? null,
//                         FinalPrice: finalPrice,
//                         originalPrice: originalPrice > finalPrice ? originalPrice : null,
//                         discountPercent: discountPercent,
//                         averageRatingValue: p.average_rating ?? (Math.floor(Math.random() * 25) + 25) / 10,
//                         reviewCount: p.SoldCount ?? (Math.floor(Math.random() * 200) + 50),
//                     };
//                 }).filter(Boolean) as ProcessedProduct[];
//                 setProducts(fetchedProducts);
//                 console.log("Dữ liệu sản phẩm đã xử lý:", processedData); // <-- THÊM DÒNG NÀY
//                 console.log("Kiểm tra ID bị trùng:", processedData.map(p => p.ProductID)); // <-- THÊM DÒNG NÀY
//             })
//             .catch(err => {
//                 setError("Không thể tải sản phẩm nổi bật.");
//                 console.error('API error:', err);
//             })
//             .finally(() => setLoading(false));
//     }, []);

//     const formatCurrency = (amount: number) => {
//         return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
//     };

//     // --- Loading & Error States (Giữ nguyên) ---
//     if (loading) { /* ... */ }
//     if (error) { /* ... */ }

//     return (
//         <section className="max-w-[1500px] mx-auto px-2 sm:px-4 py-8 sm:py-12 bg-orange-50">
//             {/* Header Section */}
//             <div className="text-center mb-8">
//                 <h2 className="text-lg sm:text-xl font-bold text-orange-600 uppercase tracking-widest">
//                     SẢN PHẨM NỔI BẬT
//                 </h2>
//                 <div className="w-24 h-1 bg-orange-500 mx-auto mt-2"></div>
//             </div>

//             {/* Product Grid */}
//             {products.length > 0 ? (
//                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-2.5">
//                     {products.map(product => (
//                         <Link
//                             href={`/productdetail/${product.ProductID}`}
//                             key={product.ProductID}
//                             className="group bg-white rounded-sm overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-transparent hover:border-orange-500 flex flex-col transform hover:-translate-y-1"
//                         >
//                             {/* Phần ảnh */}
//                             <div className="relative w-full aspect-square">
//                                 {product.discountPercent > 1 && (
//                                     <div className="absolute top-0 right-0 w-10 h-9 bg-yellow-400 text-center z-10 clip-discount-badge">
//                                         <span className="block text-red-600 font-bold text-sm leading-tight mt-0.5">{product.discountPercent.toFixed(0)}%</span>
//                                         <span className="block text-white font-bold text-[10px] leading-tight -mt-0.5">GIẢM</span>
//                                     </div>
//                                 )}
//                                 {/* eslint-disable-next-line @next/next/no-img-element */}
//                                 <img
//                                     src={
//                                         product.ImageURL
//                                             ? product.ImageURL.startsWith('http')
//                                                 ? product.ImageURL
//                                                 : `http://localhost:8001${product.ImageURL.startsWith('/') ? '' : '/'}${product.ImageURL}`
//                                             : 'https://via.placeholder.com/300x300/F0F0F0/AAAAAA?text=No+Image'
//                                     }
//                                     alt={product.ProductName}
//                                     className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
//                                     loading="lazy"
//                                 />
//                             </div>

//                             {/* Phần thông tin - Cấu trúc lại với flex-grow */}
//                             <div className="p-2 flex flex-col flex-grow">
//                                 <h3
//                                     className="text-xs sm:text-sm font-normal text-gray-800 mb-2 h-8 sm:h-10 leading-tight line-clamp-2"
//                                     title={product.ProductName}
//                                 >
//                                     {product.ProductName}
//                                 </h3>

//                                 {/* Đẩy phần giá và rating xuống dưới cùng */}
//                                 <div className="mt-auto">
//                                     <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
//                                         <div className="flex items-center">
//                                             <div className="flex text-yellow-400">
//                                                 {'★'.repeat(Math.round(product.averageRatingValue))}
//                                                 {'☆'.repeat(5 - Math.round(product.averageRatingValue))}
//                                             </div>
//                                             <span className="ml-1">({product.reviewCount})</span>
//                                         </div>
//                                     </div>
//                                     <div className="flex items-baseline min-h-[28px]">
//                                         <span className="text-red-600 font-bold text-sm sm:text-base mr-2">
//                                             {formatCurrency(product.FinalPrice)}
//                                         </span>
//                                         {product.originalPrice && (
//                                             <span className="line-through text-gray-400 text-xs sm:text-sm">
//                                                 {formatCurrency(product.originalPrice)}
//                                             </span>
//                                         )}
//                                     </div>
//                                 </div>
//                             </div>
//                         </Link>
//                     ))}
//                 </div>
//             ) : (
//                 !loading && (
//                     <div className="text-center py-16">
//                         <p className="text-gray-500 text-xl font-semibold">Không tìm thấy sản phẩm nổi bật nào.</p>
//                     </div>
//                 )
//             )}

//             {products.length > 0 && (
//                 <div className="flex justify-center mt-8 sm:mt-12">
//                     <button className="px-10 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-sm shadow-sm hover:bg-gray-50 transition-colors">
//                         Xem thêm
//                     </button>
//                 </div>
//             )}
//             <style jsx global>{`
//                 .line-clamp-2 {
//                     display: -webkit-box;
//                     -webkit-line-clamp: 2;
//                     -webkit-box-orient: vertical;
//                     overflow: hidden;
//                 }
//                 .clip-discount-badge {
//                     clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 85%, 0 100%);
//                 }
//             `}</style>
//         </section>
//     );
// }
'use client';
import React, { useEffect, useState } from 'react'; 
import axios from 'axios';
import Link from 'next/link';

// --- Interfaces ---
interface ApiProduct {
    ProductID: number;
    ProductName: string;
    ProductLevelDiscount: number;
    Price: number;
    CompareAtPrice?: number | null;
    ImageURL?: string | null;
    FinalPrice: number;
    average_rating?: number | null;
    SoldCount?: number;
}

interface ProcessedProduct {
    ProductID: number;
    ProductName: string;
    ImageURL: string | null;
    FinalPrice: number;
    originalPrice: number | null;
    discountPercent: number;
    averageRatingValue: number;
    reviewCount: number;
}

// --- Component ---
export default function ProductsCart() {
    const [products, setProducts] = useState<ProcessedProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
const IMAGE_BASE_URL = 'http://localhost';
    useEffect(() => {
        // Sử dụng AbortController để xử lý cleanup trong StrictMode
        const controller = new AbortController();

        const fetchProducts = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get<ApiProduct[]>('http://localhost:8001/api/products/best-selling', {
                    signal: controller.signal,
                });
                console.log("API :", response);
                const fetchedProducts = response.data.map((p): ProcessedProduct | null => {
                    if (p.FinalPrice === null || p.Price === null) return null;

                    const finalPrice = p.FinalPrice;
                    const originalPrice = p.CompareAtPrice ?? p.Price;
                    const discountPercent = originalPrice > finalPrice ? ((originalPrice - finalPrice) / originalPrice) * 100 : p.ProductLevelDiscount;

                    // Tạo số ngẫu nhiên ổn định dựa trên ProductID
                    const stableRandomRating = ((p.ProductID * 37) % 25 + 25) / 10; // Kết quả từ 2.5 -> 4.9
                    const stableRandomReview = (p.ProductID * 19) % 200 + 50;   // Kết quả từ 50 -> 249

                    return {
                        ProductID: p.ProductID,
                        ProductName: p.ProductName,
                        ImageURL: p.ImageURL ?? null,
                        FinalPrice: finalPrice,
                        originalPrice: originalPrice > finalPrice ? originalPrice : null,
                        discountPercent: discountPercent,
                        averageRatingValue: p.average_rating ?? stableRandomRating,
                        reviewCount: p.SoldCount ?? stableRandomReview,
                    };
                }).filter(Boolean) as ProcessedProduct[];

                setProducts(fetchedProducts);

            } catch (err) {
                // Bỏ qua lỗi nếu là do chúng ta chủ động hủy
                if (axios.isCancel(err)) {
                    console.log('Request canceled by cleanup');
                    return;
                }
                setError("Không thể tải sản phẩm nổi bật.");
                console.error('API error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();

        // Hàm cleanup, sẽ được gọi khi component unmount hoặc useEffect chạy lại
        return () => {
            controller.abort();
        };
    }, []);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    // --- Render Loading & Error States ---
    if (loading) {
        return (
            <section className="py-12 min-h-[400px] flex items-center justify-center bg-orange-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                    <p className="mt-4 text-orange-600 font-semibold">Đang tải sản phẩm nổi bật...</p>
                </div>
            </section>
        );
    }
    if (error) {
        return (
            <section className="py-12 min-h-[400px] flex flex-col items-center justify-center text-center bg-orange-50">
                <p className="text-red-600 font-semibold text-xl mb-2">Lỗi tải dữ liệu</p>
                <p className="text-slate-700">{error}</p>
            </section>
        );
    }

    if (products.length === 0) return null; // Không render gì nếu không có sản phẩm

    return (
        <section className="max-w-[1500px] mx-auto px-2 sm:px-4 py-8 sm:py-12 bg-white">
            {/* Header Section */}
            <div className="text-center mb-8">
                <h2 className="text-lg sm:text-xl font-bold text-orange-600 uppercase tracking-widest">
                    SẢN PHẨM NỔI BẬT
                </h2>
                <div className="w-24 h-1 bg-orange-500 mx-auto mt-2"></div>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-2.5">
                {products.map(product => (
                    <Link
                        href={`/productdetail/${product.ProductID}`}
                        key={product.ProductID}
                        className="group bg-white rounded-sm overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-transparent hover:border-orange-500 flex flex-col transform hover:-translate-y-1"
                    >
                        {/* Phần ảnh */}
                        <div className="relative w-full aspect-square">
                            {product.discountPercent > 1 && (
                                <div className="absolute top-0 right-0 w-10 h-9 bg-yellow-400 text-center z-10 clip-discount-badge">
                                    <span className="block text-red-600 font-bold text-sm leading-tight mt-0.5">{product.discountPercent.toFixed(0)}%</span>
                                    <span className="block text-white font-bold text-[10px] leading-tight -mt-0.5">GIẢM</span>
                                </div>
                            )}
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={
                                    product.ImageURL
                                        ? product.ImageURL.startsWith('http')
                                            ? product.ImageURL
                                            : `http://localhost:8001${product.ImageURL.startsWith('/') ? '' : '/'}${product.ImageURL}`
                                        : 'https://via.placeholder.com/300x300/F0F0F0/AAAAAA?text=No+Image'
                                }
                                alt={product.ProductName}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                loading="lazy"
                            />
                        </div>

                        {/* Phần thông tin */}
                        <div className="p-2 flex flex-col flex-grow">
                            <h3
                                className="text-xs sm:text-sm font-normal text-gray-800 mb-2 h-8 sm:h-10 leading-tight line-clamp-2"
                                title={product.ProductName}
                            >
                                {product.ProductName}
                            </h3>
                            <div className="mt-auto">
                                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                                    <div className="flex items-center">
                                        <div className="flex text-yellow-400">
                                            {'★'.repeat(Math.round(product.averageRatingValue))}
                                            {'☆'.repeat(5 - Math.round(product.averageRatingValue))}
                                        </div>
                                        <span className="ml-1">({product.reviewCount})</span>
                                    </div>
                                </div>
                                <div className="flex items-baseline min-h-[28px]">
                                    <span className="text-red-600 font-bold text-sm sm:text-base mr-2">
                                        {formatCurrency(product.FinalPrice)}
                                    </span>
                                    {product.originalPrice && (
                                        <span className="line-through text-gray-400 text-xs sm:text-sm">
                                            {formatCurrency(product.originalPrice)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Nút Xem thêm */}
            <div className="flex justify-center mt-8 sm:mt-12">
                <button className="px-10 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-sm shadow-sm hover:bg-gray-50 transition-colors">
                    Xem thêm
                </button>
            </div>

            <style jsx global>{`
                .line-clamp-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                .clip-discount-badge {
                    clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 85%, 0 100%);
                }
            `}</style>
        </section>
    );
}