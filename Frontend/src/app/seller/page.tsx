// "use client"

// import { useState } from "react"
// import {
//   Bell,
//   ChevronDown,
//   Menu,
//   Search,
//   Settings,
//   User,
//   Package,
//   ShoppingCart,
//   BarChart3,
//   Megaphone,
//   Wallet,
//   MessageCircle,
//   HelpCircle,
//   LogOut,
//   Home,
//   TrendingUp,
//   Users,
//   Star,
//   Eye,
// } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu"
// import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

// // const sidebarItems = [
// //   { icon: Home, label: "Trang chủ", active: true },
// //   { icon: Package, label: "Quản lý sản phẩm", badge: "12" },
// //   { icon: ShoppingCart, label: "Quản lý đơn hàng", badge: "5" },
// //   { icon: BarChart3, label: "Thống kê bán hàng" },
// //   { icon: Megaphone, label: "Marketing & Khuyến mãi" },
// //   { icon: Wallet, label: "Tài chính" },
// //   { icon: MessageCircle, label: "Chăm sóc khách hàng", badge: "3" },
// //   { icon: Settings, label: "Cài đặt Shop" },
// //   { icon: HelpCircle, label: "Hỗ trợ" },
// // ]

// const stats = [
//   { title: "Doanh thu hôm nay", value: "2,450,000₫", change: "+12.5%", trend: "up" },
//   { title: "Đơn hàng mới", value: "24", change: "+8", trend: "up" },
//   { title: "Sản phẩm đã bán", value: "156", change: "+23", trend: "up" },
//   { title: "Lượt xem shop", value: "1,234", change: "-2.1%", trend: "down" },
// ]

// const recentOrders = [
//   { id: "#SP001", customer: "Nguyễn Văn A", product: "Áo thun nam basic", amount: "299,000₫", status: "Chờ xác nhận" },
//   { id: "#SP002", customer: "Trần Thị B", product: "Quần jean nữ", amount: "450,000₫", status: "Đang giao" },
//   { id: "#SP003", customer: "Lê Văn C", product: "Giày sneaker", amount: "890,000₫", status: "Hoàn thành" },
//   { id: "#SP004", customer: "Phạm Thị D", product: "Túi xách nữ", amount: "320,000₫", status: "Chờ xác nhận" },
// ]

// // function Sidebar({ className }: { className?: string }) {
// //   return (
// //     <div className={`bg-white border-r border-gray-200 ${className}`}>
// //       <div className="p-6">
// //         <div className="flex items-center space-x-2">
// //           <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
// //             <span className="text-white font-bold text-sm">S</span>
// //           </div>
// //           <span className="font-bold text-lg text-gray-900">Emarket Seller</span>
// //         </div>
// //       </div>

// //       <nav className="px-4 space-y-1">
// //         {sidebarItems.map((item, index) => (
// //           <div
// //             key={index}
// //             className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${
// //               item.active
// //                 ? "bg-orange-50 text-orange-600 border-r-2 border-orange-500"
// //                 : "text-gray-600 hover:bg-gray-50"
// //             }`}
// //           >
// //             <div className="flex items-center space-x-3">
// //               <item.icon className="w-5 h-5" />
// //               <span className="text-sm font-medium">{item.label}</span>
// //             </div>
// //             {item.badge && (
// //               <Badge variant="secondary" className="bg-red-100 text-red-600 text-xs">
// //                 {item.badge}
// //               </Badge>
// //             )}
// //           </div>
// //         ))}
// //       </nav>
// //     </div>
// //   )
// // }

// export default function SellerDashboard() {
//   const [sidebarOpen, setSidebarOpen] = useState(false)

//   return (
//     <div className="flex h-screen overflow-hidden">

//       {/* Nội dung dashboard */}
//       <div className="flex-1 overflow-y-auto bg-gray-50">
//         <main className="p-6">
//           <div className="mb-8">
//             <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
//             <p className="text-gray-600">Chào mừng trở lại! Đây là tổng quan về shop của bạn.</p>
//           </div>

//           {/* Stats Grid */}
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//             {stats.map((stat, index) => (
//               <Card key={index}>
//                 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                   <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
//                   <TrendingUp className={`w-4 h-4 ${stat.trend === "up" ? "text-green-600" : "text-red-600"}`} />
//                 </CardHeader>
//                 <CardContent>
//                   <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
//                   <p className={`text-xs ${stat.trend === "up" ? "text-green-600" : "text-red-600"}`}>
//                     {stat.change} so với hôm qua
//                   </p>
//                 </CardContent>
//               </Card>
//             ))}
//           </div>

