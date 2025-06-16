import Link from 'next/link';
import 'bootstrap/dist/css/bootstrap.min.css';


import { LayoutDashboard, ShoppingCart, Package, Settings } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* --- SIDEBAR --- */}
      <aside className="w-64 flex-shrink-0 bg-white border-r">
        <div className="h-full flex flex-col">
          {/* Logo/Header của Admin Panel */}
          <div className="h-16 flex items-center justify-center border-b text-xl font-bold text-gray-800">
            EMARKET ADMIN
          </div>

          {/* Menu điều hướng */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            <Link href="/dashboard" className="flex items-center px-4 py-2 text-gray-700 bg-gray-100 rounded-lg">
              <LayoutDashboard className="w-5 h-5 mr-3" />
              <span>Dashboard</span>
            </Link>
            <Link href="/admin/products" className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <Package className="w-5 h-5 mr-3" />
              <span>Sản phẩm</span>
            </Link>
            <Link href="/admin/categories" className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <Package className="w-5 h-5 mr-3" />
              <span>Danh mục</span>
            </Link>
            <Link href="/admin/orders" className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <ShoppingCart className="w-5 h-5 mr-3" />
              <span>Đơn hàng</span>
            </Link>
            {/* Thêm các link khác ở đây */}
          </nav>

          {/* Phần cuối Sidebar */}
          <div className="px-4 py-6 border-t">
            <Link href="/admin/settings" className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <Settings className="w-5 h-5 mr-3" />
              <span>Cài đặt</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* --- NỘI DUNG CHÍNH --- */}
      <main className="flex-1 p-6 md:p-8 lg:p-10 overflow-y-auto">
        {children}
      </main>
      
    </div>
  );
}