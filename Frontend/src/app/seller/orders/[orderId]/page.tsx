"use client"
import { useState, useEffect } from "react"
import axios from "axios"
import { useRouter, useParams } from "next/navigation"
import Swal from "sweetalert2"

interface User {
    UserID: number
    Username: string
    FullName?: string
    Email: string
}

interface ShippingAddress {
    AddressID: number
    FullName: string
    PhoneNumber: string
    Street: string
    Ward: string
    District: string
    City: string
}

interface OrderItem {
    OrderItemID: number
    ProductName: string
    VariantDetails?: string
    ProductImage?: string
    Quantity: number
    PriceAtPurchase: number
    Subtotal: number
    SKU?: string
    ReturnStatus?: string
}

interface Order {
    OrderID: number
    OrderCode: string
    OrderDate: string
    TotalAmount: number
    SubtotalAmount: number
    ShippingFee: number
    DiscountAmount: number
    OverallStatus: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled"
    PaymentStatus: "Pending" | "Paid" | "Failed" | "Refunded"
    PaymentMethod: string
    Notes?: string
    User: User
    ShippingAddress: ShippingAddress
    Items: OrderItem[]
}

export default function OrderDetail() {
    const [order, setOrder] = useState<Order | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [updating, setUpdating] = useState(false)
    const router = useRouter()
    const { orderId } = useParams()

    useEffect(() => {
        const fetchOrderDetail = async () => {
            try {
                const token = localStorage.getItem("authToken")
                if (!token) {
                    setError("Vui lòng đăng nhập để tiếp tục")
                    return
                }

                const response = await axios.get(`http://localhost:8001/api/seller/orders/${orderId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
                setOrder(response.data.order)
            } catch (err: any) {
                setError(err.response?.data?.message || "Không thể tải chi tiết đơn hàng")
            } finally {
                setLoading(false)
            }
        }

        if (orderId) fetchOrderDetail()
    }, [orderId])

    const handleStatusUpdate = async (newStatus: string) => {
        if (!order) return

        const result = await Swal.fire({
            title: "Xác nhận cập nhật",
            text: `Bạn có chắc muốn cập nhật trạng thái đơn hàng thành "${getStatusLabel(newStatus)}"?`,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Cập nhật",
            cancelButtonText: "Hủy",
            confirmButtonColor: "#f97316",
        })

        if (result.isConfirmed) {
            try {
                setUpdating(true)
                const token = localStorage.getItem("token")
                await axios.put(
                    `http://localhost:8001/api/seller/orders/${order.OrderID}/status`,
                    { status: newStatus },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    },
                )

                setOrder((prev) => (prev ? { ...prev, OverallStatus: newStatus as any } : null))
                Swal.fire("Thành công!", "Cập nhật trạng thái đơn hàng thành công", "success")
            } catch (err: any) {
                Swal.fire("Lỗi!", err.response?.data?.message || "Không thể cập nhật trạng thái", "error")
            } finally {
                setUpdating(false)
            }
        }
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount)
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            Pending: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Chờ xử lý", icon: "⏳" },
            Processing: { bg: "bg-blue-100", text: "text-blue-800", label: "Đang xử lý", icon: "⚙️" },
            Shipped: { bg: "bg-purple-100", text: "text-purple-800", label: "Đã giao vận", icon: "🚚" },
            Delivered: { bg: "bg-green-100", text: "text-green-800", label: "Đã giao", icon: "✅" },
            Cancelled: { bg: "bg-red-100", text: "text-red-800", label: "Đã hủy", icon: "❌" },
        }
        return statusConfig[status as keyof typeof statusConfig] || statusConfig.Pending
    }

    const getPaymentBadge = (status: string) => {
        const statusConfig = {
            Pending: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Chờ thanh toán" },
            Paid: { bg: "bg-green-100", text: "text-green-800", label: "Đã thanh toán" },
            Failed: { bg: "bg-red-100", text: "text-red-800", label: "Thất bại" },
            Refunded: { bg: "bg-gray-100", text: "text-gray-800", label: "Đã hoàn tiền" },
        }
        return statusConfig[status as keyof typeof statusConfig] || statusConfig.Pending
    }

    const getStatusLabel = (status: string) => {
        const labels = {
            Pending: "Chờ xử lý",
            Processing: "Đang xử lý",
            Shipped: "Đã giao vận",
            Delivered: "Đã giao",
            Cancelled: "Đã hủy",
        }
        return labels[status as keyof typeof labels] || status
    }

    const getOrderTimeline = (status: string) => {
        const allStatuses = ["Pending", "Processing", "Shipped", "Delivered"]
        const currentIndex = allStatuses.indexOf(status)

        return allStatuses.map((s, index) => ({
            status: s,
            label: getStatusLabel(s),
            completed: index <= currentIndex,
            current: index === currentIndex,
        }))
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white border-b shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="text-2xl font-bold text-orange-500">Shopee</div>
                            <div className="text-gray-400">|</div>
                            <div className="text-lg text-gray-700">Kênh Người Bán</div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center justify-center py-20">
                    <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                        <span className="text-gray-600">Đang tải chi tiết đơn hàng...</span>
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white border-b shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="text-2xl font-bold text-orange-500">Shopee</div>
                            <div className="text-gray-400">|</div>
                            <div className="text-lg text-gray-700">Kênh Người Bán</div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                        <div className="text-red-500 text-lg mb-2">Có lỗi xảy ra</div>
                        <div className="text-gray-600 mb-4">{error}</div>
                        <button
                            onClick={() => router.back()}
                            className="bg-orange-500 text-white px-6 py-2 rounded-md hover:bg-orange-600 transition-colors"
                        >
                            Quay lại
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white border-b shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="text-2xl font-bold text-orange-500">Shopee</div>
                            <div className="text-gray-400">|</div>
                            <div className="text-lg text-gray-700">Kênh Người Bán</div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                        <div className="text-gray-500 text-lg mb-2">Không tìm thấy đơn hàng</div>
                        <button
                            onClick={() => router.back()}
                            className="bg-orange-500 text-white px-6 py-2 rounded-md hover:bg-orange-600 transition-colors"
                        >
                            Quay lại
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    const statusBadge = getStatusBadge(order.OverallStatus)
    const paymentBadge = getPaymentBadge(order.PaymentStatus)
    const timeline = getOrderTimeline(order.OverallStatus)

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Shopee Header */}
            <div className="bg-white border-b shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="text-2xl font-bold text-orange-500">Shopee</div>
                        <div className="text-gray-400">|</div>
                        <div className="text-lg text-gray-700">Kênh Người Bán</div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-12h5v12z" />
                        </svg>
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                            />
                        </svg>
                        <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <span className="text-sm text-gray-700">duynguykhc8</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Page Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => router.back()}
                            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            <span>Quay lại</span>
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Chi tiết Đơn hàng #{order.OrderCode}</h1>
                            <p className="text-gray-600 mt-1">Đặt hàng lúc {formatDate(order.OrderDate)}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <span
                            className={`inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full ${statusBadge.bg} ${statusBadge.text}`}
                        >
                            <span className="mr-1">{statusBadge.icon}</span>
                            {statusBadge.label}
                        </span>
                        <span
                            className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${paymentBadge.bg} ${paymentBadge.text}`}
                        >
                            {paymentBadge.label}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Order Timeline */}
                        {order.OverallStatus !== "Cancelled" && (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Tiến trình Đơn hàng</h2>
                                <div className="flex items-center justify-between">
                                    {timeline.map((step, index) => (
                                        <div key={step.status} className="flex flex-col items-center flex-1">
                                            <div className="flex items-center w-full">
                                                <div
                                                    className={`w-8 h-8 rounded-full flex items-center justify-center ${step.completed
                                                            ? "bg-orange-500 text-white"
                                                            : step.current
                                                                ? "bg-orange-100 text-orange-600 border-2 border-orange-500"
                                                                : "bg-gray-200 text-gray-400"
                                                        }`}
                                                >
                                                    {step.completed ? (
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                            <path
                                                                fillRule="evenodd"
                                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                                clipRule="evenodd"
                                                            />
                                                        </svg>
                                                    ) : (
                                                        <span className="text-sm font-medium">{index + 1}</span>
                                                    )}
                                                </div>
                                                {index < timeline.length - 1 && (
                                                    <div className={`flex-1 h-0.5 mx-2 ${step.completed ? "bg-orange-500" : "bg-gray-200"}`} />
                                                )}
                                            </div>
                                            <div className="mt-2 text-center">
                                                <div
                                                    className={`text-sm font-medium ${step.completed || step.current ? "text-gray-900" : "text-gray-400"
                                                        }`}
                                                >
                                                    {step.label}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Order Items */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900">Sản phẩm đã đặt</h2>
                            </div>
                            <div className="divide-y divide-gray-200">
                                {order.Items.map((item, index) => (
                                    <div key={index} className="p-6 flex items-start space-x-4">
                                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                                            {item.ProductImage ? (
                                                <img
                                                    src={item.ProductImage || "/placeholder.svg"}
                                                    alt={item.ProductName}
                                                    className="w-full h-full object-cover rounded-lg"
                                                />
                                            ) : (
                                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                    />
                                                </svg>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-medium text-gray-900">{item.ProductName}</h3>
                                            {item.VariantDetails && (
                                                <p className="text-sm text-gray-500 mt-1">Phân loại: {item.VariantDetails}</p>
                                            )}
                                            {item.SKU && <p className="text-sm text-gray-500">SKU: {item.SKU}</p>}
                                            {item.ReturnStatus && (
                                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 mt-2">
                                                    {item.ReturnStatus}
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm text-gray-500">Số lượng: {item.Quantity}</div>
                                            <div className="text-sm text-gray-900">{formatCurrency(item.PriceAtPurchase)}</div>
                                            <div className="text-lg font-semibold text-gray-900 mt-1">{formatCurrency(item.Subtotal)}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Tóm tắt Đơn hàng</h2>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Tạm tính</span>
                                    <span className="text-gray-900">{formatCurrency(order.SubtotalAmount)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Phí vận chuyển</span>
                                    <span className="text-gray-900">{formatCurrency(order.ShippingFee)}</span>
                                </div>
                                {order.DiscountAmount > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Giảm giá</span>
                                        <span className="text-green-600">-{formatCurrency(order.DiscountAmount)}</span>
                                    </div>
                                )}
                                <div className="border-t pt-3">
                                    <div className="flex justify-between">
                                        <span className="text-lg font-semibold text-gray-900">Tổng cộng</span>
                                        <span className="text-lg font-semibold text-orange-600">{formatCurrency(order.TotalAmount)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Customer Information */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin Khách hàng</h2>
                            <div className="space-y-3">
                                <div>
                                    <div className="text-sm text-gray-600">Tên khách hàng</div>
                                    <div className="font-medium text-gray-900">{order.User.FullName || order.User.Username}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-600">Email</div>
                                    <div className="text-gray-900">{order.User.Email}</div>
                                </div>
                            </div>
                        </div>

                        {/* Shipping Address */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Địa chỉ Giao hàng</h2>
                            <div className="space-y-2">
                                <div className="font-medium text-gray-900">{order.ShippingAddress.FullName}</div>
                                <div className="text-gray-600">{order.ShippingAddress.PhoneNumber}</div>
                                <div className="text-gray-600">
                                    {order.ShippingAddress.Street}, {order.ShippingAddress.Ward}, {order.ShippingAddress.District},{" "}
                                    {order.ShippingAddress.City}
                                </div>
                            </div>
                        </div>

                        {/* Payment Information */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin Thanh toán</h2>
                            <div className="space-y-3">
                                <div>
                                    <div className="text-sm text-gray-600">Phương thức thanh toán</div>
                                    <div className="text-gray-900">{order.PaymentMethod}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-600">Trạng thái thanh toán</div>
                                    <span
                                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${paymentBadge.bg} ${paymentBadge.text}`}
                                    >
                                        {paymentBadge.label}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Order Notes */}
                        {order.Notes && (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Ghi chú Đơn hàng</h2>
                                <div className="text-gray-600">{order.Notes}</div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Thao tác</h2>
                            <div className="space-y-3">
                                {order.OverallStatus === "Pending" && (
                                    <button
                                        onClick={() => handleStatusUpdate("Processing")}
                                        disabled={updating}
                                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                                    >
                                        {updating ? "Đang cập nhật..." : "Xác nhận Đơn hàng"}
                                    </button>
                                )}
                                {order.OverallStatus === "Processing" && (
                                    <button
                                        onClick={() => handleStatusUpdate("Shipped")}
                                        disabled={updating}
                                        className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:opacity-50 transition-colors"
                                    >
                                        {updating ? "Đang cập nhật..." : "Giao hàng"}
                                    </button>
                                )}
                                {order.OverallStatus === "Shipped" && (
                                    <button
                                        onClick={() => handleStatusUpdate("Delivered")}
                                        disabled={updating}
                                        className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
                                    >
                                        {updating ? "Đang cập nhật..." : "Hoàn thành Đơn hàng"}
                                    </button>
                                )}
                                <button className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors">
                                    In Hóa đơn
                                </button>
                                <button className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors">
                                    Xuất Shipping Label
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
