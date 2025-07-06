export interface Address {
    AddressID: number;
    UserID: number;
    FullName: string;
    PhoneNumber: string;
    Street: string;
    Ward?: string;
    District: string;
    City: string;
    IsDefault: boolean;
    DeletedAt?: string;
    CreatedAt: string;
    UpdatedAt: string;
}

export interface ProductVariant {
    VariantID: number;
    ProductID: number;
    SKU?: string;
    Price: number;
    CompareAtPrice?: number;
    StockQuantity: number;
    ImageURL?: string;
    IsActive: boolean;
    CreatedAt: string;
    UpdatedAt: string;
    product?: Product;
}

export interface Product {
    ProductID: number;
    ShopID: number;
    CategoryID: number;
    Name: string;
    Description?: string;
    Discount: number;
    viewCount: number;
    IsActive: boolean;
    AdminApprovalStatus: string;
    ReasonForRejection?: string;
    CreatedAt: string;
    UpdatedAt: string;
    StockQuantity: number;
}

export interface OrderItem {
    OrderItemID: number;
    OrderID: number;
    VariantID: number;
    Quantity: number;
    PriceAtPurchase: number;
    Subtotal: number;
    IsFlashSaleItem: boolean;
    FlashSaleDealID?: number;
    ReturnStatus: string;
    productVariant?: ProductVariant;
    returnRequest?: ReturnRequest;
}

export interface ReturnRequest {
    ReturnRequestID: number;
    OrderID: number;
    OrderItemID?: number;
    UserID: number;
    ShopID: number;
    RequestType: string;
    ReasonCode?: string;
    ReasonDescription: string;
    EvidenceURLs?: string[];
    Status: string;
    SellerNote?: string;
    AdminNote?: string;
    ResolutionType?: string;
    RefundAmount?: number;
    BuyerShippingInfoForReturn?: string;
    ShopShippingInfoForReturn?: string;
    RequestedAt: string;
    LastUpdatedAt: string;
}

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
    Notes?: string;
    PaymentMethod: string;
    PaymentStatus: string;
    OverallStatus: string;
    PlatformVoucherCode?: string;
    PlatformDiscountAmount?: number;
    CreatedAt: string;
    UpdatedAt: string;
    customer?: User;
    shipping_address?: Address;
    orderItems: OrderItem[]; // Thay items bằng orderItems
}

export interface User {
    UserID: number;
    Username: string;
    Email: string;
    Password: string;
    FullName?: string;
    Phone?: string;
    Level: string;
    Role: string;
    IsActive: boolean;
    Token?: string;
    CreatedAt: string;
    updated_at: string;
  }