// app/components/ProductCard.tsx
import React from 'react';
import Image from 'next/image';

// Định nghĩa interface cho prop 'product'
interface Product {
    id: number;
    name: string;
    description?: string;
    price: number;
    stock?: number;
    image?: string;
    // Thêm các trường khác của sản phẩm nếu có
}

interface ProductCardProps {
    product: Product;
}

function ProductCard({ product }: ProductCardProps) {
    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Phần ảnh (tùy chọn) */}
            {product.image && (
                <div className="relative h-48 w-full">
                    <Image src={product.image} alt={product.name} layout="fill" objectFit="cover" />
                </div>
            )}

            <div className="p-4">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">{product.name}</h2>
                {product.description && (
                    <p className="text-gray-600 text-sm mb-3">{product.description}</p>
                )}
                <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-indigo-600">${product.price.toFixed(2)}</span>
                    <button className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                        Thêm vào giỏ hàng
                    </button>
                </div>
                {product.stock !== undefined && (
                    <p className="text-gray-500 text-xs mt-1">Còn lại: {product.stock}</p>
                )}
            </div>
        </div>
    );
}

export default ProductCard;