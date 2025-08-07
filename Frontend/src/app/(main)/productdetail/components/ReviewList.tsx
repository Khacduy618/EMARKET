import { Button } from "@/components/ui/button"
import { ReviewCard } from "./ReviewCard"
import { Review } from "@/types"


interface ReviewListProps {
  reviews: Review[]
  showMoreButton?: boolean
  onShowMore?: () => void
}

export function ReviewList({ reviews, showMoreButton, onShowMore }: ReviewListProps) {
  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}
      {showMoreButton && onShowMore && (
        <div className="text-center pt-4">
          <Button variant="outline" className="hover:shopee-border" onClick={onShowMore}>
            Xem Thêm Đánh Giá
          </Button>
        </div>
      )}
    </div>
  )
}
