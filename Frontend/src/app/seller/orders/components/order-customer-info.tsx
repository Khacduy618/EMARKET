import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User } from "lucide-react"

interface OrderCustomerInfoProps {
    user?: {
        fullname: string
        email: string
    }
}

export default function OrderCustomerInfo({ user }: OrderCustomerInfoProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-gray-600" />
                    Người Mua
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">Tên tài khoản:</span>
                        <span className="font-medium text-gray-900">{user?.fullname || "N/A"}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium text-gray-900">{user?.email || "N/A"}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
