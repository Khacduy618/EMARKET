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
    email_verified_at?: string;
    two_factor_enabled?: boolean;
}
