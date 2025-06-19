// 'use client';

// import React, { useEffect, useState, useCallback, useRef } from 'react';
// import { Loader2, Tag, Store, Truck, DollarSign, XCircle } from 'lucide-react';
// import { toast } from 'react-toastify';
// import { Voucher, VoucherCouponType, AppliedVoucher, FetchVouchersResponse } from '@/types';
// import { fetchAvailableVouchers } from '@/services/voucher';

// interface VoucherSelectModalProps {
//     isOpen: boolean;
//     onClose: () => void;
//     onApplyVoucher: (voucher: AppliedVoucher | null) => void;
//     initialAppliedVoucher?: AppliedVoucher | null;
//     currentCartTotal?: number;
// }

// const VoucherSelectModal: React.FC<VoucherSelectModalProps> = ({
//     isOpen,
//     onClose,
//     onApplyVoucher,
//     initialAppliedVoucher = null,
//     currentCartTotal = 0
// }) => {
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);
//     const [platformVouchers, setPlatformVouchers] = useState<Voucher[]>([]);
//     const [shopVouchers, setShopVouchers] = useState<Voucher[]>([]); // Vẫn fetch nhưng không hiển thị trong modal này
//     const [selectedVoucherId, setSelectedVoucherId] = useState<number | null>(null);
//     const [manualVoucherCode, setManualVoucherCode] = useState<string>('');

//     useEffect(() => {
//         if (initialAppliedVoucher) {
//             setSelectedVoucherId(initialAppliedVoucher.VoucherID);
//         } else {
//             setSelectedVoucherId(null);
//         }
//         if (isOpen) {
//             loadVouchers();
//         }
//     }, [isOpen, initialAppliedVoucher]);

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
//                 break;
//             default:
//                 toast.info(message, { autoClose: duration });
//         }
//     }, []);

//     const loadVouchers = useCallback(async () => {
//         setLoading(true);
//         setError(null);
//         try {
//             const data: FetchVouchersResponse = await fetchAvailableVouchers();
//             setPlatformVouchers(data.platformVouchers);
//             setShopVouchers(data.shopVouchers); // Keep shop vouchers in state, though not used in this modal directly
//         } catch (err: any) {
//             console.error("Failed to fetch vouchers:", err);
//             const errorMessage = err.response?.data?.message || 'Không thể tải voucher. Vui lòng thử lại.';
//             setError(errorMessage);
//             showNotification(errorMessage, 'error');
//         } finally {
//             setLoading(false);
//         }
//     }, [showNotification]);


//     const handleSelectVoucher = (voucherId: number) => {
//         setSelectedVoucherId(voucherId);
//         setManualVoucherCode('');
//     };

//     const handleManualCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         setManualVoucherCode(e.target.value);
//         setSelectedVoucherId(null);
//     };

//     // Hàm định dạng hiển thị giá trị giảm giá
//     const formatDiscount = (voucher: Voucher) => {
//         if (voucher.DiscountType === 'Percentage') {
//             let discountString = `${voucher.DiscountValue}%`;
//             if (typeof voucher.MaxValueForPercentage === 'number' && voucher.MaxValueForPercentage > 0) {
//                 discountString += ` (tối đa ${voucher.MaxValueForPercentage.toLocaleString('vi-VN')}₫)`;
//             }
//             return discountString;
//         } else { // FixedAmount
//             return `${voucher.DiscountValue.toLocaleString('vi-VN')}₫`;
//         }
//     };

//     // Hàm lấy trạng thái hiển thị của voucher
//     const getVoucherEligibilityText = (voucher: Voucher) => {
//         const now = new Date();
//         const expiresAt = new Date(voucher.EndDate);
//         const startsAt = new Date(voucher.StartDate);

//         // Kiểm tra các điều kiện chính xác theo thứ tự ưu tiên hiển thị lỗi
//         if (voucher.IsActive === false) {
//             return 'Không hoạt động.';
//         }
//         if (now < startsAt) {
//             return `Chưa có hiệu lực (từ: ${startsAt.toLocaleDateString('vi-VN')}).`;
//         }
//         if (now > expiresAt) {
//             return `Đã hết hạn vào: ${expiresAt.toLocaleDateString('vi-VN')}.`;
//         }

//         // Kiểm tra tổng lượt sử dụng
//         if (typeof voucher.UsageLimitTotal === 'number' && voucher.TimesUsed >= voucher.UsageLimitTotal) {
//             return 'Đã hết lượt sử dụng (toàn bộ).';
//         }
//         // Kiểm tra lượt sử dụng của user
//         if (typeof voucher.UsageLimitPerUser === 'number' && typeof voucher.TimesUsedByUser === 'number' && voucher.TimesUsedByUser >= voucher.UsageLimitPerUser) {
//              return `Bạn đã hết lượt sử dụng (${voucher.TimesUsedByUser}/${voucher.UsageLimitPerUser} lượt).`;
//         }
//         // Kiểm tra giá trị đơn hàng tối thiểu
//         if (voucher.MinOrderValue > 0 && currentCartTotal < voucher.MinOrderValue) {
//             return `Chưa đủ điều kiện`;
//         }
        
//         // Nếu không có điều kiện nào bị vi phạm, voucher khả dụng
//         return 'Có thể sử dụng.';
//     };

//     // Hàm kiểm tra xem voucher có đủ điều kiện để chọn radio button không
//     const isVoucherSelectable = (voucher: Voucher): boolean => {
//         const now = new Date();
//         const expiresAt = new Date(voucher.EndDate);
//         const startsAt = new Date(voucher.StartDate);

//         if (!voucher.IsActive) return false;
//         if (now < startsAt) return false;
//         if (now > expiresAt) return false;
//         if (typeof voucher.UsageLimitTotal === 'number' && voucher.TimesUsed >= voucher.UsageLimitTotal) return false;
//         if (typeof voucher.UsageLimitPerUser === 'number' && typeof voucher.TimesUsedByUser === 'number' && voucher.TimesUsedByUser >= voucher.UsageLimitPerUser) return false;
//         if (voucher.MinOrderValue > 0 && currentCartTotal < voucher.MinOrderValue) return false;

//         return true;
//     };


//     const handleApplyButtonClick = () => {
//         if (selectedVoucherId) {
//             const allVouchers = [...platformVouchers, ...shopVouchers]; // Dù không hiển thị shopVouchers, chúng ta vẫn cần nó để tìm voucher nếu đã chọn từ trước
//             const chosenVoucher = allVouchers.find(v => v.VoucherID === selectedVoucherId);

