'use client';

import { Order } from '../../../../types/order';

interface OrderDetailsProps {
    order: Order;
    updateStatus: (status: string) => void;
}

export default function OrderDetails({ order, updateStatus }: OrderDetailsProps) {
    return (
        <div className="bg-white p-4 border rounded">
            <h2 className="text-xl font-semibold mb-2">Thông tin đơn hàng</h2>
            <p><strong>Mã đơn hàng:</strong> {order.OrderCode}</p>
            <p><strong>Ngày đặt:</strong> {new Date(order.OrderDate).toLocaleDateString()}</p>
            <p><strong>Tổng tiền:</strong> {order.TotalAmount} VNĐ</p>
            <p><strong>Trạng thái:</strong> {order.OverallStatus}</p>
            <p><strong>Thanh toán:</strong> {order.PaymentStatus}</p>

            <h2 className="text-xl font-semibold mt-4 mb-2">Thông tin giao hàng</h2>
            <p><strong>Họ tên:</strong> {order.ShippingFullName}</p>
            <p><strong>Số điện thoại:</strong> {order.ShippingPhoneNumber}</p>
            <p><strong>Địa chỉ:</strong> {order.shipping_address?.Street}, {order.shipping_address?.Ward}, {order.shipping_address?.District}, {order.shipping_address?.City}</p>

            <h2 className="text-xl font-semibold mt-4 mb-2">Sản phẩm</h2>
            <table className="min-w-full bg-white border">
                <thead>
                    <tr>
                        <th className="px-4 py-2 border">Sản phẩm</th>
                        <th className="px-4 py-2 border">Số lượng</th>
                        <th className="px-4 py-2 border">Giá</th>
                        <th className="px-4 py-2 border">Tổng phụ</th>
                        <th className="px-4 py-2 border">Trạng thái trả hàng</th>
                    </tr>
                </thead>
                <tbody>
                    {order.orderItems.map((item) => (
                        <tr key={item.OrderItemID}>
                            <td className="px-4 py-2 border">{item.productVariant.product.Name}</td>
                            <td className="px-4 py-2 border">{item.Quantity}</td>
                            <td className="px-4 py-2 border">{item.PriceAtPurchase} VNĐ</td>
                            <td className="px-4 py-2 border">{item.Subtotal} VNĐ</td>
                            <td className="px-4 py-2 border">{item.ReturnStatus}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <h2 className="text-xl font-semibold mt-4 mb-2">Cập nhật trạng thái</h2>
            <select
                onChange={(e) => updateStatus(e.target.value)}
                className="border p-2"
                defaultValue={order.OverallStatus}
            >
                <option value="Pending">Chờ xử lý</option>
                <option value="Processing">Đang xử lý</option>
                <option value="Shipped">Đã giao</option>
                <option value="Delivered">Đã nhận</option>
                <option value="CancelledBySeller">Hủy bởi người bán</option>
            </select>
        </div>
    );
}