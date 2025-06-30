// app/context/AuthContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

// 1. Import tất cả các hàm cần thiết từ service
import {
    login as apiLogin,
    logout as apiLogout,
    getMe as apiGetMe,
    register as apiRegister,
    forgotPassword as apiForgotPassword,
    resetPassword as apiResetPassword,
    getCsrfCookie // Import hàm lấy cookie vào đây
} from '@/services/auth';

// 2. Import các interface/type cần thiết
import { LoginPayload, User, ApiError, RegisterPayload, ForgotPasswordPayload, ResetPasswordPayload } from '@/types';

// 3. Import thư viện toast bạn đang dùng (ở đây là react-toastify)
import { toast } from 'react-toastify';

// Định nghĩa cấu trúc của Context, bao gồm các state và hàm sẽ cung cấp
interface AuthContextType {
    user: User | null;          // Thông tin người dùng hoặc null
    isLoading: boolean;         // Trạng thái loading ban đầu để kiểm tra session
    login: (credentials: LoginPayload) => Promise<void>; // Hàm đăng nhập
    register: (payload: RegisterPayload) => Promise<void>;
    logout: () => Promise<void>;        // Hàm đăng xuất
    forgotPassword: (payload: ForgotPasswordPayload) => Promise<void>; // Thêm vào 
    resetPassword: (payload: ResetPasswordPayload) => Promise<void>;
    error: string | null;       // Lưu trữ lỗi để hiển thị trên form (nếu cần)
}

