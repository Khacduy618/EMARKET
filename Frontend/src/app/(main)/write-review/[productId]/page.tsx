import React from 'react';
import { getMockProductForReview } from '../data';
import { notFound } from 'next/navigation';
import { WriteReviewForm } from '../components/WriteReviewForm';

// Đây là Server Component, nó sẽ fetch dữ liệu
export default async function WriteReviewPage({ params }: { params: { productId: string } }) {
    const product = await getMockProductForReview(params.productId);

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