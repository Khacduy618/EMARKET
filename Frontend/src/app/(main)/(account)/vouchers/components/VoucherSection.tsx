// app/(main)/vouchers/components/VoucherSection.tsx
// 'use client';

// import React, { useState, useEffect } from 'react';
// import { FaPlus } from 'react-icons/fa';
// import VoucherCard from './VoucherCard';
// import { Voucher } from '@/types/voucher.interface'; // Đảm bảo đường dẫn đúng

// export default function VoucherSection() {
//   const [activeTab, setActiveTab] = useState('all');
//   const [voucherCode, setVoucherCode] = useState('');
//   const [allVouchers, setAllVouchers] = useState<Voucher[]>([]);

//   // Giả lập dữ liệu voucher từ API
//   useEffect(() => {
//     const rawVouchersFromDb: Voucher[] = [
//       // Dữ liệu từ SQL Dump của bạn (tôi đã thêm một số trường cần thiết để khớp UI)
//       {
//           VoucherID: 101, Code: 'WELCOME50', Description: 'Giảm 50,000đ cho đơn hàng đầu tiên từ 200,000đ', VoucherType: 'SaleOff', DiscountType: 'FixedAmount', DiscountValue: 50000, MaxValueForPercentage: null, MinOrderValue: 200000, StartDate: '2025-01-01T00:00:00Z', EndDate: '2025-12-31T23:59:59Z', UsageLimitPerUser: 1, UsageLimitTotal: 1000, TimesUsed: 1, Scope: 'Platform', ShopID: null, IsActive: true, CreatedBy: 'Admin', UserID: 4, CreatedAt: '2025-05-29 08:19:46', UpdatedAt: '2025-06-14 08:24:31', TimesUsedByUser: 0 // Giả định cho UserID 1
//       },
//       {
//           VoucherID: 102, Code: 'BICHTECH10', Description: 'Bích Tech Store giảm 10% tối đa 100K cho đơn từ 500K', VoucherType: 'SaleOff', DiscountType: 'Percentage', DiscountValue: 10, MaxValueForPercentage: 100000, MinOrderValue: 500000, StartDate: '2025-05-01T00:00:00Z', EndDate: '2025-06-30T23:59:59Z', UsageLimitPerUser: 1, UsageLimitTotal: 200, TimesUsed: 0, Scope: 'Shop', ShopID: 1, shopName: 'Bích Tech Store', IsActive: true, CreatedBy: 'Seller', UserID: 2, CreatedAt: '2025-05-29 08:19:46', UpdatedAt: '2025-06-16 03:06:16', TimesUsedByUser: 0
//       },
//       {
//           VoucherID: 103, Code: 'FREESHIPMAX', Description: 'Miễn phí vận chuyển tối đa 30K', VoucherType: 'FreeShip', DiscountType: 'FixedAmount', DiscountValue: 30000, MaxValueForPercentage: null, MinOrderValue: 99000, StartDate: '2025-05-20T00:00:00Z', EndDate: '2025-06-20T23:59:59Z', UsageLimitPerUser: null, UsageLimitTotal: 500, TimesUsed: 0, Scope: 'Platform', ShopID: null, IsActive: true, CreatedBy: 'Admin', UserID: 4, CreatedAt: '2025-05-29 08:19:46', UpdatedAt: '2025-05-29 08:19:46', TimesUsedByUser: 0
//       },
//       // Các voucher mẫu khác từ trước, cập nhật để khớp với dữ liệu DB
//       {
//         VoucherID: 1, Code: 'VOUCHERXTRA1', Description: 'Voucher Xtra giảm 15% tối đa 100k', VoucherType: 'SaleOff', DiscountType: 'Percentage', DiscountValue: 15, MaxValueForPercentage: 100000, MinOrderValue: 120000, StartDate: '2025-05-01T00:00:00Z', EndDate: '2025-05-25T00:00:00Z', UsageLimitPerUser: 2, UsageLimitTotal: 50, TimesUsed: 10, Scope: 'Platform', IsActive: true, CreatedBy: 'Admin', UserID: null, CreatedAt: '', UpdatedAt: '', TimesUsedByUser: 0
//       },
//       {
//         VoucherID: 2, Code: 'VOUCHERXTRA2', Description: 'Voucher Xtra giảm 1tr', VoucherType: 'SaleOff', DiscountType: 'FixedAmount', DiscountValue: 1000000, MinOrderValue: 2000000, StartDate: '2025-05-01T00:00:00Z', EndDate: '2025-05-25T00:00:00Z', UsageLimitPerUser: 1, UsageLimitTotal: 20, TimesUsed: 5, Scope: 'Platform', IsActive: true, CreatedBy: 'Admin', UserID: null, CreatedAt: '', UpdatedAt: '', TimesUsedByUser: 0
//       },
//       {
//         VoucherID: 3, Code: 'SHOPEESALE1', Description: 'Giảm 15% cho Shopee', VoucherType: 'SaleOff', DiscountType: 'Percentage', DiscountValue: 15, MaxValueForPercentage: 30000, MinOrderValue: 100000, StartDate: '2025-05-01T00:00:00Z', EndDate: '2025-05-25T00:00:00Z', UsageLimitPerUser: 2, UsageLimitTotal: 30, TimesUsed: 8, Scope: 'Shop', ShopID: 1, shopName: 'Shopee', IsActive: true, CreatedBy: 'Seller', UserID: null, CreatedAt: '', UpdatedAt: '', TimesUsedByUser: 1
//       },
//       {
//         VoucherID: 4, Code: 'XAHANG1', Description: 'Xả hàng giảm 12% max 200k', VoucherType: 'SaleOff', DiscountType: 'Percentage', DiscountValue: 12, MaxValueForPercentage: 200000, MinOrderValue: 500000, StartDate: '2025-05-01T00:00:00Z', EndDate: '2025-05-25T00:00:00Z', UsageLimitPerUser: 6, UsageLimitTotal: 50, TimesUsed: 20, Scope: 'Shop', ShopID: 1, shopName: 'Shopee', IsActive: true, CreatedBy: 'Seller', UserID: null, CreatedAt: '', UpdatedAt: '', TimesUsedByUser: 0
//       },
//       {
//         VoucherID: 5, Code: 'XAHANG2', Description: 'Xả hàng giảm 12% max 80k', VoucherType: 'SaleOff', DiscountType: 'Percentage', DiscountValue: 12, MaxValueForPercentage: 80000, MinOrderValue: 150000, StartDate: '2025-05-01T00:00:00Z', EndDate: '2025-05-25T00:00:00Z', UsageLimitPerUser: 6, UsageLimitTotal: 50, TimesUsed: 20, Scope: 'Shop', ShopID: 1, shopName: 'Shopee', IsActive: true, CreatedBy: 'Seller', UserID: null, CreatedAt: '', UpdatedAt: '', TimesUsedByUser: 0
//       },
//       {
//         VoucherID: 6, Code: 'XAHANG3', Description: 'Xả hàng giảm 12% max 90k', VoucherType: 'SaleOff', DiscountType: 'Percentage', DiscountValue: 12, MaxValueForPercentage: 90000, MinOrderValue: 0, StartDate: '2025-05-01T00:00:00Z', EndDate: '2025-05-25T00:00:00Z', UsageLimitPerUser: 6, UsageLimitTotal: 50, TimesUsed: 20, Scope: 'Shop', ShopID: 1, shopName: 'Shopee', IsActive: true, CreatedBy: 'Seller', UserID: null, CreatedAt: '', UpdatedAt: '', TimesUsedByUser: 0
//       },
//       {
//         VoucherID: 7, Code: 'LIVESALE1', Description: 'Siêu Live Xả Hàng', VoucherType: 'SaleOff', DiscountType: 'Percentage', DiscountValue: 15, MaxValueForPercentage: 200000, MinOrderValue: 500000, StartDate: '2025-05-01T00:00:00Z', EndDate: '2025-05-25T00:00:00Z', UsageLimitPerUser: 6, UsageLimitTotal: 50, TimesUsed: 20, Scope: 'Shop', ShopID: 2, shopName: 'Shopee Live', IsActive: true, CreatedBy: 'Seller', UserID: null, CreatedAt: '', UpdatedAt: '', visualType: 'SHOPEE_LIVE', TimesUsedByUser: 0
//       },
//       {
//         VoucherID: 8, Code: 'ONLYLIVE1', Description: 'Chỉ có trên Live', VoucherType: 'SaleOff', DiscountType: 'Percentage', DiscountValue: 15, MaxValueForPercentage: 90000, MinOrderValue: 250000, StartDate: '2025-05-01T00:00:00Z', EndDate: '2025-05-25T00:00:00Z', UsageLimitPerUser: 6, UsageLimitTotal: 50, TimesUsed: 20, Scope: 'Shop', ShopID: 3, shopName: 'Chỉ Có Trên Live', IsActive: true, CreatedBy: 'Seller', UserID: null, CreatedAt: '', UpdatedAt: '', visualType: 'ONLY_LIVE', TimesUsedByUser: 0
//       },
//     ];

