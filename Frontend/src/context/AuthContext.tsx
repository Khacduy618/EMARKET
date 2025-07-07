// app/context/AuthContext.tsx

"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

// 1. Import tất cả các hàm service
import {
    login as apiLogin,
    logout as apiLogout,
    getMe as apiGetMe,
    register as apiRegister,
    forgotPassword as apiForgotPassword,
    resetPassword as apiResetPassword,
    updatePassword as apiUpdatePassword,
    updateProfile as apiUpdateProfile,
    getCsrfCookie,
    twoFactorChallenge as apiTwoFactorChallenge
} from '@/services/auth';

// 2. Import tất cả các type/interface cần thiết
import {
    LoginPayload,
    User,
    ApiError,
    RegisterPayload,
    ForgotPasswordPayload,
    ResetPasswordPayload,
    UpdatePasswordPayload,
    UpdateProfilePayload,
    LoginResponse
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
    cleanupSession: () => Promise<void>;
    login: (credentials: LoginPayload) => Promise<void>;
    register: (payload: RegisterPayload) => Promise<void>;
    logout: () => Promise<void>;
    forgotPassword: (payload: ForgotPasswordPayload) => Promise<void>;
    resetPassword: (payload: ResetPasswordPayload) => Promise<void>;
    updatePassword: (payload: UpdatePasswordPayload) => Promise<void>;
    updateProfile: (payload: UpdateProfilePayload) => Promise<void>;
    requiresTwoFactor: boolean;
    twoFactorChallenge: (payload: { code?: string; recovery_code?: string }) => Promise<void>;
    cancelTwoFactor: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 4. Component Provider chứa tất cả logic
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [requiresTwoFactor, setRequiresTwoFactor] = useState(false); // State quản lý luồng 2FA
    const router = useRouter();

    // Hàm lấy/làm mới thông tin người dùng từ backend
    const fetchUser = async () => {
        try {
            const userData = await apiGetMe();
            setUser(userData);
        } catch (err) {
            setUser(null);
        }
    };

    // Khởi tạo Auth khi app được tải lần đầu
    useEffect(() => {
        const initializeAuth = async () => {
            setIsLoading(true);
            await getCsrfCookie();
            await fetchUser();
            setIsLoading(false);
        };
        initializeAuth();
    }, []);


    const cleanupSession = async () => {
        try {
            // Cố gắng logout để hủy session ở backend
            await apiLogout();
        } catch (error) {
            // Không cần báo lỗi, vì có thể đã không có session để logout
        } finally {
            // Reset tất cả state ở frontend và lấy một cookie mới tinh
            setUser(null);
            setRequiresTwoFactor(false);
            setError(null);
            await getCsrfCookie();
        }
    };

    const login = async (credentials: LoginPayload) => {
        setError(null);
        const toastId = toast.loading("Đang đăng nhập...");

        try {
            // Trang Login đã gọi cleanupSession, nên ở đây môi trường đã sạch sẽ
            const response: LoginResponse = await apiLogin(credentials);

            if (response && response.two_factor === true) {
                // Nếu backend yêu cầu 2FA, cập nhật state để UI thay đổi
                setRequiresTwoFactor(true);
                toast.dismiss(toastId);
            } else {
                // Nếu đăng nhập thành công không cần 2FA
                await fetchUser();
                toast.update(toastId, { render: "Đăng nhập thành công!", type: "success", isLoading: false, autoClose: 3000 });
                router.push('/');
            }
        } catch (error: any) {
            const message = getErrorMessage(error, 'Thông tin đăng nhập không chính xác.');
            setError(message);
            toast.update(toastId, { render: message, type: "error", isLoading: false, autoClose: 5000 });
            throw error; // Ném lại lỗi để form biết là đã thất bại
        }
    };

    const register = async (payload: RegisterPayload) => {
        setError(null);
        await toast.promise(
            apiRegister(payload).then(() => {
                // Sau khi đăng ký thành công, chúng ta không logout nữa mà chỉ chuyển hướng.
                // Điều này tránh các vấn đề về session không cần thiết.
            }).finally(() => router.push('/register/success')),
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
        const toastId = toast.loading("Đang đăng xuất...");
        await cleanupSession(); // Dùng lại hàm cleanup để xử lý logout
        toast.update(toastId, { render: "Đã đăng xuất!", type: "success", isLoading: false, autoClose: 2000 });
        router.push('/login');
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

    const twoFactorChallenge = async (payload: { code?: string; recovery_code?: string }) => {
        const toastId = toast.loading("Đang xác thực...");
        try {
            await apiTwoFactorChallenge(payload);
            await fetchUser(); // Lấy thông tin user sau khi xác thực thành công
            setRequiresTwoFactor(false); // Reset lại state 2FA
            toast.update(toastId, { render: "Xác thực thành công!", type: "success", isLoading: false, autoClose: 3000 });
            router.push('/');
        } catch (error: any) {
            const message = getErrorMessage(error, 'Mã không hợp lệ.');
            toast.update(toastId, { render: message, type: "error", isLoading: false, autoClose: 5000 });
            throw error;
        }
    };

    const cancelTwoFactor = () => {
        setRequiresTwoFactor(false);
        setError(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user, isLoading, error, setUser, fetchUser, login, register, logout,
                forgotPassword, resetPassword, updatePassword, updateProfile,
                requiresTwoFactor, twoFactorChallenge, cancelTwoFactor, cleanupSession
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
