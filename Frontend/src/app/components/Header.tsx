

'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ShoppingCart, ChevronDown, User, Menu, Store, LogOut, LayoutDashboard, Loader2 } from 'lucide-react';
import useSWR from 'swr';
import axios from 'axios';
import { usePathname } from 'next/navigation';

// 1. IMPORT TỪ HỆ THỐNG AUTHCONTEXT (Lấy từ Code 1)
import { useAuth } from '@/context/AuthContext';


// 2. IMPORT CÁC TYPES VÀ HELPERS (Lấy từ cả hai phiên bản)
import { getActiveSeasonTheme, SeasonTheme } from '@/types/seasonalThemes';
import { toast } from 'react-toastify';
import { API_URL } from '@/lib/config';
import { getStorageImageUrl } from '@/services/api';
import { useCart } from '../../context/CartContext';

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
    const pathname = usePathname();
    const { cartItemCount } = useCart(); 

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

    const handleLogoutClick = () => {
        setIsUserDropdownOpen(false);
        if (pathname === "/account/security") {
            toast.warn("Đăng xuất không khả dụng ở trang bảo mật.");
        } else {
            logout();
        }
    };


    // LOẠI BỎ: useEffect và handleLogout dùng localStorage đã được thay thế bằng useAuth


    // ===================================================================================
    // ===                                   PHẦN JSX                                  ===
    // ===================================================================================
    return (
         <div className="sticky top-0 z-30 bg-white shadow-sm">
      {/* PHẦN 1: HEADER CHÍNH */}
      <header className="text-white">
        <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 flex justify-center text-xs py-2">
          <div className="container hidden md:flex justify-end items-center space-x-6">
            <a
              href="/seller"
              onClick={handleSellerChannelClick}
              className="hover:text-orange-100 flex items-center gap-2 transition-all duration-200 hover:scale-105"
            >
              {isCheckingShop ? <Loader2 className="animate-spin" size={14} /> : <Store size={14} />}
              <span className="font-medium">Kênh Người Bán</span>
            </a>
            <div className="relative flex items-center">
              <button
                className="flex items-center gap-2 hover:text-orange-100 transition-all duration-200 hover:scale-105 font-medium"
                onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
              >
                {selectedLanguage} <ChevronDown size={14} />
              </button>
              {isLanguageDropdownOpen && (
                <div className="absolute right-0 mt-2 w-36 bg-white text-gray-800 rounded-lg shadow-xl z-10 border border-gray-100 overflow-hidden">
                  <ul className="py-1">
                    <li
                      className="px-4 py-3 text-sm hover:bg-orange-50 cursor-pointer transition-colors font-medium"
                      onClick={() => {
                        setSelectedLanguage("Tiếng Việt")
                        setIsLanguageDropdownOpen(false)
                      }}
                    >
                      Tiếng Việt
                    </li>
                    <li
                      className="px-4 py-3 text-sm hover:bg-orange-50 cursor-pointer transition-colors font-medium"
                      onClick={() => {
                        setSelectedLanguage("English")
                        setIsLanguageDropdownOpen(false)
                      }}
                    >
                      English
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* === LOGIC AUTH ĐÃ ĐƯỢC MERGE TẠI ĐÂY === */}
            <div className="flex items-center">
              {user ? (
                <div className="relative" ref={userDropdownRef}>
                  <button
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className="flex items-center space-x-2 px-3 py-1 rounded-full hover:bg-white/20 transition-all duration-200 hover:scale-105"
                  >
                    <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center overflow-hidden border-2 border-white/30">
                      {user.Avatar ? (
                        <img
                          src={getStorageImageUrl(user.Avatar) || "/placeholder.svg"}
                          alt="avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="h-4 w-4 text-orange-500" />
                      )}
                    </div>
                    <span className="text-sm font-medium">{user.FullName}</span>
                  </button>
                  {isUserDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-60 bg-white rounded-lg shadow-xl py-2 z-50 border border-gray-100 text-gray-800">
                      <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-red-50">
                        <p className="text-sm font-medium text-gray-600">Xin chào,</p>
                        <p className="text-sm font-bold truncate text-gray-800">{user.FullName}</p>
                      </div>

                      <button
                        onClick={() => {
                          setIsUserDropdownOpen(false)
                          router.push("/account/profile")
                        }}
                        className="flex items-center w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-orange-50 transition-colors"
                      >
                        <LayoutDashboard className="mr-3 h-4 w-4 text-orange-500" />
                        <span className="font-medium">Tài khoản của tôi</span>
                      </button>

                      <div className="py-1 border-t mt-1">
                        <button
                          onClick={handleLogoutClick}
                          className="w-full text-left flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 font-medium transition-colors"
                        >
                          <LogOut className="mr-3 h-4 w-4" /> Đăng xuất
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden lg:flex items-center space-x-3 text-sm">
                  <Link
                    href="/signup"
                    className="hover:text-orange-100 transition-all duration-200 hover:scale-105 font-medium px-2 py-1 rounded"
                  >
                    Đăng ký
                  </Link>
                  <div className="h-4 border-l border-orange-300/60"></div>
                  <Link
                    href="/signin"
                    className="hover:text-orange-100 transition-all duration-200 hover:scale-105 font-medium px-2 py-1 rounded"
                  >
                    Đăng nhập
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-center bg-white border-b border-gray-200 shadow-sm">
          <div className="container">
            <div className="flex items-center justify-between gap-2 md:gap-4 py-3">
              <button
                className="md:hidden p-2 -ml-2 text-gray-600 hover:text-orange-500 transition-colors rounded-lg hover:bg-orange-50"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu size={24} />
              </button>

              <Link href="/" className="text-2xl font-bold flex-shrink-0">
                <img
                  src={getStorageImageUrl("/logo/logo.png") || "/placeholder.svg"}
                  alt="emarket logo"
                  className="w-60 h-20 object-cover bg-none hover:scale-105 transition-transform duration-200"
                />
              </Link>

{/* Thanh tìm kiếm và gợi ý (Giữ từ Code 2 với các cải tiến) */}
                                 <div ref={searchContainerRef} className="flex-grow w-full order-3 md:order-2 mt-2 md:mt-0 relative">
                                     <form onSubmit={handleSearchSubmit} className="flex w-full bg-white rounded-lg overflow-hidden border-2 border-gray-200 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 transition-all shadow-sm hover:shadow-md">
                                        <input type="text" placeholder="Tìm kiếm sản phẩm, thương hiệu..." className="w-full px-4 py-3 text-sm text-gray-800 focus:outline-none bg-transparent placeholder-gray-500" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onFocus={() => { if (suggestions && searchQuery.length > 1) setIsSuggestBoxOpen(true); }} />
                                        <button type="submit" className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 px-6 transition-all duration-200 hover:scale-105 active:scale-95"><Search size={20} className="text-white" /></button>
                                    </form>
                                    {isSuggestBoxOpen && (
                                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-80 overflow-y-auto">
                                            {isLoading ? (<div className="p-3 text-center text-sm text-gray-500">Đang tìm...</div>) : (suggestions && (suggestions.products.length > 0 || suggestions.shops.length > 0) ? (<ul className="text-gray-800 text-sm divide-y divide-gray-100">{suggestions.shops.map(shop => (<li key={`shop-${shop.ShopID}`}><Link href={`/shop/${shop.ShopID}`} className="flex items-center gap-3 p-2.5 hover:bg-gray-100" onClick={() => setIsSuggestBoxOpen(false)}><Store className="w-5 h-5 text-gray-400 flex-shrink-0" /><span className='font-semibold'>Tìm shop "{shop.ShopName}"</span></Link></li>))}{suggestions.products.map(product => (<li key={`product-${product.ProductID}`}><Link href={`/productdetail/${product.ProductID}`} className="flex items-center gap-3 p-2.5 hover:bg-gray-100" onClick={() => setIsSuggestBoxOpen(false)}>{product.ImageURL ? (<img src={product.ImageURL} alt={product.Name} className="w-10 h-10 object-cover rounded-sm flex-shrink-0 border border-gray-100" />) : (<div className="w-10 h-10 bg-gray-100 flex items-center justify-center rounded-sm flex-shrink-0"><Search className="w-5 h-5 text-gray-400" /></div>)}<span className='line-clamp-1 font-medium'>{product.Name}</span></Link></li>))}</ul>) : (<div className="p-3 text-center text-sm text-gray-500">Không tìm thấy gợi ý nào.</div>))}
                                        </div>
                                    )}
                                </div>
              

              <div className="flex items-center space-x-2 md:space-x-4 order-2 md:order-3">
                <Link
                  href="/cart"
                  className="relative p-2 md:p-3 hover:opacity-80 text-gray-600 hover:text-orange-500 transition-all duration-200 hover:scale-110 rounded-lg hover:bg-orange-50"
                >
                  <ShoppingCart size={26} />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full text-xs w-6 h-6 flex items-center justify-center font-bold shadow-lg">
                        {cartItemCount}
                    </span>
                )}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* PHẦN 2: NAV MENU (Giữ nguyên cấu trúc) */}
      {activeTheme && (
        <div className={`h-[30px] transition-colors duration-300 ${activeTheme.navClass} flex items-center`}>
          <div className="container mx-auto px-4 w-full h-full flex items-center">
            <nav className="flex w-full h-full items-center">
              <style
                jsx
              >{`.hide-scrollbar::-webkit-scrollbar { display: none; } .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
              <div className="flex space-x-4 items-center mx-auto hide-scrollbar overflow-x-auto">
                {navError ? (
                  <div className="text-sm text-red-500">Lỗi tải danh mục.</div>
                ) : !navData ? (
                  <div className="text-sm text-gray-500">Đang tải...</div>
                ) : (
                  flattenedCategories.map((item: any) => (
                    <CategoryMenuItem key={item.CategoryID} item={item} theme={activeTheme} isScrolled={isScrolled} />
                  ))
                )}
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* PHẦN 3: MENU TRƯỢT RA CHO MOBILE (Giữ nguyên) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/40 z-[60] md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
          <div
            className="fixed top-0 left-0 w-64 h-full bg-white text-gray-800 shadow-lg p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold mb-4 text-gray-800">Menu</h2>
            <nav>
              <ul>
                <li className="mb-2">
                  {/* CẬP NHẬT CẢ Ở ĐÂY */}
                  <a
                    href="/seller"
                    onClick={handleSellerChannelClick}
                    className="flex items-center gap-2 py-2 hover:text-orange-500 transition-colors"
                  >
                    {isCheckingShop ? <Loader2 className="animate-spin" size={16} /> : <Store size={16} />}
                    <span>Kênh Người Bán</span>
                  </a>
                </li>
                <li className="mb-2">
                  <Link href="#" className="block py-2 hover:text-orange-500 transition-colors">
                    Tải ứng dụng
                  </Link>
                </li>
                <li className="mb-2">
                  <Link href="#" className="block py-2 hover:text-orange-500 transition-colors">
                    Thông báo
                  </Link>
                </li>
                <li className="mb-2">
                  <Link href="#" className="block py-2 hover:text-orange-500 transition-colors">
                    Trợ giúp
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
   
}
