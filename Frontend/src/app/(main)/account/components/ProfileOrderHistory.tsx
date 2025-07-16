<<<<<<< HEAD
// app/(main)/(account)/components/ProfileOrderHistory.tsx
'use client';

import React, { useState, useEffect } from 'react';
import OrderCard from './OrderCard';
import OrderDetailsModal from './OrderDetailsModal';
import { Order, OrderItem, OrderStatus } from '@/types/order.interface';
import { FaSearch } from 'react-icons/fa'; // Import icon tìm kiếm

export default function ProfileOrderHistory() {
  const [activeTab, setActiveTab] = useState<OrderStatus | 'all' | 'Cancelled'>('Pending');
  const [orders, setOrders] = useState<Order[]>([]);

  // States mới cho modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // States mới cho thanh tìm kiếm
  const [searchQuery, setSearchQuery] = useState('');

  // Hàm mở modal
  const handleSeeMoreClick = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  // Hàm đóng modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  // Hàm xử lý khi input tìm kiếm thay đổi
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    // Khi tìm kiếm, reset về trang đầu tiên nếu có phân trang
    // (Hiện tại chưa có phân trang ở đây, nhưng là best practice nếu thêm sau này)
    // setCurrentPage(1);
  };


  useEffect(() => {
    const mockOrders: Order[] = [
      {
        OrderID: 1,
        OrderCode: 'ORD12345',
        UserID: 1,
        OrderDate: '2021-12-02T12:38:00Z',
        TotalAmount: 12.05,
        SubtotalAmount: 11.50, ShippingFee: 0.55, DiscountAmount: 0,
        ShippingAddressID: 1, ShippingFullName: 'Name', ShippingPhoneNumber: '09xxxxxx', Notes: null,
        PaymentMethod: 'COD', PaymentStatus: 'Pending', OverallStatus: 'Pending',
        PlatformVoucherCode: null, PlatformDiscountAmount: 0, CreatedAt: '', UpdatedAt: '',
        items: [
          { OrderItemID: 1, VariantID: 1, Quantity: 1, PriceAtPurchase: 5.00, Subtotal: 5.00, IsFlashSaleItem: false, FlashSaleDealID: null, ReturnStatus: 'None', CreatedAt: '', productName: 'The Blue Mug', productImageURL: '/images/orders/mug-blue.png', productAttributes: [{ attributeName: 'Color', attributeValue: 'Blue' }] },
          { OrderItemID: 2, VariantID: 2, Quantity: 3, PriceAtPurchase: 2.00, Subtotal: 6.00, IsFlashSaleItem: false, FlashSaleDealID: null, ReturnStatus: 'None', CreatedAt: '', productName: 'Designed Mug', productImageURL: '/images/orders/mug-designed.png', productAttributes: [{ attributeName: 'Design', attributeValue: 'Floral' }] },
          { OrderItemID: 3, VariantID: 3, Quantity: 1, PriceAtPurchase: 0.50, Subtotal: 0.50, IsFlashSaleItem: false, FlashSaleDealID: null, ReturnStatus: 'None', CreatedAt: '', productName: 'The Red Mug', productImageURL: '/images/orders/mug-red.png', productAttributes: [{ attributeName: 'Color', attributeValue: 'Red' }] },
        ],
      },
      {
        OrderID: 2,
        OrderCode: 'ORD12346',
        UserID: 1,
        OrderDate: '2021-12-02T12:38:00Z',
        TotalAmount: 12.05,
        SubtotalAmount: 11.50, ShippingFee: 0.55, DiscountAmount: 0,
        ShippingAddressID: 1, ShippingFullName: 'Name', ShippingPhoneNumber: '09xxxxxx', Notes: null,
        PaymentMethod: 'COD', PaymentStatus: 'Pending', OverallStatus: 'Pending',
        PlatformVoucherCode: null, PlatformDiscountAmount: 0, CreatedAt: '', UpdatedAt: '',
        items: [
          { OrderItemID: 4, VariantID: 1, Quantity: 1, PriceAtPurchase: 5.00, Subtotal: 5.00, IsFlashSaleItem: false, FlashSaleDealID: null, ReturnStatus: 'None', CreatedAt: '', productName: 'The Blue Mug', productImageURL: '/images/orders/mug-blue.png', productAttributes: [{ attributeName: 'Color', attributeValue: 'Blue' }] },
          { OrderItemID: 5, VariantID: 2, Quantity: 3, PriceAtPurchase: 2.00, Subtotal: 6.00, IsFlashSaleItem: false, FlashSaleDealID: null, ReturnStatus: 'None', CreatedAt: '', productName: 'Designed Mug', productImageURL: '/images/orders/mug-designed.png', productAttributes: [{ attributeName: 'Design', attributeValue: 'Floral' }] },
          { OrderItemID: 6, VariantID: 3, Quantity: 1, PriceAtPurchase: 0.50, Subtotal: 0.50, IsFlashSaleItem: false, FlashSaleDealID: null, ReturnStatus: 'None', CreatedAt: '', productName: 'The Red Mug', productImageURL: '/images/orders/mug-red.png', productAttributes: [{ attributeName: 'Color', attributeValue: 'Red' }] },
          { OrderItemID: 7, VariantID: 4, Quantity: 1, PriceAtPurchase: 0.50, Subtotal: 0.50, IsFlashSaleItem: false, FlashSaleDealID: null, ReturnStatus: 'None', CreatedAt: '', productName: 'The Black Cap', productImageURL: '/images/orders/cap-black.png', productAttributes: [{ attributeName: 'Color', attributeValue: 'Black' }] },
          { OrderItemID: 8, VariantID: 5, Quantity: 1, PriceAtPurchase: 0.50, Subtotal: 0.50, IsFlashSaleItem: false, FlashSaleDealID: null, ReturnStatus: 'None', CreatedAt: '', productName: 'The Dark Blue Mug', productImageURL: '/images/orders/mug-darkblue.png', productAttributes: [{ attributeName: 'Color', attributeValue: 'Dark Blue' }] },
        ],
      },
      {
        OrderID: 3,
        OrderCode: 'ORD12347',
        UserID: 1,
        OrderDate: '2021-12-02T12:38:00Z',
        TotalAmount: 12.05,
        SubtotalAmount: 11.50, ShippingFee: 0.55, DiscountAmount: 0,
        ShippingAddressID: 1, ShippingFullName: 'Name', ShippingPhoneNumber: '09xxxxxx', Notes: null,
        PaymentMethod: 'COD', PaymentStatus: 'Pending', OverallStatus: 'Pending',
        PlatformVoucherCode: null, PlatformDiscountAmount: 0, CreatedAt: '', UpdatedAt: '',
        items: [
          { OrderItemID: 9, VariantID: 1, Quantity: 1, PriceAtPurchase: 5.00, Subtotal: 5.00, IsFlashSaleItem: false, FlashSaleDealID: null, ReturnStatus: 'None', CreatedAt: '', productName: 'The Blue Mug', productImageURL: '/images/orders/mug-blue.png' },
          { OrderItemID: 10, VariantID: 2, Quantity: 3, PriceAtPurchase: 2.00, Subtotal: 6.00, IsFlashSaleItem: false, FlashSaleDealID: null, ReturnStatus: 'None', CreatedAt: '', productName: 'Designed Mug', productImageURL: '/images/orders/mug-designed.png' },
          { OrderItemID: 11, VariantID: 3, Quantity: 1, PriceAtPurchase: 0.50, Subtotal: 0.50, IsFlashSaleItem: false, FlashSaleDealID: null, ReturnStatus: 'None', CreatedAt: '', productName: 'The Red Mug', productImageURL: '/images/orders/mug-red.png' },
          { OrderItemID: 12, VariantID: 4, Quantity: 1, PriceAtPurchase: 0.50, Subtotal: 0.50, IsFlashSaleItem: false, FlashSaleDealID: null, ReturnStatus: 'None', CreatedAt: '', productName: 'The Black Cap', productImageURL: '/images/orders/cap-black.png' },
          { OrderItemID: 13, VariantID: 5, Quantity: 1, PriceAtPurchase: 0.50, Subtotal: 0.50, IsFlashSaleItem: false, FlashSaleDealID: null, ReturnStatus: 'None', CreatedAt: '', productName: 'The Dark Blue Mug', productImageURL: '/images/orders/mug-darkblue.png' },
          { OrderItemID: 14, VariantID: 6, Quantity: 1, PriceAtPurchase: 0.50, Subtotal: 0.50, IsFlashSaleItem: false, FlashSaleDealID: null, ReturnStatus: 'None', CreatedAt: '', productName: 'Another Blue Mug', productImageURL: '/images/orders/mug-blue.png' },
          { OrderItemID: 15, VariantID: 7, Quantity: 1, PriceAtPurchase: 0.50, Subtotal: 0.50, IsFlashSaleItem: false, FlashSaleDealID: null, ReturnStatus: 'None', CreatedAt: '', productName: 'Yet Another Mug', productImageURL: '/images/orders/mug-darkblue.png' },
        ],
      },
      {
        OrderID: 4,
        OrderCode: 'ORD12348',
        UserID: 1,
        OrderDate: '2021-12-02T12:38:00Z',
        TotalAmount: 12.05,
        SubtotalAmount: 11.50, ShippingFee: 0.55, DiscountAmount: 0,
        ShippingAddressID: 1, ShippingFullName: 'Name', ShippingPhoneNumber: '09xxxxxx', Notes: null,
        PaymentMethod: 'COD', PaymentStatus: 'Pending', OverallStatus: 'Pending',
        PlatformVoucherCode: null, PlatformDiscountAmount: 0, CreatedAt: '', UpdatedAt: '',
        items: [
          { OrderItemID: 16, VariantID: 1, Quantity: 1, PriceAtPurchase: 5.00, Subtotal: 5.00, IsFlashSaleItem: false, FlashSaleDealID: null, ReturnStatus: 'None', CreatedAt: '', productName: 'The Blue Mug', productImageURL: '/images/orders/mug-blue.png' },
          { OrderItemID: 17, VariantID: 2, Quantity: 3, PriceAtPurchase: 2.00, Subtotal: 6.00, IsFlashSaleItem: false, FlashSaleDealID: null, ReturnStatus: 'None', CreatedAt: '', productName: 'Fabric Pink', productImageURL: '/images/orders/fabric-pink.png' },
          { OrderItemID: 18, VariantID: 3, Quantity: 1, PriceAtPurchase: 0.50, Subtotal: 0.50, IsFlashSaleItem: false, FlashSaleDealID: null, ReturnStatus: 'None', CreatedAt: '', productName: 'The Red Mug', productImageURL: '/images/orders/mug-red.png' },
          { OrderItemID: 19, VariantID: 4, Quantity: 1, PriceAtPurchase: 0.50, Subtotal: 0.50, IsFlashSaleItem: false, FlashSaleDealID: null, ReturnStatus: 'None', CreatedAt: '', productName: 'Another Blue Mug', productImageURL: '/images/orders/mug-blue.png' },
          { OrderItemID: 20, VariantID: 5, Quantity: 1, PriceAtPurchase: 0.50, Subtotal: 0.50, IsFlashSaleItem: false, FlashSaleDealID: null, ReturnStatus: 'None', CreatedAt: '', productName: 'Yet Another Dark Blue Mug', productImageURL: '/images/orders/mug-darkblue.png' },
          { OrderItemID: 21, VariantID: 6, Quantity: 1, PriceAtPurchase: 0.50, Subtotal: 0.50, IsFlashSaleItem: false, FlashSaleDealID: null, ReturnStatus: 'None', CreatedAt: '', productName: 'A Third Blue Mug', productImageURL: '/images/orders/mug-blue.png' },
          { OrderItemID: 22, VariantID: 7, Quantity: 1, PriceAtPurchase: 0.50, Subtotal: 0.50, IsFlashSaleItem: false, FlashSaleDealID: null, ReturnStatus: 'None', CreatedAt: '', productName: 'The Fourth Dark Blue Mug', productImageURL: '/images/orders/mug-darkblue.png' },
          { OrderItemID: 23, VariantID: 8, Quantity: 1, PriceAtPurchase: 0.50, Subtotal: 0.50, IsFlashSaleItem: false, FlashSaleDealID: null, ReturnStatus: 'None', CreatedAt: '', productName: 'The Fifth Red Mug', productImageURL: '/images/orders/mug-red.png' },
        ],
      },
      {
        OrderID: 5,
        OrderCode: 'ORD12349',
        UserID: 1,
        OrderDate: '2021-12-01T10:00:00Z',
        TotalAmount: 25.00,
        SubtotalAmount: 24.00, ShippingFee: 1.00, DiscountAmount: 0,
        ShippingAddressID: 1, ShippingFullName: 'Name', ShippingPhoneNumber: '09xxxxxx', Notes: null,
        PaymentMethod: 'OnlineGateway', PaymentStatus: 'Paid', OverallStatus: 'Processing',
        PlatformVoucherCode: null, PlatformDiscountAmount: 0, CreatedAt: '', UpdatedAt: '',
        items: [
          { OrderItemID: 24, VariantID: 9, Quantity: 2, PriceAtPurchase: 10.00, Subtotal: 20.00, IsFlashSaleItem: false, FlashSaleDealID: null, ReturnStatus: 'None', CreatedAt: '', productName: 'Laptop XYZ', productImageURL: '/images/orders/laptop.png' },
          { OrderItemID: 25, VariantID: 10, Quantity: 1, PriceAtPurchase: 4.00, Subtotal: 4.00, IsFlashSaleItem: false, FlashSaleDealID: null, ReturnStatus: 'None', CreatedAt: '', productName: 'Mouse ABC', productImageURL: '/images/orders/mouse.png' },
        ],
      },
      {
        OrderID: 6,
        OrderCode: 'ORD12350',
        UserID: 1,
        OrderDate: '2021-11-28T15:30:00Z',
        TotalAmount: 50.00,
        SubtotalAmount: 50.00, ShippingFee: 0, DiscountAmount: 0,
        ShippingAddressID: 1, ShippingFullName: 'Name', ShippingPhoneNumber: '09xxxxxx', Notes: null,
        PaymentMethod: 'COD', PaymentStatus: 'Paid', OverallStatus: 'Delivered',
        PlatformVoucherCode: null, PlatformDiscountAmount: 0, CreatedAt: '', UpdatedAt: '',
        items: [
          { OrderItemID: 26, VariantID: 11, Quantity: 1, PriceAtPurchase: 50.00, Subtotal: 50.00, IsFlashSaleItem: false, FlashSaleDealID: null, ReturnStatus: 'None', CreatedAt: '', productName: 'Smartwatch V5', productImageURL: '/images/orders/smartwatch.png' },
        ],
      },
      {
        OrderID: 7,
        OrderCode: 'ORD12351',
        UserID: 1,
        OrderDate: '2021-11-25T09:00:00Z',
        TotalAmount: 30.00,
        SubtotalAmount: 30.00, ShippingFee: 0, DiscountAmount: 0,
        ShippingAddressID: 1, ShippingFullName: 'Name', ShippingPhoneNumber: '09xxxxxx', Notes: null,
        PaymentMethod: 'OnlineGateway', PaymentStatus: 'Refunded', OverallStatus: 'Returned',
        PlatformVoucherCode: null, PlatformDiscountAmount: 0, CreatedAt: '', UpdatedAt: '',
        items: [
          { OrderItemID: 27, VariantID: 12, Quantity: 1, PriceAtPurchase: 30.00, Subtotal: 30.00, IsFlashSaleItem: false, FlashSaleDealID: null, ReturnStatus: 'Returned', CreatedAt: '', productName: 'Bluetooth Speaker', productImageURL: '/images/orders/speaker.png' },
        ],
      },
      {
        OrderID: 8,
        OrderCode: 'ORD12352',
        UserID: 1,
        OrderDate: '2021-11-20T14:00:00Z',
        TotalAmount: 15.00,
        SubtotalAmount: 15.00, ShippingFee: 0, DiscountAmount: 0,
        ShippingAddressID: 1, ShippingFullName: 'Name', ShippingPhoneNumber: '09xxxxxx', Notes: null,
        PaymentMethod: 'COD', PaymentStatus: 'Failed', OverallStatus: 'CancelledByBuyer',
        PlatformVoucherCode: null, PlatformDiscountAmount: 0, CreatedAt: '', UpdatedAt: '',
        items: [
          { OrderItemID: 28, VariantID: 13, Quantity: 1, PriceAtPurchase: 15.00, Subtotal: 15.00, IsFlashSaleItem: false, FlashSaleDealID: null, ReturnStatus: 'None', CreatedAt: '', productName: 'USB Drive 64GB', productImageURL: '/images/orders/usb.png' },
        ],
      },
    ];
    setOrders(mockOrders);
  }, []);

  const getStatusCount = (status: OrderStatus | 'all' | 'Cancelled'): number => {
    if (status === 'all') return orders.length;
    if (status === 'Cancelled') {
      return orders.filter(order => order.OverallStatus === 'CancelledByBuyer' || order.OverallStatus === 'CancelledBySeller').length;
    }
    return orders.filter(order => order.OverallStatus === status).length;
  };

  const statusTabs = [
    { id: 'Pending', name: 'Pending', count: getStatusCount('Pending') },
    { id: 'Processing', name: 'Processing', count: getStatusCount('Processing') },
    { id: 'Delivered', name: 'Delivered', count: getStatusCount('Delivered') },
    { id: 'Returned', name: 'Returned', count: getStatusCount('Returned') },
    { id: 'Cancelled', name: 'Cancelled', count: getStatusCount('Cancelled') },
  ];

  // Lọc theo tab trước
  const filteredOrdersByTab = activeTab === 'all'
    ? orders
    : orders.filter(order => {
        if (activeTab === 'Cancelled') {
          return order.OverallStatus === 'CancelledByBuyer' || order.OverallStatus === 'CancelledBySeller';
        }
        return order.OverallStatus === activeTab;
      });

  // Sau đó lọc theo thanh tìm kiếm
  const filteredOrders = filteredOrdersByTab.filter(order => {
    const lowerCaseQuery = searchQuery.toLowerCase();
    // Tìm kiếm theo mã đơn hàng
    if (order.OrderCode.toLowerCase().includes(lowerCaseQuery)) {
      return true;
    }
    // Tìm kiếm theo tên sản phẩm trong các order item
    if (order.items.some(item => item.productName.toLowerCase().includes(lowerCaseQuery))) {
      return true;
    }
    return false;
  });


  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-black">Order history</h1>

      {/* Thanh tìm kiếm */}
      <div className="relative mb-6">
        <input
          type="text"
          placeholder="Tìm kiếm theo mã đơn hàng hoặc tên sản phẩm..."
          className="w-full text-black pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200"
          value={searchQuery}
          onChange={handleSearchChange}
        />
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      </div>

      {/* Status Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        {statusTabs.map(tab => (
          <button
            key={tab.id}
            className={`py-3 px-6 text-sm font-semibold transition-colors duration-200
              ${activeTab === tab.id
                ? 'border-b-2 border-orange-500 text-orange-500'
                : 'text-gray-700 hover:text-orange-500 hover:border-b-2 hover:border-orange-100'
              }`}
            onClick={() => setActiveTab(tab.id as OrderStatus | 'all' | 'Cancelled')}
          >
            {tab.name} <span className="font-normal text-gray-500">({tab.count})</span>
          </button>
        ))}
      </div>

      {/* List of Order Cards */}
      <div>
        {filteredOrders.length > 0 ? (
          filteredOrders.map(order => (
            <OrderCard
              key={order.OrderID}
              order={order}
              onSeeMoreClick={handleSeeMoreClick}
            />
          ))
        ) : (
          <p className="text-center text-gray-500 mt-10">Không có đơn hàng nào trong trạng thái này.</p>
        )}
      </div>

      {/* RENDER MODAL KHI ISMODALOPEN LÀ TRUE */}
      <OrderDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        order={selectedOrder}
      />
    </div>
  );
