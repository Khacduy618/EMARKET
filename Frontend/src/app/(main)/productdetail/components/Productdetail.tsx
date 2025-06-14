// 'use client';

// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import Image from 'next/image';
// import { Loader2, ShieldCheck, ShoppingCart, Star, Tag, Truck } from 'lucide-react';

// // --- Định nghĩa Typescript Interfaces dựa trên JSON mẫu ---

// interface ProductImage {
//     ImageID: number;
//     ProductID: number;
//     ImageURL: string;
//     IsPrimary: number;
// }

// interface AttributeValue {
//     AttributeID: number;
//     Value: string;
// }

// interface Variant {
//     VariantID: number;
//     ProductID: number;
//     SKU: string;
//     Price: number;
//     CompareAtPrice: number;
//     StockQuantity: number;
//     ImageURL: string | null;
//     attribute_values: {
//         AttributeID: number;
//         Value: string;
//     }[];
// }

// interface Product {
//     ProductID: number;
//     Name: string;
//     Description: string;
//     Discount: number;
//     images: ProductImage[];
//     variants: Variant[];
// }

// // --- Props của Component ---
// interface ProductDetailProps {
//     productId: string;
// }

// const ProductDetail: React.FC<ProductDetailProps> = ({ productId }) => {
//     // --- State Management ---
//     const [product, setProduct] = useState<Product | null>(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);
//     const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
//     const [selectedImage, setSelectedImage] = useState<string | null>(null);

//     // --- Data Fetching ---
//     useEffect(() => {
//         if (!productId) return;

//         const fetchProduct = async () => {
//             setLoading(true);
//             setError(null);
//             try {
//                 const response = await axios.get(`http://localhost:8001/api/products/${productId}`);
//                 const productData = response.data;

//                 setProduct(productData);
//                 if (productData.variants && productData.variants.length > 0) {
//                     setSelectedVariant(productData.variants[0]);
//                 }
//                 if (productData.images && productData.images.length > 0) {
//                     // SỬA Ở ĐÂY
//                     const primaryImage = productData.images.find((img: ProductImage) => img.IsPrimary === 1) || productData.images[0];
//                     setSelectedImage(primaryImage.ImageURL);
//                 }

//             } catch (err) {
//                 console.error("Failed to fetch product:", err);
//                 setError("Không thể tải thông tin sản phẩm. Vui lòng thử lại sau.");
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchProduct();
//     }, [productId]);

//     // --- Xử lý khi chọn variant (ví dụ đơn giản) ---
//     const handleVariantSelect = (variant: Variant) => {
//         setSelectedVariant(variant);
//         // Có thể cập nhật ảnh chính nếu variant có ảnh riêng
//         // if (variant.ImageURL) {
//         //   setSelectedImage(variant.ImageURL);
//         // }
//     };


//     // --- Helper function để format giá tiền ---
//     const formatPrice = (price: number) => {
//         return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
//     };

//     // --- Render Loading/Error/Product ---
//     if (loading) {
//         return (
//             <div className="flex justify-center items-center h-screen bg-white">
//                 <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
//             </div>
//         );
//     }

//     if (error) {
//         return (
//             <div className="flex justify-center items-center h-screen bg-white">
//                 <p className="text-red-500 text-xl">{error}</p>
//             </div>
//         );
//     }

//     if (!product || !selectedVariant) {
//         return (
//             <div className="flex justify-center items-center h-screen bg-white">
//                 <p className="text-gray-500 text-xl">Không tìm thấy sản phẩm.</p>
//             </div>
//         );
//     }

//     // --- Giao diện chính ---
//     return (
//         <div className="bg-white font-sans">
//             <div className="container mx-auto px-4 py-8">
//                 {/* Breadcrumbs */}
//                 <div className="text-sm text-gray-600 mb-4">
//                     <span>Trang chủ</span>  <span>Điện thoại</span> <span>{product.Name}</span>
//                 </div>

