// app/categoryDetail/components/ProductCard.tsx
import Link from 'next/link';
import Image from 'next/image';

// --- SỬA ĐỔI 1: Cập nhật interface cho đúng với JSON từ API ---
// Interface mới này khớp chính xác với dữ liệu bạn nhận được
interface Product {
    ProductID: number;
    Name: string;
    Description: string;
    Discount: number; // Đây là % giảm giá, ví dụ: 10
    viewCount: number;
    Price: number; // Đây là giá cuối cùng sau khi đã giảm (nếu có)
    PrimaryImageURL: string | null;
}
// --- KẾT THÚC PHẦN SỬA ĐỔI ---


const formatCurrency = (amount: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
const getImageUrl = (url: string | null | undefined) => {
    // Giữ nguyên logic xử lý URL, không cần thay đổi
    if (!url) return '/placeholder.svg'; // Ảnh mặc định nếu không có ảnh
    if (url.startsWith('http')) return url;
    return `http://localhost:8001${url}`;
};

export default function ProductCard({ product }: { product: Product }) {
    // --- SỬA ĐỔI 2: Cập nhật lại toàn bộ logic lấy dữ liệu ---

    // Không cần tìm variant nữa, giá đã có sẵn
    const price = product.Price;

    // Lấy % giảm giá trực tiếp từ `product.Discount`
    const discountPercent = product.Discount;
    const hasDiscount = discountPercent > 0;

    // Tính toán lại giá gốc (CompareAtPrice) dựa trên giá cuối và % giảm giá
    // Công thức: Giá gốc = Giá cuối / (1 - % giảm giá)
    // Lưu ý: Cần kiểm tra discountPercent < 100 để tránh chia cho 0 hoặc số âm
    const compareAtPrice = hasDiscount && discountPercent < 100
        ? Math.round(price / (1 - discountPercent / 100))
        : null;

    // Lấy URL ảnh trực tiếp, không cần tìm trong mảng `images`
    const imageUrl = getImageUrl(product.PrimaryImageURL);

    return (
        <Link
            href={`/products/${product.ProductID}`}
            className="group block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
        >
            <div className="relative w-full aspect-square">
                <Image
                    src={imageUrl} // SỬA ĐỔI 3: Dùng biến `imageUrl` mới
                    alt={product.Name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    // Thêm onError để xử lý trường hợp ảnh lỗi
                    onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
                />
                {/* SỬA ĐỔI 4: Hiển thị % giảm giá từ `discountPercent` */}
                {hasDiscount && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                        -{discountPercent}%
                    </div>
                )}
            </div>
            <div className="p-3">
                <h3 title={product.Name} className="text-sm font-medium text-gray-800 h-10 overflow-hidden text-ellipsis">
                    {product.Name}
                </h3>
                <div className="mt-2 flex flex-col items-start">
                    {/* SỬA ĐỔI 5: Cập nhật cách hiển thị giá */}
                    <p className="text-base font-bold text-red-600">{formatCurrency(price)}</p>
                    {hasDiscount && compareAtPrice && (
                        <p className="text-xs text-gray-500 line-through">{formatCurrency(compareAtPrice)}</p>
                    )}
                </div>
            </div>
        </Link>
    );
}