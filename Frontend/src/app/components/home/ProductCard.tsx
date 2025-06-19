// 'use client';
// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import Link from 'next/link';

// // Interfaces (giữ nguyên)
// interface ApiProduct {
//     ProductID: number;
//     name: string;
//     product_discount: number | null;
//     average_rating: number | null;
//     primary_image_url: string | null;
//     variant_price: number | null;
//     final_price: number | null;
//     variant_specific_image_url: string | null;
//     sold_count_per_month?: number;
// }

// interface ProcessedProduct {
//     ProductID: number;
//     name: string;
//     ImageURL: string | null;
//     originalPrice: number;
//     finalPrice: number;
//     discountPercent: number;
//     soldCountDisplay: string;
// }

// export default function BestSellingProducts() {
//     const [products, setProducts] = useState<ProcessedProduct[]>([]);
//     const [loading, setLoading] = useState<boolean>(true);

//     useEffect(() => {
//         async function fetchProducts() {
//             setLoading(true);
//             try {
//                 const response = await axios.get<ApiProduct[]>('http://localhost:8001/api/ProductFinalPrice');
//                 const apiProducts: ApiProduct[] = response.data;

//                 const processedData = apiProducts.map((apiProd): ProcessedProduct | null => {
//                     if (apiProd.final_price === null || apiProd.variant_price === null) return null;

//                     const originalPriceNum = apiProd.variant_price;
//                     const finalPriceNum = apiProd.final_price;
//                     const discountPercentNum = originalPriceNum > 0 ? ((originalPriceNum - finalPriceNum) / originalPriceNum) * 100 : 0;

//                     const soldCount = apiProd.sold_count_per_month ?? (Math.floor(Math.random() * 5000) + 50);
//                     let soldCountDisplay = '';
//                     if (soldCount > 1000) {
//                         soldCountDisplay = `Đã bán ${(soldCount / 1000).toFixed(1)}k`.replace('.0', '');
//                     } else if (soldCount > 0) {
//                         soldCountDisplay = `Đã bán ${soldCount}`;
//                     }

//                     const imageUrl = apiProd.primary_image_url || apiProd.variant_specific_image_url;

//                     return {
//                         ProductID: Number(apiProd.ProductID),
//                         name: apiProd.name,
//                         ImageURL: imageUrl,
//                         originalPrice: originalPriceNum,
//                         finalPrice: finalPriceNum,
//                         discountPercent: discountPercentNum,
//                         soldCountDisplay: soldCountDisplay,
//                     };
//                 }).filter(Boolean) as ProcessedProduct[];

//                 setProducts(processedData);
//             } catch (error) {
//                 console.error('Error fetching products:', error);
//                 setProducts([]);
//             } finally {
//                 setLoading(false);
//             }
//         }
//         fetchProducts();
//     }, []);

//     const formatCurrency = (amount: number) => {
//         // Trả về số không có ký hiệu tiền tệ để giống Shopee
//         return new Intl.NumberFormat('vi-VN').format(amount);
//     };

//     if (loading) {
//         return (
//             <section className="py-6 bg-orange-50">
//                 <div className="max-w-[1500px] mx-auto px-4">
//                     <div className="text-center text-gray-500">Đang tải gợi ý...</div>
//                 </div>
//             </section>
//         );
//     }

//     if (products.length === 0) return null;

//     return (
//         <section className="py-4 sm:py-6 bg-orange-50">
//             <div className="max-w-[1500px] mx-auto px-2 sm:px-4">
//                 {/* Header Section */}
//                 <div className="mb-3 p-3 bg-white border-b-4 border-orange-500 text-center">
//                     <h2 className="text-base sm:text-lg font-bold text-orange-500 uppercase">
//                         GỢI Ý HÔM NAY
//                     </h2>
//                 </div>

