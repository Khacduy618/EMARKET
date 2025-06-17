// // app/(main)/(account)/components/OrderCard.tsx
// 'use client';

// import React, { useState } from 'react';
// import Image from 'next/image';
// import Link from 'next/link';
// // Đảm bảo import đúng các icon từ 'fa6'
// import { FaTruckFast, FaCircleQuestion, FaCommentDots, FaStore, FaChevronDown } from 'react-icons/fa6';

// import { Order } from '@/types/order.interface';

// interface OrderCardProps {
//   order: Order;
// }

// const formatVND = (price: number): string => {
//   return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
// };

// const formatDate = (isoString: string): string => {
//   const date = new Date(isoString);
//   const day = String(date.getDate()).padStart(2, '0');
//   const month = String(date.getMonth() + 1).padStart(2, '0');
//   const year = date.getFullYear();
//   return `${day}-${month}-${year}`;
// };

// const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);

//   // Logic hiển thị trạng thái giao hàng
//   const renderDeliveryStatus = (status: Order['OverallStatus']) => {
//     switch (status) {
//       case 'Completed':
//         return (
//           <div className="flex items-center text-green-600 text-md">
//             <FaTruckFast className="mr-1 text-sm" /> Giao hàng thành công{' '}
//             <FaCircleQuestion className="ml-1 text-md text-gray-500 cursor-pointer hover:text-gray-700" title="Chi tiết giao hàng" />
//             <span className="ml-2 pl-2 border-l border-gray-300 text-orange-500 uppercase">HOÀN THÀNH</span>
//           </div>
//         );
//       case 'Shipped':
//         return (
//           <div className="flex items-center text-blue-600 text-md">
//             <FaTruckFast className="mr-1 text-sm" /> Đang vận chuyển{' '}
//             <FaCircleQuestion className="ml-1 text-md text-gray-500 cursor-pointer hover:text-gray-700" title="Chi tiết vận chuyển" />
//             <span className="ml-2 pl-2 border-l border-gray-300 text-blue-500 uppercase">VẬN CHUYỂN</span>
//           </div>
//         );
//       case 'Pending':
//         return (
//           <div className="flex items-center text-gray-600 text-md">
//             {/* Đảm bảo không có lỗi cú pháp ở đây */}
//             <span className="ml-2 pl-2 text-gray-500 uppercase">CHỜ THANH TOÁN</span>
//           </div>
//         );
//       case 'Processing':
//         return (
//           <div className="flex items-center text-gray-600 text-md">
//             <span className="ml-2 pl-2 text-gray-500 uppercase">CHỜ GIAO HÀNG</span>
//           </div>
//         );
//       case 'CancelledByBuyer':
//         return (
//           <div className="flex items-center text-red-600 text-md">
//             <span className="ml-2 pl-2 border-l border-gray-300 text-red-500 uppercase">ĐÃ HỦY</span>
//           </div>
//         );
      
//       case 'Returned':
//         return (
//           <div className="flex items-center text-yellow-600 text-md">
//             <span className="ml-2 pl-2 border-l border-gray-300 text-yellow-500 uppercase">TRẢ HÀNG/HOÀN TIỀN</span>
//           </div>
//         );
//       default:
//         return (
//           <div className="flex items-center text-gray-600 text-md">
//             <span className="ml-2 pl-2 text-gray-500 uppercase">{order.OverallStatus}</span>
//           </div>
//         );
//     }
//   };

//   return (
//     <div className="bg-white rounded-lg max-w-6xl  shadow-sm border border-gray-200 mb-4 ">
//       {/* Shop Header */}
//       <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
//         <div className="flex items-center gap-2">
//           {order.shopLevel === 'Mall' && (
//             <span className="px-2 py-0.5 bg-red-500 text-white text-md rounded">Mall</span>
//           )}
//           {order.shopLevel === 'Yêu thích+' && (
//             <span className="px-2 py-0.5 bg-red-500 text-white text-md rounded">Yêu thích+</span>
//           )}
//           <h3 className="text-gray-800 text-sm">{order.shopName}</h3>
//           <button className="flex items-center px-2 py-1 border border-gray-300 rounded-md text-md text-gray-700 hover:bg-gray-100 transition-colors">
//             <FaCommentDots className="mr-1 text-sm" /> Chat
//           </button>
//           <button className="flex items-center px-2 py-1 border border-gray-300 rounded-md text-md text-gray-700 hover:bg-gray-100 transition-colors">
//             <FaStore className="mr-1 text-sm" /> Xem Shop
//           </button>
//         </div>
//         {renderDeliveryStatus(order.OverallStatus)}
//       </div>

