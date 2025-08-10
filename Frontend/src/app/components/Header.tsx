// app/components/Header.tsx (hoặc bất kỳ đường dẫn nào bạn đặt)

'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ShoppingCart, ChevronDown, User, Menu, Store, LogOut, LayoutDashboard, LogIn } from 'lucide-react';
import useSWR from 'swr';
import axios from 'axios';

// 1. IMPORT TỪ HỆ THỐNG AUTHCONTEXT
import { useAuth } from '@/context/AuthContext';
// Đổi tên để tránh xung đột với interface User cục bộ, mặc dù chúng ta sẽ không dùng nó nữa
import { User as AuthUserType } from '@/types';

// Giả sử bạn có file này, nếu không hãy xóa hoặc tạo nó
import { getActiveSeasonTheme, SeasonTheme } from '@/types/seasonalThemes';

// --- Fetcher cho SWR ---
// const fetcher = (url: string) => axios.get(url).then(res => res.data);
const fetcher = (url: string) => axios.get(url).then(res => {
    // Giả sử API của bạn trả về { success: true, data: [...] }

    // Chúng ta chỉ trả về phần 'data' cho SWR
    if (res.data && res.data.data) {
        return res.data.data;
    }
    // Nếu API trả về mảng trực tiếp hoặc cấu trúc khác, trả về nguyên gốc
    return res.data;
});

// --- Định nghĩa kiểu dữ liệu (TypeScript) ---
interface SuggestionProduct { ProductID: number; Name: string; ImageURL: string | null; }
interface SuggestionShop { ShopID: number; ShopName: string; LogoURL: string | null; }
interface Suggestions { products: SuggestionProduct[]; shops: SuggestionShop[]; }


// --- Component con cho từng mục trong NavMenu ---
const CategoryMenuItem = ({ item, theme, isScrolled }: { item: any; theme: SeasonTheme; isScrolled: boolean }) => {
    if (!theme || !theme.itemClass) return null;
    const finalClass = isScrolled
        ? `${theme.itemClass.scrolled} ${theme.itemClass.scrolledHover}`
        : `${theme.itemClass.base}`;
    return (
        <a href={`#${item.Slug}`} className={`flex items-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-200 cursor-pointer ${finalClass}`}>
            <span>{item.Name}</span>
        </a>
    );
};


