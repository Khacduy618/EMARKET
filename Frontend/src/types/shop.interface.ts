// src/types/shop.interface.ts
export interface Shop {
    ShopID: number;
    UserID?: number;
    ShopName: string;
    Description?: string | null;
    LogoURL?: string | null;
    CoverImageURL?: string | null;
    AddressStreet?: string | null;
    AddressWard?: string | null;
    AddressDistrict?: string | null;
    AddressCity?: string | null;
    ShopPhone?: string | null;
    AverageRating?: number | null;
    Level?: 'Normal' | 'Mall' | 'Favorite';
    Status?: 'PendingApproval' | 'Approved' | 'Suspended' | 'Rejected' | null;
    CreatedAt?: string | null;
    UpdatedAt?: string | null;
}
export type ShopLevel = 'Normal' | 'Mall' | 'Favorite' ;

// Thêm ShopSummary để sử dụng trong các đối tượng lồng nhau nếu cần thiết
export interface ShopSummary {
    ShopID: number;
    ShopName: string;
    ShopPhone: string | null;
    Level: ShopLevel;
}

export interface ShopFilter {
    ShopID: number;
    ShopName: string;
}