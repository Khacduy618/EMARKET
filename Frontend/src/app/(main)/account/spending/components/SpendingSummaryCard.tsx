
// (account)/spending/components/SpendingSummaryCard.tsx
import React from 'react';

interface SpendingSummaryCardProps {
  title: string;
  value: string;
  icon?: React.ReactNode;
  description?: string;
  onClick?: () => void; // Prop mới
  isClickable?: boolean; // Prop mới để kiểm soát CSS hover
}

const SpendingSummaryCard: React.FC<SpendingSummaryCardProps> = ({ title, value, icon, description, onClick, isClickable }) => {
  const cardClasses = `bg-white p-4 md:p-6 rounded-lg shadow ${
    isClickable ? 'hover:shadow-md transition-shadow duration-300 cursor-pointer' : ''
  }`;

  return (
    <div className={cardClasses} onClick={onClick}> {/* Thêm onClick handler */}
      <div className="flex items-center space-x-4">
        {icon && <div className="text-3xl text-gray-400">{icon}</div>}
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-2xl font-semibold text-gray-800">{value}</p>
        </div>
      </div>
      {description && <p className="text-xs text-gray-400 mt-2">{description}</p>}
    </div>
  );
};

export default SpendingSummaryCard;