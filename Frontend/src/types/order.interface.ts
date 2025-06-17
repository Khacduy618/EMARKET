// // types/order.interface.ts

// // Cập nhật OrderStatus để khớp với tên tabs và trạng thái thực tế
// export type OrderStatus =
//   'PendingPayment' |   // Chờ thanh toán
//   'Processing' |       // Chờ giao hàng (hoặc Đang xử lý)
//   'Shipped' |          // Vận chuyển
//   'Delivered' |        // Đã giao hàng (nếu có tab riêng cho nó)
//   'Completed' |        // Hoàn thành
//   'Cancelled' |        // Đã hủy (CancelledByBuyer/Seller)
//   'ReturnedRefunded';  // Trả hàng/Hoàn tiền (Returned/Refunded/ReturnInProgress)


// export type ReturnItemStatus =
//   'None' | 'Requested' | 'Approved' | 'Rejected' | 'Returned' |
//   'Refunded' | 'PartiallyRefunded';

// // Enum cho Level của Shop (Mall, Yêu thích+)
// export type ShopLevel = 'Thường' | 'Mall' | 'Yêu thích+';

// export interface OrderItem {
//   OrderItemID: number;
//   VariantID: number;
//   Quantity: number;
//   PriceAtPurchase: number; // Giá tại thời điểm mua, sau khi đã áp dụng mọi chiết khấu của item.
//   OriginalPrice: number;   // Giá gốc (trước khi có sale/discount của sản phẩm), dùng để gạch ngang.
//   Subtotal: number;        // Tổng tiền cho số lượng item này (PriceAtPurchase * Quantity)
//   IsFlashSaleItem: boolean;
//   FlashSaleDealID: number | null;
//   ReturnStatus: ReturnItemStatus;
//   CreatedAt: string;

//   productName: string;
//   productImageURL: string;
//   classification: string; // Phân loại hàng: #08 Unknown, Glycol Therapy 110ml

//   // THÔNG TIN LIÊN QUAN ĐẾN ĐÁNH GIÁ (cho từng OrderItem)
//   canReview: boolean; // Có thể đánh giá sản phẩm này không
//   reviewDeadline?: string; // Hạn chót đánh giá (ISO string)
//   reviewReward?: number; // Số xu nhận được khi đánh giá
// }

// export interface Order {
//   OrderID: number;
//   OrderCode: string;
//   UserID: number;
//   OrderDate: string; // ISO string
//   TotalAmount: number; // Tổng tiền cuối cùng của đơn hàng
//   SubtotalAmount: number; // Tổng tiền các sản phẩm trước phí ship/voucher
//   ShippingFee: number;
//   DiscountAmount: number;
//   ShippingAddressID: number;
//   ShippingFullName: string;
//   ShippingPhoneNumber: string;
//   Notes: string | null;
//   PaymentMethod: 'COD' | 'BankTransfer' | 'OnlineGateway';
//   PaymentStatus: 'Pending' | 'Paid' | 'Failed' | 'Refunded' | 'PartiallyRefunded';
//   OverallStatus: OrderStatus; // TRẠNG THÁI TỔNG THỂ CỦA ĐƠN HÀNG

//   PlatformVoucherCode: string | null;
//   PlatformDiscountAmount: number;
//   CreatedAt: string;
//   UpdatedAt: string;

//   items: OrderItem[]; // Danh sách các mặt hàng trong đơn hàng này

//   // THÔNG TIN VỀ SHOP CẦN HIỂN THỊ
//   ShopID: number;
//   shopName: string;
//   shopLevel: ShopLevel; // Mall, Yêu thích+, Thường
//   isFavoriteShop: boolean; // Có đang follow shop này không
// }
// types/order.interface.ts
import { Address } from './address.interface';
import { ShopSummary } from './shop.interface';
import { ProductVariant } from './product.interface'; // Import ProductVariant đầy đủ
import { CartItem } from './cartItem.interface'; // Import CartItem nếu cần dùng lại

export type OrderStatus =
  'Pending' |          // (từ SQL)
  'Processing' |       // (từ SQL)
  'Shipped' |          // (từ SQL)
  'Delivered' |        // (từ SQL)
  'Completed' |        // (từ SQL)
  'CancelledByBuyer' | // (từ SQL)
  'CancelledBySeller' |// (từ SQL)
  'Returned' |         // (từ SQL)
  'ReturnInProgress' | // (từ SQL)
  'ReturnedRefunded' | // Custom UI status cho "Trả hàng/Hoàn tiền"
  'Cancelled';         // Custom UI status cho "Đã hủy" (tổng hợp)


