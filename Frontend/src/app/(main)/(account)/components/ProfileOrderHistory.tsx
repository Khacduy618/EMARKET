// // app/(main)/(account)/components/ProfileOrderHistory.tsx
// 'use client';

// import React, { useState, useEffect } from 'react';
// import OrderCard from './OrderCard';
// import { Order, OrderItem, OrderStatus, ShopLevel } from '@/types/order.interface';
// import { FaSearch, FaCalendarAlt } from 'react-icons/fa'; // Import icon tìm kiếm và lịch

// type OrderTabStatus =
//   'all' | 'Pending' | 'Shipped' | 'Processing' |
//   'Completed' | 'Cancelled' | 'ReturnedRefunded';

// export default function ProfileOrderHistory() {
//   const [activeTab, setActiveTab] = useState<OrderTabStatus>('Completed');
//   const [orders, setOrders] = useState<Order[]>([]);

//   const [searchQuery, setSearchQuery] = useState('');
//   const [startDateFilter, setStartDateFilter] = useState('');
//   const [endDateFilter, setEndDateFilter] = useState('');
//   const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

//   const [currentPage, setCurrentPage] = useState(1);
//   const ordersPerPage = 10;

//   const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setSearchQuery(e.target.value);
//     setCurrentPage(1);
//   };

//   const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setStartDateFilter(e.target.value);
//     setCurrentPage(1);
//   };

//   const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setEndDateFilter(e.target.value);
//     setCurrentPage(1);
//   };

//   const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//     setSortOrder(e.target.value as 'newest' | 'oldest');
//     setCurrentPage(1);
//   };

