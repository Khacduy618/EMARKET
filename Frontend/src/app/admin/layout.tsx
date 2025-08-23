"use client";
import { useState } from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Store,
  ShoppingBag,
  Users,
  BarChart3,
  X,
  Tag,
  Star,
  Truck,
  CreditCard,
  Gift,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

import Header from "@/app/seller/components/Header";
import RoleGuard from '../components/auth/RoleGuard';

export default function AdminLayout({
  children,
}: {
  children?: React.ReactNode;
}) {
  const [activeRoute, setActiveRoute] = useState('/dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    {
      href: '/admin/products',
      label: 'Sản phẩm',
      icon: Package,
      description: 'Quản lý sản phẩm'
    },
    {
      href: '/admin/categories',
      label: 'Danh mục sản phẩm',
      icon: Tag,
      description: 'Quản lý danh mục'
    },
    {
      href: '/admin/shops',
      label: 'Danh sách cửa hàng',
      icon: Store,
      description: 'Quản lý cửa hàng'
    },
    {
      href: '/admin/orders',
      label: 'Đơn hàng',
      icon: ShoppingCart,
      description: 'Quản lý đơn hàng'
    },
    {
      href: '/admin/refunds',
      label: 'Giao dịch',
      icon: ShoppingBag,
      description: 'Quản lý giao dịch'
    },
    {
      href: '/admin/users',
      label: 'Khách hàng',
      icon: Users,
      description: 'Quản lý khách hàng'
    },
    {
      href: '/admin/reviews',
      label: 'Đánh giá',
      icon: Star,
      description: 'Quản lý đánh giá',
    },
    // {
    //   href: '/admin/statistics',
    //   label: 'Thống kê',
    //   icon: BarChart3,
    //   description: 'Báo cáo & phân tích'
    // }
    
  ];

  const router = useRouter();

  const handleMenuClick = (href: string) => {
    router.push(href);
    setActiveRoute(href);
    setIsMobileMenuOpen(false);
  };



  const getPageTitle = () => {
    const currentItem = menuItems.find(item => item.href === activeRoute);
    return currentItem?.label || 'Dashboard';
  };

  const getPageDescription = () => {
    const currentItem = menuItems.find(item => item.href === activeRoute);
    return currentItem?.description || 'Tổng quan hệ thống';
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <RoleGuard allowedRoles = {['Admin']}>
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* --- SIDEBAR --- */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-72 flex-shrink-0 
        bg-white shadow-2xl border-r border-gray-200 transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-full flex flex-col">
          {/* Logo/Header của Admin Panel */}
          <div className="h-20 flex items-center justify-between px-6 bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20"></div>
            <div className="relative flex items-center gap-3 z-10">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
                <ShoppingBag className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-white font-bold text-xl tracking-tight">EMARKET</h1>
                <p className="text-blue-100 text-xs font-medium">Admin Panel</p>
              </div>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-white/10 rounded-full"></div>
          </div>

          {/* Menu điều hướng */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeRoute === item.href;

              return (
                <button
                  key={item.href}
                  onClick={() => handleMenuClick(item.href)}
                  className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 group relative ${isActive
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
                    : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                    }`}
                >
                  <div className={`p-2 rounded-lg mr-3 transition-all ${isActive ? 'bg-white/20' : 'bg-gray-100 group-hover:bg-blue-100'
                    }`}>
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-600 group-hover:text-blue-600'
                      }`} />
                  </div>
                  <div className="flex-1 text-left">
                    <span className="font-medium text-sm">{item.label}</span>
                    <p className={`text-xs mt-0.5 ${isActive ? 'text-blue-100' : 'text-gray-500 group-hover:text-blue-600'
                      }`}>
                      {item.description}
                    </p>
                  </div>
                  {isActive && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-l-full" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* --- NỘI DUNG CHÍNH --- */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        {/* Page Content */}
        <main className="flex-1 p-2 md:p-2 lg:p-2 overflow-y-auto">
          {children}
        </main>
      </div>
      </RoleGuard>
    </div>
  );
}