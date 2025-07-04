// app/(admin)/users/page.tsx
"use client";

import { useState, useEffect } from 'react';
import RoleGuard from '@/app/components/auth/RoleGuard'; // Import RoleGuard
import { getAdminUsers } from '@/services/auth'; // Import service

function AdminUsersContent() {
    const [users, setUsers] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getAdminUsers()
            .then(response => setUsers(response))
            .catch(err => setError(err.response?.data?.message || "Không thể tải danh sách người dùng."));
    }, []);

    if (error) {
        return <div className="p-4 bg-red-100 text-red-700 rounded">Lỗi: {error}</div>
    }

    if (users.length === 0) {
        return <div>Đang tải danh sách người dùng...</div>
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-4">Admin - Quản lý người dùng</h1>
            <div className="bg-white p-6 rounded shadow">
                <table className="w-full">
                    <thead>
                        <tr className="border-b">
                            <th className="text-left p-2">ID</th>
                            <th className="text-left p-2">Name</th>
                            <th className="text-left p-2">Email</th>
                            <th className="text-left p-2">Role</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id} className="border-b hover:bg-gray-50">
                                <td className="p-2">{user.id}</td>
                                <td className="p-2">{user.name}</td>
                                <td className="p-2">{user.email}</td>
                                <td className="p-2">{user.role}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// Bọc nội dung trang bằng RoleGuard, chỉ cho phép Admin
export default function AdminUsersPage() {
    return (
        <RoleGuard allowedRoles={['Admin']}>
            <AdminUsersContent />
        </RoleGuard>
    );
}
