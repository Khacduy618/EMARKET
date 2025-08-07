

// types/order.interface.ts
import { Address } from './address.interface';
import { ShopSummary, ShopLevel } from './shop.interface';
import { Product, ProductSummary, ProductVariant } from './product.interface';
import { AppliedShopVouchers, AppliedVouchersCombined, Voucher } from './voucher.interface';
import { CartItem } from './cartItem.interface';

// import { ProductVariant } from './product.interface'; // Không cần import ProductVariant đầy đủ nếu bạn đã có MockVariant

// Enums từ SQL và UI
export type OrderStatus =
  'Pending' |          // (từ SQL)
  'Processing' |       // (từ SQL)
  'Shipped' |          // (từ SQL)
  'Delivered' |        // (từ SQL)
  'Completed' |
  'Cancelled'  |      // (từ SQL)
  'CancelledByBuyer' | // (từ SQL)
  'CancelledBySeller' |// (từ SQL)
  'Returned' |         // (từ SQL)
  'ReturnInProgress'; // (từ SQL)

// Trạng thái cho UI tab OrderHistory
export type OrderTabStatus =
  'all' | 'PendingPayment' | 'Processing' | 'Shipped' |
  'Completed' | 'Cancelled' | 'ReturnedRefunded';


export type ReturnItemStatus =
  'None' | 'Requested' | 'Approved' | 'Rejected' | 'Returned' |
  'Refunded' | 'PartiallyRefunded';

export type PaymentMethodType = 'COD' | 'Paypal' | 'VNPay';
export type PaymentStatusType = 'Pending' | 'Paid' | 'Failed' | 'Refunded' | 'PartiallyRefunded';



export interface StatusTab {
  id: OrderTabStatus; // Sử dụng OrderTabStatus đã định nghĩa ở đây
  name: string;
  count: number;
}

// --- INTERFACE OrderItem (LỊCH SỬ ĐƠN HÀNG) ---
// Chứa đầy đủ thông tin tĩnh của một item trong đơn hàng đã đặt
export interface OrderItem {
  OrderItemID: number;
  OrderID: number;           // Thuộc tính bắt buộc
  VariantID: number;
  ProductID: number;         // Để có thể lấy ảnh chính từ Product nếu variant không có ảnh
  Quantity: number;
  PriceAtPurchase: number;
  OriginalPrice: number;
  Subtotal: number;
  IsFlashSaleItem: boolean;
  FlashSaleDealID: number | null;
  ReturnStatus: ReturnItemStatus;
  CreatedAt: string;
  productVariant: ProductVariant & {
      product: Product;
  };
  productName: string;
  productImageURL: string;
  classification: string;
  productAttributes?: { attributeName: string; attributeValue: string }[];

  canReview: boolean;
  reviewDeadline?: string;
  reviewReward?: number;
}

// --- INTERFACE CheckoutProductItem (CHO GIỎ HÀNG/CHECKOUT) ---
// Bao gồm các trường từ MockVariant (nếu cần) và các trường cần thiết cho UI Checkout
export interface CheckoutProductItem {
  variantId: number;          // Sửa từ VariantID
  productId: number;          // Sửa từ ProductID
  shopId: number;             // Thêm vào để biết item thuộc shop nào
  name: string;               // Sửa từ productName
  imageUrl: string | null;    // Sửa từ productImageURL
  classification: string;

  price: number;
  originalPrice: number | null; // Sử dụng number | null cho nhất quán
  quantity: number;
  subtotal: number;

  hasInsurance: boolean;
  insurancePrice?: number;
  insuranceDescription?: string;
  insuranceLearnMoreLink?: string;
  product?: ProductSummary | null;

  // Các trường từ ProductVariant (nếu cần cho mock data hoặc hiển thị chi tiết hơn)
  SKU?: string | null;
  CompareAtPrice?: number; // Optional
  StockQuantity?: number;
  IsActive?: boolean;
  CreatedAt?: string; // Optional
  UpdatedAt?: string; // Optional
}

export interface OrderDetailShopOrder {
    shopId: number;
    shopName: string;
    shopLevel: ShopLevel;
    isFavoriteShop: boolean;
    items: OrderItem[];
    // Thêm các trường voucher cho shop
    appliedShopVoucherCode?: string | null;
    shopVoucherDiscountAmount?: number ;
}

// --- INTERFACE Order (LỊCH SỬ ĐƠN HÀNG) ---
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
  PaymentMethod: 'COD' | 'BankTransfer' | 'OnlineGateway'; // Đây là PaymentMethod trong OrdersBuyer
  PaymentStatus: PaymentStatusType; // Đây là PaymentStatus trong OrdersBuyer
  OverallStatus: OrderStatus; // Đây là OverallStatus trong OrdersBuyer
  
  shopvoucher: string | null;
  shopdiscountamount: number;
  
  PlatformVoucherCode: string | null;
  PlatformDiscountAmount: number;
  CreatedAt: string;
  UpdatedAt: string;

  items: OrderItem[];

  shopOrders: OrderDetailShopOrder[];

  ShopID: number;
  shopName: string;
  shopLevel: ShopLevel;
  isFavoriteShop: boolean;

  ReasonForRejection?: string;
  shippingProvider?: string; // Tên nhà vận chuyển (ví dụ?: SPX Express)
  trackingNumber?: string; // Mã vận đơn (ví dụ?: SPXVN037324157726)
  orderStatusHistory?: OrderStatusHistory[]; // Lịch sử trạng thái trên timeline
  shippingTracking?: ShippingTracking[]; // Lịch sử theo dõi chi tiết vận chuyển
  totalShopVoucherDiscount?: number; // Tổng giảm giá từ voucher shop (để hiển thị ở cuối)
  totalPlatformVoucherDiscount?: number; // Tổng giảm giá từ voucher toàn sàn (để hiển thị ở cuối)
  totalShopeeCoinsDiscount?: number;
}

