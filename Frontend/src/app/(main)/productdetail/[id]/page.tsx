
import { notFound } from 'next/navigation';
import ProductDetail from '../components/Productdetail';
import React from 'react';
import { getMockComments, mockProduct } from '../data';
import ProductDescription from '../components/ProductDescription';
import RelatedProductsSidebar from '../components/FeaturedProductsSidebar';
import { ProductComments } from '../components/ProductComents';
import ShopInfo from '../components/ShopInfo';

// Bỏ interface ProductPageProps hoặc không dùng nó cho component chính

// ===> SỬA LỖI Ở ĐÂY: Định nghĩa type trực tiếp trong signature <===
export default async function ProductPage({ params }: { params: { id: string } }) {
    // Bây giờ việc destructure sẽ không còn cảnh báo
    const { id } = await params;
    const productIdAsNumber = parseInt(id, 10);

    // Kiểm tra nếu ID không hợp lệ
    if (isNaN(productIdAsNumber)) {
        notFound(); // Chuyển hướng đến trang 404
    }

    const initialComments = await getMockComments(params.id);
    const product = mockProduct;

    return (
        <div className="container mx-auto px-4 py-8 text-black">
            <main>
                <ProductDetail
                    productId={productIdAsNumber}
                    descriptionSlot={<ProductDescription productId={productIdAsNumber} />}
                    sidebarSlot={<RelatedProductsSidebar currentProductId={productIdAsNumber} />}
                />
                {/* Phần bình luận - Truyền dữ liệu vào Client Component */}
                <ProductComments initialComments={initialComments} />
            </main>
        </div>

    );
}


// ===> SỬA CẢ Ở ĐÂY: Hàm generateMetadata cũng cần được cập nhật <===
export async function generateMetadata({ params }: { params: { id: string } }) {
    const id = await params.id;

    // Logic fetch metadata của bạn ở đây...
    // const product = await fetch(`.../api/products/${id}`).then(res => res.json());
    // if (!product) {
    //     return { title: 'Sản phẩm không tồn tại' };
    // }
    // return {
    //     title: product.name,
    //     description: product.description,
    // };

    // Ví dụ metadata
    return {
        title: `Chi tiết sản phẩm #${id}`,
    };

}