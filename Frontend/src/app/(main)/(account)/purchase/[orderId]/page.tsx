// // app/(main)/(account)/orders/[orderId]/page.tsx
// 'use client';

// import React, { useEffect, useState } from 'react';
// import { useParams } from 'next/navigation';
// import OrderDetailContent from '../components/OrderDetailContent'; // Import component chính cho trang chi tiết

// import { Order, OrderItem, OrderStatus, OrderStatusHistory, ShippingTracking, ShopLevel } from '@/types'; // Import các types cần thiết

// // --- MOCK DATA CHO ProductVariants VÀ ProductImages ---
// interface MockVariant {
//   VariantID: number; ProductID: number; ImageURL: string | null; Price: number; CompareAtPrice: number | null; SKU: string | null; StockQuantity: number; IsActive: boolean; CreatedAt: string; UpdatedAt: string;
// }
// interface MockProductImage {
//   ImageID: number; ProductID: number; ImageURL: string; IsPrimary: boolean;
// }
// const mockProductVariants: MockVariant[] = [
//   { VariantID: 1, ProductID: 1, ImageURL: 'https://theson.vn/wp-content/uploads/2024/10/samsung-galaxy-s21-fe-5g-8gb-128gb-chinh-hang.jpg', Price: 28990000, CompareAtPrice: 30500000, SKU: 'XPROMAX-BLK-256', StockQuantity: 50, IsActive: true, CreatedAt: '', UpdatedAt: '' },
//   { VariantID: 2, ProductID: 1, ImageURL: 'https://theson.vn/wp-content/uploads/2024/10/samsung-galaxy-s21-fe-5g-8gb-128gb-chinh-hang.jpg', Price: 32990000, CompareAtPrice: 34500000, SKU: 'XPROMAX-BLU-512', StockQuantity: 30, IsActive: true, CreatedAt: '', UpdatedAt: '' },
//   { VariantID: 3, ProductID: 2, ImageURL: 'https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/s/a/samsung-galaxy-buds-3-6_2.png', Price: 2490000, CompareAtPrice: 2790000, SKU: 'ZBUDS3-WHT', StockQuantity: 100, IsActive: true, CreatedAt: '', UpdatedAt: '' },
//   { VariantID: 4, ProductID: 2, ImageURL: 'https://theson.vn/wp-content/uploads/2024/10/samsung-galaxy-s21-fe-5g-8gb-128gb-chinh-hang.jpg', Price: 2490000, CompareAtPrice: 2790000, SKU: 'ZBUDS3-BLK', StockQuantity: 80, IsActive: true, CreatedAt: '', UpdatedAt: '' },
//   { VariantID: 5, ProductID: 3, ImageURL: 'https://theson.vn/wp-content/uploads/2024/10/samsung-galaxy-s21-fe-5g-8gb-128gb-chinh-hang.jpg', Price: 350000, CompareAtPrice: null, SKU: 'TSHIRT-COT-BLK-M', StockQuantity: 150, IsActive: true, CreatedAt: '', UpdatedAt: '' },
//   { VariantID: 6, ProductID: 3, ImageURL: 'https://theson.vn/wp-content/uploads/2024/10/samsung-galaxy-s21-fe-5g-8gb-128gb-chinh-hang.jpg', Price: 350000, CompareAtPrice: null, SKU: 'TSHIRT-COT-WHT-L', StockQuantity: 120, IsActive: true, CreatedAt: '', UpdatedAt: '' },
//   { VariantID: 7, ProductID: 4, ImageURL: 'https://theson.vn/wp-content/uploads/2024/10/samsung-galaxy-s21-fe-5g-8gb-128gb-chinh-hang.jpg', Price: 25990000, CompareAtPrice: 27990000, SKU: 'ULTRA-Y-SLV-16-512', StockQuantity: 25, IsActive: true, CreatedAt: '', UpdatedAt: '' },
//   { VariantID: 8, ProductID: 5, ImageURL: 'https://theson.vn/wp-content/uploads/2024/10/samsung-galaxy-s21-fe-5g-8gb-128gb-chinh-hang.jpg', Price: 8990000, CompareAtPrice: 9990000, SKU: 'GAMMA-G7-BLK-8-128', StockQuantity: 70, IsActive: true, CreatedAt: '', UpdatedAt: '' },
//   { VariantID: 9, ProductID: 5, ImageURL: 'https://theson.vn/wp-content/uploads/2024/10/samsung-galaxy-s21-fe-5g-8gb-128gb-chinh-hang.jpg', Price: 10490000, CompareAtPrice: 11500000, SKU: 'GAMMA-G7-BLU-12-256', StockQuantity: 40, IsActive: true, CreatedAt: '', UpdatedAt: '' },
//   { VariantID: 10, ProductID: 6, ImageURL: 'https://theson.vn/wp-content/uploads/2024/10/samsung-galaxy-s21-fe-5g-8gb-128gb-chinh-hang.jpg', Price: 38500000, CompareAtPrice: 42000000, SKU: 'TITANX-I7-4060-16-1T', StockQuantity: 20, IsActive: true, CreatedAt: '', UpdatedAt: '' },
//   { VariantID: 11, ProductID: 6, ImageURL: 'https://theson.vn/wp-content/uploads/2024/10/samsung-galaxy-s21-fe-5g-8gb-128gb-chinh-hang.jpg', Price: 48990000, CompareAtPrice: 53000000, SKU: 'TITANX-I9-4070-32-2T', StockQuantity: 10, IsActive: true, CreatedAt: '', UpdatedAt: '' },
//   { VariantID: 12, ProductID: 7, ImageURL: 'https://theson.vn/wp-content/uploads/2024/10/samsung-galaxy-s21-fe-5g-8gb-128gb-chinh-hang.jpg', Price: 650000, CompareAtPrice: null, SKU: 'JEANS-REG-BLU-30', StockQuantity: 90, IsActive: true, CreatedAt: '', UpdatedAt: '' },
//   { VariantID: 63, ProductID: 55, ImageURL: null, Price: 1000000, CompareAtPrice: null, SKU: 'UNKNOWN-VARIANT', StockQuantity: 10, IsActive: true, CreatedAt: '', UpdatedAt: '' },
//   { VariantID: 100, ProductID: 100, ImageURL: 'https://picsum.photos/id/100/200/200', Price: 1000000, CompareAtPrice: 1200000, SKU: 'VIRTUAL-PROD-1', StockQuantity: 100, IsActive: true, CreatedAt: '', UpdatedAt: '' },
//   { VariantID: 101, ProductID: 101, ImageURL: 'https://picsum.photos/id/101/200/200', Price: 500000, CompareAtPrice: 600000, SKU: 'VIRTUAL-PROD-2', StockQuantity: 100, IsActive: true, CreatedAt: '', UpdatedAt: '' },
//   { VariantID: 102, ProductID: 102, ImageURL: 'https://picsum.photos/id/102/200/200', Price: 200000, CompareAtPrice: 250000, SKU: 'VIRTUAL-PROD-3', StockQuantity: 100, IsActive: true, CreatedAt: '', UpdatedAt: '' },
//   { VariantID: 300, ProductID: 300, ImageURL: 'https://picsum.photos/id/300/200/200', Price: 168800, CompareAtPrice: 190000, SKU: 'VIBESTU-TQ-BIG', StockQuantity: 50, IsActive: true, CreatedAt: '', UpdatedAt: '' },
//   { VariantID: 301, ProductID: 301, ImageURL: 'https://picsum.photos/id/301/200/200', Price: 168800, CompareAtPrice: 190000, SKU: 'VIBESTU-TQ-L', StockQuantity: 50, IsActive: true, CreatedAt: '', UpdatedAt: '' },
// ];

// const mockProductImages: MockProductImage[] = [
//   { ImageID: 1, ProductID: 1, ImageURL: 'https://theson.vn/wp-content/uploads/2024/10/samsung-galaxy-s21-fe-5g-8gb-128gb-chinh-hang.jpg', IsPrimary: true },
//   { ImageID: 2, ProductID: 2, ImageURL: 'https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/s/a/samsung-galaxy-buds-3-6_2.png', IsPrimary: true },
//   { ImageID: 3, ProductID: 3, ImageURL: 'https://picsum.photos/id/3/200/200', IsPrimary: true },
//   { ImageID: 4, ProductID: 4, ImageURL: 'https://picsum.photos/id/4/200/200', IsPrimary: true },
//   { ImageID: 5, ProductID: 5, ImageURL: 'https://picsum.photos/id/5/200/200', IsPrimary: true },
//   { ImageID: 6, ProductID: 6, ImageURL: 'https://picsum.photos/id/6/200/200', IsPrimary: true },
//   { ImageID: 7, ProductID: 7, ImageURL: 'https://picsum.photos/id/7/200/200', IsPrimary: true },
//   { ImageID: 55, ProductID: 55, ImageURL: 'https://cdn.tgdd.vn/Products/Images/54/327554/tai-nghe-bluetooth-true-wireless-samsung-galaxy-buds-3-pro-r630n-xam-1-750x500.jpg', IsPrimary: true },
//   { ImageID: 1001, ProductID: 1001, ImageURL: 'https://picsum.photos/id/1001/200/200', IsPrimary: true },
//   { ImageID: 2001, ProductID: 2001, ImageURL: 'https://picsum.photos/id/2001/200/200', IsPrimary: true },
//   { ImageID: 2002, ProductID: 2002, ImageURL: 'https://picsum.photos/id/2002/200/200', IsPrimary: true },
//   { ImageID: 3001, ProductID: 3001, ImageURL: 'https://picsum.photos/id/3001/200/200', IsPrimary: true },
//   { ImageID: 3002, ProductID: 3002, ImageURL: 'https://picsum.photos/id/3002/200/200', IsPrimary: true },
//   { ImageID: 100, ProductID: 100, ImageURL: 'https://picsum.photos/id/100/200/200', IsPrimary: true },
//   { ImageID: 101, ProductID: 101, ImageURL: 'https://picsum.photos/id/101/200/200', IsPrimary: true },
//   { ImageID: 102, ProductID: 102, ImageURL: 'https://picsum.photos/id/102/200/200', IsPrimary: true },
//   { ImageID: 300, ProductID: 300, ImageURL: 'https://picsum.photos/id/300/200/200', IsPrimary: true },
//   { ImageID: 301, ProductID: 301, ImageURL: 'https://picsum.photos/id/301/200/200', IsPrimary: true },
// ];

