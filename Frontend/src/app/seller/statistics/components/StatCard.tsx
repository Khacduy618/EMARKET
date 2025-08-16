import { ShoppingCart, TrendingUp, TrendingDown, ArrowDownLeft, XCircle, DollarSign, type LucideIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

const formatVND = (amount: number): string => new Intl.NumberFormat("vi-VN").format(amount)
const parseVND = (formatted: string): number => {
  return Number(formatted.replace(/\./g, "").replace(",", "."));
};

interface StatCardProps {
  statKey?: string
  title: string
  prevValue?: number | string
  value: number | string
  unit?: string
  icon: string
  change?: string
  changeType?: "increase" | "decrease"
  color?: "green" | "blue" | "purple" | "orange" | "red"
}

const iconMap: Record<string, LucideIcon> = {
  ShoppingCart,
  TrendingUp,
  ArrowDownLeft,
  XCircle,
  DollarSign,
}

export default function StatCard({
  statKey,
  title,
  prevValue,
  value,
  icon,
  change,
  changeType,
  color = "blue",
  unit,
}: StatCardProps) {
  const IconComponent = iconMap[icon] || ShoppingCart
  const colorClasses = {
    green: "text-green-600 bg-green-100",
    blue: "text-blue-600 bg-blue-100",
    purple: "text-purple-600 bg-purple-100",
    orange: "text-orange-600 bg-orange-100",
    red: "text-red-600 bg-red-100",
  }

  let changeText: string | null = null
  if (statKey === "total_revenue") {
    const resultChange = parseVND(String(value ?? 0)) - parseVND(String(prevValue ?? 0))
    if (resultChange > 0) {
      changeText = `Tăng lên ${formatVND(resultChange)} ${unit ?? ""} so với trước (giá trị trước là ${formatVND(parseVND(String(prevValue ?? 0)))} ${unit ?? ""})`
    } else if (resultChange < 0) {
      changeText = `Giảm xuống ${formatVND(Math.abs(resultChange))} ${unit ?? ""} so với trước (giá trị trước là ${formatVND(parseVND(String(prevValue ?? 0)))} ${unit ?? ""})`
    } else {
      changeText = `Không thay đổi (giá trị giữ nguyên ${formatVND(parseVND(String(prevValue ?? 0)))} ${unit ?? ""})`
    }
  } else {
    const resultChange = Number(value) - Number(prevValue)
    if (resultChange > 0) {
      changeText = `Tăng lên ${resultChange} ${unit ?? ""} so với trước (giá trị trước là ${Number(prevValue)} ${unit ?? ""})`
    } else if (resultChange < 0) {
      changeText = `Giảm xuống ${Math.abs(resultChange)} ${unit ?? ""} so với trước (giá trị trước là ${Number(prevValue)} ${unit ?? ""})`
    } else {
      changeText = `Không thay đổi (giá trị giữ nguyên ${Number(prevValue)} ${unit ?? ""})`
    }
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Card className="cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base md:text-lg font-semibold text-gray-700">
              {title}
            </CardTitle>
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorClasses[color]}`}
            >
              <IconComponent className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {value} <span className="text-xs text-gray-500">{unit}</span>
            </div>
            {change && (
              <div className="flex items-center mt-2">
                {changeType === "increase" ? (
                  <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
                )}
                <span
                  className={`text-xs ${changeType === "increase"
                      ? "text-green-600"
                      : "text-red-600"
                    }`}
                >
                  {change}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </TooltipTrigger>
      {changeText && (
        <TooltipContent
          side="top"
          className="max-w-xs py-3 bg-gray-800 text-white md:text-base rounded-lg shadow-lg break-words">
          <span className="text-sm">{changeText}</span>
        </TooltipContent>
      )}
    </Tooltip>
  )
}
