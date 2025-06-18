import React from 'react';
// (ĐÃ SỬA) Sửa đường dẫn để đi lên một cấp, tìm đến file data.ts
import { getMockProductForReview } from '../data';
import { notFound } from 'next/navigation';
// Component Client nằm cùng cấp, đường dẫn này đúng
import { WriteReviewForm } from './WriteReviewForm'; 

// Đây là Server Component, nó sẽ fetch dữ liệu
export default async function WriteReviewPage({ params }: { params: { productId: string } }) {
    // Lấy thông tin sản phẩm dựa trên ID từ URL
    const product = await getMockProductForReview(params.productId);

    // Nếu không có sản phẩm, hiển thị trang 404
    if (!product) {
        notFound();
    }
    
    return (
        <div className="bg-gray-50 min-h-screen py-12 px-4">
            <div className="max-w-3xl mx-auto">
                 <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">Đánh giá sản phẩm</h1>
                 <p className="text-center text-gray-500 mb-8">Chia sẻ cảm nhận của bạn để giúp những người mua khác nhé!</p>
                
                {/* Truyền dữ liệu sản phẩm xuống Client Component */}
                <WriteReviewForm product={product} />
            </div>
        </div>
    );
}