=======
'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import OrderCard from './OrderCard'; // Component con để render mỗi đơn hàng
import { Order, OrderStatus, OrderTabStatus, StatusTab } from '@/types';
import { FaSearch, FaCalendarAlt } from 'react-icons/fa';
import { Loader2 } from 'lucide-react';
import { getAuthToken } from '@/services/api';


/**
 * Ánh xạ từ các tab trên giao diện (UI) sang các trạng thái trong cơ sở dữ liệu (DB).
 */
const uiTabToDbStatusMapping: { [key in OrderTabStatus]?: OrderStatus[] } = {
    all: [],
    PendingPayment: ['Pending'],
    Processing: ['Processing'],
    Shipped: ['Shipped', 'Delivered'],
    Completed: ['Completed'],
    Cancelled: ['CancelledByBuyer', 'CancelledBySeller'],
    ReturnedRefunded: ['Returned', 'ReturnInProgress'],
};

export default function ProfileOrderHistory() {
    const searchParams = useSearchParams();
    
    // State gốc để lưu toàn bộ đơn hàng từ API
    const [allOrders, setAllOrders] = useState<Order[]>([]);
    
    // UI states
    const [activeTab, setActiveTab] = useState<OrderTabStatus>('Completed');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filter & Sort states
    const [searchQuery, setSearchQuery] = useState('');
    const [startDateFilter, setStartDateFilter] = useState('');
    const [endDateFilter, setEndDateFilter] = useState('');
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
    const [currentPage, setCurrentPage] = useState(1);
    const ordersPerPage = 10;

    // Effect để lấy dữ liệu từ API
    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            setError(null);
            const token = getAuthToken();

            if (!token) {
                setError("Vui lòng đăng nhập để xem lịch sử mua hàng.");
                setLoading(false);
                return;
            }

            try {
                const response = await fetch('/api/orders', {
                    headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
                });
                if (!response.ok) throw new Error('Không thể tải lịch sử mua hàng.');
                const data: Order[] = await response.json();
                setAllOrders(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    // Effect để đồng bộ tab với URL
    useEffect(() => {
        const statusFromUrl = searchParams.get('status') as OrderTabStatus;
        if (statusFromUrl && uiTabToDbStatusMapping[statusFromUrl]) {
            setActiveTab(statusFromUrl);
        }
        setCurrentPage(1);
    }, [searchParams]);

    // --- LOGIC LỌC, SẮP XẾP, PHÂN TRANG ---
    const getStatusCount = (status: OrderTabStatus): number => {
        if (status === 'all') return allOrders.length;
        const dbStatuses = uiTabToDbStatusMapping[status] || [];
        return allOrders.filter(o => dbStatuses.includes(o.OverallStatus)).length;
    };

    const statusTabs: StatusTab[] = [
        { id: 'all', name: 'Tất cả', count: getStatusCount('all') },
        { id: 'PendingPayment', name: 'Chờ thanh toán', count: getStatusCount('PendingPayment') },
        { id: 'Processing', name: 'Chờ giao hàng', count: getStatusCount('Processing') },
        { id: 'Shipped', name: 'Vận chuyển', count: getStatusCount('Shipped') },
        { id: 'Completed', name: 'Hoàn thành', count: getStatusCount('Completed') },
        { id: 'Cancelled', name: 'Đã hủy', count: getStatusCount('Cancelled') },
        { id: 'ReturnedRefunded', name: 'Trả hàng/Hoàn tiền', count: getStatusCount('ReturnedRefunded') },
    ];

    const filteredOrders = allOrders
        .filter(order => { // Lọc theo tab
            if (activeTab === 'all') return true;
            const dbStatuses = uiTabToDbStatusMapping[activeTab] || [];
            return dbStatuses.includes(order.OverallStatus);
        })
        .filter(order => { // Lọc theo search
            const lowerCaseQuery = searchQuery.toLowerCase().trim();
            if (!lowerCaseQuery) return true;
            return order.OrderCode.toLowerCase().includes(lowerCaseQuery) || 
                   (order.items && order.items.some(item => item.productName.toLowerCase().includes(lowerCaseQuery)));
        })
        .filter(order => { // Lọc theo ngày
            const orderDate = new Date(order.OrderDate);
            const start = startDateFilter ? new Date(new Date(startDateFilter).setHours(0, 0, 0, 0)) : null;
            const end = endDateFilter ? new Date(new Date(endDateFilter).setHours(23, 59, 59, 999)) : null;
            if (start && orderDate < start) return false;
            if (end && orderDate > end) return false;
            return true;
        })
        .sort((a, b) => { // Sắp xếp
            const dateA = new Date(a.OrderDate).getTime();
            const dateB = new Date(b.OrderDate).getTime();
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
                        <input type="date" className="w-full py-2.5 pl-3 pr-8 border border-gray-300 rounded-lg shadow-sm" value={startDateFilter} onChange={(e) => setStartDateFilter(e.target.value)} title="Từ ngày"/>
                    </div>
                    <span className="flex-shrink-0 text-gray-500 self-center">đến</span>
                    <div className="relative flex items-center flex-grow min-w-0">
                        <input type="date" className="w-full py-2.5 pl-3 pr-8 border border-gray-300 rounded-lg shadow-sm" value={endDateFilter} onChange={(e) => setEndDateFilter(e.target.value)} title="Đến ngày"/>
                    </div>
                </div>
                <select className="flex-shrink-0 w-full md:w-auto py-2.5 px-3 border border-gray-300 rounded-lg shadow-sm" value={sortOrder} onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}>
                    <option value="newest">Mới nhất</option>
                    <option value="oldest">Cũ nhất</option>
                </select>
            </div>

            {/* Tabs UI - Giữ nguyên giao diện của bạn */}
            <div className="overflow-x-auto no-scrollbar pb-2">
                <div className="flex border-b border-gray-200 mb-6 whitespace-nowrap">
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
                    currentOrders.map(order => <OrderCard key={order.OrderID} order={order} />)
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
>>>>>>> mienN
}