//                 {/* Product Name */}
//                 <h1 className="text-2xl font-bold text-gray-800 mb-2">{product.Name}</h1>
//                 <div className="flex items-center space-x-4 mb-6">
//                     <div className="flex items-center">
//                         {[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />)}
//                     </div>
//                     <a href="#reviews" className="text-sm text-blue-600 hover:underline">123 đánh giá</a>
//                 </div>


//                 <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
//                     {/* Cột trái: Hình ảnh sản phẩm */}
//                     <div className="lg:col-span-5">
//                         <div className="sticky top-8">
//                             <div className="border rounded-lg p-4 mb-4">
//                                 {selectedImage && (
//                                     <Image
//                                         src={selectedImage}
//                                         alt={product.Name}
//                                         width={500}
//                                         height={500}
//                                         className="w-full h-auto object-contain rounded-lg"
//                                         priority
//                                     />
//                                 )}
//                             </div>
//                             <div className="flex space-x-2">
//                                 {product.images.map((image) => (
//                                     <div
//                                         key={image.ImageID}
//                                         className={`cursor-pointer border-2 rounded-lg p-1 ${selectedImage === image.ImageURL ? 'border-blue-500' : 'border-transparent'}`}
//                                         onClick={() => setSelectedImage(image.ImageURL)}
//                                     >
//                                         <Image
//                                             src={image.ImageURL}
//                                             alt={`Thumbnail ${image.ImageID}`}
//                                             width={80}
//                                             height={80}
//                                             className="w-full h-auto object-contain rounded"
//                                         />
//                                     </div>
//                                 ))}
//                             </div>
//                         </div>
//                     </div>

//                     {/* Cột giữa: Lựa chọn và giá */}
//                     <div className="lg:col-span-4">
//                         <div className="flex items-baseline space-x-3 mb-4">
//                             <span className="text-3xl font-bold text-red-600">{formatPrice(selectedVariant.Price)}</span>
//                             {selectedVariant.CompareAtPrice > selectedVariant.Price && (
//                                 <span className="text-lg text-gray-500 line-through">{formatPrice(selectedVariant.CompareAtPrice)}</span>
//                             )}
//                         </div>

//                         {/* Variant options - Cần logic phức tạp hơn để nhóm theo thuộc tính */}
//                         <div className="mb-6">
//                             <h3 className="text-md font-semibold mb-2">Lựa chọn phiên bản</h3>
//                             <div className="flex flex-wrap gap-2">
//                                 {product.variants.map(variant => (
//                                     <button
//                                         key={variant.VariantID}
//                                         onClick={() => handleVariantSelect(variant)}
//                                         className={`px-4 py-2 border rounded-lg text-sm transition ${selectedVariant.VariantID === variant.VariantID ? 'border-blue-500 bg-blue-50 text-blue-600 font-semibold' : 'border-gray-300 hover:border-blue-400'}`}
//                                     >
//                                         {/* Hiển thị thuộc tính của variant, ví dụ: 256GB - Đen */}
//                                         {variant.attribute_values.map(attr => attr.Value).join(' - ')}
//                                     </button>
//                                 ))}
//                             </div>
//                         </div>

//                         <div className="border-t border-b py-4 mb-6">
//                             <h3 className="font-bold text-lg mb-3">Khuyến mãi</h3>
//                             <div className="space-y-2 text-sm">
//                                 <div className="flex items-start">
//                                     <Tag className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
//                                     <span>Giảm giá đặc biệt {product.Discount}% chỉ trong hôm nay.</span>
//                                 </div>
//                                 <div className="flex items-start">
//                                     <Tag className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
//                                     <span>Tặng kèm ốp lưng và dán màn hình trị giá 300.000đ.</span>
//                                 </div>
//                                 <div className="flex items-start">
//                                     <Tag className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
//                                     <span>Hỗ trợ trả góp 0% qua thẻ tín dụng.</span>
//                                 </div>
//                             </div>
//                         </div>