// Tạo Context với giá trị ban đầu là undefined
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Tạo component Provider
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true); // Luôn bắt đầu ở trạng thái loading
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    // useEffect này sẽ chỉ chạy một lần duy nhất khi ứng dụng được mount lần đầu
    useEffect(() => {
        // Hàm này sẽ khởi tạo session và kiểm tra xem người dùng đã đăng nhập từ trước chưa
        const initializeAuth = async () => {
            try {
                // BƯỚC 1: LẤY COOKIE - "Mồi" session một lần duy nhất
                // Việc này đảm bảo trình duyệt có một bộ cookie ổn định trước khi làm bất cứ điều gì khác.
                await getCsrfCookie();

                // BƯỚC 2: KIỂM TRA ĐĂNG NHẬP - Thử lấy thông tin người dùng
                const userData: any = await apiGetMe();
                setUser(userData); // Nếu thành công, set thông tin user
            } catch (err) {
                // Nếu getMe thất bại (lỗi 401), đó là điều bình thường, nghĩa là user chưa đăng nhập.
                setUser(null);
            } finally {
                // Dù thành công hay thất bại, quá trình khởi tạo đã xong.
                setIsLoading(false);
            }
        };

        initializeAuth();
    }, []); // Mảng rỗng đảm bảo useEffect chỉ chạy 1 lần

    // Hàm đăng nhập, được gọi bởi các component con (trang Login)
    const login = async (credentials: LoginPayload) => {
        setError(null); // Xóa lỗi cũ

        // Dùng toast.promise để hiển thị các trạng thái loading, success, error
        await toast.promise(
            // Promise mà chúng ta muốn theo dõi:
            // Gọi apiLogin và nếu nó thành công, tiếp tục gọi getMe để cập nhật state.
            apiLogin(credentials).then(async () => {
                const userData: any = await apiGetMe();
                setUser(userData);
                router.push('/'); // Chuyển hướng về trang chủ sau khi thành công
            }),
            // Cấu hình các thông báo cho toast
            {
                pending: 'Đang đăng nhập...',
                success: 'Đăng nhập thành công! Chào mừng trở lại.',
                error: {
                    // Hàm này được gọi khi promise bị từ chối (reject)
                    render({ data }) {
                        const err = data as any; // Ép kiểu lỗi
                        const apiError: ApiError = err.response?.data;
                        const errorMessage = apiError?.message || "Thông tin đăng nhập không chính xác.";

                        setError(errorMessage); // Cập nhật state lỗi để hiển thị trên form
                        return errorMessage;    // Nội dung hiển thị trên toast
                    },
                },
            }
        );
    };

    // Hàm đăng xuất
    const logout = async () => {
        await toast.promise(
            // Chỉ cần gọi apiLogout, không cần getCsrfCookie
            apiLogout().then(() => {
                setUser(null); // Xóa thông tin user khỏi state
                router.push('/login'); // Chuyển hướng về trang đăng nhập
            }),
            {
                pending: 'Đang đăng xuất...',
                success: 'Đã đăng xuất!',
                error: 'Đăng xuất thất bại, vui lòng thử lại.'
            }
        );
    };

    const register = async (payload: RegisterPayload) => {
        setError(null);

        // toast.promise vẫn được dùng, nhưng hành động sau khi thành công sẽ khác
        await toast.promise(
            // Chỉ gọi apiRegister
            apiRegister(payload).then(async () => {
                // SAU KHI THÀNH CÔNG: KHÔNG đăng nhập, mà chuyển hướng đến trang thông báo
                try {
                    await apiLogout();
                } catch (e) {
                    // Không cần làm gì nếu logout thất bại, 
                    // vì có thể chưa có session để logout.
                } finally {
                    // Chuyển hướng người dùng đến trang thành công.
                    // Khi họ vào trang login lần tới, `useEffect` sẽ lấy cookie mới.
                    router.push('/register/success');
                }
            }),
            {
                pending: 'Đang tạo tài khoản...',
                // Thông báo thành công bây giờ chỉ đơn giản là thông báo
                success: 'Đăng ký thành công! Vui lòng kiểm tra email.',
                error: {
                    // Logic xử lý lỗi vẫn như cũ
                    render({ data }) {
                        const err = data as any;
                        const apiError: ApiError = err.response?.data;
                        let errorMessage = apiError?.message || "Đã xảy ra lỗi, vui lòng thử lại.";
                        if (apiError && apiError.errors) {
                            const firstErrorField = Object.keys(apiError.errors)[0];
                            errorMessage = apiError.errors[firstErrorField][0];
                        }
                        setError(errorMessage);
                        return errorMessage;
                    },
                },
            }
        );
    };

    const resetPassword = async (payload: ResetPasswordPayload) => {
        await toast.promise(
            apiResetPassword(payload).then(() => {
                // Sau khi thành công, chuyển hướng đến trang login
                router.push('/login');
            }),
            {
                pending: 'Đang đặt lại mật khẩu...',
                success: 'Mật khẩu đã được đặt lại thành công! Vui lòng đăng nhập.',
                error: {
                    render({ data }) {
                        // ... logic xử lý lỗi tương tự các hàm khác ...
                        const err = data as any;
                        //...
                        return err.response?.data?.message || 'Token không hợp lệ hoặc đã hết hạn.';
                    }
                }
            }
        );
    };

    const forgotPassword = async (payload: ForgotPasswordPayload) => {
        await toast.promise(
            apiForgotPassword(payload),
            {
                pending: 'Đang gửi yêu cầu...',
                success: 'Nếu email của bạn tồn tại, một link reset sẽ được gửi đến.',
                // ---- SỬA LẠI KHỐI NÀY ĐỂ HIỂN THỊ LỖI CHI TIẾT ----
                error: {
                    render({ data }) { // `data` ở đây chính là object lỗi
                        const err = data as any;
                        console.error("FORGOT PASSWORD ERROR:", err.response?.data); // Log chi tiết lỗi ra console

                        // Lấy message từ response của backend nếu có
                        const errorMessage = err.response?.data?.message || err.message || 'Đã có lỗi xảy ra không xác định.';

                        return `Lỗi: ${errorMessage}`; // Hiển thị lỗi chi tiết trên toast
                    }
                }
            }
        );
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout, error, register, forgotPassword, resetPassword }}>
            {/* 
        Chỉ render các component con khi quá trình khởi tạo auth đã hoàn tất.
        Điều này ngăn chặn việc "nháy" màn hình (ví dụ: hiển thị trang private rồi lại redirect về login)
      */}
            {!isLoading && children}
        </AuthContext.Provider>
    );
};

// Hook tùy chỉnh để dễ dàng truy cập vào context từ bất kỳ component nào
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth phải được sử dụng bên trong một AuthProvider');
    }
    return context;
};
