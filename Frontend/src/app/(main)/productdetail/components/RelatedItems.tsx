/**
 * RelatedItems.tsx
 *
 * Component này nhận vào ID của sản phẩm hiện tại, gọi API để lấy
 * danh sách sản phẩm liên quan, và dùng ProductCard để hiển thị chúng.
 */
'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from './ProductCard';
import { Loader2 } from 'lucide-react';

// Định nghĩa cấu trúc dữ liệu cho một sản phẩm.
interface Product {
    id: number;
    name: string;
    imageUrl: string;
    price: number;
    originalPrice?: number;
    discountPercent?: number;
    rating: number;
    reviewCount: number;
}

// === SỬA ĐỔI 1: THÊM PROPS CHO COMPONENT ===
// Component này bây giờ cần nhận vào ID của sản phẩm hiện tại.
interface RelatedItemsProps {
    currentProductId: number;
}

const RelatedItems: React.FC<RelatedItemsProps> = ({ currentProductId }) => {
    // --- State Management ---
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // --- Data Fetching ---
    useEffect(() => {
        // Nếu không có ID sản phẩm, không làm gì cả.
        if (!currentProductId) {
            setLoading(false);
            return;
        }

        const fetchRelatedProducts = async () => {
            setLoading(true);
            setError(null);

            try {
                // === SỬA ĐỔI 2: XÂY DỰNG URL ĐỘNG ===
                // Sử dụng template string (dấu `) để chèn ID sản phẩm vào URL.
                const apiUrl = `http://localhost:8001/api/products/${currentProductId}/related`;
                console.log("Calling API:", apiUrl); // In ra để debug

                const response = await axios.get<Product[]>(apiUrl);

                setProducts(response.data);

            } catch (err) {
                console.error("Lỗi khi gọi API sản phẩm liên quan:", err);
                setError("Không thể tải sản phẩm liên quan. Vui lòng thử lại sau.");
            } finally {
                setLoading(false);
            }
        };

        fetchRelatedProducts();

        // === SỬA ĐỔI 3: THÊM `currentProductId` VÀO DEPENDENCY ARRAY ===
        // useEffect sẽ chạy lại mỗi khi ID sản phẩm hiện tại thay đổi.
    }, [currentProductId]);

    // --- Xử lý các trạng thái hiển thị (giữ nguyên) ---

    if (loading) {
        return (
            <section className="flex justify-center items-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-red-500" />
            </section>
        );
    }

    if (error) {
        return (
            <section className="text-center py-20">
                <p className="text-red-600 font-semibold">{error}</p>
            </section>
        );
    }

    if (products.length === 0) {
        return null; // Không hiển thị gì nếu không có sản phẩm liên quan.
    }

    return (
        <section className="max-w-screen-xl mx-auto px-4 py-12">
            <div className="flex items-center mb-8">
                <div className="w-5 h-10 bg-red-500"></div>
                <h2 className="text-red-500 font-semibold text-base">Related Item</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map(product => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </section>
    );
};

export default RelatedItems;