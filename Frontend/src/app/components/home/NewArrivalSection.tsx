"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';

// Định nghĩa các interface để khớp với cấu trúc dữ liệu JSON từ API
interface Variant {
    id: number;
    sku: string;
    price: number;
    formatted_price: string;
    compare_at_price: number | null;
    formatted_compare_at_price: string | null;
    stock_quantity: number;
    image_url: string;
    is_active: number;
    discount_percentage: number | null;
}

interface Product {
    ProductID: number;
    name: string;
    slug: string;
    description: string;
    full_description: string;
    image_url: string;
    tags: string[];
    variant: Variant;
}

const NewArrivalsSection: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchNewArrivals = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await axios.get<Product[]>('http://localhost:8001/api/new-arrivals');
                setProducts(response.data);
            } catch (err) {
                if (axios.isAxiosError(err)) {
                    console.error("Lỗi Axios khi fetch sản phẩm mới:", err);
                    if (err.response) {
                        setError(`Lỗi từ server: ${err.response.status} - ${err.response.data?.message || err.message}`);
                    } else if (err.request) {
                        setError("Không nhận được phản hồi từ server. Vui lòng kiểm tra kết nối mạng hoặc server.");
                    } else {
                        setError(`Lỗi khi thiết lập yêu cầu: ${err.message}`);
                    }
                } else {
                    console.error("Lỗi không xác định khi fetch sản phẩm mới:", err);
                    setError("Đã xảy ra lỗi không xác định.");
                }
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchNewArrivals();
    }, []);

    if (loading) {
        return (
            <section className="py-12 bg-gray-50 rounded-lg shadow-md">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8">Sản phẩm mới</h2>
                    <p className="text-gray-700">Đang tải sản phẩm mới... Vui lòng đợi.</p>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mt-4"></div>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="py-12 bg-red-50 rounded-lg shadow-md">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold text-red-700 mb-8">Lỗi tải sản phẩm</h2>
                    <p className="text-red-600">{error}</p>
                    <p className="text-red-500 mt-2">Vui lòng thử lại sau hoặc kiểm tra kết nối mạng.</p>
                </div>
            </section>
        );
    }

    // Lấy 3 sản phẩm đầu tiên để hiển thị theo layout mới
    const mainProduct = products[0];
    const secondaryProducts = products.slice(1, 3); // Lấy 2 sản phẩm tiếp theo

    if (!mainProduct && secondaryProducts.length === 0) {
        return (
            <section className="py-12 bg-gray-50">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold text-gray-900">Sản phẩm mới</h2>
                    <p className="text-gray-700 mt-4">Hiện chưa có sản phẩm mới nào để hiển thị.</p>
                </div>
            </section>
        );
    }

    return (
        <section className="py-12 bg-white">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">New Arrival</h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Main Product / Left Banner */}
                    {mainProduct && (
                        <div className="relative col-span-1 h-96 lg:h-[400px] rounded-lg overflow-hidden group">
                            <img
                                src={mainProduct.image_url || 'https://placehold.co/800x400/000/fff?text=Main+Product'}
                                alt={mainProduct.name}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                onError={(e) => { e.currentTarget.src = 'https://placehold.co/800x400/000/fff?text=Main+Product'; }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6 rounded-lg">
                                <h3 className="text-3xl font-bold text-white mb-2">{mainProduct.name}</h3>
                                <p className="text-gray-200 text-sm mb-4 line-clamp-2">{mainProduct.description}</p>
                                <Link
                                    href={`/products/${mainProduct.slug}`}
                                    className="inline-block bg-blue-500 w-[130px] text-white font-medium px-6 py-2 rounded-full hover:bg-gray-200 hover:text-black transition-colors duration-300"
                                >
                                    Shop Now
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* Right Side Grid */}
                    <div className="grid grid-cols-1 gap-6">
                        {secondaryProducts.length > 0 ? (
                            secondaryProducts.map((product, index) => (
                                <div key={product.ProductID} className="relative h-64 rounded-lg overflow-hidden group">
                                    <div className="relative w-[700px] h-[350px] overflow-hidden group">
                                        <img
                                            src={product.image_url || `https://placehold.co/700x350/000/fff?text=Product+${index + 1}`}
                                            alt={product.name}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            onError={(e) => { e.currentTarget.src = `https://placehold.co/700x350/000/fff?text=Product+${index + 1}`; }}
                                        />
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4 rounded-lg">
                                        <h3 className="text-xl font-bold text-white mb-1">{product.name}</h3>
                                        <p className="text-gray-300 text-xs mb-3 line-clamp-1">{product.description}</p>
                                        <Link
                                            href={`/products/${product.slug}`}
                                            className="inline-block  bg-blue-500 w-[100px] text-white text-sm font-medium px-4 py-1.5 rounded-full hover:bg-gray-200 hover:text-black transition-colors duration-300"
                                        >
                                            Shop Now
                                        </Link>
                                    </div>
                                </div>
                            ))
                        ) : (
                            // Placeholder if only main product exists but no secondary
                            mainProduct && (
                                <div className="col-span-full text-center text-gray-600">
                                    Không có thêm sản phẩm nào để hiển thị ở đây.
                                </div>
                            )
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default NewArrivalsSection;
