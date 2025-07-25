import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Truck } from "lucide-react"

interface OrderShippingInfoProps {
    shippingFullName: string
    shippingPhoneNumber: string
    fullAddress: string
    notes: string | null
}

export default function OrderShippingInfo({
    shippingFullName,
    shippingPhoneNumber,
    fullAddress,
    notes,
}: OrderShippingInfoProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5 text-gray-600" />
                    Thông Tin Vận Chuyển
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    <div>
                        <p className="font-semibold text-gray-900">{shippingFullName}</p>
                    </div>
                    <div>
                        <p className="text-gray-700">{shippingPhoneNumber}</p>
                    </div>
                    <div>
                        <p className="text-gray-700 leading-relaxed">{fullAddress}</p>
                    </div>
                    {notes && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <p className="text-sm text-gray-600 mb-1">Ghi chú:</p>
                            <p className="text-gray-700 italic bg-gray-50 p-3 rounded-lg">{notes}</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
