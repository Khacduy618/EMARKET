
// // 'use client';

// // import React, { useEffect, useState } from 'react';
// // import Image from 'next/image';
// // import Link from 'next/link';
// // import { FaTruckFast, FaCircleQuestion, FaCommentDots, FaStore, FaChevronDown } from 'react-icons/fa6';

// // import { Order, OrderStatus } from '@/types';
// // import { getAuthToken, getFullImageUrl } from '@/services/api';
// // import ReturnRequestModal from './modals/ReturnRequestModal'; // 1. Import component modal trả hàng

// // // --- Helper Functions ---

// // const formatVND = (price: number): string => {
// //   if (isNaN(price)) return '0 ₫';
// //   return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
// // };

// // const formatDate = (isoString: string): string => {
// //   if (!isoString) return '';
// //   const date = new Date(isoString);
// //   const day = String(date.getDate()).padStart(2, '0');
// //   const month = String(date.getMonth() + 1).padStart(2, '0');
// //   const year = date.getFullYear();
// //   return `${day}-${month}-${year}`;
// // };



// // // --- Main Component ---
// // // 3. Thêm prop `token` để có thể truyền vào modal

// // const OrderCard: React.FC<{ order: Order }> = ({ order }) => {
// //   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
// //   const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
// //   const [authToken, setAuthToken] = useState<string | null>(null);
// //   console.log("Dữ liệu cho OrderCard:", order);
// //   useEffect(() => {

// //     let tokenFromStorage: string | null = null;

// //     // Đảm bảo code chỉ chạy trên trình duyệt
// //     if (typeof window !== 'undefined') {
// //       tokenFromStorage = localStorage.getItem('authToken');
// //     }

// //     console.log("OrderCard: Đã đọc token từ localStorage:", tokenFromStorage);

// //     // Cập nhật state với token đã đọc được
// //     setAuthToken(tokenFromStorage);
// //     // =================================================================
// //   }, []);
// //   const isReturnStatus = order.OverallStatus === 'Returned' || order.OverallStatus === 'ReturnInProgress';

// //   // const detailPageUrl = isReturnStatus && order.ReturnID
// //   //   ? `/account/returns/${order.ReturnID}` // ĐÍCH: Trang chi tiết trả hàng
// //   //   : `/account/purchase/${order.OrderID}`; // ĐÍCH: Trang chi tiết đơn hàng
// //   const detailPageUrl = isReturnStatus && order.ReturnID
// //     // isReturnStatus là TRUE
// //     // order.ReturnID là UNDEFINED
// //     // Kết quả: true && undefined => undefined (tương đương false)

// //     ? `/orders}`
// //     : `/account/purchase/${order.OrderID}`;
// //   const handleReturnSuccess = (message: string) => {
// //     alert(message);
// //     setIsReturnModalOpen(false);
// //     window.location.reload();
// //   };
// //   const renderDeliveryStatus = (status: OrderStatus) => {
// //     switch (status) {
// //       case 'Rated':
// //         return (
// //           <div className="flex items-center text-green-600 font-semibold text-xs">
// //             <FaTruckFast className="mr-1 text-sm" /> Đã đánh giá{' '}
// //             <FaCircleQuestion className="ml-1 text-xs text-gray-500 cursor-pointer hover:text-gray-700" title="Chi tiết đánh giá" />
// //             <span className="ml-2 pl-2 border-l border-gray-300 text-green-600 uppercase">ĐÃ ĐÁNH GIÁ</span>
// //           </div>
// //         );
// //       case 'Completed':
// //         return (
// //           <div className="flex items-center text-green-600 font-semibold text-xs">
// //             <FaTruckFast className="mr-1 text-sm" /> Giao hàng thành công{' '}
// //             <FaCircleQuestion className="ml-1 text-xs text-gray-500 cursor-pointer hover:text-gray-700" title="Chi tiết giao hàng" />
// //             <span className="ml-2 pl-2 border-l border-gray-300 text-green-600 uppercase">HOÀN THÀNH</span>
// //           </div>
// //         );
// //       case 'Shipped':
// //         return (
// //           <div className="flex items-center text-blue-600 font-semibold text-xs">
// //             <FaTruckFast className="mr-1 text-sm" /> Đang vận chuyển{' '}
// //             <FaCircleQuestion className="ml-1 text-xs text-gray-500 cursor-pointer hover:text-gray-700" title="Chi tiết vận chuyển" />
// //             <span className="ml-2 pl-2 border-l border-gray-300 text-blue-500 uppercase">VẬN CHUYỂN</span>
// //           </div>
// //         );
// //       case 'Pending':
// //         return (
// //           <div className="flex items-center text-gray-600 font-semibold text-xs">
// //             <span className="ml-2 pl-2 text-gray-500 uppercase">CHỜ XÁC NHẬN</span>
// //           </div>
// //         );
// //       case 'Processing':
// //         return (
// //           <div className="flex items-center text-gray-600 font-semibold text-xs">
// //             <span className="ml-2 pl-2 text-gray-500 uppercase">ĐANG XỬ LÝ</span>
// //           </div>
// //         );
// //       case 'CancelledByBuyer':
// //       case 'CancelledBySeller':
// //         return (
// //           <div className="flex items-center text-red-600 font-semibold text-xs">
// //             <span className="ml-2 pl-2 border-l border-gray-300 text-red-500 uppercase">ĐÃ HỦY</span>
// //           </div>
// //         );
// //       case 'Returned':
// //       case 'ReturnInProgress':
// //         return (
// //           <div className="flex items-center text-yellow-600 font-semibold text-xs">
// //             <span className="ml-2 pl-2 border-l border-gray-300 text-yellow-500 uppercase">TRẢ HÀNG/HOÀN TIỀN</span>
// //           </div>
// //         );
// //       default:
// //         return (
// //           <div className="flex items-center text-gray-600 font-semibold text-xs">
// //             <span className="ml-2 pl-2 text-gray-500 uppercase">{order.OverallStatus}</span>
// //           </div>
// //         );
// //     }
// //   };

