// // app/(main)/(account)/orders/[orderId]/components/OrderDetailContent.tsx
// 'use client';

// import React from 'react';
// import Image from 'next/image';
// import Link from 'next/link';
// import { FaChevronLeft, FaCommentDots, FaRegLifeRing, FaTruckFast } from 'react-icons/fa6';
// import { Order } from '@/types'; // Lấy Order từ '@/types'

// import OrderProgressTracker from './OrderProgressTracker';
// import OrderShippingInfo from './OrderShippingInfo';

// const formatVND = (price: number): string => {
//   return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
// };

// interface OrderDetailContentProps {
//   order: Order;
// }

// const OrderDetailContent: React.FC<OrderDetailContentProps> = ({ order }) => {
//   return (
//     <div className="flex flex-col h-full bg-gray-100">
//       {/* Header trang chi tiết */}
//       <div className="bg-white py-4 px-6 shadow-sm border-b border-gray-200 sticky top-0 z-20">
//         <div className="container mx-auto max-w-6xl flex justify-between items-center">
//           <Link href="/purchase" className="flex items-center text-gray-600 hover:text-orange-500 text-sm">
//             <FaChevronLeft className="mr-2" /> TRỞ LẠI
//           </Link>
//           <div className="flex items-center text-gray-800 text-sm font-semibold">
//             <span className="mr-4">MÃ ĐƠN HÀNG. {order.OrderCode}</span>
//             {/* Hiển thị OverallStatus từ DB, không cần map sang tab UI */}
//             <span className="text-orange-500 uppercase">{order.OverallStatus}</span>
//           </div>
//           {/* Nút trạng thái chung (ĐANG GIAO HÀNG/HOÀN THÀNH) */}
//           {(order.OverallStatus === 'Shipped' || order.OverallStatus === 'Delivered' || order.OverallStatus === 'Completed') && (
//             <button className="bg-white text-orange-500 px-3 py-1.5 rounded-md text-xs font-semibold border border-orange-500">
//               {order.OverallStatus === 'Shipped' ? 'ĐANG GIAO HÀNG' : 'HOÀN THÀNH'}
//             </button>
//           )}
//         </div>
//       </div>

//       {/* Main Content Area */}
//       <div className="container mx-auto max-w-6xl px-4 py-6">
//         {/* Progress Tracker */}
//         {order.orderStatusHistory && order.orderStatusHistory.length > 0 && (
//           <OrderProgressTracker statusHistory={order.orderStatusHistory} />
//         )}

//         {/* Info Box (delivery estimate, voucher, actions) */}
//         <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-6 mb-4 flex justify-between items-center text-sm">
//           <div className="flex flex-col flex-1">
//             <p className="text-gray-700">Ngày nhận hàng dự kiến từ <span className="text-green-600">17-06-2025</span> đến <span className="text-green-600">20-06-2025</span>. Lưu ý đây là đơn hàng Thanh toán khi nhận hàng.</p>
//             {/* Ghi chú: shippingVoucherNote trong Order không chứa "Giao nhanh đúng hẹn:" */}
//             {/* Nó nên là một phần của Description hoặc Notes của Order nếu muốn hiển thị. */}
//             {/* Để khớp ảnh, giả sử có một field `deliveryNote` trong Order */}
//             <p className="text-gray-500 mt-1 flex items-center">
//                 <FaTruckFast className="mr-2 text-green-600" /> Giao nhanh đúng hẹn: Voucher đ15.000 nếu đơn hàng được giao đến bạn sau ngày 20-06-2025.
//                 <Link href="#" className="text-blue-500 ml-1 hover:underline">Xem thêm</Link>
//             </p>
//           </div>
//           <div className="flex flex-col gap-2 ml-4 flex-shrink-0">
//             {order.OverallStatus === 'Shipped' && ( // Chỉ hiển thị nút này khi đang Shipped
//               <>
//                 <button className="bg-orange-500 text-white px-6 py-2 rounded-md text-sm font-semibold hover:bg-orange-600 transition-colors">
//                   Đã Nhận Hàng
//                 </button>
//                 <button className="bg-white text-gray-700 px-6 py-2 rounded-md text-sm border border-gray-300 hover:bg-gray-100 transition-colors">
//                   Xác Nhận Hủy
//                 </button>
//               </>
//             )}
//             <button className="bg-white text-gray-700 px-6 py-2 rounded-md text-sm border border-gray-300 hover:bg-gray-100 transition-colors">
//               Liên Hệ Người Bán
//             </button>
//           </div>
//         </div>

