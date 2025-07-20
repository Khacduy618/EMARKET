export interface PaginatedResponse<T> {
    current_page: number;
    data: T[]; // Mảng chứa dữ liệu của trang hiện tại, ví dụ: User[]
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}

export interface UserPayload {
    FullName: string;
    Username: string;
    Email: string;
    Phone?: string | null;
    Role: 'Admin' | 'Seller' | 'Buyer';
    IsActive: boolean;
    Password?: string; // Tùy chọn, chỉ cần khi tạo mới hoặc đổi mật khẩu
    Password_confirmation?: string;
}