// const DEFAULT_PLACEHOLDER_IMAGE = '/images/placeholder.png';

// const getProductImageUrl = (variantId: number, productId: number): string => {
//   const variant = mockProductVariants.find(v => v.VariantID === variantId);
//   if (variant && variant.ImageURL) {
//     return variant.ImageURL;
//   }

//   const productPrimaryImage = mockProductImages.find(pi => pi.ProductID === productId && pi.IsPrimary);
//   if (productPrimaryImage && productPrimaryImage.ImageURL) {
//     return productPrimaryImage.ImageURL;
//   }

//   return DEFAULT_PLACEHOLDER_IMAGE;
// };

// // Hàm tạo OrderItem cho LỊCH SỬ ĐƠN HÀNG (đã có OrderID)
// const generateOrderItem = (
//   orderId: number,
//   itemSeed: number, // Dùng cho OrderItemID
//   productName: string,
//   classification: string,
//   originalPrice: number,
//   priceAtPurchase: number,
//   quantity: number,
//   variantId: number,
//   productId: number,
//   canReview: boolean = false,
//   reviewDeadline?: string,
//   reviewReward?: number,
//   productAttributes?: { attributeName: string; attributeValue: string }[],
// ): OrderItem => { // Kiểu trả về là OrderItem
//   const productImageURL = getProductImageUrl(variantId, productId);

//   return {
//     OrderItemID: itemSeed,
//     OrderID: orderId,
//     ProductID: productId,
//     VariantID: variantId,
//     Quantity: quantity,
//     PriceAtPurchase: priceAtPurchase,
//     OriginalPrice: originalPrice,
//     Subtotal: priceAtPurchase * quantity,
//     IsFlashSaleItem: false,
//     FlashSaleDealID: null,
//     ReturnStatus: 'None',
//     CreatedAt: new Date().toISOString(),
//     productName: productName,
//     productImageURL: productImageURL,
//     classification: classification,
//     canReview: canReview,
//     reviewDeadline: reviewDeadline,
//     reviewReward: reviewReward,
//     productAttributes: productAttributes,
//   };
// };

