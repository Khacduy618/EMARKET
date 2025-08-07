import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Star } from 'lucide-react'
import { RatingStats } from "@/types"

interface RatingOverviewProps {
  ratingStats: RatingStats
}

export function RatingOverview({ ratingStats }: RatingOverviewProps) {
  return (
    <Card className="review-card">
      <CardContent className="p-4 md:p-6">
        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {/* Average Rating */}
          <div className="text-center space-y-4">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-orange-500 mb-2">
                {ratingStats.average}
              </div>
              <div className="flex justify-center mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 md:w-6 md:h-6 ${
                      star <= Math.floor(ratingStats.average)
                        ? "star-filled"
                        : "star-empty"
                    }`}
                  />
                ))}
              </div>
              <p className="text-gray-600 text-sm md:text-base">{ratingStats.total} đánh giá</p>
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-10 md:w-12 flex-shrink-0">
                  <span className="text-sm">{rating}</span>
                  <Star className="w-3 h-3 star-filled" />
                </div>
                <Progress 
                  value={ratingStats.distribution[rating]} 
                  className="flex-1 h-2"
                />
                <span className="text-sm text-gray-600 w-10 md:w-12 text-right">
                  {ratingStats.distribution[rating]}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
