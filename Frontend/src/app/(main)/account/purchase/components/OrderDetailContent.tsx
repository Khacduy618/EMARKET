
// // app/(main)/(account)/orders/[orderId]/components/OrderDetailContent.tsx
// 'use client';

// import React from 'react';
// import Image from 'next/image';
// import Link from 'next/link';
// import { FaChevronLeft, FaCommentDots, FaRegLifeRing, FaTruckFast } from 'react-icons/fa6';
// import { Order } from '@/types'; // Lấy Order từ '@/types'

// import OrderProgressTracker from './OrderProgressTracker';
// import OrderShippingInfo from './OrderShippingInfo';
// import { getFullImageUrl } from '@/services/api';

// const formatVND = (price: number): string => {
//   return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
// };

// interface OrderDetailContentProps {
//   order: Order;
// }

// const priceColWidth = '150px';
// const qtyColWidth = '100px';
// const subtotalColWidth = '150px';

// const getDeliveryEstimate = (orderDateString: string) => {
//     const orderDate = new Date(orderDateString);
//     if (isNaN(orderDate.getTime())) {
//         // Trả về giá trị mặc định nếu ngày không hợp lệ
//         return { start: 'N/A', end: 'N/A' };
//     }

//     // Tính ngày bắt đầu (ví dụ: sau 3 ngày)
//     const startDate = new Date(orderDate);
//     startDate.setDate(orderDate.getDate() + 3);

//     // Tính ngày kết thúc (ví dụ: sau 6 ngày)
//     const endDate = new Date(orderDate);
//     endDate.setDate(orderDate.getDate() + 6);

//     // Định dạng ngày thành chuỗi 'dd-mm-yyyy'
//     const formatDate = (date: Date) => {
//         const day = String(date.getDate()).padStart(2, '0');
//         const month = String(date.getMonth() + 1).padStart(2, '0'); // Tháng bắt đầu từ 0
//         const year = date.getFullYear();
//         return `${day}-${month}-${year}`;
//     };

//     return {
//         start: formatDate(startDate),
//         end: formatDate(endDate),
//     };
// };

// const OrderDetailContent: React.FC<OrderDetailContentProps> = ({ order }) => {
//   const isCancelled = order.OverallStatus === 'CancelledByBuyer' || order.OverallStatus === 'CancelledBySeller';
//   const isDeliveredOrCompleted = order.OverallStatus === 'Delivered' || order.OverallStatus === 'Completed';

//   const deliveryEstimate = getDeliveryEstimate(order.OrderDate);

//   // Lấy giá trị của shippingTracking một cách an toàn và sử dụng biến này
//   const hasShippingTracking = order.shippingTracking && order.shippingTracking.length > 0;

//   const totalProductsPrice = order.shopOrders.reduce((total, shopOrder) => {
//       const shopSubtotal = shopOrder.items.reduce((sum, item) => sum + item.Subtotal, 0);
//       return total + shopSubtotal;
//   }, 0);


//   return (
//     <div className="flex flex-col h-full">
//       {/* Header trang chi tiết */}
//       <div className="bg-white py-4 px-6 rounded-sm border-b border-gray-100 shadow-sm">
//         <div className="container mx-auto max-w-6xl flex justify-between items-center">
//           <Link href="/purchase" className="flex items-center text-gray-600 hover:text-orange-500 text-sm">
//             <FaChevronLeft className="mr-2" /> TRỞ LẠI
//           </Link>
//           <div className="flex items-center text-gray-800 text-sm font-semibold">
//             <span className="mr-4">MÃ ĐƠN HÀNG. {order.OrderCode}</span>
//             <span className="text-orange-500 uppercase">
//               {order.OverallStatus === 'Completed' ? 'ĐÃ HOÀN THÀNH' :
//                order.OverallStatus === 'Shipped' ? 'ĐANG GIAO HÀNG' :
//                order.OverallStatus === 'Delivered' ? 'ĐÃ GIAO HÀNG' :
//                order.OverallStatus === 'Pending' ? 'CHỜ XÁC NHẬN' :
//                order.OverallStatus === 'Processing' ? 'ĐANG XỬ LÝ' :
//                order.OverallStatus === 'CancelledByBuyer' || order.OverallStatus === 'CancelledBySeller' ? 'ĐÃ HỦY' :
//                order.OverallStatus === 'Returned' || order.OverallStatus === 'ReturnInProgress' ? 'TRẢ HÀNG' :
//                order.OverallStatus}
//             </span>
//           </div>
//           {(order.OverallStatus === 'Shipped' || order.OverallStatus === 'Delivered' || order.OverallStatus === 'Completed') && (
//             <button className="bg-white text-orange-500 px-3 py-1.5 rounded-md text-xs font-semibold border border-orange-500">
//               {order.OverallStatus === 'Shipped' ? 'ĐANG GIAO HÀNG' : 'HOÀN THÀNH'}
//             </button>
//           )}
//         </div>
//       </div>

