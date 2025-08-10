// export default ProductCard;
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, Eye, Star } from 'lucide-react';

// === SỬA ĐỔI 1: ĐỊNH NGHĨA CHÍNH XÁC VÀ EXPORT INTERFACE ===
// Cấu trúc này khớp với dữ liệu API trả về.
// Chúng ta cho phép `imageUrl` và `originalPrice` có thể là `null`.
export interface Product {
    id: number;
    name: string;
    imageUrl: string | null; // Cho phép null từ API
    price: number;
    originalPrice?: number | null; // Cho phép null từ API
    discountPercent?: number;
    rating: number;
    reviewCount: number;
}

// Định nghĩa props mà component này nhận vào.
interface ProductCardProps {
    product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        console.log(`Đã thêm sản phẩm "${product.name}" vào giỏ hàng.`);
        alert(`Đã thêm "${product.name}" vào giỏ hàng!`);
    };

    return (
        <Link href={`/productdetail/${product.id}`} className="block group">
            <div className="relative overflow-hidden rounded-md bg-gray-100">
                <div className="relative aspect-square">
                    <img
                        // Logic này đã xử lý tốt trường hợp imageUrl là null
                        src={product.imageUrl || '/placeholder.png'}
                        alt={product.name}
                        
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                       
                    />

                    {/* {product.discountPercent && product.discountPercent > 0 && (
                        <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-semibold px-2.5 py-1 rounded">
                            -{product.discountPercent}%
                        </div>
                    )} */}
                    <div className="absolute top-3 right-3 flex flex-col gap-2">
                        <button className="bg-white p-2 rounded-full shadow-md hover:bg-gray-200 transition">
                            <Heart size={20} />
                        </button>
                        <button className="bg-white p-2 rounded-full shadow-md hover:bg-gray-200 transition">
                            <Eye size={20} />
                        </button>
                    </div>
    </div>
            </div>

            <div className="mt-3">
                <h3 className="text-base font-medium text-gray-900 truncate">{product.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                    <p className="text-red-500 font-medium text-base">{product.price.toLocaleString('vi-VN')}₫</p>
                    {product.originalPrice && (
                        <p className="text-gray-400 line-through text-sm">{product.originalPrice.toLocaleString('vi-VN')}₫</p>
                    )}
                </div>
                <div className="flex items-center gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                        <Star key={i} size={16} className={i < Math.round(product.rating) ? "text-yellow-400 fill-current" : "text-gray-300"} />
                    ))}
                    <span className="text-xs text-gray-500 ml-1">({product.reviewCount})</span>
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;
