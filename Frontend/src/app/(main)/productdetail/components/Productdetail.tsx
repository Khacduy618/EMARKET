
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
//  'use client';

// import React, { useState, useEffect, useCallback } from 'react'; // Thêm useCallback
// import axios from 'axios';
// import Image from 'next/image';
// import { Loader2, ShieldCheck, ShoppingCart, Star, Tag, Truck } from 'lucide-react';
// import { toast } from 'react-toastify'; // Import toast
// import { addCartItem } from '@/services/cart'; // Đảm bảo đường dẫn này đúng

// // --- Định nghĩa Typescript Interfaces dựa trên JSON mẫu ---
// interface ProductImage {
//     ImageID: number;
//     ProductID: number;
//     ImageURL: string;
//     IsPrimary: number;
//     CreatedAt?: string;
//     UpdatedAt?: string;
// }

// interface AttributeValue {
//     AttributeValueID?: number;
//     AttributeID: number;
//     Value: string;
//     CreatedAt?: string;
//     UpdatedAt?: string;
//     pivot?: { VariantID: number; AttributeValueID: number; };
// }

// interface Variant {
//     VariantID: number;
//     ProductID: number;
//     SKU: string;
//     Price: number;
//     CompareAtPrice: number;
//     StockQuantity: number;
//     ImageURL: string | null;
//     IsActive: number; // Assuming 1 for active, 0 for inactive based on JSON
//     CreatedAt?: string;
//     UpdatedAt?: string;
//     attribute_values: AttributeValue[];
// }

// interface Product {
//     ProductID: number;
//     ShopID: number; // Đảm bảo trường này có trong interface của bạn
//     CategoryID?: number | null;
//     Name: string;
//     Description: string;
//     Discount: number;
//     viewCount?: number | null;
//     IsActive: boolean;
//     AdminApprovalStatus: 'Pending' | 'Approved' | 'Rejected';
//     ReasonForRejection?: string | null;
//     CreatedAt: string;
//     UpdatedAt: string;
//     images: ProductImage[];
//     variants: Variant[];
// }

// // --- Props của Component ---
// interface ProductDetailProps {
//     productId: string;
// }

// // Base URL cho hình ảnh được phục vụ từ backend (nếu là đường dẫn tương đối)
// const IMAGE_BASE_URL = 'http://localhost:8001';

// // Helper function để resolve Image URL
// const resolveImageUrl = (url: string | null): string => {
//     if (!url) return 'https://via.placeholder.com/300x300/F0F0F0/AAAAAA?text=No+Image';
//     if (url.startsWith('http://') || url.startsWith('https://')) {
//         return url;
//     }
//     return `${IMAGE_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
// };

// const ProductDetail: React.FC<ProductDetailProps> = ({ productId }) => {
//     // --- State Management ---
//     const [product, setProduct] = useState<Product | null>(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);
//     const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
//     const [selectedImage, setSelectedImage] = useState<string | null>(null);
//     const [quantity, setQuantity] = useState<number>(1);

//     // Helper function để hiển thị thông báo toast
//     const showNotification = useCallback((message: string, type: 'success' | 'error' | 'warning', duration: number = 3000) => {
//         switch (type) {
//             case 'success':
//                 toast.success(message, { autoClose: duration });
//                 break;
//             case 'error':
//                 toast.error(message, { autoClose: duration });
//                 break;
//             case 'warning':
//                 toast.warn(message, { autoClose: duration });
//                 break;
//             default:
//                 toast.info(message, { autoClose: duration });
//         }
//     }, []); // Dependency array trống vì hàm này không phụ thuộc vào bất kỳ state hay props nào thay đổi.


//     // --- Data Fetching ---
//     useEffect(() => {
//         if (!productId) {
//             setError("Không có ID sản phẩm.");
//             setLoading(false);
//             return;
//         }

//         const fetchProduct = async () => {
//             setLoading(true);
//             setError(null);
//             try {
//                 const response = await axios.get(`${IMAGE_BASE_URL}/api/products/${productId}`);
//                 const productData: Product = response.data;

//                 setProduct(productData);

