import { Button } from "@/components/ui/button"
import { Send } from 'lucide-react'

interface SubmitSectionProps {
  completedCount: number
  totalCount: number
  isSubmitting: boolean
  onSubmit: () => void
}

export function SubmitSection({ completedCount, totalCount, isSubmitting, onSubmit }: SubmitSectionProps) {
  const isComplete = completedCount === totalCount
  
  return (
    <div className="sticky bottom-0 bg-white border-t shadow-lg rounded-t-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm text-gray-600">
          Đã hoàn thành: <span className="font-medium text-green-600">{completedCount}/{totalCount}</span> sản phẩm
        </div>
        <div className="text-sm text-gray-600">
          Còn lại: <span className="font-medium text-orange-500">{totalCount - completedCount}</span> sản phẩm
        </div>
      </div>
      <Button
        onClick={onSubmit}
        disabled={isSubmitting || !isComplete}
        className="shopee-orange w-full disabled:bg-gray-300 disabled:text-gray-500"
        size="lg"
      >
        {isSubmitting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Đang gửi đánh giá...
          </>
        ) : (
          <>
            <Send className="w-4 h-4 mr-2" />
            Gửi Tất Cả Đánh Giá ({totalCount})
          </>
        )}
      </Button>
      {!isComplete && (
        <p className="text-xs text-gray-500 text-center mt-2">
          Vui lòng hoàn thành đánh giá cho tất cả sản phẩm
        </p>
      )}
    </div>
  )
}
