'use client';

import Link from 'next/link';
import { Order } from '../../../../types/order';

interface OrderListProps {
    orders: Order[];
}

export default function OrderList({ orders }: OrderListProps) {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white border">
                <thead>
                    <tr>
                        <th className="px-4 py-2 border">Mã đơn hàng</th>
                        <th className="px-4 py-2 border">Ngày đặt</th>
                        <th className="px-4 py-2 border">Tổng tiền</th>
                        <th className="px-4 py-2 border">Trạng thái</th>
                        <th className="px-4 py-2 border">Thanh toán</th>
                        <th className="px-4 py-2 border">Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map((order) => (
                        <tr key={order.OrderID}>
                            <td className="px-4 py-2 border">{order.OrderCode}</td>
                            <td className="px-4 py-2 border">{new Date(order.OrderDate).toLocaleDateString()}</td>
                            <td className="px-4 py-2 border">{order.TotalAmount} VNĐ</td>
                            <td className="px-4 py-2 border">{order.OverallStatus}</td>
                            <td className="px-4 py-2 border">{order.PaymentStatus}</td>
                            <td className="px-4 py-2 border">
                                <Link href={`/seller-dashboard/orders/${order.OrderID}`} className="text-blue-500">
                                    Xem chi tiết
                                </Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}