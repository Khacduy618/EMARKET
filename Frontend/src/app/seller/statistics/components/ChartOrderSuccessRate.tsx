"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import type { OrderStatus } from "@/types/analytics"
import type { summaryDataChart } from "@/types/analytics"

interface Props {
  data: summaryDataChart | null
}

export default function ChartOrderSuccessRate({ data }: Props) {
  const [orderStatus, setOrderStatus] = useState<OrderStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const COLORS = ["#f97316", "#fb923c", "#fdba74"]

  useEffect(() => {
    if (!data) {
      setLoading(true)
      setError(null)
      setOrderStatus([])
      return
    }

    try {
      setLoading(true)
      setError(null)

      const orderStatusData: OrderStatus[] = [
        {
          status: "Giao thành công",
          count: Number(data.Completed) || 0,
          percentage: 0,
        },
        {
          status: "Trả hàng",
          count: Number(data.Returned) || 0,
          percentage: 0,
        },
        {
          status: "Đơn bị hủy",
          count: Number(data.Cancelled) || 0,
          percentage: 0,
        },
      ]

      const total = orderStatusData.reduce((acc, item) => acc + item.count, 0)
      if (total > 0) {
        orderStatusData.forEach((item) => {
          item.percentage = Math.round((item.count / total) * 100)
        })
      }

      setOrderStatus(orderStatusData)
      setLoading(false)
    } catch (err) {
      setError("Lỗi xử lý dữ liệu biểu đồ")
      setLoading(false)
    }
  }, [data])

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
