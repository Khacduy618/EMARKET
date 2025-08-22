export interface OverviewData { totalSpent: number; orderCount: number; }
export interface CategoryData { categoryId: string | number; categoryName: string; amountSpent: number; orderCountInCategory: number; }
export interface ShopData { shopId: string | number; shopName: string; amountSpent: number; orderCountInShop: number; }
export interface TrendDataPoint { datePeriod: string; amountSpent: number; }
export interface SummaryOrder {
  orderId: number; // Sẽ là SellerOrderID
  orderCode: string;
  productNames: string[];
  totalAmount: number;
  orderDate: string;
}