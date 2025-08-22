// In app/(main)/(account)/purchase/seller-order/[sellerOrderId]/page.tsx

'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Order } from '@/types';
import { API_URL } from '@/lib/config';
import { Loader2 } from 'lucide-react';
import OrderDetailContent from '../../components/OrderDetailContent';

export default function SellerOrderIdPage() {
    const params = useParams();
    // Bây giờ params.sellerOrderId sẽ có giá trị vì tên thư mục đã khớp
    const sellerOrderId = params.sellerOrderId as string; 

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!sellerOrderId) {
            // Dòng này có thể không cần thiết nữa, nhưng giữ lại để an toàn
            setError("Mã gói hàng không hợp lệ.");
            setLoading(false);
            return;
        }

        const fetchSellerOrderDetail = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`${API_URL}/seller-orders/${sellerOrderId}`, {
                    method: 'GET', credentials: 'include', headers: { 'Accept': 'application/json' },
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || (response.status === 404 ? 'Không tìm thấy gói hàng.' : 'Không thể tải chi tiết gói hàng.'));
                }
                const data: Order = await response.json();
                setOrder(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchSellerOrderDetail();
    }, [sellerOrderId]); // Dependency array đã đúng

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

    if (!order) {
        return <div className="text-center py-20 bg-gray-100">Không có dữ liệu đơn hàng để hiển thị.</div>;
    }

    return (
        <div className="flex-1 text-black bg-white">
            <OrderDetailContent order={order} />
        </div>
    );
}