// app/(main)/seller/dashboard/page.tsx
"use client";

import { useState, useEffect } from 'react';
import RoleGuard from '@/app/components/auth/RoleGuard'; // Import RoleGuard
import { getSellerDashboard } from '@/services/auth'; // Import service

function SellerDashboardContent() {
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await getSellerDashboard();
                setData(response);
            } catch (err: any) {
                setError(err.response?.data?.message || "Không thể tải dữ liệu dashboard.");
            }
        };
        fetchData();
    }, []);

    if (error) {
        return <div className="p-4 bg-red-100 text-red-700 rounded">Lỗi: {error}</div>
    }

    if (!data) {
        return <div>Đang tải dữ liệu dashboard của người bán...</div>
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-4">Seller Dashboard</h1>
            <div className="bg-white p-6 rounded shadow">
                <p><span className="font-bold">Name:</span> {data.name}</p>
                <p><span className="font-bold">Role:</span> {data.role}</p>
                <p><span className="font-bold">Status:</span> {data.status}</p>
            </div>
        </div>
    );
}

// Bọc nội dung trang bằng RoleGuard
export default function SellerDashboardPage() {
    return (
        <RoleGuard allowedRoles={['Seller', 'Admin']}> {/* Cho phép cả Seller và Admin vào */}
            <SellerDashboardContent />
        </RoleGuard>
    );
}