// // --- DỮ LIỆU MOCK CHO TẤT CẢ CÁC ĐƠN HÀNG (để tìm kiếm theo orderId) ---
// // ĐẶT DỮ LIỆU NÀY CỤ THỂ Ở ĐÂY HOẶC Ở MỘT FILE MOCK DATA RIÊNG (ví dụ: mocks/orders.ts)
// // Sau đó import ALL_MOCK_ORDERS_DATA vào cả ProfileOrderHistory và OrderIdPage
// const ALL_MOCK_ORDERS_DATA: Order[] = [
//   // Đơn hàng ví dụ cho trạng thái "Đã nhận được hàng" (ID: 1000)
//   {
//     OrderID: 1000, OrderCode: '250531AF18SEG3', UserID: 1, OrderDate: '2025-05-31T10:00:00Z', TotalAmount: 160650, SubtotalAmount: 189000, ShippingFee: 32700, DiscountAmount: 28350, PaymentMethod: 'COD', PaymentStatus: 'Paid', OverallStatus: 'Completed', PlatformVoucherCode: null, PlatformDiscountAmount: 20600, ShippingAddressID: 1, ShippingFullName: 'Duy nguyen', ShippingPhoneNumber: '(+84) 932105214', Notes: 'K166/12, Trường Chinh, Phường Hòa An, Quận Cẩm Lệ, Đà Nẵng', CreatedAt: '2025-05-31T10:00:00Z', UpdatedAt: '2025-06-03T08:57:00Z',
//     ShopID: 101, shopName: 'Merzy Official Store', shopLevel: 'Mall', isFavoriteShop: false,
//     shippingProvider: 'Giao Hàng Nhanh', trackingNumber: 'GY7LF89B',
//     orderStatusHistory: [
//       { status: 'Đơn Hàng Đã Đặt', date: '31-05-2025', time: '10:02', isActive: false, isCompleted: true },
//       { status: 'Đã Xác Nhận Thông Tin Thanh Toán', date: '31-05-2025', time: '14:02', isActive: false, isCompleted: true },
//       { status: 'Đã Giao Cho ĐVVC', date: '01-06-2025', time: '10:31', isActive: false, isCompleted: true },
//       { status: 'Đã Nhận Được Hàng', date: '04-06-2025', time: '12:09', isActive: true, isCompleted: true }, // Active, đã hoàn thành
//       { status: 'Đánh Giá', date: '', time: '', isActive: false, isCompleted: false }, // Đánh giá chưa hoàn thành
//     ],
//     shippingTracking: [
//       { status: 'Đã giao', date: '03-06-2025', time: '08:57', location: 'Giao hàng thành công' },
//       { status: 'Đang vận chuyển', date: '03-06-2025', time: '07:36', location: 'Đơn hàng sẽ sớm được giao, vui lòng chú ý điện thoại' },
//       { status: 'Đơn hàng đã đến trạm giao hàng tại khu vực của bạn Phường Hòa An, Quận Cẩm Lệ, Đà Nẵng và sẽ được giao trong vòng 24 giờ tiếp theo', date: '03-06-2025', time: '06:22' },
//       { status: 'Đơn hàng đang được trung chuyển đến địa điểm kế tiếp', date: '02-06-2025', time: '03:48' },
//       { status: 'Đơn hàng đã đến kho phân loại Phường Hòa Khánh Bắc, Quận Liên Chiểu, Đà Nẵng', date: '02-06-2025', time: '21:44' },
//       { status: 'Đơn hàng đang được trung chuyển đến địa điểm kế tiếp', date: '02-06-2025', time: '02:58' },
//     ],
//     totalShopVoucherDiscount: 0,
//     totalPlatformVoucherDiscount: 20600,
//     totalShopeeCoinsDiscount: 0,
//     items: [
//       generateOrderItem(1000, 1, '[NEW][SON PHAO] Son Kem Lì, Bền Màu Merzy Puffer Velvet Tint 3.7g', '#08 Unknown', 319000, 189000, 1, 1, 1, true, '2025-07-04T23:59:59Z', 200, []) // canReview true
//     ]
//   },
//   // Đơn hàng ví dụ thứ 2 (Merzy Official Store - Toner)
//   {
//     OrderID: 1001, OrderCode: 'MERZY002', UserID: 1, OrderDate: '2025-05-29T10:00:00Z', TotalAmount: 160650, SubtotalAmount: 189000, ShippingFee: 32700, DiscountAmount: 28350, PaymentMethod: 'COD', PaymentStatus: 'Paid', OverallStatus: 'Completed', PlatformVoucherCode: null, PlatformDiscountAmount: 0, ShippingAddressID: 1, ShippingFullName: 'Duy nguyen', ShippingPhoneNumber: '(+84) 932105214', Notes: 'K166/12, Trường Chinh, Phường Hòa An, Quận Cẩm Lệ, Đà Nẵng', CreatedAt: '2025-05-29T10:00:00Z', UpdatedAt: '2025-06-01T10:00:00Z',
//     ShopID: 101, shopName: 'Merzy Official Store', shopLevel: 'Mall', isFavoriteShop: false,
//     shippingProvider: 'Giao Hàng Tiết Kiệm', trackingNumber: 'GHTK001',
//     orderStatusHistory: [
//       { status: 'Đơn Hàng Đã Đặt', date: '29-05-2025', time: '10:00', isActive: false, isCompleted: true },
//       { status: 'Đã Xác Nhận Thông Tin Thanh Toán', date: '29-05-2025', time: '10:30', isActive: false, isCompleted: true },
//       { status: 'Đã Giao Cho ĐVVC', date: '30-05-2025', time: '15:00', isActive: false, isCompleted: true },
//       { status: 'Đã Nhận Được Hàng', date: '01-06-2025', time: '10:00', isActive: true, isCompleted: true }, // Đã hoàn thành
//       { status: 'Đánh Giá', date: '', time: '', isActive: false, isCompleted: false },
//     ],
//     shippingTracking: [
//       { status: 'Đã giao', date: '01-06-2025', time: '10:00', location: 'Giao hàng thành công' },
//     ],
//     totalShopVoucherDiscount: 0,
//     totalPlatformVoucherDiscount: 0,
//     totalShopeeCoinsDiscount: 0,
//     items: [
//       generateOrderItem(1001, 2, 'Toner làm căng bóng da Eveline 5% Glycolic Acid', 'Loại: 145ml', 2490000, 2490000, 1, 3, 2, false, undefined, undefined, [])
//     ]
//   },
//   // Đơn hàng ví dụ trạng thái "ĐANG GIAO HÀNG" (Shipped) (ID: 1002)
//   {
//     OrderID: 1002, OrderCode: '250615K3CEN4P6', UserID: 1, OrderDate: '2025-06-15T10:10:00Z', TotalAmount: 90000, SubtotalAmount: 110000, ShippingFee: 20000, DiscountAmount: 0, PaymentMethod: 'OnlineGateway', PaymentStatus: 'Paid', OverallStatus: 'Shipped', PlatformVoucherCode: null, PlatformDiscountAmount: 0, ShippingAddressID: 1, ShippingFullName: 'Nguyễn Văn A', ShippingPhoneNumber: '0912345678', Notes: 'Địa chỉ nhận: 123 Đường B', CreatedAt: '2025-06-15T10:10:00Z', UpdatedAt: '2025-06-16T15:00:00Z',
//     ShopID: 1002, shopName: 'Shop Thời Trang', shopLevel: 'Thường', isFavoriteShop: false,
//     shippingProvider: 'Giao Hàng Tiết Kiệm', trackingNumber: 'GHTKTRACK001',
//     orderStatusHistory: [
//       { status: 'Đơn Hàng Đã Đặt', date: '15-06-2025', time: '10:10', isActive: false, isCompleted: true },
//       { status: 'Đã Xác Nhận Thông Tin Thanh Toán', date: '15-06-2025', time: '10:30', isActive: false, isCompleted: true },
//       { status: 'Đã Giao Cho ĐVVC', date: '16-06-2025', time: '09:00', isActive: true, isCompleted: false }, // Active
//       { status: 'Đã Nhận Được Hàng', date: '', time: '', isActive: false, isCompleted: false },
//       { status: 'Đánh Giá', date: '', time: '', isActive: false, isCompleted: false },
//     ],
//     shippingTracking: [
//       { status: 'Đang vận chuyển', date: '16-06-2025', time: '15:00', location: 'Đã rời kho phân loại' },
//       { status: 'Đã lấy hàng', date: '16-06-2025', time: '09:00', location: 'Kho trung chuyển' },
//     ],
//     totalShopVoucherDiscount: 0, totalPlatformVoucherDiscount: 0, totalShopeeCoinsDiscount: 0,
//     items: [generateOrderItem(1001, 1, 'Áo Khoác Nam Thể Thao', 'Loại: Size L, Đen', 110000, 90000, 1, 5, 3, false, undefined, undefined, [])]
//   },
//   // Đơn hàng ví dụ trạng thái "Đã HỦY" (CancelledByBuyer) (ID: 1003)
//   {
//     OrderID: 1003, OrderCode: '250614CANC789Z', UserID: 1, OrderDate: '2025-06-14T11:00:00Z', TotalAmount: 50000, SubtotalAmount: 50000, ShippingFee: 0, DiscountAmount: 0, PaymentMethod: 'COD', PaymentStatus: 'Failed', OverallStatus: 'CancelledByBuyer', PlatformVoucherCode: null, PlatformDiscountAmount: 0, ShippingAddressID: 1, ShippingFullName: 'Nguyễn Thị B', ShippingPhoneNumber: '0987654321', Notes: '456 Đường C', CreatedAt: '2025-06-14T11:00:00Z', UpdatedAt: '2025-06-14T12:00:00Z',
//     ReasonForRejection: 'Thay đổi ý định mua hàng', // Lý do hủy
//     ShopID: 1003, shopName: 'Phụ Kiện Điện Thoại', shopLevel: 'Thường', isFavoriteShop: false,
//     shippingProvider: undefined, trackingNumber: undefined, orderStatusHistory: [], shippingTracking: [], totalShopVoucherDiscount: 0, totalPlatformVoucherDiscount: 0, totalShopeeCoinsDiscount: 0,
//     items: [generateOrderItem(1002, 1, 'Kính Cường Lực iPhone X', 'Loại: Trong suốt', 60000, 50000, 1, 8, 5, false, undefined, undefined, [])]
//   },
//   // Đơn hàng ví dụ trạng thái "Pending" (ID: 1004)
//   {
//     OrderID: 1004, OrderCode: '250617PENDING', UserID: 1, OrderDate: '2025-06-17T08:00:00Z', TotalAmount: 120000, SubtotalAmount: 120000, ShippingFee: 15000, DiscountAmount: 0, PaymentMethod: 'COD', PaymentStatus: 'Pending', OverallStatus: 'Pending', PlatformVoucherCode: null, PlatformDiscountAmount: 0, ShippingAddressID: 1, ShippingFullName: 'Trần Văn C', ShippingPhoneNumber: '0912345678', Notes: '789 Đường D', CreatedAt: '2025-06-17T08:00:00Z', UpdatedAt: '2025-06-17T08:00:00Z',
//     ShopID: 1004, shopName: 'Sách Hay', shopLevel: 'Thường', isFavoriteShop: false,
//     shippingProvider: undefined, trackingNumber: undefined, orderStatusHistory: [
//       { status: 'Đơn Hàng Đã Đặt', date: '17-06-2025', time: '08:00', isActive: true, isCompleted: false }, // Active
//       { status: 'Đã Xác Nhận Thông Tin Thanh Toán', date: '', time: '', isActive: false, isCompleted: false },
//       { status: 'Đã Giao Cho ĐVVC', date: '', time: '', isActive: false, isCompleted: false },
//       { status: 'Đã Nhận Được Hàng', date: '', time: '', isActive: false, isCompleted: false },
//       { status: 'Đánh Giá', date: '', time: '', isActive: false, isCompleted: false },
//     ], shippingTracking: [], totalShopVoucherDiscount: 0, totalPlatformVoucherDiscount: 0, totalShopeeCoinsDiscount: 0,
//     items: [generateOrderItem(1004, 1, 'Sách: Lập Trình Với React', 'Loại: Bìa mềm', 120000, 120000, 1, 10, 6, false, undefined, undefined, [])]
//   },
//   // Đơn hàng ví dụ trạng thái "Processing" (ID: 1005)
//   {
//     OrderID: 1005, OrderCode: '250617PROC', UserID: 1, OrderDate: '2025-06-17T09:00:00Z', TotalAmount: 250000, SubtotalAmount: 250000, ShippingFee: 20000, DiscountAmount: 0, PaymentMethod: 'OnlineGateway', PaymentStatus: 'Paid', OverallStatus: 'Processing', PlatformVoucherCode: null, PlatformDiscountAmount: 0, ShippingAddressID: 1, ShippingFullName: 'Lê Thị D', ShippingPhoneNumber: '0900000000', Notes: '101 Đường E', CreatedAt: '2025-06-17T09:00:00Z', UpdatedAt: '2025-06-17T09:30:00Z',
//     ShopID: 1005, shopName: 'Đồ Dùng Học Tập', shopLevel: 'Thường', isFavoriteShop: false,
//     shippingProvider: undefined, trackingNumber: undefined, orderStatusHistory: [
//       { status: 'Đơn Hàng Đã Đặt', date: '17-06-2025', time: '09:00', isActive: false, isCompleted: true },
//       { status: 'Đã Xác Nhận Thông Tin Thanh Toán', date: '17-06-2025', time: '09:30', isActive: true, isCompleted: false }, // Active
//       { status: 'Đã Giao Cho ĐVVC', date: '', time: '', isActive: false, isCompleted: false },
//       { status: 'Đã Nhận Được Hàng', date: '', time: '', isActive: false, isCompleted: false },
//       { status: 'Đánh Giá', date: '', time: '', isActive: false, isCompleted: false },
//     ], shippingTracking: [], totalShopVoucherDiscount: 0, totalPlatformVoucherDiscount: 0, totalShopeeCoinsDiscount: 0,
//     items: [generateOrderItem(1005, 1, 'Balo Laptop Chống Nước', 'Loại: Đen', 250000, 250000, 1, 12, 7, false, undefined, undefined, [])]
//   },
//   // Đơn hàng ví dụ trạng thái "Returned" (ID: 1006)
//   {
//     OrderID: 1006, OrderCode: '250610RETURN', UserID: 1, OrderDate: '2025-06-10T10:00:00Z', TotalAmount: 100000, SubtotalAmount: 100000, ShippingFee: 0, DiscountAmount: 0, PaymentMethod: 'COD', PaymentStatus: 'Refunded', OverallStatus: 'Returned', PlatformVoucherCode: null, PlatformDiscountAmount: 0, ShippingAddressID: 1, ShippingFullName: 'Duy nguyen', ShippingPhoneNumber: '(+84) 932105214', Notes: 'K166/12, Trường Chinh, Phường Hòa An, Quận Cẩm Lệ, Đà Nẵng', CreatedAt: '2025-06-10T10:00:00Z', UpdatedAt: '2025-06-15T10:00:00Z',
//     ShopID: 1006, shopName: 'Đồ Dùng Gia Đình', shopLevel: 'Thường', isFavoriteShop: false,
//     shippingProvider: 'ViettelPost', trackingNumber: 'VTPRTN001', orderStatusHistory: [
//       { status: 'Đơn Hàng Đã Đặt', date: '10-06-2025', time: '10:00', isActive: false, isCompleted: true },
//       { status: 'Đã Xác Nhận Thông Tin Thanh Toán', date: '10-06-2025', time: '10:15', isActive: false, isCompleted: true },
//       { status: 'Đã Giao Cho ĐVVC', date: '11-06-2025', time: '14:00', isActive: false, isCompleted: true },
//       { status: 'Đã Nhận Được Hàng', date: '13-06-2025', time: '10:00', isActive: false, isCompleted: true },
//       { status: 'Đã Trả Hàng', date: '15-06-2025', time: '10:00', isActive: true, isCompleted: false }, // Active
//     ], shippingTracking: [
//       { status: 'Đã trả hàng về kho', date: '15-06-2025', time: '10:00' },
//     ], totalShopVoucherDiscount: 0, totalPlatformVoucherDiscount: 0, totalShopeeCoinsDiscount: 0,
//     items: [generateOrderItem(1006, 1, 'Khăn Lau Đa Năng', 'Loại: 5 cái', 100000, 100000, 1, 1, 1, false, undefined, undefined, [])]
//   },
//   // Các order khác từ ProfileOrderHistory trước đó để trang danh sách có nhiều item
//   {
//     OrderID: 1, OrderCode: 'MERZY001', UserID: 1, OrderDate: '2023-12-02T12:38:00Z', TotalAmount: 160650, SubtotalAmount: 189000, ShippingFee: 0, DiscountAmount: 28350, PaymentMethod: 'COD', PaymentStatus: 'Paid', OverallStatus: 'Completed', PlatformVoucherCode: null, PlatformDiscountAmount: 0, ShippingAddressID: 1, ShippingFullName: 'Name', ShippingPhoneNumber: '09xxxxxx', Notes: null, CreatedAt: '', UpdatedAt: '',
//     ShopID: 101, shopName: 'Merzy Official Store', shopLevel: 'Mall', isFavoriteShop: false,
//     shippingProvider: 'SPX Express', trackingNumber: 'SPXTRK001', orderStatusHistory: [], shippingTracking: [], totalShopVoucherDiscount: 0, totalPlatformVoucherDiscount: 0, totalShopeeCoinsDiscount: 0,
//     items: [generateOrderItem(1, 1, '[NEW][SON PHAO] Son Kem Lì, Bền Màu Merzy Puffer Velvet Tint 3.7g', '#08 Unknown', 319000, 189000, 1, 1, 1, true, '2025-07-04T23:59:59Z', 200, [{ attributeName: 'Color', attributeValue: 'Red' }])]
//   },
//   {
//     OrderID: 2, OrderCode: 'UKMART001', UserID: 1, OrderDate: '2023-12-01T10:00:00Z', TotalAmount: 136850, SubtotalAmount: 161000, ShippingFee: 0, DiscountAmount: 24150, PaymentMethod: 'COD', PaymentStatus: 'Paid', OverallStatus: 'Completed', PlatformVoucherCode: null, PlatformDiscountAmount: 0, ShippingAddressID: 1, ShippingFullName: 'Name', ShippingPhoneNumber: '09xxxxxx', Notes: null, CreatedAt: '', UpdatedAt: '',
//     ShopID: 102, shopName: 'UKmart - Hàng Anh Thủ Đức', shopLevel: 'Yêu thích+', isFavoriteShop: true,
//     shippingProvider: 'J&T Express', trackingNumber: 'JNTTRK001', orderStatusHistory: [], shippingTracking: [], totalShopVoucherDiscount: 0, totalPlatformVoucherDiscount: 0, totalShopeeCoinsDiscount: 0,
//     items: [generateOrderItem(2, 2, 'Toner Eveline 5% Glycolic Acid Glycol Therapy Cho Da Căng Bóng Mịn Màng Mờ Thâm Mụn Trẻ Hóa Da', 'Glycol Therapy 110ml', 225000, 161000, 1, 3, 2, true, '2025-07-03T23:59:59Z', 200, [{ attributeName: 'Volume', attributeValue: '110ml' }])]
//   },
//   {
//     OrderID: 3, OrderCode: 'PENDING001', UserID: 1, OrderDate: '2023-12-05T09:00:00Z', TotalAmount: 500000, SubtotalAmount: 500000, ShippingFee: 30000, DiscountAmount: 0, PaymentMethod: 'COD', PaymentStatus: 'Pending', OverallStatus: 'Pending', PlatformVoucherCode: null, PlatformDiscountAmount: 0, ShippingAddressID: 1, ShippingFullName: 'Name', ShippingPhoneNumber: '09xxxxxx', Notes: null, CreatedAt: '', UpdatedAt: '',
//     ShopID: 103, shopName: 'ABC Tech', shopLevel: 'Thường', isFavoriteShop: false,
//     shippingProvider: undefined, trackingNumber: undefined, orderStatusHistory: [], shippingTracking: [], totalShopVoucherDiscount: 0, totalPlatformVoucherDiscount: 0, totalShopeeCoinsDiscount: 0,
//     items: [generateOrderItem(3, 3, 'Tai nghe Bluetooth X50', 'Màu Đen', 550000, 500000, 1, 5, 3, false, undefined, undefined, [{ attributeName: 'Color', attributeValue: 'Black' }])]
//   },
//   {
//     OrderID: 5, OrderCode: 'CANCELLED001', UserID: 1, OrderDate: '2023-11-20T14:00:00Z', TotalAmount: 150000, SubtotalAmount: 150000, ShippingFee: 0, DiscountAmount: 0, PaymentMethod: 'COD', PaymentStatus: 'Failed', OverallStatus: 'CancelledByBuyer', PlatformVoucherCode: null, PlatformDiscountAmount: 0, ShippingAddressID: 1, ShippingFullName: 'Name', ShippingPhoneNumber: '09xxxxxx', Notes: null, CreatedAt: '', UpdatedAt: '',
//     ShopID: 105, shopName: 'Phụ kiện HOT', shopLevel: 'Thường', isFavoriteShop: false,
//     shippingProvider: undefined, trackingNumber: undefined, orderStatusHistory: [], shippingTracking: [], totalShopVoucherDiscount: 0, totalPlatformVoucherDiscount: 0, totalShopeeCoinsDiscount: 0,
//     items: [generateOrderItem(5, 5, 'Ốp lưng iPhone 15 Pro', 'Màu Đen', 150000, 150000, 1, 8, 5, false, undefined, undefined, [{ attributeName: 'Color', attributeValue: 'Black' }])]
//   },
//   {
//     OrderID: 6, OrderCode: 'RETURNED001', UserID: 1, OrderDate: '2023-11-15T10:00:00Z', TotalAmount: 200000, SubtotalAmount: 200000, ShippingFee: 0, DiscountAmount: 0, PaymentMethod: 'OnlineGateway', PaymentStatus: 'Refunded', OverallStatus: 'Returned', PlatformVoucherCode: null, PlatformDiscountAmount: 0, ShippingAddressID: 1, ShippingFullName: 'Name', ShippingPhoneNumber: '09xxxxxx', Notes: null, CreatedAt: '', UpdatedAt: '',
//     ShopID: 106, shopName: 'Gia Dụng Xanh', shopLevel: 'Yêu thích+', isFavoriteShop: false,
//     shippingProvider: undefined, trackingNumber: undefined, orderStatusHistory: [], shippingTracking: [], totalShopVoucherDiscount: 0, totalPlatformVoucherDiscount: 0, totalShopeeCoinsDiscount: 0,
//     items: [generateOrderItem(6, 6, 'Bình giữ nhiệt 500ml', 'Màu Xanh', 200000, 200000, 1, 10, 6, false, undefined, undefined, [{ attributeName: 'Color', attributeValue: 'Green' }])]
//   },
//   {
//     OrderID: 7, OrderCode: 'PROCESSING001', UserID: 1, OrderDate: '2023-12-03T11:00:00Z', TotalAmount: 300000, SubtotalAmount: 300000, ShippingFee: 0, DiscountAmount: 0, PaymentMethod: 'OnlineGateway', PaymentStatus: 'Paid', OverallStatus: 'Processing', PlatformVoucherCode: null, PlatformDiscountAmount: 0, ShippingAddressID: 1, ShippingFullName: 'Name', ShippingPhoneNumber: '09xxxxxx', Notes: null, CreatedAt: '', UpdatedAt: '', ShopID: 107, shopName: 'Smart Home', shopLevel: 'Thường', isFavoriteShop: false, items: [generateOrderItem(7, 7, 'Đèn LED thông minh', 'Trắng', 320000, 300000, 1, 12, 7, false, undefined, undefined, [{ attributeName: 'Color', attributeValue: 'White' }])] },
//   {
//     OrderID: 8, OrderCode: 'DELIVERED001', UserID: 1, OrderDate: '2023-11-29T16:00:00Z', TotalAmount: 180000, SubtotalAmount: 180000, ShippingFee: 0, DiscountAmount: 0, PaymentMethod: 'COD', PaymentStatus: 'Paid', OverallStatus: 'Delivered', PlatformVoucherCode: null, PlatformDiscountAmount: 0, ShippingAddressID: 1, ShippingFullName: 'Name', ShippingPhoneNumber: '09xxxxxx', Notes: null, CreatedAt: '', UpdatedAt: '', ShopID: 108, shopName: '', shopLevel: 'Thường', isFavoriteShop: false, items: [generateOrderItem(8, 8, 'Áo phông Unisex', 'Size L, Trắng', 100000, 90000, 2, 14, 8, true, '2025-06-30T23:59:59Z', 100, [{ attributeName: 'Size', attributeValue: 'L' }, { attributeName: 'Color', attributeValue: 'White' }])] },
//   {
//     OrderID: 9, OrderCode: 'COMPLETED002', UserID: 1, OrderDate: '2023-11-20T10:00:00Z', TotalAmount: 450000, SubtotalAmount: 450000, ShippingFee: 0, DiscountAmount: 0, PaymentMethod: 'COD', PaymentStatus: 'Paid', OverallStatus: 'Completed', PlatformVoucherCode: null, PlatformDiscountAmount: 0, ShippingAddressID: 1, ShippingFullName: 'Name', ShippingPhoneNumber: '09xxxxxx', Notes: null, CreatedAt: '', UpdatedAt: '', ShopID: 101, shopName: 'Merzy Official Store', shopLevel: 'Mall', isFavoriteShop: false, items: [generateOrderItem(9, 9, 'Bảng phấn mắt 12 màu', 'Nude Tones', 500000, 450000, 1, 16, 9, true, '2025-07-01T23:59:59Z', 150, [{ attributeName: 'Color', attributeValue: 'Nude' }])] },
//   { OrderID: 10, OrderCode: 'COMPLETED003', UserID: 1, OrderDate: '2023-11-18T08:00:00Z', TotalAmount: 75000, SubtotalAmount: 75000, ShippingFee: 0, DiscountAmount: 0, PaymentMethod: 'OnlineGateway', PaymentStatus: 'Paid', OverallStatus: 'Completed', PlatformVoucherCode: null, PlatformDiscountAmount: 0, ShippingAddressID: 1, ShippingFullName: 'Name', ShippingPhoneNumber: '09xxxxxx', Notes: null, CreatedAt: '', UpdatedAt: '', ShopID: 102, shopName: 'UKmart - Hàng Anh Thủ Đức', shopLevel: 'Yêu thích+', isFavoriteShop: true, items: [generateOrderItem(10, 10, 'Sữa rửa mặt Cetaphil', '125ml', 80000, 75000, 1, 18, 10, true, '2025-06-25T23:59:59Z', 50, [{ attributeName: 'Volume', attributeValue: '125ml' }])] },
//   { OrderID: 11, OrderCode: 'COMPLETED004', UserID: 1, OrderDate: '2023-11-10T14:00:00Z', TotalAmount: 220000, SubtotalAmount: 220000, ShippingFee: 0, DiscountAmount: 0, PaymentMethod: 'COD', PaymentStatus: 'Paid', OverallStatus: 'Completed', PlatformVoucherCode: null, PlatformDiscountAmount: 0, ShippingAddressID: 1, ShippingFullName: 'Name', ShippingPhoneNumber: '09xxxxxx', Notes: null, CreatedAt: '', UpdatedAt: '', ShopID: 101, shopName: 'Merzy Official Store', shopLevel: 'Mall', isFavoriteShop: false, items: [generateOrderItem(11, 11, 'Kem dưỡng ẩm Cerave', '200ml', 250000, 220000, 1, 20, 11, true, '2025-06-20T23:59:59Z', 100, [{ attributeName: 'Volume', attributeValue: '200ml' }])] },
//   { OrderID: 12, OrderCode: 'COMPLETED005', UserID: 1, OrderDate: '2023-11-05T11:00:00Z', TotalAmount: 110000, SubtotalAmount: 110000, ShippingFee: 0, DiscountAmount: 0, PaymentMethod: 'COD', PaymentStatus: 'Paid', OverallStatus: 'Completed', PlatformVoucherCode: null, PlatformDiscountAmount: 0, ShippingAddressID: 1, ShippingFullName: 'Name', ShippingPhoneNumber: '09xxxxxx', Notes: null, CreatedAt: '', UpdatedAt: '', ShopID: 102, shopName: 'UKmart - Hàng Anh Thủ Đức', shopLevel: 'Yêu thích+', isFavoriteShop: true, items: [generateOrderItem(12, 12, 'Nước hoa hồng Simple', '200ml', 120000, 110000, 1, 22, 12, true, '2025-06-15T23:59:59Z', 80, [{ attributeName: 'Volume', attributeValue: '200ml' }])] },
//   { OrderID: 13, OrderCode: 'NOVARIANTIMG', UserID: 1, OrderDate: '2023-10-30T10:00:00Z', TotalAmount: 200000, SubtotalAmount: 200000, ShippingFee: 0, DiscountAmount: 0, PaymentMethod: 'COD', PaymentStatus: 'Paid', OverallStatus: 'Completed', PlatformVoucherCode: null, PlatformDiscountAmount: 0, ShippingAddressID: 1, ShippingFullName: 'Name', ShippingPhoneNumber: '09xxxxxx', Notes: null, CreatedAt: '', UpdatedAt: '', ShopID: 101, shopName: 'Merzy Official Store', shopLevel: 'Mall', isFavoriteShop: false, items: [generateOrderItem(13, 13, 'Test Product: No Variant Image', 'Default', 250000, 200000, 1, 63, 55, false, undefined, undefined, [{ attributeName: 'Size', attributeValue: 'Default' }])] },
//   { OrderID: 14, OrderCode: 'NOIMAGEALL', UserID: 1, OrderDate: '2023-10-25T11:00:00Z', TotalAmount: 50000, SubtotalAmount: 50000, ShippingFee: 0, DiscountAmount: 0, PaymentMethod: 'COD', PaymentStatus: 'Paid', OverallStatus: 'Completed', PlatformVoucherCode: null, PlatformDiscountAmount: 0, ShippingAddressID: 1, ShippingFullName: 'Name', ShippingPhoneNumber: '09xxxxxx', Notes: null, CreatedAt: '', UpdatedAt: '', ShopID: 102, shopName: 'UKmart - Hàng Anh Thủ Đức', shopLevel: 'Yêu thích+', isFavoriteShop: true, items: [generateOrderItem(14, 14, 'Test Product: No Image At All', 'Generic', 60000, 50000, 1, 9999, 9999, false, undefined, undefined, [{ attributeName: 'Type', attributeValue: 'Generic' }])] },
// ];

