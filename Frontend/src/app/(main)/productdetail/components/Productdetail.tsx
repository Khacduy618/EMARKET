// components/ProductDetail.tsx

'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Image from 'next/image';
import { Loader2, Heart, Star } from 'lucide-react';
import RelatedItems from './RelatedItems';
import ProductDescription from './ProductDescription';

// --- INTERFACES: Định nghĩa cấu trúc dữ liệu ---
interface ProductDetailProps {
    productId: number;
    descriptionSlot: React.ReactNode; // <-- THÊM PROP NÀY
}
interface ProductImage {
    ImageID: number;
    ImageURL: string;
    IsPrimary: number;
}
interface Variant {
    VariantID: number;
    Price: number;
    CompareAtPrice: number;
    StockQuantity: number;
    attribute_values: {
        AttributeID: number;
        Value: string;
    }[];
}
interface Product {
    ProductID: number;
    Name: string;
    Description: string;
    Discount: number;
    images: ProductImage[];
    variants: Variant[];
}

// --- PROPS: Component này bây giờ nhận productId là một SỐ ---
interface ProductDetailProps {
    productId: number;
}

// --- HELPER FUNCTIONS (Đưa ra ngoài component) ---
const fullImageUrl = (relativeUrl: string | null) => {
    if (!relativeUrl) return '/placeholder.png';
    if (relativeUrl.startsWith('http')) return relativeUrl;
    return `http://localhost:8001${relativeUrl.startsWith('/') ? '' : '/'}${relativeUrl}`;
};

const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(price);
};

// --- COMPONENT CHÍNH ---
const ProductDetail: React.FC<ProductDetailProps> = ({ productId, descriptionSlot }) => {

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        if (!productId) return;

        const fetchProduct = async () => {
            setLoading(true);
            setError(null);
            try {
                // URL API đã đúng, không cần sửa
                const response = await axios.get(`http://localhost:8001/api/productDetail/${productId}`);
                const productData: Product = response.data;
                setProduct(productData);

                if (productData.variants?.length > 0) {
                    setSelectedVariant(productData.variants[0]);
                }
                if (productData.images?.length > 0) {
                    const primaryImage = productData.images.find(img => img.IsPrimary === 1) || productData.images[0];
                    setSelectedImage(primaryImage.ImageURL);
                }
            } catch (err) {
                console.error("Failed to fetch product:", err);
                setError("Không thể tải thông tin sản phẩm.");
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [productId]); // useEffect sẽ chạy lại nếu productId thay đổi

    // --- TYPE GUARDS: Xử lý trạng thái hiển thị ---
    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="h-12 w-12 animate-spin text-red-500" />
            </div>
        );
    }
    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <p className="text-red-600 text-xl">{error}</p>
            </div>
        );
    }
    if (!product || !selectedVariant || !selectedImage) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <p className="text-gray-500 text-xl">Không tìm thấy sản phẩm hoặc dữ liệu không hợp lệ.</p>
            </div>
        );
    }

    // --- GIAO DIỆN CHÍNH (Đã an toàn để render) ---
    return (
        <main>
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-sans">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Cột trái: Gallery ảnh */}
                    <div className="lg:col-span-7 flex flex-row gap-5">
                        <div className="flex flex-col gap-4">
                            {product.images.slice(0, 4).map((image) => (
                                <div
                                    key={image.ImageID}
                                    className={`w-28 h-28 bg-gray-100 rounded-md flex items-center justify-center cursor-pointer p-2 border-2 transition-colors
                                           hover:border-red-400
                                           ${selectedImage === image.ImageURL ? 'border-red-500' : 'border-transparent'}`}
                                    onClick={() => setSelectedImage(image.ImageURL)}
                                >
                                    <Image
                                        src={fullImageUrl(image.ImageURL)}
                                        alt="thumbnail"
                                        width={130}
                                        height={130}
                                        className="object-contain max-h-full max-w-full"
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="relative flex-1 group overflow-hidden rounded-lg bg-gray-100 border">
                            <Image
                                src={fullImageUrl(selectedImage)}
                                alt={product.Name}
                                width={600}
                                height={600}
                                className="object-contain w-full h-full p-4 transition-transform duration-500 ease-in-out group-hover:scale-110"
                                priority
                            />
                        </div>
                    </div>

                    {/* Cột phải: Thông tin sản phẩm */}
                    <div className="lg:col-span-5 flex flex-col space-y-4">
                        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">{product.Name}</h1>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center">
                                {[...Array(4)].map((_, i) => <Star key={i} size={20} className="text-yellow-400 fill-current" />)}
                                <Star size={20} className="text-gray-300 fill-current" />
                                <span className="ml-2 text-sm text-gray-500">(150 Reviews)</span>
                            </div>
                            <span className="text-gray-300">|</span>
                            <span className="text-sm font-medium text-green-600">In Stock</span>
                        </div>
                        <p className="text-3xl text-gray-900">{formatPrice(selectedVariant.Price)}</p>

                        {/* Phần lựa chọn */}
                        <div className="flex items-center space-x-3 pt-2">
                            <h3 className="text-base font-normal text-gray-900">Colours:</h3>
                            <div className="flex items-center space-x-2">
                                <button className="h-6 w-6 rounded-full border border-gray-400 focus:outline-none ring-2 ring-offset-1 ring-black" style={{ backgroundColor: 'white' }} />
                                <button className="h-6 w-6 rounded-full border border-gray-400 focus:outline-none" style={{ backgroundColor: '#DB4444' }} />
                            </div>
                        </div>

                        {/* Phần chọn số lượng và nút mua */}
                        <div className="flex items-center space-x-4 pt-4">
                            <div className="flex items-center border border-gray-400 rounded">
                                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-4 py-2 text-xl font-medium hover:bg-gray-100 rounded-l">-</button>
                                <input type="text" value={quantity} readOnly className="w-16 text-center border-l border-r py-2 focus:outline-none" />
                                <button onClick={() => setQuantity(q => q + 1)} className="px-4 py-2 text-xl font-medium bg-red-500 text-white hover:bg-red-600 rounded-r">+</button>
                            </div>
                            <button className="flex-1 bg-red-500 text-white font-medium py-3 px-6 rounded hover:bg-red-600 transition-colors">Buy Now</button>
                            <button className="p-3 border border-gray-400 rounded hover:bg-gray-100">
                                <Heart size={24} className="text-gray-800" />
                            </button>
                        </div>

                        {/* Phần thông tin thêm */}
                        <div className="border-t pt-6 space-y-4">
                            <div className="text-base">Shop Voucher: <span className="text-red-500 font-medium">Off 12$</span></div>
                            <hr />
                            <div>
                                <h4 className="font-medium text-gray-800 mb-2">Shipping Information</h4>
                                <div className="space-y-2 text-sm text-gray-600">
                                    <p>🚚 Delivery from May 14 - May 17</p>
                                    <p className="text-green-600 font-medium">✅ Free Shipping</p>
                                    <p>🎁 ₫15,000 Voucher if delivery is later than expected</p>
                                </div>
                            </div>
                            <hr />
                            <div>
                                <h4 className="font-medium text-gray-800 mb-2">Shop with Confidence</h4>
                                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                                    <li>15-Day Free Returns</li>
                                    <li>100% Genuine Products</li>
                                    <li>Worry-Free Shopping Experience</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Truyền productId (đã là number) vào RelatedItems. Lỗi đã được sửa! */}
            <RelatedItems currentProductId={productId} />
            {descriptionSlot}
        </main>
    );
};

export default ProductDetail;