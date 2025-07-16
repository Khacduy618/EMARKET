// Vị trí: app/reviews/page.tsx

import React from 'react';
import { getMockReviews } from './data'; 
import { ReviewManagementClient } from './ReviewManagementClient';

export default async function ReviewManagementPage() {
    // Lấy dữ liệu ban đầu từ server
    const initialReviews = await getMockReviews();

    return (
        <div className="p-4 md:p-6 lg:p-8">
            <header className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                    Quản lý Đánh giá
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                    Xem xét các đánh giá bị báo cáo, từ chối hoặc phục hồi chúng.
                </p>
            </header>
            
            <main>
                <ReviewManagementClient initialReviews={initialReviews} />
            </main>
        </div>
    );
}