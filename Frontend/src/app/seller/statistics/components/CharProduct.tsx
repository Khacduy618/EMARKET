"use client"

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"

interface SalesData {
  OrderDate?: string
  OrderNumber: number
  TotalRevenue: number
  NumProductsSold: number
}

interface ChartData {
  date: string
  revenue: number
  orders: number
}

interface RevenueChartProps {
  summaryByDate: SalesData[] | null
  loading: boolean
}

export default function RevenueChart({ summaryByDate, loading }: RevenueChartProps) {
  const data: ChartData[] = (summaryByDate || []).map((item) => ({
    date: item.OrderDate?.slice(0, 10) || "",
    revenue: item.NumProductsSold || 0,
    orders: item.OrderNumber || 0,
  })).reverse();

  const formatDate = (dateStr: string) => {
    if (!dateStr) return ""
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })
    } catch {
      return dateStr
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        <span className="ml-3 text-gray-600">Đang tải dữ liệu...</span>
      </div>
    )
  }

  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-[300px] text-gray-500">
        <p>Không có dữ liệu để hiển thị</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" tickFormatter={formatDate} fontSize={12} />
        <YAxis
          tickFormatter={(value) => `${value} SP`}
          fontSize={12}
        />

        <Tooltip
          formatter={(value: number) => [value, "Sản phẩm đã bán "]}
          labelFormatter={(label) => `Ngày: ${formatDate(label)}`}
        />
        <Line
          type="linear"
          dataKey="revenue"
          stroke="#f97316"
          strokeWidth={2}
          dot={{ fill: "#f97316", strokeWidth: 2, r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