//             if (chosenVoucher && isVoucherSelectable(chosenVoucher)) {
//                 const appliedData: AppliedVoucher = {
//                     VoucherID: chosenVoucher.VoucherID,
//                     Code: chosenVoucher.Code,
//                     DiscountType: chosenVoucher.DiscountType,
//                     DiscountValue: chosenVoucher.DiscountValue,
//                     MaxValueForPercentage: chosenVoucher.MaxValueForPercentage,
//                     MinOrderValue: chosenVoucher.MinOrderValue,
//                     Scope: chosenVoucher.Scope,
//                     ShopID: chosenVoucher.ShopID,
//                     VoucherType: chosenVoucher.VoucherType
//                 };
//                 onApplyVoucher(appliedData);
//                 onClose();
//                 showNotification(`Đã áp dụng voucher: ${chosenVoucher.Code}`, 'success');
//             } else {
//                 showNotification("Voucher đã chọn không hợp lệ hoặc không đủ điều kiện.", 'error');
//             }
//         } else if (manualVoucherCode.trim()) {
//             showNotification(`Tính năng áp dụng mã thủ công cho "${manualVoucherCode}" đang phát triển.`, 'info');
//         } else {
//             onApplyVoucher(null); // Không chọn voucher nào
//             onClose();
//             showNotification("Đã hủy bỏ áp dụng voucher.", 'info');
//         }
//     };

//     if (!isOpen) return null;

//     // Lọc ra các voucher để hiển thị trong modal này
//     // Platform FreeShip Vouchers
//     const freeShipVouchers = platformVouchers.filter(v => v.VoucherType === 'FreeShip');
//     // Platform SaleOff Vouchers
//     const saleOffVouchers = platformVouchers.filter(v => v.VoucherType === 'SaleOff');


//     return (
//         <div className="fixed inset-0 flex items-center justify-center z-50">
//             <div className="bg-white rounded-lg shadow-lg w-full max-w-lg relative flex flex-col max-h-[70vh] overflow-hidden">
//                 <div className="p-6 rounded-lg shadow-inner">
//                     {/* Header */}
//                     <div className="flex justify-between items-center pb-4 border-b">
//                         <h2 className="text-xl font-bold text-black">Chọn Mã Giảm Giá</h2>
//                         <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
//                             <XCircle className="h-6 w-6" />
//                         </button>
//                     </div>

//                     {/* Manual Voucher Input */}
//                     <div className="my-4">
//                         <div className="flex items-center space-x-2">
//                             <input
//                                 type="text"
//                                 placeholder="Nhập mã voucher"
//                                 value={manualVoucherCode}
//                                 onChange={handleManualCodeChange}
//                                 className="flex-grow p-2 border text-black rounded-md focus:ring-blue-500 focus:border-blue-500"
//                             />
//                             <button
//                                 className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md font-semibold hover:bg-gray-300 transition"
//                                 onClick={() => {
//                                     if (manualVoucherCode.trim()) {
//                                         handleApplyButtonClick();
//                                     } else {
//                                         showNotification("Vui lòng nhập mã voucher.", 'warning');
//                                     }
//                                 }}
//                             >
//                                 Áp dụng
//                             </button>
//                         </div>
//                     </div>

//                     {/* Voucher List Sections */}
//                     <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
//                         {loading ? (
//                             <div className="flex justify-center items-center h-full">
//                                 <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
//                             </div>
//                         ) : error ? (
//                             <p className="text-red-500 text-center">{error}</p>
//                         ) : (
//                             <div className="space-y-6">
//                                 {/* FreeShip Vouchers (Platform only) */}
//                                 <VoucherSection
//                                     title="Mã Miễn Phí Vận Chuyển"
//                                     icon={Truck}
//                                     vouchers={freeShipVouchers} // Chỉ truyền FreeShip của Platform
//                                     selectedVoucherId={selectedVoucherId}
//                                     handleSelectVoucher={handleSelectVoucher}
//                                     isVoucherSelectable={isVoucherSelectable}
//                                     getVoucherEligibilityText={getVoucherEligibilityText}
//                                     formatDiscount={formatDiscount}
//                                     currentCartTotal={currentCartTotal}
//                                 />

//                                 {/* SaleOff Vouchers (Platform only) */}
//                                 <VoucherSection
//                                     title="Mã Giảm Giá Toàn Sàn" // Đổi tiêu đề rõ ràng hơn
//                                     icon={DollarSign}
//                                     vouchers={saleOffVouchers} // Chỉ truyền SaleOff của Platform
//                                     selectedVoucherId={selectedVoucherId}
//                                     handleSelectVoucher={handleSelectVoucher}
//                                     isVoucherSelectable={isVoucherSelectable}
//                                     getVoucherEligibilityText={getVoucherEligibilityText}
//                                     formatDiscount={formatDiscount}
//                                     currentCartTotal={currentCartTotal}
//                                 />

//                                 {/* Placeholder for Shop Vouchers (if any are available but not displayed here) */}
//                                 {/* {shopVouchers.length > 0 && (
//                                     <p className="text-gray-600 text-center text-sm py-4">
//                                         Bạn có {shopVouchers.length} voucher của shop. Vui lòng sử dụng tại modal chọn voucher của shop.
//                                     </p>
//                                 )} */}
//                             </div>
//                         )}
//                     </div>

//                     {/* Footer Buttons */}
//                     <div className="flex-shrink-0 flex justify-end space-x-3 pt-4 border-t mt-4">
//                         <button
//                             onClick={() => { onApplyVoucher(null); onClose(); showNotification("Đã hủy bỏ áp dụng voucher.", 'info'); }}
//                             className="px-6 py-3 bg-gray-200 text-gray-800 rounded-md font-semibold hover:bg-gray-300 transition-colors"
//                         >
//                             TRỞ LẠI
//                         </button>
//                         <button
//                             onClick={handleApplyButtonClick}
//                             className="px-6 py-3 bg-red-500 text-white rounded-md font-semibold hover:bg-red-600 transition-colors"
//                         >
//                             ÁP DỤNG
//                         </button>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default VoucherSelectModal;


// // Sub-component for rendering voucher sections (e.g., FreeShip, SaleOff)
// interface VoucherSectionProps {
//     title: string;
//     icon: React.ElementType; // For LucideIcon
//     vouchers: Voucher[];
//     selectedVoucherId: number | null;
//     handleSelectVoucher: (id: number) => void;
//     isVoucherSelectable: (voucher: Voucher) => boolean;
//     getVoucherEligibilityText: (voucher: Voucher) => string;
//     formatDiscount: (voucher: Voucher) => string;
//     currentCartTotal: number; // Nhận currentCartTotal
// }

// const VoucherSection: React.FC<VoucherSectionProps> = ({
//     title,
//     icon: Icon,
//     vouchers,
//     selectedVoucherId,
//     handleSelectVoucher,
//     isVoucherSelectable,
//     getVoucherEligibilityText,
//     formatDiscount,
//     currentCartTotal // Nhận currentCartTotal
// }) => {
//     // Chỉ hiển thị phần này nếu có voucher để render
//     if (vouchers.length === 0) {
//         return null; // Không render gì nếu không có voucher nào phù hợp trong phần này
//     }

