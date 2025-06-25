// 'use client';

// import React, { useState, useEffect, useMemo } from 'react';
// import axios from 'axios';
// import Image from 'next/image';
// import { Loader2, Heart, Star, ChevronRight, ShoppingCart,  Check, Truck, Shield, RotateCw } from 'lucide-react';
// import RelatedItems from './RelatedItems';
// import { toast } from 'react-toastify';
// import { addCartItem } from '@/services/cart'; // Đảm bảo đường dẫn này đúng
// import ConfirmModal from '@/app/components/ConfirmModal'; // Import ConfirmModal

// // --- INTERFACES ---
// // interface Attribute {
// //     AttributeID: number;
// //     Name: string;
// // }
// // interface AttributeValue {
// //     AttributeID: number;
// //     Value: string;
// //     attribute: Attribute;
// // }
// // interface ProductImage {
// //     ImageID: number;
// //     ImageURL: string;
// //     IsPrimary: number;
// // }
// // interface Variant {
// //     VariantID: number;
// //     SKU: string;
// //     Price: number;
// //     CompareAtPrice: number;
// //     StockQuantity: number;
// //     ImageURL?: string | null;
// //     attribute_values: AttributeValue[];
// // }
// // interface Product {
// //     ProductID: number;
// //     Name: string;
// //     Description: string;
// //     Discount: number;
// //     images: ProductImage[];
// //     variants: Variant[];
// // }
// // interface ProductDetailProps {
// //     productId: number;
// //     descriptionSlot: React.ReactNode;
// //     sidebarSlot: React.ReactNode;
// // }

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
//     IsActive: number;
//     CreatedAt?: string;
//     UpdatedAt?: string;
//     attribute_values: AttributeValue[];
// }

// interface Product {
//     ProductID: number;
//     ShopID: number;
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

// // Props của Component
// interface ProductDetailProps {
//     productId: number;
//     descriptionSlot: React.ReactNode;
//     sidebarSlot: React.ReactNode;
// }

// // --- HELPER FUNCTIONS (ĐÃ SỬA) ---
// const fullImageUrl = (url: string | null) => {
//     if (!url) return '/placeholder.png'; // Nếu không có URL, trả về ảnh mặc định

//     // Nếu là URL tuyệt đối (đã có http), trả về chính nó.
//     if (url.startsWith('http')) {
//         return url;
//     }

//     // Nếu là URL tương đối (bắt đầu bằng '/'), trả về chính nó.
//     // Next.js sẽ tự động xử lý đúng đường dẫn này từ thư mục /public.
//     return url;
// };

// const formatPrice = (price: number) => {
//     return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
// };

// // --- COMPONENT CHÍNH ---
// const ProductDetail: React.FC<ProductDetailProps> = ({ productId, descriptionSlot, sidebarSlot }) => {
//     const [product, setProduct] = useState<Product | null>(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);
//     const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
//     const [selectedImage, setSelectedImage] = useState<string | null>(null);
//     const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
//     const [quantity, setQuantity] = useState<number>(1);

//     // NEW: State cho ConfirmModal số lượng lớn
//     const [showLargeQuantityConfirm, setShowLargeQuantityConfirm] = useState(false);
//     const [largeQuantityPromptInfo, setLargeQuantityPromptInfo] = useState<{ productName: string; shopPhone: string } | null>(null);

//     const showNotification = useCallback((message: string, type: 'success' | 'error' | 'warning' | 'info', duration: number = 3000) => {
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
//             case 'info':
//                 toast.info(message, { autoClose: duration });
//             default:
//                 toast.info(message, { autoClose: duration });
//         }
//     }, []);

//     useEffect(() => {
//         if (!productId) return;
//         const fetchProduct = async () => {
//             setLoading(true);
//             setError(null);
//             try {
//                 const response = await axios.get(`http://localhost:8001/api/productDetail/${productId}`);
//                 const productData: Product = response.data;
//                 setProduct(productData);
//                 console.log("data:", productData)
//                 // Xác định ảnh và phiên bản ban đầu
//                 let initialImage = null;
//                 if (productData.images?.length > 0) {
//                     initialImage = productData.images.find(img => img.IsPrimary === 1)?.ImageURL || productData.images[0].ImageURL;
//                 }

//                 if (productData.variants?.length > 0) {
//                     const initialVariant = productData.variants[0];
//                     setSelectedVariant(initialVariant);

//                     const initialOptions: Record<string, string> = {};
//                     initialVariant.attribute_values.forEach(attrValue => {
//                         initialOptions[attrValue.attribute.Name] = attrValue.Value;
//                     });
//                     setSelectedOptions(initialOptions);

//                     // Ưu tiên ảnh của phiên bản ban đầu nếu có
//                     if (initialVariant.ImageURL) {
//                         initialImage = initialVariant.ImageURL;
//                     }
//                 }

//                 setSelectedImage(initialImage);

//             } catch (err) {
//                 console.error("Failed to fetch product:", err);
//                 setError("Không thể tải thông tin sản phẩm.");
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchProduct();
//     }, [productId]);

