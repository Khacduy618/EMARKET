'use client';


import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard, { type Product } from './ProductCard'; // Import cả Component và Type
import { Loader2 } from 'lucide-react';


/**
 * Hàm tiện ích để "dọn dẹp" URL ảnh bị lỗi từ API.
 * Nó sẽ cắt bỏ phần `http://localhost/storage/` thừa.
 * @param corruptedUrl - URL bị lỗi từ API.
 * @returns URL đã được sửa hoặc ảnh placeholder.
 */
const cleanImageUrl = (corruptedUrl: string | null): string => {
    if (!corruptedUrl) {
        return '/placeholder.png';
    }
    const secondHttpIndex = corruptedUrl.indexOf('http', 1);
    return secondHttpIndex > -1 ? corruptedUrl.substring(secondHttpIndex) : corruptedUrl;
};


interface RelatedItemsProps {
    currentProductId: number;
}


const RelatedItems: React.FC<RelatedItemsProps> = ({ currentProductId }) => {
    // === SỬA ĐỔI 1: SỬ DỤNG TYPE PRODUCT ĐÃ IMPORT ===
    const [products, setProducts] = useState<Product[]>([]);
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


                // === SỬA ĐỔI 2: ĐƠN GIẢN HÓA VIỆC GỌI API ===
                // Cho axios biết API trả về một mảng Product.
                const response = await axios.get<Product[]>(apiUrl);


                // === SỬA ĐỔI 3: XỬ LÝ DỮ LIỆU SAU KHI GỌI API ===
                // Duyệt qua từng sản phẩm và chỉ sửa lại `imageUrl`.
                const cleanedProducts = response.data.map(product => ({
                    ...product,
                    imageUrl: cleanImageUrl(product.imageUrl),
                }));


                setProducts(cleanedProducts);


            } catch (err) {                console.error("Lỗi khi gọi API sản phẩm liên quan:", err);
                setError("Không thể tải sản phẩm liên quan.");
            } finally {
                setLoading(false);
            }
        };


        fetchRelatedProducts();
    }, [currentProductId]);


    // --- Phần hiển thị JSX được giữ nguyên ---


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
        return null;
    }


    return (
        <section className="max-w-screen-xl mx-auto px-4 py-12">
            <div className="flex items-center mb-8">
                <div className="w-5 h-10 bg-red-500 rounded-sm"></div>
                <h2 className="ml-4 text-red-500 font-semibold text-base">Sản phẩm liên quan</h2>
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