// //   return (
// //     // Wrap the entire card in a Link component
// //     <>
// //       {/* GHI CHÚ: Thẻ bao ngoài cùng bây giờ là <div>, không phải <Link> nữa */}
// //       <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4 transition-shadow duration-200">
// //         {/* Shop Header */}
// //         <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
// //           <div className="flex items-center gap-2">
// //             {order.shopLevel === 'Mall' && (
// //               <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded">Mall</span>
// //             )}
// //             {order.shopLevel === 'Favorite' && (
// //               <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded">Yêu thích+</span>
// //             )}
// //             <h3 className="font-semibold text-gray-800 text-sm">{order.shopName}</h3>
// //             {/* GHI CHÚ: Đã xóa onClick={(e) => e.preventDefault()} vì không còn cần thiết */}
// //             <button className="flex items-center px-2 py-1 border border-gray-300 rounded-md text-xs text-gray-700 hover:bg-gray-100 transition-colors">
// //               <FaCommentDots className="mr-1 text-sm" /> Chat
// //             </button>
// //             <button className="flex items-center px-2 py-1 border border-gray-300 rounded-md text-xs text-gray-700 hover:bg-gray-100 transition-colors">
// //               <FaStore className="mr-1 text-sm" /> Xem Shop
// //             </button>
// //           </div>
// //           {renderDeliveryStatus(order.OverallStatus)}
// //         </div>

// //         {/* GHI CHÚ: Chỉ bọc phần danh sách sản phẩm bằng <Link> để điều hướng đến trang chi tiết */}
// //         <Link href={detailPageUrl} className="block cursor-pointer hover:bg-gray-50/50">
// //           {order.items.map((item, index) => (
// //             <div key={item.OrderItemID} className={`flex items-start px-4 py-3 ${index < order.items.length - 1 ? 'border-b border-gray-100' : ''}`}>
// //               <div className="flex-shrink-0 w-14 h-14 relative mr-3 border border-gray-200 rounded-md overflow-hidden">
// //                 <img src={getFullImageUrl(item.productImageURL)} alt={item.productName} className="w-full h-full object-cover" />
// //               </div>
// //               <div className="flex-1 flex flex-col">
// //                 <p className="font-semibold text-gray-800 text-sm leading-tight mb-0.5">{item.productName}</p>
// //                 <p className="text-gray-600 text-xs mt-0.5">Loại: {item.classification}</p>
// //                 {item.OriginalPrice > item.PriceAtPurchase && (
// //                   <p className="text-gray-400 line-through text-xs mt-0.5 whitespace-nowrap">{formatVND(item.OriginalPrice)}</p>
// //                 )}
// //                 <p className="text-xs text-gray-600">x{item.Quantity}</p>
// //               </div>
// //               <div className="flex-shrink-0 text-right ml-4">
// //                 <p className="text-base font-bold text-orange-500">{formatVND(item.PriceAtPurchase)}</p>
// //               </div>
// //             </div>
// //           ))}
// //         </Link>

