import { Store, TrendingUp } from "lucide-react"

export default function SellerRegisterHeader() {
    return (
        <div className="text-center mb-8">
            <div className="flex justify-center items-center gap-3 mb-4">
                <div className="bg-orange-500 p-3 rounded-full">
                    <Store className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-4xl font-bold text-gray-900">Trở thành Người bán Shopee</h1>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Tham gia cộng đồng hàng triệu người bán và bắt đầu kinh doanh online cùng Shopee ngay hôm nay
            </p>
            <div className="flex justify-center items-center gap-6 mt-6">
                <div className="flex items-center gap-2 text-orange-600">
                    <TrendingUp className="h-5 w-5" />
                    <span className="font-semibold">Miễn phí đăng ký</span>
                </div>
                <div className="flex items-center gap-2 text-orange-600">
                    <TrendingUp className="h-5 w-5" />
                    <span className="font-semibold">Hỗ trợ 24/7</span>
                </div>
                <div className="flex items-center gap-2 text-orange-600">
                    <TrendingUp className="h-5 w-5" />
                    <span className="font-semibold">Công cụ bán hàng</span>
                </div>
            </div>
        </div>
    )
}
