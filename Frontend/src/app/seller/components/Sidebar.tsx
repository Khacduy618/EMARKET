"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import {
  Settings,
  Package,
  ShoppingCart,
  BarChart3,
  Megaphone,
  Wallet,
  MessageCircle,
  HelpCircle,
  Home,
} from "lucide-react"

const sidebarItems = [
  { icon: Home, label: "Trang chủ", href: "/seller" },
  { icon: Package, label: "Quản lý sản phẩm", href: "/seller/products", badge: "12" },
  { icon: ShoppingCart, label: "Quản lý đơn hàng", href: "/seller/orders", badge: "5" },
  { icon: BarChart3, label: "Thống kê bán hàng", href: "/seller/statistics" },
  { icon: Megaphone, label: "Marketing & Khuyến mãi", href: "/seller/marketing" },
  { icon: Wallet, label: "Tài chính", href: "/seller/finance" },
  { icon: MessageCircle, label: "Chăm sóc khách hàng", href: "/seller/support", badge: "3" },
  { icon: Settings, label: "Cài đặt Shop", href: "/seller/settings" },
  { icon: HelpCircle, label: "Hỗ trợ", href: "/help" },
]

function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname()

  return (
    <div className={`bg-white border-r h-screen border-gray-200 ${className}`}>
      <div className="p-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <span className="font-bold text-lg text-gray-900">Emarket Seller</span>
        </div>
      </div>

      <nav className="px-4 space-y-1">
        {sidebarItems.map((item, index) => {
          const isActive = pathname === item.href

          return (
            <Link key={index} href={item.href} className="block">
              <div
                className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                  isActive
                    ? "bg-orange-50 text-orange-600 border-r-2 border-orange-500"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <item.icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                {item.badge && (
                  <Badge variant="secondary" className="bg-red-100 text-red-600 text-xs">
                    {item.badge}
                  </Badge>
                )}
              </div>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

export default Sidebar