//       {/* Product Details Section */}
//       {order.items.map((item, index) => (
//         <div key={item.OrderItemID} className={`flex items-start px-4 py-3 ${index < order.items.length - 1 ? 'border-b border-gray-100' : ''}`}>
//           <div className="flex-shrink-0 w-14 h-14 relative mr-3 border border-gray-200 rounded-md overflow-hidden">
//             <Image
//               src={item.productImageURL}
//               alt={item.productName}
//               layout="fill"
//               objectFit="cover"
//             />
//           </div>
//           <div className="flex-1 flex flex-col">
//             <p className="text-gray-800 text-sm leading-tight mb-0.5">{item.productName}</p>
//             <p className="text-md text-gray-600 mb-0.5">Phân loại hàng: {item.classification}</p>
//             <p className="text-md text-gray-600">x{item.Quantity}</p>
//           </div>
//           <div className="flex-shrink-0 text-right ml-4">
//             {item.OriginalPrice > item.PriceAtPurchase && (
//               <p className="text-md text-gray-400 line-through">{formatVND(item.OriginalPrice)}</p>
//             )}
//             <p className="text-base text-orange-500">{formatVND(item.PriceAtPurchase)}</p>
//           </div>
//         </div>
//       ))}

//       {/* Total Amount for the entire order */}
//       <div className="flex justify-end items-center px-4 pt-3 pb-3 border-t border-gray-100">
//         <span className="text-gray-700 text-sm mr-3">Thành tiền:</span>
//         <span className="text-xl text-orange-500">{formatVND(order.TotalAmount)}</span>
//       </div>

//       {/* Action Buttons Section */}
//       <div className="px-4 pb-4 pt-3 border-t border-gray-100 flex flex-col items-end">
//         {/* Đánh giá và Xu (Chỉ hiển thị khi order Completed) */}
//         {order.OverallStatus === 'Completed' && order.items.some(item => item.canReview) && (
//           <>
//             <p className="text-md text-gray-500 mb-1">
//               Đánh giá sản phẩm trước{' '}
//               <span className="text-blue-500">{formatDate(order.items[0]?.reviewDeadline || '')}</span>
//             </p>
//             <p className="text-md text-gray-500 mb-3">
//               Đánh giá ngay và nhận{' '}
//               <span className="text-orange-500">{order.items[0]?.reviewReward || 0} Xu</span>
//             </p>
//           </>
//         )}

//         <div className="flex gap-2 justify-end w-full">
//           {order.OverallStatus === 'Completed' && (
//             <>
//               {order.items.some(item => item.canReview) && (
//                 <button className="bg-orange-500 text-white px-4 py-1.5 rounded-md text-md hover:bg-orange-600 transition-colors flex-shrink-0">
//                   Đánh Giá
//                 </button>
//               )}
//               <button className="bg-white text-gray-700 px-4 py-1.5 rounded-md text-md border border-gray-300 hover:bg-gray-100 transition-colors flex-shrink-0">
//                 Yêu Cầu Trả Hàng/Hoàn Tiền
//               </button>
//               <div className="relative">
//                 <button
//                   className="flex items-center bg-white text-gray-700 px-4 py-1.5 rounded-md text-md border border-gray-300 hover:bg-gray-100 transition-colors"
//                   onClick={() => setIsDropdownOpen(!isDropdownOpen)}
//                 >
//                   Thêm <FaChevronDown className={`ml-1 text-md transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
//                 </button>
//                 {isDropdownOpen && (
//                   <div className="absolute min-w-[200px] right-0 mt-1 w-40 bg-white border border-gray-200 rounded-md shadow-lg py-0.5 z-50">
//                     <button className="block w-full text-left px-3 py-1.5 text-md text-gray-700 hover:bg-gray-100">
//                       Liên Hệ Người Bán
//                     </button>
//                     <button className="block w-full text-left px-3 py-1.5 text-md text-gray-700 hover:bg-gray-100">
//                       Mua Lại
//                     </button>
//                   </div>
//                 )}
//               </div>
//             </>
//           )}

