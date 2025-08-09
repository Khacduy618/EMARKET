import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Package, User, ShoppingBag, BarChart3, Calendar, Eye } from "lucide-react"

interface OrderItem {
    OrderItemID: number
    Quantity: number
    Subtotal: number
    variant: {
        product: {
            Name: string
        }
    }
}

interface Order {
    OrderID: number
    OrderCode: string
    OrderDate: string
    OverallStatus: string
    ShippingFullName: string
    TotalAmount: number
    shop_subtotal: number
    order_items?: OrderItem[]
}

interface OrderCardProps {
    order: Order
    formatCurrency: (amount: number) => string
    formatDate: (date: string) => string
}

const statusTabs = [
    { key: "Pending", label: "Chờ xử lý", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
    { key: "Processing", label: "Đang xử lý", color: "bg-blue-100 text-blue-800 border-blue-200" },
    { key: "Shipped", label: "Đã giao vận", color: "bg-purple-100 text-purple-800 border-purple-200" },
    { key: "Delivered", label: "Đã giao", color: "bg-green-100 text-green-800 border-green-200" },
    { key: "CancelledBySeller", label: "Đã hủy", color: "bg-red-100 text-red-800 border-red-200" },
]

export default function OrderCard({ order, formatCurrency, formatDate }: OrderCardProps) {
    const getStatusBadge = (status: string) => {
        const statusColors = {
            Pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
            Processing: "bg-blue-100 text-blue-800 border-blue-200",
            Shipped: "bg-purple-100 text-purple-800 border-purple-200",
            Delivered: "bg-green-100 text-green-800 border-green-200",
            CancelledBySeller: "bg-red-100 text-red-800 border-red-200",
        }
        const colorClass = statusColors[status as keyof typeof statusColors] || "bg-gray-100 text-gray-800 border-gray-200"
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClass}`}>
                {statusTabs.find((tab) => tab.key === status)?.label || status}
            </span>
        )
    }

    const getProductNames = (orderItems: Order["order_items"]) => {
        if (!orderItems || orderItems.length === 0) return "Không có sản phẩm"
        const firstProduct = orderItems[0].variant.product.Name
        const remainingCount = orderItems.length - 1
        return remainingCount > 0 ? `${firstProduct} và ${remainingCount} sản phẩm khác` : firstProduct
    }

    return (
        <Card className="hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-orange-500">
            <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Order Info */}
                    <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                            <div className="flex items-center gap-2">
                                <Package className="text-orange-500 h-5 w-5" />
                                <h3 className="font-bold text-lg text-gray-900">#{order.OrderCode}</h3>
                            </div>
                            {getStatusBadge(order.OverallStatus)}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-gray-500 mb-1 flex items-center gap-1">
                                    <User className="h-4 w-4" />
                                    Khách hàng
                                </p>
                                <p className="font-semibold text-gray-900">{order.ShippingFullName}</p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-gray-500 mb-1 flex items-center gap-1">
                                    <ShoppingBag className="h-4 w-4" />
                                    Sản phẩm
                                </p>
                                <p className="font-semibold text-gray-900 truncate" title={getProductNames(order.order_items)}>
                                    {getProductNames(order.order_items)}
                                </p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-gray-500 mb-1 flex items-center gap-1">
                                    <BarChart3 className="h-4 w-4" />
                                    Số lượng
                                </p>
                                <p className="font-semibold text-gray-900">
                                    {(order.order_items ?? []).reduce((acc, item) => acc + item.Quantity, 0)} sản phẩm
                                </p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-gray-500 mb-1 flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    Ngày đặt
                                </p>
                                <p className="font-semibold text-gray-900">{formatDate(order.OrderDate)}</p>
                            </div>
                        </div>
                    </div>
                    {/* Order Amount and Actions */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:ml-6 lg:min-w-0 lg:w-80">
                        <div className="text-right flex-1">
                            <p className="text-gray-500 text-sm mb-1">Tổng tiền</p>
                            <p className="text-2xl font-bold text-orange-600">{formatCurrency(order.shop_subtotal)}</p>
                        </div>
                        <Link href={`/seller/orders/${order.OrderID}`} className="w-full sm:w-auto">
                            <Button
                                variant="outline"
                                className="w-full bg-white border-orange-500 text-orange-600 hover:bg-orange-50 hover:border-orange-600"
                            >
                                <Eye className="mr-2 h-4 w-4" />
                                Xem chi tiết
                            </Button>
                        </Link>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