//     return (
//         <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
//             <h3 className="font-semibold text-lg text-gray-800 flex items-center mb-2">
//                 <Icon className="h-5 w-5 mr-2 text-blue-500" /> {title}
//             </h3>
//             <div className="space-y-3">
//                 {vouchers.map(voucher => {
//                     const selectable = isVoucherSelectable(voucher);
//                     const isSelected = selectedVoucherId === voucher.VoucherID;

//                     return (
//                         <div
//                             key={voucher.VoucherID}
//                             className={`flex items-center space-x-3 p-3 border rounded-md transition cursor-pointer
//                                 ${selectable ? 'hover:border-blue-500' : 'opacity-50 cursor-not-allowed'}
//                                 ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
//                             `}
//                             onClick={() => selectable && handleSelectVoucher(voucher.VoucherID)}
//                         >
//                             <input
//                                 type="radio"
//                                 name={(voucher.VoucherType == "FreeShip")? "FreeShip" :  "SaleOff"} // Cùng name để chỉ chọn 1 radio trong tất cả các loại voucher
//                                 id={`voucher-${voucher.VoucherID}`}
//                                 value={voucher.VoucherID}
//                                 checked={isSelected}
//                                 onChange={() => handleSelectVoucher(voucher.VoucherID)}
//                                 disabled={!selectable}
//                                 className="form-radio h-4 w-4 text-blue-600"
//                             />
//                             <label htmlFor={`voucher-${voucher.VoucherID}`} className={`flex-grow block cursor-pointer ${!selectable ? 'text-gray-500' : ''}`}>
//                                 <div className="flex flex-row justify-between">
//                                     <div className="font-medium text-gray-800">{voucher.Code}</div>
//                                     <div className={`text-xs ${selectable ? 'text-gray-500' : 'text-red-500'}`}>
//                                         {getVoucherEligibilityText(voucher)}
//                                     </div>
//                                 </div>
//                                 <div className="text-red-600 font-bold">{formatDiscount(voucher)}</div>
//                                 {voucher.MinOrderValue > 0 && (
//                                     <div className="text-sm text-gray-600">Đơn tối thiểu: {voucher.MinOrderValue.toLocaleString('vi-VN')}₫</div>
//                                 )}
                               
//                                 {voucher.Scope === 'Shop' && voucher.shopName && (
//                                     <div className="text-xs text-gray-700 flex items-center mt-1">
//                                         <Store className="h-3 w-3 mr-1" /> Từ: {voucher.shopName}
//                                     </div>
//                                 )}
//                             </label>
//                         </div>
//                     );
//                 })}
//             </div>
//         </div>
//     );
// };

// src/app/components/VoucherSelectModal.tsx
// 'use client';

// import React, { useEffect, useState, useCallback, useRef } from 'react';
// import { Loader2, Tag, Store, Truck, DollarSign, XCircle } from 'lucide-react';
// import { toast } from 'react-toastify';
// import { Voucher, VoucherCouponType, SingleAppliedVoucher, FetchVouchersResponse, AppliedVouchersCombined } from '@/types'; // Import SingleAppliedVoucher và AppliedVouchersCombined
// import { fetchAvailableVouchers } from '@/services/voucher';

// interface VoucherSelectModalProps {
//     isOpen: boolean;
//     onClose: () => void;
//     onApplyVouchers: (vouchers: AppliedVouchersCombined | null) => void; // Thay đổi tên hàm và kiểu dữ liệu
//     initialAppliedVouchers?: AppliedVouchersCombined | null; // Thay đổi kiểu dữ liệu
//     currentCartTotal?: number;
// }

// const VoucherSelectModal: React.FC<VoucherSelectModalProps> = ({
//     isOpen,
//     onClose,
//     onApplyVouchers, // Đã đổi tên
//     initialAppliedVouchers = null, // Đã đổi kiểu dữ liệu
//     currentCartTotal = 0
// }) => {
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);
//     const [platformVouchers, setPlatformVouchers] = useState<Voucher[]>([]);
//     const [shopVouchers, setShopVouchers] = useState<Voucher[]>([]); // Vẫn fetch nhưng không hiển thị trong modal này

//     // NEW: State cho ID của voucher FreeShip được chọn
//     const [selectedFreeShipVoucherId, setSelectedFreeShipVoucherId] = useState<number | null>(null);
//     // NEW: State cho ID của voucher SaleOff được chọn
//     const [selectedSaleOffVoucherId, setSelectedSaleOffVoucherId] = useState<number | null>(null);

//     const [manualVoucherCode, setManualVoucherCode] = useState<string>('');

//     useEffect(() => {
//         if (initialAppliedVouchers) {
//             setSelectedFreeShipVoucherId(initialAppliedVouchers.freeShipVoucher?.VoucherID || null);
//             setSelectedSaleOffVoucherId(initialAppliedVouchers.saleOffVoucher?.VoucherID || null);
//         } else {
//             setSelectedFreeShipVoucherId(null);
//             setSelectedSaleOffVoucherId(null);
//         }
//         if (isOpen) {
//             loadVouchers();
//         }
//     }, [isOpen, initialAppliedVouchers]);

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
//                 break;
//             default:
//                 toast.info(message, { autoClose: duration });
//         }
//     }, []);

//     const loadVouchers = useCallback(async () => {
//         setLoading(true);
//         setError(null);
//         try {
//             const data: FetchVouchersResponse = await fetchAvailableVouchers();
//             setPlatformVouchers(data.platformVouchers);
//             setShopVouchers(data.shopVouchers);
//         } catch (err: any) {
//             console.error("Failed to fetch vouchers:", err);
//             const errorMessage = err.response?.data?.message || 'Không thể tải voucher. Vui lòng thử lại.';
//             setError(errorMessage);
//             showNotification(errorMessage, 'error');
//         } finally {
//             setLoading(false);
//         }
//     }, [showNotification]);


//     // NEW: Hàm xử lý lựa chọn voucher theo từng loại
//     const handleSelectVoucherOfType = (type: VoucherCouponType, voucherId: number) => {
//         if (type === 'FreeShip') {
//             // Nếu click vào voucher FreeShip đang được chọn, thì bỏ chọn
//             setSelectedFreeShipVoucherId(prevId => prevId === voucherId ? null : voucherId);
//             setSelectedSaleOffVoucherId(null); // Bỏ chọn SaleOff nếu chọn FreeShip
//         } else if (type === 'SaleOff') {
//             // Nếu click vào voucher SaleOff đang được chọn, thì bỏ chọn
//             setSelectedSaleOffVoucherId(prevId => prevId === voucherId ? null : voucherId);
//             setSelectedFreeShipVoucherId(null); // Bỏ chọn FreeShip nếu chọn SaleOff
//         }
//         setManualVoucherCode(''); // Luôn xóa input thủ công
//     };

//     const handleManualCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         setManualVoucherCode(e.target.value);
//         setSelectedFreeShipVoucherId(null); // Bỏ chọn cả hai loại nếu nhập mã thủ công
//         setSelectedSaleOffVoucherId(null);
//     };