//                 {/* Product Grid */}
//                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-2.5">
//                     {products.map((product) => (
//                         <div
//                             key={product.ProductID}
//                             className="group bg-white rounded-sm overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-transparent hover:border-orange-500 flex flex-col transform hover:-translate-y-1"
//                         >
//                             <Link href="#" className="flex flex-col h-full">
//                                 <div className="relative w-full aspect-square overflow-hidden">
//                                     <img
//                                         src={product.ImageURL || 'https://via.placeholder.com/200x200/F0F0F0/AAAAAA?text=No+Image'}
//                                         alt={product.name}
//                                         className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
//                                         loading="lazy"
//                                     />
//                                     {/* Yêu Thích+ Badge */}
//                                     <div className="absolute top-2 left-0 bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded-r-sm z-10">
//                                         Yêu thích+
//                                     </div>

//                                     {/* Discount Badge */}
//                                     {product.discountPercent > 1 && (
//                                         <div className="absolute top-0 right-0 w-9 h-8 bg-yellow-400 text-center z-10 clip-discount-badge">
//                                             <span className="block text-red-600 font-bold text-xs leading-tight mt-0.5">{product.discountPercent.toFixed(0)}%</span>
//                                             <span className="block text-white font-bold text-[9px] leading-tight -mt-0.5">GIẢM</span>
//                                         </div>
//                                     )}
//                                 </div>

//                                 <div className="p-2 flex flex-col flex-grow">
//                                     <Link href={`/productdetail/${product.ProductID}`}>
//                                         <h3
//                                             className="text-xs sm:text-sm font-normal text-gray-800 mb-2 h-8 leading-tight line-clamp-2"
//                                             title={product.name}
//                                         >
//                                             {product.name}
//                                         </h3>
//                                     </Link>

//                                     <div className="mt-auto flex items-center justify-between">
//                                         <div className="flex items-baseline">
//                                             <span className="text-orange-500 text-xs">₫</span>
//                                             <span className="text-orange-500 font-semibold text-sm sm:text-base">
//                                                 {formatCurrency(product.finalPrice)}
//                                             </span>
//                                         </div>
//                                         <span className="text-gray-500 text-[10px] sm:text-xs">
//                                             {product.soldCountDisplay}
//                                         </span>
//                                     </div>
//                                 </div>
//                             </Link>
//                         </div>
//                     ))}
//                 </div>

//                 {/* Load More Button */}
//                 <div className="flex justify-center mt-6">
//                     <button className="px-10 py-2 bg-white text-gray-700 border border-gray-300 rounded-sm shadow-sm hover:bg-gray-50 transition-colors">
//                         Xem thêm
//                     </button>
//                 </div>
//             </div>
//             <style jsx>{`
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

// Interfaces (giữ nguyên)
interface ApiProduct {
    ProductID: number;
    name: string;
    product_discount: number | null;
    primary_image_url: string | null;
    variant_price: number | null;
    final_price: number | null;
    variant_specific_image_url: string | null;
    sold_count_per_month?: number;
}

interface ProcessedProduct {
    ProductID: number;
    name: string;
    ImageURL: string | null;
    finalPrice: number;
    discountPercent: number;
    soldCountDisplay: string;
}

