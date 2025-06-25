'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Search, ShoppingCart, ChevronDown, User, Menu, Store } from 'lucide-react';
import { api } from '@/services/api';
import UserDropdown from './UserDropdown';

interface User {
    id: number;
    name: string;
    avatar?: string;
}
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import axios from 'axios';

// Giả sử bạn có file này, nếu không hãy xóa hoặc tạo nó
import { getActiveSeasonTheme, SeasonTheme } from '../../types/seasonalThemes';

// --- Fetcher cho SWR ---
const fetcher = (url: string) => axios.get(url).then(res => res.data);

// --- Định nghĩa kiểu dữ liệu (TypeScript) ---
interface SuggestionProduct {
    ProductID: number;
    Name: string;
    ImageURL: string | null;
}
interface SuggestionShop {
    ShopID: number;
    ShopName: string;
    LogoURL: string | null;
}
interface Suggestions {
    products: SuggestionProduct[];
    shops: SuggestionShop[];
}

// --- Component con cho từng mục trong NavMenu ---
const CategoryMenuItem = ({ item, theme, isScrolled }: { item: any; theme: SeasonTheme; isScrolled: boolean }) => {
    if (!theme || !theme.itemClass) return null; // Guard clause
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
    // --- State cho Header chính ---
    const [selectedLanguage, setSelectedLanguage] = useState('Tiếng Việt');
    const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const router = useRouter();

    const [user, setUser] = useState<User | null>(null);
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

    // --- State và logic cho thanh tìm kiếm ---
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState<Suggestions | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuggestBoxOpen, setIsSuggestBoxOpen] = useState(false);
    const searchContainerRef = useRef<HTMLDivElement>(null);

    // --- State và logic cho Nav Menu ---
    const { data: navData, error: navError } = useSWR('http://localhost:8001/api/category', fetcher);
    const [isScrolled, setIsScrolled] = useState(false);
    const [activeTheme, setActiveTheme] = useState<SeasonTheme | null>(null);

    // --- Các hàm và useEffect ---

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
        const handleScroll = () => setIsScrolled(window.scrollY > 10); // Đặt ngưỡng scroll thấp hơn
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const flattenedCategories = useMemo(() => {
        if (!navData) return [];
        return navData.flatMap((parent: any) => [parent, ...(parent.children || [])]);
    }, [navData]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            setIsSuggestBoxOpen(false);
            router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };
    useEffect(() => {
        // Check if authToken exists in localStorage
        const authToken = localStorage.getItem('authToken');
        setIsLoggedIn(!!authToken); // Set isLoggedIn based on token presence

        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const parsedUser: User = JSON.parse(storedUser);
                setUser(parsedUser);
            } catch (error) {
                console.error("Error parsing user from localStorage:", error);
                localStorage.removeItem('user'); // Remove invalid user data
            }
        }
    }, []); // Empty dependency array means this effect runs once on mount

    const handleLogout = async () => {
        try {
            // Call the backend logout endpoint
            await api.post('/logout', {}); // Assuming logout is a POST request to /api/logout

            // Remove the token from localStorage
            if(localStorage.getItem('authToken')){localStorage.removeItem('authToken');}
            if(localStorage.getItem('user')){localStorage.removeItem('user');}
            if(localStorage.getItem('checkoutData')){localStorage.removeItem('checkoutData');}

            // Update state and redirect to login page
            setIsLoggedIn(false);
            router.push('/login');
        } catch (error) {
            console.error("Logout failed:", error);
            // Even if API call fails, attempt to remove token and redirect
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            localStorage.removeItem('checkoutData');
            setIsLoggedIn(false);
            router.push('/login');
        }
    };

    // ===================================================================================
    // ===                                   PHẦN JSX                                  ===
    // ===================================================================================
    return (
        // *** SỬA ĐỔI CHÍNH Ở ĐÂY ***
        // Thẻ div bao ngoài cùng này sẽ chịu trách nhiệm dính lại
        <div className="sticky top-0 z-30 bg-white shadow-sm">
            {/* PHẦN 1: HEADER CHÍNH (logo, tìm kiếm, icons) */}
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
                        <div className="flex items-center">
                            {isLoggedIn ? (
                                <>
                                    {/* Hiển thị Avatar và tên user.  Chưa có thông tin user, sẽ để placeholder*/}
                                    <UserDropdown handleLogout={handleLogout} />
                                </>
                            ) : (
                                <div className="hidden lg:flex items-center space-x-2 text-sm">
                                    <Link href="/signup" className="hover:text-gray-200">Đăng ký</Link>
                                    <div className="h-4 border-l border-orange-400"></div>
                                    <Link href="/login" className="hover:text-gray-200">Đăng nhập</Link>
                                </div>
                            )}
                        </div>
                    </div>
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

            {/* PHẦN 2: NAV MENU (thanh danh mục) - Phần này KHÔNG cần sticky nữa */}
            {activeTheme && (
                // Bỏ class `md:sticky` và `top-0` ở đây
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
