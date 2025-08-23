
'use client'; // <-- QUAN TRỌNG: Chuyển thành Client Component

import React, { useState, useEffect } from 'react';
import { useParams, notFound } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, User, Phone, MapPin, Printer, Package, Truck, CheckCircle, Clock, XCircle, AlertCircle, FileText, ShoppingCart, CreditCard, Home, Loader2
} from 'lucide-react';
import { getFullImageUrl } from '@/services/api';
import { API_URL } from '@/lib/config';

// --- BẠN CÓ THỂ ĐẶT CÁC INTERFACE NÀY VÀO MỘT FILE CHUNG (VÍ DỤ: src/types/order.ts) ---
interface User { UserID: number; FullName: string; Email: string; avatar?: string; }
interface Product { name: string; image: string; sku: string; }
interface OrderItem { OrderItemID: number; VariantID: number; Quantity: number; PriceAtPurchase: number; Subtotal: number; product?: Product; }
interface Address { fullAddress: string; }
interface Order { OrderID: number; OrderCode: string; UserID: number; OrderDate: string; TotalAmount: number; SubtotalAmount: number; ShippingFee: number; DiscountAmount: number; ShippingAddressID: number; ShippingFullName: string; ShippingPhoneNumber: string; Notes: string | null; PaymentMethod: 'COD' | 'Paypal' | 'VNPay'; PaymentStatus: 'Pending' | 'Paid' | 'Failed' | 'Refunded' | 'PartiallyRefunded'; OverallStatus: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'CancelledByBuyer' | 'CancelledBySeller' | 'Returned' | 'ReturnInProgress' | 'Completed' | 'Rated'; user: User; items: OrderItem[]; shippingAddress?: Address; }

