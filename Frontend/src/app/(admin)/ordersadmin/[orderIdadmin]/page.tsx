import React from 'react';
import { getMockAdminOrderById, Order } from '../data'; 
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, User, MapPin, Truck, Hash, CreditCard, Store } from 'lucide-react';

/**
 * Component hiển thị một "badge" trạng thái theo phong cách Shopee.
 */
const StatusBadge = ({ status }: { status: Order['status'] }) => {
    const statusInfo = {
        'Hoàn thành': { text: 'Giao hàng thành công', color: 'text-green-600' },
        'Đang giao': { text: 'Đang vận chuyển', color: 'text-blue-600' },
        'Chờ xác nhận': { text: 'Chờ xác nhận', color: 'text-orange-500' },
        'Đã hủy': { text: 'Đơn hàng đã hủy', color: 'text-red-600' },
    };
    
    const info = statusInfo[status];
    if (!info) return null;
    
    return (
        <span className={`text-2xl font-semibold uppercase ${info.color}`}>
            {info.text}
        </span>
    );
};

// Component cho mỗi bước trong timeline
const TimelineStep = ({ 
    title, 
    timestamp, 
    isActive, 
    isFirst = false, 
    isLast = false 
}: { 
    title: string; 
    timestamp: string | null; 
    isActive: boolean; 
    isFirst?: boolean; 
    isLast?: boolean; 
}) => {
    return (
        <div className="relative flex flex-col items-center w-1/4">
            {/* Đường kẻ nối trước */}
            {!isFirst && (
                <div 
                    className={`absolute top-1/2 left-0 w-1/2 h-0.5 -translate-y-1/2 ${
                        isActive ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                />
            )}
            
            {/* Đường kẻ nối sau */}
            {!isLast && (
                <div 
                    className={`absolute top-1/2 right-0 w-1/2 h-0.5 -translate-y-1/2 ${
                        isActive ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                />
            )}
            
            {/* Chấm tròn */}
            <div className={`w-3 h-3 rounded-full z-10 ${
                isActive ? 'bg-green-500' : 'bg-gray-200'
            }`} />
            
            {/* Nội dung */}
            <div className="text-center mt-2">
                <p className={`text-sm ${
                    isActive ? 'font-semibold text-gray-800' : 'text-gray-500'
                }`}>
                    {title}
                </p>
                {timestamp && (
                    <p className="text-xs text-gray-400">{timestamp}</p>
                )}
            </div>
        </div>
    );
};

// Component trang chính
export default async function OrderDetailPage({ 
    params 
}: { 
    params: { orderId: string } 
}) {
    const { orderId } = params;
    const order = await getMockAdminOrderById(orderId);

    if (!order) {
        notFound();
    }
    
    // Logic xác định bước hiện tại trên timeline
    const orderSteps = ['Chờ xác nhận', 'Đang giao', 'Hoàn thành'] as const;
    const currentStepIndex = order.status === 'Đã hủy' 
        ? -1 
        : orderSteps.indexOf(order.status);

    // Format date helper
    const formatDate = (date: string | Date) => {
        return new Date(date).toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Format currency helper
    const formatCurrency = (amount: number) => {
        return amount.toLocaleString('vi-VN') + '₫';
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto space-y-6 p-4">
                {/* Header */}
                <div className="flex items-center justify-between bg-white p-4 rounded-lg border shadow-sm">
                    <Link 
                        href="/ordersadmin" 
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Quay lại
                    </Link>
                    <div className="text-sm">
                        <span className="text-gray-600">MÃ ĐƠN HÀNG:</span>
                        <span className="font-semibold text-blue-600 ml-1">{order.id}</span>
                        <span className="mx-2 text-gray-300">|</span>
                        <span className="uppercase text-red-500 font-semibold">
                            {order.status}
                        </span>
                    </div>
                </div>

                {/* Khối trạng thái và Timeline */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center justify-between pb-6 border-b">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">
                                Chi tiết đơn hàng
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">
                                Đặt ngày: {formatDate(order.orderDate)}
                            </p>
                        </div>
                        <StatusBadge status={order.status} />
                    </div>
                    
                    {/* Timeline - chỉ hiển thị khi không bị hủy */}
                    {order.status !== 'Đã hủy' && (
                        <div className="flex justify-between items-start pt-8">
                            <TimelineStep 
                            
                                title="Đơn hàng đã đặt" 
                                timestamp={formatDate(order.orderDate)} 
                                isActive={true} 
                                isFirst 
                            />
                            <TimelineStep 
                                title="Đã giao cho ĐVVC" 
                                timestamp={currentStepIndex >= 1 ? 'Đang xử lý...' : null} 
                                isActive={currentStepIndex >= 1} 
                            />
                            <TimelineStep 
                                title="Giao hàng thành công" 
                                timestamp={currentStepIndex >= 2 ? formatDate(order.orderDate) : null} 
                                isActive={currentStepIndex >= 2} 
                                isLast 
                            />
                        </div>
                    )}
                </div>

                {/* Khối thông tin địa chỉ và vận chuyển */}
                <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x">
                        <div className="p-6">
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-blue-500"/> 
                                Địa chỉ nhận hàng
                            </h2>
                            <div className="space-y-2 text-sm">
                                <p className="font-semibold text-gray-800">
                                    {order.customerName}
                                </p>
                                <p className="text-gray-600">
                                    {order.customerPhone || '[Chưa có SĐT]'}
                                </p>
                                <p className="text-gray-600">
                                    {order.customerAddress || '[Chưa có địa chỉ]'}
                                </p>
                            </div>
                        </div>
                        
                        <div className="p-6">
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Truck className="w-5 h-5 text-green-500"/> 
                                Thông tin vận chuyển
                            </h2>
                            {order.shippingProvider ? (
                                <div className="space-y-2 text-sm">
                                    <p className="text-gray-600">
                                        Đơn vị: <span className="font-semibold text-gray-800">
                                            {order.shippingProvider}
                                        </span>
                                    </p>
                                    <p className="text-gray-600">
                                        Mã vận đơn: <span className="font-semibold text-gray-800">
                                            {order.trackingNumber}
                                        </span>
                                    </p>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">Chưa có thông tin vận chuyển.</p>
                            )}
                        </div>
                        
                        <div className="p-6">
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-orange-500"/> 
                                Phương thức thanh toán
                            </h2>
                            <p className="text-sm text-gray-600">
                                Thanh toán khi nhận hàng (COD)
                            </p>
                        </div>
                    </div>
                </div>

                {/* Khối sản phẩm và tổng tiền */}
                <div className="bg-white rounded-lg shadow-sm border">
                    {/* Thông tin cửa hàng */}
                    <div className="flex items-center p-6 border-b bg-gray-50">
                        <Store className="w-5 h-5 mr-3 text-purple-500"/>
                        <span className="font-semibold text-gray-800">
                            {order.shop.name}
                        </span>
                    </div>
                    
                    {/* Danh sách sản phẩm */}
                    <div className="p-6">
                        <div className="space-y-4">
                            {order.products.map((product) => (
                                <div key={product.productId} className="flex items-center py-4 border-b border-gray-100 last:border-b-0">
                                    <img 
                                        src={product.imageUrl} 
                                        alt={product.name} 
                                        className="w-20 h-20 rounded-md object-cover mr-4 border"
                                        loading="lazy"
                                    />
                                    <div className="flex-grow">
                                        <p className="font-medium text-gray-800 mb-1">
                                            {product.name}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Số lượng: {product.quantity}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-gray-800">
                                            {formatCurrency(product.price * product.quantity)}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {formatCurrency(product.price)}/sản phẩm
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {/* Bảng tổng tiền */}
                        <div className="border-t-2 border-dashed border-gray-200 mt-6 pt-4">
                            <div className="space-y-3 text-right">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Tổng tiền hàng:</span>
                                    <span className="font-medium">
                                        {formatCurrency(order.totalAmount)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Phí vận chuyển:</span>
                                    <span className="font-medium text-green-600">Miễn phí</span>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t">
                                    <span className="text-lg font-semibold text-gray-800">
                                        Thành tiền:
                                    </span>
                                    <span className="text-2xl font-bold text-red-500">
                                        {formatCurrency(order.totalAmount)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}