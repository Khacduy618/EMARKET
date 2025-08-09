import { Label } from "@/components/ui/label"
import { Star } from 'lucide-react'

interface StarRatingProps {
  rating: number
  hoverRating: number
  onRatingChange: (rating: number) => void
  onHoverChange: (rating: number) => void
}

export function StarRating({ rating, hoverRating, onRatingChange, onHoverChange }: StarRatingProps) {
  const getRatingText = (stars: number) => {
    switch (stars) {
      case 1: return "Rất không hài lòng"
      case 2: return "Không hài lòng"
      case 3: return "Bình thường"
      case 4: return "Hài lòng"
      case 5: return "Rất hài lòng"
      default: return "Chọn đánh giá"
    }
  }

  return (
    <div>
      <Label className="text-base font-medium mb-3 block">Chất lượng sản phẩm</Label>
      <div className="text-center space-y-3">
        <div className="flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              className="transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 rounded"
              onMouseEnter={() => onHoverChange(star)}
              onMouseLeave={() => onHoverChange(0)}
              onClick={() => onRatingChange(star)}
              aria-label={`Đánh giá ${star} sao`}
            >
              <Star
                className={`w-8 h-8 transition-colors duration-200 ${
                  star <= (hoverRating || rating)
                    ? "fill-orange-500 text-orange-500"
                    : "text-gray-300 hover:text-orange-300"
                }`}
              />
            </button>
          ))}
        </div>
        <p className="text-sm font-medium text-orange-500 min-h-[20px]">
          {getRatingText(hoverRating || rating)}
        </p>
      </div>
    </div>
  )
}