// export default function OrderIdPage() { // Đổi tên component trong page.tsx
//   const params = useParams();
//   const orderId = params.orderId; // Lấy orderId từ params

//   const [order, setOrder] = useState<Order | null>(null);

//   useEffect(() => {
//     // Tìm order trong ALL_MOCK_ORDERS_DATA
//     const foundOrder = ALL_MOCK_ORDERS_DATA.find(o => o.OrderID.toString() === orderId);
//     setOrder(foundOrder || null);
//   }, [orderId]);

//   if (!order) {
//     return <div className="text-center py-10">Đang tải chi tiết đơn hàng hoặc không tìm thấy đơn hàng...</div>;
//   }

//   return (
//     <div className="flex-1">
//       <OrderDetailContent order={order} />
//     </div>
//   );
// }

// app/(main)/(account)/orders/[orderId]/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import OrderDetailContent from '../components/OrderDetailContent';

import { Order, OrderItem, OrderStatus, OrderStatusHistory, ShippingTracking, ShopLevel } from '@/types';

// --- MOCK DATA CHO ProductVariants VÀ ProductImages (Tái sử dụng) ---
interface MockVariant {
  VariantID: number; ProductID: number; ImageURL: string | null; Price: number; CompareAtPrice: number | null; SKU: string | null; StockQuantity: number; IsActive: boolean; CreatedAt: string; UpdatedAt: string;
}
interface MockProductImage {
  ImageID: number; ProductID: number; ImageURL: string; IsPrimary: boolean;
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
  { VariantID: 100, ProductID: 100, ImageURL: 'https://picsum.photos/id/100/200/200', Price: 1000000, CompareAtPrice: 1200000, SKU: 'VIRTUAL-PROD-1', StockQuantity: 100, IsActive: true, CreatedAt: '', UpdatedAt: '' },
  { VariantID: 101, ProductID: 101, ImageURL: 'https://picsum.photos/id/101/200/200', Price: 500000, CompareAtPrice: 600000, SKU: 'VIRTUAL-PROD-2', StockQuantity: 100, IsActive: true, CreatedAt: '', UpdatedAt: '' },
  { VariantID: 102, ProductID: 102, ImageURL: 'https://picsum.photos/id/102/200/200', Price: 200000, CompareAtPrice: 250000, SKU: 'VIRTUAL-PROD-3', StockQuantity: 100, IsActive: true, CreatedAt: '', UpdatedAt: '' },
  { VariantID: 300, ProductID: 300, ImageURL: 'https://picsum.photos/id/300/200/200', Price: 168800, CompareAtPrice: 190000, SKU: 'VIBESTU-TQ-BIG', StockQuantity: 50, IsActive: true, CreatedAt: '', UpdatedAt: '' },
  { VariantID: 301, ProductID: 301, ImageURL: 'https://picsum.photos/id/301/200/200', Price: 168800, CompareAtPrice: 190000, SKU: 'VIBESTU-TQ-L', StockQuantity: 50, IsActive: true, CreatedAt: '', UpdatedAt: '' },
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
  { ImageID: 100, ProductID: 100, ImageURL: 'https://picsum.photos/id/100/200/200', IsPrimary: true },
  { ImageID: 101, ProductID: 101, ImageURL: 'https://picsum.photos/id/101/200/200', IsPrimary: true },
  { ImageID: 102, ProductID: 102, ImageURL: 'https://picsum.photos/id/102/200/200', IsPrimary: true },
  { ImageID: 300, ProductID: 300, ImageURL: 'https://picsum.photos/id/300/200/200', IsPrimary: true },
  { ImageID: 301, ProductID: 301, ImageURL: 'https://picsum.photos/id/301/200/200', IsPrimary: true },
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

// Hàm tạo OrderItem cho LỊCH SỬ ĐƠN HÀNG (đã có OrderID)
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
): OrderItem => { // Kiểu trả về là OrderItem
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

// --- DỮ LIỆU MOCK CHO TẤT CẢ CÁC ĐƠN HÀNG (để tìm kiếm theo orderId) ---
// ĐẶT DỮ LIỆU NÀY CỤ THỂ Ở ĐÂY HOẶC Ở MỘT FILE MOCK DATA RIÊNG (ví dụ: mocks/orders.ts)
// Sau đó import ALL_MOCK_ORDERS_DATA vào cả ProfileOrderHistory và OrderIdPage
const ALL_MOCK_ORDERS_DATA: Order[] = [
  // Đơn hàng ví dụ cho trạng thái "Đã nhận được hàng" (ID: 1000)
  {
    OrderID: 1000, OrderCode: '250531AF18SEG3', UserID: 1, OrderDate: '2025-05-31T10:00:00Z', TotalAmount: 160650, SubtotalAmount: 189000, ShippingFee: 32700, DiscountAmount: 28350, PaymentMethod: 'COD', PaymentStatus: 'Paid', OverallStatus: 'Completed', PlatformVoucherCode: null, PlatformDiscountAmount: 20600, ShippingAddressID: 1, ShippingFullName: 'Duy nguyen', ShippingPhoneNumber: '(+84) 932105214', Notes: 'K166/12, Trường Chinh, Phường Hòa An, Quận Cẩm Lệ, Đà Nẵng', CreatedAt: '2025-05-31T10:00:00Z', UpdatedAt: '2025-06-03T08:57:00Z',
    ShopID: 101, shopName: 'Merzy Official Store', shopLevel: 'Mall', isFavoriteShop: false,
    shippingProvider: 'Giao Hàng Nhanh', trackingNumber: 'GY7LF89B',
    orderStatusHistory: [
      { status: 'Đơn Hàng Đã Đặt', date: '31-05-2025', time: '10:02', isActive: false, isCompleted: true },
      { status: 'Đã Xác Nhận Thông Tin Thanh Toán', date: '31-05-2025', time: '14:02', isActive: false, isCompleted: true },
      { status: 'Đã Giao Cho ĐVVC', date: '01-06-2025', time: '10:31', isActive: false, isCompleted: true },
      { status: 'Đã Nhận Được Hàng', date: '04-06-2025', time: '12:09', isActive: true, isCompleted: true }, // Active, đã hoàn thành
      { status: 'Đánh Giá', date: '', time: '', isActive: false, isCompleted: false }, // Đánh giá chưa hoàn thành
    ],
    shippingTracking: [
      { status: 'Đã giao', date: '03-06-2025', time: '08:57', location: 'Giao hàng thành công' },
      { status: 'Đang vận chuyển', date: '03-06-2025', time: '07:36', location: 'Đơn hàng sẽ sớm được giao, vui lòng chú ý điện thoại' },
      { status: 'Đơn hàng đã đến trạm giao hàng tại khu vực của bạn Phường Hòa An, Quận Cẩm Lệ, Đà Nẵng và sẽ được giao trong vòng 24 giờ tiếp theo', date: '03-06-2025', time: '06:22' },
      { status: 'Đơn hàng đang được trung chuyển đến địa điểm kế tiếp', date: '02-06-2025', time: '03:48' },
      { status: 'Đơn hàng đã đến kho phân loại Phường Hòa Khánh Bắc, Quận Liên Chiểu, Đà Nẵng', date: '02-06-2025', time: '21:44' },
      { status: 'Đơn hàng đang được trung chuyển đến địa điểm kế tiếp', date: '02-06-2025', time: '02:58' },
    ],
    totalShopVoucherDiscount: 0,
    totalPlatformVoucherDiscount: 20600,
    totalShopeeCoinsDiscount: 0,
    items: [
      generateOrderItem(1000, 1, '[NEW][SON PHAO] Son Kem Lì, Bền Màu Merzy Puffer Velvet Tint 3.7g', '#08 Unknown', 319000, 189000, 1, 1, 1, true, '2025-07-04T23:59:59Z', 200, [])
    ]
  },
  // Đơn hàng ví dụ trạng thái "ĐANG GIAO HÀNG" (Shipped) (ID: 1001)
  {
    OrderID: 1001, OrderCode: '250615K3CEN4P6', UserID: 1, OrderDate: '2025-06-15T10:10:00Z', TotalAmount: 90000, SubtotalAmount: 110000, ShippingFee: 20000, DiscountAmount: 0, PaymentMethod: 'OnlineGateway', PaymentStatus: 'Paid', OverallStatus: 'Shipped', PlatformVoucherCode: null, PlatformDiscountAmount: 0, ShippingAddressID: 1, ShippingFullName: 'Nguyễn Văn A', ShippingPhoneNumber: '0912345678', Notes: 'Địa chỉ nhận: 123 Đường B', CreatedAt: '2025-06-15T10:10:00Z', UpdatedAt: '2025-06-16T15:00:00Z',
    ShopID: 1002, shopName: 'Shop Thời Trang', shopLevel: 'Thường', isFavoriteShop: false,
    shippingProvider: 'Giao Hàng Tiết Kiệm', trackingNumber: 'GHTKTRACK001',
    orderStatusHistory: [
      { status: 'Đơn Hàng Đã Đặt', date: '15-06-2025', time: '10:10', isActive: false, isCompleted: true },
      { status: 'Đã Xác Nhận Thông Tin Thanh Toán', date: '15-06-2025', time: '10:30', isActive: false, isCompleted: true },
      { status: 'Đã Giao Cho ĐVVC', date: '16-06-2025', time: '09:00', isActive: true, isCompleted: false }, // Active
      { status: 'Đã Nhận Được Hàng', date: '', time: '', isActive: false, isCompleted: false },
      { status: 'Đánh Giá', date: '', time: '', isActive: false, isCompleted: false },
    ],
    shippingTracking: [
      { status: 'Đang vận chuyển', date: '16-06-2025', time: '15:00', location: 'Đã rời kho phân loại' },
      { status: 'Đã lấy hàng', date: '16-06-2025', time: '09:00', location: 'Kho trung chuyển' },
    ],
    totalShopVoucherDiscount: 0, totalPlatformVoucherDiscount: 0, totalShopeeCoinsDiscount: 0,
    items: [generateOrderItem(1001, 1, 'Áo Khoác Nam Thể Thao', 'Loại: Size L, Đen', 110000, 90000, 1, 5, 3, false, undefined, undefined, [])]
  },
  // Đơn hàng ví dụ trạng thái "Đã HỦY" (CancelledByBuyer) (ID: 1002)
  {
    OrderID: 1002, OrderCode: '250614CANC789Z', UserID: 1, OrderDate: '2025-06-14T11:00:00Z', TotalAmount: 50000, SubtotalAmount: 50000, ShippingFee: 0, DiscountAmount: 0, PaymentMethod: 'COD', PaymentStatus: 'Failed', OverallStatus: 'CancelledByBuyer', PlatformVoucherCode: null, PlatformDiscountAmount: 0, ShippingAddressID: 1, ShippingFullName: 'Nguyễn Thị B', ShippingPhoneNumber: '0987654321', Notes: '456 Đường C', CreatedAt: '2025-06-14T11:00:00Z', UpdatedAt: '2025-06-14T12:00:00Z',
    ReasonForRejection: 'Thay đổi ý định mua hàng', // Lý do hủy
    ShopID: 1003, shopName: 'Phụ Kiện Điện Thoại', shopLevel: 'Thường', isFavoriteShop: false,
    shippingProvider: undefined, trackingNumber: undefined, orderStatusHistory: [], shippingTracking: [], totalShopVoucherDiscount: 0, totalPlatformVoucherDiscount: 0, totalShopeeCoinsDiscount: 0,
    items: [generateOrderItem(1002, 1, 'Kính Cường Lực iPhone X', 'Loại: Trong suốt', 60000, 50000, 1, 8, 5, false, undefined, undefined, [])]
  },
  // Đơn hàng ví dụ trạng thái "Pending" (ID: 1003)
  {
    OrderID: 1003, OrderCode: '250617PENDING', UserID: 1, OrderDate: '2025-06-17T08:00:00Z', TotalAmount: 120000, SubtotalAmount: 120000, ShippingFee: 15000, DiscountAmount: 0, PaymentMethod: 'COD', PaymentStatus: 'Pending', OverallStatus: 'Pending', PlatformVoucherCode: null, PlatformDiscountAmount: 0, ShippingAddressID: 1, ShippingFullName: 'Trần Văn C', ShippingPhoneNumber: '0912345678', Notes: '789 Đường D', CreatedAt: '2025-06-17T08:00:00Z', UpdatedAt: '2025-06-17T08:00:00Z',
    ShopID: 1004, shopName: 'Sách Hay', shopLevel: 'Thường', isFavoriteShop: false,
    shippingProvider: undefined, trackingNumber: undefined, orderStatusHistory: [
      { status: 'Đơn Hàng Đã Đặt', date: '17-06-2025', time: '08:00', isActive: true, isCompleted: false }, // Active
      { status: 'Đã Xác Nhận Thông Tin Thanh Toán', date: '', time: '', isActive: false, isCompleted: false },
      { status: 'Đã Giao Cho ĐVVC', date: '', time: '', isActive: false, isCompleted: false },
      { status: 'Đã Nhận Được Hàng', date: '', time: '', isActive: false, isCompleted: false },
      { status: 'Đánh Giá', date: '', time: '', isActive: false, isCompleted: false },
    ], shippingTracking: [], totalShopVoucherDiscount: 0, totalPlatformVoucherDiscount: 0, totalShopeeCoinsDiscount: 0,
    items: [generateOrderItem(1003, 1, 'Sách: Lập Trình Với React', 'Loại: Bìa mềm', 120000, 120000, 1, 10, 6, false, undefined, undefined, [])]
  },
  // Đơn hàng ví dụ trạng thái "Processing" (ID: 1004)
  {
    OrderID: 1004, OrderCode: '250617PROC', UserID: 1, OrderDate: '2025-06-17T09:00:00Z', TotalAmount: 250000, SubtotalAmount: 250000, ShippingFee: 20000, DiscountAmount: 0, PaymentMethod: 'OnlineGateway', PaymentStatus: 'Paid', OverallStatus: 'Processing', PlatformVoucherCode: null, PlatformDiscountAmount: 0, ShippingAddressID: 1, ShippingFullName: 'Lê Thị D', ShippingPhoneNumber: '0900000000', Notes: '101 Đường E', CreatedAt: '2025-06-17T09:00:00Z', UpdatedAt: '2025-06-17T09:30:00Z',
    ShopID: 1005, shopName: 'Đồ Dùng Học Tập', shopLevel: 'Thường', isFavoriteShop: false,
    shippingProvider: undefined, trackingNumber: undefined, orderStatusHistory: [
      { status: 'Đơn Hàng Đã Đặt', date: '17-06-2025', time: '09:00', isActive: false, isCompleted: true },
      { status: 'Đã Xác Nhận Thông Tin Thanh Toán', date: '17-06-2025', time: '09:30', isActive: true, isCompleted: false }, // Active
      { status: 'Đã Giao Cho ĐVVC', date: '', time: '', isActive: false, isCompleted: false },
      { status: 'Đã Nhận Được Hàng', date: '', time: '', isActive: false, isCompleted: false },
      { status: 'Đánh Giá', date: '', time: '', isActive: false, isCompleted: false },
    ], shippingTracking: [], totalShopVoucherDiscount: 0, totalPlatformVoucherDiscount: 0, totalShopeeCoinsDiscount: 0,
    items: [generateOrderItem(1005, 1, 'Balo Laptop Chống Nước', 'Loại: Đen', 250000, 250000, 1, 12, 7, false, undefined, undefined, [])]
  },
  //hoàn thành
  { OrderID: 10222, OrderCode: '250531AF18SEG3', UserID: 1, OrderDate: '2025-05-31T10:00:00Z', TotalAmount: 160650, SubtotalAmount: 189000, ShippingFee: 32700, DiscountAmount: 28350, PaymentMethod: 'COD', PaymentStatus: 'Paid', OverallStatus: 'Completed', PlatformVoucherCode: null, PlatformDiscountAmount: 28350, ShippingAddressID: 1, ShippingFullName: 'Duy nguyen', ShippingPhoneNumber: '(+84) 932105214', Notes: 'K166/12, Trường Chinh, Phường Hòa An, Quận Cẩm Lệ, Đà Nẵng', CreatedAt: '2025-05-31T10:00:00Z', UpdatedAt: '2025-06-04T12:09:00Z',
    ShopID: 101, shopName: 'Merzy Official Store', shopLevel: 'Mall', isFavoriteShop: false,
    shippingProvider: 'Giao Hàng Nhanh', trackingNumber: 'GY7LF89B',
    orderStatusHistory: [
      { status: 'Đơn Hàng Đã Đặt', date: '31-05-2025', time: '10:02', isActive: false, isCompleted: true },
      { status: 'Đã Xác Nhận Thông Tin Thanh Toán', date: '31-05-2025', time: '14:02', isActive: false, isCompleted: true },
      { status: 'Đã Giao Cho ĐVVC', date: '01-06-2025', time: '10:31', isActive: false, isCompleted: true },
      { status: 'Đã Nhận Được Hàng', date: '04-06-2025', time: '12:09', isActive: false, isCompleted: true }, // Complete, nhưng không active vì Completed
      { status: 'Đánh Giá', date: '', time: '', isActive: true, isCompleted: false }, // Đánh giá là bước cuối cùng, active nếu order đã nhận
    ],
    shippingTracking: [
      { status: 'Đã giao', date: '03-06-2025', time: '08:57', location: 'Giao hàng thành công' },
      { status: 'Đang vận chuyển', date: '03-06-2025', time: '07:36', location: 'Đơn hàng sẽ sớm được giao, vui lòng chú ý điện thoại' },
      { status: 'Đơn hàng đã đến trạm giao hàng tại khu vực của bạn Phường Hòa An, Quận Cẩm Lệ, Đà Nẵng và sẽ được giao trong vòng 24 giờ tiếp theo', date: '03-06-2025', time: '06:22' },
      { status: 'Đơn hàng đang được trung chuyển đến địa điểm kế tiếp', date: '02-06-2025', time: '03:48' },
      { status: 'Đơn hàng đã đến kho phân loại Phường Hòa Khánh Bắc, Quận Liên Chiểu, Đà Nẵng', date: '02-06-2025', time: '21:44' },
      { status: 'Đơn hàng đang được trung chuyển đến địa điểm kế tiếp', date: '02-06-2025', time: '02:58' },
    ],
    totalShopVoucherDiscount: 0,
    totalPlatformVoucherDiscount: 28350, // Giảm giá từ Platform Voucher
    totalShopeeCoinsDiscount: 0,
    items: [
      generateOrderItem(1000, 1, '[NEW][SON PHAO] Son Kem Lì, Bền Màu Merzy Puffer Velvet Tint 3.7g', '#08 Unknown', 319000, 189000, 1, 1, 1, true, '2025-07-04T23:59:59Z', 200, [])
    ]
  },
  // Đơn hàng ví dụ trạng thái "Returned" (ID: 1006)
  {
    OrderID: 1006, OrderCode: '250610RETURN', UserID: 1, OrderDate: '2025-06-10T10:00:00Z', TotalAmount: 100000, SubtotalAmount: 100000, ShippingFee: 0, DiscountAmount: 0, PaymentMethod: 'COD', PaymentStatus: 'Refunded', OverallStatus: 'Returned', PlatformVoucherCode: null, PlatformDiscountAmount: 0, ShippingAddressID: 1, ShippingFullName: 'Duy nguyen', ShippingPhoneNumber: '(+84) 932105214', Notes: 'K166/12, Trường Chinh, Phường Hòa An, Quận Cẩm Lệ, Đà Nẵng', CreatedAt: '2025-06-10T10:00:00Z', UpdatedAt: '2025-06-15T10:00:00Z',
    ShopID: 1006, shopName: 'Đồ Dùng Gia Đình', shopLevel: 'Thường', isFavoriteShop: false,
    shippingProvider: 'ViettelPost', trackingNumber: 'VTPRTN001', orderStatusHistory: [
      { status: 'Đơn Hàng Đã Đặt', date: '10-06-2025', time: '10:00', isActive: false, isCompleted: true },
      { status: 'Đã Xác Nhận Thông Tin Thanh Toán', date: '10-06-2025', time: '10:15', isActive: false, isCompleted: true },
      { status: 'Đã Giao Cho ĐVVC', date: '11-06-2025', time: '14:00', isActive: false, isCompleted: true },
      { status: 'Đã Nhận Được Hàng', date: '13-06-2025', time: '10:00', isActive: false, isCompleted: true },
      { status: 'Đã Trả Hàng', date: '15-06-2025', time: '10:00', isActive: true, isCompleted: false }, // Active
    ], shippingTracking: [
      { status: 'Đã trả hàng về kho', date: '15-06-2025', time: '10:00' },
    ], totalShopVoucherDiscount: 0, totalPlatformVoucherDiscount: 0, totalShopeeCoinsDiscount: 0,
    items: [generateOrderItem(1006, 1, 'Khăn Lau Đa Năng', 'Loại: 5 cái', 100000, 100000, 1, 1, 1, false, undefined, undefined, [])]
  },
  // Các order khác từ ProfileOrderHistory trước đó để trang danh sách có nhiều item (Giữ nguyên)
  {
    OrderID: 1, OrderCode: 'MERZY001', UserID: 1, OrderDate: '2023-12-02T12:38:00Z', TotalAmount: 160650, SubtotalAmount: 189000, ShippingFee: 0, DiscountAmount: 28350, PaymentMethod: 'COD', PaymentStatus: 'Paid', OverallStatus: 'Completed', PlatformVoucherCode: null, PlatformDiscountAmount: 0, ShippingAddressID: 1, ShippingFullName: 'Name', ShippingPhoneNumber: '09xxxxxx', Notes: null, CreatedAt: '', UpdatedAt: '',
    ShopID: 101, shopName: 'Merzy Official Store', shopLevel: 'Mall', isFavoriteShop: false,
    shippingProvider: 'Giao Hàng Nhanh', trackingNumber: 'GY7LF89B',
    orderStatusHistory: [
      { status: 'Đơn Hàng Đã Đặt', date: '31-05-2025', time: '10:02', isActive: false, isCompleted: true },
      { status: 'Đã Xác Nhận Thông Tin Thanh Toán', date: '31-05-2025', time: '14:02', isActive: false, isCompleted: true },
      { status: 'Đã Giao Cho ĐVVC', date: '01-06-2025', time: '10:31', isActive: false, isCompleted: true },
      { status: 'Đã Nhận Được Hàng', date: '04-06-2025', time: '12:09', isActive: false, isCompleted: true }, // Complete, nhưng không active vì Completed
      { status: 'Đánh Giá', date: '', time: '', isActive: true, isCompleted: false }, // Đánh giá là bước cuối cùng, active nếu order đã nhận
    ],
    shippingTracking: [
      { status: 'Đã giao', date: '03-06-2025', time: '08:57', location: 'Giao hàng thành công' },
      { status: 'Đang vận chuyển', date: '03-06-2025', time: '07:36', location: 'Đơn hàng sẽ sớm được giao, vui lòng chú ý điện thoại' },
      { status: 'Đơn hàng đã đến trạm giao hàng tại khu vực của bạn Phường Hòa An, Quận Cẩm Lệ, Đà Nẵng và sẽ được giao trong vòng 24 giờ tiếp theo', date: '03-06-2025', time: '06:22' },
      { status: 'Đơn hàng đang được trung chuyển đến địa điểm kế tiếp', date: '02-06-2025', time: '03:48' },
      { status: 'Đơn hàng đã đến kho phân loại Phường Hòa Khánh Bắc, Quận Liên Chiểu, Đà Nẵng', date: '02-06-2025', time: '21:44' },
      { status: 'Đơn hàng đang được trung chuyển đến địa điểm kế tiếp', date: '02-06-2025', time: '02:58' },
    ],
    totalShopVoucherDiscount: 0,
    totalPlatformVoucherDiscount: 28350, // Giảm giá từ Platform Voucher
    totalShopeeCoinsDiscount: 0,
    items: [generateOrderItem(1, 1, '[NEW][SON PHAO] Son Kem Lì, Bền Màu Merzy Puffer Velvet Tint 3.7g', '#08 Unknown', 319000, 189000, 1, 1, 1, true, '2025-07-04T23:59:59Z', 200, [{ attributeName: 'Color', attributeValue: 'Red' }])]
  },
  {
    OrderID: 2, OrderCode: 'UKMART001', UserID: 1, OrderDate: '2023-12-01T10:00:00Z', TotalAmount: 136850, SubtotalAmount: 161000, ShippingFee: 0, DiscountAmount: 24150, PaymentMethod: 'COD', PaymentStatus: 'Paid', OverallStatus: 'Completed', PlatformVoucherCode: null, PlatformDiscountAmount: 0, ShippingAddressID: 1, ShippingFullName: 'Name', ShippingPhoneNumber: '09xxxxxx', Notes: null, CreatedAt: '', UpdatedAt: '',
    ShopID: 102, shopName: 'UKmart - Hàng Anh Thủ Đức', shopLevel: 'Yêu thích+', isFavoriteShop: true,
    shippingProvider: 'J&T Express', trackingNumber: 'JNTTRK001', orderStatusHistory: [], shippingTracking: [], totalShopVoucherDiscount: 0, totalPlatformVoucherDiscount: 0, totalShopeeCoinsDiscount: 0,
    items: [generateOrderItem(2, 2, 'Toner Eveline 5% Glycolic Acid Glycol Therapy Cho Da Căng Bóng Mịn Màng Mờ Thâm Mụn Trẻ Hóa Da', 'Glycol Therapy 110ml', 225000, 161000, 1, 3, 2, true, '2025-07-03T23:59:59Z', 200, [{ attributeName: 'Volume', attributeValue: '110ml' }])]
  },
  {
    OrderID: 3, OrderCode: 'PENDING001', UserID: 1, OrderDate: '2023-12-05T09:00:00Z', TotalAmount: 500000, SubtotalAmount: 500000, ShippingFee: 30000, DiscountAmount: 0, PaymentMethod: 'COD', PaymentStatus: 'Pending', OverallStatus: 'Pending', PlatformVoucherCode: null, PlatformDiscountAmount: 0, ShippingAddressID: 1, ShippingFullName: 'Name', ShippingPhoneNumber: '09xxxxxx', Notes: null, CreatedAt: '', UpdatedAt: '',
    ShopID: 103, shopName: 'ABC Tech', shopLevel: 'Thường', isFavoriteShop: false,
    shippingProvider: undefined, trackingNumber: undefined, orderStatusHistory: [], shippingTracking: [], totalShopVoucherDiscount: 0, totalPlatformVoucherDiscount: 0, totalShopeeCoinsDiscount: 0,
    items: [generateOrderItem(3, 3, 'Tai nghe Bluetooth X50', 'Màu Đen', 550000, 500000, 1, 5, 3, false, undefined, undefined, [{ attributeName: 'Color', attributeValue: 'Black' }])]
  },
  {
    OrderID: 5, OrderCode: 'CANCELLED001', UserID: 1, OrderDate: '2023-11-20T14:00:00Z', TotalAmount: 150000, SubtotalAmount: 150000, ShippingFee: 0, DiscountAmount: 0, PaymentMethod: 'COD', PaymentStatus: 'Failed', OverallStatus: 'CancelledByBuyer', PlatformVoucherCode: null, PlatformDiscountAmount: 0, ShippingAddressID: 1, ShippingFullName: 'Name', ShippingPhoneNumber: '09xxxxxx', Notes: null, CreatedAt: '', UpdatedAt: '',
    ShopID: 105, shopName: 'Phụ kiện HOT', shopLevel: 'Thường', isFavoriteShop: false,
    shippingProvider: undefined, trackingNumber: undefined, orderStatusHistory: [], shippingTracking: [], totalShopVoucherDiscount: 0, totalPlatformVoucherDiscount: 0, totalShopeeCoinsDiscount: 0,
    items: [generateOrderItem(5, 5, 'Ốp lưng iPhone 15 Pro', 'Màu Đen', 150000, 150000, 1, 8, 5, false, undefined, undefined, [{ attributeName: 'Color', attributeValue: 'Black' }])]
  },
  {
    OrderID: 6, OrderCode: 'RETURNED001', UserID: 1, OrderDate: '2023-11-15T10:00:00Z', TotalAmount: 200000, SubtotalAmount: 200000, ShippingFee: 0, DiscountAmount: 0, PaymentMethod: 'OnlineGateway', PaymentStatus: 'Refunded', OverallStatus: 'Returned', PlatformVoucherCode: null, PlatformDiscountAmount: 0, ShippingAddressID: 1, ShippingFullName: 'Name', ShippingPhoneNumber: '09xxxxxx', Notes: null, CreatedAt: '', UpdatedAt: '',
    ShopID: 106, shopName: 'Gia Dụng Xanh', shopLevel: 'Yêu thích+', isFavoriteShop: false,
    shippingProvider: undefined, trackingNumber: undefined, orderStatusHistory: [], shippingTracking: [], totalShopVoucherDiscount: 0, totalPlatformVoucherDiscount: 0, totalShopeeCoinsDiscount: 0,
    items: [generateOrderItem(6, 6, 'Bình giữ nhiệt 500ml', 'Màu Xanh', 200000, 200000, 1, 10, 6, false, undefined, undefined, [{ attributeName: 'Color', attributeValue: 'Green' }])]
  },
  {
    OrderID: 7, OrderCode: 'PROCESSING001', UserID: 1, OrderDate: '2023-12-03T11:00:00Z', TotalAmount: 300000, SubtotalAmount: 300000, ShippingFee: 0, DiscountAmount: 0, PaymentMethod: 'OnlineGateway', PaymentStatus: 'Paid', OverallStatus: 'Processing', PlatformVoucherCode: null, PlatformDiscountAmount: 0, ShippingAddressID: 1, ShippingFullName: 'Name', ShippingPhoneNumber: '09xxxxxx', Notes: null, CreatedAt: '', UpdatedAt: '', ShopID: 107, shopName: 'Smart Home', shopLevel: 'Thường', isFavoriteShop: false, items: [generateOrderItem(7, 7, 'Đèn LED thông minh', 'Trắng', 320000, 300000, 1, 12, 7, false, undefined, undefined, [{ attributeName: 'Color', attributeValue: 'White' }])] },
  {
    OrderID: 8, OrderCode: 'DELIVERED001', UserID: 1, OrderDate: '2023-11-29T16:00:00Z', TotalAmount: 180000, SubtotalAmount: 180000, ShippingFee: 0, DiscountAmount: 0, PaymentMethod: 'COD', PaymentStatus: 'Paid', OverallStatus: 'Delivered', PlatformVoucherCode: null, PlatformDiscountAmount: 0, ShippingAddressID: 1, ShippingFullName: 'Name', ShippingPhoneNumber: '09xxxxxx', Notes: null, CreatedAt: '', UpdatedAt: '', ShopID: 108,shopName:'alilabaa', shopLevel: 'Thường', isFavoriteShop: false, items: [generateOrderItem(8, 8, 'Áo phông Unisex', 'Size L, Trắng', 100000, 90000, 2, 14, 8, true, '2025-06-30T23:59:59Z', 100, [{ attributeName: 'Size', attributeValue: 'L' }, { attributeName: 'Color', attributeValue: 'White' }])] },
  {
    OrderID: 9, OrderCode: 'COMPLETED002', UserID: 1, OrderDate: '2023-11-20T10:00:00Z', TotalAmount: 450000, SubtotalAmount: 450000, ShippingFee: 0, DiscountAmount: 0, PaymentMethod: 'COD', PaymentStatus: 'Paid', OverallStatus: 'Completed', PlatformVoucherCode: null, PlatformDiscountAmount: 0, ShippingAddressID: 1, ShippingFullName: 'Name', ShippingPhoneNumber: '09xxxxxx', Notes: null, CreatedAt: '', UpdatedAt: '', ShopID: 101, shopName: 'Merzy Official Store', shopLevel: 'Mall', isFavoriteShop: false, items: [generateOrderItem(9, 9, 'Bảng phấn mắt 12 màu', 'Nude Tones', 500000, 450000, 1, 16, 9, true, '2025-07-01T23:59:59Z', 150, [{ attributeName: 'Color', attributeValue: 'Nude' }])] },
  { OrderID: 10, OrderCode: 'COMPLETED003', UserID: 1, OrderDate: '2023-11-18T08:00:00Z', TotalAmount: 75000, SubtotalAmount: 75000, ShippingFee: 0, DiscountAmount: 0, PaymentMethod: 'OnlineGateway', PaymentStatus: 'Paid', OverallStatus: 'Completed', PlatformVoucherCode: null, PlatformDiscountAmount: 0, ShippingAddressID: 1, ShippingFullName: 'Name', ShippingPhoneNumber: '09xxxxxx', Notes: null, CreatedAt: '', UpdatedAt: '', ShopID: 102, shopName: 'UKmart - Hàng Anh Thủ Đức', shopLevel: 'Yêu thích+', isFavoriteShop: true, items: [generateOrderItem(10, 10, 'Sữa rửa mặt Cetaphil', '125ml', 80000, 75000, 1, 18, 10, true, '2025-06-25T23:59:59Z', 50, [{ attributeName: 'Volume', attributeValue: '125ml' }])] },
  { OrderID: 11, OrderCode: 'COMPLETED004', UserID: 1, OrderDate: '2023-11-10T14:00:00Z', TotalAmount: 220000, SubtotalAmount: 220000, ShippingFee: 0, DiscountAmount: 0, PaymentMethod: 'COD', PaymentStatus: 'Paid', OverallStatus: 'Completed', PlatformVoucherCode: null, PlatformDiscountAmount: 0, ShippingAddressID: 1, ShippingFullName: 'Name', ShippingPhoneNumber: '09xxxxxx', Notes: null, CreatedAt: '', UpdatedAt: '', ShopID: 101, shopName: 'Merzy Official Store', shopLevel: 'Mall', isFavoriteShop: false, items: [generateOrderItem(11, 11, 'Kem dưỡng ẩm Cerave', '200ml', 250000, 220000, 1, 20, 11, true, '2025-06-20T23:59:59Z', 100, [{ attributeName: 'Volume', attributeValue: '200ml' }])] },
  { OrderID: 12, OrderCode: 'COMPLETED005', UserID: 1, OrderDate: '2023-11-05T11:00:00Z', TotalAmount: 110000, SubtotalAmount: 110000, ShippingFee: 0, DiscountAmount: 0, PaymentMethod: 'COD', PaymentStatus: 'Paid', OverallStatus: 'Completed', PlatformVoucherCode: null, PlatformDiscountAmount: 0, ShippingAddressID: 1, ShippingFullName: 'Name', ShippingPhoneNumber: '09xxxxxx', Notes: null, CreatedAt: '', UpdatedAt: '', ShopID: 102, shopName: 'UKmart - Hàng Anh Thủ Đức', shopLevel: 'Yêu thích+', isFavoriteShop: true, items: [generateOrderItem(12, 12, 'Nước hoa hồng Simple', '200ml', 120000, 110000, 1, 22, 12, true, '2025-06-15T23:59:59Z', 80, [{ attributeName: 'Volume', attributeValue: '200ml' }])] },
  { OrderID: 13, OrderCode: 'NOVARIANTIMG', UserID: 1, OrderDate: '2023-10-30T10:00:00Z', TotalAmount: 200000, SubtotalAmount: 200000, ShippingFee: 0, DiscountAmount: 0, PaymentMethod: 'COD', PaymentStatus: 'Paid', OverallStatus: 'Completed', PlatformVoucherCode: null, PlatformDiscountAmount: 0, ShippingAddressID: 1, ShippingFullName: 'Name', ShippingPhoneNumber: '09xxxxxx', Notes: null, CreatedAt: '', UpdatedAt: '', ShopID: 101, shopName: 'Merzy Official Store', shopLevel: 'Mall', isFavoriteShop: false, items: [generateOrderItem(13, 13, 'Test Product: No Variant Image', 'Default', 250000, 200000, 1, 63, 55, false, undefined, undefined, [{ attributeName: 'Size', attributeValue: 'Default' }])] },
  { OrderID: 14, OrderCode: 'NOIMAGEALL', UserID: 1, OrderDate: '2023-10-25T11:00:00Z', TotalAmount: 50000, SubtotalAmount: 50000, ShippingFee: 0, DiscountAmount: 0, PaymentMethod: 'COD', PaymentStatus: 'Paid', OverallStatus: 'Completed', PlatformVoucherCode: null, PlatformDiscountAmount: 0, ShippingAddressID: 1, ShippingFullName: 'Name', ShippingPhoneNumber: '09xxxxxx', Notes: null, CreatedAt: '', UpdatedAt: '', ShopID: 102, shopName: 'UKmart - Hàng Anh Thủ Đức', shopLevel: 'Yêu thích+', isFavoriteShop: true, items: [generateOrderItem(14, 14, 'Test Product: No Image At All', 'Generic', 60000, 50000, 1, 9999, 9999, false, undefined, undefined, [{ attributeName: 'Type', attributeValue: 'Generic' }])] },
];
export default function OrderIdPage() { // Đổi tên component trong page.tsx
  const params = useParams();
  const orderId = params.orderId; // Lấy orderId từ params

  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    // Tìm order trong ALL_MOCK_ORDERS_DATA
    const foundOrder = ALL_MOCK_ORDERS_DATA.find(o => o.OrderID.toString() === orderId);
    setOrder(foundOrder || null);
  }, [orderId]);

  if (!order) {
    return <div className="text-center py-10">Đang tải chi tiết đơn hàng hoặc không tìm thấy đơn hàng...</div>;
  }

  return (
    <div className="flex-1 text-black">
      <OrderDetailContent order={order} />
    </div>
  );
}