//                         <button className="w-full bg-red-600 text-white rounded-lg py-4 text-lg font-bold hover:bg-red-700 transition mb-3">
//                             MUA NGAY
//                             <span className="block text-xs font-normal">Giao hàng tận nơi hoặc nhận tại cửa hàng</span>
//                         </button>
//                         <div className="flex space-x-3">
//                             <button className="w-1/2 bg-blue-600 text-white rounded-lg py-3 font-bold hover:bg-blue-700 transition flex items-center justify-center space-x-2">
//                                 <ShoppingCart className="h-5 w-5" />
//                                 <span>Thêm vào giỏ</span>
//                             </button>
//                             <button className="w-1/2 border border-blue-600 text-blue-600 rounded-lg py-3 font-bold hover:bg-blue-50 transition">
//                                 Mua trả góp 0%
//                             </button>
//                         </div>
//                     </div>

//                     {/* Cột phải: Chính sách */}
//                     <div className="lg:col-span-3">
//                         <div className="border rounded-lg p-4">
//                             <ul className="space-y-3 text-sm text-gray-700">
//                                 <li className="flex items-center">
//                                     <ShieldCheck className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
//                                     <span>Bảo hành chính hãng 12 tháng.</span>
//                                 </li>
//                                 <li className="flex items-center">
//                                     <Truck className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0" />
//                                     <span>Miễn phí giao hàng toàn quốc.</span>
//                                 </li>
//                                 <li className="flex items-center">
//                                     <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500 mr-3 flex-shrink-0"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" /><path d="m9 12 2 2 4-4" /></svg>
//                                     <span>Hàng nguyên seal, chính hãng VN/A.</span>
//                                 </li>
//                             </ul>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Phần mô tả và thông số kỹ thuật */}
//                 <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
//                     <div className="lg:col-span-7">
//                         <div className="p-6 border rounded-lg">
//                             <h2 className="text-xl font-bold mb-4">Mô tả sản phẩm</h2>
//                             <p className="text-gray-700 leading-relaxed whitespace-pre-line">
//                                 {product.Description}
//                             </p>
//                         </div>
//                     </div>
//                     <div className="lg:col-span-5">
//                         <div className="p-6 border rounded-lg">
//                             <h2 className="text-xl font-bold mb-4">Thông số kỹ thuật</h2>
//                             <ul className="space-y-3">
//                                 {selectedVariant.attribute_values.map(attr => (
//                                     <li key={attr.AttributeID} className="flex justify-between p-2 rounded-md even:bg-gray-100">
//                                         <span className="text-gray-600">
//                                             {/* Bạn có thể cần một map để chuyển AttributeID thành tên thuộc tính (ví dụ: 1 -> "Màu sắc") */}
//                                             Thuộc tính {attr.AttributeID}
//                                         </span>
//                                         <span className="font-semibold text-gray-800">{attr.Value}</span>
//                                     </li>
//                                 ))}
//                             </ul>
//                         </div>
//                     </div>
//                 </div>

//             </div>
//         </div>
//     );
// };

// export default ProductDetail;

// src/app/(main)/productdetail/components/Productdetail.tsx
'use client'; // Đảm bảo component này là Client Component

import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify'; // Hoặc 'react-hot-toast'
import { useRouter } from 'next/navigation';

// Import chính xác các types bạn đã cung cấp
import { Product, ProductVariant, AttributeValue, Shop } from '@/types';
import { addCartItem } from '@/services/cart';
import { getProductAttributes } from '@/services/api'; // Giả định getProductAttributes vẫn nằm ở services/api

interface ProductDetailProps {
    // Component này nhận một đối tượng Product đầy đủ làm props
    product: Product;
    // initialVariant có thể được dùng để chỉ định variant mặc định khi load trang,
    // hoặc bạn có thể tự chọn variant đầu tiên nếu không có
    initialVariant?: ProductVariant;
}

