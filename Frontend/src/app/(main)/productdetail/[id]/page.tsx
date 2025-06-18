import React from 'react';
import { getMockComments, mockProduct } from '../data';
import { ProductComments } from '../components/ProductComents'; 

export default async function ProductDetailPage({ params }: { params: { productId: string } }) {
    const initialComments = await getMockComments(params.productId);
    const product = mockProduct;

    return (
        <div className="bg-gray-100 min-h-screen">
            <div className="max-w-4xl mx-auto p-4 md:p-8">
                {/* Phần thông tin sản phẩm */}
                <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
                    <div className="flex flex-col md:flex-row gap-8">
                        <img src={product.imageUrl} alt={product.name} className="w-full md:w-1/3 h-auto object-cover rounded-lg"/>
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                        </div>
                    </div>
                </div>

                {/* Phần bình luận - Truyền dữ liệu vào Client Component */}
                <ProductComments initialComments={initialComments} />
            </div>
        </div>
    );
}