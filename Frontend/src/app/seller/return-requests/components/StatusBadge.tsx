'use client';
import React from 'react';

// Định nghĩa props để component có thể nhận vào 'status'
interface StatusBadgeProps {
    status: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
    // Sử dụng một đối tượng duy nhất để quản lý cả text và style cho dễ bảo trì
    const statusMap: { [key: string]: { text: string; style: string } } = {
        // Các trạng thái trong quy trình
        PendingSellerApproval: { text: "Chờ xác nhận", style: "bg-yellow-100 text-yellow-800" },
        SellerApproved_WaitForReturn: { text: "Chờ gửi hàng", style: "bg-blue-100 text-blue-800" },
        Approved_ProcessingVnpayRefund: { text: "Đang xử lý hoàn tiền", style: "bg-indigo-100 text-indigo-800" },
        Approved_WaitForBankTransfer: { text: "Chờ chuyển khoản", style: "bg-purple-100 text-purple-800" },

        // Trạng thái THẤT BẠI - khớp với hình ảnh của bạn
        RefundProcessingFailed: { text: "Hoàn tiền thất bại", style: "bg-pink-200 text-pink-800" },
        SellerRejected: { text: "Đã từ chối", style: "bg-red-200 text-red-800" },

        // Các trạng thái KẾT THÚC
        Refunded: { text: "Đã hoàn tiền", style: "bg-green-100 text-green-800" },
        Closed: { text: "Đã đóng", style: "bg-gray-400 text-gray-700" },
        BuyerCancelled: { text: "Người mua đã hủy", style: "bg-gray-200 text-gray-600" },
    };

    // Định nghĩa một trạng thái mặc định để tránh lỗi nếu 'status' không tồn tại trong map
    const defaultStatus = { text: status, style: "bg-gray-100 text-gray-800" };

    // Lấy thông tin text và style từ map, nếu không tìm thấy thì dùng default
    const { text, style } = statusMap[status] || defaultStatus;

    return (
        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full inline-block ${style}`}>
            {text}
        </span>
    );
};

export default StatusBadge;