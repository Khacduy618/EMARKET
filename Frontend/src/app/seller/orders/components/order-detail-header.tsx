import Link from "next/link"
import { Card } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"

interface OrderDetailHeaderProps {
    order: {
        orderCode: string
        orderDate: string
        overallStatus: string
    }
    formatDate: (date: string) => string
}

const statusConfig = {
    Pending: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Chờ xử lý" },
    Processing: { bg: "bg-blue-100", text: "text-blue-800", label: "Đang xử lý" },
    Shipped: { bg: "bg-purple-100", text: "text-purple-800", label: "Đã giao vận" },
    Delivered: { bg: "bg-green-100", text: "text-green-800", label: "Đã giao" },
    CancelledBySeller: { bg: "bg-red-100", text: "text-red-800", label: "Đã hủy" },     
}

export default function OrderDetailHeader({ order, formatDate }: OrderDetailHeaderProps) {
    const statusBadge = statusConfig[order.overallStatus as keyof typeof statusConfig] || {
        bg: "bg-gray-100",
        text: "text-gray-800",
        label: order.overallStatus,
    }

    return (
        <div className="mb-6">
            <Link
                href="/seller/orders"
                className="inline-flex items-center text-orange-600 hover:text-orange-800 hover:underline mb-4 text-sm font-medium transition-colors"
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Quay lại danh sách
            </Link>

            <Card className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Chi Tiết Đơn Hàng #{order.orderCode}</h1>
                        <p className="text-gray-600">Đặt lúc: {formatDate(order.orderDate)}</p>
                    </div>
                    <div>
                        <span
                            className={`inline-flex items-center px-3 py-2 text-sm font-semibold rounded-full ${statusBadge.bg} ${statusBadge.text}`}
                        >
                            {statusBadge.label}
                        </span>
                    </div>
                </div>
            </Card>
        </div>
    )
}