const Productdetail: React.FC<ProductDetailProps> = ({ product, initialVariant }) => {
    const router = useRouter();
    const [selectedQuantity, setSelectedQuantity] = useState<number>(1);
    // selectedVariant sẽ là một đối tượng ProductVariant đầy đủ
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
    const [attributeOptions, setAttributeOptions] = useState<{ [key: string]: AttributeValue[] } | null>(null);
    const [loadingAttributes, setLoadingAttributes] = useState<boolean>(false);

    // useEffect để thiết lập variant mặc định khi component mount hoặc product thay đổi
    useEffect(() => {
        if (product && product.productVariants && product.productVariants.length > 0) {
            // Nếu có initialVariant được truyền vào, dùng nó. Ngược lại, chọn variant đầu tiên.
            setSelectedVariant(initialVariant || product.productVariants[0]);
        }
    }, [product, initialVariant]);

    // Hàm để lấy và hiển thị các tùy chọn thuộc tính (ví dụ: cho dropdown selection)
    // Lưu ý: hàm getProductAttributes của bạn trả về `attributes` là một map `{ [key: string]: any }`
    // Do đó, cần xử lý để khớp với `AttributeValue[]`
    const fetchAndSetAttributes = useCallback(async (productId: number) => {
        setLoadingAttributes(true);
        try {
            const responseData = await getProductAttributes(productId);
            // responseData.attributes được mô tả là {[key: string]: any}, cần cast hoặc xử lý
            const actualAttributes = responseData.attributes;

            const transformedAttributes: {
                [key: string]: AttributeValue[]; // Expected type
            } = {};

            if (actualAttributes && typeof actualAttributes === 'object') {
                for (const attributeName in actualAttributes) {
                    if (actualAttributes.hasOwnProperty(attributeName) && Array.isArray(actualAttributes[attributeName])) {
                        // Đây là nơi bạn cần đảm bảo dữ liệu khớp với AttributeValue interface
                        // transformedAttributes[attributeName] = actualAttributes[attributeName].map((attrVal: any) => ({
                        //     AttributeValueID: attrVal.AttributeValueID,
                        //     AttributeID: attrVal.AttributeID,
                        //     Value: attrVal.Value,
                        //     attribute: { // Giả định backend trả về đủ Attribute
                        //         AttributeID: attrVal.AttributeID,
                        //         Name: attrVal.AttributeName // Backend của bạn có AttributeName
                        //     }
                        // }));
                        transformedAttributes[attributeName] = actualAttributes[attributeName].map((attrVal: any) => ({
                            AttributeValueID: attrVal.AttributeValueID,
                            AttributeID: attrVal.AttributeID,
                            Value: attrVal.Value,
                            attribute: { // Đây là nơi cấu trúc khớp với definition mới
                                AttributeID: attrVal.AttributeID,
                                Name: attrVal.AttributeName
                            }
                        }));
                    }
                }
            }
            setAttributeOptions(transformedAttributes);
        } catch (error: any) {
            console.error('Lỗi khi lấy thuộc tính:', error);
            toast.error(error.response?.data?.message || 'Không thể tải các thuộc tính sản phẩm.');
        } finally {
            setLoadingAttributes(false);
        }
    }, []);

    // Fetch attributes khi product.ProductID thay đổi
    useEffect(() => {
        if (product?.ProductID) {
            fetchAndSetAttributes(product.ProductID);
        }
    }, [product?.ProductID, fetchAndSetAttributes]);


    const handleQuantityChange = (type: 'increase' | 'decrease' | 'input', value?: string) => {
        let newQuantity = selectedQuantity;
        const maxStock = selectedVariant?.StockQuantity ?? 0; // Sử dụng nullish coalescing

        if (type === 'increase') {
            newQuantity = selectedQuantity + 1;
        } else if (type === 'decrease') {
            newQuantity = selectedQuantity - 1;
        } else if (type === 'input' && value !== undefined) {
            const parsedValue = parseInt(value);
            newQuantity = isNaN(parsedValue) ? 1 : parsedValue;
        }

        // Đảm bảo số lượng không nhỏ hơn 1 (trên UI của product detail)
        newQuantity = Math.max(1, newQuantity);

        // Đảm bảo số lượng không vượt quá tồn kho
        if (maxStock > 0) {
            if (newQuantity > maxStock) {
                newQuantity = maxStock;
                toast.warn(`Số lượng không thể vượt quá tồn kho (${maxStock}).`);
            }
        } else { // Nếu tồn kho là 0 hoặc không xác định (maxStock <= 0)
            newQuantity = 1; // Giữ ở 1 để nút "Thêm vào giỏ hàng" hiển thị "Hết hàng" và bị disable
            if (selectedVariant?.StockQuantity === 0 && (type === 'increase' || type === 'input')) {
                toast.error("Sản phẩm này hiện đã hết hàng.");
            }
        }

        // Cập nhật state nếu số lượng thay đổi
        if (newQuantity !== selectedQuantity) {
            setSelectedQuantity(newQuantity);
        }
    };

    const handleAddToCart = async () => {
        if (!selectedVariant) {
            toast.error("Vui lòng chọn một phiên bản sản phẩm.");
            return;
        }
        if (selectedQuantity <= 0) {
            toast.error("Số lượng phải lớn hơn 0.");
            return;
        }
        if (selectedVariant.StockQuantity === 0) {
            toast.error("Sản phẩm này hiện đã hết hàng.");
            return;
        }
        if (selectedQuantity > selectedVariant.StockQuantity) {
            toast.error(`Số lượng yêu cầu vượt quá số lượng sản phẩm có sẵn trong kho. Chỉ còn ${selectedVariant.StockQuantity} sản phẩm.`);
            return;
        }

        try {
            // Lấy VariantID từ selectedVariant
            const variantID = selectedVariant.VariantID;
            // Lấy ShopID từ product cha
            const shopID = product.ShopID;

            if (!variantID || !shopID) {
                toast.error("Thiếu thông tin cần thiết để thêm vào giỏ hàng. Vui lòng thử lại.");
                return;
            }

            // Gọi hàm addCartItem từ services/cart.ts
            // Hàm này mong đợi variantId, quantity, shopId
            const updatedCart = await addCartItem(variantID, selectedQuantity, shopID);

            // Hiển thị thông báo thành công
            toast.success((updatedCart as any).message || "Sản phẩm đã được thêm vào giỏ hàng!");

            // Tùy chọn: chuyển hướng hoặc refresh trạng thái giỏ hàng
            // router.push('/cart');
        } catch (error: any) {
            console.error("Lỗi khi thêm vào giỏ hàng:", error);
            const errorMessage = error.response?.data?.message || "Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng.";
            // Thêm logic hiển thị available_stock nếu có từ backend
            if (error.response?.data?.available_stock !== undefined) {
                toast.error(`${errorMessage} (Tồn kho: ${error.response.data.available_stock})`);
            } else {
                toast.error(errorMessage);
            }
        }
    };

    // Hiển thị loading hoặc thông báo nếu không có sản phẩm/variant
    if (!product || !selectedVariant) {
        return <div className="text-center py-8">Đang tải chi tiết sản phẩm...</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">{product.Name}</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Product Image */}
                <div>
                    {selectedVariant.ImageURL ? (
                        <img src={selectedVariant.ImageURL} alt={product.Name} className="w-full h-auto object-cover rounded-lg shadow-md" />
                    ) : (
                        <div className="w-full h-80 bg-gray-200 flex items-center justify-center rounded-lg text-gray-500">
                            Không có hình ảnh
                        </div>
                    )}
                </div>

                {/* Product Details */}
                <div>
                    <p className="text-gray-700 mb-2">{product.Description}</p>
                    <div className="text-xl font-semibold text-red-600 mb-4">
                        {selectedVariant.CompareAtPrice && selectedVariant.CompareAtPrice > selectedVariant.Price ? (
                            <>
                                <span className="line-through text-gray-500 text-sm mr-2">
                                    ₫{selectedVariant.CompareAtPrice.toLocaleString('vi-VN')}
                                </span>
                                ₫{selectedVariant.Price.toLocaleString('vi-VN')}
                            </>
                        ) : (
                            `₫${selectedVariant.Price.toLocaleString('vi-VN')}`
                        )}
                    </div>

                    {/* Attribute Selection for Variants */}
                    {product.productVariants && product.productVariants.length > 1 && (
                        <div className="mb-4">
                            <h3 className="font-semibold mb-2">Chọn phân loại:</h3>
                            <div className="flex flex-wrap gap-2">
                                {product.productVariants.map(variant => (
                                    <button
                                        key={variant.VariantID}
                                        className={`px-4 py-2 border rounded-md text-sm transition-all duration-200
                                            ${selectedVariant?.VariantID === variant.VariantID
                                                ? 'bg-red-500 text-white border-red-500'
                                                : 'bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200'
                                            }`}
                                        onClick={() => setSelectedVariant(variant)}
                                        // Disable nếu variant đó hết hàng
                                        disabled={variant.StockQuantity === 0}
                                    >
                                        {/* Hiển thị các thuộc tính của variant */}
                                        {variant.attributeValues && variant.attributeValues.length > 0
                                            ? variant.attributeValues.map(attr => attr.Value).join(' - ')
                                            : `Mã SP: ${variant.SKU || variant.VariantID}`}
                                        {variant.StockQuantity === 0 && <span className="ml-2 text-xs opacity-70">(Hết hàng)</span>}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Display current selected variant's attributes */}
                    {selectedVariant?.attributeValues && selectedVariant.attributeValues.length > 0 && (
                        <p className="text-sm text-gray-600 mb-2">
                            Phân loại đang chọn: <span className="font-medium">{selectedVariant.attributeValues.map(attr => attr.Value).join(' - ')}</span>
                        </p>
                    )}


                    <p className="text-sm text-gray-600 mb-4">
                        Tồn kho: <span className="font-medium">{selectedVariant.StockQuantity}</span> sản phẩm
                    </p>

                    {/* Quantity Selector */}
                    <div className="flex items-center space-x-3 mb-6">
                        <span className="font-semibold">Số lượng:</span>
                        <div className="flex items-center border rounded-md">
                            <button
                                onClick={() => handleQuantityChange('decrease')}
                                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-l-md"
                                disabled={selectedQuantity <= 1}
                            >
                                -
                            </button>
                            <input
                                type="number"
                                value={selectedQuantity}
                                onChange={(e) => handleQuantityChange('input', e.target.value)}
                                min="1"
                                // Max được đặt bằng StockQuantity của selectedVariant
                                max={selectedVariant.StockQuantity}
                                className="w-16 text-center border-l border-r outline-none"
                            />
                            <button
                                onClick={() => handleQuantityChange('increase')}
                                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-r-md"
                                disabled={selectedQuantity >= selectedVariant.StockQuantity || selectedVariant.StockQuantity === 0}
                            >
                                +
                            </button>
                        </div>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                        onClick={handleAddToCart}
                        className={`w-full py-3 rounded-lg text-white font-semibold transition-colors duration-200
                            ${selectedVariant.StockQuantity === 0
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-red-500 hover:bg-red-600'
                            }`}
                        disabled={selectedVariant.StockQuantity === 0}
                    >
                        {selectedVariant.StockQuantity === 0 ? 'Hết hàng' : 'Thêm vào giỏ hàng'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Productdetail;