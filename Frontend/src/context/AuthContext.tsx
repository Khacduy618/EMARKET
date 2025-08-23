// app/context/AuthContext.tsx

"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
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
    LoginResponse
} from '@/types';
import { getAuthToken } from '@/services/api';


// --- Hàm Helper để xử lý và trích xuất thông điệp lỗi ---
const getErrorMessage = (error: any, defaultMessage: string): string => {
    const apiError: ApiError = error.response?.data;
    if (apiError && apiError.errors) {
        const firstErrorKey = Object.keys(apiError.errors)[0];
        if (firstErrorKey && apiError.errors[firstErrorKey][0]) {
            return apiError.errors[firstErrorKey][0];
        }
    }
    return apiError?.message || error.message || defaultMessage;
};


// 3. Định nghĩa cấu trúc (Interface) cho Context
interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    error: string | null;
    fetchUser: () => Promise<void>;
    token: string | null;
    login: (credentials: LoginPayload) => Promise<void>;
    register: (payload: RegisterPayload) => Promise<void>;
    logout: () => Promise<void>;
    forgotPassword: (payload: ForgotPasswordPayload) => Promise<void>;
    resetPassword: (payload: ResetPasswordPayload) => Promise<void>;
    updatePassword: (payload: UpdatePasswordPayload) => Promise<void>;
    updateProfile: (payload: UpdateProfilePayload) => Promise<void>;
    resendVerificationEmail: (email: string) => Promise<void>;
    // Các thành phần cho luồng 2FA
    requiresTwoFactor: boolean;
    twoFactorChallenge: (payload: { code?: string; recovery_code?: string }) => Promise<void>;
}
const getRedirectPathByRole = (role: string): string => {
    switch (role.toLowerCase()) {
        case 'admin':
            return '/admin/products';
        case 'seller':
            return '/seller'; // Hoặc /seller/dashboard
        default:
            return '/'; // Mặc định cho Buyer và các vai trò khác
    }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 4. Component Provider chứa tất cả logic
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const [token, setToken] = useState<string | null>(null);

    // const fetchUser = async () => {
    //     try {
    //         const userData = await apiGetMe();
    //         console.log('1. Got user data from API:', userData);
    //          console.log('2. Calling setUser now...');
    //         setUser(userData);
    //     } catch (err) {
    //         console.error("Lỗi khi fetchUser:", err);
    //         setUser(null);
    //     }
    // };
    const fetchUser = async () => {
        try {
            // Không cần kiểm tra token, chỉ cần gọi getMe
            // Trình duyệt sẽ tự lo việc gửi cookie
            const userData = await apiGetMe();
            setUser(userData);
        } catch (err) {
            // Nếu getMe thất bại (lỗi 401), có nghĩa là chưa đăng nhập
            // hoặc session đã hết hạn. Set user về null là đúng.
            setUser(null);
        }
    };

    // Khởi tạo Auth ban đầu
    useEffect(() => {
        const initializeAuth = async () => {
            setIsLoading(true); // Bắt đầu loading
            await getCsrfCookie(); // Rất quan trọng, phải lấy cookie trước
            await fetchUser();
            setIsLoading(false); // Kết thúc loading
        };
        initializeAuth();
    }, []);

    useEffect(() => {
        // Chỉ thực thi logic này sau khi đã xác định xong trạng thái user (isLoading = false)
        if (isLoading) return;

        const isAuthPage = pathname === '/signin' || pathname === '/signup' || pathname.startsWith('/forgot-password');
        const isProtectedPage = pathname.startsWith('/account'); // Trang account và các trang con

        if (user && isAuthPage) {
            const redirectPath = getRedirectPathByRole(user.Role);
            console.log(`Auth Guard: User is logged in, redirecting from auth page to ${redirectPath}`);
            router.push(redirectPath);
        }

        // Kịch bản 2: Chưa đăng nhập nhưng cố vào trang cần bảo vệ -> Đá về trang login
        if (!user && isProtectedPage) {
            console.log("Auth Guard: User is not logged in, redirecting from protected page to /login");
            router.push('/signin');
        }

    }, [user, isLoading, pathname, router]);


    const login = async (credentials: LoginPayload) => {
        setError(null);
        setRequiresTwoFactor(false);
        const toastId = toast.loading("Đang đăng nhập...");
        try {
            await getCsrfCookie();

            // apiLogin bây giờ sẽ trả về một object có dạng { user: User, ... }
            const loginResponse = await apiLogin(credentials);

            // KIỂM TRA VÀ SỬ DỤNG USER TRỰC TIẾP TỪ RESPONSE
            if (loginResponse && loginResponse.user) {

                console.log("Login successful, setting user directly from login response:", loginResponse.user);

                // GỌI setUser VỚI DỮ LIỆU USER VỪA NHẬN ĐƯỢC
                setUser(loginResponse.user);

                toast.update(toastId, { render: "Đăng nhập thành công!", type: "success", isLoading: false, autoClose: 3000 });
                // useEffect sẽ tự động chuyển hướng bạn đi khi state 'user' thay đổi

            } else if (loginResponse && loginResponse.two_factor === true) {
                setRequiresTwoFactor(true);
                toast.dismiss(toastId);
                router.push('/two-factor-challenge');
            } else {
                // Trường hợp response không hợp lệ
                throw new Error('Login response was invalid.');
            }

        } catch (error: any) {
            const message = getErrorMessage(error, 'Thông tin đăng nhập không chính xác.');
            setError(message);
            setUser(null); // Đảm bảo user là null khi login thất bại
            toast.update(toastId, { render: message, type: "error", isLoading: false, autoClose: 5000 });
            throw error;
        }


    };

    const register = async (payload: RegisterPayload) => {
        // Hàm này sẽ ném ra lỗi nếu thất bại, cho phép component cha bắt được.
        setError(null);
        const toastId = toast.loading("Đang tạo tài khoản...");

        try {
            await getCsrfCookie();
            await apiRegister(payload);

            // Dọn dẹp session mà Fortify tự tạo
            try { await apiLogout(); } catch (e) { }

            // Chỉ chạy các hành động thành công khi không có lỗi
            toast.update(toastId, { render: "Đăng ký thành công! Vui lòng kiểm tra email.", type: "success", isLoading: false, autoClose: 5000 });
            router.push('/signup/success');

        } catch (error: any) {
            // XỬ LÝ LỖI Ở ĐÂY
            const message = getErrorMessage(error, 'Đăng ký thất bại.');
            setError(message); // Đặt lỗi này để hiển thị trên form nếu cần
            toast.update(toastId, { render: message, type: "error", isLoading: false, autoClose: 5000 });

            // **NÉM LẠI LỖI** để handleSubmit trong trang Register có thể bắt được nó
            // Đây là chìa khóa để ngăn việc chuyển trang
            throw error;
        }
    };

    const logout = async () => {
        const toastId = toast.loading("Đang đăng xuất...");
        try {
            await apiLogout();
            localStorage.clear();
            sessionStorage.clear();
            function deleteAllCookies() {
    const cookies = document.cookie.split(";");

    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        // Để xóa, ta đặt ngày hết hạn của cookie về quá khứ
        // Cần chỉ định cả path và domain để đảm bảo xóa đúng
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" + document.domain;
        // Thử xóa cho các sub-domain
        const domainParts = document.domain.split('.');
        for (let j = domainParts.length - 1; j >= 0; j--) {
            const domain = domainParts.slice(j).join('.');
             document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" + domain;
        }
    }
}
deleteAllCookies();
        } catch (e) {
            console.error("Logout API call failed, proceeding with client-side cleanup.");
        } finally {
            setUser(null);
            setRequiresTwoFactor(false);
            setError(null);
            toast.update(toastId, { render: "Đã đăng xuất!", type: "success", isLoading: false, autoClose: 2000 });
            router.push('/signin');
        }
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
            apiResetPassword(payload).then(() => router.push('/signin')),
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
            await apiUpdateProfile(payload); // Gọi update trước
            await fetchUser(); // Fetch lại từ getMe để lấy data mới nhất (bao gồm avatar)
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
            await fetchUser();
            setRequiresTwoFactor(false);
            toast.update(toastId, { render: "Xác thực thành công!", type: "success", isLoading: false, autoClose: 3000 });
            // useEffect sẽ lo việc chuyển hướng
        } catch (error: any) {
            const message = getErrorMessage(error, 'Mã không hợp lệ.');
            toast.update(toastId, { render: message, type: "error", isLoading: false, autoClose: 5000 });
            throw error;
        }
    };

    const resendVerificationEmail = async (email: string) => {
        const toastId = toast.loading("Đang gửi lại email...");
        try {
            await apiResend(email);
            toast.update(toastId, { render: "Email xác thực mới đã được gửi!", type: "success", isLoading: false, autoClose: 5000 });
        } catch (error: any) {
            // Bắt lỗi throttle (429) và hiển thị thông báo thân thiện
            if (error.response?.status === 429) {
                toast.update(toastId, { render: "Bạn gửi yêu cầu quá nhanh. Vui lòng thử lại sau 1 phút.", type: "warning", isLoading: false, autoClose: 5000 });
            } else {
                toast.update(toastId, { render: "Gửi lại email thất bại.", type: "error", isLoading: false, autoClose: 5000 });
            }
            throw error;
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user, isLoading, error, fetchUser, token, login, register, logout,
                forgotPassword, resetPassword, updatePassword, updateProfile,
                resendVerificationEmail, requiresTwoFactor, twoFactorChallenge
            }}
        >
            {isLoading || (!user && pathname.startsWith('/account')) ?
                (
                    <div className="flex items-center justify-center min-h-screen">
                        <p>Đang tải...</p>
                    </div>
                ) :
                (
                    children
                )}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