//           {(order.OverallStatus === 'Shipped' || order.OverallStatus === 'Processing' || order.OverallStatus === 'Pending') && (
//             <div className="flex gap-2">
//               <button className="bg-white text-gray-700 px-4 py-1.5 rounded-md text-md border border-gray-300 hover:bg-gray-100 transition-colors flex-shrink-0">
//                 Liên Hệ Người Bán
//               </button>
//               <button className="bg-white text-gray-700 px-4 py-1.5 rounded-md text-md border border-gray-300 hover:bg-gray-100 transition-colors flex-shrink-0">
//                 Hủy Đơn
//               </button>
//             </div>
//           )}
//           {(order.OverallStatus === 'CancelledByBuyer' || order.OverallStatus === 'Returned') && (
//             <div className="flex gap-2">
//               <button className="bg-white text-gray-700 px-4 py-1.5 rounded-md text-md border border-gray-300 hover:bg-gray-100 transition-colors flex-shrink-0">
//                 Mua Lại
//               </button>
//               <button className="bg-white text-gray-700 px-4 py-1.5 rounded-md text-md border border-gray-300 hover:bg-gray-100 transition-colors flex-shrink-0">
//                 Liên Hệ Người Bán
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default OrderCard;

// app/(main)/(account)/components/OrderCard.tsx
// 'use client';

// import React, { useState } from 'react';
// import Image from 'next/image';
// import Link from 'next/link'; // Import Link để chuyển hướng
// import { FaTruckFast, FaCircleQuestion, FaCommentDots, FaStore, FaChevronDown } from 'react-icons/fa6';

// import { Order, OrderStatus } from '@/types'; // Lấy OrderStatus từ '@/types'

// const formatVND = (price: number): string => {
//   return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
// };

// const formatDate = (isoString: string): string => {
//   const date = new Date(isoString);
//   const day = String(date.getDate()).padStart(2, '0');
//   const month = String(date.getMonth() + 1).padStart(2, '0');
//   const year = date.getFullYear();
//   return `${day}-${month}-${year}`;
// };

// const OrderCard: React.FC<{ order: Order }> = ({ order }) => { // Xóa prop onSeeMoreClick
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);

//   const renderDeliveryStatus = (status: OrderStatus) => { // Giữ nguyên mapping từ OrderStatus (DB)
//     switch (status) {
//       case 'Completed':
//         return (
//           <div className="flex items-center text-green-600 font-semibold text-xs">
//             <FaTruckFast className="mr-1 text-sm" /> Giao hàng thành công{' '}
//             <FaCircleQuestion className="ml-1 text-xs text-gray-500 cursor-pointer hover:text-gray-700" title="Chi tiết giao hàng" />
//             <span className="ml-2 pl-2 border-l border-gray-300 text-orange-500 uppercase">HOÀN THÀNH</span>
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
//       case 'Pending': // Pending từ DB
//         return (
//           <div className="flex items-center text-gray-600 font-semibold text-xs">
//             <span className="ml-2 pl-2 text-gray-500 uppercase">CHỜ XÁC NHẬN</span>
//           </div>
//         );
//       case 'Processing': // Processing từ DB
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
//     <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4 overflow-hidden">
//       {/* Shop Header */}
//       <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
//         <div className="flex items-center gap-2">
//           {order.shopLevel === 'Mall' && (
//             <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded">Mall</span>
//           )}
//           {order.shopLevel === 'Yêu thích+' && (
//             <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded">Yêu thích+</span>
//           )}
//           <h3 className="font-semibold text-gray-800 text-sm">{order.shopName}</h3>
//           <button className="flex items-center px-2 py-1 border border-gray-300 rounded-md text-xs text-gray-700 hover:bg-gray-100 transition-colors">
//             <FaCommentDots className="mr-1 text-sm" /> Chat
//           </button>
//           <button className="flex items-center px-2 py-1 border border-gray-300 rounded-md text-xs text-gray-700 hover:bg-gray-100 transition-colors">
//             <FaStore className="mr-1 text-sm" /> Xem Shop
//           </button>
//         </div>
//         {renderDeliveryStatus(order.OverallStatus)}
//       </div>

