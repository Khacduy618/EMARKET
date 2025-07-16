// (account)/spending/components/TimePeriodFilter.tsx
'use client';
import React, { useState } from 'react';

interface TimePeriodFilterProps {
  onPeriodChange: (startDate: string | null, endDate: string | null, predefinedPeriod?: string) => void;
  initialPeriod?: string; // Ví dụ: 'this_month'
}

const TimePeriodFilter: React.FC<TimePeriodFilterProps> = ({ onPeriodChange, initialPeriod = 'this_month' }) => {
  const [periodType, setPeriodType] = useState<string>(initialPeriod); // 'this_month', 'last_month', 'this_year', 'custom'
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');

  const handlePredefinedPeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPeriod = e.target.value;
    setPeriodType(newPeriod);
    if (newPeriod !== 'custom') {
      setCustomStartDate('');
      setCustomEndDate('');
      // Gọi onPeriodChange với startDate và endDate tương ứng cho newPeriod
      // Ví dụ: calculateDatesForPredefinedPeriod(newPeriod) rồi gọi onPeriodChange
      onPeriodChange(null, null, newPeriod); // Backend sẽ xử lý logic ngày cho các mục này
    } else {
        // Nếu là custom và đã có ngày, thì giữ nguyên, không thì chờ user nhập
        if(customStartDate && customEndDate) {
            onPeriodChange(customStartDate, customEndDate, 'custom');
        }
    }
  };

  const handleCustomDateChange = () => {
    if (periodType === 'custom' && customStartDate && customEndDate) {
      if (new Date(customStartDate) > new Date(customEndDate)) {
        alert('Ngày bắt đầu không thể lớn hơn ngày kết thúc.');
        return;
      }
      onPeriodChange(customStartDate, customEndDate, 'custom');
    }
  };

  // Hàm này nên được triển khai để tính toán ngày thực tế
  // const calculateDatesForPredefinedPeriod = (period: string) => { /* ... */ };

  return (
    <div className="mb-6 p-4 rounded-lg shadow">
      <div className="flex flex-wrap gap-4">
        <div>
          <label htmlFor="period-type-select" className="block text-sm font-medium text-gray-700 mb-2">
            Xem theo:
          </label>
          <select
            id="period-type-select"
            value={periodType}
            onChange={handlePredefinedPeriodChange}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          >
            <option value="this_month">Tháng này</option>
            <option value="last_month">Tháng trước</option>
            <option value="this_quarter">Quý này</option>
            <option value="last_quarter">Quý trước</option>
            <option value="this_year">Năm nay</option>
            <option value="last_year">Năm ngoái</option>
            <option value="all_time">Toàn thời gian</option>
            <option value="custom">Tùy chỉnh khoảng ngày</option>
          </select>
        </div>

        {periodType === 'custom' && (
          <>
            <div>
              <label htmlFor="custom-start-date" className="block text-sm font-medium text-gray-700 mb-1">
                Từ ngày:
              </label>
              <input
                type="date"
                id="custom-start-date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="block w-full pl-3 pr-2 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm"
              />
            </div>
            <div>
              <label htmlFor="custom-end-date" className="block text-sm font-medium text-gray-700 mb-1">
                Đến ngày:
              </label>
              <input
                type="date"
                id="custom-end-date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="block w-full pl-3 pr-2 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm"
              />
            </div>
            <button
              onClick={handleCustomDateChange}
              disabled={!customStartDate || !customEndDate}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              Áp dụng
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default TimePeriodFilter;