//       {/* Main Content Area */}
//       <div className="container bg-white mx-auto max-w-6xl">
//         {isCancelled ? (
//           // HIỂN THỊ KHI ĐƠN HÀNG BỊ HỦY
//           <div className="bg-white rounded-sm shadow-sm px-6 py-6 mb-4 text-center">
//             <h2 className="text-xl font-bold text-red-600 mb-4">Đơn hàng đã bị hủy</h2>
//             <p className="text-gray-700">Lý do hủy: {order.ReasonForRejection ?? 'Không có lý do cụ thể.'}</p>
//             <button className="bg-orange-500 text-white px-6 py-2 rounded-md text-sm font-semibold hover:bg-orange-600 transition-colors mt-4">
//               Mua lại
//             </button>
//           </div>
//         ) : (
//           // HIỂN THỊ KHI ĐƠN HÀNG KHÔNG BỊ HỦY
//           <>
//             {/* Progress Tracker */}
//             {order.orderStatusHistory && order.orderStatusHistory.length > 0 && (
//               <OrderProgressTracker statusHistory={order.orderStatusHistory} />
//             )}

//             {/* Info Box (delivery estimate, voucher, actions) */}
//             <div className="bg-white rounded-sm shadow-sm border-b border-gray-100 px-6 py-6 flex justify-between items-center text-sm">
//               <div className="flex flex-col flex-1">
//                 <p className="text-gray-700">Ngày nhận hàng dự kiến từ <span className="text-green-600">{deliveryEstimate.start}</span> đến <span className="text-green-600">{deliveryEstimate.end}</span>.
//                 {order.PaymentMethod === 'COD' && ' Lưu ý đây là đơn hàng Thanh toán khi nhận hàng.'}
//                 </p>
//                 {/* Giao nhanh đúng hẹn - SỬ DỤNG hasShippingTracking */}
//                 {hasShippingTracking && (
//                     <p className="text-gray-500 mt-1 flex items-center">
//                         <FaTruckFast className="mr-2 text-green-600" /> Giao nhanh đúng hẹn: Voucher đ15.000 nếu đơn hàng được giao đến bạn sau ngày 20-06-2025.
//                         <Link href="#" className="text-blue-500 ml-1 hover:underline">Xem thêm</Link>
//                     </p>
//                 )}
//               </div>
//               <div className="flex flex-col gap-2 ml-4 flex-shrink-0">
//                 {order.OverallStatus === 'Shipped' && (
//                   <>
//                     <button className="bg-orange-500 text-white px-6 py-2 rounded-md text-sm font-semibold hover:bg-orange-600 transition-colors">
//                       Đã Nhận Hàng
//                     </button>
//                     <button className="bg-white text-gray-700 px-6 py-2 rounded-md text-sm border border-gray-300 hover:bg-gray-100 transition-colors">
//                       Xác Nhận Hủy
//                     </button>
//                   </>
//                 )}
//                 {isDeliveredOrCompleted && (
//                     <button className="bg-orange-500 text-white px-6 py-2 rounded-md text-sm font-semibold hover:bg-orange-600 transition-colors">
//                         Đánh Giá
//                     </button>
//                 )}
//                 {isDeliveredOrCompleted && (
//                     <button className="bg-white text-gray-700 px-6 py-2 rounded-md text-sm border border-gray-300 hover:bg-gray-100 transition-colors">
//                         Yêu Cầu Trả Hàng/Hoàn Tiền
//                     </button>
//                 )}
//                 <button className="bg-white text-gray-700 px-6 py-2 rounded-md text-sm border border-gray-300 hover:bg-gray-100 transition-colors">
//                   Liên Hệ Người Bán
//                 </button>
//               </div>
//             </div>

