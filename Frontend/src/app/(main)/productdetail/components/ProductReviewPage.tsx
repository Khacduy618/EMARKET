"use client"

import { useEffect, useState } from "react"
import { ReviewTabs } from "./ReviewTabs"
import ProductDescription from "./ProductDescription"
import axios from "axios"
import { RatingStats, Review } from "@/types"

interface ProductReviewPageProps {
  productId: number;
}

export default function ProductReviewPage({ productId }: ProductReviewPageProps) {
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [reviews, setReviews] = useState<Review[]>([])
  const [ratingStats, setRatingStats] = useState<RatingStats>({ average: 0, total: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchReviews() {
      setLoading(true)
      setError(null)
      try {
        // Thay đổi endpoint cho phù hợp với API của bạn
        const res = await axios.get(`/api/product/${productId}/reviews`)
        setReviews(res.data.reviews)
        setRatingStats(res.data.ratingStats)
      } catch (err: any) {
        setError("Không thể tải đánh giá sản phẩm.")
      } finally {
        setLoading(false)
      }
    }
    fetchReviews()
  }, [productId])

  const filteredReviews = reviews.filter(review => {
    if (selectedFilter === "all") return true
    if (selectedFilter === "photos") return review.images && review.images.length > 0
    return review.rating === parseInt(selectedFilter)
  })

  const [showAll, setShowAll] = useState(false)
  const reviewsLimited = showAll ? filteredReviews : filteredReviews.slice(0, 10)

  if (loading) return <div className="p-8 text-center">Đang tải đánh giá...</div>
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      <div className="flex-1">
        <ReviewTabs 
          ratingStats={ratingStats}
          reviews={reviewsLimited}
          selectedFilter={selectedFilter}
          onFilterChange={setSelectedFilter}
          descriptionSlot={<ProductDescription productId={productId} />}
          showMoreButton={!showAll && filteredReviews.length > 10}
          onShowMore={() => setShowAll(true)}
        />
      </div>
    </div>
  )
}

