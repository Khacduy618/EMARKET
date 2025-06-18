// types/order.interface.ts

// Enum cho trạng thái đơn hàng (từ OverallStatus trong OrdersBuyer)
export type OrderStatus =
  'Pending' | 'Processing' | 'Shipped' | 'Delivered' |
  'CancelledByBuyer' | 'CancelledBySeller' | 'Returned' |
  'ReturnInProgress' | 'Completed';

// Enum cho trạng thái trả hàng (từ ReturnStatus trong OrderItems)
export type ReturnItemStatus =
  'None' | 'Requested' | 'Approved' | 'Rejected' | 'Returned' |
  'Refunded' | 'PartiallyRefunded';

// Định nghĩa cho một sản phẩm trong đơn hàng
export interface OrderItem {
  OrderItemID: number;
  VariantID: number;
  Quantity: number;
  PriceAtPurchase: number; // Giá tại thời điểm mua
  Subtotal: number;       // Subtotal cho riêng item này
  IsFlashSaleItem: boolean;
  FlashSaleDealID: number | null;
  ReturnStatus: ReturnItemStatus;
  CreatedAt: string;

  // Các trường bổ sung cần thiết cho UI (giả định từ join/backend)
  productName: string;
  productImageURL: string; // URL ảnh của variant/sản phẩm
  productAttributes?: { attributeName: string; attributeValue: string }[]; // VD: Màu: Đen, Kích thước: M
}

// Định nghĩa cho một đơn hàng
export interface Order {
  OrderID: number;
  OrderCode: string;
  UserID: number;
  OrderDate: string; // ISO string
  TotalAmount: number;
  SubtotalAmount: number;
  ShippingFee: number;
  DiscountAmount: number;
  ShippingAddressID: number;
  ShippingFullName: string;
  ShippingPhoneNumber: string;
  Notes: string | null;
  PaymentMethod: 'COD' | 'BankTransfer' | 'OnlineGateway';
  PaymentStatus: 'Pending' | 'Paid' | 'Failed' | 'Refunded' | 'PartiallyRefunded';
  OverallStatus: OrderStatus;
  PlatformVoucherCode: string | null;
  PlatformDiscountAmount: number;
  CreatedAt: string;
  UpdatedAt: string;

  items: OrderItem[]; // Danh sách các mặt hàng trong đơn hàng này
}