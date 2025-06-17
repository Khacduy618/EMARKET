// // 'use client';

// // import React, { useState, useEffect, useMemo } from 'react';
// // import axios from 'axios';
// // import Image from 'next/image';
// // import { Loader2, Heart, Star, ChevronRight, Check, Truck, Shield, RotateCw } from 'lucide-react';
// // import RelatedItems from './RelatedItems';

// // // --- INTERFACES ---
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

// // // --- HELPER FUNCTIONS ---
// // const fullImageUrl = (relativeUrl: string | null) => {
// //     if (!relativeUrl) return '/placeholder.png';
// //     if (relativeUrl.startsWith('http')) return relativeUrl;
// //     return `http://localhost:8001${relativeUrl.startsWith('/') ? '' : '/'}${relativeUrl}`;
// // };

// // const formatPrice = (price: number) => {
// //     return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
// // };

// // // --- COMPONENT CHÍNH ---
// // const ProductDetail: React.FC<ProductDetailProps> = ({ productId, descriptionSlot, sidebarSlot }) => {
// //     const [product, setProduct] = useState<Product | null>(null);
// //     const [loading, setLoading] = useState(true);
// //     const [error, setError] = useState<string | null>(null);
// //     const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
// //     const [selectedImage, setSelectedImage] = useState<string | null>(null);
// //     const [quantity, setQuantity] = useState(1);
// //     const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

// //     useEffect(() => {
// //         if (!productId) return;
// //         const fetchProduct = async () => {
// //             setLoading(true);
// //             setError(null);
// //             try {
// //                 const response = await axios.get(`http://localhost:8001/api/productDetail/${productId}`);
// //                 const productData: Product = response.data;
// //                 setProduct(productData);

// //                 if (productData.variants?.length > 0) {
// //                     const initialVariant = productData.variants[0];
// //                     setSelectedVariant(initialVariant);
// //                     const initialOptions: Record<string, string> = {};
// //                     initialVariant.attribute_values.forEach(attrValue => {
// //                         initialOptions[attrValue.attribute.Name] = attrValue.Value;
// //                     });
// //                     setSelectedOptions(initialOptions);
// //                 }
// //                 if (productData.images?.length > 0) {
// //                     const primaryImage = productData.images.find(img => img.IsPrimary === 1) || productData.images[0];
// //                     setSelectedImage(primaryImage.ImageURL);
// //                 }
// //             } catch (err) {
// //                 console.error("Failed to fetch product:", err);
// //                 setError("Không thể tải thông tin sản phẩm.");
// //             } finally {
// //                 setLoading(false);
// //             }
// //         };
// //         fetchProduct();
// //     }, [productId]);

// //     const availableAttributes = useMemo(() => {
// //         if (!product) return {};
// //         const attributes: Record<string, Set<string>> = {};
// //         product.variants.forEach(variant => {
// //             variant.attribute_values.forEach(attrValue => {
// //                 const attrName = attrValue.attribute.Name;
// //                 if (!attributes[attrName]) {
// //                     attributes[attrName] = new Set();
// //                 }
// //                 attributes[attrName].add(attrValue.Value);
// //             });
// //         });
// //         const result: Record<string, string[]> = {};
// //         for (const key in attributes) {
// //             result[key] = Array.from(attributes[key]);
// //         }
// //         return result;
// //     }, [product]);

// //     useEffect(() => {
// //         if (!product || Object.keys(selectedOptions).length === 0) return;
// //         const newVariant = product.variants.find(variant =>
// //             Object.entries(selectedOptions).every(([attrName, attrValue]) =>
// //                 variant.attribute_values.some(v_attr =>
// //                     v_attr.attribute.Name === attrName && v_attr.Value === attrValue
// //                 )
// //             )
// //         );
// //         if (newVariant) {
// //             setSelectedVariant(newVariant);
// //         }
// //     }, [selectedOptions, product]);

// //     const handleOptionClick = (attributeName: string, value: string) => {
// //         setSelectedOptions(prev => ({ ...prev, [attributeName]: value }));
// //     };