// //         {/* Total Amount */}
// //         <div className="flex justify-end items-center px-4 pt-3 pb-3 border-t border-gray-100">
// //           <span className="text-gray-700 text-sm mr-3">Thành tiền:</span>
// //           <span className="text-xl font-bold text-orange-500">{formatVND(order.TotalAmount)}</span>
// //         </div>

// //         {/* Action Buttons Section - Bây giờ các nút/link ở đây hoàn toàn hợp lệ */}
// //         <div className="px-4 pb-4 pt-3 border-t border-gray-100 flex flex-col items-end">
// //           {order.OverallStatus === 'Completed' && order.items.some(item => item.canReview) && (
// //             <div className="w-full text-right">
// //               <p className="text-xs text-gray-500 mb-1">
// //                 Đánh giá sản phẩm trước{' '}
// //                 <span className="text-blue-500">{formatDate(order.items[0]?.reviewDeadline || '')}</span>
// //               </p>
// //               <p className="text-xs text-gray-500 mb-3">
// //                 Đánh giá ngay và nhận{' '}
// //                 <span className="text-orange-500">{order.items[0]?.reviewReward || 0} Xu</span>
// //               </p>
// //             </div>
// //           )}

// //           <div className="flex gap-2 justify-end w-full">
// //             {order.OverallStatus === 'Completed' && (
// //               <>
// //                 {/* GHI CHÚ: Link này bây giờ hợp lệ vì không còn lồng trong link khác */}
// //                 {order.items.some(item => item.canReview) && (
// //                   <Link
// //                     href={`/account/review?orderId=${order.OrderID}`}
// //                     className="bg-orange-500 text-white px-6 py-2 rounded-md text-sm font-semibold hover:bg-orange-600 transition-colors block text-center"
// //                   >
// //                     Đánh Giá
// //                   </Link>
// //                 )}
// //                 <button
// //                   className="bg-white text-gray-700 px-4 py-1.5 rounded-md font-semibold text-xs border border-gray-300 hover:bg-gray-100 transition-colors flex-shrink-0"
// //                   onClick={() => setIsReturnModalOpen(true)}
// //                 >
// //                   Yêu Cầu Trả Hàng
// //                 </button>
// //                 <div className="relative">
// //                   <button
// //                     className="flex items-center bg-white text-gray-700 px-4 py-1.5 rounded-md font-semibold text-xs border border-gray-300 hover:bg-gray-100 transition-colors"
// //                     onClick={(e) => { e.preventDefault(); setIsDropdownOpen(!isDropdownOpen); }}
// //                   >
// //                     Thêm <FaChevronDown className={`ml-1 text-xs transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
// //                   </button>
// //                   {isDropdownOpen && (
// //                     <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-md shadow-lg py-0.5 z-10">
// //                       <button className="block w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100" onClick={(e) => e.preventDefault()}>
// //                         Liên Hệ Người Bán
// //                       </button>
// //                       <button className="block w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100" onClick={(e) => e.preventDefault()}>
// //                         Mua Lại
// //                       </button>
// //                     </div>
// //                   )}
// //                 </div>
// //               </>
// //             )}

// //             {(order.OverallStatus === 'Shipped' || order.OverallStatus === 'Processing' || order.OverallStatus === 'Pending') && (
// //               <div className="flex gap-2">
// //                 <button className="bg-white text-gray-700 px-4 py-1.5 rounded-md font-semibold text-xs border border-gray-300 hover:bg-gray-100 transition-colors flex-shrink-0" onClick={(e) => e.preventDefault()}>
// //                   Liên Hệ Người Bán
// //                 </button>
// //                 <button className="bg-white text-gray-700 px-4 py-1.5 rounded-md font-semibold text-xs border border-gray-300 hover:bg-gray-100 transition-colors flex-shrink-0" onClick={(e) => e.preventDefault()}>
// //                   Hủy Đơn
// //                 </button>
// //               </div>
// //             )}
// //             {(order.OverallStatus === 'CancelledByBuyer' || order.OverallStatus === 'CancelledBySeller' || order.OverallStatus === 'Returned' || order.OverallStatus === 'ReturnInProgress') && (
// //               <div className="flex gap-2">
// //                 <button className="bg-white text-gray-700 px-4 py-1.5 rounded-md font-semibold text-xs border border-gray-300 hover:bg-gray-100 transition-colors flex-shrink-0" onClick={(e) => e.preventDefault()}>
// //                   Mua Lại
// //                 </button>
// //                 <button className="bg-white text-gray-700 px-4 py-1.5 rounded-md font-semibold text-xs border border-gray-300 hover:bg-gray-100 transition-colors flex-shrink-0" onClick={(e) => e.preventDefault()}>
// //                   Liên Hệ Người Bán
// //                 </button>
// //               </div>
// //             )}
// //           </div>
// //         </div>
// //       </div>
// //       {/* 4. Render Modal tại đây, nó sẽ chỉ hiển thị khi state isReturnModalOpen là true */}
// //       <div className="z-50">
// //         {isReturnModalOpen && authToken && (
// //           <ReturnRequestModal
// //             isOpen={isReturnModalOpen}
// //             onClose={() => setIsReturnModalOpen(false)}
// //             onSuccess={handleReturnSuccess}
// //             order={order}
// //             token={authToken}
// //           />
// //         )}
// //       </div>
// //     </>
// //   );
// // };

