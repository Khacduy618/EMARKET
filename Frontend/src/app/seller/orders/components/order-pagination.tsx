"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface PaginationInfo {
    current_page: number
    last_page: number
    prev_page_url: string | null
    next_page_url: string | null
}

interface OrderPaginationProps {
    pagination: PaginationInfo
    currentPage: number
    onPageChange: (page: number) => void
}

export default function OrderPagination({ pagination, currentPage, onPageChange }: OrderPaginationProps) {
    return (
        <Card className="mt-6">
            <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-gray-600">
                        Trang {pagination.current_page} / {pagination.last_page}
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={!pagination.prev_page_url}
                            className="bg-white"
                        >
                            <ChevronLeft className="mr-1 h-4 w-4" />
                            Trước
                        </Button>
                        <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, pagination.last_page) }, (_, i) => {
                                const page = i + 1
                                return (
                                    <Button
                                        key={page}
                                        variant={currentPage === page ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => onPageChange(page)}
                                        className={currentPage === page ? "bg-orange-500 hover:bg-orange-600" : "bg-white"}
                                    >
                                        {page}
                                    </Button>
                                )
                            })}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={!pagination.next_page_url}
                            className="bg-white"
                        >
                            Sau
                            <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
