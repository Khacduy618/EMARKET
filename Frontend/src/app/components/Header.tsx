

'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ShoppingCart, ChevronDown, User, Menu, Store, LogOut, LayoutDashboard, Loader2 } from 'lucide-react';
import useSWR from 'swr';
import axios from 'axios';
import { getAuthToken } from '@/services/api'; 

// 1. IMPORT TỪ HỆ THỐNG AUTHCONTEXT (Lấy từ Code 1)
import { useAuth } from '@/context/AuthContext';

// 2. IMPORT CÁC TYPES VÀ HELPERS (Lấy từ cả hai phiên bản)
import { getActiveSeasonTheme, SeasonTheme } from '@/types/seasonalThemes';
import { toast } from 'react-toastify';
import { API_URL } from '@/lib/config';

// --- Fetcher cho SWR (Sử dụng phiên bản an toàn hơn từ Code 1) ---
const fetcher = (url: string) => axios.get(url, {
                    headers: {
                        'Accept': 'application/json',
                    },
                    withCredentials: true,
                }).then(res => {
    // API có thể trả về { success: true, data: [...] } hoặc data trực tiếp
    if (res.data && typeof res.data.data !== 'undefined') {
        return res.data.data;
    }
    return res.data;
});

// --- Định nghĩa kiểu dữ liệu (TypeScript) ---
interface SuggestionProduct { ProductID: number; Name: string; ImageURL: string | null; }
interface SuggestionShop { ShopID: number; ShopName: string; LogoURL: string | null; }
interface Suggestions { products: SuggestionProduct[]; shops: SuggestionShop[]; }


// --- Component con cho từng mục trong NavMenu (Lấy phiên bản cải tiến từ Code 2) ---
const CategoryMenuItem = ({ item, theme, isScrolled }: { item: any; theme: SeasonTheme; isScrolled: boolean }) => {
    if (!theme || !theme.itemClass) return null;

    const finalClass = isScrolled
        ? `${theme.itemClass.scrolled} ${theme.itemClass.scrolledHover}`
        : `${theme.itemClass.base}`;

    const searchQuery = encodeURIComponent(item.Name);

    return (
        // Dùng <Link> để điều hướng phía client, giúp trang không bị tải lại
        <Link
            href={`/search?q=${searchQuery}`}
            className={`flex items-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-200 cursor-pointer ${finalClass}`}
        >
            <span>{item.Name}</span>
        </Link>
    );
};


