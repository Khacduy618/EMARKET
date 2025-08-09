// app/categoryDetail/components/ProductCard.tsx
import Link from 'next/link';
import Image from 'next/image';

// --- THÊM TYPE TRỰC TIẾP VÀO ĐÂY ---
interface Variant {
    VariantID: number;
    Price: number;
    CompareAtPrice: number | null;
}

interface ProductImage {
    ImageID: number;
    ImageURL: string;
    IsPrimary: number;
}

interface Product {
    ProductID: number;
    Name: string;
    images: ProductImage[];
    variants: Variant[];
}
// --- KẾT THÚC PHẦN THÊM TYPE ---


const formatCurrency = (amount: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
const getImageUrl = (url: string | null | undefined) => {
    if (!url) return '/placeholder.svg';
    if (url.startsWith('http')) return url;
    return `http://localhost${url}`;
};

export default function ProductCard({ product }: { product: Product }) {
    const defaultVariant = product.variants?.[0];
    if (!defaultVariant) return null;

    // Bây giờ TypeScript đã biết 'product.images' là một mảng ProductImage[]
    // và 'img' sẽ có kiểu là ProductImage. Lỗi sẽ hết.
    const primaryImage = product.images?.find((img: ProductImage) => img.IsPrimary === 1) || product.images?.[0];

    const price = defaultVariant.Price;
    const compareAtPrice = defaultVariant.CompareAtPrice;
    const hasDiscount = compareAtPrice && compareAtPrice > price;
    const discountPercent = hasDiscount ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100) : 0;

    return (
        <Link
            href={`/products/${product.ProductID}`}
            className="group block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
        >
            <div className="relative w-full aspect-square">
                <Image
                    src={getImageUrl(primaryImage?.ImageURL)}
                    alt={product.Name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {hasDiscount && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                        -{discountPercent}%
                    </div>
                )}
            </div>
            <div className="p-3">
                <h3 title={product.Name} className="text-sm font-medium text-gray-800 h-10 overflow-hidden">
                    {product.Name}
                </h3>
                <div className="mt-2 flex flex-col items-start">
                    <p className="text-base font-bold text-red-600">{formatCurrency(price)}</p>
                    {hasDiscount && (
                        <p className="text-xs text-gray-500 line-through">{formatCurrency(compareAtPrice)}</p>
                    )}
                </div>
            </div>

        </Link>
    );
}