//         {/* Shipping Info */}
//         {(order.shippingProvider && order.shippingTracking && order.shippingTracking.length > 0) && (
//             <OrderShippingInfo order={order} />
//         )}


//         {/* Sản phẩm trong đơn hàng */}
//         <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4 overflow-hidden">
//           {/* Shop Header */}
//           <div className="flex justify-between items-center px-6 py-3 border-b border-gray-100">
//             <div className="flex items-center gap-2 text-gray-800 text-sm">
//               {order.shopLevel === 'Mall' && <span className="px-1.5 py-0.5 bg-red-500 text-white text-xs font-bold rounded">Mall</span>}
//               {order.shopLevel === 'Yêu thích+' && <span className="px-1.5 py-0.5 bg-red-500 text-white text-xs font-bold rounded">Yêu thích+</span>}
//               <span className="font-semibold">{order.shopName}</span>
//               <button className="flex items-center text-blue-500 hover:text-blue-600 whitespace-nowrap">
//                 <FaCommentDots className="mr-1" /> Chat ngay
//               </button>
//             </div>
//             {/* Header cột sản phẩm */}
//             <div className="flex text-gray-600 text-xs font-semibold" style={{ width: '250px' }}> {/* Fixed width for headers */}
//                 <span className="text-right flex-1">Đơn giá</span>
//                 <span className="text-center w-16">Số lượng</span> {/* Fixed width for quantity */}
//                 <span className="text-right w-24">Thành tiền</span> {/* Fixed width for subtotal */}
//             </div>
//           </div>

//           {/* Product Items */}
//           {order.items.map((item, index) => (
//             <div key={item.OrderItemID} className={`flex items-center px-6 py-3 ${index < order.items.length - 1 ? 'border-b border-gray-100' : ''}`}>
//               <div className="flex-shrink-0 w-16 h-16 relative mr-4 border border-gray-200 rounded-md overflow-hidden">
//                 <Image src={item.productImageURL} alt={item.productName} width={64} height={64} className="object-cover" />
//               </div>
//               <div className="flex-1 flex items-center text-sm">
//                 <div className="flex-1 flex flex-col pr-4">
//                   <p className="font-semibold text-gray-800 leading-tight">{item.productName}</p>
//                   <p className="text-gray-600 text-xs mt-0.5">Loại: {item.classification}</p>
//                   {item.OriginalPrice > item.PriceAtPurchase && (
//                     <p className="text-gray-400 line-through text-xs mt-0.5 whitespace-nowrap">{formatVND(item.OriginalPrice)}</p>
//                   )}
//                 </div>
//                 {/* Giá, Số lượng, Thành tiền */}
//                 <div className="flex-shrink-0 flex items-center justify-end" style={{ width: '250px' }}> {/* Fixed width for this group */}
//                   <span className="text-gray-800 whitespace-nowrap text-right flex-1">{formatVND(item.PriceAtPurchase)}</span>
//                   <span className="text-gray-800 whitespace-nowrap text-center w-16">{item.Quantity}</span>
//                   <span className="font-semibold text-gray-800 whitespace-nowrap text-right w-24">{formatVND(item.Subtotal)}</span>
//                 </div>
//               </div>
//             </div>
//           ))}

