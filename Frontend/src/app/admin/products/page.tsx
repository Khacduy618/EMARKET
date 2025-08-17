"use client"

import { useEffect, useState } from "react"
import {
  Search,
  Eye,
  ChevronUp,
  ChevronDown,
  Package,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Hourglass,
  Grid3X3,
  Sparkles
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import ProductDetailModal from "./components/ProductDetailModal"
import { Label } from "@/components/ui/label"
import CategoryDropDow from "./components/category-selector"
import { API_URL } from "@/lib/config"

interface Product {
  ProductID: number
  Name: string
  IsActive: boolean
  AdminApprovalStatus: string
  SoldCount: number
  viewCount: number
  CreatedAt: string
  category?: {
    Name: string
  }
}

const approvalOptions = [
  { value: "Pending", label: "Chờ duyệt", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  { value: "Approved", label: "Đã duyệt", color: "bg-green-100 text-green-800", icon: CheckCircle },
  { value: "Rejected", label: "Từ chối", color: "bg-red-100 text-red-800", icon: XCircle },
]

const formatDate = (isoDate: string) => {
  const d = new Date(isoDate)
  return isNaN(d.getTime()) ? "" : d.toLocaleDateString("vi-VN")
}

import { getAuthToken } from "@/services/api"
import { truncateText } from "@/utils";

export default function ProductListPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [keyword, setKeyword] = useState("")
  const [sortColumn, setSortColumn] = useState("CreatedAt")
  const [sortType, setSortType] = useState<"asc" | "desc">("desc")
  const [currentPage, setCurrentPage] = useState(1)
  const [limitItem, setLimitItem] = useState(10)
  const [totalPage, setTotalPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterApproval, setFilterApproval] = useState("all")
  const [filterCategory, setFilterCategory] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null)

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        keyword,
        sort_by: sortColumn,
        sort_order: sortType,
        page: currentPage.toString(),
        per_page: limitItem.toString(),
      })

      if (filterStatus !== "all") params.set("is_active", filterStatus)
      if (filterApproval !== "all") params.set("approval_status", filterApproval)
      if (filterCategory) params.set("category_name", filterCategory)

      const authToken = getAuthToken()
      if (!authToken) {
        toast.error("Không tìm thấy token xác thực")
        return
      }

      const res = await fetch(`${API_URL}/admin/products?${params.toString()}`, {
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
      })

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }

      const json = await res.json()

      if (json.status) {
        setProducts(json.data.data || [])
        setTotalPage(json.data.last_page || 1)
      } else {
        toast.error(json.message || "Không thể tải danh sách sản phẩm")
      }
      setProducts(json.data.data);
      setTotalPage(json.data.last_page || 1);
    } catch (err) {
      console.error("Lỗi fetch:", err)
      toast.error("Không thể tải danh sách sản phẩm")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [keyword, sortColumn, sortType, currentPage, limitItem, filterStatus, filterApproval, filterCategory])

  const handleSort = (col: string) => {
    if (col === sortColumn) {
      setSortType(sortType === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(col)
      setSortType("asc")
    }
  }

  const handleShowDetail = (id: number) => {
    setSelectedProductId(id)
    setShowModal(true)
  }

  const handleApprovalChange = async (productId: number, newStatus: string) => {
    const product = products.find((p) => p.ProductID === productId)
    const statusLabel = approvalOptions.find((opt) => opt.value === newStatus)?.label || newStatus

    if (
      confirm(
        `Bạn có chắc muốn cập nhật trạng thái duyệt của sản phẩm "${product?.Name}" thành "${statusLabel}" không?`,
      )
    ) {
      try {
        const authToken = getAuthToken()
        if (!authToken) {
          toast.error("Không tìm thấy token xác thực")
          return
        }

        const res = await fetch(`${API_URL}/admin/products/${productId}/approval-status`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: 'include',
          body: JSON.stringify({ _method: "PUT", status: newStatus }),
        })

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }

        const json = await res.json()
        if (json.status) {
          setProducts((prev) =>
            prev.map((p) => (p.ProductID === productId ? { ...p, AdminApprovalStatus: newStatus } : p)),
          )
          toast.success("Cập nhật trạng thái thành công!")
        } else {
          toast.error(json.message || "Có lỗi xảy ra")
        }
      } catch (err) {
        console.error("Lỗi khi cập nhật:", err)
        toast.error("Không thể kết nối đến máy chủ")
      }
    }
  }

  const renderSortIcon = (col: string) => {
    if (sortColumn !== col) return null
    return sortType === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
  }

  const totalProducts = products.length
  const activeProducts = products.filter((p) => p.IsActive).length
  const approvedProducts = products.filter((p) => p.AdminApprovalStatus === "Approved").length
  const pendingProducts = products.filter(p => p.AdminApprovalStatus === "Pending").length;

  return (
    <>
      <div className="space-y-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Tổng sản phẩm</CardTitle>
              <Package className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{totalProducts}</div>
              <p className="text-xs text-gray-500">Tất cả sản phẩm trong hệ thống</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Đang hoạt động</CardTitle>
              <TrendingUp className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{activeProducts}</div>
              <p className="text-xs text-gray-500">Sản phẩm đang hiển thị</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Chờ duyệt</CardTitle>
              <Hourglass className="w-4 h-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{pendingProducts}</div>
              <p className="text-xs text-gray-500">Sản phẩm đang chờ duyệt</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Đã duyệt</CardTitle>
              <CheckCircle className="w-4 h-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{approvedProducts}</div>
              <p className="text-xs text-gray-500">Sản phẩm được phê duyệt</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and search*/}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 backdrop-blur-sm">
          <div className="p-4">
            <div className="grid grid-cols-1 lg:grid-cols-6 gap-6 items-end">
              {/* Tìm kiếm */}
              <div className="lg:col-span-2">
                <Label className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3 block flex items-center gap-2">
                  <Search className="h-4 w-4 text-blue-500" />
                  Tìm kiếm sản phẩm
                </Label>
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <Input
                    placeholder="Nhập tên sản phẩm..."
                    value={keyword}
                    onChange={(e) => {
                      setKeyword(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="pl-12 h-11 border-2 border-gray-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 bg-white shadow-sm rounded-xl"
                  />
                </div>
              </div>

              {/* Trạng thái hiển thị */}
              <div>
                <Label className="text-sm font-semibold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-3 block flex items-center gap-2">
                  <Eye className="h-4 w-4 text-green-500" />
                  Trạng thái hiển thị
                </Label>
                <Select
                  value={filterStatus}
                  onValueChange={(value) => {
                    setFilterStatus(value)
                    setCurrentPage(1)
                  }}
                >
                  <SelectTrigger className="h-11 border-2 border-gray-200 hover:border-green-300 focus:border-green-500 transition-all duration-200 bg-white shadow-sm rounded-xl">
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"></div>
                        Tất cả
                      </div>
                    </SelectItem>
                    <SelectItem value="1">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full shadow-sm"></div>
                        Hiển thị
                      </div>
                    </SelectItem>
                    <SelectItem value="0">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full"></div>
                        Ẩn
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Trạng thái duyệt */}
              <div>
                <Label className="text-sm font-semibold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-3 block flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-amber-500" />
                  Trạng thái duyệt
                </Label>
                <Select
                  value={filterApproval}
                  onValueChange={(value) => {
                    setFilterApproval(value)
                    setCurrentPage(1)
                  }}
                >
                  <SelectTrigger className="h-11 border-2 border-gray-200 hover:border-amber-300 focus:border-amber-500 transition-all duration-200 bg-white shadow-sm rounded-xl">
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"></div>
                        Tất cả
                      </div>
                    </SelectItem>
                    <SelectItem value="Pending">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full shadow-sm animate-pulse"></div>
                        Chờ duyệt
                      </div>
                    </SelectItem>
                    <SelectItem value="Approved">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full shadow-sm"></div>
                        Đã duyệt
                      </div>
                    </SelectItem>
                    <SelectItem value="Rejected">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-gradient-to-r from-red-400 to-rose-500 rounded-full shadow-sm"></div>
                        Từ chối
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Danh mục */}
              <div>
                <Label className="text-sm font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3 block flex items-center gap-2">
                  <Package className="h-4 w-4 text-purple-500" />
                  Danh mục sản phẩm
                </Label>
                <CategoryDropDow
                  value={filterCategory}
                  onChange={(value: string) => setFilterCategory(value)}
                  onPageReset={() => setCurrentPage(1)}
                />
              </div>

              {/* Số mục mỗi trang */}
              <div>
                <Label className="text-sm font-semibold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent mb-3 block flex items-center gap-2">
                  <Grid3X3 className="h-4 w-4 text-indigo-500" />
                  Số lượng hiển thị
                </Label>
                <Select
                  value={limitItem.toString()}
                  onValueChange={(value: string) => {
                    setLimitItem(Number.parseInt(value, 10))
                    setCurrentPage(1)
                  }}
                >
                  <SelectTrigger className="h-11 border-2 border-gray-200 hover:border-indigo-300 focus:border-indigo-500 transition-all duration-200 bg-white shadow-sm rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[5, 10, 20, 50].map((n) => (
                      <SelectItem key={n} value={n.toString()}>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-gradient-to-r from-indigo-400 to-blue-500 rounded-full"></div>
                          {n} mục
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Decorative bottom border */}
            <div className="mt-6 h-1 bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 rounded-full opacity-20"></div>
          </div>
        </Card>

        {/* Products Table */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Danh sách sản phẩm</CardTitle>
                <CardDescription>
                  Trang {currentPage} / {totalPage} - Tổng cộng {totalProducts} sản phẩm
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                <span className="ml-3 text-gray-600">Đang tải...</span>
              </div>
            ) : (
              <>
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead
                          className="cursor-pointer hover:bg-gray-100 transition-colors w-80"
                          onClick={() => handleSort("Name")}
                        >
                          <div className="flex items-center gap-2">
                            Tên sản phẩm
                            {renderSortIcon("Name")}
                          </div>
                        </TableHead>
                        <TableHead className="w-32">Danh mục</TableHead>
                        <TableHead
                          className="cursor-pointer hover:bg-gray-100 transition-colors w-24"
                          onClick={() => handleSort("IsActive")}
                        >
                          <div className="flex items-center gap-2">
                            Trạng thái
                            {renderSortIcon("IsActive")}
                          </div>
                        </TableHead>
                        <TableHead className="w-48">Phê duyệt</TableHead>
                        <TableHead
                          className="cursor-pointer hover:bg-gray-100 transition-colors w-20"
                          onClick={() => handleSort("viewCount")}
                        >
                          <div className="flex items-center gap-2">
                            Lượt xem
                            {renderSortIcon("viewCount")}
                          </div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer hover:bg-gray-100 transition-colors w-28"
                          onClick={() => handleSort("CreatedAt")}
                        >
                          <div className="flex items-center gap-2">
                            Ngày tạo
                            {renderSortIcon("CreatedAt")}
                          </div>
                        </TableHead>
                        <TableHead className="w-20">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                            <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>Không có sản phẩm nào</p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        products.map((prod) => (
                          <TableRow key={prod.ProductID} className="hover:bg-orange-50/50 transition-colors">
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-8 w-8 rounded-lg">
                                  <AvatarImage src="/placeholder.svg?height=32&width=32" alt={prod.Name} />
                                  <AvatarFallback className="bg-orange-100 text-orange-600 rounded-lg text-xs">
                                    {prod.Name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0 flex-1">
                                  <p className="font-medium text-gray-900 text-sm">
                                    {truncateText(prod.Name)}
                                  </p>
                                  <p className="text-xs text-gray-500">ID: {prod.ProductID}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                                {prod.category?.Name || "Không có"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={`text-xs ${prod.IsActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                              >
                                {prod.IsActive ? "Hiện" : "Ẩn"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Select
                                value={prod.AdminApprovalStatus}
                                onValueChange={(value) => handleApprovalChange(prod.ProductID, value)}
                              >
                                <SelectTrigger className="w-35 h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {approvalOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      <div className="flex items-center gap-2 text-xs">
                                        <option.icon className="w-2 h-3" />
                                        {option.label}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Eye className="w-3 h-3 text-gray-400" />
                                <span className="text-sm font-medium">{prod.viewCount.toLocaleString()}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-gray-600">{formatDate(prod.CreatedAt)}</span>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleShowDetail(prod.ProductID)}>
                                    <Eye className="w-4 h-4 mr-2" />
                                    Xem chi tiết
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-600">
                    Hiển thị {(currentPage - 1) * limitItem + 1} - {Math.min(currentPage * limitItem, totalProducts)}{" "}
                    của {totalProducts} sản phẩm
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      className="text-xs"
                    >
                      Trước
                    </Button>
                    {/* Page numbers */}
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, totalPage) }, (_, i) => {
                        let pageNum
                        if (totalPage <= 5) {
                          pageNum = i + 1
                        } else if (currentPage <= 3) {
                          pageNum = i + 1
                        } else if (currentPage >= totalPage - 2) {
                          pageNum = totalPage - 4 + i
                        } else {
                          pageNum = currentPage - 2 + i
                        }

                        return (
                          <Button
                            key={pageNum}
                            variant={pageNum === currentPage ? "default" : "outline"}
                            size="sm"
                            className={`text-xs ${pageNum === currentPage ? "bg-orange-500 hover:bg-orange-600" : ""}`}
                            onClick={() => setCurrentPage(pageNum)}
                          >
                            {pageNum}
                          </Button>
                        )
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === totalPage}
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPage))}
                      className="text-xs"
                    >
                      Sau
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Product Detail Modal */}
        {selectedProductId && (
          <ProductDetailModal productId={selectedProductId} show={showModal} onHide={() => setShowModal(false)} />
        )}
      </div>
    </>
  )
}