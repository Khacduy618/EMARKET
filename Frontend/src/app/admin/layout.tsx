
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Settings,
  Store,
  ShoppingBag,
  Users,
  BarChart3,
  Bell,
  Search,
  LogOut,
  Menu,
  X,
  Tag,
  Truck,
  CreditCard,
  Gift,
  MessageSquare,
  ChevronDown,
} from 'lucide-react';
import RoleGuard from '../components/auth/RoleGuard';
import { logout } from '@/services/auth';
import { useAuth } from '@/context/AuthContext';

// Định nghĩa kiểu dữ liệu cho menu item, hỗ trợ menu con
interface MenuItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  subItems?: { href: string; label: string }[];
  badge?: number;
}

// Danh sách menu chính, đã tích hợp menu con cho Sản phẩm
const menuItems: MenuItem[] = [
  { 
    href: '/admin', 
    label: 'Dashboard', 
    icon: LayoutDashboard,
    description: 'Tổng quan hệ thống'
  },
  { 
    href: '/admin/products', 
    label: 'Sản phẩm', 
    icon: Package,
    description: 'Quản lý kho hàng',
  },
  { 
    href: '/admin/categories', 
    label: 'Danh mục', 
    icon: Tag,
    description: 'Phân loại sản phẩm'
  },
  { 
    href: '/admin/shops', 
    label: 'Cửa hàng', 
    icon: Store,
    description: 'Quản lý cửa hàng'
  },
  { 
    href: '/admin/orders', 
    label: 'Đơn hàng', 
    icon: ShoppingCart,
    description: 'Quản lý đơn hàng',
    badge: 12, // Ví dụ badge
  },
  { 
    href: '/admin/customers', 
    label: 'Khách hàng', 
    icon: Users,
    description: 'Quản lý khách hàng'
  },
  { 
    href: '/admin/analytics', 
    label: 'Thống kê', 
    icon: BarChart3,
    description: 'Báo cáo & phân tích'
  },
  { 
    href: '/admin/promotions', 
    label: 'Khuyến mãi', 
    icon: Gift,
    description: 'Quản lý khuyến mãi'
  },
  // Bạn có thể thêm các mục khác ở đây
];