// // export default OrderCard;
// 'use client';

// import React, { useEffect, useState } from 'react';
// import Link from 'next/link';
// import { FaTruckFast, FaCircleQuestion, FaCommentDots, FaStore, FaChevronDown } from 'react-icons/fa6';

// import { Order, OrderStatus } from '@/types';
// import { getFullImageUrl } from '@/services/api'; // Đảm bảo getFullImageUrl được import
// import ReturnRequestModal from './modals/ReturnRequestModal';

// // --- Helper Functions (Không đổi) ---
// const formatVND = (price: number): string => {
//   if (isNaN(price)) return '0 ₫';
//   return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
// };

// const formatDate = (isoString: string): string => {
//   if (!isoString) return '';
//   const date = new Date(isoString);
//   const day = String(date.getDate()).padStart(2, '0');
//   const month = String(date.getMonth() + 1).padStart(2, '0');
//   const year = date.getFullYear();
//   return `${day}-${month}-${year}`;
// };

// // --- Main Component ---
// const OrderCard: React.FC<{ order: Order }> = ({ order }) => {
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
//   const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);

//   // Chúng ta sẽ đọc token trực tiếp từ localStorage khi cần,
//   // không cần lưu vào state authToken của OrderCard nữa để đơn giản.
//   // Tuy nhiên, để đảm bảo type an toàn cho ReturnRequestModal,
//   // chúng ta vẫn cần một biến token để truyền đi.
//   let currentAuthToken: string | null = null;
//   if (typeof window !== 'undefined') {
//     // *** ĐÂY LÀ DÒNG SỬA LỖI QUAN TRỌNG NHẤT ***
//     currentAuthToken = localStorage.getItem('token'); // Đọc đúng key 'token'
//   }

//   // --- LOG ĐỂ DEBUG ---
//   // Dữ liệu order
//   console.log("Dữ liệu cho OrderCard:", order);
//   // Token đọc được ngay khi component render
//   console.log(`[OrderCard ID: ${order.OrderID}] Token đọc từ localStorage (ngay khi render):`, currentAuthToken);

//   const detailPageUrl = `/account/purchase/${order.OrderID}`;

//   const handleReturnSuccess = (message: string) => {
//     alert(message);
//     setIsReturnModalOpen(false);
//     window.location.reload();
//   };

//   // Hàm xử lý khi click nút "Yêu Cầu Trả Hàng"
//   const handleOpenReturnModal = () => {
//     // Kiểm tra token ngay tại thời điểm click
//     const tokenToCheck = currentAuthToken; // Sử dụng biến đã đọc ở trên

//     if (!tokenToCheck) {
//       console.error(`[LỖI TẠI OrderCard ID: ${order.OrderID}] Không tìm thấy TOKEN. Dừng mở modal.`);
//       alert("Lỗi: Không tìm thấy thông tin đăng nhập. Vui lòng đăng nhập lại để thực hiện chức năng này.");
//       return; // Dừng hàm nếu không có token
//     }

//     console.log(`[OrderCard ID: ${order.OrderID}] Đã xác nhận có token. Đang tiến hành mở modal...`);
//     setIsReturnModalOpen(true); // Mở modal
//   };


