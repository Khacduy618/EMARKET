// 
'use client';
import React, { useEffect, useState } from 'react';
// import Image from 'next/image'; // Nếu bạn dùng Next.js, hãy bỏ comment dòng này
import axios from 'axios';

// Interface khớp với cấu trúc thực tế của JSON từ API của bạn
interface ApiProduct {
    ProductID: number; // API trả về number
    name: string;
    product_discount: number | null; // Số tiền giảm giá, có thể là null nếu không giảm
    average_rating: number | null;
    primary_image_url: string | null;
    variant_sku: string | null;
    variant_price: number | null; // Giá gốc của biến thể
    final_price: number | null;   // Giá cuối cùng
    variant_specific_image_url: string | null;
    attributes: string;
    // Giả sử API có thể trả về SoldCount (nhưng trong ví dụ JSON không có)
    SoldCount?: number;
}

// Interface cho sản phẩm đã được xử lý ở client
interface ProcessedProduct {
    ProductID: number;
    name: string;
    ImageURL: string | null; // Sẽ dùng primary_image_url hoặc variant_specific_image_url
    originalPrice: number;   // Chính là variant_price
    discountAmount: number;  // Chính là product_discount
    finalPrice: number;      // Chính là final_price từ API
    discountPercent: number; // Tính toán để hiển thị
    averageRatingValue: number;
    reviewCount: number;
}