//             {/* Shipping Info - SỬ DỤNG hasShippingTracking */}
//             {(order.shippingProvider && order.trackingNumber && hasShippingTracking) && (
//                 <OrderShippingInfo order={order} />
//             )}

//           </>
//         )}


//         {/* Sản phẩm trong đơn hàng (Luôn hiển thị trừ khi là trang rỗng) */}
//         <div className="bg-white rounded-sm shadow-sm border-b border-gray-100 overflow-hidden">
//           {/* Shop Header */}
//           {order.shopOrders.map((shopOrder) => (
//           <div key={shopOrder.shopId} className="bg-white rounded-sm shadow-sm border-b border-gray-100 overflow-hidden mb-4 last:mb-0">
//             {/* Shop Header */}
//             <div className="flex justify-between items-center px-6 py-3 border-b border-gray-100">
//               <div className="flex items-center gap-2 text-gray-800 text-sm">
//                 {shopOrder.shopLevel === 'Mall' && <span className="px-1.5 py-0.5 bg-red-500 text-white text-xs font-bold rounded">Mall</span>}
//                 {shopOrder.shopLevel === 'Favorite' && <span className="px-1.5 py-0.5 bg-red-500 text-white text-xs font-bold rounded">Yêu thích+</span>}
//                 <span className="font-semibold">{shopOrder.shopName}</span>
//                 <button className="flex items-center text-blue-500 hover:text-blue-600 whitespace-nowrap">
//                   <FaCommentDots className="mr-1" /> Chat ngay
//                 </button>
//               </div>
//             </div>

//             {/* ======== SỬA LỖI GIAO DIỆN BẮT ĐẦU TỪ ĐÂY ======== */}

//             {/* TIÊU ĐỀ CỘT */}
//             <div className="flex px-6 pt-4 pb-2 text-xs text-gray-500">
//                 <div className="flex-1">Sản phẩm</div>
//                 <div style={{ width: priceColWidth }} className="text-right flex-shrink-0">Đơn giá</div>
//                 <div style={{ width: qtyColWidth }} className="text-center flex-shrink-0">Số lượng</div>
//                 <div style={{ width: subtotalColWidth }} className="text-right flex-shrink-0">Thành tiền</div>
//             </div>

//             {/* Product Items của shop này */}
//             {shopOrder.items.map((item, itemIndex) => (
//               <div key={item.OrderItemID} className={`px-6 py-4 ${itemIndex < shopOrder.items.length - 1 ? 'border-b border-gray-100' : ''}`}>
//                 <div className="flex items-start text-sm">
//                   {/* Cột thông tin sản phẩm (Image + Name) - sẽ co giãn */}
//                   <div className="flex items-start flex-1">
//                     <img 
//                       src={getFullImageUrl(item.productImageURL)} 
//                       alt={item.productName} 
//                       width={64} 
//                       height={64} 
//                       className="object-cover w-16 h-16 border border-gray-200 rounded-md flex-shrink-0" 
//                     />
//                     <div className="flex-1 flex flex-col ml-4">
//                       <p className="font-semibold text-gray-800 leading-tight">{item.productName}</p>
//                       <p className="text-gray-600 text-xs mt-0.5">Loại: {item.classification}</p>
//                       {item.OriginalPrice > item.PriceAtPurchase && (
//                         <span className="text-gray-400 line-through text-xs">{formatVND(item.OriginalPrice)}</span>
//                     )}
//                     </div>
//                   </div>

//                   {/* Cột Đơn giá - chiều rộng cố định */}
//                   <div style={{ width: priceColWidth }} className="flex-shrink-0 flex flex-col items-end">

//                     <span className="text-gray-800">{formatVND(item.PriceAtPurchase)}</span>
//                   </div>

//                   {/* Cột Số lượng - chiều rộng cố định */}
//                   <div style={{ width: qtyColWidth }} className="flex-shrink-0 text-center text-gray-800">
//                     x{item.Quantity}
//                   </div>

