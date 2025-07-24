"use client"

import { useState, useEffect } from "react"
import { Menu, Search, Bell, ChevronDown, User, Settings, LogOut } from "lucide-react"
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
import Sidebar from "./Sidebar" // đảm bảo đường dẫn đúng

interface UserData {
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
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const userDataString = localStorage.getItem("user")
      if (userDataString) {
        const parsedUserData = JSON.parse(userDataString)
        setUserData(parsedUserData)
      }
    } catch (error) {
      console.error("Lỗi khi đọc dữ liệu user từ localStorage:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Hàm để lấy tên hiển thị
  const getDisplayName = () => {
    if (!userData) return "Người dùng"
    return userData.FullName || userData.Username || "Người dùng"
  }

  // Hàm để lấy role hiển thị
  const getDisplayRole = () => {
    if (!userData) return "User"
    return `${userData.Role} - ${userData.Level}` || userData.Role || "Seller"
  }

  // Hàm để lấy avatar
  const getAvatarUrl = () => {
    if (!userData || !userData.Avatar) return null
    return userData.Avatar
  }

  // Hàm để lấy initials cho fallback
  const getInitials = () => {
    const name = userData?.FullName || userData?.Username || "User"
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const handleLogout = () => {
    try {
      localStorage.removeItem("user")
      localStorage.removeItem("authToken")
      // Redirect to login page or refresh
      window.location.href = "/login"
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error)
    }
  }

  return (
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
                  <p className="text-sm font-medium">{loading ? "Đang tải..." : getDisplayName()}</p>
                  <p className="text-xs text-gray-500">{loading ? "..." : getDisplayRole()}</p>
                </div>
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Thông tin cá nhân
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Cài đặt
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Đăng xuất
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

export default Header
