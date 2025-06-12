// // "use client";

// // import React, { useEffect, useState } from 'react';
// // import Link from 'next/link';
// // import axios from 'axios';

// // // Định nghĩa các interface để khớp với cấu trúc dữ liệu JSON từ API
// // interface Variant {
// //     id: number;
// //     sku: string;
// //     price: number;
// //     formatted_price: string;
// //     compare_at_price: number | null;
// //     formatted_compare_at_price: string | null;
// //     stock_quantity: number;
// //     image_url: string;
// //     is_active: number;
// //     discount_percentage: number | null;
// // }

// // interface Product {
// //     ProductID: number;
// //     name: string;
// //     slug: string;
// //     description: string;
// //     full_description: string;
// //     image_url: string;
// //     tags: string[];
// //     variant: Variant;
// // }

// // const NewArrivalsSection: React.FC = () => {
// //     const [products, setProducts] = useState<Product[]>([]);
// //     const [loading, setLoading] = useState<boolean>(true);
// //     const [error, setError] = useState<string | null>(null);

// //     useEffect(() => {
// //         const fetchNewArrivals = async () => {
// //             try {
// //                 setLoading(true);
// //                 setError(null);

// //                 const response = await axios.get<Product[]>('http://localhost:8001/api/new-arrivals');
// //                 setProducts(response.data);
// //             } catch (err) {
// //                 if (axios.isAxiosError(err)) {
// //                     console.error("Lỗi Axios khi fetch sản phẩm mới:", err);
// //                     if (err.response) {
// //                         setError(`Lỗi từ server: ${err.response.status} - ${err.response.data?.message || err.message}`);
// //                     } else if (err.request) {
// //                         setError("Không nhận được phản hồi từ server. Vui lòng kiểm tra kết nối mạng hoặc server.");
// //                     } else {
// //                         setError(`Lỗi khi thiết lập yêu cầu: ${err.message}`);
// //                     }
// //                 } else {
// //                     console.error("Lỗi không xác định khi fetch sản phẩm mới:", err);
// //                     setError("Đã xảy ra lỗi không xác định.");
// //                 }
// //                 setProducts([]);
// //             } finally {
// //                 setLoading(false);
// //             }
// //         };

// //         fetchNewArrivals();
// //     }, []);

// //     if (loading) {
// //         return (
// //             <section className="py-12 bg-gray-50 rounded-lg shadow-md">
// //                 <div className="container mx-auto px-4 text-center">
// //                     <h2 className="text-3xl font-bold text-gray-900 mb-8">Sản phẩm mới</h2>
// //                     <p className="text-gray-700">Đang tải sản phẩm mới... Vui lòng đợi.</p>
// //                     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mt-4"></div>
// //                 </div>
// //             </section>
// //         );
// //     }

// //     if (error) {
// //         return (
// //             <section className="py-12 bg-red-50 rounded-lg shadow-md">
// //                 <div className="container mx-auto px-4 text-center">
// //                     <h2 className="text-3xl font-bold text-red-700 mb-8">Lỗi tải sản phẩm</h2>
// //                     <p className="text-red-600">{error}</p>
// //                     <p className="text-red-500 mt-2">Vui lòng thử lại sau hoặc kiểm tra kết nối mạng.</p>
// //                 </div>
// //             </section>
// //         );
// //     }

// //     // Lấy 3 sản phẩm đầu tiên để hiển thị theo layout mới
// //     const mainProduct = products[0];
// //     const secondaryProducts = products.slice(1, 3); // Lấy 2 sản phẩm tiếp theo

// //     if (!mainProduct && secondaryProducts.length === 0) {
// //         return (
// //             <section className="py-12 bg-gray-50">
// //                 <div className="container mx-auto px-4 text-center">
// //                     <h2 className="text-3xl font-bold text-gray-900">Sản phẩm mới</h2>
// //                     <p className="text-gray-700 mt-4">Hiện chưa có sản phẩm mới nào để hiển thị.</p>
// //                 </div>
// //             </section>
// //         );
// //     }

// //     return (
// //         <section className="py-12 bg-white">
// //             <div className="container mx-auto px-4">
// //                 <h2 className="text-3xl font-bold text-gray-900 mb-8">New Arrival</h2>

