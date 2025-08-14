"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import Swal from "sweetalert2";

import OrderDetailHeader from "../components/order-detail-header";
import OrderProductList from "../components/order-product-list";
import OrderPaymentDetails from "../components/order-payment-details";
import OrderShippingInfo from "../components/order-shipping-info";
import OrderCustomerInfo from "../components/order-customer-info";
import OrderActions from "../components/order-actions";
import LoadingSpinner from "../components/loading-spinner";
import ErrorMessage from "../components/error-message";
import { getAuthToken } from "@/services/api";
import { API_URL } from "@/lib/config";

// --- INTERFACES ---
interface TransformedOrderDetail {
    orderId: number;
    orderCode: string;
    orderDate: string;
    overallStatus: string;
    shippingFullName: string;
    shippingPhoneNumber: string;
    notes: string | null;
    totalAmount: number;
    subtotalAmount: number;
    shippingFee: number;
    discountAmount: number;
    shopSubtotal: number;
    paymentMethod: string;
    paymentStatus: string;
    user?: {
        username: string;
        email: string;
    };
    address?: {
        street: string;
        ward: string | null;
        district: string;
        city: string;
    };
    orderItems: Array<{
        orderItemId: number;
        quantity: number;
        priceAtPurchase: number;
        subtotal: number;
        isFlashSaleItem: boolean;
        variant?: {
            variantId: number;
            sku: string;
            imageUrl: string | null;
            product?: {
                productId: number;
                name: string;
            };
        };
    }>;
}

export default function OrderDetailsPage() {
    const params = useParams();
    const orderId = params.orderId as string; 
    const [order, setOrder] = useState<TransformedOrderDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        console.log("Order ID from params:", orderId); // Debug
        if (orderId) {
            const fetchOrderDetails = async () => {
                setLoading(true);
                setError(null);
                try {
                    const token = getAuthToken();
                    if (!token) throw new Error("Authentication token not found.");

                    const response = await axios.get(`${API_URL}/seller/orders/${orderId}`, {
                        headers: {"Content-Type": "application/json"},
                    });
                    setOrder(response.data);
                } catch (err: any) {
                    setError(err.response?.data?.message || "Không thể tải dữ liệu đơn hàng.");
                } finally {
                    setLoading(false);
                }
            };

            fetchOrderDetails();
        } else {
            setError("Order ID không hợp lệ.");
        }
    }, [orderId]);

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

    const formatDate = (dateString: string) => format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: vi });

    const handleConfirmOrder = async () => {
        if (!order) return;
        try {
            const token = getAuthToken();
            if (!token) throw new Error("Authentication token not found.");

            await axios.put(
                `${API_URL}/seller/orders/${orderId}/confirm`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setOrder((prev) => prev ? { ...prev, overallStatus: "Preparing" } : null);
            Swal.fire({
                icon: "success",
                title: "Thành công!",
                text: "Đơn hàng đã được xác nhận và đang chuẩn bị.",
                confirmButtonText: "OK",
            });
        } catch (err: any) {
            Swal.fire({
                icon: "error",
                title: "Lỗi!",
                text: err.response?.data?.message || "Không thể xác nhận đơn hàng.",
                confirmButtonText: "OK",
            });
        }
    };

    const handleCancelOrder = async () => {
        if (!order) return;
        try {
            const token = getAuthToken();
            if (!token) throw new Error("Authentication token not found.");

            await axios.put(
                `${API_URL}/seller/orders/${orderId}/cancel`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setOrder((prev) => prev ? { ...prev, overallStatus: "Cancelled" } : null);
            Swal.fire({
                icon: "success",
                title: "Thành công!",
                text: "Đơn hàng đã được hủy.",
                confirmButtonText: "OK",
            });
        } catch (err: any) {
            Swal.fire({
                icon: "error",
                title: "Lỗi!",
                text: err.response?.data?.message || "Không thể hủy đơn hàng.",
                confirmButtonText: "OK",
            });
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return <ErrorMessage error={error} />;
    }

    if (!order) {
        return <ErrorMessage error="Không tìm thấy đơn hàng." />;
    }

    const fullAddress = `${order.address?.street}, ${order.address?.ward ? order.address.ward + ", " : ""}${order.address?.district}, ${order.address?.city}`;

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
                        <OrderActions
                            status={order.overallStatus}
                            orderId={orderId} // Truyền orderId
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}