
"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import axios from "axios"
import Link from "next/link"
import {
  Search,
  X,
  CalendarIcon,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Filter,
  Download,
  Eye,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
} from "lucide-react"
import ClientOnlyTime from "./ClientOnlyTime"

// --- TYPESCRIPT & HÀM TIỆN ÍCH ---
export interface User {
  UserID: number
  FullName: string
  Email: string
  avatar?: string
}

export interface OrderItem {
  OrderItemID: number
  VariantID: number
  Quantity: number
  PriceAtPurchase: number
}

export interface Order {
  OrderID: number
  OrderCode: string
  UserID: number
  OrderDate: string
  TotalAmount: number
  PaymentMethod: "COD" | "BankTransfer" | "OnlineGateway"
  PaymentStatus: "Pending" | "Paid" | "Failed" | "Refunded"
  OverallStatus: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled" | "Completed"
  user: User
  items: OrderItem[]
}

export interface PaginatedOrders {
  current_page: number
  data: Order[]
  last_page: number
  total: number
}

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount)

const formatDateForDisplay = (dateString: string): string =>
  new Date(dateString).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

const formatDateForAPI = (date: Date): string => date.toISOString().split("T")[0]

const getStatusBadgeClass = (status: string) => {
  const map: Record<string, string> = {
    paid: "bg-green-50 text-green-700 border-green-200",
    delivered: "bg-green-50 text-green-700 border-green-200",
    completed: "bg-green-50 text-green-700 border-green-200",
    pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
    processing: "bg-blue-50 text-blue-700 border-blue-200",
    shipped: "bg-purple-50 text-purple-700 border-purple-200",
    failed: "bg-red-50 text-red-700 border-red-200",
    cancelled: "bg-red-50 text-red-700 border-red-200",
  }
  return map[status.toLowerCase()] || "bg-gray-50 text-gray-700 border-gray-200"
}

const getStatusIcon = (status: string) => {
  const iconClass = "w-4 h-4"
  switch (status.toLowerCase()) {
    case "completed":
    case "delivered":
      return <CheckCircle className={`${iconClass} text-green-600`} />
    case "shipped":
      return <Truck className={`${iconClass} text-purple-600`} />
    case "processing":
      return <Package className={`${iconClass} text-blue-600`} />
    case "pending":
      return <Clock className={`${iconClass} text-yellow-600`} />
    case "cancelled":
    case "failed":
      return <XCircle className={`${iconClass} text-red-600`} />
    default:
      return <AlertCircle className={`${iconClass} text-gray-600`} />
  }
}