// //                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
// //                     {/* Main Product / Left Banner */}
// //                     {mainProduct && (
// //                         <div className="relative col-span-1 h-96 lg:h-[400px] rounded-lg overflow-hidden group">
// //                             <img
// //                                 src={mainProduct.image_url || 'https://placehold.co/800x400/000/fff?text=Main+Product'}
// //                                 alt={mainProduct.name}
// //                                 className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
// //                                 onError={(e) => { e.currentTarget.src = 'https://placehold.co/800x400/000/fff?text=Main+Product'; }}
// //                             />
// //                             <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6 rounded-lg">
// //                                 <h3 className="text-3xl font-bold text-white mb-2">{mainProduct.name}</h3>
// //                                 <p className="text-gray-200 text-sm mb-4 line-clamp-2">{mainProduct.description}</p>
// //                                 <Link
// //                                     href={`/products/${mainProduct.slug}`}
// //                                     className="inline-block bg-blue-500 w-[130px] text-white font-medium px-6 py-2 rounded-full hover:bg-gray-200 hover:text-black transition-colors duration-300"
// //                                 >
// //                                     Shop Now
// //                                 </Link>
// //                             </div>
// //                         </div>
// //                     )}

// //                     {/* Right Side Grid */}
// //                     <div className="grid grid-cols-1 gap-6">
// //                         {secondaryProducts.length > 0 ? (
// //                             secondaryProducts.map((product, index) => (
// //                                 <div key={product.ProductID} className="relative h-64 rounded-lg overflow-hidden group">
// //                                     <div className="relative w-[700px] h-[350px] overflow-hidden group">
// //                                         <img
// //                                             src={product.image_url || `https://placehold.co/700x350/000/fff?text=Product+${index + 1}`}
// //                                             alt={product.name}
// //                                             className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
// //                                             onError={(e) => { e.currentTarget.src = `https://placehold.co/700x350/000/fff?text=Product+${index + 1}`; }}
// //                                         />
// //                                     </div>
// //                                     <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4 rounded-lg">
// //                                         <h3 className="text-xl font-bold text-white mb-1">{product.name}</h3>
// //                                         <p className="text-gray-300 text-xs mb-3 line-clamp-1">{product.description}</p>
// //                                         <Link
// //                                             href={`/products/${product.slug}`}
// //                                             className="inline-block  bg-blue-500 w-[100px] text-white text-sm font-medium px-4 py-1.5 rounded-full hover:bg-gray-200 hover:text-black transition-colors duration-300"
// //                                         >
// //                                             Shop Now
// //                                         </Link>
// //                                     </div>
// //                                 </div>
// //                             ))
// //                         ) : (
// //                             // Placeholder if only main product exists but no secondary
// //                             mainProduct && (
// //                                 <div className="col-span-full text-center text-gray-600">
// //                                     Không có thêm sản phẩm nào để hiển thị ở đây.
// //                                 </div>
// //                             )
// //                         )}
// //                     </div>
// //                 </div>
// //             </div>
// //         </section>
// //     );
// // };

// // export default NewArrivalsSection;
// 'use client';
// import React, { useEffect, useState } from 'react';
// import Link from 'next/link';
// import axios from 'axios';

// // Interface API (giữ nguyên)
// interface ApiVariant {
//     id: number;
//     price: number;
//     compare_at_price: number | null; // <-- Trường quan trọng
//     image_url: string;
//     discount_percentage: number | null;
// }

// interface ApiProduct {
//     ProductID: number;
//     name: string;
//     slug: string;
//     description: string;
//     image_url: string;
//     variant: ApiVariant;
//     sold_count?: number;
// }

// // Interface đã xử lý để render
// interface ProcessedProduct {
//     ProductID: number;
//     name: string;
//     slug: string;
//     ImageURL: string | null;
//     finalPrice: number;
//     originalPrice: number | null; // Giá gốc để gạch đi
//     discountPercent: number;
//     soldCountDisplay: string;
// }

// const PRODUCTS_PER_PAGE = 30;

