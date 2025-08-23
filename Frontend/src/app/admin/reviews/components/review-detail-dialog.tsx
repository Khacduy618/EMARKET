"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Star, Store } from "lucide-react"

import { AdminReview, ReviewStatus } from "@/types"
import { toast } from "react-toastify"
import axios from 'axios' // <-- Thêm axios để gọi API
import { API_URL } from "@/lib/config"

// ▼▼▼ TẠO HÀM GỌI API NGAY TẠI ĐÂY (hoặc trong file services/api.ts) ▼▼▼
const updateReviewStatus = async (reviewId: number, payload: { status: ReviewStatus, resolveRequest?: boolean }): Promise<AdminReview> => {
    try {
        const response = await axios.put(
            `${API_URL}/admin/reviews/${reviewId}`,
            payload,
            { withCredentials: true }
        );
        return response.data.data; // Trả về review đã được cập nhật từ API
    } catch (error) {
        // Ném lỗi để component cha có thể bắt và xử lý
        console.error("Lỗi khi cập nhật trạng thái review:", error);
        throw error;
    }
};

export function ReviewDetailDialog({
  open,
  onOpenChange,
  review,
  onUpdate,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  review?: AdminReview
  onUpdate: (updatedReview: AdminReview) => void
}) {
  if (!review) return null

  // Màu sắc cho badge trạng thái
  const statusColor =
    review.status === "approved" ? "bg-green-100 text-green-800"
    : review.status === "rejected" ? "bg-red-100 text-red-800"
    : review.status === "under_review" ? "bg-amber-100 text-amber-800"
    : review.status === "flagged" ? "bg-purple-100 text-purple-800"
    : review.status === "hidden" ? "bg-gray-200 text-gray-800"
    : "bg-blue-100 text-blue-800";

  // Hàm xử lý khi nhấn nút cập nhật
  const handleUpdate = async (payload: { status: ReviewStatus, resolveRequest?: boolean }) => {
    if (!review) return;
    
    const toastId = toast.loading("Đang cập nhật...");
    try {
        // Gọi API và nhận về review đã được cập nhật
        const updatedReviewData = await updateReviewStatus(review.id, payload);

        // Gọi callback để cập nhật state ở component cha
        onUpdate(updatedReviewData); 
        
        toast.update(toastId, { render: "Cập nhật thành công!", type: "success", isLoading: false, autoClose: 2000 });
        onOpenChange(false); // Đóng dialog
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
          <div className="flex items-start gap-3">
            <img src={review.productImage || "/placeholder.svg"} alt={review.productName} className="w-16 h-16 rounded object-cover border"/>
            <div className="flex-1">
              <div className="text-sm text-gray-600">{review.shopName}</div>
              <div className="font-medium">{review.productName}</div>
              <div className="mt-1">
                <Badge className={statusColor} variant="secondary">
                  {review.status === "pending" ? "Chờ duyệt" : review.status === "approved" ? "Đã duyệt" : review.status === "rejected" ? "Từ chối" : review.status === "hidden" ? "Đã ẩn" : review.status === "under_review" ? "Đang xem xét" : "Đã gắn cờ"}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex items-start gap-3">
            <Avatar><AvatarImage src={review.reviewerAvatar || undefined} /><AvatarFallback>{review.reviewerName?.[0] || "U"}</AvatarFallback></Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className="font-medium">{review.reviewerName}</div>
                <div className="text-xs text-gray-500">{review.date}</div>
              </div>
              <div className="flex items-center gap-1 text-orange-500">
                {Array.from({ length: 5 }).map((_, i) => (<Star key={i} className={`w-4 h-4 ${i < review.rating ? "fill-orange-500" : "text-gray-300"}`}/>))}
              </div>
              <p className="mt-2 text-sm text-gray-800 leading-relaxed">{review.content}</p>
              {review.images && review.images.length > 0 && (
                <div className="mt-2 flex gap-2 flex-wrap">
                  {review.images.map((img, idx) => (<img key={idx} src={img || "/placeholder.svg"} alt={`img-${idx}`} className="w-16 h-16 rounded border object-cover"/>))}
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

          {review.requestFromShop?.open && (
            <>
              <Separator />
              <div className="bg-amber-50 border border-amber-200 rounded p-3">
                <div className="text-sm font-medium text-amber-800">Yêu cầu xem xét từ Shop</div>
                <div className="text-sm text-amber-800/90 mt-1 whitespace-pre-line">{review.requestFromShop.reason || "Không có nội dung"}</div>
                <div className="text-xs text-amber-700 mt-1">Gửi lúc: {review.requestFromShop.createdAt}</div>
              </div>
            </>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
              {review.requestFromShop?.open && (
                <>
                  <Button variant="outline" onClick={() => handleUpdate({ status: review.status, resolveRequest: true })}>Từ chối yêu cầu</Button>
                  <Button className="bg-orange-500 hover:bg-orange-600 text-white" onClick={() => handleUpdate({ status: 'under_review', resolveRequest: true })}>Đánh dấu đã xem xét</Button>
                </>
              )}
              <Button variant="destructive" onClick={() => handleUpdate({ status: 'rejected' })}>Từ chối Review</Button>
              <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleUpdate({ status: 'approved' })}>Duyệt Review</Button>
              <Button variant="outline" onClick={() => onOpenChange(false)}>Đóng</Button>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}