"use client"

import { useState, useEffect, useCallback } from "react"
import axios from "axios"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

import OrderHeader from "./components/order-header"
import OrderSearch from "./components/order-search"
import OrderStatusTabs from "./components/order-status-tabs"
import OrderCard from "./components/order-card"
import OrderPagination from "./components/order-pagination"
import LoadingState from "./components/loading-state"
import ErrorState from "./components/error-state"
import EmptyState from "./components/empty-state"

// --- INTERFACES ---
interface SellerOrder {
    OrderID: number
    OrderCode: string
    OrderDate: string
    OverallStatus: string
    ShippingFullName: string
    TotalAmount: number
    shop_subtotal: number
    order_items?: Array<{
        OrderItemID: number
        Quantity: number
        Subtotal: number
        variant: {
            product: {
                Name: string
            }
        }
    }>
}

interface PaginationInfo {
    current_page: number
    last_page: number
    prev_page_url: string | null
    next_page_url: string | null
}

export default function SellerOrdersPage() {
    const [orders, setOrders] = useState<SellerOrder[]>([])
    const [pagination, setPagination] = useState<PaginationInfo | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")

    const fetchOrders = useCallback(async () => {
        setLoading(true)
        try {
            const token = localStorage.getItem("authToken")
            if (!token) {
                throw new Error("Authentication token not found. Please log in.")
            }

            const params = new URLSearchParams({
                page: currentPage.toString(),
                status: statusFilter,
                search: searchTerm,
            })

            const response = await axios.get(`http://localhost:8001/api/seller/orders?${params.toString()}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            })

            setOrders(response.data.data ?? [])
            const { data, ...paginationInfo } = response.data
            setPagination(paginationInfo)
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || "An unexpected error occurred.")
        } finally {
            setLoading(false)
        }
    }, [currentPage, statusFilter, searchTerm])

    useEffect(() => {
        fetchOrders()
    }, [fetchOrders])

    const handleSearch = (term: string) => {
        setSearchTerm(term)
        setCurrentPage(1)
    }

    const handleStatusFilter = (status: string) => {
        setStatusFilter(status)
        setCurrentPage(1)
    }

    const handleClearFilters = () => {
        setSearchTerm("")
        setStatusFilter("all")
        setCurrentPage(1)
    }

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount)

    const formatDate = (dateString: string) => format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: vi })

    if (loading) {
        return <LoadingState />
    }

    if (error) {
        return <ErrorState error={error} onRetry={fetchOrders} />
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto p-4">
                <OrderHeader />

                <OrderSearch searchTerm={searchTerm} onSearch={handleSearch} onRefresh={fetchOrders} />

                <OrderStatusTabs activeStatus={statusFilter} onStatusChange={handleStatusFilter} />

                <div className="space-y-4">
                    {orders.length > 0 ? (
                        orders.map((order) => (
                            <OrderCard key={order.OrderID} order={order} formatCurrency={formatCurrency} formatDate={formatDate} />
                        ))
                    ) : (
                        <EmptyState onClearFilters={handleClearFilters} />
                    )}
                </div>

                {pagination && pagination.last_page > 1 && (
                    <OrderPagination pagination={pagination} currentPage={currentPage} onPageChange={setCurrentPage} />
                )}
            </div>
        </div>
    )
}
