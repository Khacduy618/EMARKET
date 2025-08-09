"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Search, RefreshCw } from "lucide-react"

interface OrderSearchProps {
    searchTerm: string
    onSearch: (term: string) => void
    onRefresh: () => void
}

export default function OrderSearch({ searchTerm, onSearch, onRefresh }: OrderSearchProps) {
    return (
        <Card className="mb-6">
            <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                            type="text"
                            placeholder="Tìm theo mã đơn hàng, tên khách hàng..."
                            value={searchTerm}
                            onChange={(e) => onSearch(e.target.value)}
                            className="pl-10 h-12"
                        />
                    </div>
                    <Button
                        variant="outline"
                        className="sm:w-auto w-full h-12 bg-white border-gray-300 hover:bg-gray-50"
                        onClick={onRefresh}
                    >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Làm mới
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