//     const availableAttributes = useMemo(() => {
//         if (!product) return {};
//         const attributes: Record<string, Set<string>> = {};
//         product.variants.forEach(variant => {
//             variant.attribute_values.forEach(attrValue => {
//                 const attrName = attrValue.attribute?.Name;
//                 if (attrName) { // Chỉ thêm vào nếu attrName tồn tại
//                     if (!attributes[attrName]) {
//                         attributes[attrName] = new Set();
//                     }
//                     attributes[attrName].add(attrValue.Value);
//                 }
//             });
//         });
//         const result: Record<string, string[]> = {};
//         for (const key in attributes) {
//             result[key] = Array.from(attributes[key]);
//         }
//         return result;
//     }, [product]);

//     useEffect(() => {
//         if (!product || Object.keys(selectedOptions).length === 0) return;

//         const newVariant = product.variants.find(variant =>
//             Object.entries(selectedOptions).every(([attrName, attrValue]) =>
//                 variant.attribute_values.some(v_attr =>
//                     v_attr.attribute?.Name === attrName && v_attr.Value === attrValue
//                 )
//             )
//         );

//         if (newVariant) {
//             setSelectedVariant(newVariant);
//             if (newVariant.ImageURL) {
//                 setSelectedImage(newVariant.ImageURL);
//             }
//         }
//     }, [selectedOptions, product]);

//     const handleOptionClick = (attributeName: string, value: string) => {
//         setSelectedOptions(prev => ({ ...prev, [attributeName]: value }));
//     };
//     const handleQuantityChange = (type: 'increase' | 'decrease' | 'input', value?: string) => {
//         if (!selectedVariant) return;

//         let newQuantity = quantity;
//         const maxStock = selectedVariant.StockQuantity;
//         const hardLimit = 10; // Hard limit for display/input

//         if (type === 'increase') {
//             newQuantity = quantity + 1;
//         } else if (type === 'decrease') {
//             newQuantity = quantity - 1;
//         } else if (type === 'input' && value !== undefined) {
//             const parsedValue = parseInt(value);
//             newQuantity = isNaN(parsedValue) ? 1 : parsedValue;
//         }

//         newQuantity = Math.max(1, newQuantity); // Minimum 1 for display/input

//         if (maxStock > 0 && newQuantity > maxStock) {
//             newQuantity = maxStock;
//             showNotification(`Số lượng không thể vượt quá tồn kho (${maxStock}).`, 'warning');
//         } else if (newQuantity > hardLimit && maxStock >= hardLimit) { // Clamp to 10 if stock allows more
//              newQuantity = hardLimit;
//              if (quantity < hardLimit) { // Only show notification if user tried to go above 10 from below 10
//                  showNotification(`Số lượng tối đa cho phép là ${hardLimit} sản phẩm.`, 'warning');
//              }
//         } else if (maxStock === 0) { // If product is truly out of stock
//             newQuantity = 0;
//             if (quantity > 0) { // Only show notification if quantity was positive before
//                 showNotification("Sản phẩm này hiện đã hết hàng.", 'error');
//             }
//         }

//         if (newQuantity !== quantity) {
//             setQuantity(newQuantity);
//         }
//     };

//     // NEW: Handlers cho ConfirmModal số lượng lớn
//     const handleConfirmLargeQuantity = () => {
//         setShowLargeQuantityConfirm(false);
//         setLargeQuantityPromptInfo(null);
//         // showNotification("Cảm ơn quý khách đã quan tâm! Vui lòng liên hệ cửa hàng để được hỗ trợ đặt số lượng lớn hơn 10.", 'info');
//         // Không cần làm gì thêm ở đây, vì số lượng đã được xử lý bởi backend
//     };

//     const handleCancelLargeQuantity = () => {
//         setShowLargeQuantityConfirm(false);
//         setLargeQuantityPromptInfo(null);
//         // showNotification("Số lượng đã được giới hạn về mức tối đa cho phép là 10.", 'info');
//         // Không cần làm gì thêm ở đây, vì số lượng đã được xử lý bởi backend
//     };


//     // Hàm thêm vào giỏ hàng (ĐÃ SỬA ĐỔI)
//     const handleAddToCart = async () => {
//         if (!product || !selectedVariant) {
//             showNotification("Vui lòng chọn một phiên bản sản phẩm.", 'error');
//             return;
//         }
//         if (quantity <= 0) {
//             showNotification("Số lượng phải lớn hơn 0.", 'error');
//             return;
//         }
//         if (selectedVariant.StockQuantity === 0) {
//             showNotification("Sản phẩm này hiện đã hết hàng.", 'error');
//             return;
//         }
//         if (quantity > selectedVariant.StockQuantity) {
//             showNotification(`Số lượng yêu cầu vượt quá số lượng sản phẩm có sẵn trong kho. Chỉ còn ${selectedVariant.StockQuantity} sản phẩm.`, 'error');
//             return;
//         }

//         try {
//             const variantID = selectedVariant.VariantID;
//             const shopID = product.ShopID;

//             if (!variantID || !shopID) {
//                 showNotification("Thiếu thông tin cần thiết để thêm vào giỏ hàng. Vui lòng thử lại.", 'error');
//                 return;
//             }

