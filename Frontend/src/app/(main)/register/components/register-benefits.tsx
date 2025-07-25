import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Users, Shield, Headphones, Truck, CreditCard, BarChart3, Gift } from "lucide-react"

const benefits = [
    {
        icon: TrendingUp,
        title: "Tăng trưởng doanh số",
        description: "Tiếp cận hàng triệu khách hàng tiềm năng trên toàn quốc",
    },
    {
        icon: Users,
        title: "Cộng đồng lớn mạnh",
        description: "Tham gia cộng đồng hơn 2 triệu người bán tại Việt Nam",
    },
    {
        icon: Shield,
        title: "Bảo vệ toàn diện",
        description: "Chính sách bảo vệ người bán và hỗ trợ giải quyết tranh chấp",
    },
    {
        icon: Headphones,
        title: "Hỗ trợ 24/7",
        description: "Đội ngũ chăm sóc khách hàng chuyên nghiệp luôn sẵn sàng hỗ trợ",
    },
    {
        icon: Truck,
        title: "Vận chuyển đa dạng",
        description: "Kết nối với nhiều đơn vị vận chuyển uy tín",
    },
    {
        icon: CreditCard,
        title: "Thanh toán linh hoạt",
        description: "Hỗ trợ nhiều phương thức thanh toán an toàn",
    },
    {
        icon: BarChart3,
        title: "Công cụ phân tích",
        description: "Báo cáo chi tiết giúp tối ưu hóa kinh doanh",
    },
    {
        icon: Gift,
        title: "Ưu đãi đặc biệt",
        description: "Chương trình khuyến mãi và hỗ trợ cho người bán mới",
    },
]

export default function SellerRegisterBenefits() {
    return (
        <div className="space-y-6">
            <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-red-50">
                <CardHeader>
                    <CardTitle className="text-xl font-bold text-gray-900 text-center">Tại sao chọn Shopee?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {benefits.map((benefit, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm">
                            <div className="bg-orange-100 p-2 rounded-full flex-shrink-0">
                                <benefit.icon className="h-5 w-5 text-orange-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-1">{benefit.title}</h3>
                                <p className="text-sm text-gray-600">{benefit.description}</p>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
                <CardContent className="p-6 text-center">
                    <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Headphones className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 mb-2">Cần hỗ trợ?</h3>
                    <p className="text-gray-600 mb-4">Liên hệ với đội ngũ hỗ trợ của chúng tôi để được tư vấn miễn phí</p>
                    <div className="space-y-2 text-sm">
                        <p className="text-blue-600 font-semibold">📞 Hotline: 1900-1234</p>
                        <p className="text-blue-600 font-semibold">📧 Email: support@shopee.vn</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
