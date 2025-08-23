'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, User, MapPin, ShoppingCart, FileText } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getFullImageUrl } from '@/services/api';
import { SellerOrderDetail, SellerOrderItem } from '@/types/order.interface';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { API_URL } from '@/lib/config';

const formatCurrency = (amount: number): string => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

// SỬA 1: Làm cho hàm an toàn hơn, chấp nhận status có thể là undefined
const getStatusBadgeClass = (status?: string) => {
    if (!status) {
        return "bg-gray-100 text-gray-800";
    }
    const map: Record<string, string> = {
        completed: "bg-green-100 text-green-800", rated: "bg-green-100 text-green-800", delivered: "bg-green-100 text-green-800",
        pending: "bg-yellow-100 text-yellow-800", processing: "bg-blue-100 text-blue-800",
        shipped: "bg-purple-100 text-purple-800", outfordelivery: "bg-purple-100 text-purple-800",
        returned: "bg-gray-100 text-gray-800", returninprogress: "bg-gray-100 text-gray-800",
        cancelledbybuyer: "bg-red-100 text-red-800", cancelledbyseller: "bg-red-100 text-red-800",
    };
    return map[status.toLowerCase().replace(/\s/g, '')] || "bg-gray-100 text-gray-800";
};

export default function SellerOrderDetailPage() {
    const [order, setOrder] = useState<SellerOrderDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const params = useParams();
    const router = useRouter();
    const { id } = params;

    useEffect(() => {
        if (!id) return;
        const fetchOrderDetail = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${API_URL}/admin/orders/seller/${id}`, { credentials: 'include', headers: { "Accept": "application/json" } });
                if (!res.ok) throw new Error(`Lỗi ${res.status}: Không thể tải chi tiết đơn hàng.`);
                const result = await res.json();
                if (result.success) {
                    setOrder(result.data);
                } else {
                    throw new Error(result.message || 'Lỗi không xác định từ server');
                }
            } catch (error: any) {
                toast.error(error.message);
                // Bạn có thể comment dòng này lại nếu không muốn bị chuyển hướng ngay
                // router.push('/admin/orders');
            } finally {
                setLoading(false);
            }
        };
        fetchOrderDetail();
    }, [id, API_URL, router]);
    
    // SỬA 2: Sửa lại hàm để khớp với cấu trúc dữ liệu mới từ backend
    const getVariantClassification = (item: SellerOrderItem) => {
    if (!item.variant?.attributes || item.variant.attributes.length === 0) {
        return 'Không có phân loại';
    }
    
    return item.variant.attributes
        .map(pva => {
            // Sử dụng optional chaining (?.) để truy cập an toàn
            const attributeName = pva.attributeValue?.attribute?.Name;
            const attributeValue = pva.attributeValue?.Value;

            if (attributeName && attributeValue) {
                return `${attributeName}: ${attributeValue}`;
            }
            return null; // Trả về null nếu thiếu dữ liệu
        })
        .filter(Boolean) // Lọc bỏ các giá trị null
        .join(', ');
};
    if (loading) {
        return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div></div>;
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
                            Quay lại danh sách
                        </Button>
                        <div className="flex justify-between items-start">
                             <div>
                                <h1 className="text-3xl font-bold">Chi tiết đơn hàng #{order.sellerOrderCode}</h1>
                                <p className="text-gray-500">Shop: <strong>{order.shop.shopName}</strong></p>
                             </div>
                             <span className={`px-4 py-2 text-sm font-semibold rounded-full ${getStatusBadgeClass(order.status)}`}>
                                {order.status || 'Không rõ'}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-1 flex flex-col gap-6">
                            <Card>
                                <CardHeader><CardTitle className="flex items-center text-lg"><User className="mr-2 h-5 w-5"/>Khách hàng</CardTitle></CardHeader>
                                <CardContent>
                                    <p className="font-semibold">{order.user.fullName}</p>
                                    <p className="text-sm text-gray-600">{order.user.email}</p>
                                </CardContent>
                            </Card>
                             <Card>
                                <CardHeader><CardTitle className="flex items-center text-lg"><MapPin className="mr-2 h-5 w-5"/>Địa chỉ giao hàng</CardTitle></CardHeader>
                                <CardContent>
                                    <p className="font-semibold">{order.shippingAddress.fullName}</p>
                                    <p className="text-sm text-gray-600">{order.shippingAddress.phoneNumber}</p>
                                    <p className="text-sm text-gray-600 mt-2">{`${order.shippingAddress.street}, ${order.shippingAddress.ward}, ${order.shippingAddress.district}, ${order.shippingAddress.city}`}</p>
                                </CardContent>
                            </Card>
                             <Card>
                                <CardHeader><CardTitle className="flex items-center text-lg"><FileText className="mr-2 h-5 w-5"/>Ghi chú từ khách hàng</CardTitle></CardHeader>
                                <CardContent><p className="text-sm text-gray-600 italic">{order.notes || "Không có ghi chú."}</p></CardContent>
                            </Card>
                        </div>
                        <div className="lg:col-span-2">
                            <Card>
                                 <CardHeader><CardTitle className="flex items-center text-lg"><ShoppingCart className="mr-2 h-5 w-5"/>Sản phẩm trong đơn hàng</CardTitle></CardHeader>
                                 <CardContent>
                                    <div className="divide-y divide-gray-200">
                                        {order.orderItems.map(item => (
                                            <div key={item.OrderItemID} className="flex items-start gap-4 py-4">
                                                <img 
                                                    src={getFullImageUrl(item.variant.ImageURL || item.variant.product.primaryImage?.ImageURL)} 
                                                    alt={item.variant.product.Name}
                                                    className="w-20 h-20 object-cover rounded-md border bg-gray-100"
                                                />
                                                <div className="flex-grow">
                                                    <p className="font-semibold text-gray-800">{item.variant.product.Name}</p>
                                                    <p className="text-sm text-gray-500">SKU: {item.variant.SKU || 'N/A'}</p>
                                                    <p className="text-sm text-gray-500">{getVariantClassification(item)}</p>
                                                </div>
                                                <div className="text-right flex-shrink-0">
                                                    <p className="font-semibold text-gray-800">{formatCurrency(item.PriceAtPurchase)}</p>
                                                    <p className="text-sm text-gray-500 text-right">x {item.Quantity}</p>
                                                    <p className="font-bold mt-1 text-gray-900">{formatCurrency(item.Subtotal)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="border-t border-gray-200 mt-4 pt-4 space-y-2">
                                        <div className="flex justify-between text-sm text-gray-600"><p>Tổng tiền hàng:</p><p>{formatCurrency(order.subtotalAmount)}</p></div>
                                        <div className="flex justify-between text-sm text-gray-600"><p>Phí vận chuyển:</p><p>{formatCurrency(order.shippingFee)}</p></div>
                                        <div className="flex justify-between text-sm text-red-600"><p>Giảm giá voucher shop:</p><p>- {formatCurrency(order.shopVoucherDiscount)}</p></div>
                                        <div className="flex justify-between text-lg font-bold mt-2 pt-2 border-t border-dashed"><p>Thành tiền:</p><p className="text-orange-600">{formatCurrency(order.totalAmount)}</p></div>
                                    </div>
                                 </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </>
   
    );
}