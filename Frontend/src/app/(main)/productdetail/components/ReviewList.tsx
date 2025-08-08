'use client';
import { Button } from "@/components/ui/button"
import { ReviewCard } from "./ReviewCard"
import { Review, User } from "@/types"
import { useAuth } from "@/hooks/useAuth";


interface ReviewListProps {
  reviews: Review[]
  showMoreButton?: boolean
  onShowMore?: () => void
  currentUser: User | null; 
  onReviewActionSuccess: () => void;
}

export function ReviewList({ reviews, showMoreButton,currentUser, onReviewActionSuccess, onShowMore }: ReviewListProps) {
  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} currentUser={currentUser} 
          onReplySuccess={onReviewActionSuccess} />
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
