"use client"

import ComponentRevenue from "./components/RevenueComponent"

export default function StatisticPage() {

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Thống kê bán hàng</h1>
          <p className="text-gray-600 mt-1">Theo dõi hiệu suất kinh doanh và doanh thu của shop</p>
        </div>

      </div>
      <ComponentRevenue />
    </div>
  )
}