//       {/* Product Details Section */}
//       {order.items.map((item, index) => (
//         <div key={item.OrderItemID} className={`flex items-start px-4 py-3 ${index < order.items.length - 1 ? 'border-b border-gray-100' : ''}`}>
//           <div className="flex-shrink-0 w-14 h-14 relative mr-3 border border-gray-200 rounded-md overflow-hidden">
//             <Image
//               src={item.productImageURL}
//               alt={item.productName}
//               layout="fill"
//               objectFit="cover"
//             />
//           </div>
//           <div className="flex-1 flex flex-col">
//             <p className="font-semibold text-gray-800 text-sm leading-tight mb-0.5">{item.productName}</p>
//             <p className="text-gray-600 text-xs mt-0.5">Loại: {item.classification}</p>
//             {item.OriginalPrice > item.PriceAtPurchase && (
//               <p className="text-gray-400 line-through text-xs mt-0.5 whitespace-nowrap">{formatVND(item.OriginalPrice)}</p>
//             )}
//             <p className="text-xs text-gray-600">x{item.Quantity}</p> {/* Quantity should be here */}
//           </div>
//           <div className="flex-shrink-0 text-right ml-4">
//             <p className="text-base font-bold text-orange-500">{formatVND(item.PriceAtPurchase)}</p> {/* This is price at purchase */}
//           </div>
//         </div>
//       ))}

//       {/* Total Amount for the entire order */}
//       <div className="flex justify-end items-center px-4 pt-3 pb-3 border-t border-gray-100">
//         <span className="text-gray-700 text-sm mr-3">Thành tiền:</span>
//         <span className="text-xl font-bold text-orange-500">{formatVND(order.TotalAmount)}</span>
//       </div>

//       {/* Action Buttons Section */}
//       <div className="px-4 pb-4 pt-3 border-t border-gray-100 flex flex-col items-end">
//         {order.OverallStatus === 'Completed' && order.items.some(item => item.canReview) && (
//           <>
//             <p className="text-xs text-gray-500 mb-1">
//               Đánh giá sản phẩm trước{' '}
//               <span className="text-blue-500">{formatDate(order.items[0]?.reviewDeadline || '')}</span>
//             </p>
//             <p className="text-xs text-gray-500 mb-3">
//               Đánh giá ngay và nhận{' '}
//               <span className="text-orange-500">{order.items[0]?.reviewReward || 0} Xu</span>
//             </p>
//           </>
//         )}

//         <div className="flex gap-2 justify-end w-full">
//           {order.OverallStatus === 'Completed' && (
//             <>
//               {order.items.some(item => item.canReview) && (
//                 <button className="bg-orange-500 text-white px-4 py-1.5 rounded-md font-semibold text-xs hover:bg-orange-600 transition-colors flex-shrink-0">
//                   Đánh Giá
//                 </button>
//               )}
//               <button className="bg-white text-gray-700 px-4 py-1.5 rounded-md font-semibold text-xs border border-gray-300 hover:bg-gray-100 transition-colors flex-shrink-0">
//                 Yêu Cầu Trả Hàng/Hoàn Tiền
//               </button>
//               <div className="relative">
//                 <button
//                   className="flex items-center bg-white text-gray-700 px-4 py-1.5 rounded-md font-semibold text-xs border border-gray-300 hover:bg-gray-100 transition-colors"
//                   onClick={() => setIsDropdownOpen(!isDropdownOpen)}
//                 >
//                   Thêm <FaChevronDown className={`ml-1 text-xs transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
//                 </button>
//                 {isDropdownOpen && (
//                   <div className="absolute right-0 mt-1 w-200 bg-white border border-gray-200 rounded-md shadow-lg py-0.5 z-10">
//                     <button className="block w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100">
//                       Liên Hệ Người Bán
//                     </button>
//                     <button className="block w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100">
//                       Mua Lại
//                     </button>
//                   </div>
//                 )}
//               </div>
//             </>
//           )}