//           {/* Total prices for this shop */}
//           <div className="px-6 py-4 flex flex-col items-end space-y-1">
//             <div className="flex justify-between w-full max-w-xs text-sm text-gray-700">
//               <span>Tổng tiền hàng:</span>
//               <span>{formatVND(order.items.reduce((sum, item) => sum + item.Subtotal, 0))}</span>
//             </div>
//             <div className="flex justify-between w-full max-w-xs text-sm text-gray-700">
//               <span>Phí vận chuyển:</span>
//               <span>{formatVND(order.ShippingFee)}</span>
//             </div>
//             {order.totalShopVoucherDiscount && order.totalShopVoucherDiscount > 0 && (
//                 <div className="flex justify-between w-full max-w-xs text-sm text-gray-700">
//                   <span>Giảm giá phí vận chuyển:</span>
//                   <span className="text-orange-500">- đ{formatVND(order.totalShopVoucherDiscount).replace('₫', '')}K</span>
//                 </div>
//             )}
//             {order.PlatformVoucherCode && order.PlatformDiscountAmount && ( // Use PlatformDiscountAmount for "Voucher từ Shopee"
//                 <div className="flex justify-between w-full max-w-xs text-sm text-gray-700">
//                   <span>Voucher từ Shopee:</span>
//                   <span className="text-orange-500">- đ{formatVND(order.PlatformDiscountAmount).replace('₫', '')}K</span>
//                 </div>
//             )}
//             {order.totalShopeeCoinsDiscount && order.totalShopeeCoinsDiscount > 0 && (
//                 <div className="flex justify-between w-full max-w-xs text-sm text-gray-700">
//                   <span>Giảm giá từ Shopee Xu:</span>
//                   <span className="text-orange-500">- đ{formatVND(order.totalShopeeCoinsDiscount).replace('₫', '')}K</span>
//                 </div>
//             )}
//             <div className="flex justify-between w-full max-w-xs text-orange-500 font-bold text-lg pt-2 border-t border-gray-200 mt-2">
//               <span>Thành tiền:</span>
//               <span>{formatVND(order.TotalAmount)}</span>
//             </div>

//             {order.PaymentMethod === 'COD' && order.PaymentStatus === 'Pending' && (
//                 <p className="text-orange-500 text-sm mt-3">
//                   Vui lòng thanh toán <span className="font-bold">{formatVND(order.TotalAmount)}</span> khi nhận hàng.
//                 </p>
//             )}

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
// app/(main)/(account)/orders/[orderId]/components/OrderDetailContent.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaChevronLeft, FaCommentDots, FaRegLifeRing, FaTruckFast } from 'react-icons/fa6';
import { Order } from '@/types'; // Lấy Order từ '@/types'

import OrderProgressTracker from './OrderProgressTracker';
import OrderShippingInfo from './OrderShippingInfo';

const formatVND = (price: number): string => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

interface OrderDetailContentProps {
  order: Order;
}

