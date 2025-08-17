// Các kiểu dữ liệu phụ, lồng nhau
export interface ApiUser {
    UserID: number;
    FullName: string;
    Phone?: string;
}

export interface ApiOrder {
    OrderID: number;
    OrderCode: string;
    PaymentMethod: 'COD' | 'VNPay' | string;
}

export interface ApiProduct {
    ProductID: number;
    Name: string;
}

export interface ApiVariant {
    VariantID: number;
    SKU: string;
    ImageURL: string | null;
    product: ApiProduct;
}

export interface ApiOrderItem {
    OrderItemID: number;
    Quantity: number;
    PriceAtPurchase: number;
    variant: ApiVariant;
}

// Kiểu dữ liệu chính cho một yêu cầu trả hàng
export interface ReturnRequest {
    ReturnRequestID: number;
    OrderID: number;
    OrderItemID: number;
    UserID: number;
    ShopID: number;
    RequestType: 'Return' | 'Refund';
    ReasonDescription: string;
    EvidenceURLs: string | string[] | null;
    Status: string;
    SellerNote: string | null;
    RefundAmount: string | null;
    RequestedAt: string;
    RefundBankName: string | null;
    RefundAccountNumber: string | null;
    RefundAccountHolderName: string | null;
    user: ApiUser;
    order: ApiOrder;
    order_item: ApiOrderItem;
}

// Kiểu dữ liệu cho phản hồi API có phân trang
export interface PaginatedResponse<T> {
    current_page: number;
    data: T[];
    last_page: number;
    total: number;
    from: number;
    to: number;
}