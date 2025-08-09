"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Package } from "lucide-react"

interface EmptyStateProps {
    onClearFilters: () => void
}

export default function EmptyState({ onClearFilters }: EmptyStateProps) {
    return (
        <Card>
            <CardContent className="p-12 text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Package className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">Không tìm thấy đơn hàng nào</h3>
                <p className="text-gray-500 mb-4">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                <Button onClick={onClearFilters} className="bg-orange-500 hover:bg-orange-600">
                    Xóa bộ lọc
                </Button>
            </CardContent>
        </Card>
    )
}
