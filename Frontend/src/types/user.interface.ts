export interface User {
    UserID: number;
    Username: string;
    Email: string;
    FullName?: string;
    Avatar?:string;
    DefaultShippingAddressID?: number;
    Phone?: string;
    Level: 'Đồng' | 'Bạc' | 'Vàng' | 'Bạch kim' | 'Kim cương';
    Role: 'Buyer' | 'Seller' | 'Admin';
    IsActive: boolean;
    CreatedAt: string;
    UpdatedAt: string;
    email_verified_at?: string;
    two_factor_enabled?: boolean;
    Token?: string | null;
    shopId?: number;
    two_factor_confirmed_at?: string | null
  two_factor_recovery_codes?: string | null
  two_factor_secret?: string | null
}