// --- COMPONENT CON: HEADER THỐNG KÊ ---
const StatsHeader = ({ orderData }: { orderData: PaginatedOrders | null }) => {
  if (!orderData) return null

  const stats = [
    { label: "Tổng đơn hàng", value: orderData.total, color: "text-shopee-orange" },
    { label: "Đơn hôm nay", value: 0, color: "text-blue-600" },
    { label: "Chờ xử lý", value: 0, color: "text-yellow-600" },
    { label: "Đã hoàn thành", value: 0, color: "text-green-600" },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color} mt-1`}>{stat.value.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// --- COMPONENT CON: BỘ LỌC SHOPEE STYLE ---
const FilterControls = ({
  filters,
  onFilterChange,
}: {
  filters: any
  onFilterChange: (newFilters: any) => void
}) => {
  const [isStatusOpen, setStatusOpen] = useState(false)
  const [isDateOpen, setDateOpen] = useState(false)
  const statusRef = useRef<HTMLDivElement>(null)
  const dateRef = useRef<HTMLDivElement>(null)

  const orderStatuses: Order["OverallStatus"][] = [
    "Pending",
    "Processing",
    "Shipped",
    "Delivered",
    "Completed",
    "Cancelled",
  ]

  const statusLabels: Record<string, string> = {
    Pending: "Chờ xử lý",
    Processing: "Đang xử lý",
    Shipped: "Đang giao",
    Delivered: "Đã giao",
    Completed: "Hoàn thành",
    Cancelled: "Đã hủy",
  }

  const handleStatusToggle = (status: string) => {
    const currentStatuses = filters.status || []
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter((s: string) => s !== status)
      : [...currentStatuses, status]
    onFilterChange({ ...filters, status: newStatuses })
  }

  const setDatePreset = (preset: "month" | "last_month" | number) => {
    let to = new Date()
    let from = new Date()

    if (preset === "month") {
      from.setDate(1)
    } else if (preset === "last_month") {
      from = new Date(to.getFullYear(), to.getMonth() - 1, 1)
      to = new Date(to.getFullYear(), to.getMonth(), 0)
    } else if (typeof preset === "number") {
      from.setDate(to.getDate() - preset)
    }

    onFilterChange({
      ...filters,
      start_date: formatDateForAPI(from),
      end_date: formatDateForAPI(to),
    })
    setDateOpen(false)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (statusRef.current && !statusRef.current.contains(event.target as Node)) setStatusOpen(false)
      if (dateRef.current && !dateRef.current.contains(event.target as Node)) setDateOpen(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const hasActiveFilters = filters.search || filters.status?.length > 0 || filters.start_date || filters.end_date

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search Bar */}
        <div className="relative flex-grow">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo mã đơn hàng, tên khách hàng, email..."
            value={filters.search || ""}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-3">
          {/* Status Filter */}
          <div className="relative" ref={statusRef}>
            <button
              onClick={() => setStatusOpen(!isStatusOpen)}
              className={`flex items-center gap-2 px-4 py-3 border rounded-lg transition-all duration-200 ${
                filters.status?.length > 0
                  ? "bg-orange-50 border-orange-200 text-orange-700"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Filter className="w-4 h-4" />
              Trạng thái
              {filters.status?.length > 0 && (
                <span className="bg-orange-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] h-5 flex items-center justify-center">
                  {filters.status.length}
                </span>
              )}
              <ChevronDown className={`w-4 h-4 transition-transform ${isStatusOpen ? "rotate-180" : ""}`} />
            </button>

            {isStatusOpen && (
              <div className="absolute top-full mt-2 left-0 w-64 bg-white border border-gray-200 rounded-xl shadow-xl z-20 p-2">
                <div className="max-h-64 overflow-y-auto">
                  {orderStatuses.map((status) => (
                    <label
                      key={status}
                      className="flex items-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={filters.status?.includes(status) || false}
                        onChange={() => handleStatusToggle(status)}
                        className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      />
                      <div className="ml-3 flex items-center gap-2">
                        {getStatusIcon(status)}
                        <span className="text-sm text-gray-700">{statusLabels[status]}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Date Filter */}
          <div className="relative" ref={dateRef}>
            <button
              onClick={() => setDateOpen(!isDateOpen)}
              className={`flex items-center gap-2 px-4 py-3 border rounded-lg transition-all duration-200 ${
                filters.start_date || filters.end_date
                  ? "bg-orange-50 border-orange-200 text-orange-700"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              <CalendarIcon className="w-4 h-4" />
              Ngày đặt
              <ChevronDown className={`w-4 h-4 transition-transform ${isDateOpen ? "rotate-180" : ""}`} />
            </button>

            {isDateOpen && (
              <div className="absolute top-full mt-2 right-0 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-20 p-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setDatePreset(6)}
                      className="p-2 text-sm bg-gray-50 rounded-lg hover:bg-orange-50 hover:text-orange-600 transition-colors"
                    >
                      7 ngày
                    </button>
                    <button
                      onClick={() => setDatePreset(14)}
                      className="p-2 text-sm bg-gray-50 rounded-lg hover:bg-orange-50 hover:text-orange-600 transition-colors"
                    >
                      15 ngày
                    </button>
                    <button
                      onClick={() => setDatePreset(29)}
                      className="p-2 text-sm bg-gray-50 rounded-lg hover:bg-orange-50 hover:text-orange-600 transition-colors"
                    >
                      30 ngày
                    </button>
                    <button
                      onClick={() => setDatePreset("month")}
                      className="p-2 text-sm bg-gray-50 rounded-lg hover:bg-orange-50 hover:text-orange-600 transition-colors"
                    >
                      Tháng này
                    </button>
                    <button
                      onClick={() => setDatePreset("last_month")}
                      className="p-2 text-sm bg-gray-50 rounded-lg hover:bg-orange-50 hover:text-orange-600 transition-colors"
                    >
                      Tháng trước
                    </button>
                  </div>

                  <hr className="border-gray-200" />

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Từ ngày</label>
                      <input
                        type="date"
                        value={filters.start_date || ""}
                        onChange={(e) => onFilterChange({ ...filters, start_date: e.target.value })}
                        className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Đến ngày</label>
                      <input
                        type="date"
                        value={filters.end_date || ""}
                        onChange={(e) => onFilterChange({ ...filters, end_date: e.target.value })}
                        className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Export Button */}
          <button className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 text-green-700 rounded-lg hover:bg-green-100 transition-colors">
            <Download className="w-4 h-4" />
            Xuất Excel
          </button>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={() => onFilterChange({ sortBy: filters.sortBy, sortOrder: filters.sortOrder })}
              className="flex items-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <X className="w-4 h-4" />
              Xóa lọc
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// --- COMPONENT CON: BẢNG ORDERS SHOPEE STYLE ---
const OrdersTable = ({
  orders,
  filters,
  onFilterChange,
}: {
  orders: Order[]
  filters: any
  onFilterChange: (newFilters: any) => void
}) => {
  const SortableHeader = ({ children, columnKey }: { children: React.ReactNode; columnKey: string }) => {
    const isCurrentSort = filters.sortBy === columnKey
    const nextSortOrder = isCurrentSort && filters.sortOrder === "asc" ? "desc" : "asc"

    return (
      <button
        onClick={() => onFilterChange({ ...filters, sortBy: columnKey, sortOrder: nextSortOrder })}
        className="flex items-center gap-2 group hover:text-orange-600 transition-colors"
      >
        {children}
        {isCurrentSort ? (
          filters.sortOrder === "asc" ? (
            <ChevronUp className="w-4 h-4 text-orange-600" />
          ) : (
            <ChevronDown className="w-4 h-4 text-orange-600" />
          )
        ) : (
          <ChevronsUpDown className="w-4 h-4 text-gray-300 group-hover:text-orange-400" />
        )}
      </button>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Khách hàng
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Mã đơn hàng
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <SortableHeader columnKey="OrderDate">Ngày đặt</SortableHeader>
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <SortableHeader columnKey="TotalAmount">Thành tiền</SortableHeader>
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {orders.length > 0 ? (
              orders.map((order, index) => (
                <tr key={order.OrderID} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12">
                        <img
                          className="h-12 w-12 rounded-full object-cover border-2 border-gray-200"
                          src={order.user.avatar || `https://i.pravatar.cc/48?u=${order.user.Email}`}
                          alt="Avatar"
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-semibold text-gray-900">{order.user.FullName}</div>
                        <div className="text-sm text-gray-500">{order.user.Email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-mono font-medium text-gray-900 bg-gray-100 px-2 py-1 rounded">
                      {order.OrderCode}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{formatDateForDisplay(order.OrderDate)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="text-lg font-bold text-orange-600">{formatCurrency(order.TotalAmount)}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border ${getStatusBadgeClass(order.OverallStatus)}`}
                    >
                      {getStatusIcon(order.OverallStatus)}
                      {order.OverallStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Link
                      href={`/ordersadmin/${order.OrderID}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      Xem chi tiết
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-16">
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <Package className="w-16 h-16 text-gray-300 mb-4" />
                    <p className="text-lg font-medium">Không tìm thấy đơn hàng nào</p>
                    <p className="text-sm">Thử thay đổi bộ lọc để xem thêm kết quả</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// --- COMPONENT CHÍNH ---
export default function OrderManagement() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [filters, setFilters] = useState({
    search: "",
    status: [] as string[],
    start_date: "",
    end_date: "",
    sortBy: "OrderDate",
    sortOrder: "desc",
  })

  const [orderData, setOrderData] = useState<PaginatedOrders | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Effect để đọc URL và set state filter ban đầu
  useEffect(() => {
    const params = new URLSearchParams(searchParams)
    setFilters({
      search: params.get("search") || "",
      status: params.get("status")?.split(",").filter(Boolean) || [],
      start_date: params.get("start_date") || "",
      end_date: params.get("end_date") || "",
      sortBy: params.get("sortBy") || "OrderDate",
      sortOrder: params.get("sortOrder") || "desc",
    })
  }, [searchParams])

  // Effect để cập nhật URL khi state filter thay đổi
  useEffect(() => {
    const currentParams = new URLSearchParams(searchParams.toString())
    const newParams = new URLSearchParams()

    if (filters.search) newParams.set("search", filters.search)
    if (filters.status && filters.status.length > 0) newParams.set("status", filters.status.join(","))
    if (filters.start_date) newParams.set("start_date", filters.start_date)
    if (filters.end_date) newParams.set("end_date", filters.end_date)
    if (filters.sortBy) newParams.set("sortBy", filters.sortBy)
    if (filters.sortOrder) newParams.set("sortOrder", filters.sortOrder)

    if (
      filters.search ||
      filters.status.length > 0 ||
      filters.start_date ||
      filters.end_date ||
      filters.sortBy !== "OrderDate" ||
      filters.sortOrder !== "desc"
    ) {
      newParams.set("page", "1")
    } else {
      newParams.set("page", currentParams.get("page") || "1")
    }

    const debounceUpdate = setTimeout(() => {
      if (newParams.toString() !== currentParams.toString()) {
        router.push(`${pathname}?${newParams.toString()}`)
      }
    }, 500)

    return () => clearTimeout(debounceUpdate)
  }, [filters, pathname, router, searchParams])

  // Effect để fetch dữ liệu khi URL thay đổi
  useEffect(() => {
    const params = new URLSearchParams(searchParams)
    const fetchOrders = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await axios.get("http://localhost:8001/api/orderadmin", { params })
        setOrderData(response.data)
      } catch (err: any) {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.message || "Lỗi kết nối API.")
        } else {
          setError("Lỗi không mong muốn.")
        }
      } finally {
        setIsLoading(false)
      }
    }
    fetchOrders()
  }, [searchParams])

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams)
    params.set("page", newPage.toString())
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const totalPages = orderData?.last_page || 1
  const currentPage = Number(searchParams.get("page")) || 1

  return (
    <div className="w-auto bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-8xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-900">Quản lý đơn hàng</h1>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>Cập nhật lần cuối:</span>
               <ClientOnlyTime />
            </div>
          </div>
          <p className="text-gray-600">Theo dõi và quản lý tất cả đơn hàng của bạn</p>
        </div>

        {/* Stats Header */}
        <StatsHeader orderData={orderData} />

        {/* Filter Controls */}
        <FilterControls filters={filters} onFilterChange={setFilters} />

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-16">
            <div className="flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
              <p className="text-gray-500 font-medium">Đang tải đơn hàng...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-3">
              <XCircle className="w-6 h-6 text-red-600" />
              <div>
                <h3 className="text-red-800 font-semibold">Có lỗi xảy ra</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Orders Table */}
        {!isLoading && !error && orderData && (
          <>
            <OrdersTable orders={orderData.data} filters={filters} onFilterChange={setFilters} />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-8 bg-white rounded-xl shadow-sm border border-gray-100 px-6 py-4">
                <div className="text-sm text-gray-700">
                  Hiển thị <span className="font-medium">{(currentPage - 1) * 10 + 1}</span> đến{" "}
                  <span className="font-medium">{Math.min(currentPage * 10, orderData.total)}</span> trong{" "}
                  <span className="font-medium">{orderData.total}</span> kết quả
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Trước
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                            currentPage === page ? "bg-orange-500 text-white" : "text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          {page}
                        </button>
                      )
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
