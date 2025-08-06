"use client";

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Star, ThumbsUp, ThumbsDown, Trash2, CornerUpRight, Send, X, MoreVertical, User, ShoppingBag, Calendar } from 'lucide-react';

// --- TYPESCRIPT INTERFACE ---
export interface AdminReview {
    ReviewID: number;
    Rating: number;
    Comment: string;
    ReviewImages: string[] | null;
    IsApproved: boolean;
    CreatedAt: string;
    user: { UserID: number; FullName: string; Avatar: string | null; };
    variant: { VariantID: number; ImageURL: string | null; product: { ProductID: number; Name: string; }; };
    reply?: { ReplyText: string; RepliedAt: string; } | null;
}

interface AdminReviewCardProps {
    review: AdminReview;
    onApprove: (id: number) => void;
    onReject: (id: number) => void;
    onDelete: (id: number) => void;
    onReply: (id: number, text: string) => void;
}

// --- HELPER FUNCTIONS ---
const getFullImageUrl = (path: string | null): string => {
    if (!path) {
        return '/placeholder-image.png'; 
    }
    if (path.startsWith('http')) {
        return path;
    }
    
    // Sử dụng trực tiếp URL backend thay vì biến môi trường
    const baseUrl = 'http://localhost:8001';

    return `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
};

const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex items-center">{[...Array(5)].map((_, i) => (<Star key={i} className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />))}</div>
);

const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${hours}:${minutes} ${day}-${month}-${year}`;
};

// --- MAIN COMPONENT ---
export function AdminReviewCard({ review, onApprove, onReject, onDelete, onReply }: AdminReviewCardProps) {
    const [isReplying, setIsReplying] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(event.target as Node)) { setIsMenuOpen(false); } };
        document.addEventListener('mousedown', handleClickOutside);
        return () => { document.removeEventListener('mousedown', handleClickOutside); };
    }, []);

    const handleReplySubmit = () => { if (replyText.trim()) { onReply(review.ReviewID, replyText.trim()); setIsReplying(false); setReplyText(''); } };
    const handleMenuAction = (action: () => void) => { action(); setIsMenuOpen(false); };

    return (
        <div className="border bg-white rounded-lg p-4 transition-shadow hover:shadow-sm relative">
            <div className="flex Aflex-col md:flex-row gap-4">
                <div className="flex-shrink-0 w-full md:w-24 text-center">
                    <Image
                        src={getFullImageUrl(review.variant?.ImageURL)}
                        alt={review.variant?.product.Name || 'Product image'}
                        width={96}
                        height={96}
                        className="rounded-md object-cover mx-auto border"
                        onError={(e) => { e.currentTarget.src = '/placeholder-image.png' }}
                    />
                    <p className="text-xs text-gray-600 mt-2 line-clamp-2" title={review.variant?.product.Name}>
                        {review.variant?.product.Name || "Sản phẩm không tồn tại"}
                    </p>
                </div>

                <div className="flex-grow">
                    <div className="flex items-start justify-between">
                       <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <User className="w-5 h-5 text-gray-500" />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-800">{review.user?.FullName || 'Người dùng ẩn danh'}</p>
                                <div className="flex items-center gap-2">
                                    <StarRating rating={review.Rating} />
                                    <span className="text-xs text-gray-500">({review.Rating}/5)</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${review.IsApproved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {review.IsApproved ? 'Đã duyệt' : 'Chưa duyệt'}
                            </span>
                            <div className="relative" ref={menuRef}>
                                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300">
                                    <MoreVertical className="h-4 w-4 text-gray-600" />
                                </button>
                                {isMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-20">
                                        <div className="py-1" role="menu" aria-orientation="vertical">
                                            {!review.IsApproved && (<button onClick={() => handleMenuAction(() => onApprove(review.ReviewID))} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center" role="menuitem"><ThumbsUp className="mr-3 h-4 w-4" /> Duyệt</button>)}
                                            {review.IsApproved && (<button onClick={() => handleMenuAction(() => onReject(review.ReviewID))} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center" role="menuitem"><ThumbsDown className="mr-3 h-4 w-4" /> Hủy duyệt</button>)}
                                            <button onClick={() => handleMenuAction(() => onDelete(review.ReviewID))} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center" role="menuitem"><Trash2 className="mr-3 h-4 w-4" /> Xóa</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    <p className="text-gray-700 mt-3 text-sm">{review.Comment}</p>
                    
                    {review.ReviewImages && review.ReviewImages.length > 0 && (
                        <div className="mt-3 flex gap-2 flex-wrap">
                            {review.ReviewImages.map((img, index) => (
                                <Image 
                                    key={index} 
                                    src={getFullImageUrl(img)}
                                    alt={`Review image ${index + 1}`} 
                                    width={80} 
                                    height={80} 
                                    className="rounded-md object-cover border cursor-pointer hover:opacity-80 transition-opacity"
                                    onError={(e) => { e.currentTarget.src = '/placeholder-image.png' }}
                                />
                            ))}
                        </div>
                    )}

                    <div className="flex justify-between items-end mt-3">
                        <p className="text-xs text-gray-500 flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDateTime(review.CreatedAt)}</p>
                        <button onClick={() => setIsReplying(!isReplying)} className="inline-flex items-center justify-center rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 px-3 py-1.5 transition-colors"><CornerUpRight className="w-4 h-4 mr-2" /> Trả lời</button>
                    </div>
                     
                    {isReplying && (
                        <div className="mt-3 relative">
                            <textarea placeholder={`Trả lời đánh giá của ${review.user?.FullName}...`} value={replyText} onChange={(e) => setReplyText(e.target.value)} className="w-full border border-gray-300 rounded-md p-2 text-sm shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition pr-24" rows={3}/>
                            <div className="absolute top-2 right-2 flex flex-col gap-1">
                                <button onClick={handleReplySubmit} className="h-8 w-8 flex items-center justify-center rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"><Send className="h-4 w-4" /></button>
                                <button onClick={() => setIsReplying(false)} className="h-8 w-8 flex items-center justify-center rounded-md text-gray-500 hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"><X className="h-5 w-5" /></button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}