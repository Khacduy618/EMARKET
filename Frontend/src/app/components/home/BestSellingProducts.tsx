'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { getFullImageUrl } from '@/services/api';
import { API_URL } from '@/lib/config';

// --- Interfaces: Định nghĩa lại để khớp với API và nhu cầu của component ---

// Interface cho dữ liệu thô của 1 sản phẩm từ API
interface ApiProduct {
    ProductID: number;
    ProductName: string;
    PrimaryImage: string | null;
    CurrentPrice: number;
    OriginalPrice: number | null;
    TotalQuantitySold: string; // API trả về dạng string
}

// Interface cho đối tượng phân trang của API
interface PaginationResponse {
    data: ApiProduct[];
    // bạn có thể thêm các thuộc tính khác của pagination nếu cần
    // current_page: number;
    // last_page: number;
}

// Interface cho sản phẩm đã được xử lý để hiển thị trên UI
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

    useEffect(() => {
        const controller = new AbortController();

        const fetchProducts = async () => {
            setLoading(true);
            setError(null);
            try {
                // SỬA 1: API trả về một object lớn, trong đó có key 'data' chứa object phân trang.
                const response = await axios.get<{ data: PaginationResponse }>(
                    `${API_URL}/products/best-selling`, {
                    signal: controller.signal,
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                    withCredentials: true, // Đảm bảo gửi cookie CSRF nếu cần
                });

                // SỬA 2: Mảng sản phẩm thực sự nằm trong `response.data.data`
                const fetchedProducts = response.data.data.data.map((p): ProcessedProduct => {

                    // SỬA 3: Sử dụng đúng tên trường từ API và xử lý dữ liệu
                    const finalPrice = p.CurrentPrice;
                    const originalPrice = p.OriginalPrice;
                    const soldCount = parseInt(p.TotalQuantitySold, 10) || 0;

                    // Tính toán % giảm giá chính xác
                    const discountPercent = (originalPrice && originalPrice > finalPrice)
                        ? ((originalPrice - finalPrice) / originalPrice) * 100
                        : 0;

                    // Tạo số ngẫu nhiên ổn định dựa trên ProductID (vì API không có rating)
                    const stableRandomRating = ((p.ProductID * 37) % 25 + 25) / 10; // Kết quả từ 2.5 -> 4.9

                    // Trả về object đã được xử lý
                    return {
                        ProductID: p.ProductID,
                        ProductName: p.ProductName,
                        ImageURL: p.PrimaryImage,
                        FinalPrice: finalPrice,
                        originalPrice: (originalPrice && originalPrice > finalPrice) ? originalPrice : null,
                        discountPercent: discountPercent,
                        averageRatingValue: stableRandomRating,
                        reviewCount: soldCount,
                    };
                });

                setProducts(fetchedProducts);

            } catch (err) {
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

        // Hàm cleanup để hủy request khi component unmount
        return () => {
            controller.abort();
        };
    }, []); // Mảng rỗng đảm bảo useEffect chỉ chạy 1 lần

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    // --- Render các trạng thái ---
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

    if (products.length === 0) return null;

    // --- Render nội dung chính ---
    return (
        <section className="max-w-[1500px] mx-auto px-2 sm:px-4 py-8 sm:py-12 bg-white">
            <div className="text-center mb-8">
                <h2 className="text-lg sm:text-xl font-bold text-orange-600 uppercase tracking-widest">
                    SẢN PHẨM NỔI BẬT
                </h2>
                <div className="w-24 h-1 bg-orange-500 mx-auto mt-2"></div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-2.5">
                {products.map(product => (
                    <Link
                        href={`/productdetail/${product.ProductID}`}
                        key={product.ProductID}
                        className="group bg-white rounded-sm overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-transparent hover:border-orange-500 flex flex-col transform hover:-translate-y-1"
                    >
                        <div className="relative w-full aspect-square">
                            {product.discountPercent > 1 && (
                                <div className="absolute top-0 right-0 w-10 h-9 bg-yellow-400 text-center z-10 clip-discount-badge">
                                    <span className="block text-red-600 font-bold text-sm leading-tight mt-0.5">{product.discountPercent.toFixed(0)}%</span>
                                    <span className="block text-white font-bold text-[10px] leading-tight -mt-0.5">GIẢM</span>
                                </div>
                            )}
                            <img
                                src={getFullImageUrl(product.ImageURL)}
                                alt={product.ProductName}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                loading="lazy"
                            />
                        </div>
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
        </section>
    );
}