// --- INTERFACE CheckoutData (CHO TRANG THANH TOÁN) ---
// export interface CheckoutProductItem {
//     variantId: number;
//     productId: number;
//     shopId: number;
//     name: string;
//     imageUrl: string | null;
//     classification: string;
//     price: number; // Giá bán sau khi đã tính discount của sản phẩm
//     originalPrice?: number; // Giá gốc để gạch ngang
//     quantity: number;
//     subtotal: number;
// }

export interface CheckoutShopOrder {
    shopId: number;
    shopName: string;
    shopLevel: ShopLevel;
    items: CheckoutProductItem[];
    shippingMethod: string;
    shippingFee: number;
    deliveryEstimate: string;
    appliedVoucher: Voucher | null; // Voucher của shop đã áp dụng
    messageToSeller: string;
}

export interface StoredCheckoutData {
    orderId?: number;
    selectedItems: CartItem[];
    appliedShopVouchers: AppliedShopVouchers;
    appliedPlatformVouchers: AppliedVouchersCombined;
    summary: { // Đảm bảo cấu trúc summary khớp
        totalSubtotal: number;
        totalDiscount: number;
        finalTotal: number;
        totalSaleoff: number;
        totalFreeship: number;
        totalShopVoucherDiscount: number;
        totalPlatformVoucherDiscount: number;
    };
}

export interface CheckoutSummaryDetails {
    totalProductsPrice: number;
    totalShippingFee: number;
    totalSaleoff: number;
    totalFreeship: number;
    totalShopVoucherDiscount: number; // Giảm giá từ voucher của các shop
    totalPlatformVoucherDiscount: number; // Giảm giá từ voucher toàn sàn
    totalDiscount: number; // Tổng giảm giá (shop + platform)
    finalTotal: number;     // Tổng thanh toán
    address : Address | null;
}

export interface CheckoutData {
    orderId?: number; 
    address: Address | null;
    shopOrders: CheckoutShopOrder[];
    appliedPlatformVouchers: AppliedVouchersCombined;
    summary: CheckoutSummaryDetails;
    // Thêm các thông tin khác nếu cần
    paymentMethod: {
        method: string;
        type: PaymentMethodType;
        canChange: boolean;
    };
    paidAt?: any;
}

export interface OrderStatusHistory {
  status: string; // Tên trạng thái (ví dụ: "Đơn Hàng Đã Đặt")
  date: string; // Ngày (ví dụ: "15-06-2025")
  time: string; // Giờ (ví dụ: "10:14")
  isActive: boolean; // Trạng thái hiện tại
  isCompleted: boolean; // Đã hoàn thành (có dấu tích)
}

// Thông tin theo dõi vận chuyển
export interface ShippingTracking {
  status: string; // Trạng thái (ví dụ: "Đang vận chuyển")
  location?: string; // Địa điểm (ví dụ: "kho phân loại tại Da Nang SOC")
  date: string; // Ngày (ví dụ: "17-06-2025")
  time: string; // Giờ (ví dụ: "02:02")
}

export const formatDateTime = (dateString: Date) => {
    const dateTimeOptions: Intl.DateTimeFormatOptions = {
        month: 'short', // abbreviated month name (e.g., 'Oct')
        year: 'numeric', // abbreviated month name (e.g., 'Oct')
        day: 'numeric', // numeric day of the month (e.g., '25')
        hour: 'numeric', // numeric hour (e.g., '8')
        minute: 'numeric', // numeric minute (e.g., '30')
        hour12: true, // use 12-hour clock (true) or 24-hour clock (false)
    };
    const dateOptions: Intl.DateTimeFormatOptions = {
        weekday: 'short', // abbreviated weekday name (e.g., 'Mon')
        month: 'short', // abbreviated month name (e.g., 'Oct')
        year: 'numeric', // numeric year (e.g., '2023')
        day: 'numeric', // numeric day of the month (e.g., '25')
    };
    const timeOptions: Intl.DateTimeFormatOptions = {
        hour: 'numeric', // numeric hour (e.g., '8')
        minute: 'numeric', // numeric minute (e.g., '30')
        hour12: true, // use 12-hour clock (true) or 24-hour clock (false)
    };
    const formattedDateTime: string = new Date(dateString).toLocaleString(
        'en-US',
        dateTimeOptions
    );
    const formattedDate: string = new Date(dateString).toLocaleString(
        'en-US',
        dateOptions
    );
    const formattedTime: string = new Date(dateString).toLocaleString(
        'en-US',
        timeOptions
    );
    return {
        dateTime: formattedDateTime,
        dateOnly: formattedDate,
        timeOnly: formattedTime,
    };
};
export interface PaginatedOrders {
  data: Order[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
}