//     // LOGIC SUY LUẬN visualType TẠI ĐÂY
//     const processedVouchers = rawVouchersFromDb.map(v => {
//       let visualType: Voucher['visualType'] = undefined;

//       // Ưu tiên: Voucher Freeship
//       if (v.VoucherType === 'FreeShip') {
//         visualType = 'FREESHIP';
//       }
//       // Ưu tiên tiếp theo: Scope (dành cho SaleOff)
//       else if (v.VoucherType === 'SaleOff') {
//         if (v.Scope === 'Shop') {
//           visualType = 'XA_HANG';
//         } else if (v.Scope === 'Platform') {
//           visualType = 'EMARKET';
//         }
//       }

//       // Các trường hợp đặc biệt (ví dụ: Shopee, Shopee Live) có thể override nếu cần
//       // Nếu có logic phức tạp hơn, có thể thêm điều kiện dựa trên Description hoặc ShopName/ShopID
//       if (v.shopName === 'Shopee' && v.VoucherType === 'SaleOff' && v.Scope === 'Shop') {
//         visualType = 'SHOPEE'; // Icon chữ S cho Shopee
//       }
//       if (v.Description?.includes("Shopee Live")) {
//         visualType = 'SHOPEE_LIVE';
//       }
//       if (v.Description?.includes("Chỉ có trên Live")) {
//         visualType = 'ONLY_LIVE';
//       }
//       if (v.Description?.includes("Xtra")) {
//         visualType = 'VOUCHER_XTRA'; // Ví dụ: nếu có chữ "Xtra" trong mô tả thì dùng visual "VOUCHER_XTRA"
//       }