// const NewArrivalsSection: React.FC = () => {
//     const [allProducts, setAllProducts] = useState<ProcessedProduct[]>([]);
//     const [visibleCount, setVisibleCount] = useState<number>(PRODUCTS_PER_PAGE);
//     const [loading, setLoading] = useState<boolean>(true);
//     const [error, setError] = useState<string | null>(null);

//     useEffect(() => {
//         const fetchNewArrivals = async () => {
//             try {
//                 setLoading(true);
//                 setError(null);
//                 const response = await axios.get<ApiProduct[]>('http://localhost:8001/api/new-arrivals');

//                 const processedData = response.data.map((p): ProcessedProduct | null => {
//                     if (!p.variant || p.variant.price == null) return null;

//                     // --- SỬA LẠI LOGIC GIÁ Ở ĐÂY ---
//                     const finalPrice = p.variant.price;
//                     // Ưu tiên lấy `compare_at_price` làm giá gốc. Nếu không có, nó sẽ là null.
//                     const originalPrice = p.variant.compare_at_price;

//                     let discountPercent = 0;
//                     if (originalPrice && originalPrice > finalPrice) {
//                         // Tính toán % giảm giá dựa trên giá gốc và giá cuối
//                         discountPercent = ((originalPrice - finalPrice) / originalPrice) * 100;
//                     } else if (p.variant.discount_percentage) {
//                         // Nếu không có compare_at_price, dùng discount_percentage từ API
//                         discountPercent = p.variant.discount_percentage;
//                     }
//                     // --- KẾT THÚC SỬA LOGIC GIÁ ---

//                     const soldCount = p.sold_count ?? Math.floor(Math.random() * 2000) + 50;
//                     let soldCountDisplay = '';
//                     if (soldCount > 1000) {
//                         soldCountDisplay = `Đã bán ${(soldCount / 1000).toFixed(1)}k`.replace('.0', '');
//                     } else if (soldCount > 0) {
//                         soldCountDisplay = `Đã bán ${soldCount}`;
//                     }

//                     return {
//                         ProductID: p.ProductID,
//                         name: p.name,
//                         slug: p.slug,
//                         ImageURL: p.variant.image_url || p.image_url,
//                         finalPrice: finalPrice,
//                         originalPrice: originalPrice, // Gán giá gốc đã lấy được
//                         discountPercent: discountPercent,
//                         soldCountDisplay: soldCountDisplay,
//                     };
//                 }).filter(Boolean) as ProcessedProduct[];

//                 setAllProducts(processedData);

//             } catch (err) {
//                 setError("Không thể tải sản phẩm mới. Vui lòng thử lại sau.");
//                 console.error("Lỗi khi fetch sản phẩm mới:", err);
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchNewArrivals();
//     }, []);

//     const handleLoadMore = () => {
//         setVisibleCount(prevCount => prevCount + PRODUCTS_PER_PAGE);
//     };

//     const formatCurrency = (amount: number) => {
//         return new Intl.NumberFormat('vi-VN').format(amount);
//     };

//     if (loading) { /* ... giữ nguyên ... */ }
//     if (error) { /* ... giữ nguyên ... */ }
//     if (allProducts.length === 0) return null;

//     return (
//         <section className="py-4 sm:py-6 bg-orange-50">
//             <div className="max-w-[1500px] mx-auto px-2 sm:px-4">
//                 {/* Header Section */}
//                 <div className="mb-3 p-3 bg-white border-b-4 border-orange-500 text-center">
//                     <h2 className="text-base sm:text-lg font-bold text-orange-500 uppercase">
//                         HÀNG MỚI VỀ
//                     </h2>
//                 </div>

//                 {/* Product Grid */}
//                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-2.5">
//                     {allProducts.slice(0, visibleCount).map((product) => (
//                         <div
//                             key={product.ProductID}
//                             className="group bg-white rounded-sm overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-transparent hover:border-orange-500 flex flex-col transform hover:-translate-y-1"
//                         >
//                             <Link href={`/products/${product.slug}`} className="flex flex-col h-full">
//                                 <div className="relative w-full aspect-square overflow-hidden">
//                                     <img
//                                         src={product.ImageURL || 'https://via.placeholder.com/200x200/F0F0F0/AAAAAA?text=No+Image'}
//                                         alt={product.name}
//                                         className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
//                                         loading="lazy"
//                                     />
//                                     <div className="absolute top-2 left-0 bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded-r-sm z-10">Mới</div>