//           {(order.OverallStatus === 'Shipped' || order.OverallStatus === 'Processing' || order.OverallStatus === 'Pending') && ( // Pending cho trường hợp COD chờ xác nhận
//             <div className="flex gap-2">
//               <button className="bg-white text-gray-700 px-4 py-1.5 rounded-md font-semibold text-xs border border-gray-300 hover:bg-gray-100 transition-colors flex-shrink-0">
//                 Liên Hệ Người Bán
//               </button>
//               <button className="bg-white text-gray-700 px-4 py-1.5 rounded-md font-semibold text-xs border border-gray-300 hover:bg-gray-100 transition-colors flex-shrink-0">
//                 Hủy Đơn
//               </button>
//             </div>
//           )}
//           {(order.OverallStatus === 'CancelledByBuyer' || order.OverallStatus === 'CancelledBySeller' || order.OverallStatus === 'Returned' || order.OverallStatus === 'ReturnInProgress') && (
//             <div className="flex gap-2">
//               <button className="bg-white text-gray-700 px-4 py-1.5 rounded-md font-semibold text-xs border border-gray-300 hover:bg-gray-100 transition-colors flex-shrink-0">
//                 Mua Lại
//               </button>
//               <button className="bg-white text-gray-700 px-4 py-1.5 rounded-md font-semibold text-xs border border-gray-300 hover:bg-gray-100 transition-colors flex-shrink-0">
//                 Xem chi tiết huỷ
//               </button>
//               <button className="bg-white text-gray-700 px-4 py-1.5 rounded-md font-semibold text-xs border border-gray-300 hover:bg-gray-100 transition-colors flex-shrink-0">
//                 Liên Hệ Người Bán
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default OrderCard;


// app/(main)/(account)/components/OrderCard.tsx
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link'; // Import Link để chuyển hướng
import { FaTruckFast, FaCircleQuestion, FaCommentDots, FaStore, FaChevronDown } from 'react-icons/fa6';

import { Order, OrderStatus } from '@/types'; // Lấy Order và OrderStatus từ '@/types'

const formatVND = (price: number): string => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

