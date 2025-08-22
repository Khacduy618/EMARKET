import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CreditCard } from "lucide-react"

interface OrderPaymentDetailsProps {
    order: {
        shopSubtotal: number
        shippingFee: number
        ShopVoucherDiscount: number
        totalAmount: number
        paymentMethod: string
        paymentStatus: string
    }
    formatCurrency: (amount: number) => string
}

export default function OrderPaymentDetails({ order, formatCurrency }: OrderPaymentDetailsProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-gray-600" />
                    Chi Tiết Thanh Toán
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600">Tổng tiền hàng của shop:</span>
                        <span className="font-medium">{formatCurrency(order.shopSubtotal)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600">Phí vận chuyển (toàn đơn):</span>
                        <span className="font-medium">{formatCurrency(order.shippingFee)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600">Giảm giá của shop:</span>
                        <span className="font-medium text-green-600">-{formatCurrency(order.ShopVoucherDiscount)}</span>
                    </div>
                    <div className="border-t border-gray-200 my-4"></div>
                    <div className="flex justify-between items-center py-2">
                        <span className="font-bold text-gray-900 text-lg">Tổng Thanh Toán Của Khách:</span>
                        <span className="font-bold text-xl text-orange-600">{formatCurrency(order.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 mt-4 pt-4 border-t border-gray-100">
                        <span className="text-gray-600">Phương thức thanh toán:</span>
                        <span className="font-medium text-blue-600">
                            {order.paymentMethod} ({order.paymentStatus})
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