//   useEffect(() => {
//     const mockOrders: Order[] = [
//       // Dữ liệu giả định có tổng số 15 đơn hàng để test phân trang
//       { OrderID: 1, OrderCode: 'MERZY001', UserID: 1, OrderDate: '2023-12-02T12:38:00Z', TotalAmount: 160650, SubtotalAmount: 189000, ShippingFee: 0, DiscountAmount: 28350, ShippingAddressID: 1, ShippingFullName: 'Name', ShippingPhoneNumber: '09xxxxxx', Notes: null, PaymentMethod: 'COD', PaymentStatus: 'Pending', OverallStatus: 'Completed', PlatformVoucherCode: null, PlatformDiscountAmount: 0, CreatedAt: '', UpdatedAt: '',
//         ShopID: 101, shopName: 'Merzy Official Store', shopLevel: 'Mall', isFavoriteShop: false,
//         items: [{
//           OrderItemID: 1, VariantID: 1, Quantity: 1, PriceAtPurchase: 189000, OriginalPrice: 319000, Subtotal: 189000, IsFlashSaleItem: false, FlashSaleDealID: null, ReturnStatus: 'None', CreatedAt: '', productName: '[NEW][SON PHAO] Son Kem Lì, Bền Màu Merzy Puffer Velvet Tint 3.7g', productImageURL: '/images/orders/lip-tint.png', classification: '#08 Unknown', canReview: true, reviewDeadline: '2025-07-04T23:59:59Z', reviewReward: 200,
//           OrderID: 1,
//           ProductID: 1
//         }]
//       },
//       {
//         OrderID: 2, OrderCode: 'UKMART001', UserID: 1, OrderDate: '2023-12-01T10:00:00Z', TotalAmount: 136850, SubtotalAmount: 161000, ShippingFee: 0, DiscountAmount: 24150, ShippingAddressID: 1, ShippingFullName: 'Name', ShippingPhoneNumber: '09xxxxxx', Notes: null, PaymentMethod: 'COD', PaymentStatus: 'Paid', OverallStatus: 'Completed', PlatformVoucherCode: null, PlatformDiscountAmount: 0, CreatedAt: '', UpdatedAt: '',
//         ShopID: 102, shopName: 'UKmart - Hàng Anh Thủ Đức', shopLevel: 'Yêu thích+', isFavoriteShop: true,
//         items: [{
//           OrderItemID: 2, VariantID: 2, Quantity: 1, PriceAtPurchase: 161000, OriginalPrice: 225000, Subtotal: 161000, IsFlashSaleItem: false, FlashSaleDealID: null, ReturnStatus: 'None', CreatedAt: '', productName: 'Toner Eveline 5% Glycolic Acid Glycol Therapy Cho Da Căng Bóng Mịn Màng Mờ Thâm Mụn Trẻ Hóa Da', productImageURL: '/images/orders/toner.png', classification: 'Glycol Therapy 110ml', canReview: true, reviewDeadline: '2025-07-03T23:59:59Z', reviewReward: 200,
//           OrderID: 2,
//           ProductID: 1
//         }]
//       },
//       {
//         OrderID: 3, OrderCode: 'PENDING001', UserID: 1, OrderDate: '2023-12-05T09:00:00Z', TotalAmount: 500000, SubtotalAmount: 500000, ShippingFee: 30000, DiscountAmount: 0, ShippingAddressID: 1, ShippingFullName: 'Name', ShippingPhoneNumber: '09xxxxxx', Notes: null, PaymentMethod: 'COD', PaymentStatus: 'Pending', OverallStatus: 'Pending', PlatformVoucherCode: null, PlatformDiscountAmount: 0, CreatedAt: '', UpdatedAt: '',
//         ShopID: 103, shopName: 'ABC Tech', shopLevel: 'Thường', isFavoriteShop: false,
//         items: [{
//           OrderItemID: 3, VariantID: 3, Quantity: 1, PriceAtPurchase: 500000, OriginalPrice: 550000, Subtotal: 500000, IsFlashSaleItem: false, FlashSaleDealID: null, ReturnStatus: 'None', CreatedAt: '', productName: 'Tai nghe Bluetooth X50', productImageURL: '/images/orders/earbuds.png', classification: 'Màu Đen', canReview: false,
//           OrderID: 3,
//           ProductID: 2
//         }]
//       },
//       {
//         OrderID: 4, OrderCode: 'SHIPPED001', UserID: 1, OrderDate: '2023-12-04T15:00:00Z', TotalAmount: 800000, SubtotalAmount: 800000, ShippingFee: 25000, DiscountAmount: 0, ShippingAddressID: 1, ShippingFullName: 'Name', ShippingPhoneNumber: '09xxxxxx', Notes: null, PaymentMethod: 'OnlineGateway', PaymentStatus: 'Paid', OverallStatus: 'Shipped', PlatformVoucherCode: null, PlatformDiscountAmount: 0, CreatedAt: '', UpdatedAt: '',
//         ShopID: 104, shopName: 'Laptop Pro', shopLevel: 'Mall', isFavoriteShop: false,
//         items: [{
//           OrderItemID: 4, VariantID: 4, Quantity: 1, PriceAtPurchase: 800000, OriginalPrice: 850000, Subtotal: 800000, IsFlashSaleItem: false, FlashSaleDealID: null, ReturnStatus: 'None', CreatedAt: '', productName: 'Chuột Gaming RGB Pro', productImageURL: '/images/orders/mouse.png', classification: 'Pro Series', canReview: false,
//           OrderID: 4,
//           ProductID: 2
//         }]
//       },
//       {
//         OrderID: 5, OrderCode: 'CANCELLED001', UserID: 1, OrderDate: '2023-11-20T14:00:00Z', TotalAmount: 150000, SubtotalAmount: 150000, ShippingFee: 0, DiscountAmount: 0, ShippingAddressID: 1, ShippingFullName: 'Name', ShippingPhoneNumber: '09xxxxxx', Notes: null, PaymentMethod: 'COD', PaymentStatus: 'Failed', OverallStatus: 'Cancelled', PlatformVoucherCode: null, PlatformDiscountAmount: 0, CreatedAt: '', UpdatedAt: '',
//         ShopID: 105, shopName: 'Phụ kiện HOT', shopLevel: 'Thường', isFavoriteShop: false,
//         items: [{
//           OrderItemID: 5, VariantID: 5, Quantity: 1, PriceAtPurchase: 150000, OriginalPrice: 150000, Subtotal: 150000, IsFlashSaleItem: false, FlashSaleDealID: null, ReturnStatus: 'None', CreatedAt: '', productName: 'Ốp lưng iPhone 15 Pro', productImageURL: '/images/orders/phone-case.png', classification: 'Màu Đen', canReview: false,
//           OrderID: 5,
//           ProductID: 2
//         }]
//       },
//       {
//         OrderID: 6, OrderCode: 'RETURNED001', UserID: 1, OrderDate: '2023-11-15T10:00:00Z', TotalAmount: 200000, SubtotalAmount: 200000, ShippingFee: 0, DiscountAmount: 0, ShippingAddressID: 1, ShippingFullName: 'Name', ShippingPhoneNumber: '09xxxxxx', Notes: null, PaymentMethod: 'OnlineGateway', PaymentStatus: 'Refunded', OverallStatus: 'ReturnedRefunded', PlatformVoucherCode: null, PlatformDiscountAmount: 0, CreatedAt: '', UpdatedAt: '',
//         ShopID: 106, shopName: 'Gia Dụng Xanh', shopLevel: 'Yêu thích+', isFavoriteShop: false,
//         items: [{
//           OrderItemID: 6, VariantID: 6, Quantity: 1, PriceAtPurchase: 200000, OriginalPrice: 200000, Subtotal: 200000, IsFlashSaleItem: false, FlashSaleDealID: null, ReturnStatus: 'Returned', CreatedAt: '', productName: 'Bình giữ nhiệt 500ml', productImageURL: '/images/orders/mug-blue.png', classification: 'Màu Xanh', canReview: false,
//           OrderID: 6,
//           ProductID: 3
//         }]
//       },
//       {
//         OrderID: 7, OrderCode: 'PROCESSING001', UserID: 1, OrderDate: '2023-12-03T11:00:00Z', TotalAmount: 300000, SubtotalAmount: 300000, ShippingFee: 0, DiscountAmount: 0, ShippingAddressID: 1, ShippingFullName: 'Name', ShippingPhoneNumber: '09xxxxxx', Notes: null, PaymentMethod: 'OnlineGateway', PaymentStatus: 'Paid', OverallStatus: 'Processing', PlatformVoucherCode: null, PlatformDiscountAmount: 0, CreatedAt: '', UpdatedAt: '', ShopID: 107, shopName: 'Smart Home', shopLevel: 'Thường', isFavoriteShop: false, items: [{
//           OrderItemID: 7, VariantID: 7, Quantity: 1, PriceAtPurchase: 300000, OriginalPrice: 320000, Subtotal: 300000, IsFlashSaleItem: false, FlashSaleDealID: null, ReturnStatus: 'None', CreatedAt: '', productName: 'Đèn LED thông minh', productImageURL: '/images/orders/smartwatch.png', classification: 'Trắng', canReview: false,
//           OrderID: 7,
//           ProductID: 3
//         }] },
//       {
//         OrderID: 8, OrderCode: 'DELIVERED001', UserID: 1, OrderDate: '2023-11-29T16:00:00Z', TotalAmount: 180000, SubtotalAmount: 180000, ShippingFee: 0, DiscountAmount: 0, ShippingAddressID: 1, ShippingFullName: 'Name', ShippingPhoneNumber: '09xxxxxx', Notes: null, PaymentMethod: 'COD', PaymentStatus: 'Paid', OverallStatus: 'Delivered', PlatformVoucherCode: null, PlatformDiscountAmount: 0, CreatedAt: '', UpdatedAt: '', ShopID: 108, shopName: 'Thời trang nam', shopLevel: 'Thường', isFavoriteShop: false, items: [{
//           OrderItemID: 8, VariantID: 8, Quantity: 2, PriceAtPurchase: 90000, OriginalPrice: 100000, Subtotal: 180000, IsFlashSaleItem: false, FlashSaleDealID: null, ReturnStatus: 'None', CreatedAt: '', productName: 'Áo phông Unisex', productImageURL: '/images/orders/mug-darkblue.png', classification: 'Size L, Trắng', canReview: true, reviewDeadline: '2025-06-30T23:59:59Z', reviewReward: 100,
//           OrderID: 8,
//           ProductID: 3
//         }] },
//       {
//         OrderID: 9, OrderCode: 'COMPLETED002', UserID: 1, OrderDate: '2023-11-20T10:00:00Z', TotalAmount: 450000, SubtotalAmount: 450000, ShippingFee: 0, DiscountAmount: 0, ShippingAddressID: 1, ShippingFullName: 'Name', ShippingPhoneNumber: '09xxxxxx', Notes: null, PaymentMethod: 'COD', PaymentStatus: 'Paid', OverallStatus: 'Completed', PlatformVoucherCode: null, PlatformDiscountAmount: 0, CreatedAt: '', UpdatedAt: '', ShopID: 101, shopName: 'Merzy Official Store', shopLevel: 'Mall', isFavoriteShop: false, items: [{
//           OrderItemID: 9, VariantID: 9, Quantity: 1, PriceAtPurchase: 450000, OriginalPrice: 500000, Subtotal: 450000, IsFlashSaleItem: false, FlashSaleDealID: null, ReturnStatus: 'None', CreatedAt: '', productName: 'Bảng phấn mắt 12 màu', productImageURL: '/images/orders/fabric-pink.png', classification: 'Nude Tones', canReview: true, reviewDeadline: '2025-07-01T23:59:59Z', reviewReward: 150,
//           OrderID: 9,
//           ProductID: 4
//         }] },
//       { OrderID: 10, OrderCode: 'COMPLETED003', UserID: 1, OrderDate: '2023-11-18T08:00:00Z', TotalAmount: 75000, SubtotalAmount: 75000, ShippingFee: 0, DiscountAmount: 0, ShippingAddressID: 1, ShippingFullName: 'Name', ShippingPhoneNumber: '09xxxxxx', Notes: null, PaymentMethod: 'OnlineGateway', PaymentStatus: 'Paid', OverallStatus: 'Completed', PlatformVoucherCode: null, PlatformDiscountAmount: 0, CreatedAt: '', UpdatedAt: '', ShopID: 102, shopName: 'UKmart - Hàng Anh Thủ Đức', shopLevel: 'Yêu thích+', isFavoriteShop: true, items: [{
//         OrderItemID: 10, VariantID: 10, Quantity: 1, PriceAtPurchase: 75000, OriginalPrice: 80000, Subtotal: 75000, IsFlashSaleItem: false, FlashSaleDealID: null, ReturnStatus: 'None', CreatedAt: '', productName: 'Sữa rửa mặt Cetaphil', productImageURL: '/images/orders/mug-red.png', classification: '125ml', canReview: true, reviewDeadline: '2025-06-25T23:59:59Z', reviewReward: 50,
//         OrderID: 10,
//         ProductID: 4
//       }] },
//       { OrderID: 11, OrderCode: 'COMPLETED004', UserID: 1, OrderDate: '2023-11-10T14:00:00Z', TotalAmount: 220000, SubtotalAmount: 220000, ShippingFee: 0, DiscountAmount: 0, ShippingAddressID: 1, ShippingFullName: 'Name', ShippingPhoneNumber: '09xxxxxx', Notes: null, PaymentMethod: 'COD', PaymentStatus: 'Paid', OverallStatus: 'Completed', PlatformVoucherCode: null, PlatformDiscountAmount: 0, CreatedAt: '', UpdatedAt: '', ShopID: 101, shopName: 'Merzy Official Store', shopLevel: 'Mall', isFavoriteShop: false, items: [{
//         OrderItemID: 11, VariantID: 11, Quantity: 1, PriceAtPurchase: 220000, OriginalPrice: 250000, Subtotal: 220000, IsFlashSaleItem: false, FlashSaleDealID: null, ReturnStatus: 'None', CreatedAt: '', productName: 'Kem dưỡng ẩm Cerave', productImageURL: '/images/orders/mug-designed.png', classification: '200ml', canReview: true, reviewDeadline: '2025-06-20T23:59:59Z', reviewReward: 100,
//         OrderID: 11,
//         ProductID: 4
//       }] },
//       { OrderID: 12, OrderCode: 'COMPLETED005', UserID: 1, OrderDate: '2023-11-05T11:00:00Z', TotalAmount: 110000, SubtotalAmount: 110000, ShippingFee: 0, DiscountAmount: 0, ShippingAddressID: 1, ShippingFullName: 'Name', ShippingPhoneNumber: '09xxxxxx', Notes: null, PaymentMethod: 'COD', PaymentStatus: 'Paid', OverallStatus: 'Completed', PlatformVoucherCode: null, PlatformDiscountAmount: 0, CreatedAt: '', UpdatedAt: '', ShopID: 102, shopName: 'UKmart - Hàng Anh Thủ Đức', shopLevel: 'Yêu thích+', isFavoriteShop: true, items: [{
//         OrderItemID: 12, VariantID: 12, Quantity: 1, PriceAtPurchase: 110000, OriginalPrice: 120000, Subtotal: 110000, IsFlashSaleItem: false, FlashSaleDealID: null, ReturnStatus: 'None', CreatedAt: '', productName: 'Nước hoa hồng Simple', productImageURL: '/images/orders/toner.png', classification: '200ml', canReview: true, reviewDeadline: '2025-06-15T23:59:59Z', reviewReward: 80,
//         OrderID: 12,
//         ProductID: 4
//       }] },
//     ];
//     setOrders(mockOrders);
//   }, []);