//                                     {product.discountPercent > 1 && (
//                                         <div className="absolute top-0 right-0 w-9 h-8 bg-yellow-400 text-center z-10 clip-discount-badge">
//                                             <span className="block text-red-600 font-bold text-xs leading-tight mt-0.5">{product.discountPercent.toFixed(0)}%</span>
//                                             <span className="block text-white font-bold text-[9px] leading-tight -mt-0.5">GIẢM</span>
//                                         </div>
//                                     )}
//                                 </div>

//                                 <div className="p-2 flex flex-col flex-grow">
//                                     <h3
//                                         className="text-xs sm:text-sm font-normal text-gray-800 mb-2 h-8 sm:h-10 leading-tight line-clamp-2"
//                                         title={product.name}
//                                     >
//                                         {product.name}
//                                     </h3>

//                                     <div className="mt-auto">
//                                         {/* Phần hiển thị giá đã được cập nhật */}
//                                         <div className="flex items-center justify-between mb-1">
//                                             <div className="flex items-baseline">
//                                                 <span className="text-orange-500 text-xs">₫</span>
//                                                 <span className="text-orange-500 font-semibold text-sm sm:text-base">
//                                                     {formatCurrency(product.finalPrice)}
//                                                 </span>
//                                             </div>
//                                             {product.originalPrice && (
//                                                 <span className="text-gray-400 line-through text-[10px] sm:text-xs">
//                                                     {formatCurrency(product.originalPrice)}
//                                                 </span>
//                                             )}
//                                         </div>
//                                         <div className="text-gray-500 text-[10px] sm:text-xs text-right h-4">
//                                             {product.soldCountDisplay}
//                                         </div>
//                                     </div>
//                                 </div>
//                             </Link>
//                         </div>
//                     ))}
//                 </div>

//                 {visibleCount < allProducts.length && (
//                     <div className="flex justify-center mt-6">
//                         <button
//                             onClick={handleLoadMore}
//                             className="px-10 py-2 bg-white text-gray-700 border border-gray-300 rounded-sm shadow-sm hover:bg-gray-50 transition-colors"
//                         >
//                             Xem thêm
//                         </button>
//                     </div>
//                 )}
//             </div>
//             <style jsx>{`
//                 .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
//                 .clip-discount-badge { clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 85%, 0 100%); }
//             `}</style>
//         </section>
//     );
// };

// export default NewArrivalsSection;
'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';

// Interfaces (Đã được điều chỉnh để khớp với JSON mới)
interface ApiVariant {
    id: number;
    price: number;
    compare_at_price: number | null;
    image_url: string;
    discount_percentage: number | null;
}
interface ApiProduct {
    ProductID: number;
    name: string;
    slug: string;
    description: string;
    image_url: string;
    tags: string[];
    variant: ApiVariant | null; // Sửa lại: variant có thể là null
    sold_count?: number;
}
interface ProcessedProduct {
    ProductID: number;
    name: string;
    slug: string;
    ImageURL: string | null;
    finalPrice: number;
    originalPrice: number | null;
    discountPercent: number;
    soldCountDisplay: string;
}

