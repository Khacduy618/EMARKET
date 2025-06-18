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
}