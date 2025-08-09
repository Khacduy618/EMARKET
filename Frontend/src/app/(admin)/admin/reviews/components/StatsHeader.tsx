"use client";

import { MessageSquare, Clock, CheckCircle, XCircle, AlertTriangle, type LucideIcon } from "lucide-react";

// Định nghĩa kiểu dữ liệu cho props, giúp code an toàn hơn.
// Interface này phải khớp với dữ liệu trả về từ API /api/admin/reviews/stats
export interface StatsData {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    needsAttention: number; // Thêm trường này nếu API của bạn trả về nó
}

// Định nghĩa cấu trúc cho mỗi thẻ thống kê để dễ quản lý
interface StatCardInfo {
    title: string;
    key: keyof StatsData; // Giúp TypeScript kiểm tra key có tồn tại trong StatsData không
    icon: LucideIcon;
    color: string;
    subtitle?: string;
}

export function StatsHeader({ stats }: { stats: StatsData | null }) {
    // =========================================================================
    // PHẦN SỬA LỖI: KIỂM TRA DỮ LIỆU TRƯỚC KHI RENDER
    // =========================================================================
    // Nếu prop 'stats' là null (nghĩa là dữ liệu đang được tải hoặc có lỗi từ component cha),
    // chúng ta sẽ render một bộ khung xương (skeleton) với hiệu ứng loading.
    // Điều này ngăn chặn lỗi "Cannot read properties of undefined".
    if (!stats) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
                {/* Tạo 5 thẻ placeholder tương ứng với giao diện thật */}
                {Array(5).fill(0).map((_, i) => (
                    <div key={i} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/5 mb-4"></div>
                        <div className="h-8 bg-gray-300 rounded w-2/5"></div>
                    </div>
                ))}
            </div>
        );
    }
    // =========================================================================
    // KẾT THÚC PHẦN SỬA LỖI
    // =========================================================================
    
    // Khi 'stats' đã có dữ liệu, code dưới đây sẽ được thực thi một cách an toàn.
    
    // Mảng cấu hình cho các thẻ thống kê. Dễ dàng thêm/bớt/sửa các thẻ.
    const statCards: StatCardInfo[] = [
        { title: "Tổng reviews", key: "total", icon: MessageSquare, color: "text-blue-600" },
        { title: "Chờ duyệt", key: "pending", icon: Clock, color: "text-yellow-600" },
        { title: "Đã duyệt", key: "approved", icon: CheckCircle, color: "text-green-600" },
        { title: "Từ chối", key: "rejected", icon: XCircle, color: "text-red-600" },
        { title: "Cần xem xét", key: "needsAttention", icon: AlertTriangle, color: "text-orange-600", subtitle: "Reviews < 3 sao" },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
            {statCards.map((card) => (
                <div key={card.key} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
                    <div className="flex justify-between items-start">
                        <p className="text-sm font-medium text-gray-500">{card.title}</p>
                        <card.icon className={`w-6 h-6 ${card.color} opacity-70`} />
                    </div>
                    <p className={`mt-2 text-3xl font-bold ${card.color}`}>
                        {/* 
                          Code này bây giờ hoàn toàn an toàn vì 'stats' chắc chắn không phải là null.
                          stats[card.key] sẽ truy cập vào stats['total'], stats['pending']...
                        */}
                        {(stats[card.key] || 0).toLocaleString('vi-VN')}
                    </p>
                    {card.subtitle && <p className="text-xs text-gray-400 mt-1">{card.subtitle}</p>}
                </div>
            ))}
        </div>
    );
}