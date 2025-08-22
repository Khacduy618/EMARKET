
// (account)/spending/page.tsx
'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import SpendingOverview from './components/SpendingOverview';
// CategorySpendingChart vẫn có thể dùng nếu bạn muốn giữ biểu đồ tròn tổng quan
// import CategorySpendingChart from './components/CategorySpendingChart';
import SpendingTrendChart from './components/SpendingTrendChart';
import TimePeriodFilter from './components/TimePeriodFilter';
import ShopSpendingList from './components/ShopSpendingList';
import OrderListModal from './components/OrderListModal'; // Sử dụng lại modal đã có
import CategorySpendingList from './components/CategorySpendingChart';
import { toast } from 'react-toastify';
import { fetchCategorySpending, fetchOrdersSummary, fetchOverviewData, fetchShopSpending, fetchSpendingTrend } from '@/services/statistics';
import { CategoryData, OverviewData, ShopData, SummaryOrder, TrendDataPoint } from '@/types';




const SpendingPage = () => {
  // ... (các state đã có)
  const [overviewData, setOverviewData] = useState<OverviewData | null>(null);
  const [categorySpending, setCategorySpending] = useState<CategoryData[]>([]);
  const [shopSpending, setShopSpending] = useState<ShopData[]>([]);
  const [spendingTrend, setSpendingTrend] = useState<TrendDataPoint[]>([]);

  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [predefinedPeriod, setPredefinedPeriod] = useState<string>('this_month');
  const [trendGroupBy, setTrendGroupBy] = useState<'daily' | 'monthly' | 'quarterly' | 'yearly'>('monthly');

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [debugInfo, setDebugInfo] = useState<any>(null);

  const [isOrderModalOpen, setIsOrderModalOpen] = useState<boolean>(false);
  const [ordersForModal, setOrdersForModal] = useState<SummaryOrder[]>([]);
  const [modalTitle, setModalTitle] = useState<string>("Danh sách Đơn hàng"); // Tiêu đề cho modal
  const [loadingModalOrders, setLoadingModalOrders] = useState<boolean>(false);

  const fetchData = useCallback(async (sDate: string | null, eDate: string | null, periodKey?: string, groupBy?: string) => {
    setLoading(true);
    setError(null);
    setDebugInfo(null);
    
    const params = {
      startDate: sDate,
      endDate: eDate,
      period: periodKey,
      groupBy: groupBy,
    };

    try {
      // Gọi tất cả các API song song để tăng tốc độ tải
      const [overview, categories, shops, trend] = await Promise.all([
        fetchOverviewData(params),
        fetchCategorySpending(params),
        fetchShopSpending(params),
        fetchSpendingTrend(params),
      ]);

      setOverviewData(overview);
      setCategorySpending(categories);
      setShopSpending(shops);
      setSpendingTrend(trend);
      // const overview = await fetchOverviewData(params);
      // setOverviewData(overview);

    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Đã có lỗi xảy ra khi tải dữ liệu.');
      if (err.response) { // Nếu lỗi đến từ axios hoặc fetch có response
        const errorData = await err.response.json();
        setDebugInfo({
          status: err.response.status,
          url: err.response.url,
          errorData: errorData,
        });
      } else {
        setDebugInfo({ message: err.message });
      }
    } finally {
      setLoading(false);
    }
  }, []);

   useEffect(() => {
    // Gọi fetchData lần đầu
    fetchData(startDate, endDate, predefinedPeriod, trendGroupBy);
  }, [fetchData, predefinedPeriod, trendGroupBy]); // Thêm startDate, endDate vào dependency nếu muốn custom date hoạt động ngay

  const handlePeriodChange = (sDate: string | null, eDate: string | null, periodKey?: string) => {
    setStartDate(sDate);
    setEndDate(eDate);
    if (periodKey) setPredefinedPeriod(periodKey);
    // Không cần gọi fetchData ở đây vì useEffect ở trên sẽ tự động gọi lại
  };
  

   const handleTrendGroupByChange = (newGroupBy: 'daily' | 'monthly' | 'quarterly' | 'yearly') => {
    setTrendGroupBy(newGroupBy);
    // Không cần gọi fetchData ở đây vì useEffect ở trên sẽ tự động gọi lại
  };

  // Hàm mới để mở modal và lấy đơn hàng theo categoryId hoặc shopId
  const openOrdersModal = async (filterType: 'category' | 'shop' | 'all', filterId: string | number | null, filterName: string) => {
    setLoadingModalOrders(true);
    setModalTitle(`Đơn hàng cho: ${filterName}`);
    setIsOrderModalOpen(true);
    
    const params = {
      startDate,
      endDate,
      period: predefinedPeriod,
      filterType,
      filterId
    };

    try {
      const modalOrders = await fetchOrdersSummary(params);
      setOrdersForModal(modalOrders);
    } catch (err) {
      console.error("Error fetching orders for modal:", err);
      toast.error("Không thể tải danh sách đơn hàng.");
      setOrdersForModal([]);
    } finally {
      setLoadingModalOrders(false);
    }
  };

  const handleCloseOrderListModal = () => {
    setIsOrderModalOpen(false);
    setOrdersForModal([]);
  };

  // Handler cho việc click vào card "Số lượng Đơn hàng"
  const handleOpenAllOrdersInPeriod = () => {
    const periodLabel = predefinedPeriod === 'custom' ?
        (startDate && endDate ? `${new Date(startDate).toLocaleDateString('vi-VN')} - ${new Date(endDate).toLocaleDateString('vi-VN')}` : "Khoảng tùy chọn") :
        document.querySelector<HTMLSelectElement>('#period-type-select option:checked')?.textContent || "Kỳ đã chọn";
    openOrdersModal('all', null, `Tất cả đơn hàng trong "${periodLabel}"`);
  };


  if (loading) return <div className="p-6 text-center text-gray-500">Đang tải dữ liệu thống kê...</div>;
  if (error) return <div className="p-6 text-center text-red-500">Lỗi: {error}</div>;
  if (!overviewData) return <div className="p-6 text-center text-gray-500">Không có dữ liệu thống kê.</div>;

  return (
    <>
      <div className="p-4 md:p-6 space-y-8 min-h-screen text-black">

        {/* **KHỐI DEBUG INFO** */}
        {debugInfo && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6">
            <strong className="font-bold">Debug Information:</strong>
            <pre className="mt-2 text-xs bg-white p-2 rounded overflow-x-auto">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}
        
        {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6">
                <strong className="font-bold">Lỗi Frontend:</strong> {error}
            </div>
        )}
        <TimePeriodFilter onPeriodChange={handlePeriodChange} initialPeriod={predefinedPeriod} />

        <SpendingOverview
          totalSpent={overviewData.totalSpent}
          orderCount={overviewData.orderCount}
          onOrderCountClick={handleOpenAllOrdersInPeriod} // Cập nhật handler
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CategorySpendingList
            data={categorySpending}
            totalSpentForPeriod={overviewData.totalSpent}
            onCategoryClick={(catId, catName) => openOrdersModal('category', catId, catName)} // Truyền handler
          />
          <ShopSpendingList
            data={shopSpending}
            totalSpentForPeriod={overviewData.totalSpent}
            onShopClick={(shopId, shopName) => openOrdersModal('shop', shopId, shopName)} // Truyền handler
          />
        </div>

        <div className="bg-white p-4 md:p-6 rounded-lg shadow mt-6">
             <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-700">Xu hướng Chi tiêu</h2>
                <select
                    value={trendGroupBy}
                    onChange={(e) => handleTrendGroupByChange(e.target.value as any)}
                    className="pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md shadow-sm"
                >
                    <option value="daily">Theo Ngày</option>
                    <option value="monthly">Theo Tháng</option>
                    <option value="quarterly">Theo Quý</option>
                    <option value="yearly">Theo Năm</option>
                </select>
            </div>
          <Suspense fallback={<div className="text-center py-10">Đang tải biểu đồ...</div>}>
            <div className="relative h-80 md:h-96">
              <SpendingTrendChart data={spendingTrend} />
            </div>
          </Suspense>
        </div>
      </div>

      <OrderListModal
        isOpen={isOrderModalOpen}
        onClose={handleCloseOrderListModal}
        orders={loadingModalOrders ? [] : ordersForModal}
        title={modalTitle} // Sử dụng state cho tiêu đề
      />
       {loadingModalOrders && isOrderModalOpen && (
        <div className="fixed inset-0 z-[60] flex justify-center items-center"> {/* Tăng z-index */}
            <div className="bg-white p-4 rounded-lg shadow-lg">
                <p className="text-gray-700 text-lg">Đang tải danh sách đơn hàng...</p>
                {/* Optional: Add a spinner icon here */}
            </div>
        </div>
      )}
    </>
  );
};

export default SpendingPage;