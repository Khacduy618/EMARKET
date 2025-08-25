export interface OverviewData { totalSpent: number; orderCount: number; }
export interface CategoryData { categoryId: string | number; categoryName: string; amountSpent: number; orderCountInCategory: number; }
export interface ShopData { shopId: string | number; shopName: string; amountSpent: number; orderCountInShop: number; }
export interface TrendDataPoint { datePeriod: string; amountSpent: number; }
export interface SummaryOrder {
  sellerOrderId: number;    // ID của seller order
  sellerOrderCode: string;  // Mã của seller order
  productNames: string[];
  totalAmount: number;
  orderDate: string;
  shopName: string;         
  status: string;           
  paymentStatus: string;  
}