export default function BestSellingProducts() {
    const [products, setProducts] = useState<ProcessedProduct[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        async function fetchProducts() {
            setLoading(true);
            try {
                const response = await axios.get<ApiProduct[]>('http://localhost:8001/api/ProductFinalPrice');
                const apiProducts: ApiProduct[] = response.data;

                const processedData = apiProducts.map((apiProd): ProcessedProduct | null => {
                    if (apiProd.final_price === null || apiProd.variant_price === null) return null;

                    const originalPriceNum = apiProd.variant_price;
                    const finalPriceNum = apiProd.final_price;
                    const discountPercentNum = originalPriceNum > 0 ? ((originalPriceNum - finalPriceNum) / originalPriceNum) * 100 : 0;

                    const soldCount = apiProd.sold_count_per_month ?? (Math.floor(Math.random() * 5000) + 50);
                    let soldCountDisplay = '';
                    if (soldCount > 1000) {
                        soldCountDisplay = `Đã bán ${(soldCount / 1000).toFixed(1)}k`.replace('.0', '');
                    } else if (soldCount > 0) {
                        soldCountDisplay = `Đã bán ${soldCount}`;
                    }

                    const imageUrl = apiProd.primary_image_url || apiProd.variant_specific_image_url;

                    return {
                        ProductID: Number(apiProd.ProductID),
                        name: apiProd.name,
                        ImageURL: imageUrl ?? null,
                        finalPrice: finalPriceNum,
                        discountPercent: discountPercentNum,
                        soldCountDisplay: soldCountDisplay,
                    };
                }).filter(Boolean) as ProcessedProduct[];

                setProducts(processedData);
            } catch (error) {
                console.error('Error fetching products:', error);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        }
        fetchProducts();
    }, []);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN').format(amount);
    };

    if (loading) return null; // Hoặc một skeleton loader
    if (products.length === 0) return null;

    return (
        <section className="py-4 sm:py-6 bg-white">
            <div className="max-w-[1500px] mx-auto px-2 sm:px-4">
                {/* Header Section */}
                <div className="mb-3 p-3 bg-white border-b-4 border-orange-500 text-center">
                    <h2 className="text-base sm:text-lg font-bold text-orange-500 uppercase">
                        GỢI Ý HÔM NAY
                    </h2>
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-2.5">
                    {products.map((product) => (
                        // ===============================================
                        // SỬA LỖI Ở ĐÂY: DÙNG MỘT LINK DUY NHẤT BỌC TẤT CẢ
                        // ===============================================
                        <Link
                            href={`/productdetail/${product.ProductID}`}
                            key={product.ProductID}
                            className="group bg-white rounded-sm overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-transparent hover:border-orange-500 flex flex-col transform hover:-translate-y-1"
                        >
                            {/* Phần ảnh sản phẩm */}
                            <div className="relative w-full aspect-square overflow-hidden">
                                <img
                                    src={product.ImageURL || 'https://via.placeholder.com/200x200/F0F0F0/AAAAAA?text=No+Image'}
                                    alt={product.name}
                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    loading="lazy"
                                />
                                <div className="absolute top-2 left-0 bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded-r-sm z-10">
                                    Yêu thích+
                                </div>
                                {product.discountPercent > 1 && (
                                    <div className="absolute top-0 right-0 w-9 h-8 bg-yellow-400 text-center z-10 clip-discount-badge">
                                        <span className="block text-red-600 font-bold text-xs leading-tight mt-0.5">{product.discountPercent.toFixed(0)}%</span>
                                        <span className="block text-white font-bold text-[9px] leading-tight -mt-0.5">GIẢM</span>
                                    </div>
                                )}
                            </div>

                            {/* Phần thông tin sản phẩm */}
                            <div className="p-2 flex flex-col flex-grow">
                                <h3
                                    className="text-xs sm:text-sm font-normal text-gray-800 mb-2 h-8 leading-tight line-clamp-2"
                                    title={product.name}
                                >
                                    {product.name}
                                </h3>
                                <div className="mt-auto flex items-center justify-between">
                                    <div className="flex items-baseline">
                                        <span className="text-orange-500 text-xs">₫</span>
                                        <span className="text-orange-500 font-semibold text-sm sm:text-base">
                                            {formatCurrency(product.finalPrice)}
                                        </span>
                                    </div>
                                    <span className="text-gray-500 text-[10px] sm:text-xs">
                                        {product.soldCountDisplay}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Load More Button */}
                <div className="flex justify-center mt-6">
                    <button className="px-10 py-2 bg-white text-gray-700 border border-gray-300 rounded-sm shadow-sm hover:bg-gray-50 transition-colors">
                        Xem thêm
                    </button>
                </div>
            </div>
            <style jsx>{`
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
