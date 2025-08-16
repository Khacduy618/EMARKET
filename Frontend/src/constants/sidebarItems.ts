import {
  Settings, Package, ShoppingCart, BarChart3, Megaphone, Wallet, MessageCircle, HelpCircle, Home,
  TrendingUp,
  Tag,
  FileText,
  Truck,
  Users,
  Store,
  CreditCard
} from "lucide-react"

export const sidebarItems = [
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

export const adminSidebarItems = [
  { icon: BarChart3, label: "Dashboard", href: "/admin/dashboard" },
  { icon: TrendingUp, label: "Thống kê", href: "/admin/analytics" },
  { icon: Package, label: "Tất cả sản phẩm", href: "/admin/products" },
  { icon: Package, label: "Thêm sản phẩm", href: "/admin/products/add" },
  { icon: Tag, label: "Danh mục", href: "/admin/categories" },
  { icon: ShoppingCart, label: "Tất cả đơn hàng", href: "/admin/orders" },
  { icon: FileText, label: "Đơn hàng mới", href: "/admin/orders/new" },
  { icon: Truck, label: "Vận chuyển", href: "/admin/shipping" },
  { icon: Users, label: "Khách hàng", href: "/admin/customers" },
  { icon: Store, label: "Cửa hàng", href: "/admin/shops" },
  { icon: Tag, label: "Mã giảm giá", href: "/admin/coupons" },
  { icon: TrendingUp, label: "Chương trình khuyến mãi", href: "/admin/promotions" },
  { icon: CreditCard, label: "Thanh toán", href: "/admin/payments" },
  { icon: BarChart3, label: "Báo cáo doanh thu", href: "/admin/revenue" },
]