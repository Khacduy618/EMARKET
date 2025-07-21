'use client';

import { useState, useEffect } from 'react';
import ReturnRequestList from '../../components/seller/ReturnRequestList';
import { ReturnRequest } from '../../../../types/order';

export default function ReturnRequestsPage() {
    const [returnRequests, setReturnRequests] = useState<ReturnRequest[]>([]);
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        const fetchReturnRequests = async () => {
            const query = new URLSearchParams({ status: statusFilter }).toString();
            const response = await fetch(`/api/seller/orders/return-requests?${query}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            const data = await response.json();
            setReturnRequests(data.data);
        };

        fetchReturnRequests();
    }, [statusFilter]);

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Quản lý yêu cầu trả hàng</h1>
            <div className="mb-4">
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border p-2"
                >
                    <option value="">Tất cả trạng thái</option>
                    <option value="PendingSellerApproval">Chờ phê duyệt</option>
                    <option value="SellerApproved_WaitForReturn">Đã phê duyệt - Chờ trả hàng</option>
                    <option value="SellerReceivedProduct">Đã nhận sản phẩm</option>
                    <option value="RefundProcessing">Đang xử lý hoàn tiền</option>
                    <option value="Refunded">Đã hoàn tiền</option>
                    <option value="SellerRejected">Đã từ chối</option>
                </select>
            </div>
            <ReturnRequestList returnRequests={returnRequests} />
        </div>
    );
}