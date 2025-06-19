// // // app/(main)/(account)/orders/[orderId]/components/OrderProgressTracker.tsx
// // 'use client';

// // import React from 'react';
// // import { FaRegFileAlt, FaCheckCircle, FaTruck, FaBoxOpen, FaStar, FaCircle } from 'react-icons/fa'; // Icons cho các trạng thái
// // import { OrderStatusHistory } from '@/types'; // Lấy OrderStatusHistory từ '@/types'

// // interface OrderProgressTrackerProps {
// //   statusHistory: OrderStatusHistory[];
// // }

// // const OrderProgressTracker: React.FC<OrderProgressTrackerProps> = ({ statusHistory }) => {
// //   // Hàm chọn icon dựa trên trạng thái
// //   const getStatusIcon = (status: string) => {
// //     switch (status) {
// //       case 'Đơn Hàng Đã Đặt': return <FaRegFileAlt className="text-xl" />;
// //       case 'Đã Xác Nhận Thông Tin Thanh Toán': return <FaCheckCircle className="text-xl" />;
// //       case 'Đã Giao Cho ĐVVC': return <FaTruck className="text-xl" />;
// //       case 'Chờ Giao Hàng': return <FaBoxOpen className="text-xl" />;
// //       case 'Đánh Giá': return <FaStar className="text-xl" />;
// //       default: return <FaCircle className="text-sm" />;
// //     }
// //   };

// //   return (
// //     <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-8 mb-4">
// //       <h2 className="text-lg font-bold mb-6">Trạng thái đơn hàng</h2>
// //       <div className="flex justify-between relative">
// //         {statusHistory.map((step, index) => (
// //           <div key={index} className="flex flex-col items-center flex-1 z-10">
// //             <div className={`relative flex items-center justify-center w-10 h-10 rounded-full text-white transition-all duration-300
// //                             ${step.isCompleted ? 'bg-green-500' : step.isActive ? 'bg-orange-500' : 'bg-gray-300'}`}>
// //               {getStatusIcon(step.status)}
// //               {step.isCompleted && (
// //                 <FaCheckCircle className="absolute -bottom-2 -right-2 text-green-500 text-lg bg-white rounded-full" />
// //               )}
// //             </div>
// //             <p className={`text-center text-xs mt-2 transition-colors duration-300 ${step.isActive ? 'text-orange-500 font-semibold' : 'text-gray-600'}`}>{step.status}</p>
// //             {(step.date || step.time) && (
// //               <p className="text-center text-xs text-gray-500 mt-1">{step.date} {step.time}</p>
// //             )}
// //           </div>
// //         ))}
// //         {/* Đường nối giữa các bước */}
// //         {statusHistory.length > 1 && (
// //           <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 z-0 mx-auto">
// //             {statusHistory.slice(0, statusHistory.length - 1).map((step, index) => (
// //               <div
// //                 key={index}
// //                 className={`absolute h-full transition-all duration-300`}
// //                 style={{
// //                   left: `${(index / (statusHistory.length - 1)) * 100}%`,
// //                   width: `${(1 / (statusHistory.length - 1)) * 100}%`,
// //                   backgroundColor: step.isCompleted ? '#4CAF50' : '#E0E0E0', // Màu xanh nếu đã hoàn thành
// //                 }}
// //               ></div>
// //             ))}
// //           </div>
// //         )}
// //       </div>
// //     </div>
// //   );
// // };

// // export default OrderProgressTracker;
// // app/(main)/(account)/orders/[orderId]/components/OrderProgressTracker.tsx
// 'use client';

// import React from 'react';
// // Import icons từ Fa và Fa6 để có sự đa dạng và khớp với ảnh
// import { FaRegFileAlt, FaCheckCircle, FaTruck, FaBoxOpen, FaStar, FaDollarSign, FaCircle } from 'react-icons/fa';
// import { OrderStatusHistory } from '@/types';

// interface OrderProgressTrackerProps {
//   statusHistory: OrderStatusHistory[];
// }

