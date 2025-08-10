"use client";

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Star, ThumbsUp, ThumbsDown, Trash2, CornerUpRight, Send, X, MoreVertical, Calendar, Clock, AlertTriangle, Loader2 } from 'lucide-react';

// --- TYPESCRIPT INTERFACE ---
export interface AdminReview {
    ReviewID: number;
    Rating: number;
    Comment: string;
    // Đảm bảo kiểu dữ liệu là một mảng chuỗi hoặc null để hiển thị danh sách ảnh
    ReviewImages: string[] | null;
    status: number | null;
    CreatedAt: string;
    AdminReply: string | null;
    user: { UserID: number; FullName: string; Avatar: string | null; };
    variant: {
        VariantID: number;
        ImageURL: string | null;
        product: { ProductID: number; Name: string; };
        VariantAttributes?: string;
    };
}

// --- COMPONENT PROPS ---
interface AdminReviewCardProps {
    review: AdminReview;
    isUpdating: boolean;
    onApprove: (id: number) => void;
    onReject: (id: number) => void;
    onDelete: (id: number) => void;
    onReply: (id: number, text: string) => void;
    onSetPending: (id: number) => void;
    onSetNeedsReview: (id: number) => void;
}

// --- HELPER FUNCTIONS ---
const getFullImageUrl = (path: string | null | undefined): string => {
    // Xử lý an toàn các giá trị đầu vào không hợp lệ
    if (!path || typeof path !== 'string') {
        return '/placeholder.png';
    }
    if (path.startsWith('http')) {
        return path;
    }
    const baseUrl = 'http://localhost:8001';
    return `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
};

const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex items-center">{[...Array(5)].map((_, i) => (<Star key={i} className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />))}</div>
);

const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Ngày không hợp lệ";
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${hours}:${minutes} ${day}-${month}-${year}`;
};

