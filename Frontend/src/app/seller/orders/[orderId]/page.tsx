"use client";

import { useState, useEffect, use } from "react";
import axios from "axios";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import Swal from "sweetalert2";
import ProofImagesGallery from "../components/proof-images-gallery";
import OrderDetailHeader from "../components/order-detail-header";
import OrderProductList from "../components/order-product-list";
import OrderPaymentDetails from "../components/order-payment-details";
import OrderShippingInfo from "../components/order-shipping-info";
import OrderCustomerInfo from "../components/order-customer-info";
import OrderActions from "../components/order-actions";
import LoadingSpinner from "../components/loading-spinner";
import ErrorMessage from "../components/error-message";
import { API_URL } from "@/lib/config";

// --- INTERFACES ---
interface OrderItem {
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
}

interface Address {
    street: string;
    ward: string | null;
    district: string;
    city: string;
}

interface User {
    fullname: string;
    email: string;
}

interface TransformedOrderDetail {
    sellerOrderId: number;
    orderCode: string;
    orderDate: string;
    overallStatus: string;
    shippingFullName: string;
    shippingPhoneNumber: string;
    notes: string | null;
    totalAmount: number;
    shippingFee: number;
    shopSubtotal: number;
    paymentMethod: string;
    paymentStatus: string;
    user?: User;
    address?: Address;
    orderItems: OrderItem[];
    proof_image1?: string | null;
    proof_image2?: string | null;
    reason?: string | null;
    delivery_date?: string | null;
    ShopVoucherDiscount: number;
    DeliveredAt?: string | null;
}

export default function OrderDetailsPage({ params }: { params: Promise<{ orderId: string }> }) {
    const { orderId } =  use(params);
    const [order, setOrder] = useState<TransformedOrderDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (orderId) {
            const fetchOrderDetails = async () => {
                setLoading(true);
                setError(null);
                try {
                    

                    const response = await axios.get(
                        `${API_URL}/seller/orders/${orderId}`,
                        {
                            headers: {'Content-Type' : 'application/json' },
                            withCredentials: true,
                        }
                    );

                    const data = response.data;
                    console.log(">>>>>>>data : ", data); // Log để kiểm tra dữ liệu
                    setOrder(data); // Ánh xạ trực tiếp vì cấu trúc JSON đã khớp
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

    const formatDate = (dateString: string) =>
        format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: vi });

    const handleConfirmOrder = async () => {
        if (!order) return;
        try {

            await axios.put(
                `${API_URL}/seller/orders/${orderId}/confirm`,
                {},
                { headers: { "Content-Type": "application/json" }, withCredentials: true }
            );
            setOrder((prev) => (prev ? { ...prev, overallStatus: "Preparing" } : null));
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

            await axios.put(
                `${API_URL}/seller/orders/${orderId}/cancel`,
                {},
                { headers: { 'Content-Type' : 'application/json' }, withCredentials: true }
            );
            setOrder((prev) => (prev ? { ...prev, overallStatus: "Cancelled" } : null));
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

    const fullAddress = `${order.address?.street}, ${order.address?.ward ? order.address.ward + ", " : ""
        }${order.address?.district}, ${order.address?.city}`;

    return (
        <div className="bg-gray-50 min-h-screen p-4">
            <div className="max-w-7xl mx-auto">
                <OrderDetailHeader
                    order={order}
                    formatDate={formatDate}
                    sellerOrderId={order.sellerOrderId} // Truyền sellerOrderId thay vì orderId
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Product & Payment Details */}
                    <div className="lg:col-span-2 space-y-6">
                        <OrderProductList
                            orderItems={order.orderItems}
                            formatCurrency={formatCurrency}
                        />
                        <OrderPaymentDetails
                            order={order}
                            formatCurrency={formatCurrency}
                        />
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

                        {order.overallStatus === "Delivered" &&
                            (order.proof_image1 || order.proof_image2) && (
                                <div className="bg-white border border-gray-200 p-4 rounded-lg">
                                    <h4 className="text-md font-medium mb-2 text-gray-800">
                                        Thông tin giao hàng
                                    </h4>
                                {order.DeliveredAt && (
                                        <p className="text-gray-600 mb-2">
                                            <span className="font-medium">Ngày giao hàng:</span>{" "}
                                        {formatDate(order.DeliveredAt)}
                                        </p>
                                    )}
                                    <ProofImagesGallery
                                        proof_image1={order.proof_image1}
                                        proof_image2={order.proof_image2}
                                    />
                                </div>
                            )}

                        {/* Khối lý do hủy nếu trạng thái là CancelledByUser */}
                        {order.overallStatus === "Failed" && order.reason && (
                            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                                <h4 className="text-md font-medium mb-2 text-yellow-800">
                                    Lý do hủy đơn:
                                </h4>
                                <p className="text-yellow-700">{order.reason}</p>
                            </div>
                        )}
                        <OrderActions
                            status={order.overallStatus}
                            orderId={order.sellerOrderId} // Sử dụng sellerOrderId thay vì orderId
                            onConfirm={handleConfirmOrder}
                            onCancel={handleCancelOrder}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}