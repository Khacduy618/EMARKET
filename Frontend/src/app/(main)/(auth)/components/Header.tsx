// app/components/Header.tsx
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { User, LogIn, LogOut, LayoutDashboard, ShoppingCart, Search } from 'lucide-react';

export default function Header() {
    const { user, logout } = useAuth();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    return (
        <header className="bg-white shadow-md sticky top-0 z-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">

                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <Link href="/" className="text-2xl font-bold text-indigo-600">
                            EMARKET
                        </Link>
                    </div>

                    {/* Search Bar (Example) */}
                    <div className="hidden md:flex flex-1 mx-8 lg:mx-16">
                        <div className="relative w-full">
                            <input
                                type="search"
                                placeholder="Tìm kiếm sản phẩm..."
                                className="w-full pl-10 pr-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Auth & Cart */}
                    <div className="flex items-center space-x-4">

                        <Link href="/cart" className="p-2 rounded-full hover:bg-gray-100">
                            <ShoppingCart className="h-6 w-6 text-gray-600" />
                        </Link>

                        {/* Điều kiện hiển thị dựa trên trạng thái user */}
                        {user ? (
                            // ---- NẾU ĐÃ ĐĂNG NHẬP ----
                            <div className="relative">
                                <button
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100"
                                >
                                    <User className="h-6 w-6 text-gray-600" />
                                    <span className="hidden lg:inline font-medium text-gray-700">{user.FullName}</span>
                                </button>

                                {/* Dropdown Menu */}
                                {isDropdownOpen && (
                                    <div
                                        className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50"
                                        onMouseLeave={() => setIsDropdownOpen(false)} // Tự đóng khi di chuột ra
                                    >
                                        <Link
                                            href="/account/profile"
                                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            onClick={() => setIsDropdownOpen(false)} // Đóng khi click
                                        >
                                            <LayoutDashboard className="mr-3 h-4 w-4" />
                                            Tài khoản của tôi
                                        </Link>
                                        <button
                                            onClick={() => {
                                                logout(); // Gọi hàm logout từ context
                                                setIsDropdownOpen(false);
                                            }}
                                            className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            <LogOut className="mr-3 h-4 w-4" />
                                            Đăng xuất
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            // ---- NẾU CHƯA ĐĂNG NHẬP ----
                            <div className="hidden md:flex items-center space-x-2">
                                <Link
                                    href="/login"
                                    className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md text-base font-medium text-indigo-600 bg-indigo-100 hover:bg-indigo-200"
                                >
                                    <LogIn className="mr-2 h-5 w-5" />
                                    Đăng nhập
                                </Link>
                                <Link
                                    href="/register"
                                    className="px-4 py-2 border border-transparent rounded-md text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                                >
                                    Đăng ký
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
