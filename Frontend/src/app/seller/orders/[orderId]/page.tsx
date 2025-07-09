'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';

// Define the Order interface
interface Order {
    OrderID: number;
    OrderStatus: string;
    TotalPrice: number;
    CreatedAt: string;
    orderItems: {
        OrderItemID: number;
        VariantID: number;
        Quantity: number;
        Price: number;
        variant: {
            VariantID: number;
            Name: string;
            product: {
                ProductID: number;
                ProductName: string;
            };
        };
    }[];
    address: {
        AddressID: number;
        Street: string;
        City: string;
        Country: string;
        PostalCode: string;
    };
}

interface OrderDetailsModalProps {
    orderId: number;
}

export default function OrderDetailsModal({ orderId }: OrderDetailsModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [order, setOrder] = useState<Order | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const openModal = () => setIsOpen(true);
    const closeModal = () => {
        setIsOpen(false);
        setOrder(null);
        setError(null);
    };

    useEffect(() => {
        if (!isOpen) return;

        const fetchOrderDetails = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`http://localhost:8001/api/seller/orders/${orderId}`, {
                    headers: { Authorization: `Bearer ${document.cookie.split('; ').find(row => row.startsWith('authToken='))?.split('=')[1] || ''}` },
                });
                setOrder(response.data.order);
            } catch (err: any) {
                setError(err.response?.data?.message || 'Failed to fetch order details');
            } finally {
                setLoading(false);
            }
        };

        fetchOrderDetails();
    }, [isOpen, orderId]);

    return (
        <>
            <button
                onClick={openModal}
                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
            >
                View Details
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">Order Details - #{orderId}</h2>

                        {loading ? (
                            <p className="text-center">Loading...</p>
                        ) : error ? (
                            <p className="text-red-500 text-center">{error}</p>
                        ) : order ? (
                            <>
                                {/* Order Summary */}
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold mb-2">Order Summary</h3>
                                    <p><strong>Order ID:</strong> {order.OrderID}</p>
                                    <p><strong>Status:</strong> {order.OrderStatus}</p>
                                    <p><strong>Total Price:</strong> ${order.TotalPrice.toFixed(2)}</p>
                                    <p><strong>Date:</strong> {format(new Date(order.CreatedAt), 'PPP')}</p>
                                </div>

                                {/* Order Items */}
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold mb-2">Order Items</h3>
                                    <table className="min-w-full bg-gray-50 border border-gray-200">
                                        <thead>
                                            <tr className="bg-gray-100">
                                                <th className="py-2 px-4 border-b text-left">Product</th>
                                                <th className="py-2 px-4 border-b text-left">Variant</th>
                                                <th className="py-2 px-4 border-b text-left">Quantity</th>
                                                <th className="py-2 px-4 border-b text-left">Unit Price</th>
                                                <th className="py-2 px-4 border-b text-left">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {order.orderItems.map((item) => (
                                                <tr key={item.OrderItemID}>
                                                    <td className="py-2 px-4 border-b">{item.variant.product.ProductName}</td>
                                                    <td className="py-2 px-4 border-b">{item.variant.Name || 'N/A'}</td>
                                                    <td className="py-2 px-4 border-b">{item.Quantity}</td>
                                                    <td className="py-2 px-4 border-b">${item.Price.toFixed(2)}</td>
                                                    <td className="py-2 px-4 border-b">${(item.Quantity * item.Price).toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Shipping Address */}
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold mb-2">Shipping Address</h3>
                                    <p><strong>Street:</strong> {order.address.Street}</p>
                                    <p><strong>City:</strong> {order.address.City}</p>
                                    <p><strong>Country:</strong> {order.address.Country}</p>
                                    <p><strong>Postal Code:</strong> {order.address.PostalCode || 'N/A'}</p>
                                </div>
                            </>
                        ) : null}

                        {/* Close Button */}
                        <button
                            onClick={closeModal}
                            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}