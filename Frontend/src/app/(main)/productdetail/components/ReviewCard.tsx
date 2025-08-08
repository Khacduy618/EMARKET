import React, { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"; // Import
import { Separator } from "@/components/ui/separator"
import { Review, User } from "@/types"
import { toast } from 'react-toastify';
import { Send, Star, ThumbsUp } from 'lucide-react'


interface ReviewCardProps {
  review: Review
  currentUser: User | null;
  onReplySuccess: () => void; 
  // Optionally: userId?: number
}

export function ReviewCard({ review,currentUser ,onReplySuccess}: ReviewCardProps) {
  const [helpful, setHelpful] = useState<number>(review.helpful || 0)
  const [voted, setVoted] = useState<boolean>(false)
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [currentReview, setCurrentReview] = useState(review);
  
  // Logic kiểm tra chủ shop
  // Giả sử review object có shopId và currentUser (nếu là seller) cũng có shopId
  const isShopOwner = currentUser?.Role === 'Seller' && currentUser.shopId === review.shopId;
  console.log("isShopOwner", isShopOwner, currentUser?.Role, currentUser?.shopId, review.shopId);
  const handleHelpfulClick = async () => {
    try {
      // Gọi API cập nhật helpful
      const res = await fetch(`/api/review/${review.id}/helpful`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: voted ? -1 : 1 })
      })
      if (res.ok) {
        setHelpful((h: number) => voted ? h - 1 : h + 1)
        setVoted((v: boolean) => !v)
      }
    } catch {}
  }
  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return toast.error("Vui lòng nhập nội dung.");

    try {
      // Giả sử bạn có API endpoint này ở backend
      const response = await fetch(`/api/reviews/${currentReview.id}/reply`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          // Bạn cần cơ chế để lấy và gửi token xác thực
          // 'Authorization': `Bearer ${your_auth_token}`
        },
        body: JSON.stringify({ reply_content: replyContent }),
      });

      if (!response.ok) throw new Error('Gửi phản hồi thất bại');
      
      const newReply = await response.json(); // Giả sử API trả về phản hồi mới

      // Cập nhật UI
      setCurrentReview(prev => ({ ...prev, shopReply: newReply.data }));

      onReplySuccess(); 

      setIsReplying(false);
      toast.success("Đã gửi phản hồi!");
      
      setReplyContent('');
    } catch (error: any) {
      toast.error(error.message);
    }
  };
  return (
    <Card className="review-card">
      <CardContent className="p-4 md:p-6">
        <div className="space-y-4">
          {/* User Info */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-8 h-8 md:w-10 md:h-10">
                <AvatarImage src={review.avatar || "/placeholder.svg"} />
                <AvatarFallback className="text-xs">{review.user[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm md:text-base">{review.user}</p>
                <p className="text-xs md:text-sm text-gray-500">{review.date}</p>
              </div>
            </div>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-3 h-3 md:w-4 md:h-4`}
                  fill={star <= review.rating ? "#ff6600" : "none"}
                  stroke={star <= review.rating ? "#ff6600" : "#d1d5db"}
                />
              ))}
            </div>
          </div>

          {/* Variant Info */}
          <p className="text-xs md:text-sm text-gray-600">
            Phân loại hàng: {review.variant}
          </p>

          {/* Review Content */}
          <p className="text-gray-800 text-sm md:text-base leading-relaxed">{review.content}</p>

          {/* Review Images */}
          {review.images.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {review.images.map((image, index) => (
                <img
                  key={index}
                  src={image || "/placeholder.svg"}
                  alt={`Review image ${index + 1}`}
                  className="w-16 h-16 md:w-20 md:h-20 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                />
              ))}
            </div>
          )}

          {/* Helpful Button */}
          <div className="flex items-center justify-between pt-2">
           {!!currentUser && ( <Button 
              variant={voted ? "default" : "ghost"} 
              size="sm" 
              className={voted ? "text-white-500 bg-orange-600" : "text-white-600 hover:text-orange-500"}
              onClick={handleHelpfulClick}
            >
              <ThumbsUp className="w-3 h-3 md:w-4 md:h-4 mr-1" />
              <span className="text-xs md:text-sm">Hữu ích ({helpful})</span>
            </Button>) }

            {isShopOwner && !currentReview.shopReply && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsReplying(!isReplying)}
              >
                {isReplying ? 'Hủy' : 'Trả lời'}
              </Button>
            )}
          </div>

          {isReplying && isShopOwner && (
            <form onSubmit={handleReplySubmit} className="pt-2 space-y-2">
              <Textarea 
                placeholder={`Phản hồi đánh giá của ${currentReview.user}...`}
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
              />
              <div className="flex justify-end">
                <Button type="submit" size="sm">
                  <Send className="w-4 h-4 mr-2" />
                  Gửi
                </Button>
              </div>
            </form>
          )}

          {/* Shop Reply */}
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
      </CardContent>
    </Card>
  )
}