//     // Hàm định dạng hiển thị giá trị giảm giá
//     const formatDiscount = (voucher: Voucher) => {
//         if (voucher.DiscountType === 'Percentage') {
//             let discountString = `${voucher.DiscountValue}%`;
//             if (typeof voucher.MaxValueForPercentage === 'number' && voucher.MaxValueForPercentage > 0) {
//                 discountString += ` (tối đa ${voucher.MaxValueForPercentage.toLocaleString('vi-VN')}₫)`;
//             }
//             return discountString;
//         } else { // FixedAmount
//             return `${voucher.DiscountValue.toLocaleString('vi-VN')}₫`;
//         }
//     };

//     // Hàm lấy trạng thái hiển thị của voucher
//     const getVoucherEligibilityText = (voucher: Voucher) => {
//         const now = new Date();
//         const expiresAt = new Date(voucher.EndDate);
//         const startsAt = new Date(voucher.StartDate);

//         if (voucher.IsActive === false) {
//             return 'Không hoạt động.';
//         }
//         if (now < startsAt) {
//             return `Chưa có hiệu lực (từ: ${startsAt.toLocaleDateString('vi-VN')}).`;
//         }
//         if (now > expiresAt) {
//             return `Đã hết hạn vào: ${expiresAt.toLocaleDateString('vi-VN')}.`;
//         }
//         if (typeof voucher.UsageLimitTotal === 'number' && voucher.TimesUsed >= voucher.UsageLimitTotal) {
//             return 'Đã hết lượt sử dụng (toàn bộ).';
//         }
//         if (typeof voucher.UsageLimitPerUser === 'number' && typeof voucher.TimesUsedByUser === 'number' && voucher.TimesUsedByUser >= voucher.UsageLimitPerUser) {
//              return `Bạn đã hết lượt sử dụng (${voucher.TimesUsedByUser}/${voucher.UsageLimitPerUser} lượt).`;
//         }
//         if (voucher.MinOrderValue > 0 && currentCartTotal < voucher.MinOrderValue) {
//             return `Chưa đủ điều kiện (Đơn tối thiểu: ${voucher.MinOrderValue.toLocaleString('vi-VN')}₫).`;
//         }
        
//         return 'Có thể sử dụng.';
//     };

//     // Hàm kiểm tra xem voucher có đủ điều kiện để chọn radio button không
//     const isVoucherSelectable = (voucher: Voucher): boolean => {
//         const now = new Date();
//         const expiresAt = new Date(voucher.EndDate);
//         const startsAt = new Date(voucher.StartDate);

//         if (!voucher.IsActive) return false;
//         if (now < startsAt) return false;
//         if (now > expiresAt) return false;
//         if (typeof voucher.UsageLimitTotal === 'number' && voucher.TimesUsed >= voucher.UsageLimitTotal) return false;
//         if (typeof voucher.UsageLimitPerUser === 'number' && typeof voucher.TimesUsedByUser === 'number' && voucher.TimesUsedByUser >= voucher.UsageLimitPerUser) return false;
//         if (voucher.MinOrderValue > 0 && currentCartTotal < voucher.MinOrderValue) return false;

//         return true;
//     };


//     const handleApplyButtonClick = () => {
//         let appliedFreeShip: SingleAppliedVoucher | null = null;
//         let appliedSaleOff: SingleAppliedVoucher | null = null;
//         const allVouchers = [...platformVouchers, ...shopVouchers]; // Bao gồm cả shopVouchers để tìm kiếm

//         if (selectedFreeShipVoucherId) {
//             const freeShipVoucher = allVouchers.find(v => v.VoucherID === selectedFreeShipVoucherId && v.VoucherType === 'FreeShip');
//             if (freeShipVoucher && isVoucherSelectable(freeShipVoucher)) {
//                 appliedFreeShip = {
//                     VoucherID: freeShipVoucher.VoucherID,
//                     Code: freeShipVoucher.Code,
//                     DiscountType: freeShipVoucher.DiscountType,
//                     DiscountValue: freeShipVoucher.DiscountValue,
//                     MaxValueForPercentage: freeShipVoucher.MaxValueForPercentage,
//                     MinOrderValue: freeShipVoucher.MinOrderValue,
//                     Scope: freeShipVoucher.Scope,
//                     ShopID: freeShipVoucher.ShopID,
//                     VoucherType: freeShipVoucher.VoucherType
//                 };
//             } else {
//                 showNotification("Voucher FreeShip đã chọn không hợp lệ hoặc không đủ điều kiện.", 'error');
//                 // Nếu không hợp lệ, không áp dụng gì cả cho loại này
//                 setSelectedFreeShipVoucherId(null);
//             }
//         }

//         if (selectedSaleOffVoucherId) {
//             const saleOffVoucher = allVouchers.find(v => v.VoucherID === selectedSaleOffVoucherId && v.VoucherType === 'SaleOff');
//             if (saleOffVoucher && isVoucherSelectable(saleOffVoucher)) {
//                 appliedSaleOff = {
//                     VoucherID: saleOffVoucher.VoucherID,
//                     Code: saleOffVoucher.Code,
//                     DiscountType: saleOffVoucher.DiscountType,
//                     DiscountValue: saleOffVoucher.DiscountValue,
//                     MaxValueForPercentage: saleOffVoucher.MaxValueForPercentage,
//                     MinOrderValue: saleOffVoucher.MinOrderValue,
//                     Scope: saleOffVoucher.Scope,
//                     ShopID: saleOffVoucher.ShopID,
//                     VoucherType: saleOffVoucher.VoucherType
//                 };
//             } else {
//                 showNotification("Voucher Giảm Giá đã chọn không hợp lệ hoặc không đủ điều kiện.", 'error');
//                 // Nếu không hợp lệ, không áp dụng gì cả cho loại này
//                 setSelectedSaleOffVoucherId(null);
//             }
//         }

//         // Handle manual code input: If manual code is entered, it overrides radio selections for both types
//         // For simplicity: if a manual code is entered, it acts as a single voucher selection.
//         // You might need a separate API endpoint for validating and applying a manual code.
//         if (manualVoucherCode.trim()) {
//             showNotification(`Tính năng áp dụng mã thủ công cho "${manualVoucherCode}" đang phát triển. Vui lòng chọn từ danh sách.`, 'info');
//             // For now, manual code doesn't apply.
//             onApplyVouchers({ freeShipVoucher: appliedFreeShip, saleOffVoucher: appliedSaleOff });
//             onClose();
//             return;
//         }

//         // Apply selected vouchers
//         onApplyVouchers({ freeShipVoucher: appliedFreeShip, saleOffVoucher: appliedSaleOff });
//         onClose();

//         if (appliedFreeShip || appliedSaleOff) {
//             let msg = "Đã áp dụng các voucher:";
//             if (appliedFreeShip) msg += ` FreeShip (${appliedFreeShip.Code})`;
//             if (appliedSaleOff) msg += ` SaleOff (${appliedSaleOff.Code})`;
//             showNotification(msg, 'success');
//         } else {
//             showNotification("Đã hủy bỏ áp dụng voucher.", 'info');
//         }
//     };


