export interface User {
    UserID: number;
    Username: string;
    Email: string;
    FullName?: string;
    DefaultShippingAddressID?: number;
    Phone?: string;
    Level: 'Đồng' | 'Bạc' | 'Vàng' | 'Bạch kim' | 'Kim cương';
    Role: 'Buyer' | 'Seller' | 'Admin';
    IsActive: boolean;
    CreatedAt: string;
    UpdatedAt: string;
}

export interface Product {
    ProductID: number;
    ShopID: number;
    CategoryID: number;
    Name: string;
    Description?: string;
    SKU?: string;
    Price: number;
    discount: number;
    StockQuantity: number;
    IsActive: boolean;
    AdminApprovalStatus: 'Pending' | 'Approved' | 'Rejected';
    ReasonForRejection?: string;
    AverageRating?: number;
    ViewCount?: number;
    SoldCount?: number;
    CreatedAt: string;
    UpdatedAt: string;
    // Add any other relevant product fields you might need
}

export interface CartItem {
    CartItemID: number;
    CartID: number;
    ProductID: number;
    ShopID: number;
    Quantity: number;
    AddedAt: string;
    UpdatedAt: string;
    product: Product; // Include the related product data
}

export interface Cart {
    CartID: number;
    UserID_Buyer: number;
    CreatedAt: string;
    UpdatedAt: string;
    cartItems: CartItem[]; // Include the related cart items
}

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
    CreatedAt: string;
    UpdatedAt: string;
}

export interface Shop {
    ShopID: number;
    UserID_Owner: number;
    ShopName: string;
    Description?: string;
    LogoURL?: string;
    CoverImageURL?: string;
    ShopAddress?: string;
    ShopPhone?: string;
    AverageRating?: number;
    Status: 'PendingApproval' | 'Approved' | 'Suspended' | 'Rejected';
    CreatedAt: string;
    UpdatedAt: string;
}

// Add other types as needed based on your backend models and API responses