//             // Gọi service addCartItem
//             const response = await addCartItem(variantID, quantity, shopID);

//             // Kiểm tra phản hồi từ backend để hiển thị modal số lượng lớn
//             if (response.shouldShowLargeQuantityPrompt && response.productName && response.shopPhone) {
//                 setLargeQuantityPromptInfo({
//                     productName: response.productName,
//                     shopPhone: response.shopPhone
//                 });
//                 setShowLargeQuantityConfirm(true);
//             } else {
//                 showNotification(response.message || "Sản phẩm đã được thêm vào giỏ hàng!", 'success');
//             }

//             // Cập nhật lại số lượng trong input sau khi thêm vào giỏ hàng (nếu cần)
//             // Ví dụ: nếu backend trả về số lượng đã được clamp
//             if (response.finalQuantityInCart !== undefined) {
//                  // Nếu số lượng cuối cùng của variant này trong giỏ hàng là X, và nó nhỏ hơn số lượng user muốn thêm vào lúc đầu
//                  // thì update quantity input về 1 hoặc về X nếu X > 0, để user thấy được sự thay đổi
//                 if (response.finalQuantityInCart < quantity && response.finalQuantityInCart > 0) {
//                      setQuantity(response.finalQuantityInCart);
//                 } else if (response.finalQuantityInCart === 0) {
//                     setQuantity(1); // Reset to 1 if it became 0 (e.g., stock was 0)
//                 } else {
//                     setQuantity(1); // Reset to 1 after successful addition
//                 }
//             } else {
//                 setQuantity(1); // Mặc định reset về 1
//             }


//         } catch (error: any) {
//             console.error("Lỗi khi thêm vào giỏ hàng:", error);
//             const errorMessage = error.response?.data?.message || "Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng.";
//             if (error.response?.data?.available_stock !== undefined) {
//                 showNotification(`${errorMessage} (Tồn kho: ${error.response.data.available_stock})`, 'error');
//             } else {
//                 showNotification(errorMessage, 'error');
//             }
//         }
//     };


//     const formatPrice = (price: number) => {
//         return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
//     };
//     if (loading) {
//         return <div className="flex justify-center items-center min-h-[50vh]"><Loader2 className="h-12 w-12 animate-spin text-orange-500" /></div>;
//     }
//     if (error) {
//         return <div className="flex justify-center items-center min-h-[50vh]"><p className="text-red-500 text-xl">{error}</p></div>;
//     }
//     if (!product || !selectedVariant || !selectedImage) {
//         return <div className="flex justify-center items-center min-h-[50vh]"><p className="text-gray-500 text-xl">Không tìm thấy sản phẩm.</p></div>;
//     }

//     const discountPercentage = selectedVariant.CompareAtPrice
//         ? Math.round((1 - selectedVariant.Price / selectedVariant.CompareAtPrice) * 100)
//         : 0;

//     return (
//         <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans bg-white">

//             {showLargeQuantityConfirm && largeQuantityPromptInfo && (
//                     <ConfirmModal
//                         isOpen={showLargeQuantityConfirm}
//                         message={`Quý khách muốn đặt số lượng lớn cho sản phẩm "${largeQuantityPromptInfo.productName}"? Vui lòng liên hệ cửa hàng: ${largeQuantityPromptInfo.shopPhone || 'Chưa có SĐT'}`}
//                         onConfirm={handleConfirmLargeQuantity}
//                         onCancel={handleCancelLargeQuantity}
//                     />
//                 )}
//             {/* Breadcrumb */}
//             <div className="flex items-center text-sm text-gray-500 mb-6">
//                 <span className="hover:text-orange-500 cursor-pointer">Trang chủ</span>
//                 <ChevronRight size={16} className="mx-2" />
//                 <span className="hover:text-orange-500 cursor-pointer">Danh mục</span>
//                 <ChevronRight size={16} className="mx-2" />
//                 <span className="text-orange-500">{product.Name}</span>
//             </div>

//             <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
//                 {/* Cột trái: Gallery ảnh */}
//                 <div className="lg:col-span-7 flex flex-row gap-4">
//                     <div className="flex flex-col gap-3 w-20">
//                         {product.images.slice(0, 4).map((image) => (
//                             <div key={image.ImageID} onClick={() => setSelectedImage(image.ImageURL)}
//                                 className={`w-20 h-20 bg-gray-50 rounded flex items-center justify-center cursor-pointer p-1 border transition-all ${selectedImage === image.ImageURL ? 'border-orange-500' : 'border-gray-200 hover:border-orange-300'}`}>
//                                 <Image
//                                     src={fullImageUrl(image.ImageURL)}
//                                     alt="thumbnail"
//                                     width={80}
//                                     height={80}
//                                     className="object-contain max-h-full max-w-full"
//                                 />
//                             </div>
//                         ))}
//                     </div>
//                     <div className="flex-1 bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
//                         <div className="relative aspect-square w-full">
//                             <Image
//                                 key={selectedImage} // Thêm key để React re-render Image component khi src thay đổi
//                                 src={fullImageUrl(selectedImage)}
//                                 alt={product.Name}
//                                 fill
//                                 className="object-contain w-full h-full p-4"
//                                 priority
//                             />
//                             {discountPercentage > 0 && (
//                                 <div className="absolute top-4 left-4 bg-orange-500 text-white text-sm font-bold px-2 py-1 rounded-sm">
//                                     -{discountPercentage}%
//                                 </div>
//                             )}
//                         </div>
//                     </div>
//                 </div>

