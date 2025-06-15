// File: app/productdetail/[id]/page.tsx

// SỬA ĐỔI 1: Import thêm hàm notFound để xử lý lỗi
import { notFound } from 'next/navigation';
import ProductDetail from '../components/Productdetail'; // Giả sử component của bạn ở đây

interface ProductPageProps {
    params: {
        id: string; // ID từ URL luôn là chuỗi
    };
}

// Giữ 'async' là một thói quen tốt cho Server Components
export default async function ProductPage({ params }: ProductPageProps) {
    const { id } = params;

    // SỬA ĐỔI 2: Chuyển đổi ID từ chuỗi sang số
    const productIdAsNumber = parseInt(id, 10);

    // SỬA ĐỔI 3: Kiểm tra xem ID có hợp lệ không.
    // Nếu người dùng truy cập /productdetail/abc, parseInt sẽ trả về NaN.
    if (isNaN(productIdAsNumber)) {
        // Hàm này sẽ dừng render và hiển thị trang 404 Not Found của Next.js
        notFound();
    }

    return (
        <main>
            {/* Truyền vào prop là productIdAsNumber (kiểu number), không phải id (kiểu string) */}
            <ProductDetail productId={productIdAsNumber} />
        </main>
    );
}

// Hàm generateMetadata đã đúng, giữ nguyên
export async function generateMetadata({ params }: ProductPageProps) {
    // Trong tương lai, bạn có thể fetch API ở đây để lấy tên sản phẩm thật
    // const product = await fetch(`.../api/products/${params.id}`).then(res => res.json());
    return {
        // title: product.name, 
        title: `Chi tiết sản phẩm | ID: ${params.id}`,
        description: `Xem chi tiết sản phẩm với mã số ${params.id}`,
    };
}