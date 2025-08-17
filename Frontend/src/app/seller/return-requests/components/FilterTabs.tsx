'use client';
import React from 'react';

// Định nghĩa props mà component này nhận
interface FilterTabsProps {
    currentFilter: string;
    onFilterChange: (newStatus: string) => void;
}

const FilterTabs: React.FC<FilterTabsProps> = ({ currentFilter, onFilterChange }) => {
    // Mở rộng danh sách các bộ lọc để bao quát toàn bộ quy trình
    const filters = [
        // --- Bộ lọc chung ---
        { key: '', label: 'Tất cả' },

        // --- Các tab cần người bán hành động ---
        { key: 'PendingSellerApproval', label: 'Chờ xử lý' },
        { key: 'Approved_WaitForBankTransfer', label: 'Chờ chuyển khoản' }, // Dành cho đơn COD
        { key: 'RefundProcessingFailed', label: 'Hoàn tiền thất bại' }, // Cần kiểm tra

        // --- Các tab để theo dõi ---
        { key: 'SellerApproved_WaitForReturn', label: 'Chờ nhận hàng' },

        // --- Các tab đã hoàn tất ---
        { key: 'Refunded,Closed', label: 'Hoàn thành' }, // Lọc theo 2 trạng thái cùng lúc
        { key: 'SellerRejected', label: 'Đã từ chối' },
        { key: 'BuyerCancelled', label: 'Người mua đã hủy' },
    ];

    return (
        <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                {filters.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => onFilterChange(tab.key)}
                        className={`${currentFilter === tab.key
                            ? 'border-indigo-500 text-indigo-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } whitespace-nowrap py-4 px-3 border-b-2 font-medium text-sm focus:outline-none transition-colors duration-200`}
                    >
                        {tab.label}
                    </button>
                ))}
            </nav>
        </div>
    );
};

export default FilterTabs;