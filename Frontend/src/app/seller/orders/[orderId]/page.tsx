'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Swal from 'sweetalert2';
import OrderDetails from '../../components/seller/OrderDetails';
import { Order } from '@/types/order';

export default function OrderDetailsPage() {
    const { orderId } = useParams();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrder = async () => {
            const token = localStorage.getItem('authToken');
            if (!token) {
                setError('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
                setLoading(false);
                Swal.fire({
                    title: 'Lỗi!',
                    text: 'Vui lòng đăng nhập lại.',
                    icon: 'error',
                    confirmButtonText: 'Đi đến đăng nhập',
                }).then(() => window.location.href = '/login');
                return;
            }

            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`/api/seller/orders/${orderId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || `Lỗi: ${response.status}`);
                }

                const data = await response.json();
                if (!data.data) {
                    throw new Error('Dữ liệu đơn hàng không hợp lệ.');
                }

                console.log('Order data fetched:', data.data); // Debug
                setOrder(data.data);
            } catch (err: any) {
                setError(err.message || 'Đã xảy ra lỗi khi tải đơn hàng.');
                Swal.fire({
                    title: 'Lỗi!',
                    text: err.message || 'Không thể tải thông tin đơn hàng.',
                    icon: 'error',
                    confirmButtonText: 'OK',
                });
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [orderId]); // Chỉ re-fetch khi orderId thay đổi

    const updateStatus = async (status: string) => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            setError('Không tìm thấy token xác thực.');
            Swal.fire({
                title: 'Lỗi!',
                text: 'Vui lòng đăng nhập lại.',
                icon: 'error',
                confirmButtonText: 'Đi đến đăng nhập',
            }).then(() => window.location.href = '/login');
            return;
        }

        try {
            const response = await fetch(`/api/seller/orders/${orderId}/status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Cập nhật thất bại: ${response.status}`);
            }

            setOrder((prev) => (prev ? { ...prev, OverallStatus: status } : null));
            Swal.fire({
                title: 'Thành công!',
                text: 'Cập nhật trạng thái thành công.',
                icon: 'success',
                confirmButtonText: 'OK',
            });
        } catch (err: any) {
            setError(err.message || 'Cập nhật trạng thái thất bại.');
            Swal.fire({
                title: 'Lỗi!',
                text: err.message || 'Không thể cập nhật trạng thái.',
                icon: 'error',
                confirmButtonText: 'OK',
            });
        }
    };

    if (loading) return <div className="text-center text-gray-500">Đang tải...</div>;
    if (error) return <div className="text-center text-red-500">{error}</div>;
    if (!order) return <div className="text-center text-gray-500">Không tìm thấy đơn hàng.</div>;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Chi tiết đơn hàng {order.OrderCode}</h1>
            <OrderDetails order={order} updateStatus={updateStatus} />
        </div>
    );
}