//                   {/* Cột Thành tiền - chiều rộng cố định */}
//                   <div style={{ width: subtotalColWidth }} className="flex-shrink-0 text-right font-semibold text-orange-500">
//                     {formatVND(item.Subtotal)}
//                   </div>
//                 </div>
//               </div>
//             ))}

//             {/* Hiển thị voucher của shop này nếu có */}
//             {shopOrder.appliedShopVoucherCode && (shopOrder.shopVoucherDiscountAmount ?? 0) > 0 && (
//               <div className="px-6 py-3 border-t border-gray-100 flex justify-end">
//                   <div className="text-sm text-gray-700 flex items-center">
//                       <span className="mr-4">Voucher của Shop ({shopOrder.appliedShopVoucherCode}):</span>
//                       <span className="text-orange-500">- {formatVND(shopOrder.shopVoucherDiscountAmount!)}</span>
//                   </div>
//               </div>
//             )}
//           </div>
//         ))}
//           {/* Total prices for this shop */}
//           <div className="bg-white rounded-sm shadow-sm px-6 py-4 flex flex-col items-end space-y-2 mt-4">
//           <div className="flex justify-between w-full max-w-sm text-sm text-gray-700">
//             <span>Tổng tiền hàng:</span>
//             <span>{formatVND(totalProductsPrice)}</span>
//           </div>
//           <div className="flex justify-between w-full max-w-sm text-sm text-gray-700">
//             <span>Phí vận chuyển:</span>
//             <span>{formatVND(order.ShippingFee)}</span>
//           </div>
//            <div className="flex justify-between w-full max-w-sm text-sm text-gray-700">
//             <span>Tổng cộng Voucher từ Shop:</span>
//             <span className="text-orange-500">- {formatVND(order.shopdiscountamount)}</span>
//           </div>
//           {order.PlatformVoucherCode && order.PlatformDiscountAmount > 0 && (
//               <div className="flex justify-between w-full max-w-sm text-sm text-gray-700">
//                 <span>Voucher từ E-Market ({order.PlatformVoucherCode}):</span>
//                 <span className="text-orange-500">- {formatVND(order.PlatformDiscountAmount)}</span>
//               </div>
//           )}
//           <div className="flex justify-between w-full max-w-sm text-orange-500 font-bold text-xl pt-2 border-t border-gray-200 mt-2">
//             <span>Thành tiền:</span>
//             <span>{formatVND(order.TotalAmount)}</span>
//           </div>

//           {(order.PaymentMethod === 'COD' && order.PaymentStatus === 'Pending') && (
//               <p className="bg-orange-50 text-orange-500 text-sm px-4 py-2 rounded mt-3 text-center w-full">
//                 Vui lòng thanh toán <span className="font-bold">{formatVND(order.TotalAmount)}</span> khi nhận hàng.
//               </p>
//           )}

//             <div className="flex gap-2 mt-4">
//               <button className="bg-white text-gray-700 px-4 py-2 rounded-md text-sm border border-gray-300 hover:bg-gray-100 transition-colors flex items-center gap-2">
//                 <FaRegLifeRing /> Liên hệ hỗ trợ
//               </button>
//               <button className="bg-white text-gray-700 px-4 py-2 rounded-md text-sm border border-gray-300 hover:bg-gray-100 transition-colors">
//                 Mua lại
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Nút Chat cố định */}
//       <Link href="https://shopee.vn/chat" target="_blank" rel="noopener noreferrer" className="fixed bottom-4 right-4 bg-orange-500 text-white rounded-full p-3 shadow-lg hover:bg-orange-600 transition-colors flex items-center justify-center z-30 w-16 h-16">
//         <FaCommentDots className="text-2xl" />
//         <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
//           2
//         </span>
//       </Link>
//     </div>
//   );
// };

// export default OrderDetailContent;
'use client';

// Thêm useState vào import
import React, { useState } from 'react';
import Link from 'next/link';
import { FaChevronLeft, FaCommentDots, FaRegLifeRing, FaTruckFast } from 'react-icons/fa6';
import { Order } from '@/types'; // Lấy Order từ '@/types'

