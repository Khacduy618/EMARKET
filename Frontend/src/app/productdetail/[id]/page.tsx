// File: app/productdetail/[id]/page.tsx

import ProductDetail from '../components/Productdetail';

interface ProductPageProps {
    params: {
        id: string;
    };
}

// THÊM 'async' VÀO ĐÂY
export default async function ProductPage({ params }: ProductPageProps) {
    const { id } = params;

    return (
        <main>
            <ProductDetail productId={id} />
        </main>
    );
}

// Hàm này đã có 'async' và đã đúng, giữ nguyên
export async function generateMetadata({ params }: ProductPageProps) {
    // Trong tương lai, bạn có thể fetch API ở đây để lấy tên sản phẩm thật
    // const response = await fetch(`http://localhost:8001/api/products/${params.id}`);
    // const product = await response.json();
    return {
        // title: product.Name, 
        title: `Sản phẩm ID: ${params.id}`,
        description: `Chi tiết sản phẩm với ID ${params.id}`,
    };
}