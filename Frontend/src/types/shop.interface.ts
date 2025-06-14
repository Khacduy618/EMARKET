// src/types/shop.interface.ts
export interface Shop {
    ShopID: number;
    UserID_Owner?: number;
    ShopName: string;
    Description?: string | null;
    LogoURL?: string | null;
    CoverImageURL?: string | null;
    ShopAddress?: string | null; // Hoặc chia nhỏ hơn (Street, Ward...)
    ShopPhone?: string | null;
    AverageRating?: number | null;
    Status?: 'PendingApproval' | 'Approved' | 'Suspended' | 'Rejected' | null;
    CreatedAt?: string | null;
    UpdatedAt?: string | null;
}

// Thêm ShopSummary để sử dụng trong các đối tượng lồng nhau nếu cần thiết
export interface ShopSummary {
    ShopID: number;
    ShopName: string;
}