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