const OrderDetailContent: React.FC<OrderDetailContentProps> = ({ order }) => {
  const isCancelled = order.OverallStatus === 'CancelledByBuyer' || order.OverallStatus === 'CancelledBySeller';
  const isDeliveredOrCompleted = order.OverallStatus === 'Delivered' || order.OverallStatus === 'Completed';

  // Lấy giá trị của shippingTracking một cách an toàn và sử dụng biến này
  const hasShippingTracking = order.shippingTracking && order.shippingTracking.length > 0;

  return (
    <div className="flex flex-col h-full bg-gray-100">
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
          {(order.OverallStatus === 'Shipped' || order.OverallStatus === 'Delivered' || order.OverallStatus === 'Completed') && (
            <button className="bg-white text-orange-500 px-3 py-1.5 rounded-md text-xs font-semibold border border-orange-500">
              {order.OverallStatus === 'Shipped' ? 'ĐANG GIAO HÀNG' : 'HOÀN THÀNH'}
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container bg-white mx-auto max-w-6xl">
        {isCancelled ? (
          // HIỂN THỊ KHI ĐƠN HÀNG BỊ HỦY
          <div className="bg-white rounded-sm shadow-sm px-6 py-6 mb-4 text-center">
            <h2 className="text-xl font-bold text-red-600 mb-4">Đơn hàng đã bị hủy</h2>
            <p className="text-gray-700">Lý do hủy: {order.ReasonForRejection ?? 'Không có lý do cụ thể.'}</p>
            <button className="bg-orange-500 text-white px-6 py-2 rounded-md text-sm font-semibold hover:bg-orange-600 transition-colors mt-4">
              Mua lại
            </button>
          </div>
        ) : (
          // HIỂN THỊ KHI ĐƠN HÀNG KHÔNG BỊ HỦY
          <>
            {/* Progress Tracker */}
            {order.orderStatusHistory && order.orderStatusHistory.length > 0 && (
              <OrderProgressTracker statusHistory={order.orderStatusHistory} />
            )}

            {/* Info Box (delivery estimate, voucher, actions) */}
            <div className="bg-white rounded-sm shadow-sm border-b border-gray-100 px-6 py-6 flex justify-between items-center text-sm">
              <div className="flex flex-col flex-1">
                <p className="text-gray-700">Ngày nhận hàng dự kiến từ <span className="text-green-600">17-06-2025</span> đến <span className="text-green-600">20-06-2025</span>. Lưu ý đây là đơn hàng Thanh toán khi nhận hàng.</p>
                {/* Giao nhanh đúng hẹn - SỬ DỤNG hasShippingTracking */}
                {hasShippingTracking && (
                    <p className="text-gray-500 mt-1 flex items-center">
                        <FaTruckFast className="mr-2 text-green-600" /> Giao nhanh đúng hẹn: Voucher đ15.000 nếu đơn hàng được giao đến bạn sau ngày 20-06-2025.
                        <Link href="#" className="text-blue-500 ml-1 hover:underline">Xem thêm</Link>
                    </p>
                )}
              </div>
              <div className="flex flex-col gap-2 ml-4 flex-shrink-0">
                {order.OverallStatus === 'Shipped' && (
                  <>
                    <button className="bg-orange-500 text-white px-6 py-2 rounded-md text-sm font-semibold hover:bg-orange-600 transition-colors">
                      Đã Nhận Hàng
                    </button>
                    <button className="bg-white text-gray-700 px-6 py-2 rounded-md text-sm border border-gray-300 hover:bg-gray-100 transition-colors">
                      Xác Nhận Hủy
                    </button>
                  </>
                )}
                {isDeliveredOrCompleted && (
                    <button className="bg-orange-500 text-white px-6 py-2 rounded-md text-sm font-semibold hover:bg-orange-600 transition-colors">
                        Đánh Giá
                    </button>
                )}
                {isDeliveredOrCompleted && (
                    <button className="bg-white text-gray-700 px-6 py-2 rounded-md text-sm border border-gray-300 hover:bg-gray-100 transition-colors">
                        Yêu Cầu Trả Hàng/Hoàn Tiền
                    </button>
                )}
                <button className="bg-white text-gray-700 px-6 py-2 rounded-md text-sm border border-gray-300 hover:bg-gray-100 transition-colors">
                  Liên Hệ Người Bán
                </button>
              </div>
            </div>

            {/* Shipping Info - SỬ DỤNG hasShippingTracking */}
            {(order.shippingProvider && order.trackingNumber && hasShippingTracking) && (
                <OrderShippingInfo order={order} />
            )}
          </>
        )}


        {/* Sản phẩm trong đơn hàng (Luôn hiển thị trừ khi là trang rỗng) */}
        <div className="bg-white rounded-sm shadow-sm border-b border-gray-100 overflow-hidden">
          {/* Shop Header */}
          <div className="flex justify-between items-center px-6 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2 text-gray-800 text-sm">
              {order.shopLevel === 'Mall' && <span className="px-1.5 py-0.5 bg-red-500 text-white text-xs font-bold rounded">Mall</span>}
              {order.shopLevel === 'Yêu thích+' && <span className="px-1.5 py-0.5 bg-red-500 text-white text-xs font-bold rounded">Yêu thích+</span>}
              <span className="font-semibold">{order.shopName}</span>
              <button className="flex items-center text-blue-500 hover:text-blue-600 whitespace-nowrap">
                <FaCommentDots className="mr-1" /> Chat ngay
              </button>
            </div>
            {/* Header cột sản phẩm */}
            <div className="flex text-gray-600 text-xs font-semibold" style={{ width: '250px' }}>
                <span className="text-right flex-1">Đơn giá</span>
                <span className="text-center w-16">Số lượng</span>
                <span className="text-right w-24">Thành tiền</span>
            </div>
          </div>

          {/* Product Items */}
          {order.items.map((item, index) => (
            <div key={item.OrderItemID} className={`flex items-center px-6 py-3 ${index < order.items.length - 1 ? 'border-b border-gray-100' : ''}`}>
              <div className="flex-shrink-0 w-16 h-16 relative mr-4 border border-gray-200 rounded-md overflow-hidden">
                <Image src={item.productImageURL} alt={item.productName} width={64} height={64} className="object-cover" />
              </div>
              <div className="flex-1 flex items-center text-sm">
                <div className="flex-1 flex flex-col pr-4">
                  <p className="font-semibold text-gray-800 leading-tight">{item.productName}</p>
                  <p className="text-gray-600 text-xs mt-0.5">Loại: {item.classification}</p>
                  {item.OriginalPrice > item.PriceAtPurchase && (
                    <p className="text-gray-400 line-through text-xs mt-0.5 whitespace-nowrap">{formatVND(item.OriginalPrice)}</p>
                  )}
                </div>
                {/* Giá, Số lượng, Thành tiền */}
                <div className="flex-shrink-0 flex items-center justify-end" style={{ width: '250px' }}>
                  <span className="text-gray-800 whitespace-nowrap text-right flex-1">{formatVND(item.PriceAtPurchase)}</span>
                  <span className="text-gray-800 whitespace-nowrap text-center w-16">{item.Quantity}</span>
                  <span className="font-semibold text-gray-800 whitespace-nowrap text-right w-24">{formatVND(item.Subtotal)}</span>
                </div>
              </div>
            </div>
          ))}

          {/* Total prices for this shop */}
          <div className="px-6 py-4 flex flex-col items-end space-y-1">
            <div className="flex justify-between w-full max-w-xs text-sm text-gray-700">
              <span>Tổng tiền hàng:</span>
              <span>{formatVND(order.items.reduce((sum, item) => sum + item.Subtotal, 0))}</span>
            </div>
            <div className="flex justify-between w-full max-w-xs text-sm text-gray-700">
              <span>Phí vận chuyển:</span>
              <span>{formatVND(order.ShippingFee)}</span>
            </div>
            {order.totalShopVoucherDiscount && order.totalShopVoucherDiscount > 0 && (
                <div className="flex justify-between w-full max-w-xs text-sm text-gray-700">
                  <span>Giảm giá phí vận chuyển:</span>
                  <span className="text-orange-500">- đ{formatVND(order.totalShopVoucherDiscount).replace('₫', '')}K</span>
                </div>
            )}
            {order.PlatformVoucherCode && order.PlatformDiscountAmount && (
                <div className="flex justify-between w-full max-w-xs text-sm text-gray-700">
                  <span>Voucher từ Shopee:</span>
                  <span className="text-orange-500">- đ{formatVND(order.PlatformDiscountAmount).replace('₫', '')}K</span>
                </div>
            )}
            {order.totalShopeeCoinsDiscount && order.totalShopeeCoinsDiscount > 0 && (
                <div className="flex justify-between w-full max-w-xs text-sm text-gray-700">
                  <span>Giảm giá từ Shopee Xu:</span>
                  <span className="text-orange-500">- đ{formatVND(order.totalShopeeCoinsDiscount).replace('₫', '')}K</span>
                </div>
            )}
            <div className="flex justify-between w-full max-w-xs text-orange-500 font-bold text-lg pt-2 border-t border-gray-200 mt-2">
              <span>Thành tiền:</span>
              <span>{formatVND(order.TotalAmount)}</span>
            </div>

            {/* Dòng "Vui lòng thanh toán..." */}
            {(order.PaymentMethod === 'COD' && order.PaymentStatus === 'Pending') && (
                <p className="bg-orange-50 text-orange-500 text-sm px-4 py-2 rounded mt-3 text-center w-full">
                  Vui lòng thanh toán <span className="font-bold">{formatVND(order.TotalAmount)}</span> khi nhận hàng.
                </p>
            )}

            <div className="flex gap-2 mt-4">
              <button className="bg-white text-gray-700 px-4 py-2 rounded-md text-sm border border-gray-300 hover:bg-gray-100 transition-colors flex items-center gap-2">
                <FaRegLifeRing /> Liên hệ hỗ trợ
              </button>
              <button className="bg-white text-gray-700 px-4 py-2 rounded-md text-sm border border-gray-300 hover:bg-gray-100 transition-colors">
                Mua lại
              </button>
            </div>
          </div>
        </div>
      </div>

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