//     if (!isOpen) return null;

//     // Lọc ra các voucher để hiển thị trong modal này (chỉ platform vouchers)
//     const freeShipPlatformVouchers = platformVouchers.filter(v => v.VoucherType === 'FreeShip');
//     const saleOffPlatformVouchers = platformVouchers.filter(v => v.VoucherType === 'SaleOff');


//     return (
//         <div className="fixed inset-0 flex items-center justify-center z-50">
//             <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg mx-4 relative flex flex-col max-h-[90vh] overflow-hidden">
//                 {/* Header */}
//                 <div className="flex justify-between items-center pb-4 border-b">
//                     <h2 className="text-xl font-bold text-black">Chọn Mã Giảm Giá</h2>
//                     <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
//                         <XCircle className="h-6 w-6" />
//                     </button>
//                 </div>

//                 {/* Manual Voucher Input */}
//                 <div className="my-4">
//                     <div className="flex items-center space-x-2">
//                         <input
//                             type="text"
//                             placeholder="Nhập mã voucher"
//                             value={manualVoucherCode}
//                             onChange={handleManualCodeChange}
//                             className="flex-grow p-2 border text-black rounded-md focus:ring-blue-500 focus:border-blue-500"
//                         />
//                         <button
//                             className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md font-semibold hover:bg-gray-300 transition"
//                             onClick={() => {
//                                 // For manual code, simply try to apply it.
//                                 // If successful, it would typically override current radio selections.
//                                 // Complex logic would involve API lookup for the code.
//                                 handleApplyButtonClick();
//                             }}
//                         >
//                             Áp dụng
//                         </button>
//                     </div>
//                 </div>

//                 {/* Voucher List Sections */}
//                 <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
//                     {loading ? (
//                         <div className="flex justify-center items-center h-full">
//                             <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
//                         </div>
//                     ) : error ? (
//                         <p className="text-red-500 text-center">{error}</p>
//                     ) : (
//                         <div className="space-y-6">
//                             {/* FreeShip Vouchers (Platform only) */}
//                             <VoucherSection
//                                 title="Mã Miễn Phí Vận Chuyển"
//                                 icon={Truck}
//                                 vouchers={freeShipPlatformVouchers}
//                                 selectedVoucherId={selectedFreeShipVoucherId} // Truyền selected ID riêng cho FreeShip
//                                 handleSelectVoucher={(id) => handleSelectVoucherOfType('FreeShip', id)} // Gửi loại voucher và ID
//                                 isVoucherSelectable={isVoucherSelectable}
//                                 getVoucherEligibilityText={getVoucherEligibilityText}
//                                 formatDiscount={formatDiscount}
//                                 currentCartTotal={currentCartTotal}
//                                 radioGroupName="free_ship_voucher" // Tên nhóm radio riêng
//                             />

//                             {/* SaleOff Vouchers (Platform only) */}
//                             <VoucherSection
//                                 title="Mã Giảm Giá Toàn Sàn"
//                                 icon={DollarSign}
//                                 vouchers={saleOffPlatformVouchers}
//                                 selectedVoucherId={selectedSaleOffVoucherId} // Truyền selected ID riêng cho SaleOff
//                                 handleSelectVoucher={(id) => handleSelectVoucherOfType('SaleOff', id)} // Gửi loại voucher và ID
//                                 isVoucherSelectable={isVoucherSelectable}
//                                 getVoucherEligibilityText={getVoucherEligibilityText}
//                                 formatDiscount={formatDiscount}
//                                 currentCartTotal={currentCartTotal}
//                                 radioGroupName="sale_off_voucher" // Tên nhóm radio riêng
//                             />

//                             {/* Placeholder for Shop Vouchers (if any are available but not displayed here) */}
//                             {shopVouchers.length > 0 && (
//                                 <p className="text-gray-600 text-center text-sm py-4">
//                                     Bạn có {shopVouchers.length} voucher của shop. Vui lòng sử dụng tại modal chọn voucher của shop.
//                                 </p>
//                             )}
//                         </div>
//                     )}
//                 </div>

//                 {/* Footer Buttons */}
//                 <div className="flex-shrink-0 flex justify-end space-x-3 pt-4 border-t mt-4">
//                     <button
//                         onClick={() => { onApplyVouchers(null); onClose(); showNotification("Đã hủy bỏ áp dụng voucher.", 'info'); }}
//                         className="px-6 py-3 bg-gray-200 text-gray-800 rounded-md font-semibold hover:bg-gray-300 transition-colors"
//                     >
//                         TRỞ LẠI
//                     </button>
//                     <button
//                         onClick={handleApplyButtonClick}
//                         className="px-6 py-3 bg-red-500 text-white rounded-md font-semibold hover:bg-red-600 transition-colors"
//                     >
//                         ÁP DỤNG
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default VoucherSelectModal;


// // Sub-component for rendering voucher sections (e.g., FreeShip, SaleOff)
// interface VoucherSectionProps {
//     title: string;
//     icon: React.ElementType;
//     vouchers: Voucher[];
//     selectedVoucherId: number | null; // ID của voucher được chọn trong section này
//     handleSelectVoucher: (id: number) => void; // Hàm để báo ID được chọn lên parent
//     isVoucherSelectable: (voucher: Voucher) => boolean;
//     getVoucherEligibilityText: (voucher: Voucher) => string;
//     formatDiscount: (voucher: Voucher) => string;
//     currentCartTotal: number;
//     radioGroupName: string; // NEW: Tên nhóm radio cho section này
// }

// const VoucherSection: React.FC<VoucherSectionProps> = ({
//     title,
//     icon: Icon,
//     vouchers,
//     selectedVoucherId,
//     handleSelectVoucher,
//     isVoucherSelectable,
//     getVoucherEligibilityText,
//     formatDiscount,
//     currentCartTotal,
//     radioGroupName // Nhận tên nhóm radio
// }) => {
//     if (vouchers.length === 0) {
//         return null;
//     }

//     return (
//         <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
//             <h3 className="font-semibold text-lg text-gray-800 flex items-center mb-2">
//                 <Icon className="h-5 w-5 mr-2 text-blue-500" /> {title}
//             </h3>
//             <div className="space-y-3">
//                 {vouchers.map(voucher => {
//                     const selectable = isVoucherSelectable(voucher);
//                     const isSelected = selectedVoucherId === voucher.VoucherID;

