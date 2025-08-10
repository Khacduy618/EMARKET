
import { notFound } from 'next/navigation';
import ProductDetail from '../components/Productdetail';
import React from 'react';
// Bỏ interface ProductPageProps hoặc không dùng nó cho component chính

// ===> SỬA LỖI Ở ĐÂY: Định nghĩa type trực tiếp trong signature <===
export default async function ProductPage({ params }: { params: { id: string } }) {
    // Bây giờ việc destructure sẽ không còn cảnh báo
    const { id } = params;
    const productIdAsNumber = parseInt(id, 10);

    // Kiểm tra nếu ID không hợp lệ
    if (isNaN(productIdAsNumber)) {
        notFound(); // Chuyển hướng đến trang 404
    }

    return (
        <div className="container mx-auto px-4 py-8 text-black">
            <main>
                <ProductDetail
                    productId={productIdAsNumber}
                />
            </main>
        </div>

    );
}