//       return { ...v, visualType };
//     });

//     setAllVouchers(processedVouchers);
//   }, []);

//   const shopeeVouchersCount = allVouchers.filter(v => v.shopName === 'Shopee').length;
//   const shopVouchersCount = allVouchers.filter(v => v.Scope === 'Shop' && v.shopName !== 'Shopee').length;

//   const tabs = [
//     { id: 'all', name: 'Tất cả', count: allVouchers.length },
//     { id: 'shopee', name: 'Shopee', count: shopeeVouchersCount },
//     { id: 'shop', name: 'Shop', count: shopVouchersCount },
//     { id: 'napthedichvu', name: 'Nạp thẻ & Dịch vụ', count: 0 },
//     { id: 'scanpay', name: 'Scan & Pay', count: 0 },
//     { id: 'dichvutaichinh', name: 'Dịch vụ Tài chính', count: 0 },
//     { id: 'more', name: 'More', count: 0, hasDropdown: true },
//   ];

//   const getFilteredVouchers = () => {
//     switch (activeTab) {
//       case 'all':
//         return allVouchers;
//       case 'shopee':
//         return allVouchers.filter(v => v.shopName === 'Shopee');
//       case 'shop':
//         return allVouchers.filter(v => v.Scope === 'Shop' && v.shopName !== 'Shopee');
//       default:
//         return [];
//     }
//   };

//   const filteredVouchers = getFilteredVouchers();