const formatDate = (isoString: string): string => {
  const date = new Date(isoString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const OrderCard: React.FC<{ order: Order }> = ({ order }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const renderDeliveryStatus = (status: OrderStatus) => {
    switch (status) {
      case 'Completed':
        return (
          <div className="flex items-center text-green-600 font-semibold text-xs">
            <FaTruckFast className="mr-1 text-sm" /> Giao hàng thành công{' '}
            <FaCircleQuestion className="ml-1 text-xs text-gray-500 cursor-pointer hover:text-gray-700" title="Chi tiết giao hàng" />
            <span className="ml-2 pl-2 border-l border-gray-300 text-orange-500 uppercase">HOÀN THÀNH</span>
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

  return (
    // Wrap the entire card in a Link component
    <Link href={`/purchase/${order.OrderID}`} passHref className="block"> {/* passHref để Link truyền href xuống div */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4 overflow-hidden cursor-pointer hover:shadow-md transition-shadow duration-200"> {/* Thêm cursor-pointer và hover effect */}
        {/* Shop Header */}
        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            {order.shopLevel === 'Mall' && (
              <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded">Mall</span>
            )}
            {order.shopLevel === 'Yêu thích+' && (
              <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded">Yêu thích+</span>
            )}
            <h3 className="font-semibold text-gray-800 text-sm">{order.shopName}</h3>
            <button className="flex items-center px-2 py-1 border border-gray-300 rounded-md text-xs text-gray-700 hover:bg-gray-100 transition-colors" onClick={(e) => e.preventDefault()}> {/* preventDefault để không kích hoạt Link */}
              <FaCommentDots className="mr-1 text-sm" /> Chat
            </button>
            <button className="flex items-center px-2 py-1 border border-gray-300 rounded-md text-xs text-gray-700 hover:bg-gray-100 transition-colors" onClick={(e) => e.preventDefault()}> {/* preventDefault để không kích hoạt Link */}
              <FaStore className="mr-1 text-sm" /> Xem Shop
            </button>
          </div>
          {renderDeliveryStatus(order.OverallStatus)}
        </div>

        {/* Product Details Section */}
        {order.items.map((item, index) => (
          <div key={item.OrderItemID} className={`flex items-start px-4 py-3 ${index < order.items.length - 1 ? 'border-b border-gray-100' : ''}`}>
            <div className="flex-shrink-0 w-14 h-14 relative mr-3 border border-gray-200 rounded-md overflow-hidden">
              <Image
                src={item.productImageURL}
                alt={item.productName}
                layout="fill"
                objectFit="cover"
              />
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

        {/* Total Amount for the entire order */}
        <div className="flex justify-end items-center px-4 pt-3 pb-3 border-t border-gray-100">
          <span className="text-gray-700 text-sm mr-3">Thành tiền:</span>
          <span className="text-xl font-bold text-orange-500">{formatVND(order.TotalAmount)}</span>
        </div>

        {/* Action Buttons Section (Clicking these should not trigger Link) */}
        <div className="px-4 pb-4 pt-3 border-t border-gray-100 flex flex-col items-end">
          {order.OverallStatus === 'Completed' && order.items.some(item => item.canReview) && (
            <>
              <p className="text-xs text-gray-500 mb-1">
                Đánh giá sản phẩm trước{' '}
                <span className="text-blue-500">{formatDate(order.items[0]?.reviewDeadline || '')}</span>
              </p>
              <p className="text-xs text-gray-500 mb-3">
                Đánh giá ngay và nhận{' '}
                <span className="text-orange-500">{order.items[0]?.reviewReward || 0} Xu</span>
              </p>
            </>
          )}

          <div className="flex gap-2 justify-end w-full">
            {order.OverallStatus === 'Completed' && (
              <>
                {order.items.some(item => item.canReview) && (
                  <button className="bg-orange-500 text-white px-4 py-1.5 rounded-md font-semibold text-xs hover:bg-orange-600 transition-colors flex-shrink-0" onClick={(e) => e.preventDefault()}>
                    Đánh Giá
                  </button>
                )}
                <button className="bg-white text-gray-700 px-4 py-1.5 rounded-md font-semibold text-xs border border-gray-300 hover:bg-gray-100 transition-colors flex-shrink-0" onClick={(e) => e.preventDefault()}>
                  Yêu Cầu Trả Hàng/Hoàn Tiền
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
                      <button className="block w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100" onClick={(e) => e.preventDefault()}>
                        Liên Hệ Người Bán
                      </button>
                      <button className="block w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100" onClick={(e) => e.preventDefault()}>
                        Mua Lại
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}

            {(order.OverallStatus === 'Shipped' || order.OverallStatus === 'Processing' || order.OverallStatus === 'Pending') && (
              <div className="flex gap-2">
                <button className="bg-white text-gray-700 px-4 py-1.5 rounded-md font-semibold text-xs border border-gray-300 hover:bg-gray-100 transition-colors flex-shrink-0" onClick={(e) => e.preventDefault()}>
                  Liên Hệ Người Bán
                </button>
                <button className="bg-white text-gray-700 px-4 py-1.5 rounded-md font-semibold text-xs border border-gray-300 hover:bg-gray-100 transition-colors flex-shrink-0" onClick={(e) => e.preventDefault()}>
                  Hủy Đơn
                </button>
              </div>
            )}
            {(order.OverallStatus === 'CancelledByBuyer' || order.OverallStatus === 'CancelledBySeller' || order.OverallStatus === 'Returned' || order.OverallStatus === 'ReturnInProgress') && (
              <div className="flex gap-2">
                <button className="bg-white text-gray-700 px-4 py-1.5 rounded-md font-semibold text-xs border border-gray-300 hover:bg-gray-100 transition-colors flex-shrink-0" onClick={(e) => e.preventDefault()}>
                  Mua Lại
                </button>
                <button className="bg-white text-gray-700 px-4 py-1.5 rounded-md font-semibold text-xs border border-gray-300 hover:bg-gray-100 transition-colors flex-shrink-0" onClick={(e) => e.preventDefault()}>
                  Liên Hệ Người Bán
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default OrderCard;