//   // Đếm số lượng đơn hàng theo các trạng thái trên UI
//   const getStatusCount = (status: OrderTabStatus): number => {
//     if (status === 'all') return orders.length;
//     return orders.filter(o => o.OverallStatus === status).length;
//   };

//   const statusTabs = [
//     { id: 'all', name: 'Tất cả', count: getStatusCount('all') },
//     { id: 'Pending', name: 'Chờ thanh toán', count: getStatusCount('Pending') },
//     { id: 'Shipped', name: 'Vận chuyển', count: getStatusCount('Shipped') },
//     { id: 'Processing', name: 'Chờ giao hàng', count: getStatusCount('Processing') },
//     { id: 'Completed', name: 'Hoàn thành', count: getStatusCount('Completed') },
//     { id: 'Cancelled', name: 'Đã hủy', count: getStatusCount('Cancelled') },
//     { id: 'ReturnedRefunded', name: 'Trả hàng/Hoàn tiền', count: getStatusCount('ReturnedRefunded') },
//   ];


//   // Bước 1: Lọc theo tab trạng thái
//   const filteredOrdersByTab = activeTab === 'all'
//     ? orders
//     : orders.filter(order => order.OverallStatus === activeTab);

//   // Bước 2: Lọc theo tìm kiếm văn bản (mã đơn hàng, tên sản phẩm)
//   const filteredOrdersBySearch = filteredOrdersByTab.filter(order => {
//     const lowerCaseQuery = searchQuery.toLowerCase().trim();
//     if (lowerCaseQuery === '') return true;

//     if (order.OrderCode.toLowerCase().includes(lowerCaseQuery)) {
//       return true;
//     }
//     if (order.items.some(item => item.productName.toLowerCase().includes(lowerCaseQuery))) {
//       return true;
//     }
//     return false;
//   });

//   // Bước 3: Lọc theo khoảng ngày
//   const filteredOrdersByDate = filteredOrdersBySearch.filter(order => {
//     const orderDate = new Date(order.OrderDate);
//     let isAfterStartDate = true;
//     let isBeforeEndDate = true;

//     if (startDateFilter) {
//       const start = new Date(startDateFilter);
//       start.setHours(0, 0, 0, 0);
//       isAfterStartDate = orderDate >= start;
//     }

//     if (endDateFilter) {
//       const end = new Date(endDateFilter);
//       end.setHours(23, 59, 59, 999);
//       isBeforeEndDate = orderDate <= end;
//     }

//     return isAfterStartDate && isBeforeEndDate;
//   });

//   // Bước 4: Sắp xếp
//   const sortedOrders = [...filteredOrdersByDate].sort((a, b) => {
//     const dateA = new Date(a.OrderDate).getTime();
//     const dateB = new Date(b.OrderDate).getTime();

//     if (sortOrder === 'newest') {
//       return dateB - dateA;
//     } else {
//       return dateA - dateB;
//     }
//   });

//   // Bước 5: Phân trang
//   const indexOfLastOrder = currentPage * ordersPerPage;
//   const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
//   const currentOrders = sortedOrders.slice(indexOfFirstOrder, indexOfLastOrder);

//   const totalPages = Math.ceil(sortedOrders.length / ordersPerPage);

//   const pageNumbers = [];
//   const maxPageButtons = 5;
//   let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
//   let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);
//   if (endPage - startPage + 1 < maxPageButtons) {
//     startPage = Math.max(1, endPage - maxPageButtons + 1);
//   }
//   for (let i = startPage; i <= endPage; i++) {
//     pageNumbers.push(i);
//   }

//   const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

//   useEffect(() => {
//     setCurrentPage(1);
//   }, [activeTab, searchQuery, startDateFilter, endDateFilter, sortOrder]);


//   return (
//     <div className="flex flex-col h-full"> {/* Thêm padding cho nội dung chính */}

      

