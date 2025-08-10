
'use client';

import React, { useState, useEffect, useCallback } from "react";
import axios from 'axios';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { toast } from "react-toastify";
import { getAuthToken, getFullImageUrl } from "@/services/api"; // Giả sử bạn có hàm này
import { User } from "@/types"; // Giả sử bạn có type User
import { CommentTextArea } from "./CommentTextArea";

// --- Định nghĩa Type ---
export interface Comment {
  id: number;
  content: string;
  createdAt: string;
  name: string;
  avatar: string | null;
  userId: number;
  parentId: number | null;
  replies: Comment[];
}

interface CommentsSectionProps {
  productId: number;
  currentUser: User | null;
}

// --- Component con để render bình luận (hỗ trợ đệ quy) ---
interface CommentItemProps {
  comment: Comment;
  productId: number;
  currentUser: User | null;
  onCommentPosted: () => void; // Callback để load lại list
}

function CommentItem({ comment, productId, currentUser, onCommentPosted }: CommentItemProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyHasProfanity, setReplyHasProfanity] = useState(false);

  const handleReplySubmit = async () => {
    if (!replyContent.trim() || !currentUser || replyHasProfanity) return;
    setIsSubmitting(true);
    try {
      const token = getAuthToken(); // Lấy token từ hàm dịch vụ
      await axios.post(
        `http://localhost:8001/api/products/${productId}/comments`,
        {
          content: replyContent,
          parentId: comment.id,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Đã gửi trả lời!");
      setReplyContent("");
      setIsReplying(false);
      onCommentPosted(); // Gọi callback để component cha load lại
    } catch (error) {
      toast.error("Gửi trả lời thất bại. Vui lòng thử lại.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex gap-3">
      <Avatar className="w-10 h-10 flex-shrink-0">
        <AvatarImage src={comment.avatar ? getFullImageUrl(comment.avatar) : undefined} />
        <AvatarFallback>{comment.name?.[0]?.toUpperCase() || "U"}</AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="font-medium text-sm md:text-base">{comment.name}</span>
          <span className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleString('vi-VN')}</span>
        </div>
        <p className="text-gray-800 text-sm md:text-base leading-relaxed">{comment.content}</p>
        <div className="pt-1">
          {currentUser && (
            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-orange-500 px-2" onClick={() => setIsReplying(!isReplying)}>
              {isReplying ? "Hủy" : "Trả lời"}
            </Button>
          )}
        </div>

        {isReplying && (
          <div className="flex gap-3 pt-2">
            <Avatar className="w-8 h-8">
              <AvatarImage src={currentUser?.Avatar ? getFullImageUrl(currentUser.Avatar) : undefined} />
              <AvatarFallback>{currentUser?.FullName?.[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CommentTextArea
                id={`reply-to-${comment.id}`}
                placeholder={`Trả lời ${comment.name}...`}
                value={replyContent}
                onChange={setReplyContent}
                onProfanityChange={setReplyHasProfanity}
                maxLength={500}
              />
              <div className="flex justify-end mt-2">
                <Button
                  onClick={handleReplySubmit}
                  disabled={!replyContent.trim() || isSubmitting || replyHasProfanity}
                  size="sm"
                >
                  {isSubmitting ? "Đang gửi..." : "Gửi"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Render đệ quy các câu trả lời */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4 space-y-4 pl-4 border-l-2 border-gray-200">
            {comment.replies.map(reply => (
              <CommentItem
                key={reply.id}
                comment={reply}
                productId={productId}
                currentUser={currentUser}
                onCommentPosted={onCommentPosted}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


// --- Component chính ---
export function CommentsSection({ productId, currentUser }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newCommentHasProfanity, setNewCommentHasProfanity] = useState(false);

  const fetchComments = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`http://localhost:8001/api/products/${productId}/comments`);
      setComments(response.data);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
      toast.error("Không thể tải danh sách bình luận.");
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmit = async () => {
    if (!newComment.trim() || !currentUser || newCommentHasProfanity) {
      if (!currentUser) toast.warn("Vui lòng đăng nhập để bình luận.");
      if (newCommentHasProfanity) toast.error("Vui lòng loại bỏ từ ngữ không phù hợp.");
      return;
    }
    setIsSubmitting(true);
    try {
      const token = getAuthToken();
      await axios.post(
        `http://localhost:8001/api/products/${productId}/comments`,
        { content: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Đã gửi bình luận!");
      setNewComment("");
      fetchComments(); // Load lại toàn bộ bình luận sau khi gửi thành công
    } catch (error) {
      toast.error("Gửi bình luận thất bại. Vui lòng thử lại.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="review-card">
      <CardContent className="p-4 md:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Bình luận</h3>
          <span className="text-sm text-gray-500">{comments.length} bình luận</span>
        </div>

        {currentUser ? (
          <div className="flex gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={currentUser.Avatar ? getFullImageUrl(currentUser.Avatar) : undefined} />
              <AvatarFallback>{currentUser.FullName?.[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CommentTextArea
                id="new-comment-input"
                placeholder="Viết bình luận của bạn..."
                value={newComment}
                onChange={setNewComment}
                onProfanityChange={setNewCommentHasProfanity}
                maxLength={1000}
              />
              <div className="flex justify-end mt-2">
                <Button
                  onClick={handleSubmit}
                  disabled={!newComment.trim() || isSubmitting || newCommentHasProfanity}
                >
                  {isSubmitting ? "Đang gửi..." : "Gửi bình luận"}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center p-4 border rounded-md bg-gray-50">
            <p className="text-sm text-gray-600">Vui lòng <a href="/login" className="text-orange-500 font-semibold hover:underline">đăng nhập</a> để gửi bình luận.</p>
          </div>
        )}

        <Separator />

        <div className="space-y-4">
          {isLoading ? (
            <p className="text-sm text-gray-500">Đang tải bình luận...</p>
          ) : comments.length > 0 ? (
            comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                productId={productId}
                currentUser={currentUser}
                onCommentPosted={fetchComments} // Truyền hàm fetchComments
              />
            ))
          ) : (
            <p className="text-sm text-gray-500">Chưa có bình luận nào. Hãy là người đầu tiên!</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}