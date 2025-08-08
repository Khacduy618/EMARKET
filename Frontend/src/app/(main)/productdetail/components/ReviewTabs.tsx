import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RatingOverview } from "./RatingOverview"
import { ReviewFilters } from "./ReviewFilters"
import { ReviewList } from "./ReviewList"
import { CommentsSection } from "./CommentsSection"
import { RatingStats, Review, User } from "@/types"



interface ReviewTabsProps {
  ratingStats: RatingStats
  reviews: Review[]
  selectedFilter: string
  onFilterChange: (filter: string) => void
  descriptionSlot?: React.ReactNode
  showMoreButton?: boolean
  onShowMore?: () => void
  currentUser: User | null; 
  onReviewActionSuccess: () => void; 
}

export function ReviewTabs({ ratingStats, reviews,currentUser, onReviewActionSuccess, selectedFilter, onFilterChange, descriptionSlot, showMoreButton, onShowMore }: ReviewTabsProps) {
  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      <Tabs defaultValue="reviews" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-white">
          <TabsTrigger value="description" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
            Mô Tả Sản Phẩm
          </TabsTrigger>
          <TabsTrigger value="reviews" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
            Đánh Giá ({ratingStats.total})
          </TabsTrigger>
          <TabsTrigger value="qa" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
            Bình luận
          </TabsTrigger>
        </TabsList>

        <TabsContent value="description" className="space-y-6">
          {descriptionSlot}
        </TabsContent>

        <TabsContent value="reviews" className="space-y-6">
          <RatingOverview ratingStats={ratingStats} />
          <ReviewFilters 
            selectedFilter={selectedFilter} 
            onFilterChange={onFilterChange} 
          />
          <ReviewList reviews={reviews} showMoreButton={showMoreButton} onShowMore={onShowMore}  currentUser={currentUser} // <-- Truyền xuống
        onReviewActionSuccess={onReviewActionSuccess}  />
        </TabsContent>

        <TabsContent value="qa">
          <CommentsSection />
        </TabsContent>
      </Tabs>
    </div>
  )
}
