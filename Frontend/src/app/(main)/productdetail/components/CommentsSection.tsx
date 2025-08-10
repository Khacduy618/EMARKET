
// 'use client';

// import React, { useState, useEffect, useCallback } from "react";
// import axios from 'axios';
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Separator } from "@/components/ui/separator";
// import { toast } from "react-toastify";
// import { getAuthToken, getFullImageUrl } from "@/services/api"; // Giả sử bạn có hàm này
// import { User } from "@/types"; // Giả sử bạn có type User
// import { CommentTextArea } from "./CommentTextArea";

// // --- Định nghĩa Type ---
// export interface Comment {
//   id: number;
//   content: string;
//   createdAt: string;
//   name: string;
//   avatar: string | null;
//   userId: number;
//   parentId: number | null;
//   replies: Comment[];
// }

// interface CommentsSectionProps {
//   productId: number;
//   currentUser: User | null;
// }

// // --- Component con để render bình luận (hỗ trợ đệ quy) ---
// interface CommentItemProps {
//   comment: Comment;
//   productId: number;
//   currentUser: User | null;
//   onCommentPosted: () => void; // Callback để load lại list
// }

// function CommentItem({ comment, productId, currentUser, onCommentPosted }: CommentItemProps) {
//   const [isReplying, setIsReplying] = useState(false);
//   const [replyContent, setReplyContent] = useState("");
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [replyHasProfanity, setReplyHasProfanity] = useState(false);

//   const handleReplySubmit = async () => {
//     if (!replyContent.trim() || !currentUser || replyHasProfanity) return; 
//     setIsSubmitting(true);
//     try {
//       const token = getAuthToken(); // Lấy token từ hàm dịch vụ
//       await axios.post(
//         `http://localhost/api/products/${productId}/comments`,
//         {
//           content: replyContent,
//           parentId: comment.id,
//         },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       toast.success("Đã gửi trả lời!");
//       setReplyContent("");
//       setIsReplying(false);
//       onCommentPosted(); // Gọi callback để component cha load lại
//     } catch (error) {
//       toast.error("Gửi trả lời thất bại. Vui lòng thử lại.");
//       console.error(error);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="flex gap-3">
//       <Avatar className="w-10 h-10 flex-shrink-0">
//         <AvatarImage src={comment.avatar ? getFullImageUrl(comment.avatar) : undefined} />
//         <AvatarFallback>{comment.name?.[0]?.toUpperCase() || "U"}</AvatarFallback>
//       </Avatar>
//       <div className="flex-1 space-y-1">
//         <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
//           <span className="font-medium text-sm md:text-base">{comment.name}</span>
//           <span className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleString('vi-VN')}</span>
//         </div>
//         <p className="text-gray-800 text-sm md:text-base leading-relaxed">{comment.content}</p>
//         <div className="pt-1">
//           {currentUser && (
//             <Button variant="ghost" size="sm" className="text-gray-600 hover:text-orange-500 px-2" onClick={() => setIsReplying(!isReplying)}>
//               {isReplying ? "Hủy" : "Trả lời"}
//             </Button>
//           )}
//         </div>
        
//         {isReplying && (
//           <div className="flex gap-3 pt-2">
//             <Avatar className="w-8 h-8">
//               <AvatarImage src={currentUser?.Avatar ? getFullImageUrl(currentUser.Avatar) : undefined} />
//               <AvatarFallback>{currentUser?.FullName?.[0]?.toUpperCase()}</AvatarFallback>
//             </Avatar>
//             <div className="flex-1">
//                   <CommentTextArea
//                       id={`reply-to-${comment.id}`}
//                       placeholder={`Trả lời ${comment.name}...`}
//                       value={replyContent}
//                       onChange={setReplyContent}
//                       onProfanityChange={setReplyHasProfanity}
//                       maxLength={500}
//                   />
//                   <div className="flex justify-end mt-2">
//                       <Button 
//                           onClick={handleReplySubmit} 
//                           disabled={!replyContent.trim() || isSubmitting || replyHasProfanity} 
//                           size="sm"
//                       >
//                       {isSubmitting ? "Đang gửi..." : "Gửi"}
//                       </Button>
//                   </div>
//               </div>
//           </div>
//         )}

//         {/* Render đệ quy các câu trả lời */}
//         {comment.replies && comment.replies.length > 0 && (
//           <div className="mt-4 space-y-4 pl-4 border-l-2 border-gray-200">
//             {comment.replies.map(reply => (
//               <CommentItem 
//                 key={reply.id} 
//                 comment={reply} 
//                 productId={productId} 
//                 currentUser={currentUser}
//                 onCommentPosted={onCommentPosted}
//               />
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }


// // --- Component chính ---
// export function CommentsSection({ productId, currentUser }: CommentsSectionProps) {
//   const [comments, setComments] = useState<Comment[]>([]);
//   const [newComment, setNewComment] = useState("");
//   const [isLoading, setIsLoading] = useState(true);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [newCommentHasProfanity, setNewCommentHasProfanity] = useState(false);

