"use client"

import {
  BarChart3,
  Package,
  ShoppingCart,
  Users,
  Settings,
  FileText,
  TrendingUp,
  Store,
  Tag,
  Truck,
  MessageSquare,
  CreditCard,
  Shield,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,  
  SidebarFooter,
} from "@/components/ui/sidebar"

const menuItems = [
  {
    title: "Tổng quan",
    items: [
      {
        title: "Dashboard",
        url: "/admin/dashboard",
        icon: BarChart3,
      },
      {
        title: "Thống kê",
        url: "/admin/analytics",
        icon: TrendingUp,
      },
    ],
  },
  {
    title: "Quản lý sản phẩm",
    items: [
      {
        title: "Tất cả sản phẩm",
        url: "/admin/products",
        icon: Package,
      },
      {
        title: "Thêm sản phẩm",
        url: "/admin/products/add",
        icon: Package,
      },
      {
        title: "Danh mục",
        url: "/admin/categories",
        icon: Tag,
      },
    ],
  },
  {
    title: "Quản lý đơn hàng",
    items: [
      {
        title: "Tất cả đơn hàng",
        url: "/admin/orders",
        icon: ShoppingCart,
      },
      {
        title: "Đơn hàng mới",
        url: "/admin/orders/new",
        icon: FileText,
      },
      {
        title: "Vận chuyển",
        url: "/admin/shipping",
        icon: Truck,
      },
    ],
  },
  {
    title: "Quản lý người dùng",
    items: [
      {
        title: "Khách hàng",
        url: "/admin/customers",
        icon: Users,
      },
      {
        title: "Cửa hàng",
        url: "/admin/shops",
        icon: Store,
      },
    ],
  },
  {
    title: "Marketing & Khuyến mãi",
    items: [
      {
        title: "Mã giảm giá",
        url: "/admin/coupons",
        icon: Tag,
      },
      {
        title: "Chương trình khuyến mãi",
        url: "/admin/promotions",
        icon: TrendingUp,
      },
    ],
  },
  {
    title: "Tài chính",
    items: [
      {
        title: "Thanh toán",
        url: "/admin/payments",
        icon: CreditCard,
      },
      {
        title: "Báo cáo doanh thu",
        url: "/admin/revenue",
        icon: BarChart3,
      },
    ],
  },
]

const bottomMenuItems = [
  {
    title: "Tin nhắn",
    url: "/admin/messages",
    icon: MessageSquare,
  },
  {
    title: "Bảo mật",
    url: "/admin/security",
    icon: Shield,
  },
  {
    title: "Cài đặt",
    url: "/admin/settings",
    icon: Settings,
  },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar className="border-r-0 bg-white shadow-sm">
      <SidebarHeader className="border-b px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-sm">
            S
          </div>
          <div>
            <div className="font-bold text-lg text-gray-900">Shopee</div>
            <div className="text-xs text-gray-500">Admin Center</div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        {menuItems.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">
              {group.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.url}
                      className="w-full justify-start px-3 py-2 text-sm font-medium transition-colors hover:bg-orange-50 hover:text-orange-600 data-[active=true]:bg-orange-100 data-[active=true]:text-orange-700 data-[active=true]:border-r-2 data-[active=true]:border-orange-500"
                    >
                      <Link href={item.url}>
                        <item.icon className="mr-3 h-4 w-4" />
                        {item.title}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t px-3 py-4">
        <SidebarMenu>
          {bottomMenuItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.url}
                className="w-full justify-start px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-100 data-[active=true]:bg-orange-100 data-[active=true]:text-orange-700"
              >
                <Link href={item.url}>
                  <item.icon className="mr-3 h-4 w-4" />
                  {item.title}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
