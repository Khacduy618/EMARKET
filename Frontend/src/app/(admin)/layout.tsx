"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Settings,
  Users,
  BarChart3,
  Bell,
  Search,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Store,
} from "lucide-react"

interface MenuItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number
  subItems?: { href: string; label: string }[]
}

const menuItems: MenuItem[] = [
  {
    href: "/dashboard",
    label: "Tổng quan",
    icon: LayoutDashboard,
  },
  {
    href: "/admin/orders",
    label: "Đơn hàng",
    icon: ShoppingCart,
    badge: 12,
  },
  {
    href: "/admin/products",
    label: "Sản phẩm",
    icon: Package,
    subItems: [
      { href: "/admin/products", label: "Tất cả sản phẩm" },
      { href: "/admin/products/add", label: "Thêm sản phẩm" },
      { href: "/admin/categories", label: "Danh mục" },
    ],
  },
  {
    href: "/admin/customers",
    label: "Khách hàng",
    icon: Users,
  },
  {
    href: "/admin/analytics",
    label: "Thống kê",
    icon: BarChart3,
  },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)

  const toggleExpanded = (href: string) => {
    setExpandedItems((prev) => (prev.includes(href) ? prev.filter((item) => item !== href) : [...prev, href]))
  }

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/" || pathname === "/dashboard"
    return pathname.startsWith(href)
  }

  const isExpanded = (href: string) => expandedItems.includes(href)

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Overlay */}
      {isSidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={toggleSidebar} />}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100 bg-gradient-to-r from-orange-500 to-orange-600">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <Store className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <h1 className="text-white font-bold text-lg">Shopee Admin</h1>
                <p className="text-orange-100 text-xs">Quản lý cửa hàng</p>
              </div>
            </div>
            <button onClick={toggleSidebar} className="lg:hidden text-white hover:bg-orange-600 p-1 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Profile */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
              <img
                src="https://i.pravatar.cc/40?u=admin"
                alt="Admin"
                className="w-10 h-10 rounded-full border-2 border-orange-200"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">Admin User</p>
                <p className="text-xs text-gray-500 truncate">admin@shopee.com</p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              const expanded = isExpanded(item.href)

              return (
                <div key={item.href}>
                  <div
                    className={`group relative flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 ${
                      active
                        ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Link href={item.href} className="flex items-center gap-3 flex-1 min-w-0">
                      <Icon
                        className={`w-5 h-5 flex-shrink-0 ${
                          active ? "text-white" : "text-gray-500 group-hover:text-orange-500"
                        }`}
                      />
                      <span className="font-medium text-sm truncate">{item.label}</span>
                    </Link>

                    <div className="flex items-center gap-2">
                      {/* Badge */}
                      {item.badge && (
                        <span
                          className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                            active ? "bg-white text-orange-600" : "bg-orange-100 text-orange-600"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}

                      {/* Expand Button */}
                      {item.subItems && (
                        <button
                          onClick={() => toggleExpanded(item.href)}
                          className={`p-1 rounded transition-transform ${
                            expanded ? "rotate-180" : ""
                          } ${active ? "text-white" : "text-gray-400 hover:text-gray-600"}`}
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Active Indicator */}
                    {active && (
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-l-full" />
                    )}
                  </div>

                  {/* Sub Items */}
                  {item.subItems && expanded && (
                    <div className="ml-8 mt-1 space-y-1">
                      {item.subItems.map((subItem) => (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          className={`block px-3 py-2 text-sm rounded-lg transition-colors ${
                            pathname === subItem.href
                              ? "bg-orange-50 text-orange-600 font-medium"
                              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                          }`}
                        >
                          {subItem.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-100 space-y-2">
            <Link
              href="/admin/settings"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                pathname === "/admin/settings" ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Settings className="w-5 h-5" />
              <span className="font-medium text-sm">Cài đặt</span>
            </Link>

            <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors w-full">
              <LogOut className="w-5 h-5" />
              <span className="font-medium text-sm">Đăng xuất</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button onClick={toggleSidebar} className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {pathname === "/" || pathname === "/dashboard"
                  ? "Tổng quan"
                  : pathname.includes("orders")
                    ? "Quản lý đơn hàng"
                    : pathname.includes("products")
                      ? "Quản lý sản phẩm"
                      : pathname.includes("customers")
                        ? "Quản lý khách hàng"
                        : "Admin Panel"}
              </h2>
              <p className="text-sm text-gray-500">Chào mừng bạn quay trở lại với Shopee Admin</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>

            {/* Profile */}
            <div className="flex items-center gap-3">
              <img
                src="https://i.pravatar.cc/32?u=admin"
                alt="Admin"
                className="w-8 h-8 rounded-full border border-gray-200"
              />
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-900">Admin User</p>
                <p className="text-xs text-gray-500">Quản trị viên</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto bg-gray-50">{children}</main>
      </div>
    </div>
  )
}