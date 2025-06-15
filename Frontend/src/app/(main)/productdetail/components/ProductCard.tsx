/**
 * ProductCard.tsx
 * 
 * Đây là component "Viên gạch", chỉ chịu trách nhiệm hiển thị giao diện
 * cho MỘT sản phẩm duy nhất được truyền vào.
 */
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, Eye, Star } from 'lucide-react';

// Định nghĩa cấu trúc dữ liệu cho một sản phẩm.
// Bất kỳ component nào dùng ProductCard cũng cần tuân thủ cấu trúc này.
interface Product {
    id: number;
    name: string;
    imageUrl: string;
    price: number;
    originalPrice?: number;
    discountPercent?: number;
    rating: number;
    reviewCount: number;
}

// Định nghĩa props mà component này nhận vào.
interface ProductCardProps {
    product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {

    // Hàm xử lý sự kiện khi bấm nút "Add To Cart".
    const handleAddToCart = (e: React.MouseEvent) => {
        // Ngăn không cho thẻ Link cha điều hướng trang khi bấm nút này.
        e.preventDefault();
        console.log(`Đã thêm sản phẩm "${product.name}" vào giỏ hàng.`);
        alert(`Đã thêm "${product.name}" vào giỏ hàng!`);
    };

    return (
        // Thẻ Link bao bọc toàn bộ, giúp người dùng click vào đâu cũng đi đến trang chi tiết.
        // `group` là class quan trọng để kích hoạt hiệu ứng hover cho các phần tử con.
        <Link href={`/productdetail/${product.id}`} className="block group">

            {/* Khối chứa ảnh và các nút bấm, có hiệu ứng hover */}
            <div className="relative overflow-hidden rounded-md bg-gray-100">

                {/* Phần chứa ảnh chính */}
                <div className="relative aspect-square">
                    <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover"
                    />

                    {/* Tag giảm giá: Chỉ hiển thị khi có discountPercent > 0 */}
                    {product.discountPercent && product.discountPercent > 0 && (
                        <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-semibold px-2.5 py-1 rounded">
                            -{product.discountPercent}%
                        </div>
                    )}

                    {/* Các nút icon ở góc trên bên phải */}
                    <div className="absolute top-3 right-3 flex flex-col gap-2">
                        <button className="bg-white p-2 rounded-full shadow-md hover:bg-gray-200 transition">
                            <Heart size={20} />
                        </button>
                        <button className="bg-white p-2 rounded-full shadow-md hover:bg-gray-200 transition">
                            <Eye size={20} />
                        </button>
                    </div>
                </div>

                {/* Nút "Add To Cart": Chỉ hiện ra khi hover vào thẻ sản phẩm */}
                <button
                    onClick={handleAddToCart}
                    className="absolute bottom-0 left-0 w-full bg-black text-white py-3 text-center font-semibold
                               transform translate-y-full group-hover:translate-y-0 
                               transition-transform duration-300 ease-in-out">
                    Add To Cart
                </button>
            </div>

            {/* Khối chứa thông tin sản phẩm bên dưới ảnh */}
            <div className="mt-3">
                <h3 className="text-base font-medium text-gray-900 truncate">{product.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                    <p className="text-red-500 font-medium text-base">${product.price}</p>
                    {/* Giá gốc: Chỉ hiển thị nếu có */}
                    {product.originalPrice && (
                        <p className="text-gray-400 line-through text-sm">${product.originalPrice}</p>
                    )}
                </div>
                {/* Phần đánh giá sao */}
                <div className="flex items-center gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                        <Star key={i} size={16} className={i < Math.round(product.rating) ? "text-yellow-400 fill-current" : "text-gray-300"} />
                    ))}
                    <span className="text-xs text-gray-500 ml-1">({product.reviewCount})</span>
                </div>
            </div>
        </Link>
    );
}

export default ProductCard;