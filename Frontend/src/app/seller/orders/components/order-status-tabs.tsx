"use client"

import { Card, CardContent } from "@/components/ui/card"

interface OrderStatusTabsProps {
    activeStatus: string
    onStatusChange: (status: string) => void
}

const statusTabs = [
    { key: "all", label: "Tất cả", color: "bg-gray-100 text-gray-800" },
    { key: "Pending", label: "Chờ xử lý", color: "bg-yellow-100 text-yellow-800" },
    { key: "Processing", label: "Đang xử lý", color: "bg-blue-100 text-blue-800" },
    { key: "Shipped", label: "Đã giao vận", color: "bg-purple-100 text-purple-800" },
    { key: "Delivered", label: "Đã giao", color: "bg-green-100 text-green-800" },
    { key: "CancelledBySeller", label: "Đã hủy", color: "bg-red-100 text-red-800" },
]

export default function OrderStatusTabs({ activeStatus, onStatusChange }: OrderStatusTabsProps) {
    return (
        <Card className="mb-6">
            <CardContent className="p-0">
                <div className="flex overflow-x-auto">
                    {statusTabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => onStatusChange(tab.key)}
                            className={`flex-1 min-w-0 px-4 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeStatus === tab.key
                                    ? "border-orange-500 text-orange-600 bg-orange-50"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