//                 const initialVariant = productData.variants.find(v => v.StockQuantity > 0) || productData.variants[0];
//                 if (initialVariant) {
//                     setSelectedVariant(initialVariant);
//                     setSelectedImage(resolveImageUrl(initialVariant.ImageURL || productData.images[0]?.ImageURL || null));
//                 } else if (productData.images && productData.images.length > 0) {
//                     setSelectedImage(resolveImageUrl(productData.images[0].ImageURL));
//                 } else {
//                     setSelectedImage(null);
//                 }
//                 setQuantity(1);

//             } catch (err) {
//                 console.error("Failed to fetch product:", err);
//                 if (axios.isAxiosError(err) && err.response?.status === 404) {
//                     setError("Không tìm thấy sản phẩm.");
//                     showNotification("Không tìm thấy sản phẩm.", 'error'); // Sử dụng showNotification
//                 } else {
//                     setError("Không thể tải thông tin sản phẩm. Vui lòng thử lại sau.");
//                     showNotification("Không thể tải thông tin sản phẩm. Vui lòng thử lại sau.", 'error'); // Sử dụng showNotification
//                 }
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchProduct();
//     }, [productId, showNotification]); // Thêm showNotification vào dependency array

//     // --- Xử lý khi chọn variant ---
//     const handleVariantSelect = (variant: Variant) => {
//         setSelectedVariant(variant);
//         setQuantity(1);
//         if (variant.ImageURL) {
//             setSelectedImage(resolveImageUrl(variant.ImageURL));
//         } else if (product?.images && product.images.length > 0) {
//             setSelectedImage(resolveImageUrl(product.images.find(img => img.IsPrimary === 1)?.ImageURL || product.images[0].ImageURL));
//         } else {
//             setSelectedImage(null);
//         }
//     };

//     // --- Xử lý thay đổi số lượng ---
//     const handleQuantityChange = (type: 'increase' | 'decrease' | 'input', value?: string) => {
//         if (!selectedVariant) return;

//         let newQuantity = quantity;
//         const maxStock = selectedVariant.StockQuantity;

//         if (type === 'increase') {
//             newQuantity = quantity + 1;
//         } else if (type === 'decrease') {
//             newQuantity = quantity - 1;
//         } else if (type === 'input' && value !== undefined) {
//             const parsedValue = parseInt(value);
//             newQuantity = isNaN(parsedValue) ? 1 : parsedValue;
//         }

//         newQuantity = Math.max(1, newQuantity);

//         if (maxStock > 0 && newQuantity > maxStock) {
//             newQuantity = maxStock;
//             showNotification(`Số lượng không thể vượt quá tồn kho (${maxStock}).`, 'warning'); // Sử dụng showNotification
//         } else if (maxStock === 0) {
//             newQuantity = 0;
//             if (type === 'increase' || (type === 'input' && parseInt(value || '0') > 0)) {
//                 showNotification("Sản phẩm này hiện đã hết hàng.", 'error'); // Sử dụng showNotification
//             }
//         }

//         if (newQuantity !== quantity) {
//             setQuantity(newQuantity);
//         }
//     };


//     // --- Hàm thêm vào giỏ hàng ---
//     const handleAddToCart = async () => {
//         if (!product || !selectedVariant) {
//             showNotification("Vui lòng chọn một phiên bản sản phẩm.", 'error'); // Sử dụng showNotification
//             return;
//         }
//         if (quantity <= 0) {
//             showNotification("Số lượng phải lớn hơn 0.", 'error'); // Sử dụng showNotification
//             return;
//         }
//         if (selectedVariant.StockQuantity === 0) {
//             showNotification("Sản phẩm này hiện đã hết hàng.", 'error'); // Sử dụng showNotification
//             return;
//         }
//         if (quantity > selectedVariant.StockQuantity) {
//             showNotification(`Số lượng yêu cầu vượt quá số lượng sản phẩm có sẵn trong kho. Chỉ còn ${selectedVariant.StockQuantity} sản phẩm.`, 'error'); // Sử dụng showNotification
//             return;
//         }

//         try {
//             const variantID = selectedVariant.VariantID;
//             const shopID = product.ShopID;

//             if (!variantID || !shopID) {
//                 showNotification("Thiếu thông tin cần thiết để thêm vào giỏ hàng. Vui lòng thử lại.", 'error'); // Sử dụng showNotification
//                 return;
//             }

