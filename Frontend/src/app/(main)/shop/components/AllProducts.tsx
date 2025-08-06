'use client';

import Link from 'next/link';
import { useState } from 'react';
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
    Rating?: number;
    ReviewCount?: number;
}

interface AllProductsProps {
    products: Product[];
}

export default function AllProducts({ products }: AllProductsProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 20;
    
    const totalPages = Math.ceil(products.length / productsPerPage);
    const startIndex = (currentPage - 1) * productsPerPage;
    const currentProducts = products.slice(startIndex, startIndex + productsPerPage);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        // Scroll to top of products section
        document.getElementById('all-products')?.scrollIntoView({ behavior: 'smooth' });
    };

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, index) => (
            <span
                key={index}
                className={`text-sm ${
                    index < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'
                }`}
            >
                ★
            </span>
        ));
    };

    if (products.length === 0) {
        return (
            <div id="all-products" className="bg-white rounded-lg shadow-sm p-8 text-center">
                <div className="text-gray-500">
                    <div className="text-4xl mb-4">📦</div>
                    <h3 className="text-lg font-medium mb-2">Không tìm thấy sản phẩm</h3>
                    <p className="text-sm">Thử thay đổi bộ lọc để xem thêm sản phẩm</p>
                </div>
            </div>
        );
    }

    return (
        <div id="all-products" className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                    Tất cả sản phẩm ({products.length})
                </h2>
                <div className="text-sm text-gray-500">
                    Trang {currentPage} / {totalPages}
                </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                {currentProducts.map((product) => (
                    <Link
                        key={product.ProductID}
                        href={`/productdetail/${product.ProductID}`}
                        className="group block bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-all duration-300 hover:-translate-y-1"
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

                            {/* Stock Status */}
                            {product.StockQuantity === 0 && (
                                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                    <span className="text-white text-sm font-medium">Hết hàng</span>
                                </div>
                            )}
                        </div>

                        {/* Product Info */}
                        <div className="p-3">
                            <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
                                {product.Name}
                            </h3>
                            
                            {/* Rating */}
                            {product.Rating && (
                                <div className="flex items-center gap-1 mb-2">
                                    {renderStars(product.Rating)}
                                    {product.ReviewCount && (
                                        <span className="text-xs text-gray-500">
                                            ({product.ReviewCount})
                                        </span>
                                    )}
                                </div>
                            )}
                            
                            {/* Price */}
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-orange-600 font-bold text-sm">
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

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Trước
                    </button>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
                        let pageNumber;
                        if (totalPages <= 5) {
                            pageNumber = index + 1;
                        } else if (currentPage <= 3) {
                            pageNumber = index + 1;
                        } else if (currentPage >= totalPages - 2) {
                            pageNumber = totalPages - 4 + index;
                        } else {
                            pageNumber = currentPage - 2 + index;
                        }
                        
                        return (
                            <button
                                key={pageNumber}
                                onClick={() => handlePageChange(pageNumber)}
                                className={`px-3 py-2 text-sm border rounded-lg ${
                                    currentPage === pageNumber
                                        ? 'bg-orange-500 text-white border-orange-500'
                                        : 'border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                {pageNumber}
                            </button>
                        );
                    })}
                    
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Sau
                    </button>
                </div>
            )}
        </div>
    );
}