//                 {/* Cột phải: Thông tin sản phẩm */}
//                 <div className="lg:col-span-5 flex flex-col space-y-4">
//                     <h1 className="text-2xl font-semibold text-gray-800">{product.Name}</h1>

//                     <div className="flex items-center space-x-4">
//                         <div className="flex items-center bg-orange-50 px-2 py-1 rounded">
//                             <div className="flex items-center">
//                                 {[...Array(5)].map((_, i) => (
//                                     <Star key={i} size={16} className="text-orange-400 fill-current" />
//                                 ))}
//                             </div>
//                             <span className="ml-2 text-sm text-orange-600">5.0</span>
//                         </div>
//                         <div className="h-4 w-px bg-gray-300"></div>
//                         <span className="text-sm text-gray-600">150 Đánh giá</span>
//                         <div className="h-4 w-px bg-gray-300"></div>
//                         <span className="text-sm text-gray-600">500 Đã bán</span>
//                     </div>

//                     <div className="bg-gray-50 p-4 rounded-lg">
//                         {selectedVariant.CompareAtPrice && (
//                             <div className="flex items-center">
//                                 <span className="text-gray-500 line-through mr-2">
//                                     {formatPrice(selectedVariant.CompareAtPrice)}
//                                 </span>
//                                 <span className="bg-orange-100 text-orange-500 text-sm px-1 rounded">
//                                     -{discountPercentage}%
//                                 </span>
//                             </div>
//                         )}
//                         <p className="text-3xl font-bold text-orange-500">
//                             {formatPrice(selectedVariant.Price)}
//                         </p>
//                     </div>

//                     <div className="pt-2 space-y-5">
//                         {Object.entries(availableAttributes).map(([attributeName, options]) => (
//                             <div key={attributeName} className="flex flex-col space-y-2">
//                                 <h3 className="text-base font-medium text-gray-800">
//                                     {attributeName}:
//                                     <span className="ml-2 font-normal text-orange-500">
//                                         {selectedOptions[attributeName]}
//                                     </span>
//                                 </h3>
//                                 <div className="flex flex-wrap gap-2">
//                                     {options.map(value => (
//                                         <button
//                                             key={value}
//                                             onClick={() => handleOptionClick(attributeName, value)}
//                                             className={`px-3 py-1.5 text-sm rounded transition-all ${selectedOptions[attributeName] === value
//                                                 ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
//                                                 : 'bg-white text-gray-700 border border-gray-300 hover:border-orange-300'}`}
//                                         >
//                                             {value}
//                                         </button>
//                                     ))}
//                                 </div>
//                             </div>
//                         ))}
//                     </div>

//                     <div className="flex items-center space-x-4 pt-2">
//                         <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
//                             <button
//                                     onClick={() => handleQuantityChange('decrease')}
//                                     className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-l-md"
//                                     disabled={quantity <= 1 || selectedVariant.StockQuantity === 0}
//                                 >
//                                     -
//                                 </button>
//                             <input
//                                  type="number"
//                                     value={quantity}
//                                     onChange={(e) => handleQuantityChange('input', e.target.value)}
//                                     min="1"
//                                     max={selectedVariant.StockQuantity > 0 ? Math.min(selectedVariant.StockQuantity, 10) : 1} // Max 10 or stock
//                                     className="w-16 text-center border-l border-r outline-none"
//                                     disabled={selectedVariant.StockQuantity === 0}
//                             />
//                             <button
//                                     onClick={() => handleQuantityChange('increase')}
//                                     className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-r-md"
//                                     disabled={quantity >= selectedVariant.StockQuantity || quantity >= 10 || selectedVariant.StockQuantity === 0} // Disable if at max stock, hard limit, or quantity is 0
//                                 >
//                                     +
//                                 </button>
//                         </div>
//                         <span className="text-sm text-gray-500">{selectedVariant.StockQuantity} sản phẩm có sẵn</span>
//                     </div>

//                     <div className="flex gap-3 pt-4">
//                         <button className="flex-1 bg-orange-100 border border-orange-500 text-orange-500 font-medium py-3 px-6 rounded hover:bg-orange-50 transition-colors flex items-center justify-center">
//                             <Heart size={20} className="mr-2" />
//                             Yêu thích
//                         </button>
//                         <button
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
//                     </div>

