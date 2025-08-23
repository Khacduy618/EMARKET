// Frontend/src/app/admin/reviews/components/review-detail-dialog.tsx
"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Star, Store } from "lucide-react"
import { updateReviewStatus } from '@/services/review';
import { AdminReview, ReviewStatus } from "@/types"
import { toast } from "react-toastify"

export function ReviewDetailDialog({
  open,
  onOpenChange,
  review,
  onUpdate, // The ONLY callback prop we need for updates
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  review?: AdminReview
  onUpdate: (updatedReview: AdminReview) => void // It receives the full updated object
}) {
  if (!review) return null

  const statusColor =
    review.status === "approved"
      ? "bg-green-100 text-green-800"
      : review.status === "rejected"
        ? "bg-red-100 text-red-800"
        : review.status === "under_review"
          ? "bg-amber-100 text-amber-800"
          : review.status === "flagged"
            ? "bg-purple-100 text-purple-800"
            : review.status === "hidden"
              ? "bg-gray-200 text-gray-800"
              : "bg-blue-100 text-blue-800"
const handleUpdate = async (payload: { status: ReviewStatus, resolveRequest?: boolean }) => {
    if (!review) return;
    
    const toastId = toast.loading("Đang cập nhật...");
    try {
        // Gọi API
        const updatedReview = await updateReviewStatus(review.id, payload);

        // Gọi callback để cập nhật state ở component cha
       onUpdate(updatedReview); 
        
        toast.update(toastId, { render: "Cập nhật thành công!", type: "success", isLoading: false, autoClose: 2000 });
        onOpenChange(false); // Đóng dialog sau khi thành công
    } catch (error) {
        toast.update(toastId, { render: "Cập nhật thất bại!", type: "error", isLoading: false, autoClose: 4000 });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Chi tiết đánh giá</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Shop & Product */}
          <div className="flex items-start gap-3">
            <img
              src={review.productImage || "/placeholder.svg?height=80&width=80&query=product"}
              alt={review.productName}
              className="w-16 h-16 rounded object-cover border"
            />
            <div className="flex-1">
              <div className="text-sm text-gray-600">{review.shopName}</div>
              <div className="font-medium">{review.productName}</div>
              <div className="mt-1">
                <Badge className={statusColor} variant="secondary">
                  {review.status === "pending"
                    ? "Chờ duyệt"
                    : review.status === "approved"
                      ? "Đã duyệt"
                      : review.status === "rejected"
                        ? "Từ chối"
                        : review.status === "hidden"
                          ? "Đã ẩn"
                          : review.status === "under_review"
                            ? "Đang xem xét"
                            : "Đã gắn cờ"}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Reviewer */}
          <div className="flex items-start gap-3">
            <Avatar>
              <AvatarImage src={review.reviewerAvatar || "/placeholder.svg?height=40&width=40&query=avatar"} />
              <AvatarFallback>{review.reviewerName?.[0] || "U"}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className="font-medium">{review.reviewerName}</div>
                <div className="text-xs text-gray-500">{review.date}</div>
              </div>
              <div className="flex items-center gap-1 text-orange-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < review.rating ? "fill-orange-500 text-orange-500" : "text-gray-300"}`}
                  />
                ))}
              </div>
              <p className="mt-2 text-sm text-gray-800 leading-relaxed">{review.content}</p>
              {review.images && review.images.length > 0 && (
                <div className="mt-2 flex gap-2 flex-wrap">
                  {review.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img || "/placeholder.svg"}
                      alt={`img-${idx}`}
                      className="w-16 h-16 rounded border object-cover"
                    />
                  ))}
                </div>
              )}
              {review.shopReply && (
            <>
              <Separator />
              <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="text-xs">Phản Hồi Của Shop</Badge>
                  <span className="text-xs text-gray-500">{review.shopReply.date}</span>
                </div>
                <p className="text-gray-800 text-sm ms-2 md:text-base">{review.shopReply.content}</p>
              </div>
            </>
          )}

            </div>
          </div>

          {review.requestFromShop && (
            <>
              <Separator />
              <div className="bg-amber-50 border border-amber-200 rounded p-3">
                <div className="text-sm font-medium text-amber-800">Yêu cầu xem xét từ Shop</div>
                <div className="text-sm text-amber-800/90 mt-1 whitespace-pre-line">
                  {review.requestFromShop.reason || "Không có nội dung"}
                </div>
                <div className="text-xs text-amber-700 mt-1">Gửi lúc: {review.requestFromShop.createdAt}</div>
              </div>
            </>
          )}

         <div className="flex items-center justify-end gap-2 pt-2">
            {/* Nếu có yêu cầu mở từ shop */}
              {review.requestFromShop?.open && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => handleUpdate({ status: review.status, resolveRequest: true })}
                  >
                    Từ chối yêu cầu (Giữ nguyên)
                  </Button>
                  <Button
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                    onClick={() => handleUpdate({ status: 'under_review', resolveRequest: true })}
                  >
                    Đánh dấu đã xem xét
                  </Button>
                </>
              )}

              {/* Các nút duyệt/từ chối chung */}
              <Button 
                  variant="destructive"
                  onClick={() => handleUpdate({ status: 'rejected' })}
              >
                  Từ chối Review
              </Button>
              <Button
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => handleUpdate({ status: 'approved' })}
              >
                  Duyệt Review
              </Button>
              
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Đóng
              </Button>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}