// app/context/AuthContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast, Id as ToastId } from 'react-toastify'; // Import thêm Type "Id"
import { useRouter } from 'next/navigation';
import { login as apiLogin, logout as apiLogout, getMe as apiGetMe } from '@/services/auth';
import { LoginPayload, User, ApiError } from '@/types';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (credentials: LoginPayload) => Promise<void>;
    logout: () => void;
    error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        // Chỉ chạy một lần khi component mount
        const fetchCurrentUser = async () => {
            try {
                const userData = await apiGetMe();
                setUser(userData);
            } catch (err) {
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCurrentUser();
    }, []);

    const login = async (credentials: LoginPayload) => {
        setError(null);
        let toastId: ToastId | null = null; // Biến để giữ ID của toast

        try {
            // 1. Hiển thị toast "pending" và lấy ID của nó
            toastId = toast.loading('Đang đăng nhập...');

            // 2. Gọi API
            await apiLogin(credentials);

            // 3. Lấy thông tin user sau khi login thành công
            const userData = await apiGetMe();
            setUser(userData);

            // 4. Cập nhật toast thành công
            toast.update(toastId, {
                render: 'Đăng nhập thành công! Chào mừng trở lại.',
                type: 'success',
                isLoading: false,
                autoClose: 3000,
            });

            router.push('/');

        } catch (err: any) {
            // 5. Nếu có lỗi xảy ra
            const apiError: ApiError = err.response?.data;
            let errorMessage = "Tên đăng nhập hoặc mật khẩu không đúng.";
            if (apiError && apiError.errors) {
                const firstErrorField = Object.keys(apiError.errors)[0];
                errorMessage = apiError.errors[firstErrorField][0];
            } else if (apiError && apiError.message) {
                errorMessage = apiError.message;
            }

            // Cập nhật toast thành lỗi (nếu toastId đã được tạo)
            if (toastId) {
                toast.update(toastId, {
                    render: errorMessage,
                    type: 'error',
                    isLoading: false,
                    autoClose: 5000,
                });
            }

            // CẬP NHẬT STATE Ở ĐÂY - an toàn vì nó nằm trong block catch của một event handler
            setError(errorMessage);
        }
    };

    const logout = () => {
        // Dùng cách cũ với toast.promise cho logout vẫn ổn vì nó đơn giản
        toast.promise(
            apiLogout().then(() => {
                setUser(null);
                router.push('/login');
            }),
            {
                pending: 'Đang đăng xuất...',
                success: 'Đã đăng xuất!',
                error: 'Đăng xuất thất bại, vui lòng thử lại.'
            }
        );
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout, error }}>
            {!isLoading && children}
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