// //     // RÀO CHẮN TYPE: Dừng lại nếu dữ liệu chưa sẵn sàng
// //     if (loading) {
// //         return <div className="flex justify-center items-center min-h-[50vh]"><Loader2 className="h-12 w-12 animate-spin text-orange-500" /></div>;
// //     }
// //     if (error) {
// //         return <div className="flex justify-center items-center min-h-[50vh]"><p className="text-red-500 text-xl">{error}</p></div>;
// //     }
// //     if (!product || !selectedVariant || !selectedImage) {
// //         return <div className="flex justify-center items-center min-h-[50vh]"><p className="text-gray-500 text-xl">Không tìm thấy sản phẩm.</p></div>;
// //     }

// //     // Calculate discount percentage if CompareAtPrice exists
// //     const discountPercentage = selectedVariant.CompareAtPrice
// //         ? Math.round((1 - selectedVariant.Price / selectedVariant.CompareAtPrice) * 100)
// //         : 0;

// //     return (
// //         <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans bg-white">
// //             {/* Breadcrumb */}
// //             <div className="flex items-center text-sm text-gray-500 mb-6">
// //                 <span className="hover:text-orange-500 cursor-pointer">Trang chủ</span>
// //                 <ChevronRight size={16} className="mx-2" />
// //                 <span className="hover:text-orange-500 cursor-pointer">Danh mục</span>
// //                 <ChevronRight size={16} className="mx-2" />
// //                 <span className="text-orange-500">{product.Name}</span>
// //             </div>

// //             <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
// //                 {/* Cột trái: Gallery ảnh */}
// //                 <div className="lg:col-span-7 flex flex-row gap-4">
// //                     <div className="flex flex-col gap-3 w-20">
// //                         {product.images.slice(0, 4).map((image) => (
// //                             <div key={image.ImageID} onClick={() => setSelectedImage(image.ImageURL)}
// //                                 className={`w-20 h-20 bg-gray-50 rounded flex items-center justify-center cursor-pointer p-1 border transition-all ${selectedImage === image.ImageURL ? 'border-orange-500' : 'border-gray-200 hover:border-orange-300'}`}>
// //                                 <Image
// //                                     src={fullImageUrl(image.ImageURL)}
// //                                     alt="thumbnail"
// //                                     width={80}
// //                                     height={80}
// //                                     className="object-contain max-h-full max-w-full"
// //                                 />
// //                             </div>
// //                         ))}
// //                     </div>
// //                     <div className="flex-1 bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
// //                         <div className="relative aspect-square w-full">
// //                             <Image
// //                                 src={fullImageUrl(selectedImage)}
// //                                 alt={product.Name}
// //                                 fill
// //                                 className="object-contain w-full h-full p-4"
// //                                 priority
// //                             />
// //                             {discountPercentage > 0 && (
// //                                 <div className="absolute top-4 left-4 bg-orange-500 text-white text-sm font-bold px-2 py-1 rounded-sm">
// //                                     -{discountPercentage}%
// //                                 </div>
// //                             )}
// //                         </div>
// //                     </div>
// //                 </div>

// //                 {/* Cột phải: Thông tin sản phẩm */}
// //                 <div className="lg:col-span-5 flex flex-col space-y-4">
// //                     <h1 className="text-2xl font-semibold text-gray-800">{product.Name}</h1>

// //                     <div className="flex items-center space-x-4">
// //                         <div className="flex items-center bg-orange-50 px-2 py-1 rounded">
// //                             <div className="flex items-center">
// //                                 {[...Array(5)].map((_, i) => (
// //                                     <Star key={i} size={16} className="text-orange-400 fill-current" />
// //                                 ))}
// //                             </div>
// //                             <span className="ml-2 text-sm text-orange-600">5.0</span>
// //                         </div>
// //                         <div className="h-4 w-px bg-gray-300"></div>
// //                         <span className="text-sm text-gray-600">150 Đánh giá</span>
// //                         <div className="h-4 w-px bg-gray-300"></div>
// //                         <span className="text-sm text-gray-600">500 Đã bán</span>
// //                     </div>

