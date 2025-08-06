"use client"

import { useEffect, useState, useMemo } from "react"
import {
  Activity,
  ChevronUp,
  ChevronDown,
  TrendingUp,
  Package,
  ShoppingCart,
  Calendar,
  Filter,
  Eye,
  ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import StatCard from "./StatCard"
import OrderModal from "./OderModal"
import OrderDetailsModal from "./OrderDtailsModal"
import ChartOrderSuccessRate from "./ChartOrderSuccessRate"
import RevenueChart from "./RevenueChart"
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, subWeeks, subMonths } from "date-fns"
import { CalendarItem } from "./CalenderItem"
import type { TimeRange } from "@/types/analytics"
import { format } from "date-fns"
import type { summaryDataChart } from "@/types/analytics"

const formatVND = (amount: number): string => new Intl.NumberFormat("vi-VN").format(amount)
const formatVND2 = (amount: number): string =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount)

type Revenue = {
  OrderDate?: string
  OrderNumber: number
  OderReturn: number
  TotalRevenue: number
  NumProductsSold: number
}

type OrderAction = "orderCompleted" | "orderReturn" | "orderCancel"

export default function ComponentRevenue() {
  const [revenueData, setRevenueData] = useState<Revenue>()
  const [arrRevenue, setArrRevenue] = useState<Revenue[]>([])
  const [startDate, setStartDate] = useState<string>(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0],
  )
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split("T")[0])
  const [showModal, setShowModal] = useState<boolean>(false)
  const [showOrderDetailsModal, setShowOrderDetailsModal] = useState<boolean>(false)
  const [selectedDate, setSelectedDate] = useState<string | undefined>(undefined)
  const [selectedOrderAction, setSelectedOrderAction] = useState<OrderAction>("orderCompleted")
  const [loading, setLoading] = useState<boolean>(false)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [displayQuantity, setDisplayQuantity] = useState<number>(10)
  const [totalPage, setTotalPage] = useState<number>(1)
  const [sortParam, setSortParam] = useState<string>("OrderDate-desc")
  const [timeRange, setTimeRange] = useState<TimeRange>("day")
  const [dataChartSucess, setDataChartSucess] = useState<summaryDataChart | null>(null)

  const today = new Date()
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)

  const [dateRange, setDateRange] = useState({
    from: firstDay,
    to: lastDay,
  })

  const params = useMemo(() => {
    if (!startDate || !endDate) return ""
    const p = new URLSearchParams({
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      page: currentPage.toString(),
      display_quantity: displayQuantity.toString(),
      sort: sortParam,
    })
    return p.toString()
  }, [startDate, endDate, currentPage, displayQuantity, sortParam])

  const updateDateRangeByFilterType = (type: "date" | "week" | "month") => {
    const now = new Date()
    switch (type) {
      case "week": {
        const lastWeek = subWeeks(now, 1)
        const weekStart = startOfWeek(lastWeek, { weekStartsOn: 1 })
        const weekEnd = endOfWeek(lastWeek, { weekStartsOn: 1 })
        setDateRange({ from: weekStart, to: weekEnd })
        break
      }
      case "month": {
        const lastMonth = subMonths(now, 1)
        const monthStart = startOfMonth(lastMonth)
        const monthEnd = endOfMonth(lastMonth)
        setDateRange({ from: monthStart, to: monthEnd })
        break
      }
      case "date":
      default:
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
        setDateRange({ from: monthStart, to: now })
        break
    }
  }

  const handleTimeRangeChange = (newTimeRange: TimeRange) => {
    setTimeRange(newTimeRange)
    const typeMap = { day: "date", week: "week", month: "month" } as const
    updateDateRangeByFilterType(typeMap[newTimeRange])
  }

  const handleApply = () => {
    setStartDate(format(dateRange.from, "yyyy-MM-dd"))
    setEndDate(format(dateRange.to, "yyyy-MM-dd"))
    setCurrentPage(1)
  }

  const fetchStatistics = async () => {
    if (!startDate || !endDate) return
    setLoading(true)
    try {
      const res = await fetch(`http://localhost/api/seller/statistics?${params}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken()}`,
        },
      })
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
      const data = await res.json()
      setRevenueData(data.summaryByShop)
      setArrRevenue(data.summaryByDate)
      setTotalPage(data.pagination?.totalPage ?? 1)
      setDataChartSucess(data.summaryDataChart)
    } catch (error) {
      console.error("Failed to fetch statistics:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchStatistics()
    })
    return () => clearTimeout(timeout)
  }, [params])

  const handleOrderClick = (orderDate?: string) => {
    setShowModal(true)
    setSelectedDate(orderDate)
  }

  const handleStatCardClick = (action: OrderAction) => {
    setSelectedOrderAction(action)
    setShowOrderDetailsModal(true)
  }

  const handleSort = (field: string) => {
    const [currentField, currentDir] = sortParam.split("-")
    if (currentField === field) {
      setSortParam(`${field}-${currentDir === "asc" ? "desc" : "asc"}`)
    } else {
      setSortParam(`${field}-asc`)
    }
  }

  const renderSortIcon = (field: string) => {
    const [currentField, currentDir] = sortParam.split("-")
    const isActive = currentField === field
    return (
      <div className="inline-flex flex-col ml-1">
        <ChevronUp size={12} className={isActive && currentDir === "asc" ? "text-orange-500" : "text-gray-400"} />
        <ChevronDown size={12} className={isActive && currentDir === "desc" ? "text-orange-500" : "text-gray-400"} />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <OrderModal show={showModal} date={selectedDate} onClose={() => setShowModal(false)} />
      <OrderDetailsModal
        show={showOrderDetailsModal}
        action={selectedOrderAction}
        startDate={startDate}
        endDate={endDate}
        onClose={() => setShowOrderDetailsModal(false)}
      />

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-orange-500" />
            Bộ lọc thời gian
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CalendarItem
            timeRange={timeRange}
            onTimeRangeChange={handleTimeRangeChange}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            onApply={handleApply}
          />
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          <span className="ml-3 text-gray-600">Đang tải dữ liệu...</span>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="relative group">
              <StatCard
                title="Tổng doanh thu"
                value={formatVND(Number(revenueData?.TotalRevenue ?? 0)) + " ₫"}
                icon={TrendingUp}
                changeType="increase"
                color="green"
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 hover:bg-white"
                onClick={() => handleStatCardClick("orderCompleted")}
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>

            <div className="relative group">
              <StatCard
                title="Đơn giao thành công"
                value={(dataChartSucess?.Completed ?? 0).toString()}
                icon={ShoppingCart}
                changeType="increase"
                color="blue"
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 hover:bg-white"
                onClick={() => handleStatCardClick("orderCompleted")}
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>

            <div className="relative group">
              <StatCard
                title="Đơn bị trả về"
                value={(dataChartSucess?.Returned ?? 0).toString()}
                icon={ShoppingCart}
                changeType="increase"
                color="blue"
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 hover:bg-white"
                onClick={() => handleStatCardClick("orderReturn")}
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>

            <div className="relative group">
              <StatCard
                title="Đơn bị hủy"
                value={(dataChartSucess?.Cancelled ?? 0).toString()}
                icon={Package}
                changeType="increase"
                color="purple"
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 hover:bg-white"
                onClick={() => handleStatCardClick("orderCancel")}
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex">
            <Card className="w-6/12">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Tỷ lệ đơn hàng giao thành công</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ChartOrderSuccessRate data={dataChartSucess} />
              </CardContent>
            </Card>

            <Card className="w-6/12 ml-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Mức doanh thu theo ngày</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <RevenueChart summaryByDate={arrRevenue} loading={loading} />
              </CardContent>
            </Card>
          </div>

          {/* Revenue Table */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-orange-500" />
                    Doanh thu từng ngày
                  </CardTitle>
                  <CardDescription>Chi tiết doanh thu và đơn hàng theo ngày</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="display-quantity" className="text-sm">
                    Hiển thị:
                  </Label>
                  <Select
                    value={displayQuantity.toString()}
                    onValueChange={(value) => setDisplayQuantity(Number(value))}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[5, 10, 20, 50, 100].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="w-16">STT</TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort("OrderDate")}
                      >
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          Thời gian
                          {renderSortIcon("OrderDate")}
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort("OrderNumber")}
                      >
                        <div className="flex items-center">
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Đơn hàng
                          {renderSortIcon("OrderNumber")}
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort("NumProductsSold")}
                      >
                        <div className="flex items-center">
                          <Package className="w-4 h-4 mr-2" />
                          Sản phẩm
                          {renderSortIcon("NumProductsSold")}
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort("TotalRevenue")}
                      >
                        <div className="flex items-center">
                          <TrendingUp className="w-4 h-4 mr-2" />
                          Doanh thu
                          {renderSortIcon("TotalRevenue")}
                        </div>
                      </TableHead>
                      <TableHead className="w-24">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {arrRevenue.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                          <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p>Không có dữ liệu trong khoảng thời gian này</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      arrRevenue.map((item, index) => (
                        <TableRow key={index} className="hover:bg-orange-50/50 transition-colors">
                          <TableCell className="font-medium text-gray-600">
                            {(currentPage - 1) * displayQuantity + index + 1}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                {item.OrderDate?.slice(0, 10)}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <span className="font-medium">{item.OrderNumber}</span>
                              <span className="text-xs text-gray-500">đơn</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <span className="font-medium">{item.NumProductsSold}</span>
                              <span className="text-xs text-gray-500">sản phẩm</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-bold text-green-600">{formatVND2(item.TotalRevenue)}</span>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOrderClick(item.OrderDate)}
                              className="hover:bg-orange-50 hover:text-orange-600"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Chi tiết
                            </Button>
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
                  Hiển thị {(currentPage - 1) * displayQuantity + 1} -{" "}
                  {Math.min(currentPage * displayQuantity, arrRevenue.length)} của {arrRevenue.length} bản ghi
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  >
                    Trước
                  </Button>
                  <span className="text-sm text-gray-600">
                    Trang {currentPage} / {totalPage}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPage}
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPage))}
                  >
                    Sau
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
