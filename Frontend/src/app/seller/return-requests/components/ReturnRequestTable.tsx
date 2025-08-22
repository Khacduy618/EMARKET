// 'use client';
// import React from 'react';
// import Link from 'next/link';
// import { format } from 'date-fns';
// import StatusBadge from './StatusBadge';
// import { ReturnRequest } from '@/types/return-request'; // Import kiểu dữ liệu

// interface ReturnRequestTableProps {
//     requests: ReturnRequest[];
// }

// const ReturnRequestTable: React.FC<ReturnRequestTableProps> = ({ requests }) => {
//     if (!requests || requests.length === 0) {
//         return <div className="text-center py-10 text-gray-500">Không có yêu cầu nào.</div>;
//     }

//     return (
//         <div className="overflow-x-auto bg-white rounded-lg shadow">
//             <table className="min-w-full divide-y divide-gray-200">
//                 <thead className="bg-gray-50">
//                     <tr>
//                         <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sản phẩm</th>
//                         <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người Mua</th>
//                         <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lý Do</th>
//                         <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày Yêu Cầu</th>
//                         <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng Thái</th>
//                         <th scope="col" className="relative px-6 py-3"><span className="sr-only">Hành Động</span></th>
//                     </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-200">
//                     {requests.map((req) => (
//                         <tr key={req.ReturnRequestID} className="hover:bg-gray-50">
//                             <td className="px-6 py-4 whitespace-nowrap">
//                                 <div className="flex items-center">
//                                     <div className="flex-shrink-0 h-10 w-10">
//                                         {/* Xử lý trường hợp product là null */}
//                                         <img className="h-10 w-10 rounded-md object-cover" src={req.order_item.product?.ProductImageURL || '/placeholder-image.png'} alt="" />
//                                     </div>
//                                     <div className="ml-4">
//                                         <div className="text-sm font-medium text-gray-900 max-w-[200px] truncate" title={req.order_item.product?.Name}>
//                                             {req.order_item.product?.Name ?? 'Sản phẩm không xác định'}
//                                         </div>
//                                         <div className="text-sm text-gray-500">Mã ĐH: {req.order.OrderCode}</div>
//                                     </div>
//                                 </div>
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{req.user.FullName}</td>
//                             <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={req.ReasonDescription}>{req.ReasonDescription}</td>
//                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{format(new Date(req.RequestedAt), 'dd/MM/yyyy HH:mm')}</td>
//                             <td className="px-6 py-4 whitespace-nowrap">
//                                 <StatusBadge status={req.Status} />
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
//                                 <Link href={`/seller/return-requests/${req.ReturnRequestID}`}>
//                                     <a className="text-indigo-600 hover:text-indigo-900">Xem chi tiết</a>
//                                 </Link>
//                             </td>
//                         </tr>
//                     ))}
//                 </tbody>
//             </table>
//         </div>
//     );
// };

// export default ReturnRequestTable;