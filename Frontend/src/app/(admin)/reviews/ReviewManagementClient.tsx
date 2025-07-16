"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Review, ReviewStatus } from "./data";
import { 
  Search, 
  Star, 
  MessageCircle,
  AlertTriangle,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  FileText,
  Filter,
  ChevronDown
} from "lucide-react";

// --- CÁC COMPONENT CON (Hàm tiện ích và hiển thị) ---

const ClientTime = ({ dateString }: { dateString: string }) => {
    const [isClient, setIsClient] = useState(false);
    useEffect(() => { setIsClient(true); }, []);
    if (!isClient) return <span className="h-3 w-24 inline-block bg-gray-200 rounded-sm animate-pulse"></span>;
    return <>{new Date(dateString).toLocaleString("vi-VN")}</>;
};

const HighlightedComment = ({ text }: { text: string }) => {
    const phoneRegex = /(\d{3,}[\s.-]?\d{3,}[\s.-]?\d{3,})/g;
    const parts = text.split(phoneRegex);
    return (
      <p className="text-sm text-gray-700 leading-relaxed">
        {parts.map((part, index) =>
          phoneRegex.test(part) ? (
            <span key={index} className="bg-yellow-200 text-yellow-900 font-semibold px-1 rounded">{part}</span>
          ) : ( <React.Fragment key={index}>{part}</React.Fragment> )
        )}
      </p>
    );
};

const RatingStars = ({ rating }: { rating: number }) => (
    <div className="flex items-center">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`w-5 h-5 ${i < rating ? "text-amber-400 fill-amber-400" : "text-gray-300"}`} />
      ))}
    </div>
);

// --- COMPONENT CHÍNH CHO MỘT THẺ ĐÁNH GIÁ ---

interface ReviewItemCardProps {
    review: Review;
    onConsider: (review: Review) => void;
    onRestore: (id: string) => void;
}

const ReviewItemCard = ({ review, onConsider, onRestore }: ReviewItemCardProps) => {
    const statusConfig: Record<ReviewStatus, { text: string; color: string; bg: string }> = {
        "Đã duyệt": { text: "Đã duyệt", color: "text-emerald-700", bg: "bg-emerald-50" },
        "Bị từ chối": { text: "Bị từ chối", color: "text-red-700", bg: "bg-red-50" },
    };
    
    return (
        <div className="bg-white border-t last:rounded-b-lg">
            {review.isReported && review.status === 'Đã duyệt' && (
                 <div className="px-6 py-3 bg-yellow-50 border-b border-yellow-200">
                    <div className="flex items-center gap-2">
                         <AlertTriangle className="w-5 h-5 text-yellow-500"/>
                         <p className="text-sm text-yellow-800">
                            <span className="font-semibold">Báo cáo từ Shop:</span> "{review.reportReason}"
                         </p>
                    </div>
                 </div>
            )}
            
            <div className="p-6 grid grid-cols-12 gap-6">
                <div className="col-span-12 md:col-span-3 space-y-4">
                    <div className="flex items-start gap-3">
                        <img src={review.product.imageUrl} alt={review.product.name} className="w-12 h-12 object-cover rounded border" />
                        <div>
                            <p className="font-semibold text-gray-800 line-clamp-2">{review.product.name}</p>
                            <p className="text-xs text-gray-500 mt-1">Shop: {review.product.shopName}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 pt-4 border-t">
                        <img src={review.user.avatarUrl} alt={review.user.name} className="w-8 h-8 rounded-full"/>
                        <p className="text-sm font-medium text-gray-800">{review.user.name}</p>
                    </div>
                </div>
                <div className="col-span-12 md:col-span-6 md:border-l md:border-r md:px-6">
                    <RatingStars rating={review.rating} />
                    <HighlightedComment text={review.comment} />
                    <p className="text-xs text-gray-400 mt-2">
                        <ClientTime dateString={review.createdAt} />
                    </p>
                </div>
                <div className="col-span-12 md:col-span-3 flex flex-col items-start md:items-end justify-between">
                     <div className={`px-3 py-1 rounded-full text-xs font-semibold ${statusConfig[review.status].bg} ${statusConfig[review.status].color}`}>
                        {statusConfig[review.status].text}
                     </div>
                     <div className="flex items-center gap-2 mt-4 md:mt-0">
                        {review.isReported && review.status === "Đã duyệt" && (
                            <button onClick={() => onConsider(review)} className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md">
                                <FileText className="w-4 h-4"/> Xem xét
                            </button>
                        )}
                        {review.status === "Bị từ chối" && (
                            <button onClick={() => onRestore(review.id)} className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md">
                                <RotateCcw className="w-4 h-4"/> Phục hồi
                            </button>
                        )}
                     </div>
                </div>
            </div>
        </div>
    );
};

