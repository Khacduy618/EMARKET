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