// //                     <div className="bg-gray-50 p-4 rounded-lg">
// //                         {selectedVariant.CompareAtPrice && (
// //                             <div className="flex items-center">
// //                                 <span className="text-gray-500 line-through mr-2">
// //                                     {formatPrice(selectedVariant.CompareAtPrice)}
// //                                 </span>
// //                                 <span className="bg-orange-100 text-orange-500 text-sm px-1 rounded">
// //                                     -{discountPercentage}%
// //                                 </span>
// //                             </div>
// //                         )}
// //                         <p className="text-3xl font-bold text-orange-500">
// //                             {formatPrice(selectedVariant.Price)}
// //                         </p>
// //                     </div>

// //                     <div className="pt-2 space-y-5">
// //                         {Object.entries(availableAttributes).map(([attributeName, options]) => (
// //                             <div key={attributeName} className="flex flex-col space-y-2">
// //                                 <h3 className="text-base font-medium text-gray-800">
// //                                     {attributeName}:
// //                                     <span className="ml-2 font-normal text-orange-500">
// //                                         {selectedOptions[attributeName]}
// //                                     </span>
// //                                 </h3>
// //                                 <div className="flex flex-wrap gap-2">
// //                                     {options.map(value => (
// //                                         <button
// //                                             key={value}
// //                                             onClick={() => handleOptionClick(attributeName, value)}
// //                                             className={`px-3 py-1.5 text-sm rounded transition-all ${selectedOptions[attributeName] === value
// //                                                 ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
// //                                                 : 'bg-white text-gray-700 border border-gray-300 hover:border-orange-300'}`}
// //                                         >
// //                                             {value}
// //                                         </button>
// //                                     ))}
// //                                 </div>
// //                             </div>
// //                         ))}
// //                     </div>

// //                     <div className="flex items-center space-x-4 pt-2">
// //                         <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
// //                             <button
// //                                 onClick={() => setQuantity(q => Math.max(1, q - 1))}
// //                                 className="px-3 py-2 text-gray-600 hover:bg-gray-100"
// //                             >
// //                                 -
// //                             </button>
// //                             <input
// //                                 type="text"
// //                                 value={quantity}
// //                                 readOnly
// //                                 className="w-12 text-center border-x border-gray-300 py-2 focus:outline-none"
// //                             />
// //                             <button
// //                                 onClick={() => setQuantity(q => Math.min(selectedVariant.StockQuantity, q + 1))}
// //                                 className="px-3 py-2 text-gray-600 hover:bg-gray-100"
// //                             >
// //                                 +
// //                             </button>
// //                         </div>
// //                         <span className="text-sm text-gray-500">{selectedVariant.StockQuantity} sản phẩm có sẵn</span>
// //                     </div>

// //                     <div className="flex gap-3 pt-4">
// //                         <button className="flex-1 bg-orange-100 border border-orange-500 text-orange-500 font-medium py-3 px-6 rounded hover:bg-orange-50 transition-colors flex items-center justify-center">
// //                             <Heart size={20} className="mr-2" />
// //                             Yêu thích
// //                         </button>
// //                         <button className="flex-1 bg-orange-500 text-white font-medium py-3 px-6 rounded hover:bg-orange-600 transition-colors shadow-sm">
// //                             Thêm vào giỏ hàng
// //                         </button>
// //                     </div>