//   return (
//     <div>
//       <div className="flex justify-between items-center pb-6">
//         <h1 className="text-2xl font-bold text-black">Kho Voucher</h1>
//         <div className="flex gap-4 text-blue-500 text-sm">
//           <a href="#" className="hover:underline">Xem lịch sử voucher</a>
//           <a href="#" className="hover:underline">Tìm hiểu</a>
//         </div>
//       </div>

//       <div className="pt-6 border-t border-gray-200 mb-8">
//         <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-md">
//           <label htmlFor="voucherCode" className="text-gray-700 font-semibold text-sm">Mã Voucher</label>
//           <input
//             type="text"
//             id="voucherCode"
//             placeholder="Nhập mã voucher tại đây"
//             value={voucherCode}
//             onChange={(e) => setVoucherCode(e.target.value)}
//             className="flex-1 text-black py-2 px-3 border border-gray-300 rounded-md text-sm
//                        focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
//           />
//           <button className="bg-gray-200 text-gray-700 py-2 px-4 rounded-md text-sm transition-colors duration-200 hover:bg-gray-300">
//             Lưu
//           </button>
//         </div>
//       </div>

//       <div className="border-b border-gray-200 mb-6">
//         <div className="flex overflow-x-auto whitespace-nowrap -mb-px">
//           {tabs.map((tab) => (
//             <div
//               key={tab.id}
//               className={`py-3 px-4 text-sm font-semibold cursor-pointer transition-colors duration-200
//                 ${activeTab === tab.id
//                   ? 'border-b-2 border-orange-500 text-orange-500'
//                   : 'text-gray-700 hover:text-orange-500 hover:border-b-2 hover:border-orange-100'
//                 }`}
//               onClick={() => setActiveTab(tab.id)}
//             >
//               {tab.name}
//               {tab.count > 0 && <span className="font-normal text-gray-500 ml-1">({tab.count})</span>}
//               {tab.hasDropdown && <span className="ml-1">▼</span>}
//             </div>
//           ))}
//         </div>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         {filteredVouchers.map((voucher) => (
//           <VoucherCard key={voucher.VoucherID} voucher={voucher} />
//         ))}
//       </div>
//     </div>
//   );
// }

// app/(main)/vouchers/components/VoucherSection.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { FaPlus } from 'react-icons/fa';
import VoucherCard from './VoucherCard';
import { Voucher } from '@/types/voucher.interface';

