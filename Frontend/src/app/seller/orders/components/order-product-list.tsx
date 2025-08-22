import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { WEB_URL } from "@/lib/config"
import { Package } from "lucide-react"

interface OrderItem {
    orderItemId: number
    quantity: number
    priceAtPurchase: number
    subtotal: number
    isFlashSaleItem: boolean
    variant?: {
        variantId: number
        sku: string
        imageUrl: string | null
        product?: {
            productId: number
            name: string
        }
    }
}

interface OrderProductListProps {
    orderItems: OrderItem[]
    formatCurrency: (amount: number) => string
}

export default function OrderProductList({ orderItems, formatCurrency }: OrderProductListProps) {
    
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-gray-600" />
                    Sản Phẩm Của Shop
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="divide-y divide-gray-200">
                    {orderItems?.map((item) => (
                        <div key={item.orderItemId} className="p-6">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-shrink-0">
                                    <img
                                        src={
                                            item.variant?.imageUrl
                                                ? `${WEB_URL}/storage/${item.variant.imageUrl}`
                                                : "/placeholder.svg?height=80&width=80&query=product"
                                        }
                                        alt={item.variant?.product?.name || "Sản phẩm"}
                                        className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900 mb-1">
                                                {item.variant?.product?.name || "Tên sản phẩm"}
                                            </h3>
                                            <p className="text-sm text-gray-500">SKU: {item.variant?.sku}</p>
                                            {item.isFlashSaleItem && (
                                                <span className="inline-block mt-1 px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                                                    Flash Sale
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex flex-col sm:items-end gap-1">
                                            <div className="text-sm text-gray-600">
                                                {formatCurrency(item.priceAtPurchase)} × {item.quantity}
                                            </div>
                                            <div className="font-semibold text-lg text-gray-900">{formatCurrency(item.subtotal)}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
