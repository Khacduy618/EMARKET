"use client"

import { useState, useEffect } from "react"
import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Calendar,
  Phone,
  Mail,
  Shield,
  Star,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Sidebar from "./Sidebar"
import { useAuth } from "@/context/AuthContext"

interface user {
  UserID: number
  Username: string
  Email: string
  FullName: string
  Phone: string
  Role: string
  Level: string
  Avatar: string
  IsActive: boolean
  CreatedAt: string
  UpdatedAt: string
  email_verified_at: string | null
  two_factor_confirmed_at: string | null
  two_factor_recovery_codes: string | null
  two_factor_secret: string | null
}

const Header = () => {
  
  const { user, logout , isLoading} = useAuth();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
console.log("User data in Header:", user)
  // const [loading, setLoading] = useState(true)
  
 
const getDisplayName = () => {
    if (!user) return "Người dùng"
    return user.FullName || user.Username || "Người dùng"
  }

  const getDisplayRole = () => {
    if (!user) return "User"
    return `${user.Role} - ${user.Level}` || user.Role || "Seller"
  }

  const getAvatarUrl = () => {
    if (!user || !user.Avatar) return null
    return user.Avatar
  }

  const getInitials = () => {
    const name = user?.FullName || user?.Username || "User"
    return name.split(" ").map((word) => word.charAt(0)).join("").toUpperCase().slice(0, 2)
  }

  // Các hàm còn lại giữ nguyên và thay `user` bằng `user`
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("vi-VN", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })
    } catch { return dateString }
  }

  const getLevelBadgeColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "vàng": return "bg-yellow-500"; case "bạc": return "bg-gray-400"; case "đồng": return "bg-orange-600"; default: return "bg-blue-500"
    }
  }

  
  return (
    <>
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64">
                <Sidebar />
              </SheetContent>
            </Sheet>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input placeholder="Tìm kiếm sản phẩm, đơn hàng..." className="pl-10 w-64 hidden md:block" />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <Badge className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center p-0">
                3
              </Badge>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={getAvatarUrl() || "/placeholder.svg?height=32&width=32"} alt={getDisplayName()} />
                    <AvatarFallback>{getInitials()}</AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium">{isLoading ? "Đang tải..." : getDisplayName()}</p>
                    <p className="text-xs text-gray-500">{isLoading ? "..." : getDisplayRole()}</p>
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setIsProfileModalOpen(true)}>
                  <User className="mr-2 h-4 w-4" />
                  Thông tin cá nhân
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Cài đặt
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600" onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Profile Modal */}
      <Dialog open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={getAvatarUrl() || "/placeholder.svg?height=48&width=48"} alt={getDisplayName()} />
                <AvatarFallback className="text-lg">{getInitials()}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-semibold">{getDisplayName()}</h2>
                <p className="text-sm text-muted-foreground">@{user?.Username}</p>
              </div>
            </DialogTitle>
            <DialogDescription>Thông tin chi tiết về tài khoản của bạn</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Thông tin cơ bản
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Họ và tên</label>
                    <p className="text-sm font-semibold">{user?.FullName || "Chưa cập nhật"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Tên đăng nhập</label>
                    <p className="text-sm font-semibold">{user?.Username}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <p className="text-sm">{user?.Email}</p>
                     
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Số điện thoại</label>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <p className="text-sm">{user?.Phone || "Chưa cập nhật"}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Role & Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Vai trò & Trạng thái
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Vai trò</label>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {user?.Role}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Cấp độ</label>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <Badge className={`text-white ${getLevelBadgeColor(user?.Level || "")}`}>
                        {user?.Level}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Trạng thái</label>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${user?.IsActive ? "bg-green-500" : "bg-red-500"}`} />
                      <span className={`text-sm font-medium ${user?.IsActive ? "text-green-600" : "text-red-600"}`}>
                        {user?.IsActive ? "Hoạt động" : "Không hoạt động"}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Thông tin tài khoản
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">ID người dùng</label>
                    <p className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">#{user?.UserID}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Ngày tạo</label>
                    <p className="text-sm">
                      {user?.CreatedAt ? formatDate(user.CreatedAt) : "Không có thông tin"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Cập nhật lần cuối</label>
                    <p className="text-sm">
                      {user?.UpdatedAt ? formatDate(user.UpdatedAt) : "Không có thông tin"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Bảo mật 2FA</label>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${user?.two_factor_confirmed_at ? "bg-green-500" : "bg-gray-400"}`}
                      />
                      <span className="text-sm">
                        {user?.two_factor_confirmed_at ? "Đã kích hoạt" : "Chưa kích hoạt"}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsProfileModalOpen(false)}>
              Đóng
            </Button>
            <Button>Chỉnh sửa thông tin</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default Header
