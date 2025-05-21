'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Product {
    ProductID: number;
    Name: string;
    Price: number;
    discount: number;
    AverageRating: number;
    SoldCount: number;
    ViewCount: number;
    ImageURL?: string;
}

export default function ProductsCart() {
    const [products, setProducts] = useState<Product[]>([]);

    useEffect(() => {
        axios.get('http://localhost:8001/api/Products/')
            .then(res => setProducts(res.data))
            .catch(err => console.error('API error:', err));
    }, []);

    const addToCart = (productId: number) => {
        console.log(`Added product ${productId} to cart`);
        // You can implement your cart logic here
    };

    return (
        <section className="max-w-[1400px] mx-auto p-8">
            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-5 bg-red-500 rounded-sm"></div>
                <h2 className="text-base font-semibold text-red-500">Our Products</h2>
            </div>
            <h1 className="text-3xl font-bold mb-6">Explore Our Products</h1>

            {/* Product Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                {products.map(product => {
                    const price = Number(product.Price);
                    const finalPrice = product.discount > 0
                        ? price - (price * product.discount) / 100
                        : price;

                    return (
                        <div
                            key={product.ProductID}
                            className="border rounded-xl p-4 flex flex-col items-center shadow hover:shadow-lg transition relative group"
                        >
                            {/* Product Image */}
                            <div className="relative w-full h-40 mb-4 overflow-hidden">
                                <img
                                    src={
                                        product.ImageURL?.startsWith('http')
                                            ? product.ImageURL
                                            : `http://localhost:8001${product.ImageURL}`
                                    }
                                    alt={product.Name}
                                    className="w-full h-full object-contain"
                                />
                                {/* Add to Cart Button - Shows on Hover */}
                                <button
                                    onClick={() => addToCart(product.ProductID)}
                                    className="absolute bottom-0 left-0 right-0 bg-red-500 text-white py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-full group-hover:translate-y-0"
                                >
                                    Thêm vào giỏ hàng
                                </button>
                            </div>

                            <h3 className="text-sm font-semibold text-center mb-1">{product.Name}</h3>

                            {/* Price display */}
                            <div className="mb-1">
                                <span className="text-red-500 font-bold mr-2">
                                    ₫{finalPrice.toLocaleString('vi-VN')}
                                </span>
                                {product.discount > 0 && (
                                    <span className="line-through text-gray-400 text-sm">
                                        ₫{price.toLocaleString('vi-VN')}
                                    </span>
                                )}
                            </div>

                            {/* Rating */}
                            <div className="flex items-center text-yellow-500 text-sm mb-1">
                                {'★'.repeat(Math.round(product.AverageRating || 0))}
                                <span className="text-gray-500 ml-1">
                                    ({product.ViewCount} lượt xem)
                                </span>
                            </div>

                            <p className="text-xs text-gray-400">Đã bán: {product.SoldCount}</p>
                        </div>
                    );
                })}
            </div>

            {/* View All Button */}
            <div className="flex justify-center mt-10">
                <button className="bg-red-500 text-white px-6 py-3 rounded hover:bg-red-600 transition">
                    View All Products
                </button>
            </div>
        </section>
    );
}