//   const fetchComments = useCallback(async () => {
//     setIsLoading(true);
//     try {
//       const response = await axios.get(`http://localhost/api/products/${productId}/comments`);
//       setComments(response.data);
//     } catch (error) {
//       console.error("Failed to fetch comments:", error);
//       toast.error("Không thể tải danh sách bình luận.");
//     } finally {
//       setIsLoading(false);
//     }
//   }, [productId]);

//   useEffect(() => {
//     fetchComments();
//   }, [fetchComments]);

//   const handleSubmit = async () => {
//     if (!newComment.trim() || !currentUser || newCommentHasProfanity) {
//         if (!currentUser) toast.warn("Vui lòng đăng nhập để bình luận.");
//         if (newCommentHasProfanity) toast.error("Vui lòng loại bỏ từ ngữ không phù hợp.");
//         return;
//     }
//     setIsSubmitting(true);
//     try {
//       const token = getAuthToken(); 
//       await axios.post(
//         `http://localhost/api/products/${productId}/comments`,
//         { content: newComment },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       toast.success("Đã gửi bình luận!");
//       setNewComment("");
//       fetchComments(); // Load lại toàn bộ bình luận sau khi gửi thành công
//     } catch (error) {
//       toast.error("Gửi bình luận thất bại. Vui lòng thử lại.");
//       console.error(error);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <Card className="review-card">
//       <CardContent className="p-4 md:p-6 space-y-6">
//         <div className="flex items-center justify-between">
//           <h3 className="text-lg font-semibold">Bình luận</h3>
//           <span className="text-sm text-gray-500">{comments.length} bình luận</span>
//         </div>

//         {currentUser ? (
//           <div className="flex gap-3">
//             <Avatar className="w-10 h-10">
//               <AvatarImage src={currentUser.Avatar ? getFullImageUrl(currentUser.Avatar) : undefined} />
//               <AvatarFallback>{currentUser.FullName?.[0]?.toUpperCase()}</AvatarFallback>
//             </Avatar>
//              <div className="flex-1">
//                 <CommentTextArea
//                     id="new-comment-input"
//                     placeholder="Viết bình luận của bạn..."
//                     value={newComment}
//                     onChange={setNewComment}
//                     onProfanityChange={setNewCommentHasProfanity}
//                     maxLength={1000}
//                 />
//                 <div className="flex justify-end mt-2">
//                     <Button
//                         onClick={handleSubmit}
//                         disabled={!newComment.trim() || isSubmitting || newCommentHasProfanity}
//                     >
//                         {isSubmitting ? "Đang gửi..." : "Gửi bình luận"}
//                     </Button>
//                 </div>
//             </div>
//           </div>
//         ) : (
//             <div className="text-center p-4 border rounded-md bg-gray-50">
//                 <p className="text-sm text-gray-600">Vui lòng <a href="/login" className="text-orange-500 font-semibold hover:underline">đăng nhập</a> để gửi bình luận.</p>
//             </div>
//         )}

//         <Separator />

//         <div className="space-y-4">
//           {isLoading ? (
//             <p className="text-sm text-gray-500">Đang tải bình luận...</p>
//           ) : comments.length > 0 ? (
//             comments.map((comment) => (
//               <CommentItem 
//                 key={comment.id} 
//                 comment={comment} 
//                 productId={productId} 
//                 currentUser={currentUser}
//                 onCommentPosted={fetchComments} // Truyền hàm fetchComments
//               />
//             ))
//           ) : (
//             <p className="text-sm text-gray-500">Chưa có bình luận nào. Hãy là người đầu tiên!</p>
//           )}
//         </div>
//       </CardContent>
//     </Card>
//   );
// }

'use client';

import React, { useState, useEffect, useCallback } from "react";
import axios from 'axios';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "react-toastify";
import { getAuthToken, getFullImageUrl } from "@/services/api";
import { User } from "@/types";
import { CommentTextArea } from "./CommentTextArea";
import { ThumbsUp, ThumbsDown, Edit, Trash2 } from 'lucide-react';

export interface Comment {
  id: number;
  content: string;
  createdAt: string;
  name: string;
  avatar: string | null;
  userId: number;
  parentId: number | null;
  replies: Comment[];
  likesCount: number;
  dislikesCount: number;
  currentUserInteraction: 'like' | 'dislike' | null;
}

interface CommentsSectionProps {
  productId: number;
  currentUser: User | null;
}