// --- MAIN COMPONENT ---
export function AdminReviewCard({
    review,
    isUpdating,
    onApprove,
    onReject,
    onDelete,
    onReply,
    onSetPending,
    onSetNeedsReview
}: AdminReviewCardProps) {
    const [isReplying, setIsReplying] = useState(false);
    const [replyText, setReplyText] = useState(review.AdminReply || '');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(event.target as Node)) setIsMenuOpen(false); };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => { setReplyText(review.AdminReply || ''); }, [review.AdminReply]);

    const handleReplyClick = () => { if (isUpdating) return; setReplyText(review.AdminReply || ''); setIsReplying(!isReplying); };
    const handleReplySubmit = () => { onReply(review.ReviewID, replyText.trim()); setIsReplying(false); };
    const handleMenuAction = (action: () => void) => { action(); setIsMenuOpen(false); };

    const getStatusChip = () => {
        switch (review.status) {
            case 1: return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-800">Đã duyệt</span>;
            case 0: return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-800">Đã từ chối</span>;
            case 2: return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Chờ duyệt</span>;
            case 3: return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">Cần xem xét</span>;
            default: return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-gray-200 text-gray-800">Không xác định</span>;
        }
    };

    return (
        <div className={`border bg-white rounded-lg p-4 transition-all hover:shadow-sm relative ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-shrink-0 w-full md:w-24 text-center">
                    <Image src={getFullImageUrl(review.variant?.ImageURL)} alt={review.variant?.product.Name || 'Ảnh sản phẩm'} width={96} height={96} className="rounded-md object-cover mx-auto border" onError={(e) => { e.currentTarget.src = '/placeholder.png' }} />
                    <p className="text-xs text-gray-600 mt-2 line-clamp-2" title={review.variant?.product.Name}>{review.variant?.product.Name || "Sản phẩm đã xóa"}</p>
                    {review.variant?.VariantAttributes && <p className="text-xs text-gray-500 mt-1 truncate" title={review.variant.VariantAttributes}>{review.variant.VariantAttributes}</p>}
                </div>
                <div className="flex-grow">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <Image src={getFullImageUrl(review.user?.Avatar)} alt={review.user?.FullName || 'Avatar'} width={40} height={40} className="rounded-full bg-gray-200 object-cover" onError={(e) => { e.currentTarget.src = '/placeholder-user.png' }} />
                            <div>
                                <p className="font-semibold text-gray-800">{review.user?.FullName || 'Người dùng ẩn danh'}</p>
                                <div className="flex items-center gap-2"><StarRating rating={review.Rating} /><span className="text-xs text-gray-500">({review.Rating}/5)</span></div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {getStatusChip()}
                            <div className="relative" ref={menuRef}>
                                <button
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                    disabled={isUpdating}
                                    className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:bg-gray-200 disabled:cursor-not-allowed"
                                >
                                    {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreVertical className="h-4 w-4 text-gray-600" />}
                                </button>
                                {isMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-20">
                                        <div className="py-1" role="menu" aria-orientation="vertical">
                                            {review.status !== 1 && (<button onClick={() => handleMenuAction(() => onApprove(review.ReviewID))} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center" role="menuitem"><ThumbsUp className="mr-3 h-4 w-4 text-green-500" /> Duyệt</button>)}
                                            {review.status !== 0 && (<button onClick={() => handleMenuAction(() => onReject(review.ReviewID))} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center" role="menuitem"><ThumbsDown className="mr-3 h-4 w-4 text-red-500" /> Từ chối</button>)}
                                            <div className="border-t my-1"></div>
                                            {review.status !== 2 && (<button onClick={() => handleMenuAction(() => onSetPending(review.ReviewID))} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center" role="menuitem"><Clock className="mr-3 h-4 w-4 text-yellow-500" /> Chuyển sang Chờ duyệt</button>)}
                                            {review.status !== 3 && (<button onClick={() => handleMenuAction(() => onSetNeedsReview(review.ReviewID))} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center" role="menuitem"><AlertTriangle className="mr-3 h-4 w-4 text-orange-500" /> Chuyển sang Cần xem xét</button>)}
                                            <div className="border-t my-1"></div>
                                            <button onClick={() => handleMenuAction(() => onDelete(review.ReviewID))} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center" role="menuitem"><Trash2 className="mr-3 h-4 w-4" /> Xóa</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <p className="text-gray-700 mt-3 text-sm whitespace-pre-wrap">{review.Comment}</p>

                    {/* Phần hiển thị danh sách hình ảnh review của người dùng */}
                    {Array.isArray(review.ReviewImages) && review.ReviewImages.length > 0 && (
                        <div className="mt-3 flex gap-2 flex-wrap">
                            {review.ReviewImages.map((img, index) => (
                                <Image
                                    key={index}
                                    src={getFullImageUrl(img)}
                                    alt={`Ảnh review ${index + 1}`}
                                    width={80}
                                    height={80}
                                    className="rounded-md object-cover border cursor-pointer hover:opacity-80 transition-opacity"
                                    onError={(e) => { e.currentTarget.src = '/placeholder.png' }}
                                />
                            ))}
                        </div>
                    )}

                    {review.AdminReply && !isReplying && (
                        <div className="mt-4 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                            <p className="text-sm font-semibold text-indigo-800">Phản hồi từ quản trị viên:</p>
                            <p className="text-sm text-gray-800 mt-1 whitespace-pre-wrap">{review.AdminReply}</p>
                        </div>
                    )}

                    <div className="flex justify-between items-end mt-3">
                        <p className="text-xs text-gray-500 flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDateTime(review.CreatedAt)}</p>
                        <button onClick={handleReplyClick} disabled={isUpdating} className="inline-flex items-center justify-center rounded-md text-sm font-medium text-indigo-600 hover:bg-indigo-50 hover:text-indigo-900 px-3 py-1.5 transition-colors disabled:opacity-50">
                            <CornerUpRight className="w-4 h-4 mr-2" />
                            {review.AdminReply ? 'Sửa trả lời' : 'Trả lời'}
                        </button>
                    </div>

                    {isReplying && (
                        <div className="mt-3 relative">
                            <textarea
                                placeholder={`Trả lời đánh giá của ${review.user?.FullName}...`}
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                className="w-full border border-gray-300 rounded-md p-2 text-sm shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition pr-24"
                                rows={3}
                            />
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