// const OrderProgressTracker: React.FC<OrderProgressTrackerProps> = ({ statusHistory }) => {
//   // Hàm chọn icon dựa trên trạng thái (cập nhật để khớp ảnh)
//   const getStatusIcon = (status: string) => {
//     switch (status) {
//       case 'Đơn Hàng Đã Đặt': return <FaRegFileAlt className="text-xl" />;
//       case 'Đã Xác Nhận Thông Tin Thanh Toán': return <FaDollarSign className="text-xl" />; // Icon tiền
//       case 'Đã Giao Cho ĐVVC': return <FaTruck className="text-xl" />;
//       case 'Đã Nhận Được Hàng': return <FaBoxOpen className="text-xl" />; // Icon hộp quà
//       case 'Đánh Giá': return <FaStar className="text-xl" />;
//       default: return <FaCircle className="text-sm" />; // Fallback
//     }
//   };

//   return (
//     <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-8 mb-4">
//       <h2 className="text-lg font-bold mb-6">Trạng thái đơn hàng</h2>
//       <div className="flex justify-between relative pt-5"> {/* pt-5 để tạo khoảng trống cho đường nối */}
//         {statusHistory.map((step, index) => (
//           <div key={index} className="flex flex-col items-center flex-1 z-10 max-w-[150px]">
//             <div className={`relative flex items-center justify-center w-12 h-12 rounded-full text-white transition-all duration-300
//                             ${step.isCompleted ? 'bg-green-500' : step.isActive ? 'bg-orange-500' : 'bg-gray-200 text-gray-500'}`}>
//               {getStatusIcon(step.status)}
//               {/* Dấu tích xanh chỉ hiển thị nếu isCompleted là true VÀ không phải là bước cuối cùng (Đánh giá) */}
//               {step.isCompleted && step.status !== 'Đánh Giá' && (
//                 <FaCheckCircle className="absolute -bottom-1 -right-1 text-green-500 text-lg bg-white rounded-full" />
//               )}
//               {/* Star màu cam cho bước Đánh giá khi nó active */}
//               {step.status === 'Đánh Giá' && step.isActive && (
//                  <FaStar className="absolute text-white text-2xl" /> // Kích thước lớn hơn cho Star active
//               )}
//             </div>
//             <p className={`text-center text-xs mt-3 whitespace-nowrap transition-colors duration-300 ${step.isActive ? 'text-orange-500 font-semibold' : 'text-gray-600'}`}>{step.status}</p>
//             {(step.date || step.time) && (
//               <p className="text-center text-xs text-gray-500 mt-1">{step.time} {step.date}</p>
//             )}
//           </div>
//         ))}
//         {/* Đường nối giữa các bước */}
//         {statusHistory.length > 1 && (
//           <div className="absolute top-[45px] left-0 right-0 h-0.5 bg-gray-200 z-0 mx-auto">
//             {statusHistory.slice(0, statusHistory.length - 1).map((step, index) => (
//               <div
//                 key={index}
//                 className={`absolute h-full transition-all duration-300`}
//                 style={{
//                   left: `${(index / (statusHistory.length - 1)) * 100 + (100 / (statusHistory.length - 1)) / 2}%`, // Bắt đầu từ giữa icon trước
//                   width: `${(1 / (statusHistory.length - 1)) * 100 - (100 / (statusHistory.length - 1))}%`, // Chiều rộng đường nối
//                   backgroundColor: step.isCompleted ? '#4CAF50' : '#E0E0E0',
//                   transform: 'translateX(-50%)',
//                 }}
//               ></div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default OrderProgressTracker;
// app/(main)/(account)/orders/[orderId]/components/OrderProgressTracker.tsx
'use client';

import React from 'react';
// Import icons từ Fa và Fa6 để có sự đa dạng và khớp với ảnh
import { FaRegFileAlt, FaCheckCircle, FaTruck, FaBoxOpen, FaStar, FaDollarSign, FaCircle } from 'react-icons/fa';
import { OrderStatusHistory } from '@/types';

interface OrderProgressTrackerProps {
  statusHistory: OrderStatusHistory[];
}

