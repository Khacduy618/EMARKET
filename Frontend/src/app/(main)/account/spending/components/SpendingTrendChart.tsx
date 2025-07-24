// (account)/spending/components/SpendingTrendChart.tsx
'use client';
import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
// ... (imports ChartJS như cũ) ...
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend, Filler
} from 'chart.js';

ChartJS.register( CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);


interface SpendingTrendDataPoint {
  datePeriod: string; // Ví dụ: '2023-05-01', 'Thg 5, 2023', 'Quý 2, 2023', '2023'
  amountSpent: number;
}

interface SpendingTrendChartProps {
  data: SpendingTrendDataPoint[];
  // onGroupByChange: (groupBy: 'daily' | 'monthly' | 'quarterly' | 'yearly') => void; // Để gọi lại API
  // currentGroupBy: 'daily' | 'monthly' | 'quarterly' | 'yearly';
}

const SpendingTrendChart: React.FC<SpendingTrendChartProps> = ({ data /*, onGroupByChange, currentGroupBy*/ }) => {
  // const groupByOptions = [
  //   { value: 'daily', label: 'Theo Ngày' },
  //   { value: 'monthly', label: 'Theo Tháng' },
  //   { value: 'quarterly', label: 'Theo Quý' },
  //   { value: 'yearly', label: 'Theo Năm' },
  // ];

  if (!data || data.length === 0) {
    return <p className="text-center text-gray-500 py-4">Không có dữ liệu xu hướng chi tiêu.</p>;
  }

  const chartData = {
    labels: data.map(item => item.datePeriod),
    datasets: [
      {
        label: 'Tổng chi tiêu',
        data: data.map(item => item.amountSpent),
        fill: true, // Để tô màu vùng dưới đường line
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)', // Màu cho vùng fill
        tension: 0.1,
        pointBackgroundColor: 'rgb(75, 192, 192)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(75, 192, 192)'
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }, // Có thể ẩn nếu chỉ có 1 dataset
      title: { display: false },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            let label = context.dataset.label || '';
            if (label) { label += ': '; }
            if (context.parsed.y !== null) {
              label += context.parsed.y.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
            }
            return label;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value: any) {
            if (Number(value) >= 1000000) return (Number(value) / 1000000).toLocaleString('vi-VN') + ' Tr';
            if (Number(value) >= 1000) return (Number(value) / 1000).toLocaleString('vi-VN') + ' K';
            return Number(value).toLocaleString('vi-VN') + ' đ';
          },
        },
      },
      x: {
        grid: {
            display: false, // Ẩn lưới dọc cho trục x
        }
      }
    },
  };

  return (
    <>
      {/* Phần chọn GroupBy có thể đặt ở đây hoặc ở page chính */}
      {/* <div className="mb-4 text-right">
        <select
          value={currentGroupBy}
          onChange={(e) => onGroupByChange(e.target.value as any)}
          className="pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm"
        >
          {groupByOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      </div> */}
      <div className="relative h-72 md:h-80">
        <Line data={chartData} options={options} />
      </div>
    </>
  );
};

export default SpendingTrendChart;