//                     return (
//                         <div
//                             key={voucher.VoucherID}
//                             className={`flex items-center space-x-3 p-3 border rounded-md transition cursor-pointer
//                                 ${selectable ? 'hover:border-blue-500' : 'opacity-50 cursor-not-allowed'}
//                                 ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
//                             `}
//                             onClick={() => selectable && handleSelectVoucher(voucher.VoucherID)}
//                         >
//                             <input
//                                 type="radio"
//                                 name={radioGroupName} // Sử dụng tên nhóm radio từ prop
//                                 id={`voucher-${voucher.VoucherID}`}
//                                 value={voucher.VoucherID}
//                                 checked={isSelected}
//                                 onChange={() => handleSelectVoucher(voucher.VoucherID)}
//                                 disabled={!selectable}
//                                 className="form-radio h-4 w-4 text-blue-600"
//                             />
//                             <label htmlFor={`voucher-${voucher.VoucherID}`} className={`flex-grow block cursor-pointer ${!selectable ? 'text-gray-500' : ''}`}>
//                                 <div className="flex flex-row justify-between">
//                                     <div className="font-medium text-gray-800">{voucher.Code}</div>
//                                     <div className={`text-xs ${selectable ? 'text-gray-500' : 'text-red-500'}`}>
//                                         {getVoucherEligibilityText(voucher)}
//                                     </div>
//                                 </div>
//                                 <div className="text-red-600 font-bold">{formatDiscount(voucher)}</div>
//                                 {voucher.MinOrderValue > 0 && (
//                                     <div className="text-sm text-gray-600">Đơn tối thiểu: {voucher.MinOrderValue.toLocaleString('vi-VN')}₫</div>
//                                 )}
                               
//                                 {voucher.Scope === 'Shop' && voucher.shopName && (
//                                     <div className="text-xs text-gray-700 flex items-center mt-1">
//                                         <Store className="h-3 w-3 mr-1" /> Từ: {voucher.shopName}
//                                     </div>
//                                 )}
//                             </label>
//                         </div>
//                     );
//                 })}
//             </div>
//         </div>
//     );
// };

// src/app/components/VoucherSelectModal.tsx
'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Loader2, Tag, Store, Truck, DollarSign, XCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { Voucher, VoucherCouponType, SingleAppliedVoucher, FetchVouchersResponse, AppliedVouchersCombined } from '@/types';
import { fetchAvailableVouchers } from '@/services/voucher';

interface VoucherSelectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApplyVouchers: (vouchers: AppliedVouchersCombined | null) => void; // Thay đổi tên hàm và kiểu dữ liệu
    initialAppliedVouchers?: AppliedVouchersCombined | null; // Thay đổi kiểu dữ liệu
    currentCartTotal?: number;
}

