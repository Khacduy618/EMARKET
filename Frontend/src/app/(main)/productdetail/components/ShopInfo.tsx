// // app/components/ShopInfo.tsx
'use client';

import { getStorageImageUrl } from '@/services/api';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
export interface ShopStats {
    rating_count: string;
    product_count: number;
    follower_count: string;
    join_duration: string;
    response_rate: string;
    response_time: string;
    online_status: string;
}

// 2. Cập nhật interface Shop để bao gồm 'stats'
export interface Shop {
    ShopID: number;
    UserID: number;
    ShopName: string;
    Description: string;
    LogoURL: string;
    // ... các trường khác của shop
    UpdatedAt: string;
    stats: ShopStats; // <--- THÊM DÒNG NÀY
}

// Các interface khác (Product, Variant, Image...) giữ nguyên
export interface Product {
    // ...
    shop: Shop; // Đảm bảo trường này dùng interface Shop đã cập nhật
    // ...
}
// Component bây giờ nhận prop 'shop' với kiểu dữ liệu chính xác
export default function ShopInfo({ shop }: { shop: Shop }) {
    // Không cần dữ liệu giả nữa, tất cả đã có trong prop `shop`
    const { stats } = shop;

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm flex items-center space-x-6 mb-6">
            {/* Phần bên trái: Avatar, Tên shop, Nút bấm */}
            <div className="flex items-center space-x-4">
                <div className="relative">
                    <img
                        src={getStorageImageUrl(shop.LogoURL)} // Dùng dữ liệu thật
                        alt={`Logo của ${shop.ShopName}`}
                        width={80}
                        height={80}
                        className="rounded-full border object-cover"
                    />
                    <span className="absolute -bottom-1 -right-1 bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-md">
                        Yêu Thích
                    </span>
                </div>
                <div className="flex flex-col space-y-2">
                    <Link href={`/shop/${shop.ShopID}`} ><h2 className="text-lg font-bold text-gray-800">{shop.ShopName}</h2></Link>
                    {/* Dùng dữ liệu thật từ API */}
                    <p className="text-sm text-gray-500">{stats.online_status}</p>
                    <div className="flex space-x-2">
                        {/* <button className="px-4 py-2 text-sm border border-orange-500 text-orange-500 rounded-md hover:bg-orange-50 flex items-center space-x-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" /></svg>
                            <span>Chat Ngay</span>
                        </button> */}
                        <button className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-100 flex items-center space-x-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                            <Link href={`/shop/${shop.ShopID}`} ><span>Xem Shop</span></Link>
                        </button>
                    </div>
                </div>
            </div>

            <div className="border-l border-gray-200 h-16"></div>

            {/* Phần bên phải: Các chỉ số - Dùng dữ liệu thật từ `stats` */}
            <div className="grid grid-cols-3 gap-x-12 gap-y-3 text-sm flex-grow">
                <div className="space-x-4">
                    <span className="text-gray-500">Đánh Giá</span>
                    <span className="text-orange-500 font-semibold">{stats.rating_count}</span>
                </div>
                <div className="space-x-4">
                    <span className="text-gray-500">Tỉ Lệ Phản Hồi</span>
                    <span className="text-orange-500 font-semibold">{stats.response_rate}</span>
                </div>
                {/* <div className="space-x-4">
                    <span className="text-gray-500">Tham Gia</span>
                    <span className="text-orange-500 font-semibold">{stats.join_duration}</span>
                </div> */}
                <div className="space-x-4">
                    <span className="text-gray-500">Sản Phẩm</span>
                    <span className="text-orange-500 font-semibold">{stats.product_count}</span>
                </div>
                <div className="space-x-4">
                    <span className="text-gray-500">Thời Gian Phản Hồi</span>
                    <span className="text-orange-500 font-semibold">{stats.response_time}</span>
                </div>
                <div className="space-x-4">
                    <span className="text-gray-500">Người Theo Dõi</span>
                    <span className="text-orange-500 font-semibold">{stats.follower_count}</span>
                </div>
            </div>
        </div>
    );
}