//                     <div className="border-t border-gray-200 pt-4">
//                         <div className="grid grid-cols-2 gap-4">
//                             <div className="flex items-center">
//                                 <Truck size={18} className="text-gray-500 mr-2" />
//                                 <div>
//                                     <p className="text-sm font-medium">Miễn phí vận chuyển</p>
//                                     <p className="text-xs text-gray-500">Cho đơn hàng từ 100k</p>
//                                 </div>
//                             </div>
//                             <div className="flex items-center">
//                                 <RotateCw size={18} className="text-gray-500 mr-2" />
//                                 <div>
//                                     <p className="text-sm font-medium">7 ngày đổi trả</p>
//                                     <p className="text-xs text-gray-500">Miễn phí đổi trả</p>
//                                 </div>
//                             </div>
//                             <div className="flex items-center">
//                                 <Shield size={18} className="text-gray-500 mr-2" />
//                                 <div>
//                                     <p className="text-sm font-medium">Bảo hành chính hãng</p>
//                                     <p className="text-xs text-gray-500">12 tháng</p>
//                                 </div>
//                             </div>
//                             <div className="flex items-center">
//                                 <Check size={18} className="text-gray-500 mr-2" />
//                                 <div>
//                                     <p className="text-sm font-medium">Hàng chính hãng</p>
//                                     <p className="text-xs text-gray-500">100%</p>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//             {/* Related Products */}
//             <div className="mt-12">
//                 <h2 className="text-xl font-semibold mb-6 text-gray-800">Sản phẩm tương tự</h2>
//                 <RelatedItems currentProductId={productId} />
//             </div>
//             {/* Product Description and Sidebar */}
//             <div className="mt-12 flex flex-col lg:flex-row lg:gap-x-8">
//                 <div className="w-full lg:flex-1">
//                     <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
//                         <h2 className="text-xl font-semibold mb-4 text-gray-800">Mô tả sản phẩm</h2>
//                         {descriptionSlot}
//                     </div>
//                 </div>
//                 <aside className="w-full lg:w-80 flex-shrink-0 mt-8 lg:mt-0">
//                     <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
//                         {sidebarSlot}
//                     </div>
//                 </aside>
//             </div>
//         </div>
//     );
// };

// export default ProductDetail;


'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react'; // <--- Added useCallback here
import axios from 'axios';
import Image from 'next/image';
import { Loader2, Heart, Star, ChevronRight, ShoppingCart, Check, Truck, Shield, RotateCw } from 'lucide-react';
import RelatedItems from './RelatedItems';
import { toast } from 'react-toastify';
import { addCartItem } from '@/services/cart';
import ConfirmModal from '@/app/components/ConfirmModal';

// --- INTERFACES ---
// Define the Attribute interface first, as it's nested inside AttributeValue
interface Attribute {
    AttributeID: number;
    Name: string;
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
    attribute?: Attribute; // <--- This was missing, now added
}

interface ProductImage {
    ImageID: number;
    ProductID: number;
    ImageURL: string;
    IsPrimary: number;
    CreatedAt?: string;
    UpdatedAt?: string;
}

