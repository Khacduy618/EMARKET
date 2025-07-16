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
import { getFullImageUrl } from '@/services/api';

// // Định nghĩa cấu trúc dữ liệu cho một sản phẩm.
// interface Product {
//     id: number;
//     name: string;
//     imageUrl: string;
//     price: number;
//     originalPrice?: number;
//     discountPercent?: number;
//     rating: number;
//     reviewCount: number;
// }

interface ApiProduct {
    product_id: number;
    product_name: string;
    image_url: string | null; // Đường dẫn tương đối từ API
    lowest_price: number;
    original_price?: number;
    discount?: number;
    average_rating: number;
    reviews_count: number;
}

// Interface cho dữ liệu mà ProductCard mong đợi
interface ProductForCard {
    id: number;
    name: string;
    imageUrl: string; // URL tuyệt đối, hoàn chỉnh
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
    const [products, setProducts] = useState<ProductForCard[]>([]); // <<<--- State dùng kiểu dữ liệu của Card
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!currentProductId) {
            setLoading(false);
            return;
        }

        const fetchRelatedProducts = async () => {
            setLoading(true);
            setError(null);
            try {
                const apiUrl = `http://localhost:8001/api/products/${currentProductId}/related`;
                const response = await axios.get<ApiProduct[]>(apiUrl); // <<<--- API trả về kiểu ApiProduct

                // === SỬA LỖI NẰM Ở ĐÂY ===
                // Chuyển đổi dữ liệu từ API sang định dạng mà ProductCard cần
                const formattedProducts: ProductForCard[] = response.data.map(apiProduct => ({
                    id: apiProduct.product_id,
                    name: apiProduct.product_name,
                    // Sử dụng getFullImageUrl để tạo URL hoàn chỉnh
                    imageUrl: getFullImageUrl(apiProduct.image_url),
                    price: apiProduct.lowest_price,
                    originalPrice: apiProduct.original_price,
                    discountPercent: apiProduct.discount,
                    rating: apiProduct.average_rating,
                    reviewCount: apiProduct.reviews_count
                }));
                // === KẾT THÚC PHẦN SỬA LỖI ===

                setProducts(formattedProducts);

            } catch (err) {
                console.error("Lỗi khi gọi API sản phẩm liên quan:", err);
                setError("Không thể tải sản phẩm liên quan.");
            } finally {
                setLoading(false);
            }
        };

        fetchRelatedProducts();
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