// --- CÁC HÀM TIỆN ÍCH ---
const formatCurrency = (amount: number): string => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
const formatDateTime = (dateString: string): string => new Date(dateString).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const statusConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
    'Pending': { label: 'Chờ xử lý', icon: <Clock className="w-4 h-4"/>, color: 'text-yellow-600' },
    'Processing': { label: 'Đang xử lý', icon: <Package className="w-4 h-4"/>, color: 'text-blue-600' },
    'Shipped': { label: 'Đang giao', icon: <Truck className="w-4 h-4"/>, color: 'text-purple-600' },
    'Delivered': { label: 'Đã giao', icon: <CheckCircle className="w-4 h-4"/>, color: 'text-green-600' },
    'Completed': { label: 'Hoàn thành', icon: <CheckCircle className="w-4 h-4"/>, color: 'text-green-600' },
    'Rated': { label: 'Đã đánh giá', icon: <CheckCircle className="w-4 h-4"/>, color: 'text-green-600' },
    'CancelledByBuyer': { label: 'Khách hủy', icon: <XCircle className="w-4 h-4"/>, color: 'text-red-600' },
    'CancelledBySeller': { label: 'Shop hủy', icon: <XCircle className="w-4 h-4"/>, color: 'text-red-600' },
    'Returned': { label: 'Đã trả hàng', icon: <FileText className="w-4 h-4"/>, color: 'text-gray-600' },
    'ReturnInProgress': { label: 'Đang trả hàng', icon: <FileText className="w-4 h-4"/>, color: 'text-gray-600' },
    'Default': { label: 'Không xác định', icon: <AlertCircle className="w-4 h-4"/>, color: 'text-gray-600' },
};
const StatusBadge = ({ status }: { status: string }) => {
    const config = statusConfig[status] || { ...statusConfig['Default'], label: status };
    const colorMap: Record<string, string> = { 'text-yellow-600': 'bg-yellow-50 border-yellow-200', 'text-blue-600': 'bg-blue-50 border-blue-200', 'text-purple-600': 'bg-purple-50 border-purple-200', 'text-green-600': 'bg-green-50 border-green-200', 'text-red-600': 'bg-red-50 border-red-200', 'text-gray-600': 'bg-gray-50 border-gray-200' };
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border ${colorMap[config.color]} ${config.color}`}>
            {config.icon} {config.label}
        </span>
    );
};
// Các component con có thể giữ nguyên hoặc tách ra file riêng
const OrderTimeline = ({ currentStatus }: { currentStatus: Order['OverallStatus'] }) => { /* Giữ nguyên code component này */ };

// --- COMPONENT CHÍNH ---
export default function OrderDetailPage() {
    const params = useParams();
    const orderId = params.id as string;

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!orderId) return;

        const fetchOrderDetails = async () => {
            setLoading(true);
            setError(null);
            
            const apiBaseUrl = API_URL;
            if (!apiBaseUrl) {
                setError("Lỗi cấu hình: API base URL chưa được thiết lập.");
                setLoading(false);
                return;
            }
            
            try {
                // Fetch trực tiếp đến backend Laravel từ trình duyệt
                const response = await fetch(`${apiBaseUrl}/admin/orders/${orderId}`, {
                    method: 'GET',
                    headers: { 'Accept': 'application/json' },
                    credentials: 'include', // Quan trọng để gửi cookie
                });
                console.log('data:',response)
                if (!response.ok) {
                    if (response.status === 404) throw new Error('Không tìm thấy đơn hàng.');
                    if (response.status === 401 || response.status === 403) throw new Error('Bạn không có quyền xem đơn hàng này.');
                    throw new Error('Không thể tải chi tiết đơn hàng.');
                }

                const result = await response.json();
                if (result && result.data) {
                    setOrder(result.data);
                } else {
                    throw new Error("Dữ liệu API trả về không đúng định dạng.");
                }

            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchOrderDetails();
    }, [orderId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                <span className="ml-3">Đang tải chi tiết đơn hàng...</span>
            </div>
        );
    }

    if (error) {
        return <div className="text-center py-20 text-red-600 bg-red-50">{error}</div>;
    }

    if (!order) {
        return <div className="text-center py-20 text-gray-500">Không tìm thấy dữ liệu đơn hàng.</div>;
    }

    // --- PHẦN GIAO DIỆN (JSX) ---
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="max-w-7xl mx-auto p-4 md:p-6">
            <div className="flex items-center justify-between mb-6">
              <Link href="/admin/orders" className="flex items-center gap-2 text-sm font-medium text-orange-600 hover:text-orange-700">
                <ArrowLeft className="w-5 h-5" /> Quay lại danh sách
              </Link>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">Đặt lúc: {formatDateTime(order.OrderDate)}</span>
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
                    <Printer className="w-4 h-4" /> In
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6 flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-500">Mã đơn hàng</p>
                    <p className="text-2xl font-bold font-mono text-gray-800">{order.OrderCode}</p>
                </div>
                <StatusBadge status={order.OverallStatus}/>
                
            </div>
            
            {/* ... Phần còn lại của giao diện JSX của bạn ... */}
            {/* Ví dụ: <OrderTimeline currentStatus={order.OverallStatus} /> */}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Danh sách sản phẩm */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                      <div className="p-6 border-b border-gray-200 flex items-center gap-3">
                        <ShoppingCart className="w-6 h-6 text-orange-500" />
                        <h3 className="text-lg font-semibold text-gray-800">Sản phẩm trong đơn ({order.items.length})</h3>
                      </div>
                      <div className="divide-y divide-gray-200">
                        {order.items.map(item => (
                          <div key={item.OrderItemID} className="p-4 sm:p-6 flex items-start gap-4 sm:gap-6">
                            <img src={getFullImageUrl(item.product?.image) } alt={item.product?.name} className="w-20 h-20 object-cover rounded-lg border border-gray-200 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="font-semibold text-gray-800 leading-tight">{item.product?.name || `Sản phẩm (Variant ID: ${item.VariantID})`}</p>
                              <p className="text-sm text-gray-500 mt-1">SKU: {item.product?.sku || 'N/A'}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-800">{formatCurrency(item.PriceAtPurchase)}</p>
                              <p className="text-sm text-gray-500">x {item.Quantity}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
            
            {/* Thanh toán */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
               <div className="flex items-center gap-3 mb-4">
                 <CreditCard className="w-6 h-6 text-orange-500" />
                 <h3 className="text-lg font-semibold text-gray-800">Chi tiết thanh toán</h3>
              </div>
              <div className="w-full max-w-md ml-auto space-y-3">
                <div className="flex justify-between text-gray-600"><p>Tổng phụ:</p><p>{formatCurrency(order.SubtotalAmount)}</p></div>
                <div className="flex justify-between text-gray-600"><p>Phí vận chuyển:</p><p>{formatCurrency(order.ShippingFee)}</p></div>
                <div className="flex justify-between text-gray-600"><p>Giảm giá:</p><p className="text-green-600">- {formatCurrency(order.DiscountAmount)}</p></div>
                <hr className="my-2 border-dashed"/>
                <div className="flex justify-between text-xl font-bold text-gray-900"><p>Tổng cộng:</p><p className="text-orange-600">{formatCurrency(order.TotalAmount)}</p></div>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 border-b border-gray-200 pb-4 mb-4">
                 <Home className="w-6 h-6 text-orange-500" />
                 <h3 className="text-lg font-semibold text-gray-800">Địa chỉ giao hàng</h3>
              </div>
              <div className="space-y-2 text-sm text-gray-700">
                  <p className="flex items-center gap-3"><User className="w-4 h-4 text-gray-400" /> {order.ShippingFullName}</p>
                  <p className="flex items-center gap-3"><Phone className="w-4 h-4 text-gray-400" /> {order.ShippingPhoneNumber}</p>
                  <p className="flex items-start gap-3"><MapPin className="w-4 h-4 mt-0.5 text-gray-400" /> {order.shippingAddress?.fullAddress || `Không có chi tiết địa chỉ (ID: ${order.ShippingAddressID})`}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 border-b border-gray-200 pb-4 mb-4">
                 <User className="w-6 h-6 text-orange-500" />
                 <h3 className="text-lg font-semibold text-gray-800">Thông tin người mua</h3>
              </div>
              <div className="flex items-center gap-4">
                  <img className="w-12 h-12 rounded-full object-cover border-2 border-gray-200" src={getFullImageUrl(order.user.avatar)} alt="Avatar"/>
                  <div>
                    <p className="font-semibold text-gray-900">{order.user.FullName}</p>
                    <p className="text-sm text-gray-500">{order.user.Email}</p>
                  </div>
              </div>
            </div>
            
            {order.Notes && (
                 <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Ghi chú của khách</h3>
                    <p className="text-gray-600 italic bg-yellow-50 p-3 rounded-lg border border-yellow-200">"{order.Notes}"</p>
                 </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}