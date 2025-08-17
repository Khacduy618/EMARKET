
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

// ... (Định nghĩa kiểu dữ liệu như trước: OverviewData, CategoryData, ShopData, TrendDataPoint, SummaryOrder)
interface OverviewData { totalSpent: number; orderCount: number; }
interface CategoryData { categoryId: string | number; categoryName: string; amountSpent: number; orderCountInCategory: number; }
interface ShopData { shopId: string | number; shopName: string; amountSpent: number; orderCountInShop: number; }
interface TrendDataPoint { datePeriod: string; amountSpent: number; }
interface SummaryOrder {
  orderCode: string;
  productNames: string[];
  totalAmount: number;
  orderDate: string;
}


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

  const [isOrderModalOpen, setIsOrderModalOpen] = useState<boolean>(false);
  const [ordersForModal, setOrdersForModal] = useState<SummaryOrder[]>([]);
  const [modalTitle, setModalTitle] = useState<string>("Danh sách Đơn hàng"); // Tiêu đề cho modal
  const [loadingModalOrders, setLoadingModalOrders] = useState<boolean>(false);

  const fetchData = useCallback(async (sDate: string | null, eDate: string | null, periodKey?: string, groupBy?: string) => {
    setLoading(true);
    setError(null);
    try {
      // API call cho overviewData, categorySpending, shopSpending, spendingTrend
      // (Giữ nguyên logic API call hoặc dữ liệu mẫu như trước)
       await new Promise(resolve => setTimeout(resolve, 1000));
      const totalSpentExample = periodKey === 'this_month' ? 5250000 : (periodKey === 'last_3_months' ? 15800000 : (sDate && eDate ? 20000000 : 45000000));
      setOverviewData({
        totalSpent: totalSpentExample,
        orderCount: periodKey === 'this_month' ? 5 : (periodKey === 'last_3_months' ? 18 : (sDate && eDate ? 22 : 55)),
      });
      setCategorySpending([
        { categoryId: 'cat1', categoryName: 'Điện tử', amountSpent: totalSpentExample * 0.4, orderCountInCategory: 2 },
        { categoryId: 'cat2', categoryName: 'Thời trang', amountSpent: totalSpentExample * 0.3, orderCountInCategory: 8 },
        { categoryId: 'cat3', categoryName: 'Gia dụng', amountSpent: totalSpentExample * 0.2, orderCountInCategory: 5 },
      ]);
      setShopSpending([
        { shopId: 'shop1', shopName: 'Bích Kiều Tech World', amountSpent: totalSpentExample * 0.5, orderCountInShop: 3 },
        { shopId: 'shop2', shopName: 'E-Style Fashion', amountSpent: totalSpentExample * 0.25, orderCountInShop: 10 },
      ]);
       let trendMockData: TrendDataPoint[] = [];
      if (groupBy === 'monthly' || !groupBy) {
        trendMockData = [ { datePeriod: 'Thg 3, 2025', amountSpent: 8000000 }, { datePeriod: 'Thg 4, 2025', amountSpent: 5500000 }, { datePeriod: 'Thg 5, 2025', amountSpent: totalSpentExample } ];
      } else if (groupBy === 'daily') {
         for(let i=6; i>=0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            trendMockData.push({datePeriod: d.toLocaleDateString('vi-VN'), amountSpent: Math.floor(Math.random() * (totalSpentExample/7)) })
         }
      }
      setSpendingTrend(trendMockData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(null, null, predefinedPeriod, trendGroupBy);
  }, [fetchData, predefinedPeriod, trendGroupBy]);

  const handlePeriodChange = (sDate: string | null, eDate: string | null, periodKey?: string) => {
    setStartDate(sDate);
    setEndDate(eDate);
    if (periodKey) setPredefinedPeriod(periodKey);
    fetchData(sDate, eDate, periodKey, trendGroupBy);
  };

   const handleTrendGroupByChange = (newGroupBy: 'daily' | 'monthly' | 'quarterly' | 'yearly') => {
    setTrendGroupBy(newGroupBy);
    fetchData(startDate, endDate, predefinedPeriod, newGroupBy);
  };

  // Hàm mới để mở modal và lấy đơn hàng theo categoryId hoặc shopId
  const openOrdersModal = async (filterType: 'category' | 'shop' | 'all', filterId: string | number | null, filterName: string) => {
    setLoadingModalOrders(true);
    setModalTitle(`Đơn hàng cho: ${filterName}`);
    setIsOrderModalOpen(true);
    try {
      
      // Dữ liệu mẫu cho modal
      await new Promise(resolve => setTimeout(resolve, 500));
      let mockModalOrders: SummaryOrder[] = [];
      if (filterType === 'category' && filterId === 'cat1') { // Giả sử 'Điện tử'
        mockModalOrders = [
            { orderCode: 'EMK2025001', productNames: ['Smartphone X Pro Max', 'Áo Thun ABC'], totalAmount: 16175000, orderDate: '2025-05-15' },
            { orderCode: 'EMK2025004', productNames: ['Tai Nghe DEF'], totalAmount: 800000, orderDate: '2025-05-20' },
            { orderCode: 'EMK2025005', productNames: ['Laptop Z Series'], totalAmount: 25000000, orderDate: '2025-05-28' },
            { orderCode: 'EMK2025006', productNames: ['Laptop X Series'], totalAmount: 28000000, orderDate: '2025-05-28' },
            { orderCode: 'EMK2025007', productNames: ['Laptop C Series'], totalAmount: 29000000, orderDate: '2025-05-28' },        
        ];
      } else if (filterType === 'category' && filterId === 'cat2') { // Giả sử 'Thời trang'
         mockModalOrders = [
          { orderCode: 'EMK-TT001', productNames: ['Áo Thun ABC', 'Quần Jean XYZ'], totalAmount: 850000, orderDate: '2025-05-05' },
        ];
      } else if (filterType === 'shop' && filterId === 'shop1') { // Giả sử Bích Kiều Tech
         mockModalOrders = [
          { orderCode: 'EMK-BK001', productNames: ['Smartphone X Pro Max'], totalAmount: 15990000, orderDate: '2025-05-10' },
          { orderCode: 'EMK-BK002', productNames: ['Tai nghe Z Buds 3'], totalAmount: 2490000, orderDate: '2025-05-12' },
        ];
      }
      else { // 'all' hoặc category/shop không có data mẫu
        mockModalOrders = [
          { orderCode: 'EMK-ALL001', productNames: ['Sản phẩm A', 'Sản phẩm B'], totalAmount: 1000000, orderDate: '2025-05-01' },
          { orderCode: 'EMK-ALL002', productNames: ['Sản phẩm C'], totalAmount: 500000, orderDate: '2025-05-03' },
        ];
      }
       const currentOrderCount = filterType === 'all' ? overviewData?.orderCount || 0
                               : (filterType === 'category' ? categorySpending.find(c=>c.categoryId === filterId)?.orderCountInCategory || 0
                                 : shopSpending.find(s=>s.shopId === filterId)?.orderCountInShop || 0);

      setOrdersForModal(mockModalOrders.slice(0, currentOrderCount));


    } catch (err) {
      console.error("Error fetching orders for modal:", err);
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