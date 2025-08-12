
export interface Province {
  name: string;
  code: number;
  districts: District[];
}
export interface District {
  name: string;
  code: number;
   wards: Ward[];
}
export interface Ward {
  name: string;
  code: number;
}


export interface Address {
    AddressID: number;
    UserID: number;
    FullName: string;
    PhoneNumber: string;
    Street: string | null;
    Ward: string | null; // Ward có thể là null nếu không có
    District: string | null;
    City: string | null;
    IsDefault: boolean | number;
    CreatedAt: string;
    UpdatedAt: string;
    DeletedAt?: string | null;
}

export interface AddressPayload {
    FullName: string;
    PhoneNumber: string;
    Street: string;
    Ward?: string | null;
    District: string;
    City: string;
    IsDefault?: boolean | number;
}