export default function AdminLayout({
  children,
}: {
  children?: React.ReactNode;
}) {
  const pathname = usePathname(); // Sử dụng hook của Next.js để lấy route hiện tại
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const { user, logout } = useAuth();
  
  // Xác định menu con nào đang mở dựa trên route hiện tại
  useEffect(() => {
    const activeItem = menuItems.find(item => item.subItems && pathname.startsWith(item.href));
    if (activeItem && !expandedItems.includes(activeItem.href)) {
      setExpandedItems(prev => [...prev, activeItem.href]);
    }
  }, [pathname]); // Chạy lại khi route thay đổi

  const toggleExpanded = (href: string) => {
    setExpandedItems(prev => prev.includes(href) ? prev.filter(item => item !== href) : [...prev, href]);
  };
  
  const getPageTitle = () => {
    for (const item of menuItems) {
      if (item.subItems) {
        const subItem = item.subItems.find(sub => pathname === sub.href);
        if (subItem) return subItem.label;
      }
      if (pathname.startsWith(item.href) && item.href !== '/admin') {
         // Xử lý trường hợp chung cho các route con
         const activeItem = menuItems.find(i => pathname.startsWith(i.href) && i.href !== '/admin');
         if (activeItem) return activeItem.label;
      }
    }
    return 'Dashboard';
  };

  const getPageDescription = () => {
    const currentItem = menuItems.find(item => pathname.startsWith(item.href));
    return currentItem?.description || 'Tổng quan hệ thống';
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <RoleGuard allowedRoles = {['Admin']}>
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-72 flex-shrink-0 
        bg-white shadow-2xl border-r border-gray-200 transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-full flex flex-col">
          <div className="h-20 flex items-center justify-between px-6 bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20"></div>
            <Link href="/admin" className="relative flex items-center gap-3 z-10">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
                <ShoppingBag className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-white font-bold text-xl tracking-tight">EMARKET</h1>
                <p className="text-blue-100 text-xs font-medium">Admin Panel</p>
              </div>
            </Link>
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-white/10 rounded-full"></div>
          </div>
          
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = (item.href === '/admin' && pathname === '/admin') || (item.href !== '/admin' && pathname.startsWith(item.href));
              const isExpanded = expandedItems.includes(item.href);

              return (
                <div key={item.href}>
                  <div
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group relative ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
                        : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                    }`}
                  >
                    <Link href={item.subItems ? item.subItems[0].href : item.href} className="flex items-center flex-1 min-w-0" onClick={() => isMobileMenuOpen && setIsMobileMenuOpen(false)}>
                      <div className={`p-2 rounded-lg mr-3 transition-all ${
                        isActive ? 'bg-white/20' : 'bg-gray-100 group-hover:bg-blue-100'
                      }`}>
                        <Icon className={`w-5 h-5 ${
                          isActive ? 'text-white' : 'text-gray-600 group-hover:text-blue-600'
                        }`} />
                      </div>
                      <div className="flex-1 text-left">
                        <span className="font-medium text-sm">{item.label}</span>
                        <p className={`text-xs mt-0.5 ${
                          isActive ? 'text-blue-100' : 'text-gray-500 group-hover:text-blue-600'
                        }`}>
                          {item.description}
                        </p>
                      </div>
                    </Link>

                    <div className="flex items-center gap-2 pr-2">
                        {item.badge && (
                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                                isActive ? 'bg-white text-blue-600' : 'bg-blue-100 text-blue-600'
                            }`}>{item.badge}</span>
                        )}
                        {item.subItems && (
                          <button onClick={() => toggleExpanded(item.href)} className={`p-1 rounded-full ${isActive ? 'text-blue-100 hover:bg-white/20' : 'text-gray-400 hover:bg-gray-200'}`}>
                              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                          </button>
                        )}
                    </div>

                    {isActive && (
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-l-full" />
                    )}
                  </div>

                  {/* Render Sub-menu */}
                  {item.subItems && isExpanded && (
                    <div className="mt-1 pl-12 pr-2 space-y-1">
                      {item.subItems.map(subItem => (
                        <Link 
                          key={subItem.href}
                          href={subItem.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`block w-full text-left px-4 py-2.5 rounded-lg text-sm transition-colors ${
                            pathname === subItem.href 
                            ? 'bg-blue-50 text-blue-700 font-semibold' 
                            : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {subItem.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          <div className="px-4 py-4 border-t border-gray-100 space-y-2">
            <Link
              href="/admin/settings"
              className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                pathname === '/admin/settings'
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="p-2 bg-gray-100 rounded-lg mr-3">
                <Settings className="w-5 h-5 text-gray-600" />
              </div>
              <span className="font-medium text-sm">Cài đặt</span>
            </Link>
            <button className="w-full flex items-center px-4 py-3 rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
              
                onClick={logout}
                
            >
                <LogOut className="mr-3 h-4 w-4" /> Đăng xuất
            
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white/90 backdrop-blur-lg border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{getPageTitle()}</h2>
              <p className="text-sm text-gray-500">{getPageDescription()}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
           
            <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">
                3
              </span>
            </button>
            <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <MessageSquare className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              {/* Sử dụng Avatar từ context, có fallback nếu không có ảnh */}
              <img
                  src={user?.Avatar || `https://ui-avatars.com/api/?name=${user?.FullName || user?.Username}&background=random`}
                  alt={user?.FullName || 'Admin'}
                  className="w-8 h-8 rounded-full border border-gray-200 object-cover"
              />
              {/* Hiển thị thông tin user động */}
              <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">{user?.FullName || user?.Username}</p>
                  <p className="text-xs text-gray-500">{user?.Role}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8 lg:p-10 overflow-y-auto">
          {children}
        </main>
      </div>
      </RoleGuard>
    </div>
  );
}