export default function VoucherSection() {
  const [activeTab, setActiveTab] = useState('all');
  const [voucherCode, setVoucherCode] = useState('');
  const [allVouchers, setAllVouchers] = useState<Voucher[]>([]);
  
  const [currentPage, setCurrentPage] = useState(1);
  const vouchersPerPage = 10;

  useEffect(() => {
    // Dữ liệu giả định đã được kiểm tra kỹ lưỡng để đảm bảo có TimesUsed
    const rawVouchersFromDb: Voucher[] = [
        //dữ liệu có trong data
      { VoucherID: 101, Code: 'WELCOME50', Description: 'Giảm 50,000đ cho đơn hàng đầu tiên từ 200,000đ', VoucherType: 'SaleOff', DiscountType: 'FixedAmount', DiscountValue: 50000, MaxValueForPercentage: null, MinOrderValue: 200000, StartDate: '2025-01-01T00:00:00Z', EndDate: '2025-12-31T23:59:59Z', UsageLimitPerUser: 1, UsageLimitTotal: 1000, TimesUsed: 1, Scope: 'Platform', ShopID: null, IsActive: true, CreatedBy: 'Admin', UserID: 4, CreatedAt: '2025-05-29 08:19:46', UpdatedAt: '2025-06-14 08:24:31', TimesUsedByUser: 0 },
      { VoucherID: 102, Code: 'BICHTECH10', Description: 'Bích Tech Store giảm 10% tối đa 100K cho đơn từ 500K', VoucherType: 'SaleOff', DiscountType: 'Percentage', DiscountValue: 10, MaxValueForPercentage: 100000, MinOrderValue: 500000, StartDate: '2025-05-01T00:00:00Z', EndDate: '2025-06-30T23:59:59Z', UsageLimitPerUser: 1, UsageLimitTotal: 200, TimesUsed: 0, Scope: 'Shop', ShopID: 1, shopName: 'Bích Tech Store', IsActive: true, CreatedBy: 'Seller', UserID: 2, CreatedAt: '2025-05-29 08:19:46', UpdatedAt: '2025-06-16 03:06:16', TimesUsedByUser: 0 },
      { VoucherID: 103, Code: 'FREESHIPMAX', Description: 'Miễn phí vận chuyển tối đa 30K', VoucherType: 'FreeShip', DiscountType: 'FixedAmount', DiscountValue: 30000, MaxValueForPercentage: null, MinOrderValue: 99000, StartDate: '2025-05-20T00:00:00Z', EndDate: '2025-06-20T23:59:59Z', UsageLimitPerUser: null, UsageLimitTotal: 500, TimesUsed: 0, Scope: 'Platform', ShopID: null, IsActive: true, CreatedBy: 'Admin', UserID: 4, CreatedAt: '2025-05-29 08:19:46', UpdatedAt: '2025-05-29 08:19:46', TimesUsedByUser: 0 },
      //Dữ liệu mẫu
      { VoucherID: 1, Code: 'VOUCHERXTRA1', Description: 'Voucher Xtra giảm 15% tối đa 100k', VoucherType: 'SaleOff', DiscountType: 'Percentage', DiscountValue: 15, MaxValueForPercentage: 100000, MinOrderValue: 120000, StartDate: '2025-05-01T00:00:00Z', EndDate: '2025-05-25T00:00:00Z', UsageLimitPerUser: 2, UsageLimitTotal: 50, TimesUsed: 10, Scope: 'Platform', IsActive: true, CreatedBy: 'Admin', UserID: null, CreatedAt: '', UpdatedAt: '', TimesUsedByUser: 0 },
      { VoucherID: 2, Code: 'VOUCHERXTRA2', Description: 'Voucher Xtra giảm 1tr', VoucherType: 'SaleOff', DiscountType: 'FixedAmount', DiscountValue: 1000000, MinOrderValue: 2000000, StartDate: '2025-05-01T00:00:00Z', EndDate: '2025-05-25T00:00:00Z', UsageLimitPerUser: 1, UsageLimitTotal: 20, TimesUsed: 5, Scope: 'Platform', IsActive: true, CreatedBy: 'Admin', UserID: null, CreatedAt: '', UpdatedAt: '', TimesUsedByUser: 0 },
      { VoucherID: 3, Code: 'SHOPEESALE1', Description: 'Giảm 15% cho Shopee', VoucherType: 'SaleOff', DiscountType: 'Percentage', DiscountValue: 15, MaxValueForPercentage: 30000, MinOrderValue: 100000, StartDate: '2025-05-01T00:00:00Z', EndDate: '2025-05-25T00:00:00Z', UsageLimitPerUser: 2, UsageLimitTotal: 30, TimesUsed: 8, Scope: 'Shop', ShopID: 1, shopName: 'Shopee', IsActive: true, CreatedBy: 'Seller', UserID: null, CreatedAt: '', UpdatedAt: '', TimesUsedByUser: 1 },
      { VoucherID: 4, Code: 'XAHANG1', Description: 'Xả hàng giảm 12% max 200k', VoucherType: 'SaleOff', DiscountType: 'Percentage', DiscountValue: 12, MaxValueForPercentage: 200000, MinOrderValue: 500000, StartDate: '2025-05-01T00:00:00Z', EndDate: '2025-05-25T00:00:00Z', UsageLimitPerUser: 6, UsageLimitTotal: 50, TimesUsed: 20, Scope: 'Shop', ShopID: 1, shopName: 'Shopee', IsActive: true, CreatedBy: 'Seller', UserID: null, CreatedAt: '', UpdatedAt: '', TimesUsedByUser: 0 },
      { VoucherID: 5, Code: 'XAHANG2', Description: 'Xả hàng giảm 12% max 80k', VoucherType: 'SaleOff', DiscountType: 'Percentage', DiscountValue: 12, MaxValueForPercentage: 80000, MinOrderValue: 150000, StartDate: '2025-05-01T00:00:00Z', EndDate: '2025-05-25T00:00:00Z', UsageLimitPerUser: 6, UsageLimitTotal: 50, TimesUsed: 20, Scope: 'Shop', ShopID: 1, shopName: 'Shopee', IsActive: true, CreatedBy: 'Seller', UserID: null, CreatedAt: '', UpdatedAt: '', TimesUsedByUser: 0 },
      { VoucherID: 6, Code: 'XAHANG3', Description: 'Xả hàng giảm 12% max 90k', VoucherType: 'SaleOff', DiscountType: 'Percentage', DiscountValue: 12, MaxValueForPercentage: 90000, MinOrderValue: 0, StartDate: '2025-05-01T00:00:00Z', EndDate: '2025-05-25T00:00:00Z', UsageLimitPerUser: 6, UsageLimitTotal: 50, TimesUsed: 20, Scope: 'Shop', ShopID: 1, shopName: 'Shopee', IsActive: true, CreatedBy: 'Seller', UserID: null, CreatedAt: '', UpdatedAt: '', TimesUsedByUser: 0 },
      { VoucherID: 7, Code: 'LIVESALE1', Description: 'Siêu Live Xả Hàng', VoucherType: 'SaleOff', DiscountType: 'Percentage', DiscountValue: 15, MaxValueForPercentage: 200000, MinOrderValue: 500000, StartDate: '2025-05-01T00:00:00Z', EndDate: '2025-05-25T00:00:00Z', UsageLimitPerUser: 6, UsageLimitTotal: 50, TimesUsed: 20, Scope: 'Shop', ShopID: 2, shopName: 'Shopee Live', IsActive: true, CreatedBy: 'Seller', UserID: null, CreatedAt: '', UpdatedAt: '', visualType: 'SHOPEE_LIVE', TimesUsedByUser: 0 },
      { VoucherID: 8, Code: 'ONLYLIVE1', Description: 'Chỉ có trên Live', VoucherType: 'SaleOff', DiscountType: 'Percentage', DiscountValue: 15, MaxValueForPercentage: 90000, MinOrderValue: 250000, StartDate: '2025-05-01T00:00:00Z', EndDate: '2025-05-25T00:00:00Z', UsageLimitPerUser: 6, UsageLimitTotal: 50, TimesUsed: 20, Scope: 'Shop', ShopID: 3, shopName: 'Chỉ Có Trên Live', IsActive: true, CreatedBy: 'Seller', UserID: null, CreatedAt: '', UpdatedAt: '', visualType: 'ONLY_LIVE', TimesUsedByUser: 0 },
      { VoucherID: 9, Code: 'SAMPLE1', Description: 'Voucher mẫu 1', VoucherType: 'SaleOff', DiscountType: 'FixedAmount', DiscountValue: 50000, MaxValueForPercentage: null, MinOrderValue: 100000, StartDate: '2025-01-01T00:00:00Z', EndDate: '2025-12-31T23:59:59Z', UsageLimitPerUser: 1, UsageLimitTotal: 100, TimesUsed: 0, Scope: 'Platform', ShopID: null, IsActive: true, CreatedBy: 'Admin', UserID: null, CreatedAt: '', UpdatedAt: '', TimesUsedByUser: 0 },
      { VoucherID: 10, Code: 'SAMPLE2', Description: 'Voucher mẫu 2', VoucherType: 'FreeShip', DiscountType: 'FixedAmount', DiscountValue: 20000, MaxValueForPercentage: null, MinOrderValue: 50000, StartDate: '2025-01-01T00:00:00Z', EndDate: '2025-12-31T23:59:59Z', UsageLimitPerUser: null, UsageLimitTotal: 200, TimesUsed: 0, Scope: 'Platform', ShopID: null, IsActive: true, CreatedBy: 'Admin', UserID: null, CreatedAt: '', UpdatedAt: '', TimesUsedByUser: 0 },
      { VoucherID: 11, Code: 'SAMPLE3', Description: 'Voucher mẫu 3', VoucherType: 'SaleOff', DiscountType: 'Percentage', DiscountValue: 10, MaxValueForPercentage: 50000, MinOrderValue: 100000, StartDate: '2025-01-01T00:00:00Z', EndDate: '2025-12-31T23:59:59Z', UsageLimitPerUser: 1, UsageLimitTotal: 50, TimesUsed: 0, Scope: 'Shop', ShopID: 1, shopName: 'Shopee', IsActive: true, CreatedBy: 'Seller', UserID: null, CreatedAt: '', UpdatedAt: '', TimesUsedByUser: 0 },
      { VoucherID: 12, Code: 'SAMPLE4', Description: 'Voucher mẫu 4', VoucherType: 'SaleOff', DiscountType: 'FixedAmount', DiscountValue: 10000, MaxValueForPercentage: null, MinOrderValue: 0, StartDate: '2025-01-01T00:00:00Z', EndDate: '2025-12-31T23:59:59Z', UsageLimitPerUser: null, UsageLimitTotal: 300, TimesUsed: 0, Scope: 'Platform', ShopID: null, IsActive: true, CreatedBy: 'Admin', UserID: null, CreatedAt: '', UpdatedAt: '', TimesUsedByUser: 0 },
      { VoucherID: 13, Code: 'SAMPLE5', Description: 'Voucher mẫu 5', VoucherType: 'FreeShip', DiscountType: 'FixedAmount', DiscountValue: 15000, MaxValueForPercentage: null, MinOrderValue: 50000, StartDate: '2025-01-01T00:00:00Z', EndDate: '2025-12-31T23:59:59Z', UsageLimitPerUser: null, UsageLimitTotal: 150, TimesUsed: 0, Scope: 'Shop', ShopID: 2, shopName: 'Shop A', IsActive: true, CreatedBy: 'Seller', UserID: null, CreatedAt: '', UpdatedAt: '', TimesUsedByUser: 0 },
      { VoucherID: 14, Code: 'SAMPLE6', Description: 'Voucher mẫu 6', VoucherType: 'SaleOff', DiscountType: 'Percentage', DiscountValue: 5, MaxValueForPercentage: 20000, MinOrderValue: 80000, StartDate: '2025-01-01T00:00:00Z', EndDate: '2025-12-31T23:59:59Z', UsageLimitPerUser: 1, UsageLimitTotal: 80, TimesUsed: 0, Scope: 'Platform', ShopID: null, IsActive: true, CreatedBy: 'Admin', UserID: null, CreatedAt: '', UpdatedAt: '', TimesUsedByUser: 0 },
      { VoucherID: 15, Code: 'SAMPLE7', Description: 'Voucher mẫu 7', VoucherType: 'SaleOff', DiscountType: 'FixedAmount', DiscountValue: 30000, MaxValueForPercentage: null, MinOrderValue: 150000, StartDate: '2025-01-01T00:00:00Z', EndDate: '2025-12-31T23:59:59Z', UsageLimitPerUser: 1, UsageLimitTotal: 70, TimesUsed: 0, Scope: 'Shop', ShopID: 3, shopName: 'Shop B', IsActive: true, CreatedBy: 'Seller', UserID: null, CreatedAt: '', UpdatedAt: '', TimesUsedByUser: 0 },
    ];

    const processedVouchers = rawVouchersFromDb.map(v => {
      let visualType: Voucher['visualType'] = undefined;

      if (v.VoucherType === 'FreeShip') {
        visualType = 'FREESHIP';
      } else if (v.VoucherType === 'SaleOff') {
        if (v.Scope === 'Shop') {
          visualType = 'XA_HANG';
        } else if (v.Scope === 'Platform') {
          visualType = 'EMARKET';
        }
      }

      if (v.shopName === 'Shopee' && v.VoucherType === 'SaleOff' && v.Scope === 'Shop') {
        visualType = 'SHOPEE';
      }
      if (v.Description?.includes("Shopee Live")) {
        visualType = 'SHOPEE_LIVE';
      }
      if (v.Description?.includes("Chỉ có trên Live")) {
        visualType = 'ONLY_LIVE';
      }
      if (v.Description?.includes("Xtra")) {
        visualType = 'VOUCHER_XTRA';
      }

      return { ...v, visualType };
    });

    setAllVouchers(processedVouchers);
  }, []);

  const getFilteredVouchers = () => {
    switch (activeTab) {
      case 'all':
        return allVouchers;
      case 'shopee':
        return allVouchers.filter(v => v.shopName === 'Shopee');
      case 'shop':
        return allVouchers.filter(v => v.Scope === 'Shop' && v.shopName !== 'Shopee');
      default:
        return [];
    }
  };

  const filteredVouchers = getFilteredVouchers();

  const indexOfLastVoucher = currentPage * vouchersPerPage;
  const indexOfFirstVoucher = indexOfLastVoucher - vouchersPerPage;
  const currentVouchers = filteredVouchers.slice(indexOfFirstVoucher, indexOfLastVoucher);

  const totalPages = Math.ceil(filteredVouchers.length / vouchersPerPage);

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const shopeeVouchersCount = allVouchers.filter(v => v.shopName === 'Shopee').length;
  const shopVouchersCount = allVouchers.filter(v => v.Scope === 'Shop' && v.shopName !== 'Shopee').length;

  const tabs = [
    { id: 'all', name: 'Tất cả', count: allVouchers.length },
    { id: 'shopee', name: 'Shopee', count: shopeeVouchersCount },
    { id: 'shop', name: 'Shop', count: shopVouchersCount },
    { id: 'napthedichvu', name: 'Nạp thẻ & Dịch vụ', count: 0 },
    { id: 'scanpay', name: 'Scan & Pay', count: 0 },
    { id: 'dichvutaichinh', name: 'Dịch vụ Tài chính', count: 0 },
    { id: 'more', name: 'More', count: 0, hasDropdown: true },
  ];

  return (
    <div>
      <div className="flex justify-between items-center pb-6">
        <h1 className="text-2xl font-bold text-black">Kho Voucher</h1>
        <div className="flex gap-4 text-blue-500 text-sm">
          {/* <a href="#" className="hover:underline">Xem lịch sử voucher</a>
          <a href="#" className="hover:underline">Tìm hiểu</a> */}
        </div>
      </div>

      <div className="pt-6 border-t border-gray-200 mb-8">
        <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-md">
          <label htmlFor="voucherCode" className="text-gray-700 font-semibold text-sm">Mã Voucher</label>
          <input
            type="text"
            id="voucherCode"
            placeholder="Nhập mã voucher tại đây"
            value={voucherCode}
            onChange={(e) => setVoucherCode(e.target.value)}
            className="flex-1 py-2 text-black px-3 border border-gray-300 rounded-md text-sm
                       focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
          />
          <button className="bg-gray-200 text-gray-700 py-2 px-4 rounded-md text-sm transition-colors duration-200 hover:bg-gray-300">
            Lưu
          </button>
        </div>
      </div>

      <div className="border-b border-gray-200 mb-6">
        <div className="flex overflow-x-auto whitespace-nowrap -mb-px">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={`py-3 px-4 text-sm font-semibold cursor-pointer transition-colors duration-200
                ${activeTab === tab.id
                  ? 'border-b-2 border-orange-500 text-orange-500'
                  : 'text-gray-700 hover:text-orange-500 hover:border-b-2 hover:border-orange-100'
                }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.name}
              {tab.count > 0 && <span className="font-normal text-gray-500 ml-1">({tab.count})</span>}
              {tab.hasDropdown && <span className="ml-1">▼</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {currentVouchers.length > 0 ? (
          currentVouchers.map((voucher) => (
            <VoucherCard key={voucher.VoucherID} voucher={voucher} />
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500 mt-8">Không có voucher nào trong danh mục này.</p>
        )}
      </div>

      {totalPages > 1 && (
        <nav className="flex justify-center mt-8" aria-label="Pagination">
          <ul className="flex list-none p-0">
            <li>
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1.5 mx-1 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Trước
              </button>
            </li>
            {pageNumbers.map(number => (
              <li key={number}>
                <button
                  onClick={() => paginate(number)}
                  className={`px-3 py-1.5 mx-1 border border-gray-300 rounded-md
                    ${currentPage === number ? 'bg-orange-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                >
                  {number}
                </button>
              </li>
            ))}
            <li>
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 mx-1 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sau
              </button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}