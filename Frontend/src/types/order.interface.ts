// types/order.interface.ts

// Cập nhật OrderStatus để khớp với tên tabs và trạng thái thực tế
export type OrderStatus =
  'PendingPayment' |   // Chờ thanh toán
  'Processing' |       // Chờ giao hàng (hoặc Đang xử lý)
  'Shipped' |          // Vận chuyển
  'Delivered' |        // Đã giao hàng (nếu có tab riêng cho nó)
  'Completed' |        // Hoàn thành
  'Cancelled' |        // Đã hủy (CancelledByBuyer/Seller)
  'ReturnedRefunded';  // Trả hàng/Hoàn tiền (Returned/Refunded/ReturnInProgress)


export type ReturnItemStatus =
  'None' | 'Requested' | 'Approved' | 'Rejected' | 'Returned' |
  'Refunded' | 'PartiallyRefunded';

// Enum cho Level của Shop (Mall, Yêu thích+)
export type ShopLevel = 'Thường' | 'Mall' | 'Yêu thích+';

export interface OrderItem {
  OrderItemID: number;
  VariantID: number;
  Quantity: number;
  PriceAtPurchase: number; // Giá tại thời điểm mua, sau khi đã áp dụng mọi chiết khấu của item.
  OriginalPrice: number;   // Giá gốc (trước khi có sale/discount của sản phẩm), dùng để gạch ngang.
  Subtotal: number;        // Tổng tiền cho số lượng item này (PriceAtPurchase * Quantity)
  IsFlashSaleItem: boolean;
  FlashSaleDealID: number | null;
  ReturnStatus: ReturnItemStatus;
  CreatedAt: string;

  productName: string;
  productImageURL: string;
  classification: string; // Phân loại hàng: #08 Unknown, Glycol Therapy 110ml

  // THÔNG TIN LIÊN QUAN ĐẾN ĐÁNH GIÁ (cho từng OrderItem)
  canReview: boolean; // Có thể đánh giá sản phẩm này không
  reviewDeadline?: string; // Hạn chót đánh giá (ISO string)
  reviewReward?: number; // Số xu nhận được khi đánh giá
}

export interface Order {
  OrderID: number;
  OrderCode: string;
  UserID: number;
  OrderDate: string; // ISO string
  TotalAmount: number; // Tổng tiền cuối cùng của đơn hàng
  SubtotalAmount: number; // Tổng tiền các sản phẩm trước phí ship/voucher
  ShippingFee: number;
  DiscountAmount: number;
  ShippingAddressID: number;
  ShippingFullName: string;
  ShippingPhoneNumber: string;
  Notes: string | null;
  PaymentMethod: 'COD' | 'BankTransfer' | 'OnlineGateway';
  PaymentStatus: 'Pending' | 'Paid' | 'Failed' | 'Refunded' | 'PartiallyRefunded';
  OverallStatus: OrderStatus; // TRẠNG THÁI TỔNG THỂ CỦA ĐƠN HÀNG

  PlatformVoucherCode: string | null;
  PlatformDiscountAmount: number;
  CreatedAt: string;
  UpdatedAt: string;

  items: OrderItem[]; // Danh sách các mặt hàng trong đơn hàng này

  // THÔNG TIN VỀ SHOP CẦN HIỂN THỊ
  ShopID: number;
  shopName: string;
  shopLevel: ShopLevel; // Mall, Yêu thích+, Thường
  isFavoriteShop: boolean; // Có đang follow shop này không
}