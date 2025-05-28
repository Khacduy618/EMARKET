'use client';
import React from 'react';

export default function NewArrivalSection() {
    return (
        <section className="max-w-[1500px] mx-auto px-4 py-16 bg-gray-50">
            {/* Header */}
            <div className="text-center mb-12">
                <div className="flex items-center justify-center gap-2 mb-3">
                    <div className="w-2 h-5 bg-[#2a3890] rounded-sm"></div>
                    <h2 className="text-base font-semibold text-[#2a3890]">SẢN PHẨM MỚI VỀ</h2>
                </div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">HÀNG MỚI VỀ</h1>
                <div className="w-20 h-1 bg-[#2a3890] mx-auto"></div>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                {/* Main Featured Product */}
                <div className="lg:col-span-2 relative group overflow-hidden rounded-xl shadow-lg bg-white">
                    <div className="relative h-[400px]">
                        <img
                            src="/images/ps5.png"
                            alt="PS5"
                            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                            <div className="text-white">
                                <span className="bg-[#f53d2d] text-xs font-bold px-2 py-1 rounded-sm mb-2 inline-block">
                                    MỚI NHẤT
                                </span>
                                <h3 className="text-2xl font-bold mb-2">PlayStation 5</h3>
                                <p className="text-sm mb-4">
                                    Phiên bản đen trắng PS5 chính hãng Sony
                                </p>
                                <button className="bg-[#2a3890] hover:bg-[#1a2770] text-white px-6 py-2 rounded-md font-medium transition-colors">
                                    XEM NGAY
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Secondary Products */}
                <div className="grid grid-cols-2 gap-6 lg:col-span-2">
                    {/* Women's Collection */}
                    <div className="relative group overflow-hidden rounded-xl shadow-lg bg-white">
                        <div className="relative h-[190px]">
                            <img
                                src="/images/women.png"
                                alt="Women"
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                                <div className="text-white">
                                    <h3 className="text-lg font-bold mb-1">THỜI TRANG NỮ</h3>
                                    <p className="text-xs mb-2 line-clamp-1">
                                        Bộ sưu tập mới nhất cho phái đẹp
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="p-4">
                            <button className="w-full bg-[#2a3890] hover:bg-[#1a2770] text-white py-2 text-sm rounded-md font-medium transition-colors">
                                MUA NGAY
                            </button>
                        </div>
                    </div>

                    {/* Speakers */}
                    <div className="relative group overflow-hidden rounded-xl shadow-lg bg-white">
                        <div className="relative h-[190px]">
                            <img
                                src="/images/speakers.png"
                                alt="Speakers"
                                className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                                <div className="text-white">
                                    <h3 className="text-lg font-bold mb-1">LOA BLUETOOTH</h3>
                                    <p className="text-xs mb-2 line-clamp-1">
                                        Loa không dây cao cấp
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="p-4">
                            <button className="w-full bg-[#2a3890] hover:bg-[#1a2770] text-white py-2 text-sm rounded-md font-medium transition-colors">
                                MUA NGAY
                            </button>
                        </div>
                    </div>

                    {/* Perfume */}
                    <div className="relative group overflow-hidden rounded-xl shadow-lg bg-white col-span-2">
                        <div className="relative h-[190px]">
                            <img
                                src="/images/perfume.png"
                                alt="Perfume"
                                className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute top-2 right-2 bg-[#f53d2d] text-white text-xs font-bold px-2 py-1 rounded-sm">
                                GIẢM 20%
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                                <div className="text-white">
                                    <h3 className="text-lg font-bold mb-1">NƯỚC HOA GUCCI</h3>
                                    <p className="text-xs mb-2 line-clamp-1">
                                        GUCCI INTENSE OUD EDP chính hãng
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="p-4">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-[#f53d2d] font-bold text-lg">1.250.000₫</span>
                                <span className="text-gray-400 text-sm line-through">1.560.000₫</span>
                            </div>
                            <button className="w-full bg-[#2a3890] hover:bg-[#1a2770] text-white py-2 text-sm rounded-md font-medium transition-colors">
                                THÊM VÀO GIỎ
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Services Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 bg-white p-8 rounded-xl shadow-lg">
                <div className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="bg-[#2a3890] text-white p-3 rounded-full">
                        {/* Truck icon placeholder */}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                        </svg>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-800 mb-1">GIAO HÀNG SIÊU TỐC</h4>
                        <p className="text-sm text-gray-600">Miễn phí vận chuyển cho đơn từ 1 triệu</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="bg-[#2a3890] text-white p-3 rounded-full">
                        {/* Headphones icon placeholder */}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-800 mb-1">HỖ TRỢ 24/7</h4>
                        <p className="text-sm text-gray-600">Đội ngũ CSKH luôn sẵn sàng hỗ trợ</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="bg-[#2a3890] text-white p-3 rounded-full">
                        {/* Refresh icon placeholder */}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-800 mb-1">ĐỔI TRẢ DỄ DÀNG</h4>
                        <p className="text-sm text-gray-600">Đổi trả trong vòng 30 ngày nếu không hài lòng</p>
                    </div>
                </div>
            </div>
        </section>
    );
}