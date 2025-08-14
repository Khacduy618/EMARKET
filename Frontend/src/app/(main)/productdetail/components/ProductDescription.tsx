
"use client";

import { API_URL } from '@/lib/config';
import axios from 'axios';
import React, { useState, useEffect } from 'react';

// ==============================================================================
// ĐỊNH NGHĨA TYPES (Giữ nguyên)
// ==============================================================================

interface ProductDescriptionProps {
    productId: number;
}

interface Category {
    Name: string;
}

interface Variant {
    SKU: string;
    StockQuantity: number;
}

interface ProductData {
    Description: string;
    category: Category;
    variants: Variant[];
}

// ==============================================================================
// COMPONENT CON (Giữ nguyên)
// ==============================================================================
const DetailRow = ({ label, value }: { label: string; value: React.ReactNode }) => {
    if (!value) return null;
    return (
        <div className="flex py-3 border-b border-gray-200 text-sm">
            <dt className="w-1/3 text-gray-500">{label}</dt>
            <dd className="w-2/3 text-gray-800 font-medium">{value}</dd>
        </div>
    );
};

// ==============================================================================
// COMPONENT CHÍNH (Sửa đổi để dùng useEffect)
// ==============================================================================

export default function ProductDescription({ productId }: ProductDescriptionProps) {
    // 2. SỬ DỤNG STATE ĐỂ LƯU TRỮ DỮ LIỆU, TRẠNG THÁI LOADING VÀ LỖI
    const [product, setProduct] = useState<ProductData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Hàm này sẽ chạy ở phía CLIENT (trình duyệt)
        const fetchData = async () => {
            // Reset trạng thái trước mỗi lần gọi mới (quan trọng khi productId thay đổi)
            setIsLoading(true);
            setError(null);

            // URL này sẽ hoạt động vì nó được gọi từ trình duyệt của người dùng
            const apiUrl = `${API_URL}/productDetail/${productId}`;

            try {
                console.log(`[CLIENT-SIDE FETCH] Attempting to connect to: ${apiUrl}`);
                const response = await axios.get(apiUrl);
                setProduct(response.data);
            } catch (err) {
                console.error(`[CLIENT-SIDE FETCH] Failed for ID ${productId}. URL: ${apiUrl}. Error:`, err);
                setError('Không thể tải thông tin chi tiết sản phẩm. Vui lòng thử lại sau.');
            } finally {
                // Dù thành công hay thất bại, cũng dừng trạng thái loading
                setIsLoading(false);
            }
        };

        // Chỉ gọi API nếu có productId
        if (productId) {
            fetchData();
        }

        // Dependency array: useEffect sẽ chạy lại nếu `productId` thay đổi
    }, [productId]);

    // 4. RENDER DỰA TRÊN CÁC TRẠNG THÁI (LOADING, ERROR, SUCCESS)

    // Trạng thái Loading: Hiển thị giao diện tạm thời
    if (isLoading) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <p className="text-gray-500 animate-pulse">Đang tải chi tiết sản phẩm...</p>
            </div>
        );
    }

    // Trạng thái Lỗi: Hiển thị thông báo lỗi
    if (error) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-red-200">
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    // Trạng thái không tìm thấy sản phẩm (API chạy xong nhưng không có data)
    if (!product) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <p className="text-gray-500">Không tìm thấy thông tin sản phẩm.</p>
            </div>
        );
    }

    // Trạng thái Thành Công: Render dữ liệu
    const defaultVariant = product.variants && product.variants.length > 0 ? product.variants[0] : null;

    return (
        <div className="flex flex-col gap-8">
            {/* Chi tiết sản phẩm */}
            <div className="bg-white rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold p-4 bg-gray-100 rounded-t-md text-gray-800">
                    Chi tiết sản phẩm
                </h2>
                <dl className="p-4">
                    <DetailRow label="Danh mục" value={product.category?.Name} />
                    <DetailRow label="SKU" value={defaultVariant?.SKU} />
                    <DetailRow label="Số Lượng Còn" value={defaultVariant ? `${defaultVariant.StockQuantity} sản phẩm có sẵn` : 'N/A'} />
                </dl>
            </div>

            {/* Mô tả sản phẩm */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <h2 className="text-2xl font-bold text-gray-900 p-6 border-b border-gray-200">
                    Mô Tả Chi Tiết Sản Phẩm
                </h2>
                <div className="p-6">
                    <p className="text-base text-gray-700 leading-relaxed whitespace-pre-line">
                        {product.Description}
                    </p>
                </div>
            </div>
        </div>
    );
}