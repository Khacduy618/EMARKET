'use client';
import React from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { ReturnRequest } from '@/types/return-request';
import StatusBadge from './StatusBadge';
import { API_URL } from '@/lib/config';
import { getStorageImageUrl } from '@/services/api';


// --- Helper Function ---
// Hàm để định dạng số thành tiền tệ VND
const formatCurrency = (amount: string | number) => {
    const numberAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(numberAmount);
};


// --- Component Props ---
interface ReturnRequestTableProps {
    requests: ReturnRequest[];
}


// --- Main Component ---
const ReturnRequestTable: React.FC<ReturnRequestTableProps> = ({ requests }) => {
    if (!Array.isArray(requests) || requests.length === 0) {
        return <div className="text-center py-10 text-gray-500">Không có yêu cầu nào.</div>;
    }


    return (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        {/* THAY ĐỔI 1: Gộp thông tin sản phẩm và đơn hàng vào một cột */}
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Sản phẩm & Đơn hàng
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Người Mua
                        </th>
                        {/* THAY ĐỔI 2: Gộp lý do và giá trị */}
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Lý do & Giá trị
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Ngày Yêu Cầu
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Trạng Thái
                        </th>
                        <th scope="col" className="relative px-6 py-3">
                            <span className="sr-only">Hành Động</span>
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {requests.map((req) => (
                        <tr key={req.ReturnRequestID} className="hover:bg-gray-50">
                            {/* THAY ĐỔI 3: Hiển thị thông tin chi tiết sản phẩm và đơn hàng */}
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 h-16 w-16">
                                        <img
                                            className="h-16 w-16 rounded object-cover"
                                            // LOGIC PHẢI NẰM Ở ĐÂY
                                            src={
                                                req.order_item.variant.ImageURL
                                                    ? getStorageImageUrl(req.order_item.variant.ImageURL)
                                                    : '/images/placeholder.png'
                                            }
                                            alt={`Ảnh sp`}
                                        />
                                    </div>
                                    <div className="ml-4">
                                        <div className="text-sm font-medium text-gray-900 max-w-xs truncate" title={req.order_item.variant.product.Name}>
                                            {req.order_item.variant.product.Name}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            Số lượng: {req.order_item.Quantity}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            Shop Order: <span className="font-semibold">{req.seller_order.SellerOrderCode}</span>
                                        </div>
                                    </div>
                                </div>
                            </td>


                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {req.user.FullName}
                            </td>


                            {/* THAY ĐỔI 4: Hiển thị lý do và số tiền hoàn */}
                            <td className="px-6 py-4">
                                <div className="text-sm text-gray-900 max-w-xs truncate" title={req.ReasonDescription}>
                                    {req.ReasonDescription}
                                </div>
                                <div className="text-sm font-semibold text-red-600 mt-1">
                                    {formatCurrency(req.RefundAmount)}
                                </div>
                            </td>


                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {format(new Date(req.RequestedAt), 'dd/MM/yyyy HH:mm')}
                            </td>


                            <td className="px-6 py-4 whitespace-nowrap">
                                <StatusBadge status={req.Status} />
                            </td>


                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <Link
                                    href={`/seller/return-requests/${req.ReturnRequestID}`}
                                    className="text-indigo-600 hover:text-indigo-900"
                                >
                                    Xem chi tiết
                                </Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};


export default ReturnRequestTable;