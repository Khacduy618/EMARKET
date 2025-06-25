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
    Token?: string | null;
}
