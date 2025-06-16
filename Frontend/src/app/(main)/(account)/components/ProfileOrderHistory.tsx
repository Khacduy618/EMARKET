// app/(main)/(account)/components/ProfileOrderHistory.tsx
'use client';

import React, { useState, useEffect } from 'react';
import OrderCard from './OrderCard';
// import OrderDetailsModal from './OrderDetailsModal'; // KHÔNG DÙNG MODAL NỮA
import { Order, OrderItem, OrderStatus, ShopLevel } from '@/types/order.interface';
import { FaSearch, FaCalendarAlt } from 'react-icons/fa'; // Import icon tìm kiếm và lịch

// Định nghĩa lại các loại trạng thái của tabs để khớp với ảnh
type OrderTabStatus =
  'all' | 'PendingPayment' | 'Shipped' | 'Processing' |
  'Completed' | 'Cancelled' | 'ReturnedRefunded'; // "Vận chuyển" có thể là Shipped, "Chờ giao hàng" có thể là Delivered, "Chờ thanh toán" là PendingPayment

export default function ProfileOrderHistory() {
  const [activeTab, setActiveTab] = useState<OrderTabStatus>('Completed'); // Đặt mặc định là 'Hoàn thành'
  const [orders, setOrders] = useState<Order[]>([]);

  // Bỏ các state liên quan đến modal nếu không dùng
  // const [isModalOpen, setIsModalOpen] = useState(false);
  // const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  // Hàm handleSeeMoreClick (không dùng nữa vì đã bỏ modal)
  // const handleSeeMoreClick = (order: Order) => {
  //   setSelectedOrder(order);
  //   setIsModalOpen(true);
  // };

  // const handleCloseModal = () => {
  //   setIsModalOpen(false);
  //   setSelectedOrder(null);
  // };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartDateFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndDateFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOrder(e.target.value as 'newest' | 'oldest');
    setCurrentPage(1);
  };

  useEffect(() => {
    const mockOrders: Order[] = [
      // Dữ liệu giả định với các trường mới và trạng thái cụ thể để khớp với tabs
      {
        OrderID: 1, OrderCode: 'MERZY001', UserID: 1, OrderDate: '2023-12-02T12:38:00Z', TotalAmount: 160650, SubtotalAmount: 189000, ShippingFee: 0, DiscountAmount: 28350, ShippingAddressID: 1, ShippingFullName: 'Name', ShippingPhoneNumber: '09xxxxxx', Notes: null, PaymentMethod: 'COD', PaymentStatus: 'Paid', OverallStatus: 'Completed', PlatformVoucherCode: null, PlatformDiscountAmount: 0, CreatedAt: '', UpdatedAt: '',
        ShopID: 101, shopName: 'Merzy Official Store', shopLevel: 'Mall', isFavoriteShop: false,
        items: [{ OrderItemID: 1, VariantID: 1, Quantity: 1, PriceAtPurchase: 189000, OriginalPrice: 319000, Subtotal: 189000, IsFlashSaleItem: false, FlashSaleDealID: null, ReturnStatus: 'None', CreatedAt: '', productName: '[NEW][SON PHAO] Son Kem Lì, Bền Màu Merzy Puffer Velvet Tint 3.7g', productImageURL: '/images/orders/lip-tint.png', classification: '#08 Unknown', canReview: true, reviewDeadline: '2025-07-04T23:59:59Z', reviewReward: 200 }]
      },
      {
        OrderID: 2, OrderCode: 'UKMART001', UserID: 1, OrderDate: '2023-12-01T10:00:00Z', TotalAmount: 136850, SubtotalAmount: 161000, ShippingFee: 0, DiscountAmount: 24150, ShippingAddressID: 1, ShippingFullName: 'Name', ShippingPhoneNumber: '09xxxxxx', Notes: null, PaymentMethod: 'COD', PaymentStatus: 'Paid', OverallStatus: 'Completed', PlatformVoucherCode: null, PlatformDiscountAmount: 0, CreatedAt: '', UpdatedAt: '',
        ShopID: 102, shopName: 'UKmart - Hàng Anh Thủ Đức', shopLevel: 'Yêu thích+', isFavoriteShop: true,
        items: [{ OrderItemID: 2, VariantID: 2, Quantity: 1, PriceAtPurchase: 161000, OriginalPrice: 225000, Subtotal: 161000, IsFlashSaleItem: false, FlashSaleDealID: null, ReturnStatus: 'None', CreatedAt: '', productName: 'Toner Eveline 5% Glycolic Acid Glycol Therapy Cho Da Căng Bóng Mịn Màng Mờ Thâm Mụn Trẻ Hóa Da', productImageURL: '/images/orders/toner.png', classification: 'Glycol Therapy 110ml', canReview: true, reviewDeadline: '2025-07-03T23:59:59Z', reviewReward: 200 }]
      },
      {
        OrderID: 3, OrderCode: 'PENDING001', UserID: 1, OrderDate: '2023-12-05T09:00:00Z', TotalAmount: 500000, SubtotalAmount: 500000, ShippingFee: 30000, DiscountAmount: 0, ShippingAddressID: 1, ShippingFullName: 'Name', ShippingPhoneNumber: '09xxxxxx', Notes: null, PaymentMethod: 'COD', PaymentStatus: 'Pending', OverallStatus: 'PendingPayment', PlatformVoucherCode: null, PlatformDiscountAmount: 0, CreatedAt: '', UpdatedAt: '',
        ShopID: 103, shopName: 'ABC Tech', shopLevel: 'Thường', isFavoriteShop: false,
        items: [{ OrderItemID: 3, VariantID: 3, Quantity: 1, PriceAtPurchase: 500000, OriginalPrice: 550000, Subtotal: 500000, IsFlashSaleItem: false, FlashSaleDealID: null, ReturnStatus: 'None', CreatedAt: '', productName: 'Tai nghe Bluetooth X50', productImageURL: '/images/orders/earbuds.png', classification: 'Màu Đen', canReview: false }]
      },
      {
        OrderID: 4, OrderCode: 'SHIPPED001', UserID: 1, OrderDate: '2023-12-04T15:00:00Z', TotalAmount: 800000, SubtotalAmount: 800000, ShippingFee: 25000, DiscountAmount: 0, ShippingAddressID: 1, ShippingFullName: 'Name', ShippingPhoneNumber: '09xxxxxx', Notes: null, PaymentMethod: 'OnlineGateway', PaymentStatus: 'Paid', OverallStatus: 'Shipped', PlatformVoucherCode: null, PlatformDiscountAmount: 0, CreatedAt: '', UpdatedAt: '',
        ShopID: 104, shopName: 'Laptop Pro', shopLevel: 'Mall', isFavoriteShop: false,
        items: [{ OrderItemID: 4, VariantID: 4, Quantity: 1, PriceAtPurchase: 800000, OriginalPrice: 850000, Subtotal: 800000, IsFlashSaleItem: false, FlashSaleDealID: null, ReturnStatus: 'None', CreatedAt: '', productName: 'Chuột Gaming RGB Pro', productImageURL: '/images/orders/mouse.png', classification: 'Pro Series', canReview: false }]
      },
      {
        OrderID: 5, OrderCode: 'CANCELLED001', UserID: 1, OrderDate: '2023-11-20T14:00:00Z', TotalAmount: 150000, SubtotalAmount: 150000, ShippingFee: 0, DiscountAmount: 0, ShippingAddressID: 1, ShippingFullName: 'Name', ShippingPhoneNumber: '09xxxxxx', Notes: null, PaymentMethod: 'COD', PaymentStatus: 'Failed', OverallStatus: 'Cancelled', PlatformVoucherCode: null, PlatformDiscountAmount: 0, CreatedAt: '', UpdatedAt: '',
        ShopID: 105, shopName: 'Phụ kiện HOT', shopLevel: 'Thường', isFavoriteShop: false,
        items: [{ OrderItemID: 5, VariantID: 5, Quantity: 1, PriceAtPurchase: 150000, OriginalPrice: 150000, Subtotal: 150000, IsFlashSaleItem: false, FlashSaleDealID: null, ReturnStatus: 'None', CreatedAt: '', productName: 'Ốp lưng iPhone 15 Pro', productImageURL: '/images/orders/phone-case.png', classification: 'Màu Đen', canReview: false }]
      },
      {
        OrderID: 6, OrderCode: 'RETURNED001', UserID: 1, OrderDate: '2023-11-15T10:00:00Z', TotalAmount: 200000, SubtotalAmount: 200000, ShippingFee: 0, DiscountAmount: 0, ShippingAddressID: 1, ShippingFullName: 'Name', ShippingPhoneNumber: '09xxxxxx', Notes: null, PaymentMethod: 'OnlineGateway', PaymentStatus: 'Refunded', OverallStatus: 'ReturnedRefunded', PlatformVoucherCode: null, PlatformDiscountAmount: 0, CreatedAt: '', UpdatedAt: '',
        ShopID: 106, shopName: 'Gia Dụng Xanh', shopLevel: 'Yêu thích+', isFavoriteShop: false,
        items: [{ OrderItemID: 6, VariantID: 6, Quantity: 1, PriceAtPurchase: 200000, OriginalPrice: 200000, Subtotal: 200000, IsFlashSaleItem: false, FlashSaleDealID: null, ReturnStatus: 'Returned', CreatedAt: '', productName: 'Bình giữ nhiệt 500ml', productImageURL: '/images/orders/mug-blue.png', classification: 'Màu Xanh', canReview: false }]
      },
      // Thêm các đơn hàng khác để có đủ dữ liệu cho các tab và phân trang
      { OrderID: 7, OrderCode: 'PROCESSING001', UserID: 1, OrderDate: '2023-12-03T11:00:00Z', TotalAmount: 300000, SubtotalAmount: 300000, ShippingFee: 0, DiscountAmount: 0, ShippingAddressID: 1, ShippingFullName: 'Name', ShippingPhoneNumber: '09xxxxxx', Notes: null, PaymentMethod: 'OnlineGateway', PaymentStatus: 'Paid', OverallStatus: 'Processing', PlatformVoucherCode: null, PlatformDiscountAmount: 0, CreatedAt: '', UpdatedAt: '', ShopID: 107, shopName: 'Smart Home', shopLevel: 'Thường', isFavoriteShop: false, items: [{ OrderItemID: 7, VariantID: 7, Quantity: 1, PriceAtPurchase: 300000, OriginalPrice: 320000, Subtotal: 300000, IsFlashSaleItem: false, FlashSaleDealID: null, ReturnStatus: 'None', CreatedAt: '', productName: 'Đèn LED thông minh', productImageURL: '/images/orders/smartwatch.png', classification: 'Trắng', canReview: false }] },
      { OrderID: 8, OrderCode: 'DELIVERED001', UserID: 1, OrderDate: '2023-11-29T16:00:00Z', TotalAmount: 180000, SubtotalAmount: 180000, ShippingFee: 0, DiscountAmount: 0, ShippingAddressID: 1, ShippingFullName: 'Name', ShippingPhoneNumber: '09xxxxxx', Notes: null, PaymentMethod: 'COD', PaymentStatus: 'Paid', OverallStatus: 'Delivered', PlatformVoucherCode: null, PlatformDiscountAmount: 0, CreatedAt: '', UpdatedAt: '', ShopID: 108, shopName: 'Thời trang nam', shopLevel: 'Thường', isFavoriteShop: false, items: [{ OrderItemID: 8, VariantID: 8, Quantity: 2, PriceAtPurchase: 90000, OriginalPrice: 100000, Subtotal: 180000, IsFlashSaleItem: false, FlashSaleDealID: null, ReturnStatus: 'None', CreatedAt: '', productName: 'Áo phông Unisex', productImageURL: '/images/orders/mug-darkblue.png', classification: 'Size L, Trắng', canReview: true, reviewDeadline: '2025-06-30T23:59:59Z', reviewReward: 100 }] },
      { OrderID: 9, OrderCode: 'COMPLETED002', UserID: 1, OrderDate: '2023-11-20T10:00:00Z', TotalAmount: 450000, SubtotalAmount: 450000, ShippingFee: 0, DiscountAmount: 0, ShippingAddressID: 1, ShippingFullName: 'Name', ShippingPhoneNumber: '09xxxxxx', Notes: null, PaymentMethod: 'COD', PaymentStatus: 'Paid', OverallStatus: 'Completed', PlatformVoucherCode: null, PlatformDiscountAmount: 0, CreatedAt: '', UpdatedAt: '', ShopID: 101, shopName: 'Merzy Official Store', shopLevel: 'Mall', isFavoriteShop: false, items: [{ OrderItemID: 9, VariantID: 9, Quantity: 1, PriceAtPurchase: 450000, OriginalPrice: 500000, Subtotal: 450000, IsFlashSaleItem: false, FlashSaleDealID: null, ReturnStatus: 'None', CreatedAt: '', productName: 'Bảng phấn mắt 12 màu', productImageURL: '/images/orders/fabric-pink.png', classification: 'Nude Tones', canReview: true, reviewDeadline: '2025-07-01T23:59:59Z', reviewReward: 150 }] },
      { OrderID: 10, OrderCode: 'COMPLETED003', UserID: 1, OrderDate: '2023-11-18T08:00:00Z', TotalAmount: 75000, SubtotalAmount: 75000, ShippingFee: 0, DiscountAmount: 0, ShippingAddressID: 1, ShippingFullName: 'Name', ShippingPhoneNumber: '09xxxxxx', Notes: null, PaymentMethod: 'OnlineGateway', PaymentStatus: 'Paid', OverallStatus: 'Completed', PlatformVoucherCode: null, PlatformDiscountAmount: 0, CreatedAt: '', UpdatedAt: '', ShopID: 102, shopName: 'UKmart - Hàng Anh Thủ Đức', shopLevel: 'Yêu thích+', isFavoriteShop: true, items: [{ OrderItemID: 10, VariantID: 10, Quantity: 1, PriceAtPurchase: 75000, OriginalPrice: 80000, Subtotal: 75000, IsFlashSaleItem: false, FlashSaleDealID: null, ReturnStatus: 'None', CreatedAt: '', productName: 'Sữa rửa mặt Cetaphil', productImageURL: '/images/orders/mug-red.png', classification: '125ml', canReview: true, reviewDeadline: '2025-06-25T23:59:59Z', reviewReward: 50 }] },
      { OrderID: 11, OrderCode: 'COMPLETED004', UserID: 1, OrderDate: '2023-11-10T14:00:00Z', TotalAmount: 220000, SubtotalAmount: 220000, ShippingFee: 0, DiscountAmount: 0, ShippingAddressID: 1, ShippingFullName: 'Name', ShippingPhoneNumber: '09xxxxxx', Notes: null, PaymentMethod: 'COD', PaymentStatus: 'Paid', OverallStatus: 'Completed', PlatformVoucherCode: null, PlatformDiscountAmount: 0, CreatedAt: '', UpdatedAt: '', ShopID: 101, shopName: 'Merzy Official Store', shopLevel: 'Mall', isFavoriteShop: false, items: [{ OrderItemID: 11, VariantID: 11, Quantity: 1, PriceAtPurchase: 220000, OriginalPrice: 250000, Subtotal: 220000, IsFlashSaleItem: false, FlashSaleDealID: null, ReturnStatus: 'None', CreatedAt: '', productName: 'Kem dưỡng ẩm Cerave', productImageURL: '/images/orders/mug-designed.png', classification: '200ml', canReview: true, reviewDeadline: '2025-06-20T23:59:59Z', reviewReward: 100 }] },
      { OrderID: 12, OrderCode: 'COMPLETED005', UserID: 1, OrderDate: '2023-11-05T11:00:00Z', TotalAmount: 110000, SubtotalAmount: 110000, ShippingFee: 0, DiscountAmount: 0, ShippingAddressID: 1, ShippingFullName: 'Name', ShippingPhoneNumber: '09xxxxxx', Notes: null, PaymentMethod: 'COD', PaymentStatus: 'Paid', OverallStatus: 'Completed', PlatformVoucherCode: null, PlatformDiscountAmount: 0, CreatedAt: '', UpdatedAt: '', ShopID: 102, shopName: 'UKmart - Hàng Anh Thủ Đức', shopLevel: 'Yêu thích+', isFavoriteShop: true, items: [{ OrderItemID: 12, VariantID: 12, Quantity: 1, PriceAtPurchase: 110000, OriginalPrice: 120000, Subtotal: 110000, IsFlashSaleItem: false, FlashSaleDealID: null, ReturnStatus: 'None', CreatedAt: '', productName: 'Nước hoa hồng Simple', productImageURL: '/images/orders/toner.png', classification: '200ml', canReview: true, reviewDeadline: '2025-06-15T23:59:59Z', reviewReward: 80 }] },
    ];
    setOrders(mockOrders);
  }, []);

  // Đếm số lượng đơn hàng theo các trạng thái trên UI
  const getStatusCount = (status: OrderTabStatus): number => {
    if (status === 'all') return orders.length;
    if (status === 'PendingPayment') return orders.filter(o => o.OverallStatus === 'PendingPayment').length;
    if (status === 'Shipped') return orders.filter(o => o.OverallStatus === 'Shipped').length;
    if (status === 'Processing') return orders.filter(o => o.OverallStatus === 'Processing').length;
    if (status === 'Completed') return orders.filter(o => o.OverallStatus === 'Completed').length;
    if (status === 'Cancelled') return orders.filter(o => o.OverallStatus === 'Cancelled').length;
    if (status === 'ReturnedRefunded') return orders.filter(o => o.OverallStatus === 'ReturnedRefunded').length;
    return 0; // Fallback
  };

  const statusTabs = [
    { id: 'all', name: 'Tất cả', count: getStatusCount('all') },
    { id: 'PendingPayment', name: 'Chờ thanh toán', count: getStatusCount('PendingPayment') },
    { id: 'Shipped', name: 'Vận chuyển', count: getStatusCount('Shipped') },
    { id: 'Processing', name: 'Chờ giao hàng', count: getStatusCount('Processing') }, // Có thể map Processing thành Chờ giao hàng
    { id: 'Completed', name: 'Hoàn thành', count: getStatusCount('Completed') },
    { id: 'Cancelled', name: 'Đã hủy', count: getStatusCount('Cancelled') },
    { id: 'ReturnedRefunded', name: 'Trả hàng/Hoàn tiền', count: getStatusCount('ReturnedRefunded') },
  ];


  // Bước 1: Lọc theo tab trạng thái
  const filteredOrdersByTab = activeTab === 'all'
    ? orders
    : orders.filter(order => order.OverallStatus === activeTab);

  // Bước 2: Lọc theo tìm kiếm văn bản (mã đơn hàng, tên sản phẩm)
  const filteredOrdersBySearch = filteredOrdersByTab.filter(order => {
    const lowerCaseQuery = searchQuery.toLowerCase().trim();
    if (lowerCaseQuery === '') return true;

    if (order.OrderCode.toLowerCase().includes(lowerCaseQuery)) {
      return true;
    }
    if (order.items.some(item => item.productName.toLowerCase().includes(lowerCaseQuery))) {
      return true;
    }
    return false;
  });

  // Bước 3: Lọc theo khoảng ngày
  const filteredOrdersByDate = filteredOrdersBySearch.filter(order => {
    const orderDate = new Date(order.OrderDate);
    let isAfterStartDate = true;
    let isBeforeEndDate = true;

    if (startDateFilter) {
      const start = new Date(startDateFilter);
      start.setHours(0, 0, 0, 0);
      isAfterStartDate = orderDate >= start;
    }

    if (endDateFilter) {
      const end = new Date(endDateFilter);
      end.setHours(23, 59, 59, 999);
      isBeforeEndDate = orderDate <= end;
    }

    return isAfterStartDate && isBeforeEndDate;
  });

  // Bước 4: Sắp xếp
  const sortedOrders = [...filteredOrdersByDate].sort((a, b) => {
    const dateA = new Date(a.OrderDate).getTime();
    const dateB = new Date(b.OrderDate).getTime();

    if (sortOrder === 'newest') {
      return dateB - dateA;
    } else {
      return dateA - dateB;
    }
  });

  // Bước 5: Phân trang
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = sortedOrders.slice(indexOfFirstOrder, indexOfLastOrder);

  const totalPages = Math.ceil(sortedOrders.length / ordersPerPage);

  const pageNumbers = [];
  const maxPageButtons = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
  let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);
  if (endPage - startPage + 1 < maxPageButtons) {
    startPage = Math.max(1, endPage - maxPageButtons + 1);
  }
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery, startDateFilter, endDateFilter, sortOrder]);


  return (
    <div className="max-w-6xl">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Order history</h1>

      {/* Thanh tìm kiếm */}
      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Tìm kiếm theo mã đơn hàng hoặc tên sản phẩm..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg shadow-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     text-gray-700 placeholder-gray-400"
          value={searchQuery}
          onChange={handleSearchChange}
        />
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      </div>

      {/* Bộ lọc ngày và Sắp xếp */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 flex-grow">
          <div className="relative flex items-center w-full sm:w-auto">
            <FaCalendarAlt className="absolute left-3 text-gray-400" />
            <input
              type="date"
              className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg shadow-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         text-gray-700"
              value={startDateFilter}
              onChange={handleStartDateChange}
              title="Từ ngày"
            />
          </div>
          <div className="relative flex items-center w-full sm:w-auto">
            <FaCalendarAlt className="absolute left-3 text-gray-400" />
            <input
              type="date"
              className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg shadow-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         text-gray-700"
              value={endDateFilter}
              onChange={handleEndDateChange}
              title="Đến ngày"
            />
          </div>
        </div>

        <select
          className="w-full md:w-auto py-2.5 px-3 border border-gray-300 rounded-lg shadow-sm
                     bg-white text-gray-700 appearance-none cursor-pointer
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={sortOrder}
          onChange={handleSortChange}
        >
          <option value="newest">Mới nhất</option>
          <option value="oldest">Cũ nhất</option>
        </select>
      </div>

      {/* Status Tabs */}
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto whitespace-nowrap">
        {statusTabs.map(tab => (
          <button
            key={tab.id}
            className={`flex-shrink-0 py-2 px-2 text-sm font-semibold transition-colors duration-200
                       ${activeTab === tab.id
                         ? 'border-b-2 border-orange-500 text-orange-500'
                         : 'text-gray-700 hover:text-orange-500 hover:border-orange-100 hover:border-b-2'
                       }`}
            onClick={() => setActiveTab(tab.id as OrderTabStatus)}
          >
            {tab.name} {tab.count > 0 && <span className="font-normal text-gray-500 ml-1">({tab.count})</span>}
          </button>
        ))}
      </div>

      {/* List of Order Cards */}
      <div>
        {currentOrders.length > 0 ? (
          currentOrders.map(order => (
            <OrderCard
              key={order.OrderID}
              order={order}
            />
          ))
        ) : (
          <p className="text-center text-gray-500 mt-10 p-4 bg-white rounded-lg shadow-sm">Không có đơn hàng nào khớp với tiêu chí tìm kiếm hoặc lọc.</p>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <nav className="flex justify-center mt-8" aria-label="Pagination">
          <ul className="flex list-none p-0 bg-white rounded-lg shadow-sm border border-gray-200">
            <li>
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 border-r border-gray-200 rounded-l-lg
                           text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed
                           transition-colors duration-200"
              >
                Trước
              </button>
            </li>
            {pageNumbers.map(number => (
              <li key={number}>
                <button
                  onClick={() => paginate(number)}
                  className={`px-4 py-2 border-r border-gray-200
                    ${currentPage === number
                      ? 'bg-orange-500 text-white hover:bg-orange-600'
                      : 'bg-white text-gray-700 hover:bg-gray-50'}
                    transition-colors duration-200`}
                >
                  {number}
                </button>
              </li>
            ))}
            <li>
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-r-lg
                           text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed
                           transition-colors duration-200"
              >
                Sau
              </button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}