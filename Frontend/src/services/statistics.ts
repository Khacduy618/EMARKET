import { API_URL } from '@/lib/config';
import { OverviewData, CategoryData, ShopData, TrendDataPoint, SummaryOrder } from '@/types'; // Đảm bảo các type này được định nghĩa
import { getAuthToken } from './api';

const buildQueryString = (params: Record<string, any>): string => {
  const query = Object.entries(params)
    .filter(([_, value]) => value !== null && value !== undefined && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
  return query ? `?${query}` : '';
};

const fetchStats = async <T>(endpoint: string, params: Record<string, any>): Promise<T> => {
  const token = getAuthToken(); // Lấy token từ localStorage hoặc cookie

  // **KIỂM TRA QUAN TRỌNG**
  if (!token) {
    console.error("No auth token found, cannot make authenticated request.");
    // Có thể redirect về trang đăng nhập hoặc throw lỗi rõ ràng
    throw new Error("User is not authenticated.");
  }
  const queryString = buildQueryString(params);
  const response = await fetch(`${API_URL}/statistics${endpoint}${queryString}`, {
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, 
    },
    credentials: 'include', // Đảm bảo gửi cookie nếu cần thiết
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${endpoint}`);
  }
  return response.json();
};

export const fetchOverviewData = (params: any) => fetchStats<OverviewData>('/overview', params);
export const fetchCategorySpending = async (params: any): Promise<CategoryData[]> => {
  const data = await fetchStats<any[]>('/by-category', params);
  // Chuyển đổi tường minh sang number để đảm bảo kiểu dữ liệu
  return data.map(item => ({
    ...item,
    amountSpent: Number(item.amountSpent),
    orderCountInCategory: Number(item.orderCountInCategory),
  }));
};
export const fetchShopSpending = async (params: any): Promise<ShopData[]> => {
    const data = await fetchStats<any[]>('/by-shop', params);
    return data.map(item => ({
        ...item,
        amountSpent: Number(item.amountSpent),
        orderCountInShop: Number(item.orderCountInShop)
    }));
};
export const fetchSpendingTrend = (params: any) => fetchStats<TrendDataPoint[]>('/trend', params);
export const fetchOrdersSummary = (params: any) => fetchStats<SummaryOrder[]>('/orders-summary', params);