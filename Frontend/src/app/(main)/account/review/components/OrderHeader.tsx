import { Button } from "@/components/ui/button"
import { ArrowLeft, Package, Calendar, Truck, DollarSign } from 'lucide-react'

export interface OrderInfo {
  id: string
  date: string
  status: string
  total: string
}
interface OrderHeaderProps {
  orderInfo: OrderInfo
}

export function OrderHeader({ orderInfo }: OrderHeaderProps) {
  return (
    <div className="">
      <div className="max-w-6xl">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="icon" className="hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-semibold text-gray-900">Đánh Giá Đơn Hàng</h1>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center justify-center gap-2">
              <Package className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-gray-500 text-xs">Mã đơn hàng</p>
                <p className="font-medium text-gray-900 truncate">{orderInfo.id}</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-gray-500 text-xs">Ngày đặt</p>
                <p className="font-medium text-gray-900">{orderInfo.date}</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Truck className="w-4 h-4 text-green-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-gray-500 text-xs">Trạng thái</p>
                <p className="font-medium text-green-600">{
                  orderInfo.status === 'Completed' ? 'ĐÃ HOÀN THÀNH' :
                orderInfo.status === 'Shipped' ? 'ĐANG GIAO HÀNG' :
                  orderInfo.status === 'Delivered' ? 'ĐÃ GIAO HÀNG' :
                    orderInfo.status === 'Pending' ? 'CHỜ XÁC NHẬN' :
                      orderInfo.status === 'Processing' ? 'ĐANG XỬ LÝ' :
                        orderInfo.status === 'CancelledByBuyer' || orderInfo.status === 'CancelledBySeller' ? 'ĐÃ HỦY' :
                          orderInfo.status === 'Returned' || orderInfo.status === 'ReturnInProgress' ? 'TRẢ HÀNG' :
                            orderInfo.status}</p>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-orange-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-gray-500 text-xs">Tổng tiền</p>
                <p className="font-medium text-orange-500">{orderInfo.total}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
