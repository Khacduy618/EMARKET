"use client"

import { TrendingUp, TrendingDown, type LucideIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface StatCardProps {
  title: string
  value: string
  icon: LucideIcon
  change?: string
  changeType?: "increase" | "decrease"
  color?: "green" | "blue" | "purple" | "orange"
}

export default function StatCard({ title, value, icon: Icon, change, changeType, color = "blue" }: StatCardProps) {
  const colorClasses = {
    green: "text-green-600 bg-green-100",
    blue: "text-blue-600 bg-blue-100",
    purple: "text-purple-600 bg-purple-100",
    orange: "text-orange-600 bg-orange-100",
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          <Icon className="w-4 h-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        {change && (
          <div className="flex items-center mt-2">
            {changeType === "increase" ? (
              <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
            )}
            <span className={`text-xs ${changeType === "increase" ? "text-green-600" : "text-red-600"}`}>
              {change} so với tháng trước
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
