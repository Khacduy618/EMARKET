// 'use client';

// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import Image from 'next/image';
// import { FaHeart, FaStar } from 'react-icons/fa';
// import { MdArrowBackIos, MdArrowForwardIos } from 'react-icons/md';

// interface Product {
//     name: string;
//     price: string;        // price API trả về là string
//     discount: number;
//     AverageRating: number;
//     final_price: number;
// }

// export default function FlashSales() {
//     const [products, setProducts] = useState<Product[]>([]);
//     const [loading, setLoading] = useState<boolean>(true);

//     useEffect(() => {
//         async function fetchProducts() {
//             try {
//                 const response = await axios.get<Product[]>('http://localhost:8001/api/ProductFinalPrice');
//                 setProducts(response.data);
//             } catch (error) {
//                 console.error('Error fetching products:', error);
//             } finally {
//                 setLoading(false);
//             }
//         }
//         fetchProducts();
//     }, []);

//     if (loading) {
//         return <div className="py-10 px-4 md:px-16">Loading...</div>;
//     }

//     return (
//         <section className="py-10 px-4 md:px-16 bg-white">
//             {/* Header */}
//             <div className="flex justify-between items-center mb-6">
//                 <div>
//                     <p className="text-red-500 text-sm font-semibold">Today&apos;s</p>
//                     <h2 className="text-3xl font-bold">Flash Sales</h2>
//                 </div>
//                 <div className="flex items-center space-x-8">
//                     {/* Countdown */}
//                     {['Days', 'Hours', 'Minutes', 'Seconds'].map((label, i) => (
//                         <div key={i} className="text-center">
//                             <div className="text-2xl font-bold">03</div>
//                             <div className="text-xs text-gray-500">{label}</div>
//                         </div>
//                     ))}
//                     {/* Arrows */}
//                     <div className="flex items-center space-x-2">
//                         <button className="p-2 border rounded-full text-gray-600 hover:text-black">
//                             <MdArrowBackIos size={18} />
//                         </button>
//                         <button className="p-2 border rounded-full text-gray-600 hover:text-black">
//                             <MdArrowForwardIos size={18} />
//                         </button>
//                     </div>
//                 </div>
//             </div>

//             {/* Products */}
//             <div className="grid grid-cols-2 mt-6 sm:grid-cols-3 md:grid-cols-5 gap-5 h-74">
//                 {products.map((product, index) => (
//                     <div
//                         key={`${product.name}-${index}`} // Tạo key dựa trên tên và index tránh trùng
//                         className="relative border border-gray-200 rounded-md p-3 hover:shadow-md transition group"
//                     >
//                         <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
//                             -{product.discount}%
//                         </span>
//                         <button className="absolute top-2 right-2 text-gray-400 hover:text-red-500">
//                             <FaHeart size={14} />
//                         </button>
//                         <div className="h-28 flex items-center justify-center">
//                             <Image
//                                 src="/images/iphone-16-pro-titan-trang.png" // ảnh mặc định
//                                 alt={product.name}
//                                 width={100}
//                                 height={100}
//                                 className="h-full w-full object-contain"
//                             />
//                         </div>
//                         <h3 className="mt-4 text-sm font-semibold text-gray-900">{product.name}</h3>
//                         <div className="mt-1 text-sm">
//                             <span className="text-red-600 font-bold">${(product.final_price / 1000000).toFixed(2)}M</span>{' '}
//                             <span className="line-through text-gray-400">${(parseFloat(product.price) / 1000000).toFixed(2)}M</span>
//                         </div>
//                         <div className="text-xs flex items-center text-yellow-500 mt-1 space-x-1">
//                             {[...Array(5)].map((_, i) => {
//                                 const filled = i < Math.round(product.AverageRating);
//                                 return (
//                                     <FaStar key={i} size={12} className={filled ? 'text-yellow-500' : 'text-gray-300'} />
//                                 );
//                             })}
//                             <span className="text-gray-500 ml-1">({product.AverageRating.toFixed(1)})</span>
//                         </div>
//                         <button className="absolute bottom-3 left-3 right-3 bg-black text-white text-sm py-1 rounded opacity-0 group-hover:opacity-100 transition">
//                             Add To Cart
//                         </button>
//                     </div>
//                 ))}
//             </div>

//             {/* View All */}
//             <div className="text-center mt-10">
//                 <button className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600 transition">
//                     View All Products
//                 </button>
//             </div>
//         </section>
//     );
// }
'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Image from 'next/image';
import { FaHeart, FaStar } from 'react-icons/fa';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';

interface Product {
    name: string;
    price: string;
    discount: number;
    AverageRating: number;
    final_price: number;
}

export default function FlashSales() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        async function fetchProducts() {
            try {
                const response = await axios.get<Product[]>('http://localhost:8001/api/ProductFinalPrice');
                setProducts(response.data);
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchProducts();
    }, []);

    if (loading) {
        return <div className="py-10 px-4 md:px-16">Loading...</div>;
    }

    return (
        <section className="py-10 px-4 md:px-16 bg-white">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <p className="text-red-500 text-sm font-semibold">Today&apos;s</p>
                    <h2 className="text-3xl font-bold">Flash Sales</h2>
                </div>
            </div>

            <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                spaceBetween={20}
                slidesPerView={1}
                navigation
                pagination={{ el: '.custom-pagination', clickable: true }}
                autoplay={{ delay: 3000, disableOnInteraction: false }}
                breakpoints={{
                    640: { slidesPerView: 2 },
                    768: { slidesPerView: 3 },
                    1024: { slidesPerView: 5 },
                }}
            >
                {products.map((product, index) => (
                    <SwiperSlide key={`${product.name}-${index}`}>
                        <div className="relative border h-72 border-gray-200 rounded-md p-3 hover:shadow-md transition group bg-white">
                            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                                -{product.discount}%
                            </span>
                            <button className="absolute top-2 right-2 text-gray-400 hover:text-red-500">
                                <FaHeart size={14} />
                            </button>
                            <div className="h-28 flex items-center justify-center">
                                <Image
                                    src="/images/iphone-16-pro-titan-trang.png"
                                    alt={product.name}
                                    width={100}
                                    height={100}
                                    className="h-full w-full object-contain"
                                />
                            </div>
                            <h3 className="mt-4 text-sm font-semibold text-gray-900">{product.name}</h3>
                            <div className="mt-1 text-sm">
                                <span className="text-red-600 font-bold">${(product.final_price / 1000000).toFixed(2)}M</span>{' '}
                                <span className="line-through text-gray-400">${(parseFloat(product.price) / 1000000).toFixed(2)}M</span>
                            </div>
                            <div className="text-xs flex items-center text-yellow-500 mt-1 space-x-1">
                                {[...Array(5)].map((_, i) => {
                                    const filled = i < Math.round(product.AverageRating);
                                    return (
                                        <FaStar key={i} size={12} className={filled ? 'text-yellow-500' : 'text-gray-300'} />
                                    );
                                })}
                                <span className="text-gray-500 ml-1">({product.AverageRating.toFixed(1)})</span>
                            </div>
                            <button className="absolute bottom-3 left-3 right-3 bg-black text-white text-sm py-1 rounded opacity-0 group-hover:opacity-100 transition">
                                Add To Cart
                            </button>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>

            <div className="text-center mt-10">
                <button className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600 transition">
                    View All Products
                </button>
            </div>
        </section>
    );
}
