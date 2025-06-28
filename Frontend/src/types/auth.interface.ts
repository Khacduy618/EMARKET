// types/auth.interface.ts

// Dùng cho Login Payload
export interface LoginPayload {
    email: string;
    password?: string;
}

// Dùng cho lỗi trả về từ API, đặc biệt là lỗi validation 422
export interface ApiError {
    message: string;
    errors?: {
        [key: string]: string[];
    };
}

export interface RegisterPayload {
    Email: string;
    FullName: string;
    Password: string;
    Password_confirmation: string;
    Phone: string;
    Username: string;
    // Các trường tùy chọn mà backend có thể chấp nhận
    IsActive?: boolean;
    Role?: string;
}
