"use client";

import React, { useState } from 'react';
import { Comment, getCurrentUser } from '../data';
import { Send } from 'lucide-react';

// --- TIỆN ÍCH LỌC TỪ NHẠY CẢM ---
const sensitiveWords = ["tệ", "lừa đảo", "đểu", "cút"];
const profanityFilter = (text: string): string => {
    let filteredText = text;
    sensitiveWords.forEach(word => {
        // Tạo regex để tìm từ (không phân biệt hoa thường)
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        filteredText = filteredText.replace(regex, '***');
    });
    return filteredText;
};

// --- COMPONENT CON ĐỂ HIỂN THỊ MỘT BÌNH LUẬN ---
const CommentItem = ({ comment }: { comment: Comment }) => {
    const isSeller = comment.user.role === 'Seller';
    return (
        <div className="flex items-start gap-3">
            <img src={comment.user.avatarUrl} alt={comment.user.name} className="w-10 h-10 rounded-full" />
            <div className="flex-1">
                <div className={`p-3 rounded-lg ${isSeller ? 'bg-gray-100' : 'bg-blue-50'}`}>
                    <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm text-gray-800">{comment.user.name}</p>
                        {isSeller && (
                            <span className="text-xs bg-orange-500 text-white font-semibold px-2 py-0.5 rounded-full">Shop</span>
                        )}
                    </div>
                    {/* Áp dụng bộ lọc từ nhạy cảm khi hiển thị */}
                    <p className="text-sm text-gray-700 mt-1">{profanityFilter(comment.text)}</p>
                </div>
                <p className="text-xs text-gray-400 mt-1 pl-1">{new Date(comment.createdAt).toLocaleDateString('vi-VN')}</p>
                
                {/* Hiển thị các bình luận trả lời (đệ quy) */}
                <div className="mt-3 space-y-3">
                    {comment.replies.map(reply => (
                        <CommentItem key={reply.id} comment={reply} />
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- COMPONENT CHÍNH QUẢN LÝ BÌNH LUẬN ---
export function ProductComments({ initialComments }: { initialComments: Comment[] }) {
    const [comments, setComments] = useState(initialComments);
    const [newComment, setNewComment] = useState("");
    const currentUser = getCurrentUser(); // Lấy người dùng hiện tại

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        // Tạo đối tượng bình luận mới
        const newCommentObject: Comment = {
            id: `cmt_${Date.now()}`,
            user: currentUser,
            text: newComment,
            createdAt: new Date().toISOString(),
            replies: [],
        };
        
        // Cập nhật state để hiển thị ngay lập tức
        setComments([newCommentObject, ...comments]);
        setNewComment(""); // Xóa nội dung trong ô input
    };
    
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Hỏi & Đáp về sản phẩm</h2>
            
            {/* Form viết bình luận */}
            <form onSubmit={handleSubmit} className="flex items-start gap-3 mb-8">
                <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-10 h-10 rounded-full" />
                <div className="relative flex-1">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Để lại bình luận của bạn..."
                        rows={2}
                        className="w-full p-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-shadow"
                    />
                    <button type="submit" className="absolute top-1/2 right-2 -translate-y-1/2 p-2 text-gray-400 hover:text-orange-500">
                        <Send className="w-5 h-5"/>
                    </button>
                </div>
            </form>

            {/* Danh sách bình luận */}
            <div className="space-y-6">
                {comments.map(comment => (
                    <CommentItem key={comment.id} comment={comment} />
                ))}
            </div>
        </div>
    );
}