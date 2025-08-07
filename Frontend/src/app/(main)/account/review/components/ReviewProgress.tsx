import { Progress } from "@/components/ui/progress"

interface ReviewProgressProps {
  completed: number
  total: number
  percentage: number
}

export function ReviewProgress({ completed, total, percentage }: ReviewProgressProps) {
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-gray-600">Tiến độ đánh giá</span>
        <span className="text-sm font-medium text-gray-900">{completed}/{total} sản phẩm</span>
      </div>
      <Progress value={percentage} className="h-2" />
      <div className="mt-2 text-xs text-gray-500">
        {completed === total ? (
          <span className="text-green-600 font-medium">✓ Đã hoàn thành tất cả đánh giá</span>
        ) : (
          <span>Còn lại {total - completed} sản phẩm chưa đánh giá</span>
        )}
      </div>
    </div>
  )
}
