"use client";

import React, { useState } from 'react';
import { ProductForReview } from '../data';
import Link from 'next/link'; // Import Link từ next/link
import { Star, Camera, CheckCircle, Video } from 'lucide-react';

// --- CÁC COMPONENT CON ĐỂ TÁI SỬ DỤNG ---

// Component chọn sao được tái sử dụng
const StarRatingInput = ({ rating, onRatingChange }: { rating: number; onRatingChange: (r: number) => void }) => {
    const [hoverRating, setHoverRating] = useState(0);
    return (
        <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => {
                const ratingValue = i + 1;
                return (
                    <button
                        key={ratingValue}
                        type="button"
                        onClick={() => onRatingChange(ratingValue)}
                        onMouseEnter={() => setHoverRating(ratingValue)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="focus:outline-none"
                    >
                        <Star className={`w-6 h-6 transition-colors ${ratingValue <= (hoverRating || rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} />
                    </button>
                );
            })}
        </div>
    );
};

// Component ô tải ảnh/video
const MediaUploadSlot = ({ isVideo = false }: { isVideo?: boolean }) => (
    <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-50 hover:border-orange-400 hover:text-orange-500 transition-colors">
        {isVideo ? <Video className="w-6 h-6" /> : <Camera className="w-6 h-6" />}
        <span className="text-xs mt-1">{isVideo ? 'Thêm Video' : 'Thêm ảnh'}</span>
    </div>
);


// --- COMPONENT FORM CHÍNH ---

export function WriteReviewForm({ product }: { product: ProductForReview }) {
    // States cho các loại đánh giá
    const [productQuality, setProductQuality] = useState(0);
    const [sellerService, setSellerService] = useState(0);
    const [shippingService, setShippingService] = useState(0);
    
    const [comment, setComment] = useState("");
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (productQuality === 0) {
            alert("Vui lòng đánh giá Chất lượng sản phẩm.");
            return;
        }
        setSubmissionStatus('submitting');
        await new Promise(resolve => setTimeout(resolve, 1500));
        console.log({ productQuality, sellerService, shippingService, comment, isAnonymous, productId: product.id });
        setSubmissionStatus('success');
    };

    if (submissionStatus === 'success') {
        return (
            <div className="bg-white p-10 rounded-lg shadow-lg text-center flex flex-col items-center">
                <CheckCircle className="w-20 h-20 text-green-500 mb-4"/>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Cảm ơn bạn đã đánh giá!</h2>
                <p className="text-gray-600">Đánh giá của bạn giúp những người mua khác có lựa chọn tốt hơn.</p>
                <Link href="/" className="mt-6 inline-block bg-[#EE4D2D] text-white font-semibold px-6 py-2 rounded-sm hover:bg-orange-600 transition-colors">
                    Quay lại Mua sắm
                </Link>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-lg shadow-lg space-y-6">
            {/* 1. Thông tin sản phẩm */}
            <div className="flex items-center gap-4">
                <img src={product.imageUrl} alt={product.name} className="w-14 h-14 object-cover rounded border" />
                <div>
                    <h2 className="font-semibold text-gray-800">{product.name}</h2>
                </div>
            </div>

            {/* 2. Đánh giá sao chi tiết */}
            <div className="space-y-2 border-t border-b py-2 divide-y divide-gray-100">
                <div className="flex items-center justify-between py-2">
                    <span className="text-gray-700 w-1/3">Chất lượng sản phẩm</span>
                    <StarRatingInput rating={productQuality} onRatingChange={setProductQuality} />
                </div>
                <div className="flex items-center justify-between py-2">
                    <span className="text-gray-700 w-1/3">Dịch vụ của Shop</span>
                    <StarRatingInput rating={sellerService} onRatingChange={setSellerService} />
                </div>
                <div className="flex items-center justify-between py-2">
                    <span className="text-gray-700 w-1/3">Dịch vụ vận chuyển</span>
                    <StarRatingInput rating={shippingService} onRatingChange={setShippingService} />
                </div>
            </div>
            
            {/* 3. Viết bình luận và Thêm ảnh/video */}
            <div className="space-y-4">
                <h3 className="font-semibold text-gray-800">Chia sẻ nhận xét của bạn</h3>
                <div className="relative">
                    <textarea
                        id="comment"
                        rows={5}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Hãy chia sẻ cảm nhận, hình ảnh thực tế của sản phẩm nhé!"
                        className="w-full p-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition"
                    />
                    <p className="absolute bottom-3 right-3 text-xs text-gray-400">{comment.length} / 500</p>
                </div>

                <div className="flex items-center gap-3">
                    <MediaUploadSlot />
                    <MediaUploadSlot isVideo={true} />
                </div>
            </div>
            
            {/* 4. Tùy chọn ẩn danh và Nút gửi */}
            <div className="flex items-center justify-between border-t pt-6">
                <label htmlFor="anonymous" className="flex items-center gap-3 cursor-pointer">
                    <input
                        id="anonymous"
                        type="checkbox"
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                        className="h-5 w-5 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                    />
                    <span className="text-sm text-gray-700">Hiển thị tên dưới dạng ẩn danh</span>
                </label>
                <button
                    type="submit"
                    disabled={submissionStatus === 'submitting'}
                    className="bg-[#EE4D2D] text-white font-bold py-2.5 px-10 rounded-sm hover:bg-orange-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {submissionStatus === 'submitting' ? 'Đang gửi...' : 'Hoàn thành'}
                </button>
            </div>
        </form>
    );
}