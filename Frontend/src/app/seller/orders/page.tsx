// 1. Thêm "use client" ở đầu file để biến nó thành Client Component
"use client";

import axios from 'axios';
import { format } from 'date-fns';
import { useState, useEffect } from 'react';

// Interface Order không thay đổi
interface Order {
    OrderID: number;
    OrderCode: string;
    UserID: number;
    OrderDate: string;
    TotalAmount: number;
    SubtotalAmount: number;
    ShippingFee: number;
    DiscountAmount: number;
    ShippingAddressID: number;
    ShippingFullName: string;
    ShippingPhoneNumber: string;
    Notes: string | null;
    PaymentMethod: string;
    PaymentStatus: string;
    OverallStatus: string;
    PlatformVoucherCode: string | null;
}

export default function SellerOrders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // 2. Thêm state để quản lý đơn hàng được chọn cho modal
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem("authToken");
                if (!token) {
                    throw new Error("Authentication token not found. Please log in.");
                }
                const response = await axios.get('http://localhost:8001/api/seller/orders', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                });
                setOrders(response.data.orders || []);
            } catch (err: any) {
                setError(err.response?.data?.message || err.message || 'An unexpected error occurred.');
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    if (loading) {
        return <div className="text-center p-6">Loading orders...</div>;
    }

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Seller Orders</h1>
            {error ? (
                <p className="text-red-500 text-center">{error}</p>
            ) : orders.length === 0 ? (
                <p className="text-gray-500 text-center">No orders found.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Order ID</th>
                                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Customer</th>
                                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Total Amount</th>
                                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Status</th>
                                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Date</th>
                                {/* 3. Thêm cột Hành động */}
                                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => (
                                <tr key={order.OrderID} className="hover:bg-gray-50">
                                    <td className="py-2 px-4 border-b">
                                        <span className="font-mono text-blue-600">{order.OrderCode}</span>
                                    </td>
                                    <td className="py-2 px-4 border-b">
                                        <div>{order.ShippingFullName}</div>
                                        <div className="text-sm text-gray-500">{order.ShippingPhoneNumber}</div>
                                    </td>
                                    <td className="py-2 px-4 border-b font-semibold">
                                        {order.TotalAmount.toLocaleString('vi-VN')} ₫
                                    </td>
                                    <td className="py-2 px-4 border-b">
                                        <span className={`px-2 py-1 text-xs font-semibold text-white ${order.OverallStatus === 'Pending' ? 'bg-yellow-500' : 'bg-green-500'} rounded-full`}>
                                            {order.OverallStatus}
                                        </span>
                                    </td>
                                    <td className="py-2 px-4 border-b text-sm text-gray-600">
                                        {format(new Date(order.OrderDate), 'dd/MM/yyyy HH:mm')}
                                    </td>
                                    {/* 4. Thêm nút Xem chi tiết */}
                                    <td className="py-2 px-4 border-b">
                                        <button
                                            onClick={() => setSelectedOrder(order)}
                                            className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* 5. Render Modal nếu có một đơn hàng được chọn */}
            {selectedOrder && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    onClick={() => setSelectedOrder(null)} // Đóng modal khi click ra ngoài
                >
                    <div
                        className="bg-white p-8 rounded-lg shadow-xl max-w-2xl w-full"
                        onClick={(e) => e.stopPropagation()} // Ngăn việc click trong modal làm đóng modal
                    >
                        <h2 className="text-2xl font-bold mb-4">Order Details: {selectedOrder.OrderCode}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div><strong>Customer:</strong> {selectedOrder.ShippingFullName}</div>
                            <div><strong>Phone:</strong> {selectedOrder.ShippingPhoneNumber}</div>
                            <div><strong>Payment Method:</strong> {selectedOrder.PaymentMethod}</div>
                            <div><strong>Payment Status:</strong> {selectedOrder.PaymentStatus}</div>
                            <div><strong>Order Date:</strong> {format(new Date(selectedOrder.OrderDate), 'PPP p')}</div>
                            <div><strong>Overall Status:</strong> {selectedOrder.OverallStatus}</div>
                            <div className="col-span-1 md:col-span-2"><strong>Notes:</strong> {selectedOrder.Notes || 'N/A'}</div>
                            <hr className="col-span-1 md:col-span-2 my-2" />
                            <div><strong>Subtotal:</strong> {selectedOrder.SubtotalAmount.toLocaleString('vi-VN')} ₫</div>
                            <div><strong>Shipping Fee:</strong> {selectedOrder.ShippingFee.toLocaleString('vi-VN')} ₫</div>
                            <div><strong>Discount:</strong> -{selectedOrder.DiscountAmount.toLocaleString('vi-VN')} ₫</div>
                            <div className="font-bold"><strong>Total:</strong> {selectedOrder.TotalAmount.toLocaleString('vi-VN')} ₫</div>
                            <div className="col-span-1 md:col-span-2"><strong>Platform Voucher:</strong> {selectedOrder.PlatformVoucherCode || 'N/A'}</div>
                        </div>
                        <button
                            onClick={() => setSelectedOrder(null)}
                            className="mt-6 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}