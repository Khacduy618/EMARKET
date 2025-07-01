"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { TrendingUp, Package } from "lucide-react"
import ComponentRevenue from "./components/RevenueComponent"
import ProductComponent from "./components/ProductComponent"

export default function StatisticPage() {
  const [activeTab, setActiveTab] = useState<"revenue" | "product">("revenue")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Thống kê bán hàng</h1>
          <p className="text-gray-600 mt-1">Theo dõi hiệu suất kinh doanh và doanh thu của shop</p>
        </div>

        {/* Tab Navigation - Compact Version */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          <Button
            variant="ghost"
            onClick={() => setActiveTab("revenue")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 ${activeTab === "revenue"
                ? "bg-blue-600 text-white shadow-md hover:bg-blue-700"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
              }`}
          >
            <TrendingUp className="h-3 w-3" />
            Doanh thu
          </Button>
          <Button
            variant="ghost"
            onClick={() => setActiveTab("product")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 ${activeTab === "product"
                ? "bg-blue-600 text-white shadow-md hover:bg-blue-700"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
              }`}
          >
            <Package className="h-3 w-3" />
            Sản phẩm
          </Button>
        </div>

      </div>
      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === "revenue" && <ComponentRevenue />}
        {activeTab === "product" && <ProductComponent />}
      </div>
    </div>
  )
}