//       {/* Bộ lọc ngày và Sắp xếp */}
//       <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 mb-6">
//         <div className="flex flex-grow items-center gap-2"> {/* Giảm gap cho ngày, để gọn hơn */}
//           <div className="relative flex items-center flex-grow min-w-0">
//             <input
//               type="text" // Đổi thành text để tự format ngày
//               placeholder="dd/mm/yyyy"
//               className="w-full py-2.5 pl-3 pr-8 border border-gray-300 rounded-lg shadow-sm
//                          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
//                          text-gray-700"
//               value={startDateFilter}
//               onChange={handleStartDateChange}
//               onFocus={(e) => e.target.type = 'date'} // Chuyển sang date khi focus
//               onBlur={(e) => { // Chuyển lại text khi blur nếu không có giá trị
//                 if (!e.target.value) e.target.type = 'text';
//               }}
//               title="Từ ngày"
//             />
//             <FaCalendarAlt className="absolute right-3 text-gray-400 pointer-events-none" />
//           </div>
//           <span className="flex-shrink-0 text-gray-500 self-center">đến</span>
//           <div className="relative flex items-center flex-grow min-w-0 group">
//             <input
//               type="text" // Đổi thành text để tự format ngày
//               placeholder="dd/mm/yyyy"
//               className="w-full py-2.5 pl-3 pr-8 border border-gray-300 rounded-lg shadow-sm
//                          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
//                          text-gray-700"
//               value={endDateFilter}
//               onChange={handleEndDateChange}
//               onFocus={(e) => e.target.type = 'date'}
//               onBlur={(e) => {
//                 if (!e.target.value) e.target.type = 'text';
//               }}
//               title="Đến ngày"
//             />
//             <FaCalendarAlt className="absolute right-3 text-gray-400 pointer-events-none" />
//             <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2 py-1 bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">Đến ngày</span>
//           </div>
//         </div>

//         {/* Sort Order Dropdown - Adjusted width */}
//         <select
//           className="flex-shrink-0 w-full md:w-auto py-2.5 px-3 border border-gray-300 rounded-lg shadow-sm
//                      bg-white text-gray-700 appearance-none cursor-pointer
//                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//           value={sortOrder}
//           onChange={handleSortChange}
//         >
//           <option value="newest">Mới nhất</option>
//           <option value="oldest">Cũ nhất</option>
//         </select>
//       </div>


//       {/* Status Tabs */}
//       <div className="overflow-x-auto no-scrollbar pb-2">
//         <div className="flex border-b border-gray-200 mb-6 whitespace-nowrap">
//           {statusTabs.map(tab => (
//             <button
//               key={tab.id}
//               className={`flex-shrink-0 text-sm px-2 font-semibold transition-colors duration-200
//                          ${activeTab === tab.id
//                            ? 'border-b-2 border-orange-500 text-orange-500'
//                            : 'text-gray-700 hover:text-orange-500 hover:border-orange-100 hover:border-b-2'
//                          }`}
//               onClick={() => setActiveTab(tab.id as OrderTabStatus)}
//             >
//               {tab.name} {tab.count > 0 && <span className="font-normal text-gray-500 ml-1">({tab.count})</span>}
//             </button>
//           ))}
//         </div>
//       </div>
//       { /* Thanh tìm kiếm */}
//       <div className="relative mb-4">
//         <input
//           type="text"
//           placeholder="Tìm kiếm theo mã đơn hàng hoặc tên sản phẩm..."
//           className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg shadow-sm
//                      focus:outline-none focus:ring-2 bg-[#f8f4f4] focus:ring-blue-500 focus:border-transparent
//                      text-gray-700 placeholder-gray-400"
//           value={searchQuery}
//           onChange={handleSearchChange}
//         />
//         <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
//       </div>
//       {/* List of Order Cards */}
//       <div className="flex-1">
//         {currentOrders.length > 0 ? (
//           currentOrders.map(order => (
//             <OrderCard
//               key={order.OrderID}
//               order={order}
//             />
//           ))
//         ) : (
//           <p className="text-center text-gray-500 mt-10 p-4 bg-white rounded-lg shadow-sm">Không có đơn hàng nào khớp với tiêu chí tìm kiếm hoặc lọc.</p>
//         )}
//       </div>

//       {/* Pagination Controls */}
//       {totalPages > 1 && (
//         <nav className="flex justify-center mt-8 mb-4 flex-shrink-0" aria-label="Pagination">
//           <ul className="flex list-none p-0 bg-white rounded-lg shadow-sm border border-gray-200">
//             <li>
//               <button
//                 onClick={() => paginate(currentPage - 1)}
//                 disabled={currentPage === 1}
//                 className="px-4 py-2 border-r border-gray-200 rounded-l-lg
//                            text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed
//                            transition-colors duration-200"
//               >
//                 Trước
//               </button>
//             </li>
//             {pageNumbers.map(number => (
//               <li key={number}>
//                 <button
//                   onClick={() => paginate(number)}
//                   className={`px-4 py-2 border-r border-gray-200
//                     ${currentPage === number
//                       ? 'bg-orange-500 text-white hover:bg-orange-600'
//                       : 'bg-white text-gray-700 hover:bg-gray-50'}
//                     transition-colors duration-200`}
//                 >
//                   {number}
//                 </button>
//               </li>
//             ))}
//             <li>
//               <button
//                 onClick={() => paginate(currentPage + 1)}
//                 disabled={currentPage === totalPages}
//                 className="px-4 py-2 rounded-r-lg
//                            text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed
//                            transition-colors duration-200"
//               >
//                 Sau
//               </button>
//             </li>
//           </ul>
//         </nav>
//       )}
//     </div>
//   );
// }

// app/(main)/(account)/components/ProfileOrderHistory.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation'; // Import useSearchParams
import OrderCard from './OrderCard';
import { Order, OrderItem, OrderStatus, ShopLevel, StatusTab, OrderTabStatus } from '@/types'; // Lấy types từ '@/types'
import { FaSearch, FaCalendarAlt } from 'react-icons/fa'; // Import icon tìm kiếm và lịch

// --- MOCK DATA CHO ProductVariants VÀ ProductImages ---
// Đây là các định nghĩa Mock cho dữ liệu mà bạn có từ database của mình.
// Trong ứng dụng thực tế, bạn sẽ fetch dữ liệu này từ API backend.
interface MockVariant {
  VariantID: number;
  ProductID: number;
  ImageURL: string | null;
  Price: number;
  CompareAtPrice: number | null;
  SKU: string | null;
  StockQuantity: number;
  IsActive: boolean;
  CreatedAt: string;
  UpdatedAt: string;
}

interface MockProductImage {
  ImageID: number;
  ProductID: number;
  ImageURL: string;
  IsPrimary: boolean;
}