const VoucherSelectModal: React.FC<VoucherSelectModalProps> = ({
    isOpen,
    onClose,
    onApplyVouchers, // Đã đổi tên
    initialAppliedVouchers = { freeShipVoucher: null, saleOffVoucher: null }, // Đã đổi kiểu dữ liệu, cung cấp giá trị mặc định
    currentCartTotal = 0
}) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [platformVouchers, setPlatformVouchers] = useState<Voucher[]>([]);
    const [shopVouchers, setShopVouchers] = useState<Voucher[]>([]); // Vẫn fetch nhưng không hiển thị trong modal này

    // NEW: State cho ID của voucher FreeShip được chọn
    const [selectedFreeShipVoucherId, setSelectedFreeShipVoucherId] = useState<number | null>(null);
    // NEW: State cho ID của voucher SaleOff được chọn
    const [selectedSaleOffVoucherId, setSelectedSaleOffVoucherId] = useState<number | null>(null);

    const [manualVoucherCode, setManualVoucherCode] = useState<string>('');

    useEffect(() => {
        if (initialAppliedVouchers) {
            setSelectedFreeShipVoucherId(initialAppliedVouchers.freeShipVoucher?.VoucherID || null);
            setSelectedSaleOffVoucherId(initialAppliedVouchers.saleOffVoucher?.VoucherID || null);
        } else {
            setSelectedFreeShipVoucherId(null);
            setSelectedSaleOffVoucherId(null);
        }
        if (isOpen) {
             // Fetch vouchers every time modal opens to get fresh data
            loadVouchers();
        }
    }, [isOpen, initialAppliedVouchers]);

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
                break;
            default:
                toast.info(message, { autoClose: duration });
        }
    }, []);

    const loadVouchers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data: FetchVouchersResponse = await fetchAvailableVouchers();
            setPlatformVouchers(data.platformVouchers);
            setShopVouchers(data.shopVouchers); // Keep shop vouchers in state, though not used in this modal directly
        } catch (err: any) {
            console.error("Failed to fetch vouchers:", err);
            const errorMessage = err.response?.data?.message || 'Không thể tải voucher. Vui lòng thử lại.';
            setError(errorMessage);
            showNotification(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    }, [showNotification]);


    // NEW: Hàm xử lý lựa chọn voucher theo từng loại
    const handleSelectVoucherOfType = (type: VoucherCouponType, voucherId: number) => {
        setManualVoucherCode(''); // Luôn xóa input thủ công khi chọn radio button
        if (type === 'FreeShip') {
            // Nếu click vào voucher FreeShip đang được chọn, thì bỏ chọn
            setSelectedFreeShipVoucherId(prevId => prevId === voucherId ? null : voucherId);
        } else if (type === 'SaleOff') {
            // Nếu click vào voucher SaleOff đang được chọn, thì bỏ chọn
            setSelectedSaleOffVoucherId(prevId => prevId === voucherId ? null : voucherId);
        }
        // KHÔNG CÒN DÒNG NÀO BỎ CHỌN LOẠI KHÁC.
    };

    const handleManualCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setManualVoucherCode(e.target.value);
        setSelectedFreeShipVoucherId(null); // Bỏ chọn cả hai loại nếu nhập mã thủ công
        setSelectedSaleOffVoucherId(null);
    };

    // Hàm định dạng hiển thị giá trị giảm giá
    const formatDiscount = (voucher: Voucher) => {
        if (voucher.DiscountType === 'Percentage') {
            let discountString = `${voucher.DiscountValue}%`;
            if (typeof voucher.MaxValueForPercentage === 'number' && voucher.MaxValueForPercentage > 0) {
                discountString += ` (tối đa ${voucher.MaxValueForPercentage.toLocaleString('vi-VN')}₫)`;
            }
            return discountString;
        } else { // FixedAmount
            return `${voucher.DiscountValue.toLocaleString('vi-VN')}₫`;
        }
    };

    // Hàm lấy trạng thái hiển thị của voucher
    const getVoucherEligibilityText = (voucher: Voucher) => {
        const now = new Date();
        const expiresAt = new Date(voucher.EndDate);
        const startsAt = new Date(voucher.StartDate);

        if (voucher.IsActive === false) {
            return 'Không hoạt động.';
        }
        if (now < startsAt) {
            return `Chưa có hiệu lực (từ: ${startsAt.toLocaleDateString('vi-VN')}).`;
        }
        if (now > expiresAt) {
            return `Đã hết hạn vào: ${expiresAt.toLocaleDateString('vi-VN')}.`;
        }

        if (typeof voucher.UsageLimitTotal === 'number' && voucher.TimesUsed >= voucher.UsageLimitTotal) {
            return 'Đã hết lượt sử dụng (toàn bộ).';
        }
        if (typeof voucher.UsageLimitPerUser === 'number' && typeof voucher.TimesUsedByUser === 'number' && voucher.TimesUsedByUser >= voucher.UsageLimitPerUser) {
             return `Bạn đã hết lượt sử dụng (${voucher.TimesUsedByUser}/${voucher.UsageLimitPerUser} lượt).`;
        }
        if (voucher.MinOrderValue > 0 && currentCartTotal < voucher.MinOrderValue) {
            return `Chưa đủ điều kiện (Đơn tối thiểu: ${voucher.MinOrderValue.toLocaleString('vi-VN')}₫).`;
        }
        
        return 'Có thể sử dụng.';
    };

    // Hàm kiểm tra xem voucher có đủ điều kiện để chọn radio button không
    const isVoucherSelectable = (voucher: Voucher): boolean => {
        const now = new Date();
        const expiresAt = new Date(voucher.EndDate);
        const startsAt = new Date(voucher.StartDate);

        if (!voucher.IsActive) return false;
        if (now < startsAt) return false;
        if (now > expiresAt) return false;
        if (typeof voucher.UsageLimitTotal === 'number' && voucher.TimesUsed >= voucher.UsageLimitTotal) return false;
        if (typeof voucher.UsageLimitPerUser === 'number' && typeof voucher.TimesUsedByUser === 'number' && voucher.TimesUsedByUser >= voucher.UsageLimitPerUser) return false;
        if (voucher.MinOrderValue > 0 && currentCartTotal < voucher.MinOrderValue) return false;

        return true;
    };


    // NEW: Hàm xử lý khi bấm nút "ÁP DỤNG"
    const handleApplyButtonClick = () => {
        let appliedFreeShip: SingleAppliedVoucher | null = null;
        let appliedSaleOff: SingleAppliedVoucher | null = null;
        // Gom tất cả voucher để tìm kiếm, kể cả shopVouchers nếu sau này có logic phức tạp hơn
        const allVouchers = [...platformVouchers, ...shopVouchers]; 
        let hasInvalidSelection = false; // Cờ để theo dõi nếu có voucher đã chọn bị vô hiệu

        // Xử lý FreeShip Voucher đã chọn
        if (selectedFreeShipVoucherId) {
            const freeShipVoucher = allVouchers.find(v => v.VoucherID === selectedFreeShipVoucherId && v.VoucherType === 'FreeShip');
            if (freeShipVoucher && isVoucherSelectable(freeShipVoucher)) {
                appliedFreeShip = {
                    VoucherID: freeShipVoucher.VoucherID,
                    Code: freeShipVoucher.Code,
                    DiscountType: freeShipVoucher.DiscountType,
                    DiscountValue: freeShipVoucher.DiscountValue,
                    MaxValueForPercentage: freeShipVoucher.MaxValueForPercentage,
                    MinOrderValue: freeShipVoucher.MinOrderValue,
                    Scope: freeShipVoucher.Scope,
                    ShopID: freeShipVoucher.ShopID,
                    VoucherType: freeShipVoucher.VoucherType
                };
            } else {
                showNotification("Voucher FreeShip đã chọn không hợp lệ hoặc không đủ điều kiện.", 'error');
                hasInvalidSelection = true;
            }
        }

        // Xử lý SaleOff Voucher đã chọn
        if (selectedSaleOffVoucherId) {
            const saleOffVoucher = allVouchers.find(v => v.VoucherID === selectedSaleOffVoucherId && v.VoucherType === 'SaleOff');
            if (saleOffVoucher && isVoucherSelectable(saleOffVoucher)) {
                appliedSaleOff = {
                    VoucherID: saleOffVoucher.VoucherID,
                    Code: saleOffVoucher.Code,
                    DiscountType: saleOffVoucher.DiscountType,
                    DiscountValue: saleOffVoucher.DiscountValue,
                    MaxValueForPercentage: saleOffVoucher.MaxValueForPercentage,
                    MinOrderValue: saleOffVoucher.MinOrderValue,
                    Scope: saleOffVoucher.Scope,
                    ShopID: saleOffVoucher.ShopID,
                    VoucherType: saleOffVoucher.VoucherType
                };
            } else {
                showNotification("Voucher Giảm Giá đã chọn không hợp lệ hoặc không đủ điều kiện.", 'error');
                hasInvalidSelection = true;
            }
        }

        // Xử lý input mã thủ công (nếu có, nó sẽ ưu tiên hơn radio)
        if (manualVoucherCode.trim()) {
            showNotification(`Tính năng áp dụng mã thủ công cho "${manualVoucherCode}" đang phát triển. Vui lòng chọn từ danh sách.`, 'info');
            // Trong thực tế, bạn sẽ gọi một API để kiểm tra và áp dụng mã này
            // Nếu mã thủ công hợp lệ, nó sẽ trở thành voucher duy nhất được áp dụng, bỏ qua radio.
            // Ví dụ:
            // const manualVoucher = await validateManualVoucherCode(manualVoucherCode.trim());
            // if (manualVoucher) {
            //     if (manualVoucher.VoucherType === 'FreeShip') appliedFreeShip = manualVoucher;
            //     else if (manualVoucher.VoucherType === 'SaleOff') appliedSaleOff = manualVoucher;
            //     // Handle other types if any
            // } else {
            //     showNotification("Mã voucher thủ công không hợp lệ.", 'error');
            //     return;
            // }
        }

        // Nếu có ít nhất một voucher hợp lệ được chọn
        if (appliedFreeShip || appliedSaleOff) {
            onApplyVouchers({ freeShipVoucher: appliedFreeShip, saleOffVoucher: appliedSaleOff });
            onClose();
            let successMessage = "Đã áp dụng các voucher:";
            if (appliedFreeShip) successMessage += ` ${appliedFreeShip.Code}`;
            if (appliedSaleOff) successMessage += ` ${appliedSaleOff.Code}`;
            showNotification(successMessage, 'success');
        } else if (!hasInvalidSelection) {
            // Nếu không có voucher nào được chọn VÀ không có lỗi từ lựa chọn trước đó
            onApplyVouchers(null); // Gửi null để xóa voucher đã áp dụng
            onClose();
            showNotification("Đã hủy bỏ áp dụng voucher.", 'info');
        }
        // Nếu có hasInvalidSelection, showNotification đã được gọi ở trên.
    };

    if (!isOpen) return null;

    // Lọc ra các voucher để hiển thị trong modal này (chỉ platform vouchers)
    const freeShipPlatformVouchers = platformVouchers.filter(v => v.VoucherType === 'FreeShip');
    const saleOffPlatformVouchers = platformVouchers.filter(v => v.VoucherType === 'SaleOff');


    return (
        <div className="fixed inset-0 flex mt-[100px] items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg mx-4 relative flex flex-col max-h-[80vh] overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center pb-4 border-b">
                    <h2 className="text-xl font-bold text-black">Chọn Mã Giảm Giá</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                        <XCircle className="h-6 w-6" />
                    </button>
                </div>

                {/* Manual Voucher Input */}
                <div className="my-4">
                    <div className="flex items-center space-x-2">
                        <input
                            type="text"
                            placeholder="Nhập mã voucher"
                            value={manualVoucherCode}
                            onChange={handleManualCodeChange}
                            className="flex-grow p-2 border text-black rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md font-semibold hover:bg-gray-300 transition"
                            onClick={handleApplyButtonClick} // Chỉ cần gọi hàm này
                        >
                            Áp dụng
                        </button>
                    </div>
                </div>

                {/* Voucher List Sections */}
                <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
                    {loading ? (
                        <div className="flex justify-center items-center h-full">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                        </div>
                    ) : error ? (
                        <p className="text-red-500 text-center">{error}</p>
                    ) : (
                        <div className="space-y-6">
                            {/* FreeShip Vouchers (Platform only) */}
                            <VoucherSection
                                title="Mã Miễn Phí Vận Chuyển"
                                icon={Truck}
                                vouchers={freeShipPlatformVouchers}
                                selectedVoucherId={selectedFreeShipVoucherId} // Truyền selected ID riêng cho FreeShip
                                handleSelectVoucher={(id) => handleSelectVoucherOfType('FreeShip', id)} // Gửi loại voucher và ID
                                isVoucherSelectable={isVoucherSelectable}
                                getVoucherEligibilityText={getVoucherEligibilityText}
                                formatDiscount={formatDiscount}
                                currentCartTotal={currentCartTotal}
                                radioGroupName="free_ship_vouchers" // Tên nhóm radio riêng cho FreeShip
                            />

                            {/* SaleOff Vouchers (Platform only) */}
                            <VoucherSection
                                title="Mã Giảm Giá Toàn Sàn"
                                icon={DollarSign}
                                vouchers={saleOffPlatformVouchers}
                                selectedVoucherId={selectedSaleOffVoucherId} // Truyền selected ID riêng cho SaleOff
                                handleSelectVoucher={(id) => handleSelectVoucherOfType('SaleOff', id)} // Gửi loại voucher và ID
                                isVoucherSelectable={isVoucherSelectable}
                                getVoucherEligibilityText={getVoucherEligibilityText}
                                formatDiscount={formatDiscount}
                                currentCartTotal={currentCartTotal}
                                radioGroupName="sale_off_vouchers" // Tên nhóm radio riêng cho SaleOff
                            />

                            {/* Placeholder for Shop Vouchers (if any are available but not displayed here) */}
                            {/* {shopVouchers.length > 0 && (
                                <p className="text-gray-600 text-center text-sm py-4">
                                    Bạn có {shopVouchers.length} voucher của shop. Vui lòng sử dụng tại modal chọn voucher của shop.
                                </p>
                            )} */}
                        </div>
                    )}
                </div>

                {/* Footer Buttons */}
                <div className="flex-shrink-0 flex justify-end space-x-3 pt-4 border-t mt-4">
                    <button
                        onClick={() => { onApplyVouchers(null); onClose(); showNotification("Đã hủy bỏ áp dụng voucher.", 'info'); }}
                        className="px-6 py-3 bg-gray-200 text-gray-800 rounded-md font-semibold hover:bg-gray-300 transition-colors"
                    >
                        TRỞ LẠI
                    </button>
                    <button
                        onClick={handleApplyButtonClick}
                        className="px-6 py-3 bg-red-500 text-white rounded-md font-semibold hover:bg-red-600 transition-colors"
                    >
                        ÁP DỤNG
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VoucherSelectModal;


// Sub-component for rendering voucher sections (e.g., FreeShip, SaleOff)
interface VoucherSectionProps {
    title: string;
    icon: React.ElementType;
    vouchers: Voucher[];
    selectedVoucherId: number | null; // ID của voucher được chọn trong section này
    handleSelectVoucher: (id: number) => void; // Hàm để báo ID được chọn lên parent
    isVoucherSelectable: (voucher: Voucher) => boolean;
    getVoucherEligibilityText: (voucher: Voucher) => string;
    formatDiscount: (voucher: Voucher) => string;
    currentCartTotal: number;
    radioGroupName: string; // NEW: Tên nhóm radio cho section này
}

const VoucherSection: React.FC<VoucherSectionProps> = ({
    title,
    icon: Icon,
    vouchers,
    selectedVoucherId,
    handleSelectVoucher,
    isVoucherSelectable,
    getVoucherEligibilityText,
    formatDiscount,
    currentCartTotal,
    radioGroupName // Nhận tên nhóm radio
}) => {
    // Chỉ hiển thị phần này nếu có voucher để render
    if (vouchers.length === 0) {
        return null; // Không render gì nếu không có voucher nào phù hợp trong phần này
    }

    return (
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <h3 className="font-semibold text-lg text-gray-800 flex items-center mb-2">
                <Icon className="h-5 w-5 mr-2 text-blue-500" /> {title}
            </h3>
            <div className="space-y-3">
                {vouchers.map(voucher => {
                    const selectable = isVoucherSelectable(voucher);
                    const isSelected = selectedVoucherId === voucher.VoucherID;

                    return (
                        <div
                            key={voucher.VoucherID}
                            className={`flex items-center space-x-3 p-3 border rounded-md transition cursor-pointer
                                ${selectable ? 'hover:border-blue-500' : 'opacity-50 cursor-not-allowed'}
                                ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
                            `}
                            onClick={() => selectable && handleSelectVoucher(voucher.VoucherID)}
                        >
                            <input
                                type="radio"
                                name={radioGroupName} // Sử dụng tên nhóm radio từ prop
                                id={`voucher-${voucher.VoucherID}`}
                                value={voucher.VoucherID}
                                checked={isSelected}
                                onChange={() => handleSelectVoucher(voucher.VoucherID)}
                                disabled={!selectable}
                                className="form-radio h-4 w-4 text-blue-600"
                            />
                            <label htmlFor={`voucher-${voucher.VoucherID}`} className={`flex-grow block cursor-pointer ${!selectable ? 'text-gray-500' : ''}`}>
                                <div className="flex flex-row justify-between">
                                    <div className="font-medium text-gray-800">{voucher.Code}</div>
                                    <div className={`text-xs ${selectable ? 'text-gray-500' : 'text-red-500'}`}>
                                        {getVoucherEligibilityText(voucher)}
                                    </div>
                                </div>
                                <div className="text-red-600 font-bold">{formatDiscount(voucher)}</div>
                                {voucher.MinOrderValue > 0 && (
                                    <div className="text-sm text-gray-600">Đơn tối thiểu: {voucher.MinOrderValue.toLocaleString('vi-VN')}₫</div>
                                )}
                               
                                {voucher.Scope === 'Shop' && voucher.shopName && (
                                    <div className="text-xs text-gray-700 flex items-center mt-1">
                                        <Store className="h-3 w-3 mr-1" /> Từ: {voucher.shopName}
                                    </div>
                                )}
                            </label>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};