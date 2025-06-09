// 
// ProductsCart.tsx
'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Interface khớp với JSON từ API /best-selling
interface Product {
    ProductID: number;
    ProductName: string;          // Từ JSON
    ProductDescription?: string;  // Từ JSON (tùy chọn)
    ProductLevelDiscount: number; // Từ JSON
    Price: number;                // Giá biến thể thấp nhất từ JSON
    CompareAtPrice?: number | null; // Giá gốc trước giảm giá từ JSON
    SKU?: string;                 // Từ JSON (tùy chọn)
    StockQuantity?: number;       // Từ JSON (tùy chọn)
    ImageURL?: string | null;     // Từ JSON
    FinalPrice: number;           // Giá cuối cùng sau khi áp dụng ProductLevelDiscount (đã tính ở backend hoặc client)
}

export default function ProductsCart() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null); // Thêm state cho lỗi

    useEffect(() => {
        setLoading(true);
        setError(null); // Reset lỗi mỗi khi fetch
        axios.get<Product[]>('http://localhost:8001/api/products/best-selling') // Sử dụng đúng API endpoint và kiểu dữ liệu trả về
            .then(res => {
                // API trả về trực tiếp mảng sản phẩm
                // Backend đã tính FinalPrice, chúng ta chỉ cần đảm bảo nó là số
                const fetchedProducts = res.data.map(p => ({
                    ...p,
                    Price: Number(p.Price),
                    FinalPrice: Number(p.FinalPrice), // Đảm bảo FinalPrice là số
                    ProductLevelDiscount: Number(p.ProductLevelDiscount),
                    CompareAtPrice: p.CompareAtPrice ? Number(p.CompareAtPrice) : null,
                }));
                setProducts(fetchedProducts);
            })
            .catch(err => {
                console.error('API error:', err);
                let errorMessage = "Không thể tải danh sách sản phẩm nổi bật.";
                if (axios.isAxiosError(err) && err.response) {
                    errorMessage += ` (Lỗi: ${err.response.status} ${err.response.statusText || ''})`;
                } else if (err instanceof Error) {
                    errorMessage += ` (${err.message})`;
                }
                setError(errorMessage);
                setProducts([]);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const addToCart = (productId: number) => {
        console.log(`Added product ${productId} to cart`);
        // Implement your cart logic here
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    if (loading) {
        return (
            <section className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-[500px] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto"></div>
                    <p className="mt-4 text-sky-600 font-semibold">Đang tải sản phẩm nổi bật...</p>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-[500px] flex flex-col items-center justify-center text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <p className="text-red-600 font-semibold text-xl mb-2">Lỗi tải dữ liệu</p>
                <p className="text-slate-700">{error}</p>
                <button
                    onClick={() => { /* Logic để thử lại, ví dụ gọi lại useEffect */ setLoading(true); setError(null); /* ... trigger fetch ... */ }}
                    className="mt-6 bg-sky-500 text-white py-2 px-6 rounded-lg hover:bg-sky-600 transition-colors"
                >
                    Thử lại
                </button>
            </section>
        );
    }


    return (
        <section className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-slate-50">
            <div className="text-center mb-12">
                <div className="flex items-center justify-center gap-2 mb-3">
                    <div className="w-2 h-5 bg-sky-500 rounded-sm"></div>
                    <h2 className="text-base font-semibold text-sky-600 uppercase tracking-wider">SẢN PHẨM NỔI BẬT</h2>
                </div>
                <h1 className="text-3xl font-bold text-slate-800 mb-2">KHÁM PHÁ SẢN PHẨM</h1>
                <div className="w-20 h-1 bg-sky-500 mx-auto"></div>
            </div>

            {products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 sm:gap-6">
                    {products.map(product => {
                        // Dữ liệu từ API /best-selling đã cung cấp Price (giá biến thể)
                        // và FinalPrice (giá sau ProductLevelDiscount, nếu có)
                        // ProductLevelDiscount là % giảm giá ở cấp sản phẩm
                        const displayPrice = product.FinalPrice; // Giá cuối cùng để hiển thị
                        const originalPriceToShow = product.CompareAtPrice && product.CompareAtPrice > displayPrice
                            ? product.CompareAtPrice
                            : (product.Price > displayPrice ? product.Price : null);


                        return (
                            <div
                                key={product.ProductID}
                                className="bg-white border border-slate-200/80 rounded-xl p-3 sm:p-4 flex flex-col shadow-lg hover:shadow-xl transition-all duration-300 group transform hover:-translate-y-1"
                            >
                                <div className="relative w-full aspect-square mb-3 overflow-hidden rounded-md">
                                    {product.ProductLevelDiscount > 0 && ( // Chỉ hiển thị nếu có giảm giá ở cấp sản phẩm
                                        <div className="absolute top-2 left-2 bg-gradient-to-r from-red-500 to-orange-500 text-white text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full shadow-md z-10">
                                            -{product.ProductLevelDiscount.toFixed(0)}%
                                        </div>
                                    )}
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={
                                            product.ImageURL
                                                ? product.ImageURL.startsWith('http')
                                                    ? product.ImageURL
                                                    : `http://localhost:8001${product.ImageURL.startsWith('/') ? '' : '/'}${product.ImageURL}`
                                                : 'https://via.placeholder.com/300x300/F0F0F0/AAAAAA?text=No+Image'
                                        }
                                        alt={product.ProductName}
                                        className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                                        loading="lazy" // Lazy loading cho các ảnh không ở màn hình đầu
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x300/F0F0F0/AAAAAA?text=Image+Error';
                                        }}
                                    />
                                </div>

                                <div className="flex flex-col flex-grow mt-1">
                                    <h3
                                        className="text-sm font-semibold text-slate-800 mb-1.5 h-10 leading-tight group-hover:text-sky-600 transition-colors"
                                        style={{
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                        }}
                                        title={product.ProductName}
                                    >
                                        {product.ProductName}
                                    </h3>

                                    <div className="mt-auto pt-1">
                                        <div className="mb-2 min-h-[24px]"> {/* Đảm bảo chiều cao tối thiểu cho giá */}
                                            <span className="text-sky-600 font-bold text-base sm:text-lg">
                                                {formatCurrency(displayPrice)}
                                            </span>
                                            {originalPriceToShow && (
                                                <span className="text-slate-400 text-xs sm:text-sm line-through ml-2">
                                                    {formatCurrency(originalPriceToShow)}
                                                </span>
                                            )}
                                        </div>

                                        {/* Hiện không có Rating, SoldCount, ViewCount từ API này */}
                                        {/* <div className="flex items-center justify-between text-xs text-slate-500 mb-3"> ... </div> */}

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
                !loading && ( // Chỉ hiển thị "Không tìm thấy" nếu không loading và không có lỗi
                    <div className="text-center py-16">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-slate-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                        <p className="text-slate-500 text-xl font-semibold">Không tìm thấy sản phẩm nào.</p>
                        <p className="text-slate-400 mt-1">Vui lòng thử lại hoặc kiểm tra các danh mục khác.</p>
                    </div>
                )
            )}

            {products.length > 0 && (
                <div className="flex justify-center mt-12 sm:mt-16">
                    <button className="bg-white text-sky-600 border-2 border-sky-600 px-8 py-3 rounded-lg hover:bg-sky-600 hover:text-white transition-all duration-300 font-bold text-sm sm:text-base shadow-sm hover:shadow-md">
                        XEM TẤT CẢ SẢN PHẨM
                    </button>
                </div>
            )}
        </section>
    );
}