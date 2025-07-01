"use client"

import { useEffect, useState } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface RevenueChartProps {
  apiUrl: string
}

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

interface ApiResponse {
  summaryByDate: SalesData[]
  summaryByShop: SalesData
  pagination?: {
    totalPage: number
  }
}

export default function RevenueChart({ apiUrl }: RevenueChartProps) {
  const [data, setData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    if (!apiUrl) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const authToken = localStorage.getItem("authToken")
      if (!authToken) {
        throw new Error("Không tìm thấy token xác thực")
      }

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      })

      // Check if response is HTML (error page)
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text()
        console.error("API returned non-JSON response:", text.substring(0, 200))
        throw new Error(`API trả về định dạng không hợp lệ. Status: ${response.status}`)
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result: ApiResponse = await response.json()

      // Transform data to match chart format
      const transformedData: ChartData[] = (result.summaryByDate || []).map((item) => ({
        date: item.OrderDate?.slice(0, 10) || "",
        revenue: item.TotalRevenue || 0,
        orders: item.OrderNumber || 0,
      }))

      // Sort data by date from oldest to newest (left to right)
      transformedData.sort((a, b) => {
        const dateA = new Date(a.date)
        const dateB = new Date(b.date)
        return dateA.getTime() - dateB.getTime()
      })

      setData(transformedData)
    } catch (err) {
      console.error("Failed to fetch revenue data:", err)
      setError(err instanceof Error ? err.message : "Không thể tải dữ liệu")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [apiUrl])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      notation: "compact",
    }).format(value)
  }

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
      <div>
        <div className="flex items-center justify-center h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          <span className="ml-3 text-gray-600">Đang tải dữ liệu...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <div className="flex flex-col items-center justify-center h-[300px] text-red-500">
          <p className="text-center mb-2">Lỗi tải dữ liệu:</p>
          <p className="text-sm text-center">{error}</p>
          <button onClick={fetchData} className="mt-4 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600">
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div>
        <div className="flex items-center justify-center h-[300px] text-gray-500">
          <p>Không có dữ liệu để hiển thị</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tickFormatter={formatDate} fontSize={12} />
          <YAxis tickFormatter={formatCurrency} fontSize={12} />
          <Tooltip
            formatter={(value: number) => [formatCurrency(value), "Doanh thu"]}
            labelFormatter={(label) => `Ngày: ${formatDate(label)}`}
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#f97316"
            strokeWidth={2}
            dot={{ fill: "#f97316", strokeWidth: 2, r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
