'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import OrderDetailContent from '../components/OrderDetailContent';
import { Order } from '@/types';
import { getAuthToken } from '@/services/api';
import { Loader2 } from 'lucide-react';
import { getDecodedXsrfToken } from '@/services/auth';
import { API_URL } from '@/lib/config';

export default function OrderIdPage() {
    const params = useParams();
    const orderId = params.orderId as string;

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!orderId) {
            setLoading(false);
            setError("Mã đơn hàng không hợp lệ.");
            return;
        }

        const fetchOrderDetail = async () => {
            setLoading(true);
            setError(null);
            const token = getAuthToken();
            if (!token) {
                setError("Vui lòng đăng nhập để xem đơn hàng.");
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`${API_URL}/orders/${orderId}`, {
                           method: 'GET', credentials: 'include', headers: { 'Accept': 'application/json' },
                });

                if (!response.ok) {
                    throw new Error(response.status === 404 ? 'Không tìm thấy đơn hàng.' : 'Không thể tải chi tiết đơn hàng.');
                }

                const data: Order = await response.json();

                // KIỂM TRA QUAN TRỌNG: Đảm bảo 'items' là một mảng
                if (!Array.isArray(data.items)) {
                    console.error("API Error: 'items' is not an array. Received:", data.items);
                    data.items = []; // Gán mảng rỗng để tránh lỗi crash UI
                }

                setOrder(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchOrderDetail();
    }, [orderId]);

    // === PHẦN XỬ LÝ RENDER AN TOÀN ===

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20 min-h-[60vh]">
                <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
                <p className="ml-4 text-lg">Đang tải chi tiết đơn hàng...</p>
            </div>
        );
    }

    if (error) {
        return <div className="text-center py-20 text-red-500 bg-gray-100">{error}</div>;
    }

    // KIỂM TRA CUỐI CÙNG TRƯỚC KHI RENDER
    // Điều này sẽ ngăn chặn lỗi 'map' của bạn.
    if (!order) {
        return <div className="text-center py-20 bg-gray-100">Không có dữ liệu đơn hàng để hiển thị.</div>;
    }

    // Nếu mọi thứ ổn, render component con với dữ liệu đã được xác thực
    return (
        <div className="flex-1 text-black bg-white">
            <OrderDetailContent order={order} />
        </div>
    );
}