const mockProductVariants: MockVariant[] = [
  { VariantID: 1, ProductID: 1, ImageURL: 'https://theson.vn/wp-content/uploads/2024/10/samsung-galaxy-s21-fe-5g-8gb-128gb-chinh-hang.jpg', Price: 28990000, CompareAtPrice: 30500000, SKU: 'XPROMAX-BLK-256', StockQuantity: 50, IsActive: true, CreatedAt: '', UpdatedAt: '' },
  { VariantID: 2, ProductID: 1, ImageURL: 'https://theson.vn/wp-content/uploads/2024/10/samsung-galaxy-s21-fe-5g-8gb-128gb-chinh-hang.jpg', Price: 32990000, CompareAtPrice: 34500000, SKU: 'XPROMAX-BLU-512', StockQuantity: 30, IsActive: true, CreatedAt: '', UpdatedAt: '' },
  { VariantID: 3, ProductID: 2, ImageURL: 'https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/s/a/samsung-galaxy-buds-3-6_2.png', Price: 2490000, CompareAtPrice: 2790000, SKU: 'ZBUDS3-WHT', StockQuantity: 100, IsActive: true, CreatedAt: '', UpdatedAt: '' },
  { VariantID: 4, ProductID: 2, ImageURL: 'https://theson.vn/wp-content/uploads/2024/10/samsung-galaxy-s21-fe-5g-8gb-128gb-chinh-hang.jpg', Price: 2490000, CompareAtPrice: 2790000, SKU: 'ZBUDS3-BLK', StockQuantity: 80, IsActive: true, CreatedAt: '', UpdatedAt: '' },
  { VariantID: 5, ProductID: 3, ImageURL: 'https://theson.vn/wp-content/uploads/2024/10/samsung-galaxy-s21-fe-5g-8gb-128gb-chinh-hang.jpg', Price: 350000, CompareAtPrice: null, SKU: 'TSHIRT-COT-BLK-M', StockQuantity: 150, IsActive: true, CreatedAt: '', UpdatedAt: '' },
  { VariantID: 6, ProductID: 3, ImageURL: 'https://theson.vn/wp-content/uploads/2024/10/samsung-galaxy-s21-fe-5g-8gb-128gb-chinh-hang.jpg', Price: 350000, CompareAtPrice: null, SKU: 'TSHIRT-COT-WHT-L', StockQuantity: 120, IsActive: true, CreatedAt: '', UpdatedAt: '' },
  { VariantID: 7, ProductID: 4, ImageURL: 'https://theson.vn/wp-content/uploads/2024/10/samsung-galaxy-s21-fe-5g-8gb-128gb-chinh-hang.jpg', Price: 25990000, CompareAtPrice: 27990000, SKU: 'ULTRA-Y-SLV-16-512', StockQuantity: 25, IsActive: true, CreatedAt: '', UpdatedAt: '' },
  { VariantID: 8, ProductID: 5, ImageURL: 'https://theson.vn/wp-content/uploads/2024/10/samsung-galaxy-s21-fe-5g-8gb-128gb-chinh-hang.jpg', Price: 8990000, CompareAtPrice: 9990000, SKU: 'GAMMA-G7-BLK-8-128', StockQuantity: 70, IsActive: true, CreatedAt: '', UpdatedAt: '' },
  { VariantID: 9, ProductID: 5, ImageURL: 'https://theson.vn/wp-content/uploads/2024/10/samsung-galaxy-s21-fe-5g-8gb-128gb-chinh-hang.jpg', Price: 10490000, CompareAtPrice: 11500000, SKU: 'GAMMA-G7-BLU-12-256', StockQuantity: 40, IsActive: true, CreatedAt: '', UpdatedAt: '' },
  { VariantID: 10, ProductID: 6, ImageURL: 'https://theson.vn/wp-content/uploads/2024/10/samsung-galaxy-s21-fe-5g-8gb-128gb-chinh-hang.jpg', Price: 38500000, CompareAtPrice: 42000000, SKU: 'TITANX-I7-4060-16-1T', StockQuantity: 20, IsActive: true, CreatedAt: '', UpdatedAt: '' },
  { VariantID: 11, ProductID: 6, ImageURL: 'https://theson.vn/wp-content/uploads/2024/10/samsung-galaxy-s21-fe-5g-8gb-128gb-chinh-hang.jpg', Price: 48990000, CompareAtPrice: 53000000, SKU: 'TITANX-I9-4070-32-2T', StockQuantity: 10, IsActive: true, CreatedAt: '', UpdatedAt: '' },
  { VariantID: 12, ProductID: 7, ImageURL: 'https://theson.vn/wp-content/uploads/2024/10/samsung-galaxy-s21-fe-5g-8gb-128gb-chinh-hang.jpg', Price: 650000, CompareAtPrice: null, SKU: 'JEANS-REG-BLU-30', StockQuantity: 90, IsActive: true, CreatedAt: '', UpdatedAt: '' },
  { VariantID: 63, ProductID: 55, ImageURL: null, Price: 1000000, CompareAtPrice: null, SKU: 'UNKNOWN-VARIANT', StockQuantity: 10, IsActive: true, CreatedAt: '', UpdatedAt: '' },
];

const mockProductImages: MockProductImage[] = [
  { ImageID: 1, ProductID: 1, ImageURL: 'https://theson.vn/wp-content/uploads/2024/10/samsung-galaxy-s21-fe-5g-8gb-128gb-chinh-hang.jpg', IsPrimary: true },
  { ImageID: 2, ProductID: 2, ImageURL: 'https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/s/a/samsung-galaxy-buds-3-6_2.png', IsPrimary: true },
  { ImageID: 3, ProductID: 3, ImageURL: 'https://picsum.photos/id/3/200/200', IsPrimary: true },
  { ImageID: 4, ProductID: 4, ImageURL: 'https://picsum.photos/id/4/200/200', IsPrimary: true },
  { ImageID: 5, ProductID: 5, ImageURL: 'https://picsum.photos/id/5/200/200', IsPrimary: true },
  { ImageID: 6, ProductID: 6, ImageURL: 'https://picsum.photos/id/6/200/200', IsPrimary: true },
  { ImageID: 7, ProductID: 7, ImageURL: 'https://picsum.photos/id/7/200/200', IsPrimary: true },
  { ImageID: 55, ProductID: 55, ImageURL: 'https://cdn.tgdd.vn/Products/Images/54/327554/tai-nghe-bluetooth-true-wireless-samsung-galaxy-buds-3-pro-r630n-xam-1-750x500.jpg', IsPrimary: true },
  { ImageID: 1001, ProductID: 1001, ImageURL: 'https://picsum.photos/id/1001/200/200', IsPrimary: true },
  { ImageID: 2001, ProductID: 2001, ImageURL: 'https://picsum.photos/id/2001/200/200', IsPrimary: true },
  { ImageID: 2002, ProductID: 2002, ImageURL: 'https://picsum.photos/id/2002/200/200', IsPrimary: true },
  { ImageID: 3001, ProductID: 3001, ImageURL: 'https://picsum.photos/id/3001/200/200', IsPrimary: true },
  { ImageID: 3002, ProductID: 3002, ImageURL: 'https://picsum.photos/id/3002/200/200', IsPrimary: true },
];

const DEFAULT_PLACEHOLDER_IMAGE = '/images/placeholder.png';

const getProductImageUrl = (variantId: number, productId: number): string => {
  const variant = mockProductVariants.find(v => v.VariantID === variantId);
  if (variant && variant.ImageURL) {
    return variant.ImageURL;
  }

  const productPrimaryImage = mockProductImages.find(pi => pi.ProductID === productId && pi.IsPrimary);
  if (productPrimaryImage && productPrimaryImage.ImageURL) {
    return productPrimaryImage.ImageURL;
  }

  return DEFAULT_PLACEHOLDER_IMAGE;
};

// Hàm tạo OrderItem cho LỊCH SỬ ĐƠN HÀNG
const generateOrderItem = (
  orderId: number,
  itemSeed: number, // Dùng cho OrderItemID
  productName: string,
  classification: string,
  originalPrice: number,
  priceAtPurchase: number,
  quantity: number,
  variantId: number,
  productId: number,
  canReview: boolean = false,
  reviewDeadline?: string,
  reviewReward?: number,
  productAttributes?: { attributeName: string; attributeValue: string }[],
): OrderItem => {
  const productImageURL = getProductImageUrl(variantId, productId);

  return {
    OrderItemID: itemSeed,
    OrderID: orderId,
    ProductID: productId,
    VariantID: variantId,
    Quantity: quantity,
    PriceAtPurchase: priceAtPurchase,
    OriginalPrice: originalPrice,
    Subtotal: priceAtPurchase * quantity,
    IsFlashSaleItem: false,
    FlashSaleDealID: null,
    ReturnStatus: 'None',
    CreatedAt: new Date().toISOString(),
    productName: productName,
    productImageURL: productImageURL,
    classification: classification,
    canReview: canReview,
    reviewDeadline: reviewDeadline,
    reviewReward: reviewReward,
    productAttributes: productAttributes,
  };
};


