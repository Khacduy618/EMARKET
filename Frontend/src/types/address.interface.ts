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
    DeletedAt?: string | null;
}
