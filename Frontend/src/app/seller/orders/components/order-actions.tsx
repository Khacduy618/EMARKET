"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Settings, Printer, X } from "lucide-react"

interface OrderActionsProps {
    status: string
}

export default function OrderActions({ status }: OrderActionsProps) {
    const handleConfirmOrder = () => {
        // Handle order confirmation logic
        console.log("Confirming order...")
    }

    const handlePrintShipping = () => {
        // Handle print shipping label logic
        console.log("Printing shipping label...")
    }

    const handleCancelOrder = () => {
        // Handle order cancellation logic
        console.log("Cancelling order...")
    }

    const canConfirm = status === "Pending"
    const canCancel = ["Pending", "Processing"].includes(status)

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-gray-600" />
                    Thao Tác
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {canConfirm && (
                        <Button onClick={handleConfirmOrder} className="w-full bg-orange-500 hover:bg-orange-600">
                            Xác Nhận & Chuẩn Bị Hàng
                        </Button>
                    )}
                    <Button onClick={handlePrintShipping} variant="outline" className="w-full bg-transparent">
                        <Printer className="mr-2 h-4 w-4" />
                        In Phiếu Giao
                    </Button>
                    {canCancel && (
                        <Button
                            onClick={handleCancelOrder}
                            variant="outline"
                            className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent"
                        >
                            <X className="mr-2 h-4 w-4" />
                            Hủy Đơn Hàng
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
