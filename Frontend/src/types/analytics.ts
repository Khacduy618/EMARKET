export interface SalesData {
  date: string
  revenue: number
  orders: number
  customers: number
  products: number
}

export interface ProductSales {
  id: string
  name: string
  sales: number
  revenue: number
  image: string
  category: string
}

export interface OrderStatus {
  status: string
  count: number
  percentage: number
}

export interface RegionData {
  region: string
  orders: number
  revenue: number
  percentage: number
}

export interface summaryDataChart {
  Completed: number
  Returned: number
  Cancelled: number
}

export type TimeRange = "day" | "week" | "month"
