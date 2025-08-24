'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL} from '@/lib/config';
import { Star, Eye } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { getFullImageUrl } from '@/services/api';

// --- Định nghĩa kiểu dữ liệu ---
interface ProductInfo {
    name: string;
    image: string;
}

interface ReviewedItem {
    ReviewID: number;
    Rating: number;
    Comment: string;
    ReviewImages: string[] | null;
    // Thêm ReviewVideo nếu API của bạn trả về
    // ReviewVideo: string[] | null; 
    ShopReply: string | null;
    product: ProductInfo;
}

// --- Component con để render một mục đã đánh giá (THÊM NÚT XEM CHI TIẾT) ---
const ReviewedItemCard = ({ item, onViewDetails }: { item: ReviewedItem; onViewDetails: (item: ReviewedItem) => void; }) => (
    <div className="p-4 border rounded-lg flex items-start gap-4">
        <img 
            src={getFullImageUrl(item.product.image)} 
            alt={item.product.name} 
            className="w-20 h-20 object-cover rounded-md border"
        />
        <div className="flex-1">
            <p className="font-semibold text-gray-800">{item.product.name}</p>
            <div className="flex items-center text-yellow-500 mt-1">
                {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} className={i < item.Rating ? 'fill-current' : ''} />
                ))}
            </div>
            <p className="text-sm text-gray-700 mt-2 italic line-clamp-2">
                "{item.Comment}"
            </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => onViewDetails(item)}>
            <Eye className="mr-2 h-4 w-4" />
            Xem chi tiết
        </Button>
    </div>
);


// --- Component trang chính (ĐÃ THÊM LOGIC MODAL) ---
export default function UserReviewsPage() {
    const [reviewedItems, setReviewedItems] = useState<ReviewedItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // --- STATE MỚI CHO MODAL ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedReview, setSelectedReview] = useState<ReviewedItem | null>(null);

    useEffect(() => {
        const fetchReviewedData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await axios.get(`${API_URL}/user/reviews/summary`, {
                    withCredentials: true,
                });
                setReviewedItems(response.data.data.reviewed || []);
            } catch (err) {
                console.error("API Error:", err);
                setError('Không thể tải dữ liệu đánh giá của bạn.');
            } finally {setIsLoading(false);
            }
        };
        fetchReviewedData();
    }, []);

    // --- HÀM MỚI: Xử lý khi nhấn nút "Xem chi tiết" ---
    const handleViewDetails = (review: ReviewedItem) => {
        setSelectedReview(review);
        setIsModalOpen(true);
    };

    if (isLoading) return <p>Đang tải lịch sử đánh giá...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div>
            <h1 className="text-xl font-bold text-gray-800 mb-1">Lịch sử đánh giá</h1>
            <p className="text-sm text-gray-500 mb-6">Tất cả các đánh giá bạn đã gửi.</p>
            
            <div className="mt-4">
                {reviewedItems.length > 0 ? (
                    <div className="space-y-4">
                        {reviewedItems.map(item => (
                            <ReviewedItemCard 
                                key={item.ReviewID} 
                                item={item}
                                // Truyền hàm xử lý vào component con
                                onViewDetails={handleViewDetails} 
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 border-2 border-dashed rounded-lg">
                        <Star className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Bạn chưa có đánh giá nào</h3>
                        <p className="mt-1 text-sm text-gray-500">Hãy mua sắm và chia sẻ cảm nhận về sản phẩm nhé.</p>
                    </div>
                )}
            </div>

            {/* === MODAL HIỂN THỊ CHI TIẾT ĐÁNH GIÁ === */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Chi tiết đánh giá</DialogTitle>
                        <DialogDescription>
                            {selectedReview?.product.name}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedReview && (
                        <div className="mt-4 space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                            {/* Rating */}
                            <div className="flex items-center">
                                <span className="font-semibold mr-3">Chất lượng:</span>
                                <div className="flex items-center text-yellow-500">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={20} className={i < selectedReview.Rating ? 'fill-current' : ''} />
                                    ))}
                                </div>
                            </div>{/* Bình luận */}
                            <div>
                                <p className="font-semibold">Bình luận của bạn:</p>
                                <p className="text-gray-700 mt-1 italic bg-gray-50 p-3 rounded-md border">
                                    "{selectedReview.Comment}"
                                </p>
                            </div>
                            
                            {/* Hình ảnh/Video đính kèm */}
                            {selectedReview.ReviewImages && selectedReview.ReviewImages.length > 0 && (
                                <div>
                                    <p className="font-semibold mb-2">Hình ảnh đính kèm:</p>
                                    <div className="grid grid-cols-3 gap-2">
                                        {selectedReview.ReviewImages.map((img, index) => (
                                            <img
                                                key={index}
                                                src={getFullImageUrl(img)}
                                                alt={`Review image ${index + 1}`}
                                                className="w-full h-auto object-cover rounded-md border"
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Phản hồi từ shop */}
                            {selectedReview.ShopReply && (
                                <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
                                    <p className="font-semibold text-sm text-blue-800">Phản hồi từ người bán:</p>
                                    <p className="text-gray-800 mt-1">{selectedReview.ShopReply}</p>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}