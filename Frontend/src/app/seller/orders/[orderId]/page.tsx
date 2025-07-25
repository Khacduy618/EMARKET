"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { format } from "date-fns"
import { vi } from "date-fns/locale"


import OrderDetailHeader from "../components/order-detail-header"
import OrderProductList from "../components/order-product-list"
import OrderPaymentDetails from "../components/order-payment-details"
import OrderShippingInfo from "../components/order-shipping-info"
import OrderCustomerInfo from "../components/order-customer-info"
import OrderActions from "../components/order-actions"
import LoadingSpinner from "../components/loading-spinner"
import ErrorMessage from "../components/error-message"

// --- INTERFACES ---
interface TransformedOrderDetail {
    orderId: number
    orderCode: string
    orderDate: string
    overallStatus: string
    shippingFullName: string
    shippingPhoneNumber: string
    notes: string | null
    totalAmount: number
    subtotalAmount: number
    shippingFee: number
    discountAmount: number
    shopSubtotal: number
    paymentMethod: string
    paymentStatus: string
    user?: {
        username: string
        email: string
    }
    address?: {
        street: string
        ward: string | null
        district: string
        city: string
    }
    orderItems: Array<{
        orderItemId: number
        quantity: number
        priceAtPurchase: number
        subtotal: number
        isFlashSaleItem: boolean
        variant?: {
            variantId: number
            sku: string
            imageUrl: string | null
            product?: {
                productId: number
                name: string
            }
        }
    }>
}

export default function OrderDetailsPage({ params }: { params: { orderId: string } }) {
    const { orderId } = params
    const [order, setOrder] = useState<TransformedOrderDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (orderId) {
            const fetchOrderDetails = async () => {
                setLoading(true)
                setError(null)
                try {
                    const token = localStorage.getItem("authToken")
                    if (!token) throw new Error("Authentication token not found.")

                    const response = await axios.get(`http://localhost:8001/api/seller/orders/${orderId}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    })
                    setOrder(response.data)
                } catch (err: any) {
                    setError(err.response?.data?.message || "Không thể tải dữ liệu đơn hàng.")
                } finally {
                    setLoading(false)
                }
            }

            fetchOrderDetails()
        }
    }, [orderId])

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount)

    const formatDate = (dateString: string) => format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: vi })

    if (loading) {
        return <LoadingSpinner />
    }

    if (error) {
        return <ErrorMessage error={error} />
    }

    if (!order) {
        return <ErrorMessage error="Không tìm thấy đơn hàng." />
    }

    const fullAddress = `${order.address?.street}, ${order.address?.ward ? order.address.ward + ", " : ""}${order.address?.district}, ${order.address?.city}`

    return (
        <div className="bg-gray-50 min-h-screen p-4">
            <div className="max-w-7xl mx-auto">
                <OrderDetailHeader order={order} formatDate={formatDate} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Product & Payment Details */}
                    <div className="lg:col-span-2 space-y-6">
                        <OrderProductList orderItems={order.orderItems} formatCurrency={formatCurrency} />
                        <OrderPaymentDetails order={order} formatCurrency={formatCurrency} />
                    </div>

                    {/* Right Column: Info & Actions */}
                    <div className="space-y-6">
                        <OrderShippingInfo
                            shippingFullName={order.shippingFullName}
                            shippingPhoneNumber={order.shippingPhoneNumber}
                            fullAddress={fullAddress}
                            notes={order.notes}
                        />
                        <OrderCustomerInfo user={order.user} />
                        <OrderActions status={order.overallStatus} />
                    </div>
                </div>
            </div>
        </div>
    )
}