//   const renderDeliveryStatus = (status: OrderStatus) => {
//     switch (status) {
//       case 'Rated':
//         return (
//           <div className="flex items-center text-green-600 font-semibold text-xs">
//             <FaTruckFast className="mr-1 text-sm" /> Đã đánh giá{' '}
//             <FaCircleQuestion className="ml-1 text-xs text-gray-500 cursor-pointer hover:text-gray-700" title="Chi tiết đánh giá" />
//             <span className="ml-2 pl-2 border-l border-gray-300 text-green-600 uppercase">ĐÃ ĐÁNH GIÁ</span>
//           </div>
//         );
//       case 'Completed':
//         return (
//           <div className="flex items-center text-green-600 font-semibold text-xs">
//             <FaTruckFast className="mr-1 text-sm" /> Giao hàng thành công{' '}
//             <FaCircleQuestion className="ml-1 text-xs text-gray-500 cursor-pointer hover:text-gray-700" title="Chi tiết giao hàng" />
//             <span className="ml-2 pl-2 border-l border-gray-300 text-green-600 uppercase">HOÀN THÀNH</span>
//           </div>
//         );
//       case 'Shipped':
//         return (
//           <div className="flex items-center text-blue-600 font-semibold text-xs">
//             <FaTruckFast className="mr-1 text-sm" /> Đang vận chuyển{' '}
//             <FaCircleQuestion className="ml-1 text-xs text-gray-500 cursor-pointer hover:text-gray-700" title="Chi tiết vận chuyển" />
//             <span className="ml-2 pl-2 border-l border-gray-300 text-blue-500 uppercase">VẬN CHUYỂN</span>
//           </div>
//         );
//       case 'Pending':
//         return (
//           <div className="flex items-center text-gray-600 font-semibold text-xs">
//             <span className="ml-2 pl-2 text-gray-500 uppercase">CHỜ XÁC NHẬN</span>
//           </div>
//         );
//       case 'Processing':
//         return (
//           <div className="flex items-center text-gray-600 font-semibold text-xs">
//             <span className="ml-2 pl-2 text-gray-500 uppercase">ĐANG XỬ LÝ</span>
//           </div>
//         );
//       case 'CancelledByBuyer':
//       case 'CancelledBySeller':
//         return (
//           <div className="flex items-center text-red-600 font-semibold text-xs">
//             <span className="ml-2 pl-2 border-l border-gray-300 text-red-500 uppercase">ĐÃ HỦY</span>
//           </div>
//         );
//       case 'Returned':
//       case 'ReturnInProgress':
//         return (
//           <div className="flex items-center text-yellow-600 font-semibold text-xs">
//             <span className="ml-2 pl-2 border-l border-gray-300 text-yellow-500 uppercase">TRẢ HÀNG/HOÀN TIỀN</span>
//           </div>
//         );
//       default:
//         return (
//           <div className="flex items-center text-gray-600 font-semibold text-xs">
//             <span className="ml-2 pl-2 text-gray-500 uppercase">{order.OverallStatus}</span>
//           </div>
//         );
//     }
//   };

//   return (
//     <>
//       <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4 transition-shadow duration-200">
//         {/* Shop Header */}
//         <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
//           <div className="flex items-center gap-2">
//             {order.shopLevel === 'Mall' && (
//               <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded">Mall</span>
//             )}
//             {order.shopLevel === 'Favorite' && (
//               <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded">Yêu thích+</span>
//             )}
//             <h3 className="font-semibold text-gray-800 text-sm">{order.shopName}</h3>
//             <button className="flex items-center px-2 py-1 border border-gray-300 rounded-md text-xs text-gray-700 hover:bg-gray-100 transition-colors">
//               <FaCommentDots className="mr-1 text-sm" /> Chat
//             </button>
//             <button className="flex items-center px-2 py-1 border border-gray-300 rounded-md text-xs text-gray-700 hover:bg-gray-100 transition-colors">
//               <FaStore className="mr-1 text-sm" /> Xem Shop
//             </button>
//           </div>
//           {renderDeliveryStatus(order.OverallStatus)}
//         </div>

//         {/* Thông tin sản phẩm */}
//         <Link href={detailPageUrl} className="block cursor-pointer hover:bg-gray-50/50">
//           {order.items.map((item, index) => (
//             <div key={item.OrderItemID} className={`flex items-start px-4 py-3 ${index < order.items.length - 1 ? 'border-b border-gray-100' : ''}`}>
//               <div className="flex-shrink-0 w-14 h-14 relative mr-3 border border-gray-200 rounded-md overflow-hidden">
//                 <img src={getFullImageUrl(item.productImageURL)} alt={item.productName} className="w-full h-full object-cover" />
//               </div>
//               <div className="flex-1 flex flex-col">
//                 <p className="font-semibold text-gray-800 text-sm leading-tight mb-0.5">{item.productName}</p>
//                 <p className="text-gray-600 text-xs mt-0.5">Loại: {item.classification}</p>
//                 {item.OriginalPrice > item.PriceAtPurchase && (
//                   <p className="text-gray-400 line-through text-xs mt-0.5 whitespace-nowrap">{formatVND(item.OriginalPrice)}</p>
//                 )}
//                 <p className="text-xs text-gray-600">x{item.Quantity}</p>
//               </div>
//               <div className="flex-shrink-0 text-right ml-4">
//                 <p className="text-base font-bold text-orange-500">{formatVND(item.PriceAtPurchase)}</p>
//               </div>
//             </div>
//           ))}
//         </Link>

