// types/auth.interface.ts

import { User } from "./user.interface";

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
    
    // Các trường tùy chọn mà backend có thể chấp nhận
    IsActive?: boolean;
    Role?: string;
}

export interface ForgotPasswordPayload {
    email: string;
}

export interface ResetPasswordPayload {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
}

export interface UpdatePasswordPayload {
    current_password: string;
    password: string;
    password_confirmation: string;
}

export interface UpdateProfilePayload {
    FullName?: string;
    Username?: string;
    Email?: string;
    Phone?: string;
    Avatar?: string;
}

export interface LoginResponse {
   two_factor?: boolean; // Dấu '?' cho biết đây là thuộc tính tùy chọn
    user?: User;          // << THÊM DÒNG NÀY. Cũng nên là tùy chọn.
    message?: string
}

export interface TwoFactorQrCodeResponse {
    svg: string; // Chuỗi HTML chứa mã QR dạng SVG
}