// //                     <div className="border-t border-gray-200 pt-4">
// //                         <div className="grid grid-cols-2 gap-4">
// //                             <div className="flex items-center">
// //                                 <Truck size={18} className="text-gray-500 mr-2" />
// //                                 <div>
// //                                     <p className="text-sm font-medium">Miễn phí vận chuyển</p>
// //                                     <p className="text-xs text-gray-500">Cho đơn hàng từ 100k</p>
// //                                 </div>
// //                             </div>
// //                             <div className="flex items-center">
// //                                 <RotateCw size={18} className="text-gray-500 mr-2" />
// //                                 <div>
// //                                     <p className="text-sm font-medium">7 ngày đổi trả</p>
// //                                     <p className="text-xs text-gray-500">Miễn phí đổi trả</p>
// //                                 </div>
// //                             </div>
// //                             <div className="flex items-center">
// //                                 <Shield size={18} className="text-gray-500 mr-2" />
// //                                 <div>
// //                                     <p className="text-sm font-medium">Bảo hành chính hãng</p>
// //                                     <p className="text-xs text-gray-500">12 tháng</p>
// //                                 </div>
// //                             </div>
// //                             <div className="flex items-center">
// //                                 <Check size={18} className="text-gray-500 mr-2" />
// //                                 <div>
// //                                     <p className="text-sm font-medium">Hàng chính hãng</p>
// //                                     <p className="text-xs text-gray-500">100%</p>
// //                                 </div>
// //                             </div>
// //                         </div>
// //                     </div>
// //                 </div>
// //             </div>
// //             {/* Related Products */}
// //             <div className="mt-12">
// //                 <h2 className="text-xl font-semibold mb-6 text-gray-800">Sản phẩm tương tự</h2>
// //                 <RelatedItems currentProductId={productId} />
// //             </div>
// //             {/* Product Description and Sidebar */}
// //             <div className="mt-12 flex flex-col lg:flex-row lg:gap-x-8">
// //                 <div className="w-full lg:flex-1">
// //                     <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
// //                         <h2 className="text-xl font-semibold mb-4 text-gray-800">Mô tả sản phẩm</h2>
// //                         {descriptionSlot}
// //                     </div>
// //                 </div>
// //                 <aside className="w-full lg:w-80 flex-shrink-0 mt-8 lg:mt-0">
// //                     <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
// //                         {sidebarSlot}
// //                     </div>
// //                 </aside>
// //             </div>
// //         </div>
// //     );
// // };

// // export default ProductDetail;
// 'use client';

// import React, { useState, useEffect, useMemo } from 'react';
// import axios from 'axios';
// import Image from 'next/image';
// import { Loader2, Heart, Star, ChevronRight, Check, Truck, Shield, RotateCw } from 'lucide-react';
// import RelatedItems from './RelatedItems';

// // --- INTERFACES ---
// interface Attribute {
//     AttributeID: number;
//     Name: string;
// }
// interface AttributeValue {
//     AttributeID: number;
//     Value: string;
//     attribute: Attribute;
// }
// interface ProductImage {
//     ImageID: number;
//     ImageURL: string;
//     IsPrimary: number;
// }
// interface Variant {
//     VariantID: number;
//     SKU: string;
//     Price: number;
//     CompareAtPrice: number;
//     StockQuantity: number;
//     ImageURL?: string | null;
//     attribute_values: AttributeValue[];
// }
// interface Product {
//     ProductID: number;
//     Name: string;
//     Description: string;
//     Discount: number;
//     images: ProductImage[];
//     variants: Variant[];
// }
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
//     const [quantity, setQuantity] = useState(1);
//     const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

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
//                                 onClick={() => setQuantity(q => Math.max(1, q - 1))}
//                                 className="px-3 py-2 text-gray-600 hover:bg-gray-100"
//                             >
//                                 -
//                             </button>
//                             <input
//                                 type="text"
//                                 value={quantity}
//                                 readOnly
//                                 className="w-12 text-center border-x border-gray-300 py-2 focus:outline-none"
//                             />
//                             <button
//                                 onClick={() => setQuantity(q => Math.min(selectedVariant.StockQuantity, q + 1))}
//                                 className="px-3 py-2 text-gray-600 hover:bg-gray-100"
//                             >
//                                 +
//                             </button>
//                         </div>
//                         <span className="text-sm text-gray-500">{selectedVariant.StockQuantity} sản phẩm có sẵn</span>
//                     </div>

//                     <div className="flex gap-3 pt-4">
//                         <button className="flex-1 bg-orange-100 border border-orange-500 text-orange-500 font-medium py-3 px-6 rounded hover:bg-orange-50 transition-colors flex items-center justify-center">
//                             <Heart size={20} className="mr-2" />
//                             Yêu thích
//                         </button>
//                         <button className="flex-1 bg-orange-500 text-white font-medium py-3 px-6 rounded hover:bg-orange-600 transition-colors shadow-sm">
//                             Thêm vào giỏ hàng
//                         </button>
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

import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Image from 'next/image';
import { Loader2, Heart, Star, ChevronRight, Check, Truck, Shield, RotateCw } from 'lucide-react';
import RelatedItems from './RelatedItems';

