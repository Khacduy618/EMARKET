
// (account)/spending/components/SpendingOverview.tsx
import React from 'react';
import SpendingSummaryCard from './SpendingSummaryCard';
import { FaMoneyBillWave, FaShoppingCart } from 'react-icons/fa';
// import { FaMoneyBillWave, FaShoppingCart } from 'react-icons/fa'; // Ví dụ icon

interface SpendingOverviewProps {
  totalSpent: number;
  orderCount: number;
  onOrderCountClick?: () => void; // Prop mới để xử lý click
}

const SpendingOverview: React.FC<SpendingOverviewProps> = ({ totalSpent, orderCount, onOrderCountClick }) => {
    console.log('SpendingOverview received totalSpent:', totalSpent, 'Type:', typeof totalSpent);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-6">
      <SpendingSummaryCard
        title="Tổng Chi tiêu"
        value={totalSpent.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
        icon={<FaMoneyBillWave className="text-green-500" />}
        description="Tổng số tiền bạn đã chi tiêu"
        isClickable={false} // Card này không click được
      />
      <SpendingSummaryCard
        title="Số lượng Đơn hàng"
        value={orderCount.toString()}
        icon={<FaShoppingCart className="text-blue-500" />}
        description="Tổng số đơn hàng đã đặt trong kỳ"
        onClick={onOrderCountClick} // Truyền handler
        isClickable={!!onOrderCountClick} // Cho phép click nếu có handler
      />
    </div>
  );
};

export default SpendingOverview;