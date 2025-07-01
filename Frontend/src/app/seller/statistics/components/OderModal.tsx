"use client"

import { useEffect, useState } from "react"
import { Package, Calendar, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

type Order = {
  OrderID: number
  OrderCode: string
  BuyerName: string
  OrderDate: string
  TotalAmount: number
}

type OrderModalProps = {
  show: boolean
  onClose: () => void
  date?: string
}

export default function OrderModal({ show, date, onClose }: OrderModalProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (show && date) {
      setLoading(true)
      setError(null)
      fetch(`http://localhost:8001/api/seller/orders?date=${encodeURIComponent(date)}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      })
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
          return res.json()
        })
        .then((data) => {
          setOrders(data)
          setLoading(false)
        })
        .catch((err) => {
          setError(err.message)
          setLoading(false)
        })
    } else {
      setOrders([])
      setError(null)
      setLoading(false)
    }
  }, [show, date])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Dialog open={show} onOpenChange={onClose}>
      <DialogContent className="!max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-orange-500" />
            Đơn hàng ngày {date?.slice(0, 10)}
          </DialogTitle>
          <DialogDescription>Danh sách tất cả đơn hàng trong ngày {date?.slice(0, 10)}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              <span className="ml-3 text-gray-600">Đang tải...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                <span className="text-red-700 font-medium">Lỗi: {error}</span>
              </div>
            </div>
          )}

          {!loading && !error && orders.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Không có đơn hàng nào cho ngày này</p>
            </div>
          )}

          {!loading && !error && orders.length > 0 && (
            <>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-gray-500" />
                  <span className="text-sm text-gray-600">Tổng cộng: {orders.length} đơn hàng</span>
                </div>
                <Badge className="bg-green-100 text-green-800">
                  Tổng doanh thu: {formatCurrency(orders.reduce((sum, order) => sum + order.TotalAmount, 0))}
                </Badge>
              </div>

              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Mã đơn hàng</TableHead>
                      <TableHead>Khách hàng</TableHead>
                      <TableHead>Thời gian đặt</TableHead>
                      <TableHead>Tổng tiền</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.OrderID} className="hover:bg-orange-50/50 transition-colors">
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium text-gray-900">#{order.OrderID}</div>
                            <Badge variant="outline" className="text-xs">
                              {order.OrderCode}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src="/placeholder.svg?height=32&width=32" />
                              <AvatarFallback className="bg-blue-100 text-blue-600">
                                {order.BuyerName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-gray-900">{order.BuyerName}</p>
                              <p className="text-xs text-gray-500">Khách hàng</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{formatDate(order.OrderDate)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-green-600" />
                            <span className="font-bold text-green-600">{formatCurrency(order.TotalAmount)}</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose} variant="outline">
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