//           {/* Orders & Quick Actions */}
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//             {/* Recent Orders */}
//             <Card>
//               <CardHeader>
//                 <CardTitle className="flex items-center justify-between">
//                   Đơn hàng gần đây
//                   <Button variant="outline" size="sm">Xem tất cả</Button>
//                 </CardTitle>
//                 <CardDescription>Danh sách đơn hàng mới nhất của shop</CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <div className="space-y-4">
//                   {recentOrders.map((order, index) => (
//                     <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
//                       <div className="flex-1">
//                         <div className="flex items-center justify-between mb-1">
//                           <span className="font-medium text-sm">{order.id}</span>
//                           <Badge
//                             variant={
//                               order.status === "Hoàn thành"
//                                 ? "default"
//                                 : order.status === "Đang giao"
//                                   ? "secondary"
//                                   : "outline"
//                             }
//                             className="text-xs"
//                           >
//                             {order.status}
//                           </Badge>
//                         </div>
//                         <p className="text-sm text-gray-600">{order.customer}</p>
//                         <p className="text-xs text-gray-500">{order.product}</p>
//                         <p className="text-sm font-medium text-orange-600">{order.amount}</p>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Quick Actions */}
//             <Card>
//               <CardHeader>
//                 <CardTitle>Thao tác nhanh</CardTitle>
//                 <CardDescription>Các tính năng thường dùng</CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <div className="grid grid-cols-2 gap-4">
//                   <Button className="h-20 flex flex-col items-center justify-center space-y-2 bg-orange-500 hover:bg-orange-600">
//                     <Package className="w-6 h-6" />
//                     <span className="text-sm">Thêm sản phẩm</span>
//                   </Button>
//                   <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
//                     <ShoppingCart className="w-6 h-6" />
//                     <span className="text-sm">Xử lý đơn hàng</span>
//                   </Button>
//                   <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
//                     <Megaphone className="w-6 h-6" />
//                     <span className="text-sm">Tạo khuyến mãi</span>
//                   </Button>
//                   <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
//                     <BarChart3 className="w-6 h-6" />
//                     <span className="text-sm">Xem báo cáo</span>
//                   </Button>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>

//           {/* Performance Overview */}
//           <Card className="mt-6">
//             <CardHeader>
//               <CardTitle>Hiệu suất shop</CardTitle>
//               <CardDescription>Đánh giá tổng quan về hiệu suất bán hàng</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                 <div className="flex items-center space-x-4">
//                   <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
//                     <Star className="w-6 h-6 text-yellow-600" />
//                   </div>
//                   <div>
//                     <p className="text-2xl font-bold">4.8</p>
//                     <p className="text-sm text-gray-600">Đánh giá trung bình</p>
//                   </div>
//                 </div>
//                 <div className="flex items-center space-x-4">
//                   <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
//                     <Users className="w-6 h-6 text-blue-600" />
//                   </div>
//                   <div>
//                     <p className="text-2xl font-bold">2,456</p>
//                     <p className="text-sm text-gray-600">Người theo dõi</p>
//                   </div>
//                 </div>
//                 <div className="flex items-center space-x-4">
//                   <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
//                     <Eye className="w-6 h-6 text-green-600" />
//                   </div>
//                   <div>
//                     <p className="text-2xl font-bold">98.5%</p>
//                     <p className="text-sm text-gray-600">Tỷ lệ phản hồi</p>
//                   </div>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </main>
//       </div>
//     </div>
//   )
// }

"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react'; // Tùy chọn: tạo component loading

export default function SellerRootPage() {
    const router = useRouter();

    useEffect(() => {
        // Ngay khi component được render, thực hiện chuyển hướng
        router.replace('/seller/statistics');
    }, [router]);

    // Hiển thị một trạng thái loading trong khi chờ chuyển hướng
    // để tránh màn hình trắng
    return (
        <div className="flex items-center justify-center h-screen">
            <Loader2 /> 
            {/* Hoặc chỉ là một dòng text: <p>Đang chuyển hướng...</p> */}
        </div>
    );
}