//             const response = await addCartItem(variantID, quantity, shopID);
//             showNotification(response.message || "Sản phẩm đã được thêm vào giỏ hàng!", 'success'); // Sử dụng showNotification

//         } catch (error: any) {
//             console.error("Lỗi khi thêm vào giỏ hàng:", error);
//             const errorMessage = error.response?.data?.message || "Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng.";
//             if (error.response?.data?.available_stock !== undefined) {
//                 showNotification(`${errorMessage} (Tồn kho: ${error.response.data.available_stock})`, 'error'); // Sử dụng showNotification
//             } else {
//                 showNotification(errorMessage, 'error'); // Sử dụng showNotification
//             }
//         }
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
//                 <p className="text-gray-500 text-xl">Sản phẩm không có dữ liệu hợp lệ.</p>
//             </div>
//         );
//     }

//     // --- Giao diện chính ---
//     return (
//         <div className="bg-white font-sans">
//             <div className="container mx-auto px-4 py-8">
//                 {/* Breadcrumbs */}
//                 <div className="text-sm text-gray-600 mb-4">
//                     <span>Trang chủ</span> / <span>Điện thoại</span> / <span>{product.Name}</span>
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
//                             <div className="border rounded-lg p-4 mb-4 flex justify-center items-center h-96">
//                                 {selectedImage && (
//                                     <Image
//                                         src={selectedImage}
//                                         alt={product.Name}
//                                         width={500}
//                                         height={500}
//                                         className="object-contain rounded-lg"
//                                         priority
//                                     />
//                                 )}
//                             </div>
//                             <div className="flex space-x-2 overflow-x-auto pb-2">
//                                 {product.images.map((image) => (
//                                     <div
//                                         key={image.ImageID}
//                                         className={`flex-shrink-0 cursor-pointer border-2 rounded-lg p-1 ${selectedImage === resolveImageUrl(image.ImageURL) ? 'border-blue-500' : 'border-transparent'}`}
//                                         onClick={() => setSelectedImage(resolveImageUrl(image.ImageURL))}
//                                     >
//                                         <Image
//                                             src={resolveImageUrl(image.ImageURL)}
//                                             alt={`Thumbnail ${image.ImageID}`}
//                                             width={80}
//                                             height={80}
//                                             className="object-contain rounded"
//                                         />
//                                     </div>
//                                 ))}
//                                 {product.variants.filter(v => v.ImageURL && !product.images.some(img => img.ImageURL === v.ImageURL)).map(variant => (
//                                     <div
//                                         key={`variant-thumb-${variant.VariantID}`}
//                                         className={`flex-shrink-0 cursor-pointer border-2 rounded-lg p-1 ${selectedImage === resolveImageUrl(variant.ImageURL) ? 'border-blue-500' : 'border-transparent'}`}
//                                         onClick={() => setSelectedImage(resolveImageUrl(variant.ImageURL))}
//                                     >
//                                         <Image
//                                             src={resolveImageUrl(variant.ImageURL)}
//                                             alt={`Thumbnail ${variant.SKU}`}
//                                             width={80}
//                                             height={80}
//                                             className="object-contain rounded"
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
//                                         className={`px-4 py-2 border rounded-lg text-sm transition
//                                             ${selectedVariant.VariantID === variant.VariantID
//                                                 ? 'border-blue-500 bg-blue-50 text-blue-600 font-semibold'
//                                                 : 'border-gray-300 hover:border-blue-400'
//                                             }
//                                             ${variant.StockQuantity === 0 ? 'opacity-50 cursor-not-allowed' : ''}
//                                             `}
//                                         disabled={variant.StockQuantity === 0}
//                                     >
//                                         {variant.attribute_values.map(attr => attr.Value).join(' - ')}
//                                         {variant.StockQuantity === 0 && <span className="ml-2 text-xs">(Hết hàng)</span>}
//                                     </button>
//                                 ))}
//                             </div>
//                         </div>

//                         <p className="text-sm text-gray-600 mb-4">
//                             Tồn kho: <span className="font-medium">{selectedVariant.StockQuantity}</span> sản phẩm
//                         </p>

