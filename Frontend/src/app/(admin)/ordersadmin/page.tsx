"use client"; // Bắt buộc: Trang này cần state để quản lý bộ lọc và tải dữ liệu

import React, { useState, useEffect, useMemo } from 'react';
// Giả sử bạn đã có file data.ts
import { getMockAdminOrders, Order } from './data'; 
import Link from 'next/link';
import { 
    Search, 
    Store, 
    User, 
    ChevronDown, 
    Filter,
    ArrowUpDown,
    Eye,
} from 'lucide-react';

/**
 * Component hiển thị một "badge" trạng thái với thiết kế mới.
 */
const StatusBadge = ({ status }: { status: Order['status'] }) => {
    const statusConfig = {
        'Hoàn thành': { text: 'Hoàn thành', bg: 'bg-emerald-50', text_color: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-400' },
        'Đang giao': { text: 'Đang giao', bg: 'bg-blue-50', text_color: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-400' },
        'Chờ xác nhận': { text: 'Chờ xác nhận', bg: 'bg-amber-50', text_color: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-400' },
        'Đã hủy': { text: 'Đã hủy', bg: 'bg-red-50', text_color: 'text-red-700', border: 'border-red-200', dot: 'bg-red-400' }
    };
    const config = statusConfig[status];
    return (
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.text_color} ${config.border}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></div>
            {config.text}
        </div>
    );
};

/**
 * Component hiển thị một Card cho mỗi đơn hàng.
 */
const OrderCard = ({ order }: { order: Order }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-200 overflow-hidden">
        <div className="flex items-center justify-between p-5 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center"><Store className="w-5 h-5 text-purple-600" /></div>
                <div><h3 className="font-semibold text-gray-900">{order.shop.name}</h3><p className="text-xs text-gray-500">ID: {order.id}</p></div>
            </div>
            <div className="flex items-center gap-3">
                <StatusBadge status={order.status} />
            </div>
        </div>
        <div className="p-5">
            <div className="space-y-4">
                {order.products.slice(0, 2).map(product => (
                    <div key={product.productId} className="flex items-center gap-4">
                        <div className="relative">
                            <img src={product.imageUrl} alt={product.name} className="w-14 h-14 rounded-lg object-cover border-2 border-white ring-1 ring-gray-100" />
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center font-semibold ring-2 ring-white">{product.quantity}</div>
                        </div>
                        <div className="flex-grow min-w-0">
                            <p className="font-medium text-gray-900 truncate">{product.name}</p>
                            <p className="text-sm text-gray-500">{product.price.toLocaleString('vi-VN')}₫ × {product.quantity}</p>
                        </div>
                        <div className="text-right"><p className="font-semibold text-gray-900">{(product.price * product.quantity).toLocaleString('vi-VN')}₫</p></div>
                    </div>
                ))}
                {order.products.length > 2 && (<p className="text-sm text-gray-500 text-center py-2 bg-gray-50 rounded-lg">+{order.products.length - 2} sản phẩm khác</p>)}
            </div>
        </div>
        <div className="px-5 py-4 bg-gray-50/70 border-t border-gray-100">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="w-4 h-4" /><span className="font-medium">{order.customerName}</span><span className="text-gray-400">•</span><span>{new Date(order.orderDate).toLocaleDateString('vi-VN')}</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right"><p className="text-xs text-gray-500 uppercase tracking-wide">Tổng tiền</p><p className="text-lg font-bold text-red-600">{order.totalAmount.toLocaleString('vi-VN')}₫</p></div>
                    <Link href={`/ordersadmin/${order.id}`} className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors shadow-sm hover:shadow-md"><Eye className="w-4 h-4" />Chi tiết</Link>
                </div>
            </div>
        </div>
    </div>
);

/**
 * Component hiển thị khung xương khi đang tải dữ liệu.
 */
const OrderCardSkeleton = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"><div className="animate-pulse"><div className="p-5 bg-gray-50 border-b border-gray-100"><div className="flex justify-between items-center"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-gray-200 rounded-lg"></div><div className="space-y-2"><div className="h-4 bg-gray-200 rounded w-24"></div><div className="h-3 bg-gray-200 rounded w-16"></div></div></div><div className="h-6 bg-gray-200 rounded-full w-20"></div></div></div><div className="p-5 space-y-4"><div className="flex gap-4"><div className="w-14 h-14 bg-gray-200 rounded-lg"></div><div className="flex-1 space-y-2"><div className="h-4 bg-gray-200 rounded"></div><div className="h-3 bg-gray-200 rounded w-1/2"></div></div></div></div><div className="px-5 py-4 bg-gray-50 border-t"><div className="flex justify-between items-center"><div className="h-4 bg-gray-200 rounded w-32"></div><div className="h-10 bg-gray-200 rounded w-24"></div></div></div></div></div>
);

// Component trang chính
export default function OrdersAdminPage() {
    const [allOrders, setAllOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filtersVisible, setFiltersVisible] = useState(false);
    const [activeTab, setActiveTab] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    const tabs = [
        { id: 'all', label: 'Tất cả' },
        { id: 'pending', label: 'Chờ xác nhận' },
        { id: 'shipping', label: 'Đang giao' },
        { id: 'completed', label: 'Hoàn thành' },
        { id: 'cancelled', label: 'Đã hủy' }
    ];

    useEffect(() => {
        const fetchOrders = async () => {
            setIsLoading(true);
            await new Promise(resolve => setTimeout(resolve, 800)); // Giả lập tải dữ liệu
            const data = await getMockAdminOrders();
            setAllOrders(data);
            setIsLoading(false);
        };
        fetchOrders();
    }, []);

    const filteredOrders = useMemo(() => {
        if (activeTab === 'all') return allOrders;
        const statusMap: { [key: string]: Order['status'] } = { pending: 'Chờ xác nhận', shipping: 'Đang giao', completed: 'Hoàn thành', cancelled: 'Đã hủy' };
        return allOrders.filter(order => order.status === statusMap[activeTab]);
    }, [allOrders, activeTab]);

    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab]);

    const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
    const currentOrders = useMemo(() => {
        const firstPageIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const lastPageIndex = firstPageIndex + ITEMS_PER_PAGE;
        return filteredOrders.slice(firstPageIndex, lastPageIndex);
    }, [filteredOrders, currentPage]);

    const handlePageClick = (page: number) => setCurrentPage(page);
    const handlePrevPage = () => setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev));
    const handleNextPage = () => setCurrentPage((prev) => (prev < totalPages ? prev + 1 : prev));
    
    const getPaginationGroup = () => {
        if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
        if (currentPage <= 4) return [1, 2, 3, 4, 5, '...', totalPages];
        if (currentPage > totalPages - 4) return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
        return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
    };
    
    const getCountForTab = (tabId: string) => {
        if (tabId === 'all') return allOrders.length;
        const statusMap: { [key: string]: Order['status'] } = { pending: 'Chờ xác nhận', shipping: 'Đang giao', completed: 'Hoàn thành', cancelled: 'Đã hủy' };
        return allOrders.filter(order => order.status === statusMap[tabId]).length;
    }


    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div><h1 className="text-3xl font-bold text-gray-900">Quản lý Đơn hàng</h1><p className="text-gray-600 mt-1">Theo dõi và quản lý tất cả đơn hàng trên sàn</p></div>
                </div>

                {/* Main Content Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Tabs */}
                    <div className="border-b border-gray-200 bg-gray-50">
                        <div className="flex overflow-x-auto">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === tab.id ? 'border-blue-500 text-blue-600 bg-blue-50' : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
                                >
                                    {tab.label}
                                    <span className={`px-2 py-0.5 text-xs rounded-full ${activeTab === tab.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-600'}`}>
                                        {getCountForTab(tab.id)}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Search & Filters */}
                    <div className="p-6 border-b border-gray-100">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-grow">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input type="text" placeholder="Tìm kiếm theo Mã đơn hàng, Shop, Người mua..." className="w-full h-11 pl-12 pr-4 text-base border border-gray-200 bg-gray-50 rounded-lg focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <button onClick={() => setFiltersVisible(!filtersVisible)} className="flex-shrink-0 inline-flex items-center justify-center gap-2 h-11 px-4 rounded-lg border bg-white hover:bg-gray-50 text-sm font-medium">
                                <Filter className="w-4 h-4 text-gray-500" />
                                Bộ lọc
                                <ChevronDown className={`w-5 h-5 transition-transform ${filtersVisible ? 'rotate-180' : ''}`} />
                            </button>
                        </div>
                        
                        {/* Khối bộ lọc chi tiết có thể bật/tắt */}
                        {filtersVisible && (
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {/* Bộ lọc nhanh */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Khoảng thời gian</label>
                                        <select className="w-full h-10 px-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500">
                                            <option>Tất cả</option>
                                            <option>7 ngày qua</option>
                                            <option>10 ngày qua</option>
                                            <option>30 ngày qua</option>
                                        </select>
                                    </div>
                                    {/* Từ ngày */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Từ ngày</label>
                                        <input type="date" className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                                    </div>
                                    {/* Đến ngày */}
                                     <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Đến ngày</label>
                                        <input type="date" className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                                    </div>
                                    {/* Sắp xếp */}
                                    <div className="relative">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Sắp xếp</label>
                                        <select className="w-full h-10 pl-3 pr-8 border border-gray-300 rounded-lg appearance-none bg-white focus:ring-2 focus:ring-blue-500">
                                            <option>Mới nhất</option>
                                            <option>Cũ nhất</option>
                                        </select>
                                         <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none mt-7"><ArrowUpDown className="w-4 h-4 text-gray-400" /></div>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3 mt-4">
                                    <button type="button" className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-6 border bg-white hover:bg-gray-50">Xóa bộ lọc</button>
                                    <button type="button" className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-6 bg-slate-900 text-slate-50 hover:bg-slate-800">Áp dụng</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Orders List */}
                <div className="space-y-6">
                    {isLoading ? (
                        <div className="grid gap-6">
                            {Array.from({ length: 4 }).map((_, index) => (<OrderCardSkeleton key={index} />))}
                        </div>
                    ) : (
                        <div className="grid gap-6">
                            {currentOrders.length > 0 ? (
                                currentOrders.map(order => (<OrderCard key={order.id} order={order} />))
                            ) : (
                                <div className="text-center py-10 bg-white rounded-xl">
                                    <p className="text-gray-500">Không có đơn hàng nào phù hợp.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {!isLoading && filteredOrders.length > 0 && (
                    <div className="flex items-center justify-between bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                        <p className="text-sm text-gray-600">
                            Hiển thị <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredOrders.length)}</span> trong tổng số <span className="font-medium">{filteredOrders.length}</span> đơn hàng
                        </p>
                        <div className="flex items-center gap-2">
                            <button onClick={handlePrevPage} disabled={currentPage === 1} className="inline-flex items-center px-4 py-2 border border-gray-200 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                                Trước
                            </button>
                            <div className="flex items-center gap-1">
                                {getPaginationGroup().map((item, index) => (
                                    <button
                                        key={index}
                                        onClick={() => typeof item === 'number' && handlePageClick(item)}
                                        className={`w-10 h-10 text-sm font-medium rounded-lg transition-colors ${item === currentPage ? 'bg-slate-900 text-white' : 'text-gray-700 hover:bg-gray-100'} ${typeof item !== 'number' ? 'cursor-default' : ''}`}
                                        disabled={typeof item !== 'number'}
                                    >
                                        {item}
                                    </button>
                                ))}
                            </div>
                            <button onClick={handleNextPage} disabled={currentPage === totalPages} className="inline-flex items-center px-4 py-2 border border-gray-200 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                                Sau
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}