//         {/* Total Amount */}
//         <div className="flex justify-end items-center px-4 pt-3 pb-3 border-t border-gray-100">
//           <span className="text-gray-700 text-sm mr-3">Thành tiền:</span>
//           <span className="text-xl font-bold text-orange-500">{formatVND(order.TotalAmount)}</span>
//         </div>

//         {/* Action Buttons Section */}
//         <div className="px-4 pb-4 pt-3 border-t border-gray-100 flex flex-col items-end">
//           {order.OverallStatus === 'Completed' && order.items.some(item => item.canReview) && (
//             <div className="w-full text-right">
//               {/* ... Các thông tin đánh giá ... */}
//             </div>
//           )}

//           <div className="flex gap-2 justify-end w-full">
//             {order.OverallStatus === 'Completed' && (
//               <>
//                 <Link
//                   href={`/account/review?orderId=${order.OrderID}`}
//                   className="bg-orange-500 text-white px-6 py-2 rounded-md text-sm font-semibold hover:bg-orange-600 transition-colors block text-center"
//                 >
//                   Đánh Giá
//                 </Link>
//                 <button
//                   className="bg-white text-gray-700 px-4 py-1.5 rounded-md font-semibold text-xs border border-gray-300 hover:bg-gray-100 transition-colors flex-shrink-0"
//                   onClick={handleOpenReturnModal} {/* Gọi hàm xử lý mới */}
//                 >
//                   Yêu Cầu Trả Hàng
//                 </button>
//                 {/* ... Dropdown "Thêm" ... */}
//               </>
//             )}
//             {/* ... Các nút khác tùy theo trạng thái đơn hàng ... */}
//           </div>
//         </div>
//       </div>

//       {/* 
//         Render Modal:
//         Modal chỉ hiển thị khi isReturnModalOpen là true VÀ currentAuthToken có giá trị.
//       */}
//       {isReturnModalOpen && currentAuthToken && (
//         <ReturnRequestModal
//           isOpen={isReturnModalOpen}
//           onClose={() => setIsReturnModalOpen(false)}
//           onSuccess={handleReturnSuccess}
//           order={order}
//           token={currentAuthToken} {/* Truyền token đã được đọc đúng */}
//         />
//       )}
//     </>
//   );
// };

// export default OrderCard;
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { FaTruckFast, FaCircleQuestion, FaCommentDots, FaStore, FaChevronDown } from 'react-icons/fa6';
import { Order, OrderStatus, OrderItem } from '@/types'; // Import thêm OrderItem nếu cần
import { getFullImageUrl } from '@/services/api';
import ReturnRequestModal from './modals/ReturnRequestModal';

// --- Helper Functions ---

