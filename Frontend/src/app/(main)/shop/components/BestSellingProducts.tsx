'use client';

import Link from 'next/link';
import { getProductDisplayImage, formatCurrency } from '@/utils/imageHelpers';

interface Product {
    ProductID: number;
    Name: string;
    Price: number;
    CompareAtPrice?: number;
    ImageURL?: string;
    Discount?: number;
    StockQuantity: number;
    SoldCount?: number;
}

interface BestSellingProductsProps {
    products: Product[];
}

export default function BestSellingProducts({ products }: BestSellingProductsProps) {
    if (products.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Sản phẩm bán chạy</h2>
                <p className="text-gray-500 text-center py-8">Chưa có sản phẩm bán chạy</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-4 md:mb-6">
            <div className="flex items-center justify-between mb-4 md:mb-6">
                <h2 className="text-lg md:text-xl font-bold text-gray-900">Sản phẩm bán chạy</h2>
                <Link 
                    href="#all-products"
                    className="text-orange-600 hover:text-orange-700 text-xs md:text-sm font-medium"
                >
                    Xem tất cả
                </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                {products.slice(0, 10).map((product) => (
                    <Link
                        key={product.ProductID}
                        href={`/productdetail/${product.ProductID}`}
                        className="group block bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                    >
                        {/* Product Image */}
                        <div className="relative aspect-square overflow-hidden">
                            <img
                                src={getProductDisplayImage({ ImageURL: product.ImageURL })}
                                alt={product.Name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                loading="lazy"
                            />
                            
                            {/* Discount Badge */}
                            {product.Discount && product.Discount > 0 && (
                                <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                                    -{product.Discount}%
                                </div>
                            )}

                            {/* Best Seller Badge */}
                            <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded">
                                Bán chạy
                            </div>
                        </div>

                        {/* Product Info */}
                        <div className="p-2 md:p-3">
                            <h3 className="text-xs md:text-sm font-medium text-gray-900 mb-1 md:mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors leading-tight">
                                {product.Name}
                            </h3>
                            
                            {/* Price */}
                            <div className="space-y-0.5 md:space-y-1">
                                <div className="flex items-center gap-1 md:gap-2">
                                    <span className="text-orange-600 font-bold text-xs md:text-sm">
                                        {formatCurrency(product.Price)}
                                    </span>
                                    {product.CompareAtPrice && product.CompareAtPrice > product.Price && (
                                        <span className="text-gray-400 text-xs line-through">
                                            {formatCurrency(product.CompareAtPrice)}
                                        </span>
                                    )}
                                </div>
                                
                                {/* Sold Count */}
                                {product.SoldCount && (
                                    <div className="text-xs text-gray-500">
                                        Đã bán {product.SoldCount}
                                    </div>
                                )}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}