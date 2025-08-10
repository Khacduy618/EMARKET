import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { StarRating } from "./StarRating"
import { ReviewTextArea } from "./ReviewTextArea"
import { MediaUpload } from "./MediaUpload"
import { getFullImageUrl } from "@/services/api"
export interface ProductReview {
  rating: number
  reviewText: string
  images: (string | File)[]
  videos: (string | File)[]
}

export interface Product {
  id: string
  name: string
  image: string
  price: string
  variant: string
  quantity: number
}

interface ProductReviewCardProps {
  product: Product
  review: ProductReview
  hoverRating: number
  isLast: boolean
  onUpdateReview: (productId: string, field: keyof ProductReview, value: any) => void
  onSetHoverRating: (rating: number) => void
  onUpdateProfanityStatus: (productId: string, isProfane: boolean) => void
}

export function ProductReviewCard({
  product,
  review,
  hoverRating,
  isLast,
  onUpdateReview,
  onSetHoverRating,
  onUpdateProfanityStatus
}: ProductReviewCardProps) {
  const isCompleted = review.rating > 0 && (typeof review.reviewText === 'string' ? review.reviewText.trim().length : 0) > 0

  return (
    <Card className={`transition-all duration-200 ${isCompleted ? 'review-card-completed' : 'hover:shadow-md'}`}>
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          <img
            src={getFullImageUrl(product.image) || "/placeholder.svg"}
            alt={product.name}
            className="w-16 h-16 object-cover rounded-lg border flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">{product.name}</h3>
                <p className="text-orange-500 font-semibold mb-1">{product.price}</p>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Badge variant="outline" className="text-xs">
                    {product.variant}
                  </Badge>
                  <span>x{product.quantity}</span>
                </div>
              </div>
              {isCompleted && (
                <Badge className="bg-green-500 hover:bg-green-600 flex-shrink-0">
                  Đã đánh giá
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <StarRating
          rating={review.rating}
          hoverRating={hoverRating}
          onRatingChange={(rating) => onUpdateReview(product.id, 'rating', rating)}
          onHoverChange={onSetHoverRating}
        />

        <ReviewTextArea
          value={review.reviewText}
          onChange={(text) => onUpdateReview(product.id, 'reviewText', text)}
          productId={product.id}
           onProfanityChange={(isProfane) => onUpdateProfanityStatus(product.id, isProfane)}
        />

        <MediaUpload
          productId={product.id}
          images={review.images}
          videos={review.videos}
          onImagesChange={(images) => onUpdateReview(product.id, 'images', images)}
          onVideosChange={(videos) => onUpdateReview(product.id, 'videos', videos)}
        />

        {!isLast && <Separator className="mt-6" />}
      </CardContent>
    </Card>
  )
}
