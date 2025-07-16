"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Comment, getCurrentUser, User } from '../data';
import { Send, Star, ThumbsUp, MessageSquare, AlertCircle } from 'lucide-react';

// --- TIỆN ÍCH LỌC TỪ NHẠY CẢM ---
const sensitiveWords = ["tệ", "lừa đảo", "đểu", "cút"];
// Hàm kiểm tra vi phạm, thay vì thay thế
const containsProfanity = (text: string): boolean => {
    const lowerCaseText = text.toLowerCase();
    // Kiểm tra xem có từ nào trong danh sách cấm xuất hiện trong bình luận không
    return sensitiveWords.some(word => lowerCaseText.includes(word));
};

// Component hiển thị thời gian, tránh lỗi Hydration
const ClientTime = ({ dateString }: { dateString: string }) => {
    const [isClient, setIsClient] = useState(false);
    useEffect(() => { setIsClient(true); }, []);
    if (!isClient) return <span className="h-3 w-24 inline-block bg-gray-200 rounded-sm animate-pulse"></span>;
    return <>{new Date(dateString).toLocaleString("vi-VN")}</>;
};

// --- CÁC COMPONENT CON ---

const RatingStars = ({ rating }: { rating: number }) => (
    <div className="flex items-center">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`w-4 h-4 ${i < rating ? "text-orange-500 fill-orange-500" : "text-gray-300"}`} />
      ))}
    </div>
);

