// account/components/ProfileOrderHistory.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import OrderCard from './OrderCard'; // Component con để render mỗi đơn hàng
import { Order, OrderStatus, OrderTabStatus, StatusTab } from '@/types';
import { FaSearch, FaCalendarAlt } from 'react-icons/fa';
import { Loader2 } from 'lucide-react';
import { getAuthToken } from '@/services/api';
import { getMyOrders } from '@/services/order';


/**
 * Ánh xạ từ các tab trên giao diện (UI) sang các trạng thái trong cơ sở dữ liệu (DB).
 */
const uiTabToDbStatusMapping: { [key in OrderTabStatus]?: OrderStatus[] } = {
    all: [],
    Processing: ['Processing'],
    Shipped: ['Shipped', 'OutForDelivery'], // Gộp cả hai vào tab Vận chuyển
    Delivered: ['Delivered'],
    Completed: ['Completed'], // Gộp cả hai vào tab Hoàn thành
    Rated: ['Rated'],
    Cancelled: ['CancelledByBuyer', 'CancelledBySeller'],
    ReturnedRefunded: ['Returned', 'ReturnInProgress'],
};

export default function ProfileOrderHistory() {
    const searchParams = useSearchParams();
    const [allOrders, setAllOrders] = useState<Order[]>([]); // State này giờ chứa các SellerOrder
    const [activeTab, setActiveTab] = useState<OrderTabStatus>('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [startDateFilter, setStartDateFilter] = useState('');
    const [endDateFilter, setEndDateFilter] = useState('');
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
    const [currentPage, setCurrentPage] = useState(1);
    const ordersPerPage = 10;

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            try {
                const responseData = await getMyOrders();
                if (Array.isArray(responseData)) {
                    setAllOrders(responseData);
                } else {
                    setAllOrders([]);
                }
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);


   useEffect(() => {
        const statusFromUrl = searchParams.get('status') as OrderTabStatus;
        if (statusFromUrl && uiTabToDbStatusMapping[statusFromUrl]) {
            setActiveTab(statusFromUrl);
        }
        setCurrentPage(1);
    }, [searchParams]);
    
    const getStatusCount = (status: OrderTabStatus): number => {
        if (status === 'all') return allOrders.length;
        const dbStatuses = uiTabToDbStatusMapping[status] || [];
        return allOrders.filter(o => dbStatuses.includes(o.Status)).length;
    };
    
    const statusTabs: StatusTab[] = [
        { id: 'all', name: 'Tất cả', count: getStatusCount('all') },
        { id: 'Processing', name: 'Chờ giao hàng', count: getStatusCount('Processing') },
        { id: 'Shipped', name: 'Đang giao', count: getStatusCount('Shipped') },
        { id: 'Delivered', name: 'Đã giao', count: getStatusCount('Delivered') },
        { id: 'Completed', name: 'Hoàn thành', count: getStatusCount('Completed') },
        { id: 'Cancelled', name: 'Đã hủy', count: getStatusCount('Cancelled') },
        { id: 'Rated', name: 'Đã đánh giá', count: getStatusCount('Rated') },
        { id: 'ReturnedRefunded', name: 'Trả hàng/Hoàn tiền', count: getStatusCount('ReturnedRefunded') },
    ];

    const filteredOrders = allOrders
        .filter(order => { // Lọc theo tab
            if (activeTab === 'all') return true;
            const dbStatuses = uiTabToDbStatusMapping[activeTab] || [];
            return dbStatuses.includes(order.Status); // Lọc trực tiếp trên trạng thái của gói hàng
        })
        .filter(order => {
            const lowerCaseQuery = searchQuery.toLowerCase().trim();
            if (!lowerCaseQuery) return true;
            return order.SellerOrderCode.toLowerCase().includes(lowerCaseQuery) ||
                   order.OrderCode.toLowerCase().includes(lowerCaseQuery) ||
                   order.items.some(item => item.productName.toLowerCase().includes(lowerCaseQuery));
        })
        .filter(order => {
            const orderDate = new Date(order.OrderDate);
            const start = startDateFilter ? new Date(new Date(startDateFilter).setHours(0, 0, 0, 0)) : null;
            const end = endDateFilter ? new Date(new Date(endDateFilter).setHours(23, 59, 59, 999)) : null;
            if (start && orderDate < start) return false;
            if (end && orderDate > end) return false;
            return true;
        })
        .sort((a, b) => { 
        const dateA = new Date(a.CreatedAt).getTime();
        const dateB = new Date(b.CreatedAt).getTime();
       
        return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    // Phân trang
    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
    const currentOrders = filteredOrders.slice((currentPage - 1) * ordersPerPage, currentPage * ordersPerPage);

    const pageNumbers = [];
    const maxPageButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);
    if (endPage - startPage + 1 < maxPageButtons) {
        startPage = Math.max(1, endPage - maxPageButtons + 1);
    }
    for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);

    const handleTabClick = (tabId: OrderTabStatus) => {
        setActiveTab(tabId);
        window.history.pushState(null, '', `/account/purchase?status=${tabId}`);
    };

    if (loading) {
        return <div className="flex justify-center items-center h-96"><Loader2 className="w-10 h-10 animate-spin text-orange-500" /></div>;
    }

    if (error) {
        return <div className="text-center py-20 text-red-600 bg-red-50 p-4 rounded-lg">{error}</div>;
    }

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Filter UI - Giữ nguyên giao diện của bạn */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 mb-6">
                <div className="flex flex-grow items-center gap-2">
                    <div className="relative flex items-center flex-grow min-w-0">
                        <input type="date" className="w-full py-2.5 pl-3 pr-8 border border-gray-300 rounded-lg shadow-sm" value={startDateFilter} onChange={(e) => setStartDateFilter(e.target.value)} title="Từ ngày" />
                    </div>
                    <span className="flex-shrink-0 text-gray-500 self-center">đến</span>
                    <div className="relative flex items-center flex-grow min-w-0">
                        <input type="date" className="w-full py-2.5 pl-3 pr-8 border border-gray-300 rounded-lg shadow-sm" value={endDateFilter} onChange={(e) => setEndDateFilter(e.target.value)} title="Đến ngày" />
                    </div>
                </div>
                <select className="flex-shrink-0 w-full md:w-auto py-2.5 px-3 border border-gray-300 rounded-lg shadow-sm" value={sortOrder} onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}>
                    <option value="newest">Mới nhất</option>
                    <option value="oldest">Cũ nhất</option>
                </select>
            </div>

            {/* Tabs UI - Giữ nguyên giao diện của bạn */}
            <div className="overflow-x-auto no-scrollbar pb-2">
                <div className="flex justify-around border-b border-gray-200 mb-6 whitespace-nowrap">
                    {statusTabs.map(tab => (
                        <button key={tab.id} className={`flex-shrink-0 py-2 px-4 text-sm font-semibold ${activeTab === tab.id ? 'border-b-2 border-orange-500 text-orange-500' : 'text-gray-700 hover:text-orange-500'}`} onClick={() => handleTabClick(tab.id)}>
                            {tab.name} {tab.count > 0 && <span className="font-normal text-gray-500 ml-1">({tab.count})</span>}
                        </button>
                    ))}
                </div>
            </div>

            {/* Search Bar UI - Giữ nguyên giao diện của bạn */}
            <div className="relative mb-4">
                <input type="text" placeholder="Tìm kiếm theo mã đơn hàng, tên sản phẩm..." className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg shadow-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>

            {/* Order List */}
            <div className="flex-1">
                {currentOrders.length > 0 ? (
                    currentOrders.map(order => <OrderCard key={order.SellerOrderID} order={order} />)
                ) : (
                    <p className="text-center text-gray-500 mt-10 p-4">Không có đơn hàng nào.</p>
                )}
            </div>

            {/* Pagination UI - Giữ nguyên giao diện của bạn */}
            {totalPages > 1 && (
                <nav className="flex justify-center mt-8 mb-4">
                    <ul className="flex list-none p-0">
                        <li><button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1} className="px-4 py-2 border rounded-l-lg">Trước</button></li>
                        {pageNumbers.map(number => (
                            <li key={number}><button onClick={() => setCurrentPage(number)} className={`px-4 py-2 border-t border-b ${currentPage === number ? 'bg-orange-500 text-white' : ''}`}>{number}</button></li>
                        ))}
                        <li><button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages} className="px-4 py-2 border rounded-r-lg">Sau</button></li>
                    </ul>
                </nav>
            )}
        </div>
    );
}