function CommentItem({ comment, productId, currentUser, onActionSuccess }: {
    comment: Comment;
    productId: number;
    currentUser: User | null;
    onActionSuccess: () => void;
}) {
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [replyHasProfanity, setReplyHasProfanity] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [editHasProfanity, setEditHasProfanity] = useState(false);

  const handleInteraction = async (type: 'like' | 'dislike') => {
      if (!currentUser) return toast.warn("Vui lòng đăng nhập để tương tác.");
      const token = getAuthToken();
      try {
          await axios.post(
              `http://localhost/api/comments/${comment.id}/interaction`,
              { type },
              { headers: { Authorization: `Bearer ${token}` } }
          );
          onActionSuccess();
      } catch (error) {
          toast.error("Tương tác thất bại.");
      }
  };

  const handleReplySubmit = async () => {
    if (!replyContent.trim() || !currentUser || replyHasProfanity) return; 
    setIsSubmittingReply(true);
    try {
      const token = getAuthToken();
      await axios.post(
        `http://localhost/api/products/${productId}/comments`,
        { content: replyContent, parentId: comment.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Đã gửi trả lời!");
      setReplyContent("");
      setIsReplying(false);
      onActionSuccess();
    } catch (error) {
      toast.error("Gửi trả lời thất bại.");
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleUpdateSubmit = async () => {
      if (!editedContent.trim() || editHasProfanity) return;
      setIsSubmittingEdit(true);
      const token = getAuthToken();
      try {
          await axios.put(
              `http://localhost/api/comments/${comment.id}`,
              { content: editedContent },
              { headers: { Authorization: `Bearer ${token}` } }
          );
          toast.success("Đã cập nhật bình luận!");
          setIsEditing(false);
          onActionSuccess();
      } catch (error) {
          toast.error("Cập nhật thất bại.");
      } finally {
          setIsSubmittingEdit(false);
      }
  };

  const handleDelete = async () => {
      if (window.confirm("Bạn có chắc chắn muốn xoá bình luận này không? Thao tác này không thể hoàn tác.")) {
          const token = getAuthToken();
          try {
              await axios.delete(
                  `http://localhost/api/comments/${comment.id}`,
                  { headers: { Authorization: `Bearer ${token}` } }
              );
              toast.success("Đã xoá bình luận.");
              onActionSuccess();
          } catch (error) {
              toast.error("Xoá thất bại.");
          }
      }
  };

  return (
    <div className="flex gap-3">
      <Avatar className="w-10 h-10 flex-shrink-0">
        <AvatarImage src={comment.avatar ? getFullImageUrl(comment.avatar) : undefined} />
        <AvatarFallback>{comment.name?.[0]?.toUpperCase() || "U"}</AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-x-2">
            <span className="font-medium text-sm">{comment.name}</span>
            <span className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleString('vi-VN')}</span>
        </div>

        {isEditing ? (
            <div className="space-y-2 py-2">
                <CommentTextArea 
                    id={`edit-${comment.id}`}
                    value={editedContent}
                    onChange={setEditedContent}
                    onProfanityChange={setEditHasProfanity}
                    placeholder="Chỉnh sửa bình luận..."
                    maxLength={1000}
                />
                <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>Hủy</Button>
                    <Button size="sm" onClick={handleUpdateSubmit} disabled={isSubmittingEdit || !editedContent.trim() || editHasProfanity}>
                        {isSubmittingEdit ? "Đang lưu..." : "Lưu"}
                    </Button>
                </div>
            </div>
        ) : (
            <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">{comment.content}</p>
        )}

        <div className="flex items-center gap-1 text-gray-600">
            <Button variant="ghost" size="sm" className="px-2" onClick={() => handleInteraction('like')}>
                <ThumbsUp className={`w-4 h-4 transition-all ${comment.currentUserInteraction === 'like' ? 'text-blue-500 fill-blue-200' : ''}`} />
                <span className="ml-1.5 text-xs font-medium">{comment.likesCount}</span>
            </Button>
            <Button variant="ghost" size="sm" className="px-2" onClick={() => handleInteraction('dislike')}>
                <ThumbsDown className={`w-4 h-4 transition-all ${comment.currentUserInteraction === 'dislike' ? 'text-gray-500' : ''}`} />
                 <span className="ml-1.5 text-xs font-medium">{comment.dislikesCount}</span>
            </Button>
            
            {currentUser && <Button variant="ghost" size="sm" className="px-2 text-xs" onClick={() => setIsReplying(!isReplying)}>{isReplying ? "Hủy" : "Trả lời"}</Button>}
            
            {currentUser?.UserID === comment.userId && !isEditing && (
                <>
                    <div className="border-l h-4 mx-1"></div>
                    <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => setIsEditing(true)}><Edit className="w-4 h-4"/></Button>
                    <Button variant="ghost" size="icon" className="w-7 h-7 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleDelete}><Trash2 className="w-4 h-4"/></Button>
                </>
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
                          disabled={!replyContent.trim() || isSubmittingReply || replyHasProfanity} 
                          size="sm"
                      >
                      {isSubmittingReply ? "Đang gửi..." : "Gửi"}
                      </Button>
                  </div>
              </div>
          </div>
        )}

        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4 space-y-4 pl-4 border-l-2 border-gray-200">
            {comment.replies.map(reply => (
              <CommentItem 
                key={reply.id} 
                comment={reply} 
                productId={productId} 
                currentUser={currentUser}
                onActionSuccess={onActionSuccess}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


export function CommentsSection({ productId, currentUser }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newCommentHasProfanity, setNewCommentHasProfanity] = useState(false);

  const fetchComments = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost/api/products/${productId}/comments`);
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
        `http://localhost/api/products/${productId}/comments`,
        { content: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Đã gửi bình luận!");
      setNewComment("");
      fetchComments();
    } catch (error) {
      toast.error("Gửi bình luận thất bại.");
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
                onActionSuccess={fetchComments}
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