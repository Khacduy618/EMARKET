// app/context/AuthContext.tsx

"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

// 1. Import tất cả các hàm service của bạn
import {
    login as apiLogin,
    logout as apiLogout,
    getMe as apiGetMe,
    register as apiRegister,
    forgotPassword as apiForgotPassword,
    resetPassword as apiResetPassword,
    updatePassword as apiUpdatePassword,
    updateProfile as apiUpdateProfile,
    twoFactorChallenge as apiTwoFactorChallenge,
    getCsrfCookie
} from '@/services/auth'; // Đảm bảo đường dẫn này đúng với file service của bạn

// 2. Import tất cả các type/interface cần thiết
import {
    LoginPayload,
    User,
    ApiError,
    RegisterPayload,
    ForgotPasswordPayload,
    ResetPasswordPayload,
    UpdatePasswordPayload,
    UpdateProfilePayload
} from '@/types';


// --- Hàm Helper để xử lý và trích xuất thông điệp lỗi ---
const getErrorMessage = (error: any, defaultMessage: string): string => {
    const apiError: ApiError = error.response?.data;
    if (apiError && apiError.errors) {
        // Ưu tiên lấy lỗi validation đầu tiên nếu có
        const firstErrorKey = Object.keys(apiError.errors)[0];
        if (firstErrorKey && apiError.errors[firstErrorKey][0]) {
            return apiError.errors[firstErrorKey][0];
        }
    }
    // Nếu không, lấy message chính hoặc message mặc định
    return apiError?.message || error.message || defaultMessage;
};


// 3. Định nghĩa cấu trúc (Interface) cho Context
interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    error: string | null;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    fetchUser: () => Promise<void>;
    login: (credentials: LoginPayload) => Promise<void>;
    register: (payload: RegisterPayload) => Promise<void>;
    logout: () => Promise<void>;
    forgotPassword: (payload: ForgotPasswordPayload) => Promise<void>;
    resetPassword: (payload: ResetPasswordPayload) => Promise<void>;
    updatePassword: (payload: UpdatePasswordPayload) => Promise<void>;
    updateProfile: (payload: UpdateProfilePayload) => Promise<void>;
    twoFactorChallenge: (payload: { code?: string; recovery_code?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 4. Component Provider chứa tất cả logic
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const fetchUser = async () => {
        try {
            const userData = await apiGetMe();
            setUser(userData);
        } catch (err) {
            setUser(null);
        }
    };

    useEffect(() => {
        const initializeAuth = async () => {
            await getCsrfCookie();
            await fetchUser();
            setIsLoading(false);
        };
        initializeAuth();
    }, []);

    const login = async (credentials: LoginPayload) => {
        setError(null);
        const toastId = toast.loading("Đang đăng nhập...");

        try {
            // Gọi apiLogin và nhận về response
            const response = await apiLogin(credentials);

            // KIỂM TRA ĐIỀU KIỆN 2FA
            if (response && response.two_factor === true) {
                // Đây là trường hợp cần 2FA
                toast.dismiss(toastId); // Bỏ toast loading
                router.push('/two-factor-challenge'); // Chuyển hướng đến trang nhập mã
                // Dừng hàm ở đây, không làm gì thêm
                return;
            }

            // Nếu không có `two_factor: true`, đây là luồng đăng nhập bình thường
            await fetchUser();
            toast.update(toastId, { render: "Đăng nhập thành công!", type: "success", isLoading: false, autoClose: 3000 });
            router.push('/');

        } catch (error: any) {
            // Khối catch này bây giờ chỉ xử lý các lỗi thực sự (sai pass, tài khoản bị khóa...)
            const message = getErrorMessage(error, 'Thông tin đăng nhập không chính xác.');
            setError(message);
            toast.update(toastId, { render: message, type: "error", isLoading: false, autoClose: 5000 });
            throw error;
        }
    };

    const twoFactorChallenge = async (payload: { code?: string; recovery_code?: string }) => {
        const toastId = toast.loading("Đang xác thực...");
        try {
            await apiTwoFactorChallenge(payload);
            await fetchUser();
            toast.update(toastId, { render: "Xác thực thành công!", type: "success", isLoading: false, autoClose: 3000 });
            router.push('/');
        } catch (error: any) {
            const message = getErrorMessage(error, 'Mã không hợp lệ.');
            toast.update(toastId, { render: message, type: "error", isLoading: false, autoClose: 5000 });
            throw error;
        }
    };

    const register = async (payload: RegisterPayload) => {
        setError(null);
        await toast.promise(
            apiRegister(payload).then(apiLogout).finally(() => router.push('/register/success')),
            {
                pending: 'Đang tạo tài khoản...',
                success: 'Đăng ký thành công! Vui lòng kiểm tra email.',
                error: {
                    render: ({ data }: any) => {
                        const message = getErrorMessage(data, 'Đăng ký thất bại.');
                        setError(message);
                        return message;
                    }
                }
            }
        );
    };

    const logout = async () => {
        await toast.promise(
            apiLogout().then(() => {
                setUser(null);
                router.push('/login');
            }),
            { pending: 'Đang đăng xuất...', success: 'Đã đăng xuất!', error: 'Đăng xuất thất bại.' }
        );
    };

    const forgotPassword = async (payload: ForgotPasswordPayload) => {
        await toast.promise(apiForgotPassword(payload), {
            pending: 'Đang gửi yêu cầu...',
            success: 'Nếu email tồn tại, một link reset sẽ được gửi đi.',
            error: { render: ({ data }: any) => getErrorMessage(data, 'Yêu cầu thất bại.') }
        });
    };

    const resetPassword = async (payload: ResetPasswordPayload) => {
        await toast.promise(
            apiResetPassword(payload).then(() => router.push('/login')),
            {
                pending: 'Đang đặt lại mật khẩu...',
                success: 'Mật khẩu đã được đặt lại! Vui lòng đăng nhập.',
                error: { render: ({ data }: any) => getErrorMessage(data, 'Token không hợp lệ hoặc đã hết hạn.') }
            }
        );
    };

    const updatePassword = async (payload: UpdatePasswordPayload) => {
        await toast.promise(apiUpdatePassword(payload), {
            pending: 'Đang cập nhật mật khẩu...',
            success: 'Đã thay đổi mật khẩu thành công!',
            error: { render: ({ data }: any) => getErrorMessage(data, 'Cập nhật thất bại.') }
        });
    };

    const updateProfile = async (payload: UpdateProfilePayload) => {
        const toastId = toast.loading("Đang cập nhật thông tin...");
        try {
            const updatedUser = await apiUpdateProfile(payload);
            setUser(updatedUser);
            toast.update(toastId, { render: "Cập nhật thành công!", type: "success", isLoading: false, autoClose: 3000 });
        } catch (error: any) {
            const errorMessage = getErrorMessage(error, 'Cập nhật thất bại.');
            toast.update(toastId, { render: errorMessage, type: "error", isLoading: false, autoClose: 5000 });
            throw error;
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user, isLoading, error, setUser, fetchUser, login, register, logout,
                forgotPassword, resetPassword, updatePassword, updateProfile, twoFactorChallenge
            }}
        >
            {!isLoading && children}
        </AuthContext.Provider>
    );
};

// 5. Hook tùy chỉnh để sử dụng context
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
