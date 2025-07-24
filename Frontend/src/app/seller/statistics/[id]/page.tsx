"use client"

import { useState, useEffect } from "react"
import {
  Calendar,
  Package,
  Truck,
  CreditCard,
  User,
  MapPin,
  Phone,
  Mail,
  FileText,
  Printer,
  Download,
  AlertCircle,
  ArrowLeft,
} from "lucide-react"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface OrderItem {
  OrderItemID: number
  ProductName: string
  SKU: string
  ImageURL: string
  Quantity: number
  PriceAtPurchase: number
  Subtotal: number
  IsFlashSaleItem: number
  ReturnStatus: string
}

interface Order {
  OrderID: number
  OrderCode: string
  OrderDate: string
  TotalAmount: number
  SubtotalAmount: number
  ShippingFee: number
  DiscountAmount: number
  PaymentMethod: string
  paidAt: string | null // Fixed: Allow null
  PaymentStatus: string
  OverallStatus: string
  ShippingFullName: string
  ShippingPhoneNumber: string
  Notes: string | null
  BuyerName: string
  BuyerEmail: string
  ShippingAddress: string
}

interface OrderData {
  order: Order
  items: OrderItem[]
}

export default function Page() {
  const params = useParams()
  const router = useRouter()
  const [orderData, setOrderData] = useState<OrderData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrderData = async () => {
      console.log("All params:", params)
      console.log("params.id:", params?.id)
      console.log("params.id type:", typeof params?.id)

      // More flexible ID validation
      const orderId = params?.id // Updated to use params?.id
      if (!orderId || orderId === "" || orderId === "undefined") {
        console.log("Invalid order ID detected:", orderId)
        setError(`ID đơn hàng không hợp lệ: "${orderId}"`)
        setLoading(false)
        return
      }

      try {
        setError(null)
        console.log("Fetching order with ID:", orderId)
        // Keep the original URL since it seems to work
        const url = `http://localhost:8001/api/seller/statistics/orders/deaill/${orderId}`
        console.log("Fetching URL:", url)

        const res = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        })

        // console.log("Response status:", res.status)
        // console.log("Response ok:", res.ok)
        console.log(res)

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }

        const data = await res.json()

        // More detailed validation
        if (!data) {
          throw new Error("Không nhận được dữ liệu từ server")
        }
        if (!data.order) {
          throw new Error("Thiếu thông tin đơn hàng")
        }
        if (!data.items) {
          throw new Error("Thiếu thông tin sản phẩm")
        }
        if (!Array.isArray(data.items)) {
          throw new Error("Dữ liệu sản phẩm không hợp lệ")
        }

        console.log("Data validation passed, setting order data")
        console.log(data)
        setOrderData(data)
      } catch (error) {
        console.error("Lỗi khi tải đơn hàng:", error)
        setError(error instanceof Error ? error.message : "Có lỗi xảy ra khi tải đơn hàng")
      } finally {
        setLoading(false)
      }
    }

    fetchOrderData()
  }, [params]) // Updated dependency to params

  const formatCurrency = (amount: number) => {
    try {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(amount)
    } catch (error) {
      return `${amount.toLocaleString()} VND`
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Chưa có thông tin"
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return "Ngày không hợp lệ"
      }
      return date.toLocaleString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch (error) {
      return "Ngày không hợp lệ"
    }
  }

  const getStatusColor = (status: string) => {
    if (!status) return "bg-gray-100 text-gray-800"
    switch (status.toLowerCase()) {
      case "paid":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "processing":
        return "bg-blue-100 text-blue-800"
      case "shipped":
        return "bg-purple-100 text-purple-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleBack = () => {
    router.back()
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    console.log("Download invoice")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải thông tin đơn hàng...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div>
              <p className="font-medium">Lỗi: {error}</p>
              <p className="text-sm mt-2">ID đơn hàng: "{params?.id}"</p>
              <p className="text-sm">Type: {typeof params?.id}</p>
              <p className="text-sm">All params: {JSON.stringify(params)}</p>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!orderData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Không tìm thấy thông tin đơn hàng</AlertDescription>
        </Alert>
      </div>
    )
  }

  const { order, items } = orderData

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Hóa đơn chi tiết</h1>
                <p className="text-gray-600">Mã đơn hàng: {order.OrderCode}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                In hóa đơn
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Tải xuống
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Ngày đặt hàng</p>
                <p className="font-medium">{formatDate(order.OrderDate)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Trạng thái thanh toán</p>
                <Badge className={getStatusColor(order.PaymentStatus)}>{order.PaymentStatus}</Badge>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Package className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Trạng thái đơn hàng</p>
                <Badge className={getStatusColor(order.OverallStatus)}>{order.OverallStatus}</Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Buyer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Thông tin người mua
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Tên người mua</p>
                <p className="font-medium">{order.BuyerName || "Không có thông tin"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {order.BuyerEmail || "Không có thông tin"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phương thức thanh toán</p>
                <p className="font-medium">{order.PaymentMethod}</p>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Thông tin giao hàng
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Người nhận</p>
                <p className="font-medium">{order.ShippingFullName || "Không có thông tin"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Số điện thoại</p>
                <p className="font-medium flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {order.ShippingPhoneNumber || "Không có thông tin"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Địa chỉ giao hàng</p>
                <p className="font-medium flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  {order.ShippingAddress || "Không có thông tin"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Items */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Sản phẩm đã đặt ({items.length} sản phẩm)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Hình ảnh</TableHead>
                  <TableHead>Sản phẩm</TableHead>
                  <TableHead className="text-center">Số lượng</TableHead>
                  <TableHead className="text-right">Đơn giá</TableHead>
                  <TableHead className="text-right">Thành tiền</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.OrderItemID}>
                    <TableCell>
                      <Image
                        src={
                          item.ImageURL
                            ? `http://localhost:8001/storage/${item.ImageURL}`
                            : "/placeholder.svg?height=60&width=60"
                        }
                        alt={item.ProductName}
                        width={60}
                        height={60}
                        className="rounded-md object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = "/placeholder.svg?height=60&width=60"
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{item.ProductName}</p>
                        <p className="text-sm text-gray-600">SKU: {item.SKU}</p>
                        {item.IsFlashSaleItem === 1 && (
                          <Badge variant="destructive" className="mt-1">
                            Flash Sale
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{item.Quantity}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(item.PriceAtPurchase)}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(item.Subtotal)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Payment Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Tổng kết thanh toán
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Tạm tính</span>
                <span className="font-medium">{formatCurrency(order.SubtotalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phí vận chuyển</span>
                <span className="font-medium">{formatCurrency(order.ShippingFee)}</span>
              </div>
              {order.DiscountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Giảm giá</span>
                  <span className="font-medium">-{formatCurrency(order.DiscountAmount)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Tổng cộng</span>
                <span className="text-red-600">{formatCurrency(order.TotalAmount)}</span>
              </div>
              {order.paidAt && (
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Đã thanh toán lúc</span>
                  <span>{formatDate(order.paidAt)}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        {order.Notes && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Ghi chú
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{order.Notes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