interface Variant {
    VariantID: number;
    ProductID: number;
    SKU: string;
    Price: number;
    CompareAtPrice: number | null; // Can be null
    StockQuantity: number;
    ImageURL: string | null;
    IsActive: number; // Assuming 0 or 1 for boolean like in DB
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

// Props of the Component
interface ProductDetailProps {
    productId: number;
    descriptionSlot: React.ReactNode;
    sidebarSlot: React.ReactNode;
}

// --- HELPER FUNCTIONS ---
const fullImageUrl = (url: string | null) => {
    if (!url) return '/placeholder.png'; // If no URL, return default image

    // If it's an absolute URL (already has http), return it as is.
    if (url.startsWith('http')) {
        return url;
    }

    // If it's a relative URL (starts with '/'), return it as is.
    // Next.js will automatically handle this path correctly from the /public folder.
    return url;
};

const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

// --- MAIN COMPONENT ---
const ProductDetail: React.FC<ProductDetailProps> = ({ productId, descriptionSlot, sidebarSlot }) => {
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
    const [quantity, setQuantity] = useState<number>(1);

    // State for ConfirmModal for large quantities
    const [showLargeQuantityConfirm, setShowLargeQuantityConfirm] = useState(false);
    const [largeQuantityPromptInfo, setLargeQuantityPromptInfo] = useState<{ productName: string; shopPhone: string } | null>(null);

    // showNotification is now wrapped in useCallback and imported
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
                break; // Added break for 'info'
            default: // This default case is now effectively unreachable but good for type safety
                toast.info(message, { autoClose: duration });
        }
    }, []); // Empty dependency array means it's created once

    useEffect(() => {
        if (!productId) return;
        const fetchProduct = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get(`http://localhost:8001/api/productDetail/${productId}`);
                const productData: Product = response.data;
                setProduct(productData);

                // Determine initial primary image
                let initialImage = null;
                if (productData.images?.length > 0) {
                    initialImage = productData.images.find(img => img.IsPrimary === 1)?.ImageURL || productData.images[0].ImageURL;
                }

                // Determine initial variant and its options
                let initialVariant: Variant | null = null;
                if (productData.variants?.length > 0) {
                    initialVariant = productData.variants[0]; // Select the first variant as default
                    setSelectedVariant(initialVariant);

                    const initialOptions: Record<string, string> = {};
                    initialVariant.attribute_values.forEach(attrValue => {
                        // Ensure 'attribute' and 'Name' exist before accessing
                        if (attrValue.attribute?.Name) {
                            initialOptions[attrValue.attribute.Name] = attrValue.Value;
                        }
                    });
                    setSelectedOptions(initialOptions);

                    // Prefer the initial variant's image if available
                    if (initialVariant.ImageURL) {
                        initialImage = initialVariant.ImageURL;
                    }
                }

                setSelectedImage(initialImage);
                setQuantity(initialVariant && initialVariant.StockQuantity === 0 ? 0 : 1); // Set initial quantity to 1 or 0 if out of stock


            } catch (err) {
                console.error("Failed to fetch product:", err);
                setError("Không thể tải thông tin sản phẩm.");
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [productId, showNotification]); // Added showNotification to deps array, although its memoized

    // Memoize available attributes for rendering options
    const availableAttributes = useMemo(() => {
        if (!product) return {};
        const attributes: Record<string, Set<string>> = {};
        product.variants.forEach(variant => {
            variant.attribute_values.forEach(attrValue => {
                const attrName = attrValue.attribute?.Name; // Access .attribute.Name
                if (attrName) {
                    if (!attributes[attrName]) {
                        attributes[attrName] = new Set();
                    }
                    attributes[attrName].add(attrValue.Value);
                }
            });
        });
        const result: Record<string, string[]> = {};
        for (const key in attributes) {
            result[key] = Array.from(attributes[key]);
        }
        return result;
    }, [product]);

    // Update selected variant when selected options change
    useEffect(() => {
        if (!product || Object.keys(selectedOptions).length === 0) return;

        const newVariant = product.variants.find(variant =>
            Object.entries(selectedOptions).every(([attrName, attrValue]) =>
                variant.attribute_values.some(v_attr =>
                    v_attr.attribute?.Name === attrName && v_attr.Value === attrValue
                )
            )
        );

        if (newVariant) {
            setSelectedVariant(newVariant);
            if (newVariant.ImageURL) {
                setSelectedImage(newVariant.ImageURL);
            }
            setQuantity(newVariant.StockQuantity === 0 ? 0 : 1); // Reset quantity when variant changes
        } else {
            // If no variant matches, clear selected variant or handle error
            setSelectedVariant(null);
            // Optionally, show a message indicating no such variant exists
            // showNotification("Không tìm thấy phiên bản sản phẩm phù hợp với lựa chọn này.", 'warning');
        }
    }, [selectedOptions, product, showNotification]);

    const handleOptionClick = (attributeName: string, value: string) => {
        setSelectedOptions(prev => ({ ...prev, [attributeName]: value }));
    };

    // Memoize the maximum quantity allowed in the UI for clarity
    const currentMaxQuantityForUI = useMemo(() => {
        const hardLimit = 10;
        if (!selectedVariant || selectedVariant.StockQuantity <= 0) return 0; // If no variant or out of stock
        return Math.min(selectedVariant.StockQuantity, hardLimit);
    }, [selectedVariant]);

    // Handle quantity changes with clamping and notifications
    const handleQuantityChange = (type: 'increase' | 'decrease' | 'input', value?: string) => {
        if (!selectedVariant || selectedVariant.StockQuantity === 0) {
            showNotification("Sản phẩm này hiện đã hết hàng.", 'error');
            setQuantity(0); // Ensure quantity is 0 if product is out of stock
            return;
        }

        let newQuantity = quantity;

        if (type === 'increase') {
            newQuantity = quantity + 1;
        } else if (type === 'decrease') {
            newQuantity = quantity - 1;
        } else if (type === 'input' && value !== undefined) {
            const parsedValue = parseInt(value, 10);
            newQuantity = isNaN(parsedValue) || parsedValue < 1 ? 1 : parsedValue;
        }

        let clampedQuantity = Math.min(Math.max(newQuantity, 1), currentMaxQuantityForUI);

        // Notify if quantity was clamped by the UI hard limit or stock
        if (newQuantity > currentMaxQuantityForUI) {
            if (currentMaxQuantityForUI > 0) {
                 showNotification(`Số lượng không thể vượt quá ${currentMaxQuantityForUI} sản phẩm.`, 'warning');
            } else {
                 showNotification("Sản phẩm này hiện đã hết hàng.", 'error');
                 clampedQuantity = 0; // Set to 0 if stock became 0 unexpectedly
            }
        } else if (newQuantity < 1 && type === 'input') {
            showNotification("Số lượng phải lớn hơn 0.", 'warning');
            clampedQuantity = 1;
        }


        if (clampedQuantity !== quantity) {
            setQuantity(clampedQuantity);
        }
    };

    // Handlers for ConfirmModal for large quantity
    const handleConfirmLargeQuantity = () => {
        setShowLargeQuantityConfirm(false);
        setLargeQuantityPromptInfo(null);
        // The message about contacting the shop is already in the modal.
        // No further action is needed here as the backend has already processed the cart item.
    };

    const handleCancelLargeQuantity = () => {
        setShowLargeQuantityConfirm(false);
        setLargeQuantityPromptInfo(null);
        // User cancelled, no specific action here as the quantity was already adjusted by backend if needed.
    };

    // Add to cart function
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
            setQuantity(0); // Ensure UI reflects out of stock
            return;
        }
        if (quantity > selectedVariant.StockQuantity) {
            showNotification(`Số lượng yêu cầu vượt quá số lượng sản phẩm có sẵn trong kho. Chỉ còn ${selectedVariant.StockQuantity} sản phẩm.`, 'error');
            setQuantity(selectedVariant.StockQuantity); // Adjust UI quantity to max available
            return;
        }

        try {
            const variantID = selectedVariant.VariantID;
            const shopID = product.ShopID;

            if (!variantID || !shopID) {
                showNotification("Thiếu thông tin cần thiết để thêm vào giỏ hàng. Vui lòng thử lại.", 'error');
                return;
            }

            // Call addCartItem service
            const response = await addCartItem(variantID, quantity, shopID);

            // Check backend response for large quantity prompt
            if (response.shouldShowLargeQuantityPrompt && response.productName && response.shopPhone) {
                setLargeQuantityPromptInfo({
                    productName: response.productName,
                    shopPhone: response.shopPhone
                });
                setShowLargeQuantityConfirm(true);
            } else {
                showNotification(response.message || "Sản phẩm đã được thêm vào giỏ hàng!", 'success');
            }

            // Update quantity input after successful addition (reset to 1 or clamped value)
            if (response.finalQuantityInCart !== undefined) {
                 if (response.finalQuantityInCart < quantity && response.finalQuantityInCart > 0) {
                     setQuantity(response.finalQuantityInCart); // If backend clamped quantity, update UI
                } else {
                    setQuantity(1); // Reset to 1 after successful addition
                }
            } else {
                setQuantity(1); // Default reset to 1
            }


        } catch (error: any) {
            console.error("Lỗi khi thêm vào giỏ hàng:", error);
            const errorMessage = error.response?.data?.message || "Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng.";
            if (error.response?.data?.available_stock !== undefined) {
                showNotification(`${errorMessage} (Tồn kho: ${error.response.data.available_stock})`, 'error');
                setQuantity(error.response.data.available_stock > 0 ? error.response.data.available_stock : 0);
            } else {
                showNotification(errorMessage, 'error');
            }
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center min-h-[50vh]"><Loader2 className="h-12 w-12 animate-spin text-orange-500" /></div>;
    }
    if (error) {
        return <div className="flex justify-center items-center min-h-[50vh]"><p className="text-red-500 text-xl">{error}</p></div>;
    }
    if (!product) { // Only check for product here. selectedVariant and selectedImage might be null if product has no variants/images initially.
        return <div className="flex justify-center items-center min-h-[50vh]"><p className="text-gray-500 text-xl">Không tìm thấy sản phẩm.</p></div>;
    }

    // Ensure selectedVariant is not null before accessing its properties for rendering
    if (!selectedVariant) {
        return <div className="flex justify-center items-center min-h-[50vh]"><p className="text-gray-500 text-xl">Sản phẩm không có phiên bản hợp lệ.</p></div>;
    }

    const discountPercentage = selectedVariant.CompareAtPrice
        ? Math.round((1 - selectedVariant.Price / selectedVariant.CompareAtPrice) * 100)
        : 0;

    return (
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans bg-white">

            {showLargeQuantityConfirm && largeQuantityPromptInfo && (
                <ConfirmModal
                    isOpen={showLargeQuantityConfirm}
                    message={`Quý khách muốn đặt số lượng lớn cho sản phẩm "${largeQuantityPromptInfo.productName}"? Vui lòng liên hệ cửa hàng: ${largeQuantityPromptInfo.shopPhone || 'Chưa có SĐT'}`}
                    onConfirm={handleConfirmLargeQuantity}
                    onCancel={handleCancelLargeQuantity}
                />
            )}
            {/* Breadcrumb */}
            <div className="flex items-center text-sm text-gray-500 mb-6">
                <span className="hover:text-orange-500 cursor-pointer">Trang chủ</span>
                <ChevronRight size={16} className="mx-2" />
                <span className="hover:text-orange-500 cursor-pointer">Danh mục</span>
                <ChevronRight size={16} className="mx-2" />
                <span className="text-orange-500">{product.Name}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Image Gallery */}
                <div className="lg:col-span-7 flex flex-row gap-4">
                    <div className="flex flex-col gap-3 w-20">
                        {product.images.slice(0, 4).map((image) => (
                            <div key={image.ImageID} onClick={() => setSelectedImage(image.ImageURL)}
                                className={`w-20 h-20 bg-gray-50 rounded flex items-center justify-center cursor-pointer p-1 border transition-all ${selectedImage === image.ImageURL ? 'border-orange-500' : 'border-gray-200 hover:border-orange-300'}`}>
                                <Image
                                    src={fullImageUrl(image.ImageURL)}
                                    alt="thumbnail"
                                    width={80}
                                    height={80}
                                    className="object-contain max-h-full max-w-full"
                                />
                            </div>
                        ))}
                    </div>
                    <div className="flex-1 bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                        <div className="relative aspect-square w-full">
                            {selectedImage && ( // Render image only if selectedImage is not null
                                <Image
                                    key={selectedImage} // Add key to force re-render Image component when src changes
                                    src={fullImageUrl(selectedImage)}
                                    alt={product.Name}
                                    fill
                                    className="object-contain w-full h-full p-4"
                                    priority
                                />
                            )}
                            {discountPercentage > 0 && (
                                <div className="absolute top-4 left-4 bg-orange-500 text-white text-sm font-bold px-2 py-1 rounded-sm">
                                    -{discountPercentage}%
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Product Info */}
                <div className="lg:col-span-5 flex flex-col space-y-4">
                    <h1 className="text-2xl font-semibold text-gray-800">{product.Name}</h1>

                    <div className="flex items-center space-x-4">
                        <div className="flex items-center bg-orange-50 px-2 py-1 rounded">
                            <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={16} className="text-orange-400 fill-current" />
                                ))}
                            </div>
                            <span className="ml-2 text-sm text-orange-600">5.0</span>
                        </div>
                        <div className="h-4 w-px bg-gray-300"></div>
                        <span className="text-sm text-gray-600">150 Đánh giá</span>
                        <div className="h-4 w-px bg-gray-300"></div>
                        <span className="text-sm text-gray-600">500 Đã bán</span>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                        {selectedVariant.CompareAtPrice && (
                            <div className="flex items-center">
                                <span className="text-gray-500 line-through mr-2">
                                    {formatPrice(selectedVariant.CompareAtPrice)}
                                </span>
                                <span className="bg-orange-100 text-orange-500 text-sm px-1 rounded">
                                    -{discountPercentage}%
                                </span>
                            </div>
                        )}
                        <p className="text-3xl font-bold text-orange-500">
                            {formatPrice(selectedVariant.Price)}
                        </p>
                    </div>

                    <div className="pt-2 space-y-5">
                        {Object.entries(availableAttributes).map(([attributeName, options]) => (
                            <div key={attributeName} className="flex flex-col space-y-2">
                                <h3 className="text-base font-medium text-gray-800">
                                    {attributeName}:
                                    <span className="ml-2 font-normal text-orange-500">
                                        {selectedOptions[attributeName]}
                                    </span>
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {options.map(value => (
                                        <button
                                            key={value}
                                            onClick={() => handleOptionClick(attributeName, value)}
                                            className={`px-3 py-1.5 text-sm rounded transition-all ${selectedOptions[attributeName] === value
                                                ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                                                : 'bg-white text-gray-700 border border-gray-300 hover:border-orange-300'}`}
                                        >
                                            {value}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center space-x-4 pt-2">
                        <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
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
                                max={currentMaxQuantityForUI > 0 ? currentMaxQuantityForUI : 1} // Ensure max is at least 1 even if stock is 0 for input type="number" behavior
                                className="w-16 text-center border-l border-r outline-none"
                                disabled={selectedVariant.StockQuantity === 0}
                            />
                            <button
                                onClick={() => handleQuantityChange('increase')}
                                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-r-md"
                                disabled={quantity >= currentMaxQuantityForUI || selectedVariant.StockQuantity === 0}
                            >
                                +
                            </button>
                        </div>
                        <span className="text-sm text-gray-500">{selectedVariant.StockQuantity} sản phẩm có sẵn</span>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button className="flex-1 bg-orange-100 border border-orange-500 text-orange-500 font-medium py-3 px-6 rounded hover:bg-orange-50 transition-colors flex items-center justify-center">
                            <Heart size={20} className="mr-2" />
                            Yêu thích
                        </button>
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
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center">
                                <Truck size={18} className="text-gray-500 mr-2" />
                                <div>
                                    <p className="text-sm font-medium">Miễn phí vận chuyển</p>
                                    <p className="text-xs text-gray-500">Cho đơn hàng từ 100k</p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <RotateCw size={18} className="text-gray-500 mr-2" />
                                <div>
                                    <p className="text-sm font-medium">7 ngày đổi trả</p>
                                    <p className="text-xs text-gray-500">Miễn phí đổi trả</p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <Shield size={18} className="text-gray-500 mr-2" />
                                <div>
                                    <p className="text-sm font-medium">Bảo hành chính hãng</p>
                                    <p className="text-xs text-gray-500">12 tháng</p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <Check size={18} className="text-gray-500 mr-2" />
                                <div>
                                    <p className="text-sm font-medium">Hàng chính hãng</p>
                                    <p className="text-xs text-gray-500">100%</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Related Products */}
            <div className="mt-12">
                <h2 className="text-xl font-semibold mb-6 text-gray-800">Sản phẩm tương tự</h2>
                <RelatedItems currentProductId={productId} />
            </div>
            {/* Product Description and Sidebar */}
            <div className="mt-12 flex flex-col lg:flex-row lg:gap-x-8">
                <div className="w-full lg:flex-1">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h2 className="text-xl font-semibold mb-4 text-gray-800">Mô tả sản phẩm</h2>
                        {descriptionSlot}
                    </div>
                </div>
                <aside className="w-full lg:w-80 flex-shrink-0 mt-8 lg:mt-0">
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        {sidebarSlot}
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default ProductDetail;