const NewArrivalsSection: React.FC = () => {
    const [allProducts, setAllProducts] = useState<ProcessedProduct[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchNewArrivals = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await axios.get<ApiProduct[]>('http://localhost:8001/api/new-arrivals');

                const processedData = response.data.map((p): ProcessedProduct | null => {
                    // SỬA LỖI: Bỏ qua sản phẩm nếu không có variant hoặc không có giá
                    if (!p.variant || p.variant.price == null) {
                        console.warn(`Sản phẩm ID ${p.ProductID} bị bỏ qua do không có variant hợp lệ.`);
                        return null;
                    }

                    const finalPrice = p.variant.price;
                    const originalPrice = p.variant.compare_at_price;
                    let discountPercent = 0;
                    if (originalPrice && originalPrice > finalPrice) {
                        discountPercent = ((originalPrice - finalPrice) / originalPrice) * 100;
                    } else if (p.variant.discount_percentage) {
                        discountPercent = p.variant.discount_percentage;
                    }

                    const soldCount = p.sold_count ?? Math.floor(Math.random() * 2000) + 50;
                    let soldCountDisplay = '';
                    if (soldCount > 1000) {
                        soldCountDisplay = `Đã bán ${(soldCount / 1000).toFixed(1)}k`.replace('.0', '');
                    } else if (soldCount > 0) {
                        soldCountDisplay = `Đã bán ${soldCount}`;
                    }

                    return {
                        ProductID: p.ProductID,
                        name: p.name,
                        slug: p.slug,
                        ImageURL: p.variant.image_url || p.image_url,
                        finalPrice: finalPrice,
                        originalPrice: originalPrice,
                        discountPercent: discountPercent,
                        soldCountDisplay: soldCountDisplay,
                    };
                }).filter(Boolean) as ProcessedProduct[];

                setAllProducts(processedData);

            } catch (err) {
                setError("Không thể tải sản phẩm mới. Vui lòng thử lại sau.");
                console.error("Lỗi khi fetch sản phẩm mới:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchNewArrivals();
    }, []);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN').format(amount);
    };

    if (loading) return <section className="py-8 text-center">Đang tải...</section>;
    if (error) return <section className="py-8 text-center text-red-500">{error}</section>;
    if (allProducts.length === 0) return null;

    return (
        <section className="py-4 sm:py-6 bg-white">
            <div className="max-w-[1500px] mx-auto px-2 sm:px-4">
                <div className="mb-3 p-3 bg-white border-b-4 border-orange-500 text-center">
                    <h2 className="text-base sm:text-lg font-bold text-orange-500 uppercase">
                        HÀNG MỚI VỀ
                    </h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-2.5">
                    {allProducts.map((product) => (
                        <Link
                            href={`/productdetail/${product.ProductID}`} // Sửa lại slug thành ProductID nếu trang chi tiết dùng ID
                            key={product.ProductID}
                            className="group bg-white rounded-sm overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-transparent hover:border-orange-500 flex flex-col transform hover:-translate-y-1"
                        >
                            <div className="relative w-full aspect-square overflow-hidden">
                                <img
                                    src={product.ImageURL || 'https://via.placeholder.com/200x200/F0F0F0/AAAAAA?text=No+Image'}
                                    alt={product.name}
                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    loading="lazy"
                                />
                                <div className="absolute top-2 left-0 bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded-r-sm z-10">Mới</div>
                                {product.discountPercent > 1 && (
                                    <div className="absolute top-0 right-0 w-9 h-8 bg-yellow-400 text-center z-10 clip-discount-badge">
                                        <span className="block text-red-600 font-bold text-xs leading-tight mt-0.5">{product.discountPercent.toFixed(0)}%</span>
                                        <span className="block text-white font-bold text-[9px] leading-tight -mt-0.5">GIẢM</span>
                                    </div>
                                )}
                            </div>
                            <div className="p-2 flex flex-col flex-grow">
                                <h3
                                    className="text-xs sm:text-sm font-normal text-gray-800 mb-2 h-8 sm:h-10 leading-tight line-clamp-2"
                                    title={product.name}
                                >
                                    {product.name}
                                </h3>
                                <div className="mt-auto">
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-baseline">
                                            <span className="text-orange-500 text-xs">₫</span>
                                            <span className="text-orange-500 font-semibold text-sm sm:text-base">
                                                {formatCurrency(product.finalPrice)}
                                            </span>
                                        </div>
                                        {product.originalPrice && (
                                            <span className="text-gray-400 line-through text-[10px] sm:text-xs">
                                                {formatCurrency(product.originalPrice)}
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-gray-500 text-[10px] sm:text-xs text-right h-4">
                                        {product.soldCountDisplay}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
            <style jsx>{`
                .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
                .clip-discount-badge { clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 85%, 0 100%); }
            `}</style>
        </section>
    );
};

export default NewArrivalsSection;