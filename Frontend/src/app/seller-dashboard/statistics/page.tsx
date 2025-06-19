'use client';

import { CreditCard, Activity } from 'lucide-react';
import { useEffect, useState } from 'react';
import { StatCard } from './components/StatCard';
import OrderListItem from './components/OderListItem';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { vi } from 'date-fns/locale/vi';
import OderModel from './components/OderModal';
import { Spinner } from 'react-bootstrap';

const VNDIcon = () => (
  <span className="text-xl font-semibold text-gray-500">₫</span>
);

const formatVND = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    currency: 'VND',
  }).format(amount);
};

const formatVND2 = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

type Revenue = {
  OrderDate?: Date,
  OrderNumber: number,
  TotalRevenue: number,
  NumProductsSold: number
}

export default function Statistics() {
  const [revenueData, setRevenueData] = useState<Revenue>();
  const [arrRevenue, setArrRevenue] = useState<Revenue[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );
  const [endDate, setEndDate] = useState<Date | null>(new Date());

  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<string | undefined>(undefined);

  const [loading, setLoading] = useState<boolean>(false);

  const fetchStatistics = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8001/api/seller/statistics?startDate=${startDate?.toISOString()}&endDate=${endDate?.toISOString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const data = await res.json();
      setRevenueData(data.summaryByShop);
      setArrRevenue(data.summaryByDate);
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
      // Bạn có thể thêm state error nếu muốn hiện lỗi
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

  function handelButtonDate() {
    fetchStatistics();
  }

  const handleOrderClick = (orderDate?: string) => {
    setShowModal(true);
    setSelectedDate(orderDate);
  };

  return (
    <div className="space-y-8">
      <OderModel show={showModal} date={selectedDate} onClose={() => setShowModal(false)} />

      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Thống kê</h1>
          <p className="mt-1 text-gray-500">
            Chào mừng trở lại thống kê, đây là những gì đang diễn ra với cửa hàng của bạn.
          </p>
        </div>
      </header>

      {/* Date picker và nút áp dụng */}
      <div>
        <span className="pr-2">Từ ngày:</span>
        <DatePicker
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          locale={vi}
          dateFormat="dd/MM/yyyy"
          className="border p-2 rounded"
          popperContainer={({ children }) => <div style={{ position: 'absolute', zIndex: 9999 }}>{children}</div>}
        />
        <span className="px-2">Đến</span>
        <DatePicker
          selected={endDate}
          onChange={(date) => setEndDate(date)}
          locale={vi}
          dateFormat="dd/MM/yyyy"
          className="border p-2 rounded"
          popperContainer={({ children }) => <div style={{ position: 'absolute', zIndex: 9999 }}>{children}</div>}
        />
        <button
          className="btn btn-success ms-2"
          onClick={handelButtonDate}
        >
          Áp dụng
        </button>
      </div>

      {/* Loading Spinner */}
      {loading ? (
        <div className="text-center my-8">
          <Spinner animation="border" role="status" />
          <div>Đang tải dữ liệu...</div>
        </div>
      ) : (
        <>
          {/* Thống kê tổng */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Tổng doanh thu"
              value={formatVND(Number(revenueData?.TotalRevenue ?? 0))}
              icon={VNDIcon}
              change="+20.1%"
              changeType="increase"
            />
            <StatCard
              title="Số đơn giao thành công"
              value={(revenueData?.OrderNumber ?? 0).toString()}
              icon={CreditCard}
              change="+18.2%"
              changeType="increase"
            />
            <StatCard
              title="Số sản phẩm đã bán"
              value={(revenueData?.NumProductsSold ?? 0).toString()}
              icon={Activity}
              change="-1.9%"
              changeType="decrease"
            />
          </div>

          {/* Bảng doanh thu từng ngày */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm">
              <h4 className="text-xl font-semibold text-gray-800 mb-4">Doanh thu từng ngày</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-xs text-gray-600 uppercase">
                    <tr>
                      <th className="p-4">STT</th>
                      <th className="p-4">Thời gian</th>
                      <th className="p-4">Số đơn giao thành công</th>
                      <th className="p-4">Số sản phẩm đã bán</th>
                      <th className="p-4">Doanh thu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {arrRevenue.map((item, index) => (
                      <OrderListItem
                        key={index}
                        id={(index + 1).toString()}
                        customer={item.OrderDate?.toString()}
                        date={item.OrderNumber.toString()}
                        total={item.NumProductsSold.toString()}
                        status={formatVND2(Number(item.TotalRevenue ?? 0))}
                        handelOrder={handleOrderClick}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