//                         <div className="flex items-center space-x-3 mb-6">
//                             <span className="font-semibold">Số lượng:</span>
//                             <div className="flex items-center border rounded-md">
//                                 <button
//                                     onClick={() => handleQuantityChange('decrease')}
//                                     className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-l-md"
//                                     disabled={quantity <= 1 || selectedVariant.StockQuantity === 0}
//                                 >
//                                     -
//                                 </button>
//                                 <input
//                                     type="number"
//                                     value={quantity}
//                                     onChange={(e) => handleQuantityChange('input', e.target.value)}
//                                     min="1"
//                                     max={selectedVariant.StockQuantity > 0 ? selectedVariant.StockQuantity : 1}
//                                     className="w-16 text-center border-l border-r outline-none"
//                                     disabled={selectedVariant.StockQuantity === 0}
//                                 />
//                                 <button
//                                     onClick={() => handleQuantityChange('increase')}
//                                     className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-r-md"
//                                     disabled={quantity >= selectedVariant.StockQuantity || selectedVariant.StockQuantity === 0}
//                                 >
//                                     +
//                                 </button>
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
//                             <button
//                                 onClick={handleAddToCart}
//                                 className={`w-1/2 rounded-lg py-3 font-bold transition flex items-center justify-center space-x-2
//                                     ${selectedVariant.StockQuantity === 0 || quantity === 0
//                                         ? 'bg-gray-400 cursor-not-allowed'
//                                         : 'bg-blue-600 text-white hover:bg-blue-700'
//                                     }`}
//                                 disabled={selectedVariant.StockQuantity === 0 || quantity === 0}
//                             >
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

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Image from 'next/image';
import { Loader2, ShieldCheck, ShoppingCart, Star, Tag, Truck } from 'lucide-react';
import { toast } from 'react-toastify';
import { addCartItem } from '@/services/cart'; // Đảm bảo đường dẫn này đúng
import ConfirmModal from '@/app/components/ConfirmModal'; // Import ConfirmModal

// --- Định nghĩa Typescript Interfaces dựa trên JSON mẫu ---

interface ProductImage {
    ImageID: number;
    ProductID: number;
    ImageURL: string;
    IsPrimary: number;
    CreatedAt?: string;
    UpdatedAt?: string;
}

interface AttributeValue {
    AttributeValueID?: number;
    AttributeID: number;
    Value: string;
    CreatedAt?: string;
    UpdatedAt?: string;
    pivot?: { VariantID: number; AttributeValueID: number; };
}

interface Variant {
    VariantID: number;
    ProductID: number;
    SKU: string;
    Price: number;
    CompareAtPrice: number;
    StockQuantity: number;
    ImageURL: string | null;
    IsActive: number;
    CreatedAt?: string;
    UpdatedAt?: string;
    attribute_values: AttributeValue[];
}

interface Product {
    ProductID: number;
    ShopID: number;
    CategoryID?: number | null;
    Name: string;
    Description: string;
    Discount: number;
    viewCount?: number | null;
    IsActive: boolean;
    AdminApprovalStatus: 'Pending' | 'Approved' | 'Rejected';
    ReasonForRejection?: string | null;
    CreatedAt: string;
    UpdatedAt: string;
    images: ProductImage[];
    variants: Variant[];
}

// Props của Component
interface ProductDetailProps {
    productId: string;
}

const IMAGE_BASE_URL = 'http://localhost:8001';

