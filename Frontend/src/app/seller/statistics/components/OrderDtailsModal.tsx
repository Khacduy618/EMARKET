"use client"

import { useEffect, useState } from "react"
import { Package, Calendar, User, ChevronLeft, ChevronRight } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import Link from "next/link";
import { getAuthToken } from "@/services/api"

type OrderAction = "orderCompleted" | "orderReturn" | "orderCancel"

type OrderDetail = {
  OrderID: string
  OrderDate: string
  CustomerName: string
  TotalAmount: number
  OverallStatus: string
  ProductCount: number
  ShippingAddress?: string
}

interface OrderDetailsModalProps {
  show: boolean
  action: OrderAction
  startDate: string
  endDate: string
  onClose: () => void
}

const formatVND = (amount: number): string =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount)

const getStatusBadge = (status: string) => {
  const statusConfig = {
    Completed: { label: "Hoàn thành", variant: "default", className: "bg-green-100 text-green-800 border-green-200" },
    Returned: { label: "Trả về", variant: "secondary", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
    CancelledByBuyer: {
      label: "Hủy bởi khách",
      variant: "destructive",
      className: "bg-red-100 text-red-800 border-red-200",
    },
    CancelledBySeller: {
      label: "Hủy bởi shop",
      variant: "destructive",
      className: "bg-red-100 text-red-800 border-red-200",
    },
  }

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig["Completed"]
  return (
    <Badge variant={config.variant as any} className={config.className}>
      {config.label}
    </Badge>
  )
}

const getModalTitle = (action: OrderAction) => {
  const titles = {
    orderCompleted: "Danh sách đơn hàng hoàn thành",
    orderReturn: "Danh sách đơn hàng trả về",
    orderCancel: "Danh sách đơn hàng bị hủy",
  }
  return titles[action]
}

export default function OrderDetailsModal({ show, action, startDate, endDate, onClose }: OrderDetailsModalProps) {
  const [orders, setOrders] = useState<OrderDetail[]>([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalRecords, setTotalRecords] = useState(0)

  const fetchOrderDetails = async () => {
    if (!show || !startDate || !endDate) return

    setLoading(true)
    try {
      const params = new URLSearchParams({
        action,
        startDate,
        endDate,
        page: currentPage.toString(),
        limit: pageSize.toString(),
      })

      const response = await fetch(`http://localhost/api/seller/statistics/orders?${params}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken()}`,
        },
      })
      console.log(response);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setOrders(data.orders || [])
      setTotalPages(data.pagination?.totalPages || 1)
      setTotalRecords(data.pagination?.totalRecords || 0)
    } catch (error) {
      console.error("Failed to fetch order details:", error)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (show) {
      setCurrentPage(1) // Reset to first page when modal opens
      fetchOrderDetails()
    }
  }, [show, action, startDate, endDate])

  useEffect(() => {
    fetchOrderDetails()
  }, [currentPage, pageSize])

  const handleClose = () => {
    setOrders([])
    setCurrentPage(1)
    onClose()
  }

  return (
    <Dialog open={show} onOpenChange={handleClose}>
      <DialogContent className="!max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Package className="w-5 h-5 text-orange-500" />
            {getModalTitle(action)}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              <span className="ml-3 text-gray-600">Đang tải dữ liệu...</span>
            </div>
          ) : (
            <>
              {/* Controls */}
              <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <div className="text-sm text-gray-600">
                  Tổng cộng: <span className="font-semibold">{totalRecords}</span> đơn hàng
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="page-size" className="text-sm">
                    Hiển thị:
                  </Label>
                  <Select
                    value={pageSize.toString()}
                    onValueChange={(value) => {
                      setPageSize(Number(value))
                      setCurrentPage(1)
                    }}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[10, 20, 50, 100].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Table */}
              <div className="flex-1 overflow-auto border rounded-lg">
                <Table>
                  <TableHeader className="sticky top-0 bg-gray-50 z-10">
                    <TableRow>
                      <TableHead className="w-16">STT</TableHead>
                      <TableHead>Mã đơn hàng</TableHead>
                      <TableHead>Ngày đặt</TableHead>
                      <TableHead>Khách hàng</TableHead>
                      <TableHead>Số sản phẩm</TableHead>
                      <TableHead>Tổng tiền</TableHead>
                      <TableHead>Trạng thái</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                          <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p>Không có dữ liệu</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      orders.map((order, index) => (
                        <TableRow key={order.OrderID} className="hover:bg-gray-50">
                          <TableCell className="font-medium text-gray-600">
                            {(currentPage - 1) * pageSize + index + 1}
                          </TableCell>
                          <TableCell>
                            <Link href={`/seller/statistics/${order.OrderID}`} className="flex items-center space-x-2 text-sm text-blue-600 hover:underline">
                              <span className="text-blue-600 font-bold">#{order.OrderID}</span>
                            </Link>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span>{new Date(order.OrderDate).toLocaleDateString("vi-VN")}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-gray-400" />
                              <span>{order.CustomerName || "N/A"}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Package className="w-4 h-4 text-gray-400" />
                              <span className="font-medium">{order.ProductCount}</span>
                              <span className="text-xs text-gray-500">sản phẩm</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">

                              <span className="font-bold text-green-600">{formatVND(order.TotalAmount)}</span>
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(order.OverallStatus)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 flex-shrink-0">
                  <div className="text-sm text-gray-600">
                    Hiển thị {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, totalRecords)} của{" "}
                    {totalRecords} bản ghi
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Trước
                    </Button>
                    <span className="text-sm text-gray-600">
                      Trang {currentPage} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    >
                      Sau
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
