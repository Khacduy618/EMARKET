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
    resendVerificationEmail as apiResend,
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
    LoginResponse,
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
    resendVerificationEmail: (email: string) => Promise<void>;
    resetTwoFactorState: () => void;
    cancelAndGoToLogin: () => Promise<void>;
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

    const resetTwoFactorState = () => {
        setRequiresTwoFactor(false);
        setError(null);
    };

    const login = async (credentials: LoginPayload) => {
        setError(null);
        setRequiresTwoFactor(false); // Luôn reset trạng thái 2FA ở frontend trước
        const toastId = toast.loading("Đang đăng nhập...");

        try {
            // 1. DỌN DẸP VÀ LẤY COOKIE MỚI
            // Bất kể session cũ là gì, thao tác này sẽ yêu cầu một session sạch từ backend.
            // Đây là chìa khóa để giải quyết lỗi "dính" 2FA khi bấm nút back.
            await getCsrfCookie();

            // 2. GỬI YÊU CẦU LOGIN
            const response: LoginResponse = await apiLogin(credentials);

            // 3. XỬ LÝ RESPONSE
            if (response && response.two_factor === true) {
                // Backend yêu cầu 2FA -> Cập nhật state và chuyển hướng
                setRequiresTwoFactor(true);
                toast.dismiss(toastId);
                router.push('/two-factor-challenge');
            } else {
                // Đăng nhập thành công, không 2FA
                await fetchUser();
                toast.update(toastId, { render: "Đăng nhập thành công!", type: "success", isLoading: false, autoClose: 3000 });
                router.push('/');
            }
        } catch (error: any) {
            const message = getErrorMessage(error, 'Thông tin đăng nhập không chính xác.');
            setError(message);
            toast.update(toastId, { render: message, type: "error", isLoading: false, autoClose: 5000 });
            throw error;
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

    const resendVerificationEmail = async (email: string) => {
        // Chúng ta không dùng toast.promise vì muốn có thông báo tùy chỉnh hơn
        const toastId = toast.loading("Đang gửi lại email...");
        try {
            await apiResend(email);
            toast.update(toastId, { render: "Email xác thực mới đã được gửi thành công!", type: "success", isLoading: false, autoClose: 5000 });
        } catch (error) {
            toast.update(toastId, { render: "Gửi lại email thất bại. Vui lòng thử lại sau.", type: "error", isLoading: false, autoClose: 5000 });
        }
    };

    const cancelAndGoToLogin = async () => {
        // Chúng ta có thể dùng lại logic của hàm logout, 
        // vì nó đã làm đúng việc là hủy session và chuyển hướng.
        await logout();
    };

    return (
        <AuthContext.Provider
            value={{
                user, isLoading, error, setUser, fetchUser, login, register, logout,
                forgotPassword, resetPassword, updatePassword, updateProfile,
                requiresTwoFactor, twoFactorChallenge, cancelTwoFactor, cleanupSession, resendVerificationEmail,
                resetTwoFactorState, cancelAndGoToLogin
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