export default function ProfileOrderHistory() {
  const searchParams = useSearchParams(); // Khởi tạo useSearchParams
  // Lấy status từ URL, nếu có và hợp lệ, đặt làm activeTab ban đầu
  const initialStatus = searchParams.get('status') as OrderStatus;

  // Hàm mapping từ DB OverallStatus sang UI tab ID (OrderTabStatus)
  const mapDbStatusToUiTab = (dbStatus: OrderStatus): OrderTabStatus => {
    switch (dbStatus) {
      case 'Pending': return 'PendingPayment';
      case 'Processing': return 'Processing';
      case 'Shipped': return 'Shipped';
      case 'Delivered': return 'Completed';
      case 'Completed': return 'Completed';
      case 'CancelledByBuyer': return 'Cancelled';
      case 'CancelledBySeller': return 'Cancelled';
      case 'Returned': return 'ReturnedRefunded';
      case 'ReturnInProgress': return 'ReturnedRefunded';
      default: return 'all'; // Fallback nếu trạng thái không khớp
    }
  };

  const [activeTab, setActiveTab] = useState<OrderTabStatus>(
    (initialStatus && (
      initialStatus === 'Pending' || initialStatus === 'Processing' || initialStatus === 'Shipped' ||
      initialStatus === 'Delivered' || initialStatus === 'Completed' ||
      initialStatus === 'CancelledByBuyer' || initialStatus === 'CancelledBySeller' ||
      initialStatus === 'Returned' || initialStatus === 'ReturnInProgress'
    )) ? mapDbStatusToUiTab(initialStatus) : 'Completed' // Mặc định là 'Hoàn thành' nếu không có hoặc không hợp lệ
  );

  const [orders, setOrders] = useState<Order[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  // Cập nhật useEffect để lắng nghe thay đổi của searchParams
  useEffect(() => {
    const statusParam = searchParams.get('status') as OrderStatus;
    if (statusParam) {
      setActiveTab(mapDbStatusToUiTab(statusParam));
      setCurrentPage(1); // Reset trang khi tab thay đổi từ URL
    }
  }, [searchParams]); // Chạy khi searchParams thay đổi


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
      {
        OrderID: 1, OrderCode: 'MERZY001', UserID: 1, OrderDate: '2023-12-02T12:38:00Z', TotalAmount: 160650, SubtotalAmount: 189000, ShippingFee: 0, DiscountAmount: 28350, PaymentMethod: 'COD', PaymentStatus: 'Paid', OverallStatus: 'Completed', PlatformVoucherCode: null, PlatformDiscountAmount: 0, ShippingAddressID: 1, ShippingFullName: 'Name', ShippingPhoneNumber: '09xxxxxx', Notes: null, CreatedAt: '', UpdatedAt: '',
        ShopID: 101, shopName: 'Merzy Official Store', shopLevel: 'Mall', isFavoriteShop: false,
        items: [generateOrderItem(1, 1, '[NEW][SON PHAO] Son Kem Lì, Bền Màu Merzy Puffer Velvet Tint 3.7g', '#08 Unknown', 319000, 189000, 1, 1, 1, true, '2025-07-04T23:59:59Z', 200, [{ attributeName: 'Color', attributeValue: 'Red' }])]
      },
      {
        OrderID: 2, OrderCode: 'UKMART001', UserID: 1, OrderDate: '2023-12-01T10:00:00Z', TotalAmount: 136850, SubtotalAmount: 161000, ShippingFee: 0, DiscountAmount: 24150, PaymentMethod: 'COD', PaymentStatus: 'Paid', OverallStatus: 'Completed', PlatformVoucherCode: null, PlatformDiscountAmount: 0, ShippingAddressID: 1, ShippingFullName: 'Name', ShippingPhoneNumber: '09xxxxxx', Notes: null, CreatedAt: '', UpdatedAt: '',
        ShopID: 102, shopName: 'UKmart - Hàng Anh Thủ Đức', shopLevel: 'Yêu thích+', isFavoriteShop: true,
        items: [generateOrderItem(2, 2, 'Toner Eveline 5% Glycolic Acid Glycol Therapy Cho Da Căng Bóng Mịn Màng Mờ Thâm Mụn Trẻ Hóa Da', 'Glycol Therapy 110ml', 225000, 161000, 1, 3, 2, true, '2025-07-03T23:59:59Z', 200, [{ attributeName: 'Volume', attributeValue: '110ml' }])]
      },
      {
        OrderID: 3, OrderCode: 'PENDING001', UserID: 1, OrderDate: '2023-12-05T09:00:00Z', TotalAmount: 500000, SubtotalAmount: 500000, ShippingFee: 30000, DiscountAmount: 0, PaymentMethod: 'COD', PaymentStatus: 'Pending', OverallStatus: 'Pending', PlatformVoucherCode: null, PlatformDiscountAmount: 0, ShippingAddressID: 1, ShippingFullName: 'Name', ShippingPhoneNumber: '09xxxxxx', Notes: null, CreatedAt: '', UpdatedAt: '',
        ShopID: 103, shopName: 'ABC Tech', shopLevel: 'Thường', isFavoriteShop: false,
        items: [generateOrderItem(3, 3, 'Tai nghe Bluetooth X50', 'Màu Đen', 550000, 500000, 1, 5, 3, false, undefined, undefined, [{ attributeName: 'Color', attributeValue: 'Black' }])]
      },
      {
        OrderID: 4, OrderCode: 'SHIPPED001', UserID: 1, OrderDate: '2023-12-04T15:00:00Z', TotalAmount: 800000, SubtotalAmount: 800000, ShippingFee: 25000, DiscountAmount: 0, PaymentMethod: 'OnlineGateway', PaymentStatus: 'Paid', OverallStatus: 'Shipped', PlatformVoucherCode: null, PlatformDiscountAmount: 0, ShippingAddressID: 1, ShippingFullName: 'Name', ShippingPhoneNumber: '09xxxxxx', Notes: null, CreatedAt: '', UpdatedAt: '',
        ShopID: 104, shopName: 'Laptop Pro', shopLevel: 'Mall', isFavoriteShop: false,
        items: [generateOrderItem(4, 4, 'Chuột Gaming RGB Pro', 'Pro Series', 850000, 800000, 1, 7, 4, false, undefined, undefined, [{ attributeName: 'Type', attributeValue: 'Wireless' }])]
      },
      {
        OrderID: 5, OrderCode: 'CANCELLED001', UserID: 1, OrderDate: '2023-11-20T14:00:00Z', TotalAmount: 150000, SubtotalAmount: 150000, ShippingFee: 0, DiscountAmount: 0, PaymentMethod: 'COD', PaymentStatus: 'Failed', OverallStatus: 'CancelledByBuyer', PlatformVoucherCode: null, PlatformDiscountAmount: 0, ShippingAddressID: 1, ShippingFullName: 'Name', ShippingPhoneNumber: '09xxxxxx', Notes: null, CreatedAt: '', UpdatedAt: '',
        ShopID: 105, shopName: 'Phụ kiện HOT', shopLevel: 'Thường', isFavoriteShop: false,
        items: [generateOrderItem(5, 5, 'Ốp lưng iPhone 15 Pro', 'Màu Đen', 150000, 150000, 1, 8, 5, false, undefined, undefined, [{ attributeName: 'Color', attributeValue: 'Black' }])]
      },
      {
        OrderID: 6, OrderCode: 'RETURNED001', UserID: 1, OrderDate: '2023-11-15T10:00:00Z', TotalAmount: 200000, SubtotalAmount: 200000, ShippingFee: 0, DiscountAmount: 0, PaymentMethod: 'OnlineGateway', PaymentStatus: 'Refunded', OverallStatus: 'Returned', PlatformVoucherCode: null, PlatformDiscountAmount: 0, ShippingAddressID: 1, ShippingFullName: 'Name', ShippingPhoneNumber: '09xxxxxx', Notes: null, CreatedAt: '', UpdatedAt: '',
        ShopID: 106, shopName: 'Gia Dụng Xanh', shopLevel: 'Yêu thích+', isFavoriteShop: false,
        items: [generateOrderItem(6, 6, 'Bình giữ nhiệt 500ml', 'Màu Xanh', 200000, 200000, 1, 10, 6, false, undefined, undefined, [{ attributeName: 'Color', attributeValue: 'Green' }])]
      },
      {
        OrderID: 7, OrderCode: 'PROCESSING001', UserID: 1, OrderDate: '2023-12-03T11:00:00Z', TotalAmount: 300000, SubtotalAmount: 300000, ShippingFee: 0, DiscountAmount: 0, PaymentMethod: 'OnlineGateway', PaymentStatus: 'Paid', OverallStatus: 'Processing', PlatformVoucherCode: null, PlatformDiscountAmount: 0, ShippingAddressID: 1, ShippingFullName: 'Name', ShippingPhoneNumber: '09xxxxxx', Notes: null, CreatedAt: '', UpdatedAt: '', ShopID: 107, shopName: 'Smart Home', shopLevel: 'Thường', isFavoriteShop: false, items: [generateOrderItem(7, 7, 'Đèn LED thông minh', 'Trắng', 320000, 300000, 1, 12, 7, false, undefined, undefined, [{ attributeName: 'Color', attributeValue: 'White' }])] },
      {
        OrderID: 8, OrderCode: 'DELIVERED001', UserID: 1, OrderDate: '2023-11-29T16:00:00Z', TotalAmount: 180000, SubtotalAmount: 180000, ShippingFee: 0, DiscountAmount: 0, PaymentMethod: 'COD', PaymentStatus: 'Paid', OverallStatus: 'Delivered', PlatformVoucherCode: null, PlatformDiscountAmount: 0, ShippingAddressID: 1, ShippingFullName: 'Name', ShippingPhoneNumber: '09xxxxxx', Notes: null, CreatedAt: '', UpdatedAt: '', ShopID: 108, shopName: 'Thời trang nam', shopLevel: 'Thường', isFavoriteShop: false, items: [generateOrderItem(8, 8, 'Áo phông Unisex', 'Size L, Trắng', 100000, 90000, 2, 14, 8, true, '2025-06-30T23:59:59Z', 100, [{ attributeName: 'Size', attributeValue: 'L' }, { attributeName: 'Color', attributeValue: 'White' }])] },
      {
        OrderID: 9, OrderCode: 'COMPLETED002', UserID: 1, OrderDate: '2023-11-20T10:00:00Z', TotalAmount: 450000, SubtotalAmount: 450000, ShippingFee: 0, DiscountAmount: 0, PaymentMethod: 'COD', PaymentStatus: 'Paid', OverallStatus: 'Completed', PlatformVoucherCode: null, PlatformDiscountAmount: 0, ShippingAddressID: 1, ShippingFullName: 'Name', ShippingPhoneNumber: '09xxxxxx', Notes: null, CreatedAt: '', UpdatedAt: '', ShopID: 101, shopName: 'Merzy Official Store', shopLevel: 'Mall', isFavoriteShop: false, items: [generateOrderItem(9, 9, 'Bảng phấn mắt 12 màu', 'Nude Tones', 500000, 450000, 1, 16, 9, true, '2025-07-01T23:59:59Z', 150, [{ attributeName: 'Color', attributeValue: 'Nude' }])] },
      { OrderID: 10, OrderCode: 'COMPLETED003', UserID: 1, OrderDate: '2023-11-18T08:00:00Z', TotalAmount: 75000, SubtotalAmount: 75000, ShippingFee: 0, DiscountAmount: 0, PaymentMethod: 'OnlineGateway', PaymentStatus: 'Paid', OverallStatus: 'Completed', PlatformVoucherCode: null, PlatformDiscountAmount: 0, ShippingAddressID: 1, ShippingFullName: 'Name', ShippingPhoneNumber: '09xxxxxx', Notes: null, CreatedAt: '', UpdatedAt: '', ShopID: 102, shopName: 'UKmart - Hàng Anh Thủ Đức', shopLevel: 'Yêu thích+', isFavoriteShop: true, items: [generateOrderItem(10, 10, 'Sữa rửa mặt Cetaphil', '125ml', 80000, 75000, 1, 18, 10, true, '2025-06-25T23:59:59Z', 50, [{ attributeName: 'Volume', attributeValue: '125ml' }])] },
      { OrderID: 11, OrderCode: 'COMPLETED004', UserID: 1, OrderDate: '2023-11-10T14:00:00Z', TotalAmount: 220000, SubtotalAmount: 220000, ShippingFee: 0, DiscountAmount: 0, PaymentMethod: 'COD', PaymentStatus: 'Paid', OverallStatus: 'Completed', PlatformVoucherCode: null, PlatformDiscountAmount: 0, ShippingAddressID: 1, ShippingFullName: 'Name', ShippingPhoneNumber: '09xxxxxx', Notes: null, CreatedAt: '', UpdatedAt: '', ShopID: 101, shopName: 'Merzy Official Store', shopLevel: 'Mall', isFavoriteShop: false, items: [generateOrderItem(11, 11, 'Kem dưỡng ẩm Cerave', '200ml', 250000, 220000, 1, 20, 11, true, '2025-06-20T23:59:59Z', 100, [{ attributeName: 'Volume', attributeValue: '200ml' }])] },
      { OrderID: 12, OrderCode: 'COMPLETED005', UserID: 1, OrderDate: '2023-11-05T11:00:00Z', TotalAmount: 110000, SubtotalAmount: 110000, ShippingFee: 0, DiscountAmount: 0, PaymentMethod: 'COD', PaymentStatus: 'Paid', OverallStatus: 'Completed', PlatformVoucherCode: null, PlatformDiscountAmount: 0, ShippingAddressID: 1, ShippingFullName: 'Name', ShippingPhoneNumber: '09xxxxxx', Notes: null, CreatedAt: '', UpdatedAt: '', ShopID: 102, shopName: 'UKmart - Hàng Anh Thủ Đức', shopLevel: 'Yêu thích+', isFavoriteShop: true, items: [generateOrderItem(12, 12, 'Nước hoa hồng Simple', '200ml', 120000, 110000, 1, 22, 12, true, '2025-06-15T23:59:59Z', 80, [{ attributeName: 'Volume', attributeValue: '200ml' }])] },
      { OrderID: 13, OrderCode: 'NOVARIANTIMG', UserID: 1, OrderDate: '2023-10-30T10:00:00Z', TotalAmount: 200000, SubtotalAmount: 200000, ShippingFee: 0, DiscountAmount: 0, PaymentMethod: 'COD', PaymentStatus: 'Paid', OverallStatus: 'Completed', PlatformVoucherCode: null, PlatformDiscountAmount: 0, ShippingAddressID: 1, ShippingFullName: 'Name', ShippingPhoneNumber: '09xxxxxx', Notes: null, CreatedAt: '', UpdatedAt: '', ShopID: 101, shopName: 'Merzy Official Store', shopLevel: 'Mall', isFavoriteShop: false, items: [generateOrderItem(13, 13, 'Test Product: No Variant Image', 'Default', 250000, 200000, 1, 63, 55, false, undefined, undefined, [{ attributeName: 'Size', attributeValue: 'Default' }])] },
      { OrderID: 14, OrderCode: 'NOIMAGEALL', UserID: 1, OrderDate: '2023-10-25T11:00:00Z', TotalAmount: 50000, SubtotalAmount: 50000, ShippingFee: 0, DiscountAmount: 0, PaymentMethod: 'COD', PaymentStatus: 'Paid', OverallStatus: 'Completed', PlatformVoucherCode: null, PlatformDiscountAmount: 0, ShippingAddressID: 1, ShippingFullName: 'Name', ShippingPhoneNumber: '09xxxxxx', Notes: null, CreatedAt: '', UpdatedAt: '', ShopID: 102, shopName: 'UKmart - Hàng Anh Thủ Đức', shopLevel: 'Yêu thích+', isFavoriteShop: true, items: [generateOrderItem(14, 14, 'Test Product: No Image At All', 'Generic', 60000, 50000, 1, 9999, 9999, false, undefined, undefined, [{ attributeName: 'Type', attributeValue: 'Generic' }])] },
    ];
    setOrders(mockOrders);
  }, []);

  const getStatusCount = (status: OrderTabStatus): number => {
    if (status === 'all') return orders.length;
    // Cập nhật mapping từ OrderTabStatus sang OrderStatus (DB)
    let dbStatus: OrderStatus | OrderStatus[] | undefined;
    switch (status) {
      case 'PendingPayment': dbStatus = 'Pending'; break;
      case 'Processing': dbStatus = 'Processing'; break; // 'Chờ giao hàng'
      case 'Shipped': dbStatus = 'Shipped'; break;
      case 'Completed': dbStatus = 'Completed'; break;
      case 'Cancelled': dbStatus = ['CancelledByBuyer', 'CancelledBySeller']; break; // Đã hủy
      case 'ReturnedRefunded': dbStatus = ['Returned', 'ReturnInProgress']; break; // Trả hàng/Hoàn tiền
      default: return 0; // Should not happen for 'all'
    }

    if (Array.isArray(dbStatus)) {
      return orders.filter(o => dbStatus?.includes(o.OverallStatus)).length;
    }
    return orders.filter(o => o.OverallStatus === dbStatus).length;
  };

  const statusTabs: StatusTab[] = [
    { id: 'all', name: 'Tất cả', count: getStatusCount('all') },
    { id: 'PendingPayment', name: 'Chờ thanh toán', count: getStatusCount('PendingPayment') },
    { id: 'Shipped', name: 'Vận chuyển', count: getStatusCount('Shipped') },
    { id: 'Processing', name: 'Chờ giao hàng', count: getStatusCount('Processing') },
    { id: 'Completed', name: 'Hoàn thành', count: getStatusCount('Completed') },
    { id: 'Cancelled', name: 'Đã hủy', count: getStatusCount('Cancelled') },
    { id: 'ReturnedRefunded', name: 'Trả hàng/Hoàn tiền', count: getStatusCount('ReturnedRefunded') },
  ];

  const filteredOrdersByTab = activeTab === 'all'
    ? orders
    : orders.filter(order => {
        // Cập nhật logic lọc theo tab để khớp với OrderStatus của DB
        switch (activeTab) {
          case 'PendingPayment': return order.OverallStatus === 'Pending';
          case 'Processing': return order.OverallStatus === 'Processing';
          case 'Shipped': return order.OverallStatus === 'Shipped';
          case 'Completed': return order.OverallStatus === 'Completed';
          case 'Cancelled': return order.OverallStatus === 'CancelledByBuyer' || order.OverallStatus === 'CancelledBySeller';
          case 'ReturnedRefunded': return order.OverallStatus === 'Returned' || order.OverallStatus === 'ReturnInProgress';
          default: return true; // 'all' tab
        }
      });

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

  const sortedOrders = [...filteredOrdersByDate].sort((a, b) => {
    const dateA = new Date(a.OrderDate).getTime();
    const dateB = new Date(b.OrderDate).getTime();

    if (sortOrder === 'newest') {
      return dateB - dateA;
    } else {
      return dateA - dateB;
    }
  });

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
    <div className="flex flex-col h-full px-6 py-6">
      
      

      {/* Bộ lọc ngày và Sắp xếp */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 mb-6">
        <div className="flex flex-grow items-center gap-2">
          {/* Start Date Filter */}
          <div className="relative flex items-center flex-grow min-w-0">
            <input
              type="text"
              placeholder="dd/mm/yyyy"
              className="w-full py-2.5 pl-3 pr-8 border border-gray-300 rounded-lg shadow-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         text-gray-700"
              value={startDateFilter}
              onChange={handleStartDateChange}
              onFocus={(e) => e.target.type = 'date'}
              onBlur={(e) => { if (!e.target.value) e.target.type = 'text'; }}
              title="Từ ngày"
            />
            <FaCalendarAlt className="absolute right-3 text-gray-400 pointer-events-none" />
          </div>
          <span className="flex-shrink-0 text-gray-500 self-center">đến</span>
          {/* End Date Filter */}
          <div className="relative flex items-center flex-grow min-w-0 group">
            <input
              type="text"
              placeholder="dd/mm/yyyy"
              className="w-full py-2.5 pl-3 pr-8 border border-gray-300 rounded-lg shadow-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         text-gray-700"
              value={endDateFilter}
              onChange={handleEndDateChange}
              onFocus={(e) => e.target.type = 'date'}
              onBlur={(e) => {
                if (!e.target.value) e.target.type = 'text';
              }}
              title="Đến ngày"
            />
            <FaCalendarAlt className="absolute right-3 text-gray-400 pointer-events-none" />
            <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2 py-1 bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">Đến ngày</span>
          </div>
        </div>

        {/* Sort Order Dropdown */}
        <select
          className="flex-shrink-0 w-full md:w-auto py-2.5 px-3 border border-gray-300 rounded-lg shadow-sm
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
      <div className="sticky top-[56px] z-10 bg-white border-b border-gray-200 -mx-6">
        <div className="overflow-x-auto no-scrollbar pb-2">
          <div className="flex whitespace-nowrap px-6">
            {statusTabs.map(tab => (
              <button
                key={tab.id}
                className={`flex-shrink-0 px-2 text-sm font-semibold transition-colors duration-200
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
        </div>
      </div>

      {/* Thanh tìm kiếm */}
      <div className="relative mt-4">
        <input
          type="text"
          placeholder="Tìm kiếm theo mã đơn hàng hoặc tên sản phẩm..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300  bg-[#f8f4f4] rounded-lg shadow-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     text-gray-700 placeholder-gray-400"
          value={searchQuery}
          onChange={handleSearchChange}
        />
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      </div>

      {/* List of Order Cards */}
      <div className="flex-1 pt-4">
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
        <nav className="flex justify-center mt-8 mb-4 flex-shrink-0" aria-label="Pagination">
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