// ===================================================================================
// ===                           COMPONENT HEADER CHÍNH                            ===
// ===================================================================================
export default function Header() {
    // ==================  LOGIC AUTH TRUNG TÂM (Từ Code 1) ==================
    // Lấy thông tin người dùng và hàm logout trực tiếp từ AuthContext
    const { user, logout } = useAuth();
    
    // =======================================================================
    const [isCheckingShop, setIsCheckingShop] = useState(false); 
    // --- State cho Header (Gộp từ cả hai phiên bản) ---
    const [selectedLanguage, setSelectedLanguage] = useState('Tiếng Việt');
    const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false); // State cho dropdown user
    const router = useRouter();
    const userDropdownRef = useRef<HTMLDivElement>(null); // <-- THÊM DÒNG NÀY


    // --- State và logic cho thanh tìm kiếm (Lấy từ Code 2, đã sửa lỗi) ---
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState<Suggestions | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuggestBoxOpen, setIsSuggestBoxOpen] = useState(false);
    const searchContainerRef = useRef<HTMLDivElement>(null);

    // --- State và logic cho Nav Menu ---
    const { data: navData, error: navError } = useSWR(`${API_URL}/category`, fetcher);
    const [isScrolled, setIsScrolled] = useState(false);
    const [activeTheme, setActiveTheme] = useState<SeasonTheme | null>(null);

    // --- Các hàm và useEffect ---

    // Hàm fetch gợi ý tìm kiếm (Lấy từ Code 2, đã sửa lỗi key "Products")
    const fetchSuggestions = useCallback(async (query: string) => {
        if (query.length < 2) {
            setSuggestions(null);
            setIsSuggestBoxOpen(false);
            return;
        }
        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/search/suggest?q=${encodeURIComponent(query)}`);
            if (!response.ok) throw new Error('Lỗi mạng');
            const rawData = await response.json();
            
            // Chuẩn hóa dữ liệu trả về, đọc đúng key "Products" từ API
            const normalizedSuggestions: Suggestions = {
                products: rawData.Products || [], // Sửa lỗi quan trọng
                shops: rawData.shops || [],
            };
            
            setSuggestions(normalizedSuggestions);
            const hasResults = normalizedSuggestions.products.length > 0 || normalizedSuggestions.shops.length > 0;
            setIsSuggestBoxOpen(hasResults);

        } catch (error) {
            console.error("Lỗi khi tải gợi ý:", error);
            setSuggestions(null);
            setIsSuggestBoxOpen(false);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const handler = setTimeout(() => fetchSuggestions(searchQuery), 300);
        return () => clearTimeout(handler);
    }, [searchQuery, fetchSuggestions]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const targetNode = event.target as Node;

            // KIỂM TRA MỚI: Chỉ đóng khi click ra ngoài CẢ hai khu vực
            if (
                searchContainerRef.current && !searchContainerRef.current.contains(targetNode) &&
                userDropdownRef.current && !userDropdownRef.current.contains(targetNode)
            ) {
                setIsSuggestBoxOpen(false);
                setIsUserDropdownOpen(false);
            }
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

    // useMemo cho danh mục (Lấy phiên bản an toàn hơn từ Code 1)
    const flattenedCategories = useMemo(() => {
        if (!navData || !Array.isArray(navData)) {
            return [];
        }
        return navData.flatMap((parent: any) => [parent, ...(parent.children || [])]);
    }, [navData]);

     const handleSellerChannelClick = async (event: React.MouseEvent) => {
        event.preventDefault(); // Ngăn chặn hành động mặc định của thẻ <a>
        
        // 1. Kiểm tra nếu người dùng chưa đăng nhập
        if (!user) {
            toast.warn("Vui lòng đăng nhập để truy cập Kênh Người Bán.", {
                onClick: () => router.push('/signin'),
                style: { cursor: 'pointer' }
            });
            return;
        }

        // 2. Nếu đã đăng nhập, gọi API để kiểm tra trạng thái shop
        setIsCheckingShop(true);
        try {
            const response = await fetch(`${API_URL}/user/shop-status`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    
                },
            });
            
            if (!response.ok) {
                // Xử lý các lỗi khác ngoài 401 (đã được middleware xử lý)
                throw new Error('Không thể kiểm tra thông tin shop.');
            }
            
            const data = await response.json();

            // 3. Điều hướng dựa trên kết quả từ API
            if (data.status === 'has_shop') {
                router.push('/seller'); // Nếu có shop, vào trang quản lý
            } else if (data.status === 'no_shop') {
                router.push('/shop/register'); // Nếu chưa có, vào trang đăng ký
            }

        } catch (error: any) {
            console.error("Lỗi khi kiểm tra trạng thái shop:", error);
            toast.error(error.message || "Đã có lỗi xảy ra, vui lòng thử lại.");
        } finally {
            setIsCheckingShop(false);
        }
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            setIsSuggestBoxOpen(false);
            router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    // LOẠI BỎ: useEffect và handleLogout dùng localStorage đã được thay thế bằng useAuth


    // ===================================================================================
    // ===                                   PHẦN JSX                                  ===
    // ===================================================================================
    return (
        <div className="sticky top-0 z-30 bg-white shadow-sm">
            {/* PHẦN 1: HEADER CHÍNH (Giữ layout từ Code 2) */}
            <header className="bg-gradient-to-b from-orange-500 to-orange-600 text-white py-2">
                <div className="container mx-auto px-4">
                    <div className="hidden md:flex justify-end items-center text-xs space-x-4 mb-2">
                        <a 
                            href="/seller" // href vẫn giữ để người dùng có thể chuột phải mở tab mới
                            onClick={handleSellerChannelClick} 
                            className="hover:text-gray-200 flex items-center gap-1"
                        >
                            {isCheckingShop ? <Loader2 className="animate-spin" size={14} /> : <Store size={14} />}
                            <span>Kênh Người Bán</span>
                        </a>
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
                        
                        {/* === LOGIC AUTH ĐÃ ĐƯỢC MERGE TẠI ĐÂY === */}
                        <div className="flex items-center">
                            {user ? (
                                // Nếu có user từ AuthContext, hiển thị dropdown chi tiết (Lấy từ Code 1)
                                <div className="relative" ref={userDropdownRef}>
                                    <button onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)} className="flex items-center space-x-2 p-1 rounded hover:bg-white/20">
                                        <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center overflow-hidden">
                                            {/* Tùy chọn: hiển thị avatar nếu có */}
                                            {user.Avatar ? (
                                                <img src={user.Avatar} alt="avatar" className="w-full h-full object-cover" />
                                            ) : (
                                                <User className="h-4 w-4 text-orange-500" />
                                            )}
                                        </div>
                                        <span className="text-sm">{user.FullName}</span>
                                    </button>
                                    {isUserDropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-50 border text-gray-800">
                                            <div className="px-4 py-3 border-b">
                                                <p className="text-sm font-semibold">Xin chào,</p>
                                                <p className="text-sm font-bold truncate">{user.FullName}</p>
                                            </div>
                                            
                                            {/* === SỬA ĐỔI CHÍNH Ở ĐÂY === */}
                                            <button 
                                                onClick={() => {
                                                    setIsUserDropdownOpen(false);
                                                    router.push('/account/profile');
                                                }}
                                                className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            >
                                                <LayoutDashboard className="mr-3 h-4 w-4" /> Tài khoản của tôi
                                            </button>
                                            {/* === KẾT THÚC SỬA ĐỔI === */}

                                            <div className="py-1 border-t mt-1">
                                                <button 
                                                    onClick={() => { 
                                                        setIsUserDropdownOpen(false);
                                                        logout(); 
                                                    }} 
                                                    className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium"
                                                >
                                                    <LogOut className="mr-3 h-4 w-4" /> Đăng xuất
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                // Nếu không có user, hiển thị link Đăng ký/Đăng nhập (Giữ từ Code 2)
                                <div className="hidden lg:flex items-center space-x-2 text-sm">
                                    <Link href="/signup" className="hover:text-gray-200">Đăng ký</Link>
                                    <div className="h-4 border-l border-orange-400"></div>
                                    <Link href="/signin" className="hover:text-gray-200">Đăng nhập</Link>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 md:gap-4">
                        <button className="md:hidden p-2 -ml-2" onClick={() => setIsMobileMenuOpen(true)}><Menu size={24} /></button>
                        {/* Giữ logo bằng ảnh từ Code 2 */}
                        <Link href="/" className="text-2xl font-bold flex-shrink-0">
                            {/* <img src="/images/logo.png" alt="logo" className="h-10"/>     */}
                             <span className="hidden sm:inline">Khắc Duy</span><span className="sm:hidden text-3xl font-extrabold">KD</span>
                        </Link>
                        {/* Thanh tìm kiếm và gợi ý (Giữ từ Code 2 với các cải tiến) */}
                        <div ref={searchContainerRef} className="flex-grow w-full order-3 md:order-2 mt-2 md:mt-0 relative">
                            <form onSubmit={handleSearchSubmit} className="flex w-full bg-white rounded-sm overflow-hidden">
                                <input type="text" placeholder="Tìm kiếm sản phẩm, thương hiệu..." className="w-full px-3 py-2 text-sm text-gray-800 focus:outline-none" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onFocus={() => { if (suggestions && searchQuery.length > 1) setIsSuggestBoxOpen(true); }} />
                                <button type="submit" className="bg-orange-500 hover:bg-orange-600 px-4 transition-colors"><Search size={20} className="text-white" /></button>
                            </form>
                            {isSuggestBoxOpen && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-sm shadow-lg max-h-80 overflow-y-auto">
                                    {isLoading ? (<div className="p-3 text-center text-sm text-gray-500">Đang tìm...</div>) : (suggestions && (suggestions.products.length > 0 || suggestions.shops.length > 0) ? (<ul className="text-gray-800 text-sm divide-y divide-gray-100">{suggestions.shops.map(shop => (<li key={`shop-${shop.ShopID}`}><Link href={`/shop/${shop.ShopID}`} className="flex items-center gap-3 p-2.5 hover:bg-gray-100" onClick={() => setIsSuggestBoxOpen(false)}><Store className="w-5 h-5 text-gray-400 flex-shrink-0" /><span className='font-semibold'>Tìm shop "{shop.ShopName}"</span></Link></li>))}{suggestions.products.map(product => (<li key={`product-${product.ProductID}`}><Link href={`/productdetail/${product.ProductID}`} className="flex items-center gap-3 p-2.5 hover:bg-gray-100" onClick={() => setIsSuggestBoxOpen(false)}>{product.ImageURL ? (<img src={product.ImageURL} alt={product.Name} className="w-10 h-10 object-cover rounded-sm flex-shrink-0 border border-gray-100" />) : (<div className="w-10 h-10 bg-gray-100 flex items-center justify-center rounded-sm flex-shrink-0"><Search className="w-5 h-5 text-gray-400" /></div>)}<span className='line-clamp-1 font-medium'>{product.Name}</span></Link></li>))}</ul>) : (<div className="p-3 text-center text-sm text-gray-500">Không tìm thấy gợi ý nào.</div>))}
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

            {/* PHẦN 2: NAV MENU (Giữ nguyên cấu trúc) */}
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

            {/* PHẦN 3: MENU TRƯỢT RA CHO MOBILE (Giữ nguyên) */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 bg-black/40 z-[60] md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
                    <div className="fixed top-0 left-0 w-64 h-full bg-white text-gray-800 shadow-lg p-4" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-lg font-bold mb-4">Menu</h2>
                        <nav><ul><li className="mb-2">
                                    {/* CẬP NHẬT CẢ Ở ĐÂY */}
                                    <a href="/seller" onClick={handleSellerChannelClick} className="flex items-center gap-2 py-2 hover:text-orange-500">
                                        {isCheckingShop ? <Loader2 className="animate-spin" size={16} /> : <Store size={16} />}
                                        <span>Kênh Người Bán</span>
                                    </a>
                                </li><li className="mb-2"><Link href="#" className="block py-2 hover:text-orange-500">Tải ứng dụng</Link></li><li className="mb-2"><Link href="#" className="block py-2 hover:text-orange-500">Thông báo</Link></li><li className="mb-2"><Link href="#" className="block py-2 hover:text-orange-500">Trợ giúp</Link></li></ul></nav>
                    </div>
                </div>
            )}
        </div>
    );
}