export type ReturnItemStatus =
  'None' | 'Requested' | 'Approved' | 'Rejected' | 'Returned' |
  'Refunded' | 'PartiallyRefunded';

export type ShopLevel = 'Thường' | 'Mall' | 'Yêu thích+';


// --- ĐỊNH NGHĨA CHUNG CHO ITEM TRONG ORDER (LỊCH SỬ ĐƠN HÀNG) ---
// Bao gồm các trường cần thiết từ ProductVariant và các trường bổ sung cho OrderItem
export interface OrderItem { // Đây là OrderItem cho Order (lịch sử đơn hàng)
  OrderItemID: number;
  OrderID: number;
  VariantID: number;
  ProductID: number;
  Quantity: number; // <--- ĐẢM BẢO TRƯỜNG NÀY CÓ Ở ĐÂY
  PriceAtPurchase: number;
  OriginalPrice: number;
  Subtotal: number; // <--- ĐẢM BẢO TRƯỜNG NÀY CÓ Ở ĐÂY
  IsFlashSaleItem: boolean;
  FlashSaleDealID: number | null;
  ReturnStatus: ReturnItemStatus;
  CreatedAt: string;

  productName: string;
  productImageURL: string;
  classification: string;
  productAttributes?: { attributeName: string; attributeValue: string }[];

  canReview: boolean;
  reviewDeadline?: string;
  reviewReward?: number;
}

// --- ĐỊNH NGHĨA CHUNG CHO ITEM TRONG CHECKOUT (GIỎ HÀNG/TRƯỚC KHI TẠO ĐƠN) ---
// Các trường cần thiết từ CartItem và ProductVariant
export interface CheckoutProductItem { // Đây là Product Item cho Checkout (giỏ hàng/trước khi đặt hàng)
  VariantID: number;
  ProductID: number;
  productName: string;
  productImageURL: string;
  classification: string;

  price: number;
  originalPrice?: number;
  quantity: number; // <--- THÊM DÒNG NÀY ĐỂ KHẮC PHỤC LỖI
  subtotal: number; // <--- THÊM DÒNG NÀY ĐỂ KHẮC PHỤC LỖI

  hasInsurance: boolean;
  insurancePrice?: number;
  insuranceDescription?: string;
  insuranceLearnMoreLink?: string;

  SKU?: string | null;
  CompareAtPrice?: number | null;
  StockQuantity?: number;
  IsActive?: boolean;
  CreatedAt?: string;
  UpdatedAt?: string;
}


// --- INTERFACE CHO Order (LỊCH SỬ ĐƠN HÀNG) ---
export interface Order {
  OrderID: number;
  OrderCode: string;
  UserID: number;
  OrderDate: string;
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

  items: OrderItem[]; // Sử dụng OrderItem cho lịch sử đơn hàng

  ShopID: number;
  shopName: string;
  shopLevel: ShopLevel;
  isFavoriteShop: boolean;
}

// --- INTERFACE CHO CheckoutData (TRANG THANH TOÁN) ---
export interface CheckoutShopOrder {
  ShopID: number;
  shopName: string;
  shopLevel: ShopLevel;
  isFavoriteShop: boolean;

  items: CheckoutProductItem[]; // Sử dụng CheckoutProductItem cho trang thanh toán

  shippingMethod: string;
  shippingFee: number;
  deliveryEstimate: string;
  shippingVoucherDiscount?: number;
  shippingVoucherNote?: string;

  messageToSeller: string;
}

export interface CheckoutVoucher {
  VoucherID: number;
  type: 'platform' | 'shop';
  code: string;
  description: string;
  discountAmount: number;
  isSelected: boolean;
}

export interface CheckoutSummaryDetails {
  totalProductsPrice: number;
  totalShippingFee: number;
  totalVoucherDiscount: number;
  totalShopeeCoinsDiscount: number;
  totalPayment: number;
}

export interface CheckoutData {
  user: {
    UserID: number;
    Username: string;
  };
  address: Address;
  shopOrders: CheckoutShopOrder[];
  availablePlatformVouchers: CheckoutVoucher[];
  shopeeCoins: {
    currentCoins: number;
    isApplied: boolean;
    appliedAmount: number;
  };
  paymentMethod: {
    method: string;
    canChange: boolean;
  };
  checkoutSummary: CheckoutSummaryDetails;
}