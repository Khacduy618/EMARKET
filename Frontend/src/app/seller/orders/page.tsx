"use client"
import { useState, useEffect } from "react"
import axios from "axios"
import Link from "next/link"
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
    Address: string
    Ward: string
    District: string
    Province: string
}

interface OrderItem {
    OrderItemID: number
    ProductName: string
    ProductImage?: string
    Quantity: number
    PriceAtPurchase: number
    Subtotal: number
    SKU?: string
}

interface Order {
    OrderID: number
    OrderCode: string
    OrderDate: string
    TotalAmount: number
    OverallStatus: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled"
    PaymentStatus: "Pending" | "Paid" | "Failed" | "Refunded"
    User: User
    ShippingAddress: ShippingAddress
    Items: OrderItem[]
}

export default function SellerOrders() {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [paymentFilter, setPaymentFilter] = useState("all")
    const [selectedOrders, setSelectedOrders] = useState<number[]>([])
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(10)
    const [sortBy, setSortBy] = useState<"date" | "amount" | "status">("date")
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
    const [showOrderDetail, setShowOrderDetail] = useState<Order | null>(null)

    useEffect(() => {
        fetchOrders()
    }, [])

    const fetchOrders = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem("authToken")
            if (!token) {
                setError("Vui lòng đăng nhập để tiếp tục")
                return
            }

            const response = await axios.get("http://localhost:8001/api/seller/orders", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            console.log("Orders fetched:", response)
            setOrders(response.data.orders || [])
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || "Không thể tải danh sách đơn hàng"
            setError(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    const handleStatusUpdate = async (orderId: number, newStatus: string) => {
        try {
            const token = localStorage.getItem("token")
            await axios.put(
                `http://localhost:8001/api/seller/orders/${orderId}/status`,
                { status: newStatus },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            )

            setOrders((prev) =>
                prev.map((order) => (order.OrderID === orderId ? { ...order, OverallStatus: newStatus as any } : order)),
            )

            Swal.fire("Thành công!", "Cập nhật trạng thái đơn hàng thành công", "success")
        } catch (err: any) {
            Swal.fire("Lỗi!", err.response?.data?.message || "Không thể cập nhật trạng thái", "error")
        }
    }

    const handleBulkStatusUpdate = async (newStatus: string) => {
        if (selectedOrders.length === 0) {
            Swal.fire("Thông báo!", "Vui lòng chọn ít nhất một đơn hàng", "warning")
            return
        }

        const result = await Swal.fire({
            title: "Xác nhận cập nhật",
            text: `Bạn có chắc muốn cập nhật trạng thái ${selectedOrders.length} đơn hàng đã chọn?`,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Cập nhật",
            cancelButtonText: "Hủy",
            confirmButtonColor: "#f97316",
        })

        if (result.isConfirmed) {
            try {
                const token = localStorage.getItem("token")
                await Promise.all(
                    selectedOrders.map((orderId) =>
                        axios.put(
                            `http://localhost:8001/api/seller/orders/${orderId}/status`,
                            { status: newStatus },
                            {
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                },
                            },
                        ),
                    ),
                )

                setOrders((prev) =>
                    prev.map((order) =>
                        selectedOrders.includes(order.OrderID) ? { ...order, OverallStatus: newStatus as any } : order,
                    ),
                )

                setSelectedOrders([])
                Swal.fire("Thành công!", "Cập nhật trạng thái hàng loạt thành công", "success")
            } catch (err: any) {
                Swal.fire("Lỗi!", "Không thể cập nhật một số đơn hàng", "error")
            }
        }
    }

    const handleSelectOrder = (orderId: number, checked: boolean) => {
        if (checked) {
            setSelectedOrders((prev) => [...prev, orderId])
        } else {
            setSelectedOrders((prev) => prev.filter((id) => id !== orderId))
        }
    }

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedOrders(filteredOrders.map((order) => order.OrderID))
        } else {
            setSelectedOrders([])
        }
    }

    // Helper functions
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount)
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

    // Filter and sort orders
    const filteredOrders = orders
        .filter((order) => {
            const matchesSearch =
                order.OrderCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.User.FullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.User.Username.toLowerCase().includes(searchTerm.toLowerCase())

            const matchesStatus = statusFilter === "all" || order.OverallStatus === statusFilter
            const matchesPayment = paymentFilter === "all" || order.PaymentStatus === paymentFilter

            return matchesSearch && matchesStatus && matchesPayment
        })
        .sort((a, b) => {
            let comparison = 0
            switch (sortBy) {
                case "date":
                    comparison = new Date(a.OrderDate).getTime() - new Date(b.OrderDate).getTime()
                    break
                case "amount":
                    comparison = a.TotalAmount - b.TotalAmount
                    break
                case "status":
                    comparison = a.OverallStatus.localeCompare(b.OverallStatus)
                    break
            }
            return sortOrder === "asc" ? comparison : -comparison
        })

    // Pagination
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage)

    const statusOptions = [
        { value: "all", label: "Tất cả trạng thái" },
        { value: "Pending", label: "Chờ xử lý" },
        { value: "Processing", label: "Đang xử lý" },
        { value: "Shipped", label: "Đã giao vận" },
        { value: "Delivered", label: "Đã giao" },
        { value: "Cancelled", label: "Đã hủy" },
    ]

    const paymentOptions = [
        { value: "all", label: "Tất cả thanh toán" },
        { value: "Pending", label: "Chờ thanh toán" },
        { value: "Paid", label: "Đã thanh toán" },
        { value: "Failed", label: "Thất bại" },
        { value: "Refunded", label: "Đã hoàn tiền" },
    ]

    // Get order statistics
    const orderStats = {
        total: orders.length,
        pending: orders.filter((o) => o.OverallStatus === "Pending").length,
        processing: orders.filter((o) => o.OverallStatus === "Processing").length,
        shipped: orders.filter((o) => o.OverallStatus === "Shipped").length,
        delivered: orders.filter((o) => o.OverallStatus === "Delivered").length,
        cancelled: orders.filter((o) => o.OverallStatus === "Cancelled").length,
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
                        <span className="text-gray-600">Đang tải đơn hàng...</span>
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
                            onClick={fetchOrders}
                            className="bg-orange-500 text-white px-6 py-2 rounded-md hover:bg-orange-600 transition-colors"
                        >
                            Thử lại
                        </button>
                    </div>
                </div>
            </div>
        )
    }

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
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý Đơn hàng</h1>
                    <p className="text-gray-600 mt-1">Quản lý tất cả đơn hàng của shop</p>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="text-2xl font-bold text-gray-900">{orderStats.total}</div>
                        <div className="text-sm text-gray-600">Tổng đơn hàng</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="text-2xl font-bold text-yellow-600">{orderStats.pending}</div>
                        <div className="text-sm text-gray-600">Chờ xử lý</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="text-2xl font-bold text-blue-600">{orderStats.processing}</div>
                        <div className="text-sm text-gray-600">Đang xử lý</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="text-2xl font-bold text-purple-600">{orderStats.shipped}</div>
                        <div className="text-sm text-gray-600">Đã giao vận</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="text-2xl font-bold text-green-600">{orderStats.delivered}</div>
                        <div className="text-sm text-gray-600">Đã giao</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="text-2xl font-bold text-red-600">{orderStats.cancelled}</div>
                        <div className="text-sm text-gray-600">Đã hủy</div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    {/* Filters and Search */}
                    <div className="p-6 bg-gray-50 border-b border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                            {/* Search */}
                            <div className="relative">
                                <svg
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                    />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Tìm theo mã đơn, tên khách hàng..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                            </div>

                            {/* Status Filter */}
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            >
                                {statusOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>

                            {/* Payment Filter */}
                            <select
                                value={paymentFilter}
                                onChange={(e) => setPaymentFilter(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            >
                                {paymentOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>

                            {/* Sort */}
                            <div className="flex space-x-2">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as any)}
                                    className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                >
                                    <option value="date">Ngày đặt</option>
                                    <option value="amount">Tổng tiền</option>
                                    <option value="status">Trạng thái</option>
                                </select>
                                <button
                                    onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                                    className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                                >
                                    {sortOrder === "asc" ? "↑" : "↓"}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                                Tìm thấy <span className="font-medium">{filteredOrders.length}</span> đơn hàng
                            </div>
                            <button
                                onClick={fetchOrders}
                                className="flex items-center space-x-2 px-3 py-2 text-sm bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                    />
                                </svg>
                                <span>Làm mới</span>
                            </button>
                        </div>
                    </div>

                    {/* Bulk Actions */}
                    {selectedOrders.length > 0 && (
                        <div className="px-6 py-3 bg-blue-50 border-b border-blue-200">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-blue-800">
                                    Đã chọn <strong>{selectedOrders.length}</strong> đơn hàng
                                </span>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleBulkStatusUpdate("Processing")}
                                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                                    >
                                        Xử lý đơn hàng
                                    </button>
                                    <button
                                        onClick={() => handleBulkStatusUpdate("Shipped")}
                                        className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 transition-colors"
                                    >
                                        Giao vận
                                    </button>
                                    <button
                                        onClick={() => setSelectedOrders([])}
                                        className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition-colors"
                                    >
                                        Bỏ chọn
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Orders Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="w-12 px-6 py-3 text-left">
                                        <input
                                            type="checkbox"
                                            checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                                            onChange={(e) => handleSelectAll(e.target.checked)}
                                            className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
                                        />
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Đơn hàng
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Khách hàng
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Sản phẩm
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tổng tiền
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Trạng thái
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Thanh toán
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Thao tác
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {paginatedOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center">
                                                <svg
                                                    className="w-16 h-16 text-gray-300 mb-4"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={1}
                                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                    />
                                                </svg>
                                                <p className="text-gray-500 text-lg">Không có đơn hàng nào</p>
                                                <p className="text-gray-400 text-sm mt-1">Đơn hàng sẽ xuất hiện ở đây khi có khách đặt hàng</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedOrders.map((order) => {
                                        const statusBadge = getStatusBadge(order.OverallStatus)
                                        const paymentBadge = getPaymentBadge(order.PaymentStatus)
                                        const isSelected = selectedOrders.includes(order.OrderID)

                                        return (
                                            <tr key={order.OrderID} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={(e) => handleSelectOrder(order.OrderID, e.target.checked)}
                                                        className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
                                                    />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">#{order.OrderCode}</div>
                                                        <div className="text-sm text-gray-500">{formatDate(order.OrderDate)}</div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {order.User.FullName || order.User.Username}
                                                        </div>
                                                        <div className="text-sm text-gray-500">{order.User.Email}</div>
                                                        {order.ShippingAddress && (
                                                            <div className="text-xs text-gray-400 mt-1">{order.ShippingAddress.PhoneNumber}</div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="text-sm text-gray-900">{order.Items?.length || 0} sản phẩm</div>
                                                    <div className="text-xs text-gray-500">
                                                        {order.Items?.reduce((sum, item) => sum + item.Quantity, 0) || 0} món
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="text-sm font-medium text-gray-900">{formatCurrency(order.TotalAmount)}</div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span
                                                        className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${statusBadge.bg} ${statusBadge.text}`}
                                                    >
                                                        <span className="mr-1">{statusBadge.icon}</span>
                                                        {statusBadge.label}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span
                                                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${paymentBadge.bg} ${paymentBadge.text}`}
                                                    >
                                                        {paymentBadge.label}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex items-center justify-center space-x-2">
                                                        {order.OverallStatus === "Pending" && (
                                                            <button
                                                                onClick={() => handleStatusUpdate(order.OrderID, "Processing")}
                                                                className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
                                                            >
                                                                Xử lý
                                                            </button>
                                                        )}
                                                        {order.OverallStatus === "Processing" && (
                                                            <button
                                                                onClick={() => handleStatusUpdate(order.OrderID, "Shipped")}
                                                                className="text-purple-600 hover:text-purple-800 font-medium text-sm transition-colors"
                                                            >
                                                                Giao hàng
                                                            </button>
                                                        )}
                                                        {order.OverallStatus === "Shipped" && (
                                                            <button
                                                                onClick={() => handleStatusUpdate(order.OrderID, "Delivered")}
                                                                className="text-green-600 hover:text-green-800 font-medium text-sm transition-colors"
                                                            >
                                                                Hoàn thành
                                                            </button>
                                                        )}
                                                        <Link
                                                            href={`/seller/orders/${order.OrderID}`}
                                                            className="text-orange-600 hover:text-orange-800 font-medium text-sm transition-colors"
                                                        >
                                                            Chi tiết
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="px-6 py-4 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                    Hiển thị <span className="font-medium">{startIndex + 1}</span> đến{" "}
                                    <span className="font-medium">{Math.min(startIndex + itemsPerPage, filteredOrders.length)}</span>{" "}
                                    trong tổng số <span className="font-medium">{filteredOrders.length}</span> đơn hàng
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Trước
                                    </button>
                                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                        let page
                                        if (totalPages <= 5) {
                                            page = i + 1
                                        } else if (currentPage <= 3) {
                                            page = i + 1
                                        } else if (currentPage >= totalPages - 2) {
                                            page = totalPages - 4 + i
                                        } else {
                                            page = currentPage - 2 + i
                                        }
                                        return (
                                            <button
                                                key={page}
                                                onClick={() => setCurrentPage(page)}
                                                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${currentPage === page
                                                        ? "bg-orange-500 text-white"
                                                        : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                                                    }`}
                                            >
                                                {page}
                                            </button>
                                        )
                                    })}
                                    <button
                                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Sau
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
