"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import type { OrderStatus } from "@/types/analytics"

interface ChartOrderSuccessRateProps {
  apiUrl: string
}

export default function ChartOrderSuccessRate({ apiUrl }: ChartOrderSuccessRateProps) {
  const [orderStatus, setOrderStatus] = useState<OrderStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const COLORS = ["#f97316", "#fb923c", "#fdba74"]

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        const res = await fetch(apiUrl, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        })

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }

        const data = await res.json()

        // Process order status data
        const summaryData = data.summaryDataChart
        if (summaryData) {
          const orderStatusData: OrderStatus[] = [
            {
              status: "Giao thành công",
              count: Number(summaryData.Completed) || 0,
              percentage: 0,
            },
            {
              status: "Trả hàng",
              count: Number(summaryData.Returned) || 0,
              percentage: 0,
            },
            {
              status: "Đơn bị hủy",
              count: Number(summaryData.Cancelled) || 0,
              percentage: 0,
            },
          ]

          // Calculate percentages
          const total = orderStatusData.reduce((acc, item) => acc + item.count, 0)
          if (total > 0) {
            orderStatusData.forEach((item) => {
              item.percentage = Math.round((item.count / total) * 100)
            })
          }

          setOrderStatus(orderStatusData)
        }


      } catch (error) {
        console.error("Lỗi khi fetch dữ liệu biểu đồ:", error)
        setError("Không thể tải dữ liệu biểu đồ")
      } finally {
        setLoading(false)
      }
    }

    if (apiUrl) {
      fetchData()
    }
  }, [apiUrl])


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

  const totalCount = orderStatus.reduce((sum, item) => sum + item.count, 0)
  if (!orderStatus || orderStatus.length === 0 || totalCount === 0) {
    return (
      <div>
        <div className="flex items-center justify-center h-[300px] text-gray-500">
          <p>Không có dữ liệu để hiển thị</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center text-gray-500">
              <p className="text-sm">{error}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center text-gray-500">
              <p className="text-sm">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mb-6">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={orderStatus}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ status, percentage }) => `${status}: ${percentage}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="count"
          >
            {orderStatus.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  )

}
