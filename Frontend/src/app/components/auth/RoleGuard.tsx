// app/components/Auth/RoleGuard.tsx
"use client";

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'react-toastify';

interface RoleGuardProps {
    children: React.ReactNode;
    allowedRoles: string[];
}

export default function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // Chỉ kiểm tra khi đã load xong thông tin user
        if (!isLoading) {
            // Nếu không có user, hoặc user có vai trò không được phép
            if (!user || !allowedRoles.includes(user.Role)) {
                // Có thể chuyển hướng đến trang 403 Forbidden hoặc trang chủ
                // Ở đây chúng ta sẽ chuyển về trang chủ
                toast.error("Bạn không có quyền truy cập trang này.");
                router.push('/signin');
            }
        }
    }, [user, isLoading, allowedRoles, router]);

    // Nếu đang loading hoặc vai trò chưa hợp lệ, không render gì cả
    if (isLoading || !user || !allowedRoles.includes(user.Role)) {
        return <div className="p-8 text-center">Đang kiểm tra quyền truy cập...</div>;
    }

    // Nếu vai trò hợp lệ, render component con
    return <>{children}</>;
}