const resolveImageUrl = (url: string | null): string => {
    if (!url) return 'https://via.placeholder.com/300x300/F0F0F0/AAAAAA?text=No+Image';
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }
    return `${IMAGE_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};


const ProductDetail: React.FC<ProductDetailProps> = ({ productId }) => {
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [quantity, setQuantity] = useState<number>(1);

    // NEW: State cho ConfirmModal số lượng lớn
    const [showLargeQuantityConfirm, setShowLargeQuantityConfirm] = useState(false);
    const [largeQuantityPromptInfo, setLargeQuantityPromptInfo] = useState<{ productName: string; shopPhone: string } | null>(null);

    const showNotification = useCallback((message: string, type: 'success' | 'error' | 'warning' | 'info', duration: number = 3000) => {
        switch (type) {
            case 'success':
                toast.success(message, { autoClose: duration });
                break;
            case 'error':
                toast.error(message, { autoClose: duration });
                break;
            case 'warning':
                toast.warn(message, { autoClose: duration });
                break;
            case 'info':
                toast.info(message, { autoClose: duration });
            default:
                toast.info(message, { autoClose: duration });
        }
    }, []);

    useEffect(() => {
        if (!productId) {
            setError("Không có ID sản phẩm.");
            setLoading(false);
            return;
        }

        const fetchProduct = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get(`${IMAGE_BASE_URL}/api/products/${productId}`);
                const productData: Product = response.data;

                setProduct(productData);

                const initialVariant = productData.variants.find(v => v.StockQuantity > 0) || productData.variants[0];
                if (initialVariant) {
                    setSelectedVariant(initialVariant);
                    setSelectedImage(resolveImageUrl(initialVariant.ImageURL || productData.images[0]?.ImageURL || null));
                } else if (productData.images && productData.images.length > 0) {
                    setSelectedImage(resolveImageUrl(productData.images[0].ImageURL));
                } else {
                    setSelectedImage(null);
                }
                setQuantity(1);

            } catch (err) {
                console.error("Failed to fetch product:", err);
                if (axios.isAxiosError(err) && err.response?.status === 404) {
                    setError("Không tìm thấy sản phẩm.");
                    showNotification("Không tìm thấy sản phẩm.", 'error');
                } else {
                    setError("Không thể tải thông tin sản phẩm. Vui lòng thử lại sau.");
                    showNotification("Không thể tải thông tin sản phẩm. Vui lòng thử lại sau.", 'error');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [productId, showNotification]);

    const handleVariantSelect = (variant: Variant) => {
        setSelectedVariant(variant);
        setQuantity(1);
        if (variant.ImageURL) {
            setSelectedImage(resolveImageUrl(variant.ImageURL));
        } else if (product?.images && product.images.length > 0) {
            setSelectedImage(resolveImageUrl(product.images.find(img => img.IsPrimary === 1)?.ImageURL || product.images[0].ImageURL));
        } else {
            setSelectedImage(null);
        }
    };

    const handleQuantityChange = (type: 'increase' | 'decrease' | 'input', value?: string) => {
        if (!selectedVariant) return;

        let newQuantity = quantity;
        const maxStock = selectedVariant.StockQuantity;
        const hardLimit = 10; // Hard limit for display/input

        if (type === 'increase') {
            newQuantity = quantity + 1;
        } else if (type === 'decrease') {
            newQuantity = quantity - 1;
        } else if (type === 'input' && value !== undefined) {
            const parsedValue = parseInt(value);
            newQuantity = isNaN(parsedValue) ? 1 : parsedValue;
        }

        newQuantity = Math.max(1, newQuantity); // Minimum 1 for display/input

        if (maxStock > 0 && newQuantity > maxStock) {
            newQuantity = maxStock;
            showNotification(`Số lượng không thể vượt quá tồn kho (${maxStock}).`, 'warning');
        } else if (newQuantity > hardLimit && maxStock >= hardLimit) { // Clamp to 10 if stock allows more
             newQuantity = hardLimit;
             if (quantity < hardLimit) { // Only show notification if user tried to go above 10 from below 10
                 showNotification(`Số lượng tối đa cho phép là ${hardLimit} sản phẩm.`, 'warning');
             }
        } else if (maxStock === 0) { // If product is truly out of stock
            newQuantity = 0;
            if (quantity > 0) { // Only show notification if quantity was positive before
                showNotification("Sản phẩm này hiện đã hết hàng.", 'error');
            }
        }

        if (newQuantity !== quantity) {
            setQuantity(newQuantity);
        }
    };

    // NEW: Handlers cho ConfirmModal số lượng lớn
    const handleConfirmLargeQuantity = () => {
        setShowLargeQuantityConfirm(false);
        setLargeQuantityPromptInfo(null);
        // showNotification("Cảm ơn quý khách đã quan tâm! Vui lòng liên hệ cửa hàng để được hỗ trợ đặt số lượng lớn hơn 10.", 'info');
        // Không cần làm gì thêm ở đây, vì số lượng đã được xử lý bởi backend
    };

    const handleCancelLargeQuantity = () => {
        setShowLargeQuantityConfirm(false);
        setLargeQuantityPromptInfo(null);
        // showNotification("Số lượng đã được giới hạn về mức tối đa cho phép là 10.", 'info');
        // Không cần làm gì thêm ở đây, vì số lượng đã được xử lý bởi backend
    };


    // Hàm thêm vào giỏ hàng (ĐÃ SỬA ĐỔI)
    const handleAddToCart = async () => {
        if (!product || !selectedVariant) {
            showNotification("Vui lòng chọn một phiên bản sản phẩm.", 'error');
            return;
        }
        if (quantity <= 0) {
            showNotification("Số lượng phải lớn hơn 0.", 'error');
            return;
        }
        if (selectedVariant.StockQuantity === 0) {
            showNotification("Sản phẩm này hiện đã hết hàng.", 'error');
            return;
        }
        if (quantity > selectedVariant.StockQuantity) {
            showNotification(`Số lượng yêu cầu vượt quá số lượng sản phẩm có sẵn trong kho. Chỉ còn ${selectedVariant.StockQuantity} sản phẩm.`, 'error');
            return;
        }

        try {
            const variantID = selectedVariant.VariantID;
            const shopID = product.ShopID;

            if (!variantID || !shopID) {
                showNotification("Thiếu thông tin cần thiết để thêm vào giỏ hàng. Vui lòng thử lại.", 'error');
                return;
            }

            // Gọi service addCartItem
            const response = await addCartItem(variantID, quantity, shopID);

            // Kiểm tra phản hồi từ backend để hiển thị modal số lượng lớn
            if (response.shouldShowLargeQuantityPrompt && response.productName && response.shopPhone) {
                setLargeQuantityPromptInfo({
                    productName: response.productName,
                    shopPhone: response.shopPhone
                });
                setShowLargeQuantityConfirm(true);
            } else {
                showNotification(response.message || "Sản phẩm đã được thêm vào giỏ hàng!", 'success');
            }

            // Cập nhật lại số lượng trong input sau khi thêm vào giỏ hàng (nếu cần)
            // Ví dụ: nếu backend trả về số lượng đã được clamp
            if (response.finalQuantityInCart !== undefined) {
                 // Nếu số lượng cuối cùng của variant này trong giỏ hàng là X, và nó nhỏ hơn số lượng user muốn thêm vào lúc đầu
                 // thì update quantity input về 1 hoặc về X nếu X > 0, để user thấy được sự thay đổi
                if (response.finalQuantityInCart < quantity && response.finalQuantityInCart > 0) {
                     setQuantity(response.finalQuantityInCart);
                } else if (response.finalQuantityInCart === 0) {
                    setQuantity(1); // Reset to 1 if it became 0 (e.g., stock was 0)
                } else {
                    setQuantity(1); // Reset to 1 after successful addition
                }
            } else {
                setQuantity(1); // Mặc định reset về 1
            }


        } catch (error: any) {
            console.error("Lỗi khi thêm vào giỏ hàng:", error);
            const errorMessage = error.response?.data?.message || "Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng.";
            if (error.response?.data?.available_stock !== undefined) {
                showNotification(`${errorMessage} (Tồn kho: ${error.response.data.available_stock})`, 'error');
            } else {
                showNotification(errorMessage, 'error');
            }
        }
    };


    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-white">
                <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen bg-white">
                <p className="text-red-500 text-xl">{error}</p>
            </div>
        );
    }

    if (!product || !selectedVariant) {
        return (
            <div className="flex justify-center items-center h-screen bg-white">
                <p className="text-gray-500 text-xl">Sản phẩm không có dữ liệu hợp lệ.</p>
            </div>
        );
    }

    return (
        <div className="bg-white font-sans">
            <div className="container mx-auto px-4 py-8">
                {/* NEW: ConfirmModal for large quantity */}
                {showLargeQuantityConfirm && largeQuantityPromptInfo && (
                    <ConfirmModal
                        isOpen={showLargeQuantityConfirm}
                        message={`Quý khách muốn đặt số lượng lớn cho sản phẩm "${largeQuantityPromptInfo.productName}"? Vui lòng liên hệ cửa hàng: ${largeQuantityPromptInfo.shopPhone || 'Chưa có SĐT'}`}
                        onConfirm={handleConfirmLargeQuantity}
                        onCancel={handleCancelLargeQuantity}
                    />
                )}

                {/* Breadcrumbs */}
                <div className="text-sm text-gray-600 mb-4">
                    <span>Trang chủ</span> / <span>Điện thoại</span> / <span>{product.Name}</span>
                </div>

                {/* Product Name */}
                <h1 className="text-2xl font-bold text-gray-800 mb-2">{product.Name}</h1>
                <div className="flex items-center space-x-4 mb-6">
                    <div className="flex items-center">
                        {[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />)}
                    </div>
                    <a href="#reviews" className="text-sm text-blue-600 hover:underline">123 đánh giá</a>
                </div>


                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Cột trái: Hình ảnh sản phẩm */}
                    <div className="lg:col-span-5">
                        <div className="sticky top-8">
                            <div className="border rounded-lg p-4 mb-4 flex justify-center items-center h-96">
                                {selectedImage && (
                                    <Image
                                        src={selectedImage}
                                        alt={product.Name}
                                        width={500}
                                        height={500}
                                        className="object-contain rounded-lg"
                                        priority
                                    />
                                )}
                            </div>
                            <div className="flex space-x-2 overflow-x-auto pb-2">
                                {product.images.map((image) => (
                                    <div
                                        key={image.ImageID}
                                        className={`flex-shrink-0 cursor-pointer border-2 rounded-lg p-1 ${selectedImage === resolveImageUrl(image.ImageURL) ? 'border-blue-500' : 'border-transparent'}`}
                                        onClick={() => setSelectedImage(resolveImageUrl(image.ImageURL))}
                                    >
                                        <Image
                                            src={resolveImageUrl(image.ImageURL)}
                                            alt={`Thumbnail ${image.ImageID}`}
                                            width={80}
                                            height={80}
                                            className="object-contain rounded"
                                        />
                                    </div>
                                ))}
                                {product.variants.filter(v => v.ImageURL && !product.images.some(img => img.ImageURL === v.ImageURL)).map(variant => (
                                    <div
                                        key={`variant-thumb-${variant.VariantID}`}
                                        className={`flex-shrink-0 cursor-pointer border-2 rounded-lg p-1 ${selectedImage === resolveImageUrl(variant.ImageURL) ? 'border-blue-500' : 'border-transparent'}`}
                                        onClick={() => setSelectedImage(resolveImageUrl(variant.ImageURL))}
                                    >
                                        <Image
                                            src={resolveImageUrl(variant.ImageURL)}
                                            alt={`Thumbnail ${variant.SKU}`}
                                            width={80}
                                            height={80}
                                            className="object-contain rounded"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Cột giữa: Lựa chọn và giá */}
                    <div className="lg:col-span-4">
                        <div className="flex items-baseline space-x-3 mb-4">
                            <span className="text-3xl font-bold text-red-600">{formatPrice(selectedVariant.Price)}</span>
                            {selectedVariant.CompareAtPrice > selectedVariant.Price && (
                                <span className="text-lg text-gray-500 line-through">{formatPrice(selectedVariant.CompareAtPrice)}</span>
                            )}
                        </div>

                        {/* Variant options */}
                        <div className="mb-6">
                            <h3 className="text-md font-semibold mb-2">Lựa chọn phiên bản</h3>
                            <div className="flex flex-wrap gap-2">
                                {product.variants.map(variant => (
                                    <button
                                        key={variant.VariantID}
                                        onClick={() => handleVariantSelect(variant)}
                                        className={`px-4 py-2 border rounded-lg text-sm transition
                                            ${selectedVariant.VariantID === variant.VariantID
                                                ? 'border-blue-500 bg-blue-50 text-blue-600 font-semibold'
                                                : 'border-gray-300 hover:border-blue-400'
                                            }
                                            ${variant.StockQuantity === 0 ? 'opacity-50 cursor-not-allowed' : ''}
                                            `}
                                        disabled={variant.StockQuantity === 0}
                                    >
                                        {variant.attribute_values.map(attr => attr.Value).join(' - ')}
                                        {variant.StockQuantity === 0 && <span className="ml-2 text-xs">(Hết hàng)</span>}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <p className="text-sm text-gray-600 mb-4">
                            Tồn kho: <span className="font-medium">{selectedVariant.StockQuantity}</span> sản phẩm
                        </p>

                        <div className="flex items-center space-x-3 mb-6">
                            <span className="font-semibold">Số lượng:</span>
                            <div className="flex items-center border rounded-md">
                                <button
                                    onClick={() => handleQuantityChange('decrease')}
                                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-l-md"
                                    disabled={quantity <= 1 || selectedVariant.StockQuantity === 0}
                                >
                                    -
                                </button>
                                <input
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => handleQuantityChange('input', e.target.value)}
                                    min="1"
                                    max={selectedVariant.StockQuantity > 0 ? Math.min(selectedVariant.StockQuantity, 10) : 1} // Max 10 or stock
                                    className="w-16 text-center border-l border-r outline-none"
                                    disabled={selectedVariant.StockQuantity === 0}
                                />
                                <button
                                    onClick={() => handleQuantityChange('increase')}
                                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-r-md"
                                    disabled={quantity >= selectedVariant.StockQuantity || quantity >= 10 || selectedVariant.StockQuantity === 0} // Disable if at max stock, hard limit, or quantity is 0
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        <div className="border-t border-b py-4 mb-6">
                            <h3 className="font-bold text-lg mb-3">Khuyến mãi</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-start">
                                    <Tag className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                                    <span>Giảm giá đặc biệt {product.Discount}% chỉ trong hôm nay.</span>
                                </div>
                                <div className="flex items-start">
                                    <Tag className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                                    <span>Tặng kèm ốp lưng và dán màn hình trị giá 300.000đ.</span>
                                </div>
                                <div className="flex items-start">
                                    <Tag className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                                    <span>Hỗ trợ trả góp 0% qua thẻ tín dụng.</span>
                                </div>
                            </div>
                        </div>

                        <button className="w-full bg-red-600 text-white rounded-lg py-4 text-lg font-bold hover:bg-red-700 transition mb-3">
                            MUA NGAY
                            <span className="block text-xs font-normal">Giao hàng tận nơi hoặc nhận tại cửa hàng</span>
                        </button>
                        <div className="flex space-x-3">
                            <button
                                onClick={handleAddToCart}
                                className={`w-1/2 rounded-lg py-3 font-bold transition flex items-center justify-center space-x-2
                                    ${selectedVariant.StockQuantity === 0 || quantity === 0
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                    }`}
                                disabled={selectedVariant.StockQuantity === 0 || quantity === 0}
                            >
                                <ShoppingCart className="h-5 w-5" />
                                <span>Thêm vào giỏ</span>
                            </button>
                            <button className="w-1/2 border border-blue-600 text-blue-600 rounded-lg py-3 font-bold hover:bg-blue-50 transition">
                                Mua trả góp 0%
                            </button>
                        </div>
                    </div>

                    {/* Cột phải: Chính sách */}
                    <div className="lg:col-span-3">
                        <div className="border rounded-lg p-4">
                            <ul className="space-y-3 text-sm text-gray-700">
                                <li className="flex items-center">
                                    <ShieldCheck className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                                    <span>Bảo hành chính hãng 12 tháng.</span>
                                </li>
                                <li className="flex items-center">
                                    <Truck className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0" />
                                    <span>Miễn phí giao hàng toàn quốc.</span>
                                </li>
                                <li className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500 mr-3 flex-shrink-0"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" /><path d="m9 12 2 2 4-4" /></svg>
                                    <span>Hàng nguyên seal, chính hãng VN/A.</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Phần mô tả và thông số kỹ thuật */}
                <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-7">
                        <div className="p-6 border rounded-lg">
                            <h2 className="text-xl font-bold mb-4">Mô tả sản phẩm</h2>
                            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                                {product.Description}
                            </p>
                        </div>
                    </div>
                    <div className="lg:col-span-5">
                        <div className="p-6 border rounded-lg">
                            <h2 className="text-xl font-bold mb-4">Thông số kỹ thuật</h2>
                            <ul className="space-y-3">
                                {selectedVariant.attribute_values.map(attr => (
                                    <li key={attr.AttributeID} className="flex justify-between p-2 rounded-md even:bg-gray-100">
                                        <span className="text-gray-600">
                                            Thuộc tính {attr.AttributeID}
                                        </span>
                                        <span className="font-semibold text-gray-800">{attr.Value}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ProductDetail;