import OrderProgressTracker from './OrderProgressTracker';
import OrderShippingInfo from './OrderShippingInfo';
import { getFullImageUrl } from '@/services/api';

// Import các modal đã tạo
import RequestSelectionModal from './modals/RequestSelectionModal';
import ReturnRequestFormModal from './modals/ReturnRequestFormModal';
import RefundRequestFormModal from './modals/RefundRequestFormModal';

const getDeliveryEstimate = (orderDateString: string) => {
  const orderDate = new Date(orderDateString);
  if (isNaN(orderDate.getTime())) {
    return { start: 'N/A', end: 'N/A' };
  }
  const startDate = new Date(orderDate);
  startDate.setDate(orderDate.getDate() + 3);
  const endDate = new Date(orderDate);
  endDate.setDate(orderDate.getDate() + 6);
  const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };
  return {
    start: formatDate(startDate),
    end: formatDate(endDate),
  };
};
// src/utils/format.ts
export const formatVND = (price: number): string => {
  if (typeof price !== 'number') return '0 ₫';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};
interface OrderDetailContentProps {
  order: Order;
}

const priceColWidth = '150px';
const qtyColWidth = '100px';
const subtotalColWidth = '150px';

const OrderDetailContent: React.FC<OrderDetailContentProps> = ({ order }) => {
  const [isSelectionModalOpen, setSelectionModalOpen] = useState(false);
  const [isReturnModalOpen, setReturnModalOpen] = useState(false);
  const [isRefundModalOpen, setRefundModalOpen] = useState(false);

  const isCancelled = order.OverallStatus === 'CancelledByBuyer' || order.OverallStatus === 'CancelledBySeller';
  const isDeliveredOrCompleted = order.OverallStatus === 'Delivered' || order.OverallStatus === 'Completed';
  const hasShippingTracking = order.shippingTracking && order.shippingTracking.length > 0;

  const totalProductsPrice = order.shopOrders.reduce((total, shopOrder) => {
    const shopSubtotal = shopOrder.items.reduce((sum, item) => sum + item.Subtotal, 0);
    return total + shopSubtotal;
  }, 0);

  // const handleOpenSelectionModal = () => setSelectionModalOpen(true);
  const handleCloseAllModals = () => {
    setSelectionModalOpen(false);
    setReturnModalOpen(false);
    setRefundModalOpen(false);
  };

  const handleOpenReturnForm = () => {
    setSelectionModalOpen(false);
    setReturnModalOpen(true);
  };

  const handleOpenRefundForm = () => {
    setSelectionModalOpen(false);
    setRefundModalOpen(true);
  };
  const handleOpenSelectionModal = () => {
    console.log('Nút "Yêu Cầu Trả Hàng/Hoàn Tiền" ĐÃ ĐƯỢC NHẤN!'); // <--- THÊM DÒNG NÀY
    setSelectionModalOpen(true);
  };
  return (
    <div className="flex flex-col h-full">
      {/* Header trang chi tiết */}
      <div className="bg-white py-4 px-6 rounded-sm border-b border-gray-100 shadow-sm">
        <div className="container mx-auto max-w-6xl flex justify-between items-center">
          <Link href="/purchase" className="flex items-center text-gray-600 hover:text-orange-500 text-sm">
            <FaChevronLeft className="mr-2" /> TRỞ LẠI
          </Link>
          <div className="flex items-center text-gray-800 text-sm font-semibold">
            <span className="mr-4">MÃ ĐƠN HÀNG. {order.OrderCode}</span>
            <span className="text-orange-500 uppercase">
              {order.OverallStatus === 'Completed' ? 'ĐÃ HOÀN THÀNH' :
                order.OverallStatus === 'Shipped' ? 'ĐANG GIAO HÀNG' :
                  order.OverallStatus === 'Delivered' ? 'ĐÃ GIAO HÀNG' :
                    order.OverallStatus === 'Pending' ? 'CHỜ XÁC NHẬN' :
                      order.OverallStatus === 'Processing' ? 'ĐANG XỬ LÝ' :
                        order.OverallStatus === 'CancelledByBuyer' || order.OverallStatus === 'CancelledBySeller' ? 'ĐÃ HỦY' :
                          order.OverallStatus === 'Returned' || order.OverallStatus === 'ReturnInProgress' ? 'TRẢ HÀNG' :
                            order.OverallStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container bg-white mx-auto max-w-6xl pb-10">
        {isCancelled ? (
          <div className="bg-white rounded-sm shadow-sm px-6 py-6 my-4 text-center">
            <h2 className="text-xl font-bold text-red-600 mb-4">Đơn hàng đã bị hủy</h2>
            <p className="text-gray-700">Lý do hủy: {order.ReasonForRejection ?? 'Không có lý do cụ thể.'}</p>
          </div>
        ) : (
          <>
            {order.orderStatusHistory && order.orderStatusHistory.length > 0 && (
              <OrderProgressTracker statusHistory={order.orderStatusHistory} />
            )}

            <div className="bg-white rounded-sm shadow-sm border-b border-gray-100 px-6 py-6 flex justify-between items-center text-sm">
              <div className="flex flex-col flex-1">
                <p className="text-gray-700">Ngày nhận hàng dự kiến từ <span className="text-green-600">{getDeliveryEstimate(order.OrderDate).start}</span> đến <span className="text-green-600">{getDeliveryEstimate(order.OrderDate).end}</span>.
                  {order.PaymentMethod === 'COD' && ' Lưu ý đây là đơn hàng Thanh toán khi nhận hàng.'}
                </p>
                {hasShippingTracking && (
                  <p className="text-gray-500 mt-1 flex items-center">
                    <FaTruckFast className="mr-2 text-green-600" /> Giao nhanh đúng hẹn.
                    <Link href="#" className="text-blue-500 ml-1 hover:underline">Xem thêm</Link>
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-2 ml-4 flex-shrink-0">
                {isDeliveredOrCompleted && (
  <Link 
    href={`/account/review?orderId=${order.OrderID}`}
    className="bg-orange-500 text-white px-6 py-2 rounded-md text-sm font-semibold hover:bg-orange-600 transition-colors block text-center"
  >
    Đánh Giá
  </Link>
                )}
                {isDeliveredOrCompleted && (
                  <button
                    onClick={handleOpenSelectionModal}
                    className="bg-white text-gray-700 px-6 py-2 rounded-md text-sm border border-gray-300 hover:bg-gray-100 transition-colors"
                  >
                    Yêu Cầu Trả Hàng/Hoàn Tiền
                  </button>
                )}

              </div>
            </div>

            {hasShippingTracking && (
              <OrderShippingInfo order={order} />
            )}
          </>
        )}

        {/* Sản phẩm trong đơn hàng */}
        <div className="bg-white rounded-sm shadow-sm border-b border-gray-100 overflow-hidden mt-4">
          {order.shopOrders.map((shopOrder) => (
            <div key={shopOrder.shopId} className="bg-white border-b border-gray-200 last:border-b-0 overflow-hidden mb-4 last:mb-0">
              <div className="flex justify-between items-center px-6 py-3 border-b border-gray-100">
                <div className="flex items-center gap-2 text-gray-800 text-sm">
                  {shopOrder.shopLevel === 'Mall' && <span className="px-1.5 py-0.5 bg-red-500 text-white text-xs font-bold rounded">Mall</span>}
                  {shopOrder.shopLevel === 'Favorite' && <span className="px-1.5 py-0.5 bg-red-500 text-white text-xs font-bold rounded">Yêu thích+</span>}
                  <span className="font-semibold">{shopOrder.shopName}</span>
                  <button className="flex items-center text-blue-500 hover:text-blue-600 whitespace-nowrap">
                    <FaCommentDots className="mr-1" /> Chat ngay
                  </button>
                </div>
              </div>

              <div className="flex px-6 pt-4 pb-2 text-xs text-gray-500">
                <div className="flex-1">Sản phẩm</div>
                <div style={{ width: priceColWidth }} className="text-right flex-shrink-0">Đơn giá</div>
                <div style={{ width: qtyColWidth }} className="text-center flex-shrink-0">Số lượng</div>
                <div style={{ width: subtotalColWidth }} className="text-right flex-shrink-0">Thành tiền</div>
              </div>

              {shopOrder.items.map((item, itemIndex) => (
                <div key={item.OrderItemID} className={`px-6 py-4 ${itemIndex < shopOrder.items.length - 1 ? 'border-b border-gray-100' : ''}`}>
                  <div className="flex items-start text-sm">
                    <div className="flex items-start flex-1">
                      <img
                        src={getFullImageUrl(item.productImageURL)}
                        alt={item.productName}
                        className="object-cover w-16 h-16 border border-gray-200 rounded-md flex-shrink-0"
                      />
                      <div className="flex-1 flex flex-col ml-4">
                        <p className="font-semibold text-gray-800 leading-tight">{item.productName}</p>
                        <p className="text-gray-600 text-xs mt-0.5">Loại: {item.classification}</p>
                        {item.OriginalPrice > item.PriceAtPurchase && (
                          <span className="text-gray-400 line-through text-xs">{formatVND(item.OriginalPrice)}</span>
                        )}
                      </div>
                    </div>
                    <div style={{ width: priceColWidth }} className="flex-shrink-0 flex flex-col items-end">
                      <span className="text-gray-800">{formatVND(item.PriceAtPurchase)}</span>
                    </div>
                    <div style={{ width: qtyColWidth }} className="flex-shrink-0 text-center text-gray-800">
                      x{item.Quantity}
                    </div>
                    <div style={{ width: subtotalColWidth }} className="flex-shrink-0 text-right font-semibold text-orange-500">
                      {formatVND(item.Subtotal)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}

          <div className="bg-white rounded-sm px-6 py-4 flex flex-col items-end space-y-2 mt-4">
            <div className="flex justify-between w-full max-w-sm text-sm text-gray-700">
              <span>Tổng tiền hàng:</span>
              <span>{formatVND(totalProductsPrice)}</span>
            </div>
            <div className="flex justify-between w-full max-w-sm text-sm text-gray-700">
              <span>Phí vận chuyển:</span>
              <span>{formatVND(order.ShippingFee)}</span>
            </div>
            <div className="flex justify-between w-full max-w-sm text-sm text-gray-700">
              <span>Tổng cộng Voucher từ Shop:</span>
              <span className="text-orange-500">- {formatVND(order.shopdiscountamount)}</span>
            </div>
            {order.PlatformVoucherCode && order.PlatformDiscountAmount > 0 && (
              <div className="flex justify-between w-full max-w-sm text-sm text-gray-700">
                <span>Voucher từ E-Market ({order.PlatformVoucherCode}):</span>
                <span className="text-orange-500">- {formatVND(order.PlatformDiscountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between w-full max-w-sm text-orange-500 font-bold text-xl pt-2 border-t border-gray-200 mt-2">
              <span>Thành tiền:</span>
              <span>{formatVND(order.TotalAmount)}</span>
            </div>

            {order.PaymentMethod === 'COD' && (
              <p className="bg-orange-50 text-orange-500 text-sm px-4 py-2 rounded mt-3 text-center w-full max-w-sm">
                Vui lòng thanh toán <span className="font-bold">{formatVND(order.TotalAmount)}</span> khi nhận hàng.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* --- PHẦN RENDER MODAL --- */}
      <RequestSelectionModal
        isOpen={isSelectionModalOpen}
        onClose={handleCloseAllModals}
        onReturnRequest={handleOpenReturnForm}
        onRefundRequest={handleOpenRefundForm}
      />

      {/* Truyền cả đối tượng 'order' vào modal để lấy danh sách sản phẩm */}
      <ReturnRequestFormModal
        isOpen={isReturnModalOpen}
        onClose={handleCloseAllModals}
        order={order}
      />


      {/* Nút Chat cố định */}
      <Link href="https://shopee.vn/chat" target="_blank" rel="noopener noreferrer" className="fixed bottom-4 right-4 bg-orange-500 text-white rounded-full p-3 shadow-lg hover:bg-orange-600 transition-colors flex items-center justify-center z-30 w-16 h-16">
        <FaCommentDots className="text-2xl" />
        <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
          2
        </span>
      </Link>
    </div>
  );
};

export default OrderDetailContent;