// ===================================================================================
// ===                           COMPONENT HEADER CHÍNH                            ===
// ===================================================================================
export default function Header() {
    // ==================  SỬA ĐỔI CHÍNH Ở ĐÂY ==================
    // Lấy thông tin người dùng và hàm logout trực tiếp từ AuthContext
    const { user, logout } = useAuth();
    // ========================================================

    // --- Các state khác giữ nguyên ---
    const [selectedLanguage, setSelectedLanguage] = useState('Tiếng Việt');
    const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const router = useRouter();

    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState<Suggestions | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuggestBoxOpen, setIsSuggestBoxOpen] = useState(false);
    const searchContainerRef = useRef<HTMLDivElement>(null);

    const { data: navData, error: navError } = useSWR('http://localhost:8001/api/category', fetcher);
    const [isScrolled, setIsScrolled] = useState(false);
    const [activeTheme, setActiveTheme] = useState<SeasonTheme | null>(null);

    // --- Các hàm và useEffect không thay đổi ---
    const fetchSuggestions = useCallback(async (query: string) => {
        if (query.length < 2) { setSuggestions(null); setIsSuggestBoxOpen(false); return; }
        setIsLoading(true);
        try {
            const response = await fetch(`http://localhost:8001/api/search/suggest?q=${encodeURIComponent(query)}`);
            if (!response.ok) throw new Error('Lỗi mạng');
            const data: Suggestions = await response.json();
            setSuggestions(data);
            setIsSuggestBoxOpen(!!data);
        } catch (error) { console.error("Lỗi khi tải gợi ý:", error); }
        finally { setIsLoading(false); }
    }, []);

    useEffect(() => {
        const handler = setTimeout(() => fetchSuggestions(searchQuery), 300);
        return () => clearTimeout(handler);
    }, [searchQuery, fetchSuggestions]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) setIsSuggestBoxOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        try { setActiveTheme(getActiveSeasonTheme()); } catch (e) { console.error(e) }
        const handleScroll = () => setIsScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const flattenedCategories = useMemo(() => {
        if (!navData || !Array.isArray(navData)) { // <-- THÊM KIỂM TRA
            // Nếu navData không tồn tại hoặc không phải là mảng, trả về mảng rỗng
            return [];
        }
        return navData.flatMap((parent: any) => [parent, ...(parent.children || [])]);
    }, [navData]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            setIsSuggestBoxOpen(false);
            router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    // ---- XÓA TOÀN BỘ LOGIC `useEffect` VÀ `handleLogout` DÙNG localStorage ----

    return (
        <div className="sticky top-0 z-20 bg-white shadow-sm">
            {/* PHẦN 1: HEADER CHÍNH */}
            <header className="bg-gradient-to-b from-orange-500 to-orange-600 text-white py-2">
                <div className="container mx-auto px-4">
                    <div className="hidden md:flex justify-end items-center text-xs space-x-4 mb-2">
                        <a href="#" className="hover:text-gray-200">Kênh Người Bán</a>
                        <div className="relative">
                            <button className="flex items-center gap-1 hover:text-gray-200" onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}>
                                {selectedLanguage} <ChevronDown size={14} />
                            </button>
                            {isLanguageDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-32 bg-white text-gray-800 rounded-sm shadow-lg z-10">
                                    <ul className="py-1"><li className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer" onClick={() => { setSelectedLanguage('Tiếng Việt'); setIsLanguageDropdownOpen(false); }}>Tiếng Việt</li><li className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer" onClick={() => { setSelectedLanguage('English'); setIsLanguageDropdownOpen(false); }}>English</li></ul>
                                </div>
                            )}
                        </div>

                        {/* =================================================== */}
                        {/* ===         LOGIC AUTH ĐƯỢC THAY THẾ Ở ĐÂY        === */}
                        {/* =================================================== */}
                        <div className="flex items-center">
                            {user ? (
                                // Nếu có user từ AuthContext
                                <div className="relative">
                                    <button onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)} className="flex items-center space-x-2 p-1 rounded hover:bg-white/20">
                                        <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                                            <User className="h-4 w-4 text-orange-500" />
                                        </div>
                                        <span className="text-sm">{user.FullName}</span>
                                    </button>
                                    {isUserDropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-50 border text-gray-800">
                                            <div className="px-4 py-3 border-b">
                                                <p className="text-sm font-semibold">Xin chào,</p>
                                                <p className="text-sm font-bold truncate">{user.FullName}</p>
                                            </div>
                                            <Link href="/account/profile" onClick={() => setIsUserDropdownOpen(false)} className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                                <LayoutDashboard className="mr-3 h-4 w-4" /> Tài khoản của tôi
                                            </Link>
                                            <div className="py-1 border-t mt-1">
                                                <button onClick={logout} className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium">
                                                    <LogOut className="mr-3 h-4 w-4" /> Đăng xuất
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                // Nếu không có user
                                <div className="hidden lg:flex items-center space-x-2 text-sm">
                                    <Link href="/register" className="hover:text-gray-200">Đăng ký</Link>
                                    <div className="h-4 border-l border-orange-400"></div>
                                    <Link href="/login" className="hover:text-gray-200">Đăng nhập</Link>
                                </div>
                            )}
                        </div>
                    </div>
                    {/* Phần JSX còn lại không thay đổi */}
                    <div className="flex items-center justify-between gap-2 md:gap-4">
                        <button className="md:hidden p-2 -ml-2" onClick={() => setIsMobileMenuOpen(true)}><Menu size={24} /></button>
                        <Link href="/" className="text-2xl font-bold flex-shrink-0"><span className="hidden sm:inline">Khắc Duy</span><span className="sm:hidden text-3xl font-extrabold">KD</span></Link>

                        <div ref={searchContainerRef} className="flex-grow w-full order-3 md:order-2 mt-2 md:mt-0 relative">
                            <form onSubmit={handleSearchSubmit} className="flex w-full bg-white rounded-sm overflow-hidden">
                                <input type="text" placeholder="Tìm kiếm sản phẩm, thương hiệu..." className="w-full px-3 py-2 text-sm text-gray-800 focus:outline-none" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onFocus={() => { if (suggestions && searchQuery.length > 1) setIsSuggestBoxOpen(true); }} />
                                <button type="submit" className="bg-orange-500 hover:bg-orange-600 px-4 transition-colors"><Search size={20} className="text-white" /></button>
                            </form>
                            {isSuggestBoxOpen && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-sm shadow-lg max-h-80 overflow-y-auto">
                                    {isLoading ? (<div className="p-3 text-center text-sm text-gray-500">Đang tìm...</div>) : (suggestions && (suggestions.products.length > 0 || suggestions.shops.length > 0) ? (<ul className="text-gray-800 text-sm divide-y divide-gray-100">{suggestions.shops.map(shop => (<li key={`shop-${shop.ShopID}`}><Link href={`/shop/${shop.ShopID}`} className="flex items-center gap-3 p-2.5 hover:bg-gray-100" onClick={() => setIsSuggestBoxOpen(false)}><Store className="w-5 h-5 text-gray-400 flex-shrink-0" /><span className='font-semibold'>Tìm shop "{shop.ShopName}"</span></Link></li>))}{suggestions.products.map(product => (<li key={`product-${product.ProductID}`}><Link href={`/products/${product.ProductID}`} className="flex items-center gap-3 p-2.5 hover:bg-gray-100" onClick={() => setIsSuggestBoxOpen(false)}><Search className="w-5 h-5 text-gray-400 flex-shrink-0" /><span className='line-clamp-1'>{product.Name}</span></Link></li>))}</ul>) : (<div className="p-3 text-center text-sm text-gray-500">Không tìm thấy gợi ý nào.</div>))}
                                </div>
                            )}
                        </div>


                        <div className="flex items-center space-x-2 md:space-x-4 order-2 md:order-3">
                            <Link href="/cart" className="relative p-1 md:p-2 hover:opacity-80">
                                <ShoppingCart size={26} />
                                <span className="absolute top-0 right-0 bg-white text-orange-500 rounded-full text-xs w-5 h-5 flex items-center justify-center font-bold">0</span>
                            </Link>

                        </div>
                    </div>
                </div>
            </header>

            {/* PHẦN 2: NAV MENU */}
            {activeTheme && (
                <div className={`h-[30px] transition-colors duration-300 ${activeTheme.navClass} flex items-center`}>
                    <div className="container mx-auto px-4 w-full h-full flex items-center">
                        <nav className="flex w-full h-full items-center">
                            <style jsx>{`.hide-scrollbar::-webkit-scrollbar { display: none; } .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
                            <div className="flex space-x-4 items-center mx-auto hide-scrollbar overflow-x-auto">
                                {navError ? <div className="text-sm text-red-500">Lỗi tải danh mục.</div> : !navData ? <div className="text-sm text-gray-500">Đang tải...</div> : flattenedCategories.map((item: any) => (
                                    <CategoryMenuItem key={item.CategoryID} item={item} theme={activeTheme} isScrolled={isScrolled} />
                                ))}
                            </div>
                        </nav>
                    </div>
                </div>
            )}

            {/* PHẦN 3: MENU TRƯỢT RA CHO MOBILE */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 bg-black/40 z-[60] md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
                    <div className="fixed top-0 left-0 w-64 h-full bg-white text-gray-800 shadow-lg p-4" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-lg font-bold mb-4">Menu</h2>
                        <nav><ul><li className="mb-2"><Link href="#" className="block py-2 hover:text-orange-500">Kênh Người Bán</Link></li><li className="mb-2"><Link href="#" className="block py-2 hover:text-orange-500">Tải ứng dụng</Link></li><li className="mb-2"><Link href="#" className="block py-2 hover:text-orange-500">Thông báo</Link></li><li className="mb-2"><Link href="#" className="block py-2 hover:text-orange-500">Trợ giúp</Link></li></ul></nav>
                    </div>
                </div>
            )}
        </div>
    );
}