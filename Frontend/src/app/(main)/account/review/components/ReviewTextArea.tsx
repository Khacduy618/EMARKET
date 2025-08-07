import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface ReviewTextAreaProps {
  value: string
  onChange: (value: string) => void
  productId: string
}

export function ReviewTextArea({ value, onChange, productId }: ReviewTextAreaProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={`review-${productId}`}>Nội dung đánh giá *</Label>
      <Textarea
        id={`review-${productId}`}
        placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[100px] resize-none focus:ring-orange-500 focus:border-orange-500"
        maxLength={500}
      />
      <div className="text-right text-sm text-gray-500">
        <span className={value.length > 450 ? 'text-orange-500' : ''}>
          {value.length}/500
        </span>
      </div>
    </div>
  )
}