// --- COMPONENT QUẢN LÝ CHÍNH ---

type TabFilter = "all" | "reported" | "rejected";

export function ReviewManagementClient({ initialReviews }: { initialReviews: Review[] }) {
    const [reviews, setReviews] = useState<Review[]>(initialReviews);
    const [filter, setFilter] = useState<TabFilter>("all");
    const [filtersVisible, setFiltersVisible] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedReview, setSelectedReview] = useState<Review | null>(null);

    const handleAction = (id: string, newStatus: ReviewStatus) => {
        setReviews(reviews.map(r => r.id === id ? { ...r, status: newStatus, isReported: false } : r));
    };
    const handleRestore = (id: string) => handleAction(id, "Đã duyệt");
    const handleApprove = () => { if (selectedReview) handleAction(selectedReview.id, "Đã duyệt"); handleCloseModal(); };
    const handleReject = () => { if (selectedReview) handleAction(selectedReview.id, "Bị từ chối"); handleCloseModal(); };
    const handleConsider = (review: Review) => { setSelectedReview(review); setIsModalOpen(true); };
    const handleCloseModal = () => { setIsModalOpen(false); setSelectedReview(null); };

    const tabs: { label: string; value: TabFilter }[] = [
        { label: "Tất cả", value: "all" },
        { label: "Cần xem xét", value: "reported" },
        { label: "Đã từ chối", value: "rejected" },
    ];

    const filteredReviews = useMemo(() => {
        switch(filter) {
            case "all":
                return reviews;
            case "reported":
                return reviews.filter(r => r.isReported && r.status === 'Đã duyệt');
            case "rejected":
                return reviews.filter(r => r.status === 'Bị từ chối');
            default:
                return reviews;
        }
    }, [reviews, filter]);

    const getCount = (tabValue: TabFilter) => {
        switch(tabValue) {
            case "all":
                return reviews.length;
            case "reported":
                return reviews.filter(r => r.isReported && r.status === 'Đã duyệt').length;
            case "rejected":
                return reviews.filter(r => r.status === 'Bị từ chối').length;
            default:
                return 0;
        }
    }

    return (
        <>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-4 space-y-4">
                    <div className="flex items-center gap-6 border-b border-gray-200 pb-2 w-full overflow-x-auto">
                        {tabs.map(tab => (
                            <button
                                key={tab.value}
                                onClick={() => setFilter(tab.value)}
                                className={`py-3 px-1 text-sm font-medium whitespace-nowrap relative ${
                                    filter === tab.value ? 'text-orange-500' : 'text-gray-500 hover:text-gray-800'
                                }`}
                            >
                                {tab.label}
                                <span className="ml-2 bg-gray-200 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full">
                                    {getCount(tab.value)}
                                </span>
                                {filter === tab.value && <div className="absolute bottom-[-9px] left-0 w-full h-0.5 bg-orange-500"></div>}
                            </button>
                        ))}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input type="text" placeholder="Tìm kiếm theo người dùng, sản phẩm..." className="pl-10 pr-4 py-2 w-full h-11 border border-gray-300 rounded-md focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none"/>
                        </div>
                        <button onClick={() => setFiltersVisible(!filtersVisible)} className="flex-shrink-0 inline-flex items-center justify-center gap-2 h-11 px-4 rounded-md border bg-white hover:bg-gray-50 text-sm font-medium">
                            <Filter className="w-4 h-4 text-gray-500" /> Bộ lọc
                            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${filtersVisible ? 'rotate-180' : ''}`} />
                        </button>
                    </div>

                    {filtersVisible && (
                        <div className="pt-4 border-t border-gray-100">
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Khoảng thời gian</label>
                                    <select className="w-full h-10 px-3 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-orange-500">
                                        <option>Tất cả</option><option>7 ngày qua</option><option>10 ngày qua</option><option>30 ngày qua</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Từ ngày</label>
                                    <input type="date" className="w-full h-10 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500" />
                                </div>
                                 <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Đến ngày</label>
                                    <input type="date" className="w-full h-10 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500" />
                                </div>
                                 <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Số sao</label>
                                    <select className="w-full h-10 px-3 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-orange-500">
                                        <option>Tất cả</option><option>5 sao</option><option>4 sao</option><option>3 sao</option><option>2 sao</option><option>1 sao</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-4">
                                <button type="button" className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-6 border bg-white hover:bg-gray-50">Xóa bộ lọc</button>
                                <button type="button" className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-6 bg-red-600 text-white hover:bg-red-700">Áp dụng</button>
                            </div>
                        </div>
                    )}
                </div>
                
                <div className="hidden md:grid grid-cols-12 gap-6 px-6 py-2 bg-gray-50 border-b border-t text-xs font-semibold text-gray-500 uppercase">
                    <div className="col-span-3">Sản phẩm & Người dùng</div>
                    <div className="col-span-6 md:border-l md:border-r md:px-6">Nội dung đánh giá</div>
                    <div className="col-span-3 text-right">Hành động</div>
                </div>
                
                <div>
                    {filteredReviews.length > 0 ? (
                        filteredReviews.map(review => (<ReviewItemCard key={review.id} review={review} onConsider={handleConsider} onRestore={handleRestore}/>))
                    ) : (
                        <div className="text-center py-16 text-gray-500">
                            <MessageCircle className="mx-auto w-12 h-12 text-gray-300" /><p className="mt-4 font-semibold">Không có đánh giá nào phù hợp.</p>
                        </div>
                    )}
                </div>
            </div>

            {isModalOpen && selectedReview && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
                    <div className="bg-white rounded-md shadow-xl p-6 w-full max-w-lg mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2"><AlertTriangle className="text-yellow-500"/> Xem xét đánh giá</h3>
                        <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-md">
                            <h4 className="font-bold text-sm text-yellow-800">Yêu cầu từ Shop</h4>
                            <p className="mt-1 text-sm text-yellow-700">"{selectedReview.reportReason}"</p>
                        </div>
                        <div className="mt-4 border-t pt-4">
                            <h4 className="font-semibold text-gray-800">Chi tiết đánh giá</h4>
                            <div className="mt-2 flex items-center gap-3">
                                <img src={selectedReview.user.avatarUrl} alt="" className="w-8 h-8 rounded-full"/><span className="font-medium">{selectedReview.user.name}</span>
                            </div>
                            <div className="mt-3 pl-11">
                                <RatingStars rating={selectedReview.rating} /><p className="mt-1 text-sm text-gray-600 italic">"{selectedReview.comment}"</p>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <button onClick={handleCloseModal} className="px-6 py-2 bg-white border border-gray-300 rounded-sm text-sm font-medium text-gray-700 hover:bg-gray-50">Huỷ</button>
                            <button onClick={handleApprove} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 rounded-sm text-sm font-medium text-white hover:bg-emerald-700"><ThumbsUp className="w-4 h-4"/> Giữ lại đánh giá</button>
                            <button onClick={handleReject} className="flex items-center gap-2 px-4 py-2 bg-red-600 rounded-sm text-sm font-medium text-white hover:bg-red-700"><ThumbsDown className="w-4 h-4"/> Từ chối đánh giá</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}