// --- INTERFACES ---
interface Attribute { AttributeID: number; Name: string; }
interface AttributeValue { AttributeID: number; Value: string; attribute?: Attribute; }
interface ProductImage { ImageID: number; ImageURL: string; IsPrimary: number; }
interface Variant { VariantID: number; SKU: string; Price: number; CompareAtPrice: number; StockQuantity: number; ImageURL?: string | null; attribute_values: AttributeValue[]; }
interface Product { ProductID: number; Name: string; Description: string; Discount: number; category?: { Name: string }; images: ProductImage[]; variants: Variant[]; }
interface ProductDetailProps { productId: number; descriptionSlot: React.ReactNode; sidebarSlot: React.ReactNode; }

// --- HELPER FUNCTIONS ---
const fullImageUrl = (url: string | null) => { if (!url) return '/placeholder.png'; return url.startsWith('http') ? url : url; };
const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

// --- COMPONENT CHÍNH ---
const ProductDetail: React.FC<ProductDetailProps> = ({ productId, descriptionSlot, sidebarSlot }) => {
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

    // Hàm tập trung cập nhật state từ một variant, tái sử dụng ở nhiều nơi
    const updateStateFromVariant = (variant: Variant, currentProduct: Product) => {
        setSelectedVariant(variant);

        const newOptions: Record<string, string> = {};
        if (variant.attribute_values) {
            variant.attribute_values.forEach(attr => {
                if (attr.attribute?.Name) {
                    newOptions[attr.attribute.Name] = attr.Value;
                }
            });
        }
        setSelectedOptions(newOptions);

        // Ưu tiên ảnh của variant, nếu không có thì lấy ảnh chính của sản phẩm
        if (variant.ImageURL) {
            setSelectedImage(variant.ImageURL);
        } else if (currentProduct.images?.length > 0) {
            const primaryImage = currentProduct.images.find(img => img.IsPrimary === 1) || currentProduct.images[0];
            setSelectedImage(primaryImage.ImageURL);
        }
    }

    useEffect(() => {
        if (!productId) return;
        const fetchProduct = async () => {
            setLoading(true); setError(null);
            try {
                const response = await axios.get(`http://localhost:8001/api/productDetail/${productId}`);
                const productData: Product = response.data;
                setProduct(productData);

                if (!productData.variants || productData.variants.length === 0) {
                    setError("Sản phẩm này không có phiên bản nào."); return;
                }

                const initialVariant = productData.variants.find(v => v.attribute_values?.length > 0) || productData.variants[0];
                if (!initialVariant) {
                    setError("Sản phẩm không có phiên bản hợp lệ."); return;
                }

                updateStateFromVariant(initialVariant, productData);

            } catch (err) {
                console.error("Lỗi khi fetch sản phẩm:", err);
                setError(err instanceof TypeError ? "Lỗi dữ liệu không nhất quán từ API." : "Không thể tải thông tin sản phẩm.");
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [productId]);

    // <<< THAY ĐỔI LỚN: LOGIC CHỌN LỰA THÔNG MINH >>>
    const handleOptionClick = (attributeName: string, value: string) => {
        if (!product || !selectedVariant) return;

        // 1. Tạo bộ tiêu chí mới dựa trên lựa chọn của người dùng
        const currentOptions = { ...selectedOptions };
        const potentialOptions = { ...currentOptions, [attributeName]: value };

        // 2. Tìm một variant khớp nhất (ưu tiên 1: khớp nhiều thuộc tính nhất)
        let bestMatch: Variant | undefined = undefined;
        let maxMatchCount = -1;

        for (const variant of product.variants) {
            let matchCount = 0;
            // Biến thể này có phải là ứng cử viên không (phải khớp với lựa chọn mới nhất)
            const isCandidate = variant.attribute_values.some(attr => attr.attribute?.Name === attributeName && attr.Value === value);

            if (isCandidate) {
                // Đếm xem nó khớp với bao nhiêu thuộc tính trong `potentialOptions`
                Object.entries(potentialOptions).forEach(([key, val]) => {
                    if (variant.attribute_values.some(attr => attr.attribute?.Name === key && attr.Value === val)) {
                        matchCount++;
                    }
                });

                if (matchCount > maxMatchCount) {
                    maxMatchCount = matchCount;
                    bestMatch = variant;
                }
            }
        }

        // 3. Nếu không tìm thấy ứng viên nào, lùi lại và tìm bất kỳ variant nào có lựa chọn đó (ưu tiên 2)
        if (!bestMatch) {
            bestMatch = product.variants.find(variant =>
                variant.attribute_values.some(attr => attr.attribute?.Name === attributeName && attr.Value === value)
            );
        }

        // 4. Nếu tìm thấy một variant phù hợp, cập nhật toàn bộ state
        if (bestMatch) {
            updateStateFromVariant(bestMatch, product);
        }
    };

    const availableAttributes = useMemo(() => {
        if (!product) return {};
        const attributes: Record<string, Set<string>> = {};
        product.variants.forEach(variant => {
            variant.attribute_values?.forEach(attrValue => {
                const attrName = attrValue.attribute?.Name;
                if (attrName) {
                    if (!attributes[attrName]) attributes[attrName] = new Set();
                    attributes[attrName].add(attrValue.Value);
                }
            });
        });
        const result: Record<string, string[]> = {};
        for (const key in attributes) result[key] = Array.from(attributes[key]);
        return result;
    }, [product]);

    const displayImages = useMemo(() => {
        if (!product) return [];
        if (product.images?.length > 0) return product.images;
        return product.variants
            .filter(v => v.ImageURL)
            .map((v, i) => ({ ImageID: v.VariantID, ImageURL: v.ImageURL!, IsPrimary: i === 0 ? 1 : 0 }));
    }, [product]);

    if (loading) return <div className="flex justify-center items-center min-h-[50vh]"><Loader2 className="h-12 w-12 animate-spin text-orange-500" /></div>;
    if (error) return <div className="flex justify-center items-center min-h-[50vh]"><p className="text-red-500 text-xl text-center p-4">{error}</p></div>;
    if (!product || !selectedVariant) return <div className="flex justify-center items-center min-h-[50vh]"><p className="text-gray-500 text-xl">Không tìm thấy sản phẩm.</p></div>;

    const discountPercentage = selectedVariant.CompareAtPrice > 0 ? Math.round((1 - selectedVariant.Price / selectedVariant.CompareAtPrice) * 100) : 0;

    return (
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans bg-white">
            <div className="flex items-center text-sm text-gray-500 mb-6">
                <span className="hover:text-orange-500 cursor-pointer">Trang chủ</span>
                <ChevronRight size={16} className="mx-2" />
                <span className="hover:text-orange-500 cursor-pointer">{product.category?.Name || 'Danh mục'}</span>
                <ChevronRight size={16} className="mx-2" />
                <span className="text-orange-500">{product.Name}</span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-7 flex flex-row gap-4">
                    <div className="flex flex-col gap-3 w-20">
                        {displayImages.slice(0, 5).map((image) => (
                            <div key={image.ImageID} onClick={() => setSelectedImage(image.ImageURL)} className={`w-20 h-20 bg-gray-50 rounded flex items-center justify-center cursor-pointer p-1 border transition-all ${selectedImage === image.ImageURL ? 'border-orange-500' : 'border-gray-200 hover:border-orange-300'}`}>
                                <Image src={fullImageUrl(image.ImageURL)} alt="thumbnail" width={80} height={80} className="object-contain max-h-full max-w-full" />
                            </div>
                        ))}
                    </div>
                    <div className="flex-1 bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                        {selectedImage && (
                            <div className="relative aspect-square w-full">
                                <Image key={selectedImage} src={fullImageUrl(selectedImage)} alt={product.Name} fill className="object-contain w-full h-full p-4" priority />
                                {discountPercentage > 0 && <div className="absolute top-4 left-4 bg-orange-500 text-white text-sm font-bold px-2 py-1 rounded-sm">-{discountPercentage}%</div>}
                            </div>
                        )}
                    </div>
                </div>
                <div className="lg:col-span-5 flex flex-col space-y-4">
                    <h1 className="text-2xl font-semibold text-gray-800">{product.Name}</h1>
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center bg-orange-50 px-2 py-1 rounded">
                            <div className="flex items-center">{[...Array(5)].map((_, i) => <Star key={i} size={16} className="text-orange-400 fill-current" />)}</div>
                            <span className="ml-2 text-sm text-orange-600">5.0</span>
                        </div>
                        <div className="h-4 w-px bg-gray-300"></div><span className="text-sm text-gray-600">150 Đánh giá</span>
                        <div className="h-4 w-px bg-gray-300"></div><span className="text-sm text-gray-600">500 Đã bán</span>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                        {selectedVariant.CompareAtPrice > 0 && <div className="flex items-center"><span className="text-gray-500 line-through mr-2">{formatPrice(selectedVariant.CompareAtPrice)}</span><span className="bg-orange-100 text-orange-500 text-sm px-1 rounded">-{discountPercentage}%</span></div>}
                        <p className="text-3xl font-bold text-orange-500">{formatPrice(selectedVariant.Price)}</p>
                    </div>
                    <div className="pt-2 space-y-5">
                        {Object.entries(availableAttributes).map(([attributeName, options]) => (
                            <div key={attributeName} className="flex flex-col space-y-2">
                                <h3 className="text-base font-medium text-gray-800">{attributeName}:<span className="ml-2 font-normal text-orange-500">{selectedOptions[attributeName] || '---'}</span></h3>
                                <div className="flex flex-wrap gap-2">{options.map(value => <button key={value} onClick={() => handleOptionClick(attributeName, value)} className={`px-3 py-1.5 text-sm rounded transition-all ${selectedOptions[attributeName] === value ? 'bg-orange-500 text-white border-orange-500 shadow-sm' : 'bg-white text-gray-700 border border-gray-300 hover:border-orange-300'}`}>{value}</button>)}</div>
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center space-x-4 pt-2">
                        <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                            <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-3 py-2 text-gray-600 hover:bg-gray-100">-</button>
                            <input type="text" value={quantity} readOnly className="w-12 text-center border-x border-gray-300 py-2 focus:outline-none" />
                            <button onClick={() => setQuantity(q => Math.min(selectedVariant.StockQuantity, q + 1))} className="px-3 py-2 text-gray-600 hover:bg-gray-100">+</button>
                        </div>
                        <span className="text-sm text-gray-500">{selectedVariant.StockQuantity} sản phẩm có sẵn</span>
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button className="flex-1 bg-orange-100 border border-orange-500 text-orange-500 font-medium py-3 px-6 rounded hover:bg-orange-50 transition-colors flex items-center justify-center"><Heart size={20} className="mr-2" />Yêu thích</button>
                        <button className="flex-1 bg-orange-500 text-white font-medium py-3 px-6 rounded hover:bg-orange-600 transition-colors shadow-sm">Thêm vào giỏ hàng</button>
                    </div>
                    <div className="border-t border-gray-200 pt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center"><Truck size={18} className="text-gray-500 mr-2" /><div><p className="text-sm font-medium">Miễn phí vận chuyển</p><p className="text-xs text-gray-500">Cho đơn hàng từ 100k</p></div></div>
                            <div className="flex items-center"><RotateCw size={18} className="text-gray-500 mr-2" /><div><p className="text-sm font-medium">7 ngày đổi trả</p><p className="text-xs text-gray-500">Miễn phí đổi trả</p></div></div>
                            <div className="flex items-center"><Shield size={18} className="text-gray-500 mr-2" /><div><p className="text-sm font-medium">Bảo hành chính hãng</p><p className="text-xs text-gray-500">12 tháng</p></div></div>
                            <div className="flex items-center"><Check size={18} className="text-gray-500 mr-2" /><div><p className="text-sm font-medium">Hàng chính hãng</p><p className="text-xs text-gray-500">100%</p></div></div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="mt-12"><h2 className="text-xl font-semibold mb-6 text-gray-800">Sản phẩm tương tự</h2><RelatedItems currentProductId={productId} /></div>
            <div className="mt-12 flex flex-col lg:flex-row lg:gap-x-8">
                <div className="w-full lg:flex-1"><div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"><h2 className="text-xl font-semibold mb-4 text-gray-800">Mô tả sản phẩm</h2>{descriptionSlot}</div></div>
                <aside className="w-full lg:w-80 flex-shrink-0 mt-8 lg:mt-0"><div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">{sidebarSlot}</div></aside>
            </div>
        </div>
    );
};

export default ProductDetail;