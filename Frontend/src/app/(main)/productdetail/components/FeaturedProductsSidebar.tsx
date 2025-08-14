// 1. Đánh dấu đây là Client Component
"use client";

import axios from 'axios';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Eye, Star } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { API_URL } from '@/lib/config';

// ===================================================================
// TYPES VÀ HELPER FUNCTIONS (Giữ nguyên)
// ===================================================================

interface Product { // Đổi tên cho chung chung hơn
    product_id: number;
    product_name: string;
    lowest_price: number | null;
    discount: number;
    view_count: number;
    image_url: string | null;
}

const formatPrice = (price: number | null) => {
    if (price === null) return 'N/A';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

// ===================================================================
// SUB-COMPONENT: ProductCard (Giữ nguyên)
// ===================================================================

interface ProductCardProps {
    product: Product;
}

function ProductCard({ product }: ProductCardProps) {
    const hasDiscount = product.discount > 0 && product.lowest_price !== null;
    const originalPrice = hasDiscount
        ? product.lowest_price! / (1 - product.discount / 100)
        : product.lowest_price;

    return (
        <Link href={`/productdetail/${product.product_id}`} className="block group">
            <div className="border border-gray-200 rounded-md p-3 transition-all duration-300 group-hover:shadow-md">
                {/* ... nội dung card giữ nguyên ... */}
                <div className="relative aspect-square mb-3">
                    {hasDiscount && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md z-10">
                            -{product.discount}%
                        </div>
                    )}
                    <div className="absolute top-2 right-2 flex flex-col gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="bg-white rounded-full p-1.5 shadow-sm hover:bg-gray-100 transition">
                            <Heart size={16} className="text-gray-600" />
                        </button>
                        <button className="bg-white rounded-full p-1.5 shadow-sm hover:bg-gray-100 transition">
                            <Eye size={16} className="text-gray-600" />
                        </button>
                    </div>
                    <Image
                        src={product.image_url || '/placeholder-image.png'}
                        alt={product.product_name}
                        fill
                        className="object-contain rounded-md"
                    />
                </div>
                <div>
                    <h4 className="text-sm font-medium text-gray-800 truncate group-hover:text-blue-600">
                        {product.product_name}
                    </h4>
                    <div className="flex items-baseline gap-2 mt-1">
                        <p className="text-base font-bold text-red-600">
                            {formatPrice(product.lowest_price)}
                        </p>
                        {hasDiscount && (
                            <p className="text-xs text-gray-500 line-through">
                                {formatPrice(originalPrice)}
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                        <div className="flex text-yellow-400">
                            <Star size={14} fill="currentColor" />
                            <Star size={14} fill="currentColor" />
                            <Star size={14} fill="currentColor" />
                            <Star size={14} fill="currentColor" />
                            <Star size={14} className="text-gray-300" fill="currentColor" />
                        </div>
                        <span>(99)</span>
                    </div>
                </div>
            </div>
        </Link>
    );
}

// ===================================================================
// MAIN COMPONENT - Sửa đổi hoàn toàn để hiển thị sản phẩm liên quan
// ===================================================================

// Định nghĩa props mà component này sẽ nhận
interface RelatedProductsSidebarProps {
    currentProductId: number;
}

export default function RelatedProductsSidebar({ currentProductId }: RelatedProductsSidebarProps) {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Nếu không có ID, không làm gì cả
        if (!currentProductId) {
            setIsLoading(false);
            return;
        }

        const fetchRelatedProducts = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Gọi API sản phẩm liên quan với ID được truyền vào
                const apiUrl = `${API_URL}/featuredRelated-products/${currentProductId}`;
                const response = await axios.get<Product[]>(apiUrl);

                // Dữ liệu trả về đã là mảng sản phẩm, không cần .flatMap
                setProducts(response.data);

            } catch (err) {
                console.error("Failed to fetch related products:", err);
                setError("Không thể tải sản phẩm liên quan.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchRelatedProducts();
    }, [currentProductId]); // useEffect sẽ chạy lại khi currentProductId thay đổi

    if (isLoading) {
        return (
            <aside className="w-full lg:w-80 flex-shrink-0">
                <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-bold mb-4">Sản Phẩm Liên Quan</h3>
                    <div className="space-y-4 animate-pulse">
                        {/* Skeleton loader */}
                    </div>
                </div>
            </aside>
        );
    }

    // Nếu có lỗi hoặc không có sản phẩm nào, không hiển thị gì cả
    if (error || products.length === 0) {
        return null;
    }

    return (
        <aside className="w-full">
            <div className=" rounded-lg p-4">
                <h3 className="text-lg font-bold mb-4">Sản Phẩm Liên Quan</h3>
                <div className="space-y-4">
                    {products.map(product => (
                        <ProductCard key={product.product_id} product={product} />
                    ))}
                </div>
            </div>
        </aside>
    );
}