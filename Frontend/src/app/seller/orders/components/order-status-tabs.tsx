"use client"

import { useRef, useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface OrderStatusTabsProps {
    activeStatus: string
    onStatusChange: (status: string) => void
}

const statusTabs = [
    { key: "all", label: "Tất cả" },
    { key: "Pending", label: "Chờ xác nhận" },
    { key: "Processing", label: "Đang xử lý" },
    { key: "Shipped", label: "Đã giao vận" },
    { key: "OutForDelivery", label: "Đang giao" },
    { key: "DeliveryFailed", label: "Giao hàng thất bại" },
    { key: "Delivered", label: "Đã giao" },
    { key: "Completed", label: "Hoàn tất" },
    { key: "ReturnInProgress", label: "Đang trả hàng" },
    { key: "Returned", label: "Đã trả hàng" },
    { key: "CancelledByBuyer", label: "Khách đã hủy" },
    { key: "CancelledBySeller", label: "Shop đã hủy" },
]

export default function OrderStatusTabs({ activeStatus, onStatusChange }: OrderStatusTabsProps) {
    const scrollRef = useRef<HTMLDivElement>(null)
    const [showLeftArrow, setShowLeftArrow] = useState(false)
    const [showRightArrow, setShowRightArrow] = useState(false)

    const checkScrollButtons = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
            setShowLeftArrow(scrollLeft > 0)
            setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 1)
        }
    }

    useEffect(() => {
        checkScrollButtons()
        const scrollElement = scrollRef.current
        if (scrollElement) {
            scrollElement.addEventListener("scroll", checkScrollButtons)
            return () => scrollElement.removeEventListener("scroll", checkScrollButtons)
        }
    }, [])

    // Handle scrolling left and right
    const scrollLeft = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: -200, behavior: "smooth" })
        }
    }

    const scrollRight = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: 200, behavior: "smooth" })
        }
    }

    return (
        <Card className="mb-6 shadow-sm border border-gray-200 bg-white">
            <CardContent className="p-0 relative">
                {showLeftArrow && (
                    <button
                        onClick={scrollLeft}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md z-10 hover:shadow-lg transition-all duration-200 border border-gray-200"
                        aria-label="Scroll left"
                    >
                        <ChevronLeft className="h-4 w-4 text-gray-600" />
                    </button>
                )}

                <div
                    ref={scrollRef}
                    className="flex overflow-x-auto scrollbar-hide gap-2 p-4"
                    style={{ scrollBehavior: "smooth" }}
                >
                    {statusTabs.map((tab) => {
                        const isActive = activeStatus === tab.key

                        return (
                            <button
                                key={tab.key}
                                onClick={() => onStatusChange(tab.key)}
                                className={`
                  flex-none px-4 py-2.5 text-sm font-medium rounded-full transition-all duration-200 whitespace-nowrap
                  border hover:scale-105
                  ${isActive
                                        ? "bg-orange-500 text-white border-orange-500 shadow-md scale-105"
                                        : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200 hover:border-gray-300"
                                    }
                `}
                            >
                                {tab.label}
                            </button>
                        )
                    })}
                </div>

                {showRightArrow && (
                    <button
                        onClick={scrollRight}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md z-10 hover:shadow-lg transition-all duration-200 border border-gray-200"
                        aria-label="Scroll right"
                    >
                        <ChevronRight className="h-4 w-4 text-gray-600" />
                    </button>
                )}
            </CardContent>
        </Card>
    )
}