const CommentItem = ({ comment, onReply }: { comment: Comment, onReply: (commentId: string) => void }) => {
    const isSeller = comment.user.role === 'Seller';
    return (
        <div className="flex items-start gap-3 py-6 border-b border-gray-100 last:border-b-0">
            <img src={comment.user.avatarUrl} alt={comment.user.name} className="w-10 h-10 rounded-full" />
            <div className="flex-1">
                <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm text-gray-800">{comment.user.name}</p>
                    {isSeller && (
                        <span className="text-xs bg-orange-500 text-white font-semibold px-2 py-0.5 rounded">Shop</span>
                    )}
                </div>
                {comment.rating && comment.rating > 0 && <RatingStars rating={comment.rating} />}
                
                <p className="text-sm text-gray-800 mt-2 whitespace-pre-wrap">{comment.text}</p>
                
                <div className="flex items-center justify-between mt-3">
                    <p className="text-xs text-gray-400">
                        <ClientTime dateString={comment.createdAt} />
                    </p>
                    <div className="flex items-center gap-4">
                        <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-orange-500">
                            <ThumbsUp className="w-4 h-4"/>
                            <span>Hữu ích</span>
                        </button>
                        {!isSeller && (
                            <button onClick={() => onReply(comment.id)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-orange-500">
                                <MessageSquare className="w-4 h-4"/>
                                <span>Trả lời</span>
                            </button>
                        )}
                    </div>
                </div>
                
                <div className="mt-4 space-y-4 pl-8 border-l-2 border-gray-100">
                    {comment.replies.map(reply => (
                        <CommentItem key={reply.id} comment={reply} onReply={onReply}/>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- COMPONENT CHÍNH QUẢN LÝ BÌNH LUẬN ---
export function ProductComments({ initialComments }: { initialComments: Comment[] }) {
    const [comments, setComments] = useState(initialComments);
    const [newCommentText, setNewCommentText] = useState("");
    const [activeFilter, setActiveFilter] = useState<string | number>('all');
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyText, setReplyText] = useState("");
    
    const [commentError, setCommentError] = useState<string | null>(null);
    const [replyError, setReplyError] = useState<string | null>(null);

    const currentUser = getCurrentUser();
    const filters = ['all', 5, 4, 3, 2, 1];

    const filteredComments = useMemo(() => {
        if (activeFilter === 'all') return comments;
        return comments.filter(c => c.rating && c.rating === activeFilter);
    }, [comments, activeFilter]);

    const handleReplyClick = (commentId: string) => {
        setReplyingTo(prev => prev === commentId ? null : commentId);
        setReplyText(""); // Xóa nội dung trả lời cũ
        setReplyError(null); // Xóa lỗi cũ
    };

    const handleSubmit = (e: React.FormEvent, parentId: string | null = null) => {
        e.preventDefault();
        const isReply = parentId !== null;
        const textToSubmit = isReply ? replyText : newCommentText;
        
        if (!textToSubmit.trim()) return;

        if (containsProfanity(textToSubmit)) {
            isReply 
                ? setReplyError("Bình luận chứa từ ngữ không phù hợp.")
                : setCommentError("Bình luận chứa từ ngữ không phù hợp.");
            return;
        }

        const newCommentObject: Comment = {
            id: `cmt_${Date.now()}`,
            user: currentUser,
            text: textToSubmit,
            createdAt: new Date().toISOString(),
            replies: [],
        };
        
        if (isReply) {
            const addReply = (nodes: Comment[]): Comment[] => nodes.map(node => {
                if (node.id === parentId) return { ...node, replies: [newCommentObject, ...node.replies] };
                if (node.replies.length > 0) return { ...node, replies: addReply(node.replies) };
                return node;
            });
            setComments(addReply(comments));
            setReplyText("");
            setReplyingTo(null);
        } else {
            setComments([newCommentObject, ...comments]);
            setNewCommentText("");
        }
    };
    
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-bold text-gray-800 mb-4 uppercase">ĐÁNH GIÁ SẢN PHẨM</h2>
            
            <div className="flex items-center gap-2 mb-6 bg-orange-50 p-4 rounded-md flex-wrap">
                {filters.map(filter => {
                    const count = filter === 'all' ? comments.length : comments.filter(c => c.rating === filter).length;
                    return (
                        <button 
                            key={filter} 
                            onClick={() => setActiveFilter(filter)}
                            className={`px-4 py-2 text-sm rounded-sm transition-colors ${
                                activeFilter === filter 
                                ? 'bg-orange-500 text-white shadow' 
                                : 'bg-white hover:bg-orange-100 border border-gray-200'
                            }`}
                        >
                            {filter === 'all' ? 'Tất cả' : `${filter} Sao`} ({count})
                        </button>
                    )
                })}
            </div>
            
            <form onSubmit={(e) => handleSubmit(e, null)} className="flex items-start gap-3 mb-8">
                <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-10 h-10 rounded-full" />
                <div className="relative flex-1">
                    <textarea 
                        value={newCommentText} 
                        onChange={(e) => {
                            setNewCommentText(e.target.value);
                            if(commentError) setCommentError(null);
                        }}
                        placeholder="Để lại bình luận của bạn..." rows={2} 
                        className={`w-full p-3 pr-12 border rounded-lg focus:ring-2 transition-colors ${commentError ? 'border-red-500 ring-red-200' : 'border-gray-300 focus:ring-orange-400'}`}
                    />
                    <button type="submit" className="absolute top-1/2 right-3 -translate-y-1/2 p-2 text-gray-400 hover:text-orange-500"><Send className="w-5 h-5"/></button>
                    {commentError && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4"/>
                            {commentError}
                        </p>
                    )}
                </div>
            </form>

            <div>
                {filteredComments.map(comment => (
                    <div key={comment.id}>
                        <CommentItem comment={comment} onReply={handleReplyClick}/>
                        {replyingTo === comment.id && (
                             <form onSubmit={(e) => handleSubmit(e, comment.id)} className="flex items-start gap-3 mt-4 ml-12">
                                <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-8 h-8 rounded-full" />
                                <div className="relative flex-1">
                                    <textarea
                                        value={replyText}
                                        onChange={(e) => {
                                            setReplyText(e.target.value);
                                            if(replyError) setReplyError(null);
                                        }}
                                        placeholder={`Trả lời ${comment.user.name}...`}
                                        autoFocus 
                                        rows={2} 
                                        className={`w-full p-2 pr-10 border rounded-lg focus:ring-1 transition-colors ${replyError ? 'border-red-500 ring-red-200' : 'border-gray-200 focus:ring-orange-400'}`}
                                    />
                                    <button type="submit" className="absolute top-1/2 right-2 -translate-y-1/2 p-1 text-gray-400 hover:text-orange-500"><Send className="w-4 h-4"/></button>
                                     {replyError && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                            <AlertCircle className="w-4 h-4"/>
                                            {replyError}
                                        </p>
                                    )}
                                </div>
                            </form>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}