'use client';

import { useState } from 'react';
import { ReturnRequest } from '../../../../types/order';

interface ReturnRequestListProps {
    returnRequests: ReturnRequest[];
}

export default function ReturnRequestList({ returnRequests }: ReturnRequestListProps) {
    const [note, setNote] = useState('');
    const [resolutionType, setResolutionType] = useState('');
    const [refundAmount, setRefundAmount] = useState('');

    const updateReturnRequest = async (returnRequestId: number, status: string) => {
        const response = await fetch(`/api/seller/orders/return-requests/${returnRequestId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify({
                status,
                sellerNote: note,
                resolutionType,
                refundAmount: parseFloat(refundAmount) || null,
            }),
        });

        if (response.ok) {
            alert('Cập nhật yêu cầu trả hàng thành công');
            window.location.reload();
        } else {
            alert('Cập nhật yêu cầu trả hàng thất bại');
        }
    };

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white border">
                <thead>
                    <tr>
                        <th className="px-4 py-2 border">Mã yêu cầu</th>
                        <th className="px-4 py-2 border">Mã đơn hàng</th>
                        <th className="px-4 py-2 border">Sản phẩm</th>
                        <th className="px-4 py-2 border">Lý do</th>
                        <th className="px-4 py-2 border">Trạng thái</th>
                        <th className="px-4 py-2 border">Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {returnRequests.map((request) => (
                        <tr key={request.ReturnRequestID}>
                            <td className="px-4 py-2 border">{request.ReturnRequestID}</td>
                            <td className="px-4 py-2 border">{request.order?.OrderCode}</td>
                            <td className="px-4 py-2 border">{request.orderItem?.productVariant.product.Name}</td>
                            <td className="px-4 py-2 border">{request.ReasonDescription}</td>
                            <td className="px-4 py-2 border">{request.Status}</td>
                            <td className="px-4 py-2 border">
                                <select
                                    onChange={(e) => updateReturnRequest(request.ReturnRequestID, e.target.value)}
                                    className="border p-2"
                                >
                                    <option value="">Chọn hành động</option>
                                    <option value="SellerApproved_WaitForReturn">Phê duyệt - Chờ trả hàng</option>
                                    <option value="SellerReceivedProduct">Đã nhận sản phẩm</option>
                                    <option value="RefundProcessing">Xử lý hoàn tiền</option>
                                    <option value="Refunded">Hoàn tiền</option>
                                    <option value="SellerRejected">Từ chối</option>
                                </select>
                                <input
                                    type="text"
                                    placeholder="Ghi chú"
                                    onChange={(e) => setNote(e.target.value)}
                                    className="border p-2 mt-2"
                                />
                                <select
                                    onChange={(e) => setResolutionType(e.target.value)}
                                    className="border p-2 mt-2"
                                >
                                    <option value="">Loại giải quyết</option>
                                    <option value="FullRefund">Hoàn tiền đầy đủ</option>
                                    <option value="PartialRefund">Hoàn tiền một phần</option>
                                    <option value="ProductExchange">Đổi sản phẩm</option>
                                    <option value="StoreCredit">Tín dụng cửa hàng</option>
                                </select>
                                <input
                                    type="number"
                                    placeholder="Số tiền hoàn"
                                    onChange={(e) => setRefundAmount(e.target.value)}
                                    className="border p-2 mt-2"
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}