const OrderProgressTracker: React.FC<OrderProgressTrackerProps> = ({ statusHistory }) => {
  // Hàm chọn icon dựa trên trạng thái (cập nhật để khớp ảnh)
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Đơn Hàng Đã Đặt': return <FaRegFileAlt className="text-lg" />;
      case 'Đã Xác Nhận Thông Tin Thanh Toán': return <FaDollarSign className="text-lg" />;
      case 'Đã Giao Cho ĐVVC': return <FaTruck className="text-lg" />;
      case 'Đã Nhận Được Hàng': return <FaBoxOpen className="text-lg" />;
      case 'Đánh Giá': return <FaStar className="text-lg" />;
      default: return <FaCircle className="text-sm" />;
    }
  };

  const totalSteps = statusHistory.length;
  // Tính toán khoảng cách giữa các icon. Ví dụ 5 bước => 4 khoảng trống. Mỗi khoảng 25%.
  // Total width của các icon và khoảng trống giữa chúng
  // Nếu có 1 bước, khoảng cách là 0.
  const segmentWidthPercentage = totalSteps > 1 ? 100 / (totalSteps - 1) : 0;


  return (
    <div className="bg-white rounded-sm shadow-sm border-b border-gray-100 px-6 py-6">
      {/* Container cho timeline: relative và overflow-hidden để chứa các absolute elements */}
      {/* Đã thêm padding ngang vào đây để đường nối không tràn ra ngoài padding của px-6 */}
      <div className="pb-4 pt-4 px-10">
        <div className="relative py-8"> {/* px-4 để đường nối không tràn ra ngoài div này */}
        {/* Đường nối chung (nền xám) */}
        <div className="absolute top-[10px] left-0 right-0 h-0.5 bg-gray-200 z-0"></div>

        {/* Đường nối màu xanh lá cây theo tiến độ */}
        <div className="absolute top-[10px] left-0 h-0.5 bg-green-500 z-0 transition-all duration-300"
             style={{ width: `${(statusHistory.filter(s => s.isCompleted).length > 0 ? (statusHistory.filter(s => s.isCompleted).length - 1) : 0) * segmentWidthPercentage}%` }}>
        </div>

        {/* Các nút (icon tròn) */}
        {statusHistory.map((step, index) => {
          // Vị trí của icon: 0% cho đầu tiên, 25%, 50%, 75%, 100% cho cuối cùng
          const leftPosition = index * segmentWidthPercentage;

          return (
            <div key={index} className="absolute flex flex-col items-center text-center"
                 style={{ left: `${leftPosition}%`, transform: 'translateX(-50%)', top: -10, width: `calc(${segmentWidthPercentage}% - 50px)` }}> {/* width cho text căn giữa */}
              <div className={`relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300
                              ${step.isCompleted ? 'bg-green-500 border-green-500 text-white' :
                                step.isActive ? 'bg-white border-orange-500 text-orange-500' :
                                'bg-gray-200 border-gray-200 text-gray-500'}`}>
                {getStatusIcon(step.status)}
                {step.isCompleted && step.status !== 'Đánh Giá' && (
                  <FaCheckCircle className="absolute -bottom-1 -right-1 text-green-500 text-lg bg-white rounded-full" />
                )}
                {step.status === 'Đánh Giá' && step.isActive && !step.isCompleted && (
                   <FaStar className="absolute text-orange-500 text-xl" />
                )}
                {step.status === 'Đánh Giá' && step.isCompleted && (
                  <FaStar className="absolute text-white text-xl" />
                )}
              </div>
              <p className={`text-xs mt-2 transition-colors duration-300 ${step.isActive ? 'text-orange-500 font-semibold' : step.isCompleted ? 'text-green-600 font-semibold' : 'text-gray-600'}`}>
                {step.status}
              </p>
              {(step.date || step.time) && (
                <p className="text-xs text-gray-500 mt-0.5">{step.time} {step.date}</p>
              )}
            </div>
          );
        })}
      </div>
      </div>
    </div>
  );
};

export default OrderProgressTracker;