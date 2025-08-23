'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
    ArrowLeft, User, Phone, MapPin, ShoppingCart, FileText, CreditCard, 
    Home, Loader2, Package, Truck, CheckCircle, Clock, XCircle, AlertCircle, Banknote 
} from 'lucide-react';
import { getFullImageUrl } from '@/services/api';
import { API_URL } from '@/lib/config';
import { SellerOrderDetail, SellerOrderItem } from '@/types';
import { toast, ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// --- HÀM TIỆN ÍCH ---
const formatCurrency = (amount?: number): string => {
    if (typeof amount !== 'number' || isNaN(amount)) return '0 ₫';
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
};
const formatDateTime = (dateString?: string): string => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

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

const StatusBadge = ({ status }: { status?: string }) => {
    if (!status) return null;
    const config = statusConfig[status] || { ...statusConfig['Default'], label: status };
    const colorMap: Record<string, string> = { 'text-yellow-600': 'bg-yellow-50 border-yellow-200', 'text-blue-600': 'bg-blue-50 border-blue-200', 'text-purple-600': 'bg-purple-50 border-purple-200', 'text-green-600': 'bg-green-50 border-green-200', 'text-red-600': 'bg-red-50 border-red-200', 'text-gray-600': 'bg-gray-50 border-gray-200' };
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border ${colorMap[config.color]} ${config.color}`}>
            {config.icon} {config.label}
        </span>
    );
};

const getPaymentStatusClass = (status?: string) => {
    if (!status) return "bg-gray-100 text-gray-800";
    const map: Record<string, string> = {
        paid: "bg-green-100 text-green-800",
        pending: "bg-yellow-100 text-yellow-800",
        failed: "bg-red-100 text-red-800",
        refunded: "bg-gray-200 text-gray-800",
    };
    return map[status.toLowerCase()] || "bg-gray-100 text-gray-800";
}

// --- COMPONENT CHÍNH ---
export default function SellerOrderDetailPage() {
    const params = useParams();
    const router = useRouter();
    const sellerOrderId = params.id as string;

    const [order, setOrder] = useState<SellerOrderDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!sellerOrderId) return;
        const fetchOrderDetail = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${API_URL}/admin/orders/seller/${sellerOrderId}`, { credentials: 'include', headers: { "Accept": "application/json" } });
                if (!res.ok) {
                    const errData = await res.json();
                    throw new Error(errData.message || `Lỗi ${res.status}`);
                }
                const result = await res.json();
                if (result.success && result.data) {
                    setOrder(result.data);
                } else {
                    throw new Error("Dữ liệu API trả về không đúng định dạng.");
                }
            } catch (error: any) {
                toast.error(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchOrderDetail();
    }, [sellerOrderId]);
    
    if (loading) {
        return <div className="flex justify-center items-center h-screen"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /></div>;
    }
    
    if (!order) {
        return <div className="text-center p-10 text-red-500">Không tìm thấy thông tin đơn hàng hoặc đã xảy ra lỗi.</div>;
    }

    return (
        <>
            <ToastContainer position="top-right" autoClose={3000} />
            <div className="p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-6">
                        <Button onClick={() => router.back()} variant="outline" size="sm" className="mb-4">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Quay lại
                        </Button>
                        <div className="flex justify-between items-start">
                             <div>
                                <h1 className="text-3xl font-bold">Chi tiết đơn hàng #{order.sellerOrderCode}</h1>
                                <p className="text-gray-500">Shop: <strong>{order.shop.shopName}</strong></p>
                             </div>
                             <StatusBadge status={order.status} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            <Card>
                                <CardHeader><CardTitle className="flex items-center"><ShoppingCart className="mr-2"/>Sản phẩm</CardTitle></CardHeader>
                                <CardContent className="divide-y">
                                    {order.items.map(item => (
                                        <div key={item.orderItemId} className="flex items-start gap-4 py-4">
                                            <img src={getFullImageUrl(item.productImage)} alt={item.productName} className="w-20 h-20 object-cover rounded-md border" />
                                            <div className="flex-grow">
                                                <p className="font-semibold">{item.productName}</p>
                                                <p className="text-sm text-gray-500">SKU: {item.sku || 'N/A'}</p>
                                                <p className="text-sm text-gray-500">{item.classification}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold">{formatCurrency(item.priceAtPurchase)}</p>
                                                <p className="text-sm text-gray-500">x {item.quantity}</p>
                                                <p className="font-bold mt-1">{formatCurrency(item.subtotal)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                             <Card>
                               <CardHeader><CardTitle className="flex items-center"><CreditCard className="mr-2"/>Chi tiết tài chính</CardTitle></CardHeader>
                               <CardContent className="w-full max-w-sm ml-auto space-y-2">
                                    <div className="flex justify-between"><p>Tổng tiền hàng:</p><p>{formatCurrency(order.subtotalAmount)}</p></div>
                                    <div className="flex justify-between"><p>Phí vận chuyển:</p><p>{formatCurrency(order.shippingFee)}</p></div>
                                    <div className="flex justify-between text-red-600"><p>Voucher Shop:</p><p>- {formatCurrency(order.shopVoucherDiscount)}</p></div>
                                    <hr className="my-1 border-dashed"/>
                                    <div className="flex justify-between font-bold text-lg"><p>Thành tiền:</p><p className="text-orange-600">{formatCurrency(order.totalAmount)}</p></div>
                               </CardContent>
                            </Card>
                        </div>
                        <div className="lg:col-span-1 space-y-6">
                            <Card>
                                <CardHeader><CardTitle className="flex items-center"><User className="mr-2"/>Người mua</CardTitle></CardHeader>
                                <CardContent className="flex items-center gap-3">
                                    <img className="w-12 h-12 rounded-full object-cover" src={getFullImageUrl(order.user.avatar)} alt="Avatar"/>
                                    <div>
                                        <p className="font-semibold">{order.user.fullName}</p>
                                        <p className="text-sm text-gray-500">{order.user.email}</p>
                                    </div>
                                </CardContent>
                            </Card>
                             <Card>
                                <CardHeader><CardTitle className="flex items-center"><Home className="mr-2"/>Địa chỉ giao hàng</CardTitle></CardHeader>
                                <CardContent className="space-y-2">
                                    <p className="flex items-center"><User className="w-4 h-4 mr-2"/> {order.shippingAddress.fullName}</p>
                                    <p className="flex items-center"><Phone className="w-4 h-4 mr-2"/> {order.shippingAddress.phoneNumber}</p>
                                    <p className="flex items-start"><MapPin className="w-4 h-4 mr-2 mt-1"/> {order.shippingAddress.fullAddress}</p>
                                </CardContent>
                            </Card>
                            {/* ▼▼▼ KHỐI THÔNG TIN THANH TOÁN ĐÃ THÊM ▼▼▼ */}
                            <Card>
                                <CardHeader><CardTitle className="flex items-center"><Banknote className="mr-2"/>Thông tin thanh toán</CardTitle></CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Phương thức:</span>
                                        <span className="font-semibold px-2 py-1 bg-gray-100 rounded-md text-sm">{order.paymentMethod}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Trạng thái:</span>
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusClass(order.paymentStatus)}`}>
                                            {order.paymentStatus === 'Paid' ? 'Đã thanh toán' : 
                                             order.paymentStatus === 'Pending' ? 'Chờ thanh toán' : 
                                             order.paymentStatus === 'Failed' ? 'Thất bại' : 
                                             order.paymentStatus === 'Refunded' ? 'Đã hoàn tiền' : 'Không rõ'}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                            {order.notes && (
                                 <Card>
                                    <CardHeader><CardTitle className="flex items-center"><FileText className="mr-2"/>Ghi chú</CardTitle></CardHeader>
                                    <CardContent><p className="italic bg-yellow-50 p-3 rounded-lg">"{order.notes}"</p></CardContent>
                                 </Card>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}