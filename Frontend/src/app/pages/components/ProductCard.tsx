'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Product {
    ProductID: number;
    Name: string; // API sends 'Name'
    Price: number; // API sends 'Price'
    discount: number;
    AverageRating: number;
    SoldCount: number;
    ViewCount: number;
    ImageURL?: string;
}

export default function ProductsCart() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true); // Added loading state

    useEffect(() => {
        setLoading(true);
        axios.get('http://localhost:8001/api/Products/') // Assuming this endpoint returns all products
            .then(res => {
                // API might return more, so slice to get only the first 10
                setProducts(res.data.slice(0, 10));
            })
            .catch(err => {
                console.error('API error:', err);
                setProducts([]); // Set to empty array on error
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const addToCart = (productId: number) => {
        console.log(`Added product ${productId} to cart`);
        // Implement your cart logic here
    };

    // Helper to format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    if (loading) {
        return (
            <section className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-[500px] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto"></div>
                    <p className="mt-4 text-sky-600 font-semibold">Đang tải sản phẩm...</p>
                </div>
            </section>
        );
    }

    return (
        <section className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-slate-50">
            {/* Header */}
            <div className="text-center mb-12">
                <div className="flex items-center justify-center gap-2 mb-3">
                    <div className="w-2 h-5 bg-sky-500 rounded-sm"></div> {/* Blue accent */}
                    <h2 className="text-base font-semibold text-sky-600">SẢN PHẨM NỔI BẬT</h2> {/* Blue accent */}
                </div>
                <h1 className="text-3xl font-bold text-slate-800 mb-2">KHÁM PHÁ SẢN PHẨM</h1>
                <div className="w-20 h-1 bg-sky-500 mx-auto"></div> {/* Blue accent */}
            </div>

            {/* Product Grid */}
            {products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 sm:gap-6"> {/* Adjusted grid for potentially wider cards */}
                    {products.map(product => {
                        const originalPrice = Number(product.Price);
                        const discountPercent = Number(product.discount);
                        const finalPrice = discountPercent > 0
                            ? originalPrice - (originalPrice * discountPercent) / 100
                            : originalPrice;

                        return (
                            <div
                                key={product.ProductID}
                                className="bg-white border border-slate-200/80 rounded-xl p-3 sm:p-4 flex flex-col shadow-lg hover:shadow-xl transition-all duration-300 group transform hover:-translate-y-1"
                            >
                                {/* Product Image and Discount Badge Container */}
                                <div className="relative w-full aspect-square mb-3 overflow-hidden rounded-md">
                                    {discountPercent > 0 && (
                                        <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] sm:text-xs font-bold px-2 py-1 rounded-full shadow-md z-10">
                                            -{discountPercent.toFixed(0)}%
                                        </div>
                                    )}
                                    <img
                                        src={
                                            product.ImageURL
                                                ? product.ImageURL.startsWith('http')
                                                    ? product.ImageURL
                                                    : `http://localhost:8001${product.ImageURL}`
                                                : 'https://via.placeholder.com/300x300/F0F0F0/AAAAAA?text=No+Image'
                                        }
                                        alt={product.Name}
                                        className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x300/F0F0F0/AAAAAA?text=Error';
                                        }}
                                    />
                                </div>

                                {/* Product Info */}
                                <div className="flex flex-col flex-grow mt-1">
                                    {/* Product Name - Always 2 lines */}
                                    <h3
                                        className="text-sm font-semibold text-slate-800 mb-1.5 h-10 leading-tight group-hover:text-sky-600 transition-colors"
                                        style={{
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                        }}
                                        title={product.Name}
                                    >
                                        {product.Name}
                                    </h3>

                                    {/* Price display */}
                                    <div className="mt-auto pt-1"> {/* Pushes content below to bottom */}
                                        <div className="mb-2">
                                            <span className="text-sky-600 font-bold text-base sm:text-lg">
                                                {formatCurrency(finalPrice)}
                                            </span>
                                            {discountPercent > 0 && (
                                                <span className="text-slate-400 text-xs sm:text-sm line-through ml-2">
                                                    {formatCurrency(originalPrice)}
                                                </span>
                                            )}
                                        </div>

                                        {/* Rating and Sold Count */}
                                        <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                                            <div className="flex items-center">
                                                <div className="flex text-yellow-400">
                                                    {'★'.repeat(Math.min(5, Math.max(0, Math.round(product.AverageRating || 0))))}
                                                    {'☆'.repeat(Math.max(0, 5 - Math.min(5, Math.max(0, Math.round(product.AverageRating || 0)))))}
                                                </div>
                                                <span className="ml-1">({product.ViewCount || 0})</span>
                                            </div>
                                            <span className="whitespace-nowrap">Đã bán: {product.SoldCount || 0}</span>
                                        </div>


                                        {/* Add to Cart Button */}
                                        <button
                                            onClick={() => addToCart(product.ProductID)}
                                            className="w-full bg-sky-500 text-white py-2.5 px-4 rounded-lg hover:bg-sky-600 transition-colors duration-300 font-semibold text-sm shadow-md hover:shadow-lg transform group-hover:scale-105"
                                        >
                                            Thêm vào giỏ
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-10">
                    <p className="text-slate-500 text-lg">Không tìm thấy sản phẩm nào.</p>
                </div>
            )}


            {/* View All Button */}
            {products.length > 0 && ( // Only show if there are products (even if more than 10 are available from API)
                <div className="flex justify-center mt-12 sm:mt-16">
                    <button className="bg-white text-sky-600 border-2 border-sky-600 px-8 py-3 rounded-lg hover:bg-sky-600 hover:text-white transition-all duration-300 font-bold text-sm sm:text-base shadow-sm hover:shadow-md">
                        XEM TẤT CẢ SẢN PHẨM
                    </button>
                </div>
            )}
        </section>
    );
}