export default function BestSellingProducts() {
    const [products, setProducts] = useState<ProcessedProduct[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        async function fetchProducts() {
            setLoading(true);
            try {
                // Đảm bảo URL API là chính xác
                const response = await axios.get<ApiProduct[]>('http://localhost:8001/api/ProductFinalPrice');
                const apiProducts: ApiProduct[] = response.data;

                const processedData = apiProducts.map((apiProd): ProcessedProduct | null => {
                    // Bỏ qua sản phẩm nếu không có giá biến thể (coi như không bán được)
                    if (apiProd.variant_price === null || apiProd.variant_price === undefined) {
                        return null;
                    }

                    const originalPriceNum = apiProd.variant_price;
                    const discountAmountNum = apiProd.product_discount ?? 0; // Nếu null thì là 0
                    const finalPriceNum = apiProd.final_price ?? originalPriceNum - discountAmountNum; // Nếu final_price null, tự tính

                    let discountPercentNum = 0;
                    if (originalPriceNum > 0 && discountAmountNum > 0) {
                        discountPercentNum = (discountAmountNum / originalPriceNum) * 100;
                    }

                    // Ưu tiên ảnh chính của sản phẩm, nếu không có thì lấy ảnh của biến thể
                    const imageUrl = apiProd.primary_image_url || apiProd.variant_specific_image_url;

                    return {
                        ProductID: Number(apiProd.ProductID),
                        name: apiProd.name,
                        ImageURL: imageUrl,
                        originalPrice: originalPriceNum,
                        discountAmount: discountAmountNum,
                        finalPrice: finalPriceNum,
                        discountPercent: discountPercentNum, // Để hiển thị % giảm
                        averageRatingValue: apiProd.average_rating ?? (Math.floor(Math.random() * 3) + 3), // Mock rating nếu null
                        reviewCount: apiProd.SoldCount ?? (Math.floor(Math.random() * 200) + 50), // Mock review count nếu SoldCount không có
                    };
                }).filter(Boolean) as ProcessedProduct[]; // Loại bỏ các giá trị null

                setProducts(processedData.slice(0, 10)); // Giới hạn 10 sản phẩm
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    console.error('Axios error fetching best selling products:', error.message);
                    // ... (phần xử lý lỗi giữ nguyên)
                } else {
                    console.error('Error fetching best selling products:', error);
                }
                setProducts([]);
            } finally {
                setLoading(false);
            }
        }
        fetchProducts();
    }, []);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    // Phần JSX (Loading, No products, Product Grid) giữ nguyên cấu trúc
    // Chỉ cần đảm bảo các prop truyền vào component con (như product.ImageURL, product.discountPercent)
    // sử dụng đúng tên trường từ ProcessedProduct.

    if (loading) {
        return (
            <section className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-[400px] flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto"></div>
                    <p className="mt-4 text-sky-600 font-semibold">Đang tải sản phẩm bán chạy...</p>
                </div>
            </section>
        );
    }

    if (products.length === 0 && !loading) {
        return (
            <section className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-slate-50">
                <div className="text-center">
                    <p className="text-slate-500 text-lg">Không tìm thấy sản phẩm bán chạy nào.</p>
                </div>
            </section>
        );
    }

    return (
        <section className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-slate-50">
            <div className="text-center mb-10 sm:mb-12">
                <div className="flex items-center justify-center gap-2 mb-2 sm:mb-3">
                    <div className="w-1.5 h-4 sm:w-2 sm:h-5 bg-sky-500 rounded-sm"></div>
                    <h2 className="text-sm sm:text-base font-semibold text-sky-600 uppercase tracking-wide">TOP BÁN CHẠY</h2>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-1 sm:mb-2">SẢN PHẨM BÁN CHẠY NHẤT</h1>
                <div className="w-16 sm:w-20 h-0.5 sm:h-1 bg-sky-500 mx-auto"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 sm:gap-6">
                {products.map((product) => (
                    <div
                        key={product.ProductID}
                        className="group bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-200/80 hover:border-sky-300 flex flex-col transform hover:-translate-y-1"
                    >
                        <div className="relative p-3 sm:p-4 aspect-square">
                            {/* {product.discountPercent > 0 && ( // Sử dụng discountPercent đã tính
                                // <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10 bg-red-500 text-white text-[10px] sm:text-xs font-bold px-2 py-1 rounded-full shadow-md">
                                //     GIẢM {product.discountPercent.toFixed(0)}%
                                // </div>
                            )} */}
                            <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10">
                                <button title="Yêu thích" className="bg-white/80 backdrop-blur-sm rounded-full p-1.5 sm:p-2 shadow-md hover:text-red-500 text-slate-500 transition-all duration-200 hover:scale-110">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                </button>
                            </div>
                            <img
                                src={product.ImageURL || 'https://via.placeholder.com/300x300/F0F0F0/AAAAAA?text=No+Image'}
                                alt={product.name}
                                className="mx-auto h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                                loading="lazy"
                                onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x300/F0F0F0/AAAAAA?text=Error'; }}
                            />
                        </div>
                        <div className="p-3 sm:p-4 border-t border-slate-100 flex flex-col flex-grow">
                            <h3
                                className="text-sm sm:text-base font-semibold text-slate-800 mb-1.5 h-10 sm:h-12 leading-tight line-clamp-2 group-hover:text-sky-600 transition-colors"
                                title={product.name}
                            >
                                {product.name}
                            </h3>
                            <div className="mt-auto">
                                <div className="mb-2">
                                    <span className="text-sky-600 font-bold text-base sm:text-lg mr-2">
                                        {formatCurrency(product.finalPrice)}
                                    </span>
                                    {product.discountPercent > 0 && ( // Hiển thị giá gốc nếu có giảm giá
                                        <span className="line-through text-slate-400 text-xs sm:text-sm">
                                            {formatCurrency(product.originalPrice)}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center justify-between text-xs sm:text-sm text-slate-500 mb-3">
                                    <div className="flex items-center">
                                        <div className="flex text-yellow-400">
                                            {'★'.repeat(Math.max(0, Math.min(5, Math.round(product.averageRatingValue))))}
                                            {'☆'.repeat(Math.max(0, 5 - Math.min(5, Math.round(product.averageRatingValue))))}
                                        </div>
                                        <span className="ml-1.5">({product.reviewCount} đánh giá)</span>
                                    </div>
                                </div>
                                <button className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-300 transform group-hover:scale-105 text-sm shadow-md group-hover:shadow-lg">
                                    Thêm vào giỏ
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-center mt-12 sm:mt-16">
                <button className="group relative inline-flex items-center justify-center px-8 py-3 bg-white text-sky-600 border-2 border-sky-600 font-bold rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden hover:text-white">
                    <span className="absolute inset-0 w-0 bg-sky-600 transition-all duration-300 ease-out group-hover:w-full"></span>
                    <span className="relative flex items-center">
                        Xem tất cả
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                    </span>
                </button>
            </div>

            <style jsx global>{`
                .line-clamp-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
            `}</style>
        </section>
    );
}