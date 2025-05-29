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
    ImageURL?: string; // Added ImageURL property
    CreatedAt: string;
    UpdatedAt: string;
    // Add any other relevant product fields you might need
}

export interface CartItem {
    CartItemID: number;
    CartID: number;
    ShopID: number;
    Quantity: number;
    AddedAt: string;
    CartItemUpdatedAt: string;
    // Remove the direct 'product: Product' field
    // Add nested structure based on backend DB query output
    productVariant: {
        VariantID: number;
        ProductID: number;
        SKU: string | null;
        Price: number; // This is the variant price
        CompareAtPrice: number | null;
        StockQuantity: number;
        ImageURL: string | null; // This is the variant image
        IsActive?: boolean; // Backend assumes active, not explicitly fetched
        CreatedAt?: string | null; // Not fetched
        UpdatedAt?: string | null; // Not fetched
        attributeValues: { // Added attribute values
            AttributeValueID: number;
            AttributeID: number;
            Value: string;
            attribute: {
                AttributeID: number;
                Name: string;
            };
        }[];
        product: { // Nested product details
            ProductID: number;
            ShopID: number;
            CategoryID?: number | null; // Not fetched
            Name: string; // This is the product name
            Description: string | null;
            Discount: number;
            IsActive?: boolean; // Backend assumes active
            AdminApprovalStatus?: 'Pending' | 'Approved' | 'Rejected'; // Backend assumes approved
            ReasonForRejection?: string | null;
            CreatedAt?: string | null; // Not fetched
            UpdatedAt?: string | null; // Not fetched
        };
    };
    shop: { // Nested shop details
        ShopID: number;
        UserID?: number | null; // Not fetched
        ShopName: string; // Added ShopName to nested shop object
        Description?: string | null; // Not fetched
        LogoURL?: string | null; // Not fetched
        CoverImageURL?: string | null; // Not fetched
        AddressStreet?: string | null; // Not fetched
        AddressWard?: string | null; // Not fetched
        AddressDistrict?: string | null; // Not fetched
        AddressCity?: string | null; // Not fetched
        ShopPhone?: string | null; // Not fetched
        Level?: 'Thường' | 'Mall' | null; // Not fetched
        Status?: 'PendingApproval' | 'Approved' | 'Suspended' | 'Rejected'; // Backend assumes approved
        CreatedAt?: string | null; // Not fetched
        UpdatedAt?: string | null; // Not fetched
    };
    // Keep flat ShopName as it's used directly in frontend grouping
    ShopName: string; // This flat ShopName might be redundant now, but keeping as per original file structure
}

export interface Cart {
    CartID: number | null; // Backend returns null if cart is empty
    UserID: number; // Backend uses UserID, not UserID_Buyer
    CreatedAt: string | null; // Backend returns null if cart is empty
    UpdatedAt: string | null; // Backend returns null if cart is empty
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

export interface AttributeValue {
    AttributeValueID: number;
    AttributeID: number;
    Value: string;
    attribute: {
        AttributeID: number;
        Name: string;
    };
}

// Add other types as needed based on your backend models and API responses