const formatVND = (price: number): string => {
  if (isNaN(price)) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

const formatDate = (isoString: string): string => {
  if (!isoString) return '';
  const date = new Date(isoString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

// --- Main Component ---

const OrderCard: React.FC<{ order: Order }> = ({ order }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);

  useEffect(() => {
    let tokenFromStorage: string | null = null;
    if (typeof window !== 'undefined') {
      // *** SỬA LỖI DUY NHẤT TẠI ĐÂY ***
      // Đọc đúng key 'token' thay vì 'authToken'
      tokenFromStorage = localStorage.getItem('token');
    }
    // Dòng log này bây giờ sẽ hiển thị đúng giá trị token
    console.log(`[OrderCard ID: ${order.OrderID}] Đã đọc token từ localStorage:`, tokenFromStorage);
    setAuthToken(tokenFromStorage);
  }, [order.OrderID]); // Thêm dependency để đảm bảo logic đúng khi props thay đổi

  const handleReturnSuccess = (message: string) => {
    alert(message);
    setIsReturnModalOpen(false);
    window.location.reload();
  };

  const renderDeliveryStatus = (status: OrderStatus) => {
    switch (status) {
      case 'Rated':
        return (
          <div className="flex items-center text-green-600 font-semibold text-xs">
            <FaTruckFast className="mr-1 text-sm" /> Đã đánh giá{' '}
            <FaCircleQuestion className="ml-1 text-xs text-gray-500 cursor-pointer hover:text-gray-700" title="Chi tiết đánh giá" />
            <span className="ml-2 pl-2 border-l border-gray-300 text-green-600 uppercase">ĐÃ ĐÁNH GIÁ</span>
          </div>
        );
      case 'Completed':
        return (
          <div className="flex items-center text-green-600 font-semibold text-xs">
            <FaTruckFast className="mr-1 text-sm" /> Giao hàng thành công{' '}
            <FaCircleQuestion className="ml-1 text-xs text-gray-500 cursor-pointer hover:text-gray-700" title="Chi tiết giao hàng" />
            <span className="ml-2 pl-2 border-l border-gray-300 text-green-600 uppercase">HOÀN THÀNH</span>
          </div>
        );
      case 'Shipped':
        return (
          <div className="flex items-center text-blue-600 font-semibold text-xs">
            <FaTruckFast className="mr-1 text-sm" /> Đang vận chuyển{' '}
            <FaCircleQuestion className="ml-1 text-xs text-gray-500 cursor-pointer hover:text-gray-700" title="Chi tiết vận chuyển" />
            <span className="ml-2 pl-2 border-l border-gray-300 text-blue-500 uppercase">VẬN CHUYỂN</span>
          </div>
        );
      case 'Pending':
        return (
          <div className="flex items-center text-gray-600 font-semibold text-xs">
            <span className="ml-2 pl-2 text-gray-500 uppercase">CHỜ XÁC NHẬN</span>
          </div>
        );
      case 'Processing':
        return (
          <div className="flex items-center text-gray-600 font-semibold text-xs">
            <span className="ml-2 pl-2 text-gray-500 uppercase">ĐANG XỬ LÝ</span>
          </div>
        );
      case 'CancelledByBuyer':
      case 'CancelledBySeller':
        return (
          <div className="flex items-center text-red-600 font-semibold text-xs">
            <span className="ml-2 pl-2 border-l border-gray-300 text-red-500 uppercase">ĐÃ HỦY</span>
          </div>
        );
      case 'Returned':
      case 'ReturnInProgress':
        return (
          <div className="flex items-center text-yellow-600 font-semibold text-xs">
            <span className="ml-2 pl-2 border-l border-gray-300 text-yellow-500 uppercase">TRẢ HÀNG/HOÀN TIỀN</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center text-gray-600 font-semibold text-xs">
            <span className="ml-2 pl-2 text-gray-500 uppercase">{order.OverallStatus}</span>
          </div>
        );
    }
  };

  const detailPageUrl = `/account/purchase/${order.OrderID}`;

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4 transition-shadow duration-200">
        {/* Shop Header */}
        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            {order.shopLevel === 'Mall' && (
              <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded">Mall</span>
            )}
            {order.shopLevel === 'Favorite' && (
              <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded">Yêu thích+</span>
            )}
            <h3 className="font-semibold text-gray-800 text-sm">{order.shopName}</h3>
            <button className="flex items-center px-2 py-1 border border-gray-300 rounded-md text-xs text-gray-700 hover:bg-gray-100 transition-colors">
              <FaCommentDots className="mr-1 text-sm" /> Chat
            </button>
            <button className="flex items-center px-2 py-1 border border-gray-300 rounded-md text-xs text-gray-700 hover:bg-gray-100 transition-colors">
              <FaStore className="mr-1 text-sm" /> Xem Shop
            </button>
          </div>
          {renderDeliveryStatus(order.OverallStatus)}
        </div>

        {/* Danh sách sản phẩm */}
        <Link href={detailPageUrl} className="block cursor-pointer hover:bg-gray-50/50">
          {order.items.map((item, index) => (
            <div key={item.OrderItemID} className={`flex items-start px-4 py-3 ${index < order.items.length - 1 ? 'border-b border-gray-100' : ''}`}>
              <div className="flex-shrink-0 w-14 h-14 relative mr-3 border border-gray-200 rounded-md overflow-hidden">
                <img src={getFullImageUrl(item.productImageURL)} alt={item.productName} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 flex flex-col">
                <p className="font-semibold text-gray-800 text-sm leading-tight mb-0.5">{item.productName}</p>
                <p className="text-gray-600 text-xs mt-0.5">Loại: {item.classification}</p>
                {item.OriginalPrice > item.PriceAtPurchase && (
                  <p className="text-gray-400 line-through text-xs mt-0.5 whitespace-nowrap">{formatVND(item.OriginalPrice)}</p>
                )}
                <p className="text-xs text-gray-600">x{item.Quantity}</p>
              </div>
              <div className="flex-shrink-0 text-right ml-4">
                <p className="text-base font-bold text-orange-500">{formatVND(item.PriceAtPurchase)}</p>
              </div>
            </div>
          ))}
        </Link>

        {/* Tổng tiền */}
        <div className="flex justify-end items-center px-4 pt-3 pb-3 border-t border-gray-100">
          <span className="text-gray-700 text-sm mr-3">Thành tiền:</span>
          <span className="text-xl font-bold text-orange-500">{formatVND(order.TotalAmount)}</span>
        </div>

        {/* Các nút hành động */}
        <div className="px-4 pb-4 pt-3 border-t border-gray-100 flex flex-col items-end">
          {order.OverallStatus === 'Completed' && order.items.some(item => item.canReview) && (
            <div className="w-full text-right">
              <p className="text-xs text-gray-500 mb-1">
                Đánh giá sản phẩm trước{' '}
                <span className="text-blue-500">{formatDate(order.items[0]?.reviewDeadline || '')}</span>
              </p>
              <p className="text-xs text-gray-500 mb-3">
                Đánh giá ngay và nhận{' '}
                <span className="text-orange-500">{order.items[0]?.reviewReward || 0} Xu</span>
              </p>
            </div>
          )}

          <div className="flex gap-2 justify-end w-full">
            {order.OverallStatus === 'Completed' && (
              <>
                {order.items.some(item => item.canReview) && (
                  <Link
                    href={`/account/review?orderId=${order.OrderID}`}
                    className="bg-orange-500 text-white px-6 py-2 rounded-md text-sm font-semibold hover:bg-orange-600 transition-colors block text-center"
                  >
                    Đánh Giá
                  </Link>
                )}
                <button
                  className="bg-white text-gray-700 px-4 py-1.5 rounded-md font-semibold text-xs border border-gray-300 hover:bg-gray-100 transition-colors flex-shrink-0"
                  onClick={() => {
                    // Thêm kiểm tra an toàn ngay tại đây
                    if (!authToken) {
                      alert("Không tìm thấy thông tin đăng nhập. Vui lòng tải lại trang hoặc đăng nhập lại.");
                    } else {
                      setIsReturnModalOpen(true);
                    }
                  }}
                >
                  Yêu Cầu Trả Hàng
                </button>
                <div className="relative">
                  <button
                    className="flex items-center bg-white text-gray-700 px-4 py-1.5 rounded-md font-semibold text-xs border border-gray-300 hover:bg-gray-100 transition-colors"
                    onClick={(e) => { e.preventDefault(); setIsDropdownOpen(!isDropdownOpen); }}
                  >
                    Thêm <FaChevronDown className={`ml-1 text-xs transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-md shadow-lg py-0.5 z-10">
                      <button className="block w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100">
                        Liên Hệ Người Bán
                      </button>
                      <button className="block w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100">
                        Mua Lại
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Các điều kiện khác cho các nút */}
            {(order.OverallStatus === 'Shipped' || order.OverallStatus === 'Processing' || order.OverallStatus === 'Pending') && (
              <div className="flex gap-2">
                <button className="bg-white text-gray-700 px-4 py-1.5 rounded-md font-semibold text-xs border border-gray-300 hover:bg-gray-100">Liên Hệ Người Bán</button>
                <button className="bg-white text-gray-700 px-4 py-1.5 rounded-md font-semibold text-xs border border-gray-300 hover:bg-gray-100">Hủy Đơn</button>
              </div>
            )}
            {(order.OverallStatus === 'CancelledByBuyer' || order.OverallStatus === 'CancelledBySeller' || order.OverallStatus === 'Returned' || order.OverallStatus === 'ReturnInProgress') && (
              <div className="flex gap-2">
                <button className="bg-white text-gray-700 px-4 py-1.5 rounded-md font-semibold text-xs border border-gray-300 hover:bg-gray-100">Mua Lại</button>
                <button className="bg-white text-gray-700 px-4 py-1.5 rounded-md font-semibold text-xs border border-gray-300 hover:bg-gray-100">Liên Hệ Người Bán</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Logic render Modal */}
      {isReturnModalOpen && authToken && (
        <ReturnRequestModal
          isOpen={isReturnModalOpen}
          onClose={() => setIsReturnModalOpen(false)}
          onSuccess={handleReturnSuccess}
          order={order}
          token={authToken}
        />
      )}
    </>
  );
};

export default OrderCard;