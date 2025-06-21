'use client';

import { CreditCard, Activity, ChevronUp, ChevronDown } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { StatCard } from './components/StatCard';
import OderModel from './components/OderModal';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { vi } from 'date-fns/locale/vi';
import { Spinner, Button, Table } from 'react-bootstrap';
import ChartOrderSuccessRate from './components/ChartOrderSuccessRate';
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subWeeks,
  subMonths,
} from 'date-fns';

const VNDIcon = () => <span className="text-xl font-semibold text-gray-500">₫</span>;

const formatVND = (amount: number): string => new Intl.NumberFormat('vi-VN').format(amount);
const formatVND2 = (amount: number): string =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

type Revenue = {
  OrderDate?: string;
  OrderNumber: number;
  TotalRevenue: number;
  NumProductsSold: number;
};

export default function Statistics() {
  const [revenueData, setRevenueData] = useState<Revenue>();
  const [arrRevenue, setArrRevenue] = useState<Revenue[]>([]);

  const [startDate, setStartDate] = useState<Date | null>(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [endDate, setEndDate] = useState<Date | null>(new Date());

  const [filterType, setFilterType] = useState<'date' | 'week' | 'month'>('date');

  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [displayQuantity, setDisplayQuantity] = useState<number>(7);
  const [totalPage, setTotalPage] = useState<number>(1);
  const [sortParam, setSortParam] = useState<string>('OrderDate-desc');

  // Tạo params string dùng chung (memoized để tối ưu)
  const params = useMemo(() => {
    if (!startDate || !endDate) return '';
    const p = new URLSearchParams({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      page: currentPage.toString(),
      display_quantity: displayQuantity.toString(),
      sort: sortParam,
    });
    return p.toString();
  }, [startDate, endDate, currentPage, displayQuantity, sortParam]);

  const updateDateRangeByFilterType = (type: 'date' | 'week' | 'month') => {
    const now = new Date();
    switch (type) {
      case 'week': {
        const lastWeek = subWeeks(now, 1);
        setStartDate(startOfWeek(lastWeek, { weekStartsOn: 1 }));
        setEndDate(endOfWeek(lastWeek, { weekStartsOn: 1 }));
        break;
      }
      case 'month': {
        const lastMonth = subMonths(now, 1);
        setStartDate(startOfMonth(lastMonth));
        setEndDate(endOfMonth(lastMonth));
        break;
      }
      case 'date':
      default:
        setStartDate(new Date(now.getFullYear(), now.getMonth(), 1));
        setEndDate(now);
        break;
    }
  };

  const handleFilterTypeChange = (newType: 'date' | 'week' | 'month') => {
    setFilterType(newType);
    updateDateRangeByFilterType(newType);
  };

  const fetchStatistics = async () => {
    if (!startDate || !endDate) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8001/api/seller/statistics?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const data = await res.json();
      setRevenueData(data.summaryByShop);
      setArrRevenue(data.summaryByDate);
      setTotalPage(data.pagination?.totalPage ?? 1);
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  // gọi fetch khi thay đổi các tham số này
  useEffect(() => {
    fetchStatistics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const handleOrderClick = (orderDate?: string) => {
    setShowModal(true);
    setSelectedDate(orderDate);
  };

  const handleSort = (field: string) => {
    const [currentField, currentDir] = sortParam.split('-');
    if (currentField === field) {
      setSortParam(`${field}-${currentDir === 'asc' ? 'desc' : 'asc'}`);
    } else {
      setSortParam(`${field}-asc`);
    }
  };

  const renderSortIcon = (field: string) => {
    const [currentField, currentDir] = sortParam.split('-');
    const isActive = currentField === field;
    return (
      <span className="ms-1 inline-flex flex-col align-middle">
        <ChevronUp size={12} className={isActive && currentDir === 'asc' ? 'text-primary' : 'text-gray-400'} />
        <ChevronDown size={12} className={isActive && currentDir === 'desc' ? 'text-primary' : 'text-gray-400'} />
      </span>
    );
  };

  return (
    <div className="space-y-8 ps-4">
      <OderModel show={showModal} date={selectedDate} onClose={() => setShowModal(false)} />

      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Thống kê</h1>
          <p className="mt-1 text-gray-500">
            Chào mừng trở lại thống kê, đây là những gì đang diễn ra với cửa hàng của bạn.
          </p>
        </div>
      </header>

      {/* Phần chọn lọc */}
      <div className="mb-3 d-flex align-items-center gap-3 flex-wrap">
        <label className="me-2 mb-0">Lọc theo:</label>
        <select
          value={filterType}
          onChange={(e) => handleFilterTypeChange(e.target.value as 'date' | 'week' | 'month')}
          className="form-select d-inline w-auto"
        >
          <option value="date">Ngày</option>
          <option value="week">Tuần trước</option>
          <option value="month">Tháng trước</option>
        </select>

        <span className="pr-2">Từ ngày:</span>
        <DatePicker
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          locale={vi}
          dateFormat="dd/MM/yyyy"
          className="border border-1 bg-white py-2 w-24 rounded"
          maxDate={endDate ?? undefined}
        />
        <span className="px-2">Đến</span>
        <DatePicker
          selected={endDate}
          onChange={(date) => setEndDate(date)}
          locale={vi}
          dateFormat="dd/MM/yyyy"
          className="border border-1 bg-white py-2 w-24 rounded"
          minDate={startDate ?? undefined}
          maxDate={new Date()}
        />

        <button className="btn btn-primary ms-2" onClick={() => fetchStatistics()}>
          Áp dụng
        </button>
      </div>

      {loading ? (
        <div className="text-center my-8">
          <Spinner animation="border" role="status" />
          <div>Đang tải dữ liệu...</div>
        </div>
      ) : (
        <>
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
              changeType="decrease"
              change="-1.9%"
            />
            <div>
              <ChartOrderSuccessRate apiUrl={`http://localhost:8001/api/seller/statistics?${params}`} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm">
              <h4 className="text-xl font-semibold text-gray-800 mb-4">Doanh thu từng ngày</h4>
              <div className="overflow-x-auto">
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>STT</th>
                      <th onClick={() => handleSort('OrderDate')} className="cursor-pointer">
                        Thời gian {renderSortIcon('OrderDate')}
                      </th>
                      <th onClick={() => handleSort('OrderNumber')} className="cursor-pointer">
                        Đơn hàng {renderSortIcon('OrderNumber')}
                      </th>
                      <th onClick={() => handleSort('NumProductsSold')} className="cursor-pointer">
                        Sản phẩm {renderSortIcon('NumProductsSold')}
                      </th>
                      <th onClick={() => handleSort('TotalRevenue')} className="cursor-pointer">
                        Doanh thu {renderSortIcon('TotalRevenue')}
                      </th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {arrRevenue.map((item, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{item.OrderDate?.slice(0, 10)}</td>
                        <td>{item.OrderNumber}</td>
                        <td>{item.NumProductsSold}</td>
                        <td>{formatVND2(item.TotalRevenue)}</td>
                        <td>
                          <Button variant="link" size="sm" className="p-0" onClick={() => handleOrderClick(item.OrderDate)}>
                            Chi tiết
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
              <div className="flex justify-between items-center mt-4">
                <div>
                  <span>Hiển thị: </span>
                  <select className="form-select d-inline w-auto" value={displayQuantity} onChange={(e) => setDisplayQuantity(Number(e.target.value))}>
                    {[5, 7, 10, 20].map((num) => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Button variant="secondary" onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="me-2">
                    Trước
                  </Button>
                  <span>
                    Trang {currentPage} / {totalPage}
                  </span>
                  <Button variant="secondary" onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPage))} disabled={currentPage === totalPage} className="ms-2">
                    Sau
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
