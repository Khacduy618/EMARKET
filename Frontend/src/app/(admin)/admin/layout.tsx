"use client";
import { useState } from 'react';
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
  User,
  LogOut,
  Menu,
  X,
  Home,
  Tag,
  Truck,
  CreditCard,
  Gift,
  MessageSquare,
  Star,
  TrendingUp
} from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children?: React.ReactNode;
}) {
  const [activeRoute, setActiveRoute] = useState('/dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { 
      href: '/dashboard', 
      label: 'Dashboard', 
      icon: LayoutDashboard,
      description: 'Tổng quan hệ thống'
    },
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
    { 
      href: '/admin/shipping', 
      label: 'Vận chuyển', 
      icon: Truck,
      description: 'Quản lý vận chuyển'
    },
    { 
      href: '/admin/payments', 
      label: 'Thanh toán', 
      icon: CreditCard,
      description: 'Quản lý thanh toán'
    },
  ];

  const handleMenuClick = (href: string) => {
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

          {/* User Profile */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl hover:from-blue-50 hover:to-blue-100 transition-all duration-300 cursor-pointer border border-blue-100">
              <div className="relative">
                <img
                  src="https://i.pravatar.cc/40?u=admin"
                  alt="Admin"
                  className="w-10 h-10 rounded-full border-2 border-white shadow-md"
                />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">Admin User</p>
                <p className="text-xs text-gray-500 truncate">Super Administrator</p>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all"
              />
            </div>
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
                  className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 group relative ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                  }`}
                >
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
                  {isActive && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-l-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Phần cuối Sidebar */}
          <div className="px-4 py-4 border-t border-gray-100 space-y-2">
            <button
              onClick={() => handleMenuClick('/admin/settings')}
              className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                activeRoute === '/admin/settings'
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="p-2 bg-gray-100 rounded-lg mr-3">
                <Settings className="w-5 h-5 text-gray-600" />
              </div>
              <span className="font-medium text-sm">Cài đặt</span>
            </button>

            <button className="w-full flex items-center px-4 py-3 rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200">
              <div className="p-2 bg-gray-100 hover:bg-red-100 rounded-lg mr-3 transition-colors">
                <LogOut className="w-5 h-5" />
              </div>
              <span className="font-medium text-sm">Đăng xuất</span>
            </button>
          </div>
        </div>
      </aside>

      {/* --- NỘI DUNG CHÍNH --- */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
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
            {/* Quick Actions */}
            <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg text-sm font-medium">
              + Thêm mới
            </button>

            {/* Notifications */}
            <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">
                3
              </span>
            </button>

            {/* Messages */}
            <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <MessageSquare className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></span>
            </button>

            {/* Profile */}
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <img
                src="https://i.pravatar.cc/32?u=admin"
                alt="Admin"
                className="w-8 h-8 rounded-full border border-gray-200"
              />
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-900">Admin User</p>
                <p className="text-xs text-gray-500">Super Admin</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 md:p-8 lg:p-10 overflow-y-auto">
          {children || (
            <div className="max-w-7xl mx-auto">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-blue-100 rounded-xl">
                      <TrendingUp className="w-6 h-6 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-green-600">+12%</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">₫2.4M</h3>
                  <p className="text-sm text-gray-500">Doanh thu hôm nay</p>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-green-100 rounded-xl">
                      <ShoppingCart className="w-6 h-6 text-green-600" />
                    </div>
                    <span className="text-sm font-medium text-blue-600">+5</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">156</h3>
                  <p className="text-sm text-gray-500">Đơn hàng mới</p>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-purple-100 rounded-xl">
                      <Users className="w-6 h-6 text-purple-600" />
                    </div>
                    <span className="text-sm font-medium text-purple-600">+28</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">1,234</h3>
                  <p className="text-sm text-gray-500">Khách hàng mới</p>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-orange-100 rounded-xl">
                      <Package className="w-6 h-6 text-orange-600" />
                    </div>
                    <span className="text-sm font-medium text-orange-600">+15</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">2,456</h3>
                  <p className="text-sm text-gray-500">Sản phẩm</p>
                </div>
              </div>

              {/* Welcome Content */}
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <ShoppingBag className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Chào mừng đến với {getPageTitle()}! 🎉
                  </h3>
                  <p className="text-gray-600 text-lg leading-relaxed max-w-2xl mx-auto">
                    Hiện tại bạn đang ở trang <strong>{getPageTitle()}</strong>. 
                    Giao diện admin được thiết kế hiện đại với đầy đủ chức năng quản lý. 
                    Click vào các menu bên trái để điều hướng đến các trang khác nhau.
                  </p>
                  <div className="mt-8 flex flex-wrap justify-center gap-4">
                    <button 
                      onClick={() => handleMenuClick('/admin/products')}
                      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg font-medium"
                    >
                      Quản lý Sản phẩm
                    </button>
                    <button 
                      onClick={() => handleMenuClick('/admin/orders')}
                      className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg font-medium"
                    >
                      Xem Đơn hàng
                    </button>
                    <button 
                      onClick={() => handleMenuClick('/admin/analytics')}
                      className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg font-medium"
                    >
                      Xem Thống kê
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}