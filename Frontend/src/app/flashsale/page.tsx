// "use client"
// import React, { useEffect, useState, useMemo, useCallback } from 'react';
// import Image from 'next/image'; // Giả sử bạn dùng Next.js cho Image component

// // Import Swiper React components
// import { Swiper, SwiperSlide } from 'swiper/react';
// // Import Swiper styles
// import 'swiper/css';
// import 'swiper/css/navigation';
// import 'swiper/css/pagination';
// import 'swiper/css/autoplay';

// // import required modules
// import { Navigation, Pagination, Autoplay } from 'swiper/modules';

// // --- INTERFACES (Khớp với JSON response của bạn) ---
// interface FlashSaleProduct {
//     FlashSaleID: number;
//     UserID: number;
//     UserName: string;
//     ProductID: number;
//     ProductName: string;
//     OriginalPrice: string;
//     Discount: string;
//     Quantity: number; // Tổng số lượng của sản phẩm trong flash sale này
//     StartTime: string;
//     EndTime: string;
//     ProductImage: string | null;
//     SoldQuantity?: number; // Nên có từ API để hiển thị chính xác
// }

// interface FlashSaleSlot {
//     slot_display_time: string;
//     slot_effective_start: string;
//     slot_effective_end: string;
//     status: string; // Status này sẽ được cập nhật ở client dựa trên currentTime
//     flash_sales: FlashSaleProduct[];
// }

// interface FlashSaleDate {
//     date: string;
//     slots_on_date: FlashSaleSlot[];
// }

// interface FlashSaleApiResponse {
//     initial_requested_date_or_today: string;
//     current_server_time_hcm: string;
//     daily_flash_sales_slots: FlashSaleDate[];
// }

// // --- Dữ liệu cho các tab chính (Giữ nguyên hoặc tùy chỉnh) ---
// const mainTabsData = [
//     { id: 'flashsale', label: 'FLASH SALE', subLabel: 'GIÁ SỐC', special: true },
//     { id: 'maylanh', label: 'MÁY LẠNH', subLabel: 'GIẢM SỐC', special: true },
//     { id: 'tulanh', label: 'TỦ LẠNH', subLabel: 'GIẢM LỚN', special: true },
//     { id: 'giadung', label: 'GIA DỤNG', subLabel: 'GIẢM ĐẾN 50%', special: true, discountPercent: 50 },
//     { id: 'quat', label: 'Quạt' },
//     // ... các tab khác
// ];

// export default function FlashSaleDMXModern() {
//     const [apiData, setApiData] = useState<FlashSaleApiResponse | null>(null);
//     const [loading, setLoading] = useState<boolean>(true);
//     const [error, setError] = useState<string | null>(null);
//     const [activeMainTab, setActiveMainTab] = useState(mainTabsData[0].id);
//     const [selectedSlot, setSelectedSlot] = useState<FlashSaleSlot | null>(null);
//     const [currentTime, setCurrentTime] = useState(new Date());
//     const [isUserSelection, setIsUserSelection] = useState(false);

//     // --- DATA FETCHING ---
//     useEffect(() => {
//         async function fetchFlashSaleData() {
//             setLoading(true);
//             setError(null);
//             try {
//                 const response = await fetch('http://localhost:8001/api/flash-sales/active');
//                 if (!response.ok) {
//                     throw new Error(`HTTP error! status: ${response.status}`);
//                 }
//                 const result: FlashSaleApiResponse = await response.json();
//                 setApiData(result);
//             } catch (err) {
//                 const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
//                 setError(`Failed to fetch data: ${errorMessage}`);
//                 console.error(err);
//             } finally {
//                 setLoading(false);
//             }
//         }
//         fetchFlashSaleData();

//         const timer = setInterval(() => {
//             setCurrentTime(new Date());
//         }, 1000);

//         return () => clearInterval(timer);
//     }, []);

//     // --- MEMOIZED SLOT CALCULATIONS ---
//     const allValidSlotsWithClientStatus = useMemo(() => {
//         if (!apiData) return [];
//         const nowMs = currentTime.getTime();
//         return apiData.daily_flash_sales_slots
//             .flatMap(dateEntry => dateEntry.slots_on_date.map(slot => {
//                 let clientStatus = 'Đã kết thúc';
//                 const startMs = new Date(slot.slot_effective_start).getTime();
//                 const endMs = new Date(slot.slot_effective_end).getTime();
//                 if (nowMs < startMs) clientStatus = 'Sắp diễn ra';
//                 else if (nowMs >= startMs && nowMs < endMs) clientStatus = 'Đang diễn ra';
//                 return { ...slot, status: clientStatus };
//             }))
//             .filter(slot => slot.status === 'Đang diễn ra' || slot.status === 'Sắp diễn ra')
//             .sort((a, b) => new Date(a.slot_effective_start).getTime() - new Date(b.slot_effective_start).getTime());
//     }, [apiData, currentTime]);

//     const activeSlotBasedOnTime = useMemo(() => {
//         return allValidSlotsWithClientStatus.find(slot => slot.status === 'Đang diễn ra');
//     }, [allValidSlotsWithClientStatus]);

//     // --- EFFECT FOR MANAGING SELECTED SLOT ---
//     // --- EFFECT FOR MANAGING SELECTED SLOT ---
//     useEffect(() => {
//         if (loading || !apiData) return;

//         // Nếu người dùng vừa chủ động chọn slot, useEffect này sẽ không can thiệp trong lần render này.
//         // Cờ isUserSelection sẽ được reset ở cuối useEffect này nếu nó được set.
//         if (isUserSelection) {
//             return; // Bỏ qua lần chạy này, đợi lần chạy tiếp theo khi isUserSelection là false
//         }

//         if (allValidSlotsWithClientStatus.length === 0) {
//             if (selectedSlot !== null) setSelectedSlot(null);
//             return;
//         }

//         const currentActiveSlotByTime = allValidSlotsWithClientStatus.find(slot => slot.status === 'Đang diễn ra');

//         if (currentActiveSlotByTime) {
//             // Có slot ĐANG DIỄN RA theo thời gian thực
//             if (!selectedSlot) {
//                 // 1. Tải lần đầu, chưa có selectedSlot -> Chọn active slot
//                 setSelectedSlot(currentActiveSlotByTime);
//             } else if (selectedSlot.slot_effective_start !== currentActiveSlotByTime.slot_effective_start &&
//                 selectedSlot.status !== 'Sắp diễn ra') {
//                 // 2. selectedSlot không phải là active slot hiện tại VÀ selectedSlot cũng không phải là slot "Sắp diễn ra"
//                 // (ví dụ: selectedSlot là một active slot cũ đã hết hạn) -> Chuyển sang active slot mới
//                 setSelectedSlot(currentActiveSlotByTime);
//             }
//             // Nếu selectedSlot là activeSlotByTime rồi, hoặc là một slot "Sắp diễn ra" do người dùng chọn, thì không làm gì.
//         } else {
//             // KHÔNG có slot nào ĐANG DIỄN RA theo thời gian thực
//             if (!selectedSlot) {
//                 // 3. Tải lần đầu, không có active slot -> Chọn slot "Sắp diễn ra" đầu tiên
//                 const firstProductive = allValidSlotsWithClientStatus.find(s => s.status === 'Sắp diễn ra' && s.flash_sales.length > 0);
//                 const firstAny = allValidSlotsWithClientStatus.find(s => s.status === 'Sắp diễn ra');
//                 setSelectedSlot(firstProductive || firstAny || null);
//             } else if (selectedSlot.status === 'Đang diễn ra') {
//                 // 4. selectedSlot hiện tại là "Đang diễn ra" (theo client status của lần render trước)
//                 // nhưng giờ không còn active slot nào -> nghĩa là nó vừa kết thúc
//                 // Tìm slot "Sắp diễn ra" tiếp theo
//                 const nextProductive = allValidSlotsWithClientStatus.find(s =>
//                     s.status === 'Sắp diễn ra' &&
//                     new Date(s.slot_effective_start) >= new Date(selectedSlot.slot_effective_end) &&
//                     s.flash_sales.length > 0
//                 );
//                 const anyNext = allValidSlotsWithClientStatus.find(s =>
//                     s.status === 'Sắp diễn ra' &&
//                     new Date(s.slot_effective_start) >= new Date(selectedSlot.slot_effective_end)
//                 );
//                 setSelectedSlot(nextProductive || anyNext || null);
//             }
//             // Nếu selectedSlot là một "Sắp diễn ra" và không có active slot, thì giữ nguyên.
//         }
//     }, [allValidSlotsWithClientStatus, loading, apiData]); // Bỏ isUserSelection, selectedSlot khỏi dependencies


//     // Effect để reset cờ isUserSelection sau mỗi lần render mà nó được set
//     // Điều này đảm bảo useEffect trên có thể hoạt động bình thường ở lần render tiếp theo
//     // sau khi người dùng đã chọn.
//     useEffect(() => {
//         if (isUserSelection) {
//             const timeoutId = setTimeout(() => setIsUserSelection(false), 0); // Reset ở cuối chu kỳ render hiện tại
//             return () => clearTimeout(timeoutId);
//         }
//     }, [isUserSelection]);

//     // --- HANDLERS ---
//     const handleSelectSlotByUser = useCallback((slot: FlashSaleSlot) => {
//         setSelectedSlot(slot);
//         setIsUserSelection(true);
//     }, []);

//     // --- UTILITY FUNCTIONS ---
//     const calculateTimeLeft = useCallback((targetTime: string, isStartTime: boolean = false) => {
//         const targetDate = new Date(targetTime);
//         const now = currentTime.getTime();
//         let difference = targetDate.getTime() - now;
//         let text = '', ended = false;

//         if (isStartTime) {
//             if (difference > 0) text = 'BẮT ĐẦU SAU';
//             else text = 'ĐANG DIỄN RA';
//         } else {
//             if (difference > 0) text = 'KẾT THÚC SAU';
//             else { text = 'ĐÃ KẾT THÚC'; ended = true; }
//         }
//         if (difference < 0) difference = 0;
//         return {
//             hours: Math.floor((difference / (1000 * 60 * 60)) % 24).toString().padStart(2, '0'),
//             minutes: Math.floor((difference / 1000 / 60) % 60).toString().padStart(2, '0'),
//             seconds: Math.floor((difference / 1000) % 60).toString().padStart(2, '0'),
//             ended, text
//         };
//     }, [currentTime]);

//     const formatPrice = (price: number | string) => {
//         const numericPrice = typeof price === 'string' ? parseFloat(price.replace(/,/g, '')) : price;
//         if (isNaN(numericPrice)) return 'N/A';
//         return new Intl.NumberFormat('vi-VN').format(numericPrice) + '₫';
//     };

//     const calculateSoldPercentage = (sold: number | undefined, total: number) => {
//         if (typeof sold === 'undefined' || total === 0) return 0;
//         return Math.min(100, Math.max(0, (sold / total) * 100));
//     };

//     // --- RENDER LOGIC ---
//     if (loading) return <div className="py-10 px-4 text-center">Đang tải dữ liệu Flash Sale...</div>;
//     if (error) return <div className="py-10 px-4 text-center text-red-500">{error}</div>;
//     if (!apiData || allValidSlotsWithClientStatus.length === 0 && activeMainTab === 'flashsale') {
//         return (
//             <div className="bg-gray-100 min-h-screen">
//                 <div className="container mx-auto px-2 py-5">
//                     <h1 className="text-2xl font-bold mb-3 text-gray-800">Khuyến mãi Online</h1>
//                     {/* Main Tabs */}
//                     <div className="flex items-center space-x-1 overflow-x-auto pb-2 mb-4 no-scrollbar">
//                         {mainTabsData.map(tab => (
//                             <button
//                                 key={tab.id}
//                                 onClick={() => setActiveMainTab(tab.id)}
//                                 className={`py-2 px-3 rounded-md whitespace-nowrap text-sm transition-all duration-200
//                                 ${tab.special ? 'font-semibold text-white' : 'text-gray-700 hover:bg-gray-200'}
//                                 ${activeMainTab === tab.id && tab.special ? (tab.id === 'giadung' ? 'bg-pink-600' : 'bg-red-500') :
//                                         !tab.special && activeMainTab === tab.id ? 'bg-gray-300 font-semibold' :
//                                             tab.special ? (tab.id === 'giadung' ? 'bg-pink-500 hover:bg-pink-600' : 'bg-orange-500 hover:bg-red-600') : 'bg-white'
//                                     }
//                             `}
//                             >
//                                 {tab.label}
//                                 {(tab as any).subLabel && <span className={`block text-xs ${tab.id === 'giadung' ? 'opacity-90' : 'opacity-75'}`}>{(tab as any).subLabel}</span>}
//                             </button>
//                         ))}
//                     </div>
//                     {activeMainTab === 'flashsale' && <div className="text-center py-10 text-gray-500">Không có chương trình Flash Sale nào.</div>}
//                     {activeMainTab !== 'flashsale' && (
//                         <div className="text-center py-10 text-gray-600">
//                             Nội dung cho tab "{mainTabsData.find(t => t.id === activeMainTab)?.label}" sẽ được hiển thị ở đây.
//                         </div>
//                     )}
//                 </div>
//             </div>
//         );
//     }


//     // Xác định slot để hiển thị thông tin (countdown, sản phẩm)
//     const displaySlot = selectedSlot || activeSlotBasedOnTime || allValidSlotsWithClientStatus[0];
//     let countdownDetails;
//     if (displaySlot) {
//         if (displaySlot.status === 'Đang diễn ra') {
//             countdownDetails = calculateTimeLeft(displaySlot.slot_effective_end, false);
//         } else if (displaySlot.status === 'Sắp diễn ra') {
//             countdownDetails = calculateTimeLeft(displaySlot.slot_effective_start, true);
//         } else {
//             countdownDetails = { hours: '00', minutes: '00', seconds: '00', ended: true, text: 'ĐÃ KẾT THÚC' };
//         }
//     }

//     // Lấy danh sách sản phẩm từ slot đang được hiển thị
//     const productsToDisplay = displaySlot?.flash_sales || [];

//     return (
//         <div className="bg-gray-100 min-h-screen">
//             <div className="container mx-auto px-2 py-5">
//                 <h1 className="text-2xl font-bold mb-3 text-gray-800">Khuyến mãi Online</h1>

//                 {/* Main Tabs */}
//                 <div className="flex items-center space-x-1 overflow-x-auto pb-2 mb-4 no-scrollbar">
//                     {mainTabsData.map(tab => (
//                         <button
//                             key={tab.id}
//                             onClick={() => setActiveMainTab(tab.id)}
//                             className={`py-2 px-3 rounded-md whitespace-nowrap text-sm transition-all duration-200
//                                 ${tab.special ? 'font-semibold text-white' : 'text-gray-700 hover:bg-gray-200'}
//                                 ${activeMainTab === tab.id && tab.special ? (tab.id === 'giadung' ? 'bg-pink-600' : 'bg-red-500') :
//                                     !tab.special && activeMainTab === tab.id ? 'bg-gray-300 font-semibold' :
//                                         tab.special ? (tab.id === 'giadung' ? 'bg-pink-500 hover:bg-pink-600' : 'bg-orange-500 hover:bg-red-600') : 'bg-white'
//                                 }
//                             `}
//                         >
//                             {tab.label}
//                             {(tab as any).subLabel && <span className={`block text-xs ${tab.id === 'giadung' ? 'opacity-90' : 'opacity-75'}`}>{(tab as any).subLabel}</span>}
//                         </button>
//                     ))}
//                 </div>

//                 {activeMainTab === 'flashsale' && (
//                     <>
//                         {/* Countdown and Time Slots */}
//                         <div className="flex flex-wrap items-center justify-start gap-2 mb-5">
//                             {displaySlot && countdownDetails && !countdownDetails.ended ? (
//                                 <div className="bg-blue-500 text-white rounded-lg px-4 py-2 flex items-center space-x-1.5 shadow">
//                                     <span className="font-medium text-sm">{countdownDetails.text.replace('ĐANG DIỄN RA', 'Chỉ còn').replace('BẮT ĐẦU SAU', 'Bắt đầu sau').replace('KẾT THÚC SAU', 'Kết thúc sau')}:</span>
//                                     <span className="font-bold text-lg bg-white text-blue-600 px-1.5 py-0.5 rounded text-center min-w-[30px]">{countdownDetails.hours}</span>
//                                     <span className="font-bold text-lg">:</span>
//                                     <span className="font-bold text-lg bg-white text-blue-600 px-1.5 py-0.5 rounded text-center min-w-[30px]">{countdownDetails.minutes}</span>
//                                     <span className="font-bold text-lg">:</span>
//                                     <span className="font-bold text-lg bg-white text-blue-600 px-1.5 py-0.5 rounded text-center min-w-[30px]">{countdownDetails.seconds}</span>
//                                 </div>
//                             ) : (
//                                 <div className="bg-gray-400 text-white rounded-lg px-4 py-2 flex items-center space-x-1.5 shadow">
//                                     <span className="font-medium text-sm">Slot đã kết thúc</span>
//                                 </div>
//                             )}
//                             {/* Time Slot Buttons from API */}
//                             {allValidSlotsWithClientStatus.map(slot => (
//                                 <button
//                                     key={slot.slot_effective_start} // Key duy nhất
//                                     onClick={() => handleSelectSlotByUser(slot)}
//                                     className={`px-4 py-2 rounded-lg text-sm transition-colors duration-200 shadow-sm
//                                         ${selectedSlot?.slot_effective_start === slot.slot_effective_start
//                                             ? 'bg-gray-200 text-gray-800 font-semibold ring-2 ring-blue-400'
//                                             : slot.status === 'Đang diễn ra'
//                                                 ? 'bg-red-100 text-red-700 hover:bg-red-200 animate-pulse'
//                                                 : 'bg-white text-gray-600 hover:bg-gray-50'
//                                         }
//                                         ${slot.flash_sales.length === 0 ? 'opacity-60' : ''}
//                                     `}
//                                     title={slot.status}
//                                 >
//                                     {slot.status === 'Đang diễn ra' && <span className="block text-xs text-red-500">ĐANG DIỄN RA</span>}
//                                     {slot.status === 'Sắp diễn ra' && <span className="block text-xs">Sắp diễn ra</span>}
//                                     <span className="font-bold text-base">{slot.slot_display_time}</span>
//                                 </button>
//                             ))}
//                         </div>

//                         {/* Products Swiper */}
//                         {productsToDisplay.length > 0 ? (
//                             <Swiper
//                                 modules={[Navigation, Pagination, Autoplay]}
//                                 spaceBetween={12}
//                                 slidesPerView={2}
//                                 navigation
//                                 autoplay={{ delay: 4000, disableOnInteraction: false }}
//                                 breakpoints={{
//                                     640: { slidesPerView: 2, spaceBetween: 12 },
//                                     768: { slidesPerView: 3, spaceBetween: 16 },
//                                     1024: { slidesPerView: 4, spaceBetween: 16 },
//                                     1280: { slidesPerView: 5, spaceBetween: 16 },
//                                     1536: { slidesPerView: 6, spaceBetween: 20 },
//                                 }}
//                                 className="pb-8"
//                             >
//                                 {productsToDisplay.map((product) => {
//                                     const originalPrice = parseFloat(product.OriginalPrice);
//                                     const discountAmount = parseFloat(product.Discount);
//                                     const finalPrice = originalPrice * (1 - discountAmount / 100);
//                                     // Mock SoldQuantity nếu API không có
//                                     const stockTotal = product.Quantity;
//                                     const stockSold = product.SoldQuantity ?? Math.floor(Math.random() * stockTotal * 0.7);


//                                     return (
//                                         <SwiperSlide key={`${product.FlashSaleID}-${product.ProductID}-${displaySlot?.slot_effective_start}`} className="h-full">
//                                             <div className="bg-white border border-gray-200 rounded-lg p-3 h-full flex flex-col shadow hover:shadow-lg transition-shadow">
//                                                 <div className="relative w-full h-[140px] mb-2">
//                                                     {/* Giả sử Image component của Next.js */}
//                                                     <Image
//                                                         src={product.ProductImage || "/placeholder-product.png"} // Cần có ảnh placeholder
//                                                         alt={product.ProductName}
//                                                         layout="fill"
//                                                         objectFit="contain"
//                                                         className="rounded"
//                                                         unoptimized={product.ProductImage?.startsWith('http')} // Nếu ảnh từ nguồn ngoài
//                                                     />
//                                                     <div className="absolute top-1 left-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-sm font-semibold z-10">
//                                                         -{product.Discount}%
//                                                     </div>
//                                                 </div>
//                                                 <h3 className="text-xs font-medium text-gray-800 mb-1 h-8 leading-tight overflow-hidden line-clamp-2">
//                                                     {product.ProductName}
//                                                 </h3>
//                                                 <div className="mt-auto">
//                                                     <div className="mb-1">
//                                                         <span className="text-red-600 font-bold text-base mr-1.5">
//                                                             {formatPrice(finalPrice)}
//                                                         </span>
//                                                         <div className="flex items-center">
//                                                             <span className="text-gray-500 line-through text-[11px]">
//                                                                 {formatPrice(originalPrice)}
//                                                             </span>
//                                                         </div>
//                                                     </div>
//                                                     {stockTotal > 0 && ( // Chỉ hiển thị nếu có tổng số lượng
//                                                         <div className="w-full bg-gray-200 rounded-full h-1.5 my-1.5">
//                                                             <div
//                                                                 className="bg-gradient-to-r from-orange-400 to-red-500 h-1.5 rounded-full text-center"
//                                                                 style={{ width: `${calculateSoldPercentage(stockSold, stockTotal)}%` }}
//                                                             ></div>
//                                                         </div>
//                                                     )}
//                                                     <div className="text-xs text-gray-500 mb-1.5">
//                                                         {stockSold < stockTotal ? `Đã bán ${stockSold}` : 'Hết hàng'}
//                                                     </div>

//                                                     {displaySlot && displaySlot.status === 'Đang diễn ra' ? (
//                                                         <button className="w-full bg-sky-500 text-white py-1.5 rounded-md mt-1 hover:bg-sky-600 transition-colors duration-200 font-semibold text-sm">
//                                                             Mua ngay
//                                                         </button>
//                                                     ) : (
//                                                         <button className="w-full bg-gray-300 text-gray-500 py-1.5 rounded-md mt-1 cursor-not-allowed font-semibold text-sm">
//                                                             Sắp mở bán
//                                                         </button>
//                                                     )}
//                                                 </div>
//                                             </div>
//                                         </SwiperSlide>
//                                     );
//                                 })}
//                             </Swiper>
//                         ) : (
//                             !loading && <div className="text-center py-10 text-gray-500">
//                                 {displaySlot ? "Không có sản phẩm nào trong khung giờ này." : "Vui lòng chọn một khung giờ Flash Sale."}
//                             </div>
//                         )}
//                     </>
//                 )}
//                 {activeMainTab !== 'flashsale' && (
//                     <div className="text-center py-10 text-gray-600">
//                         Nội dung cho tab "{mainTabsData.find(t => t.id === activeMainTab)?.label}" sẽ được hiển thị ở đây.
//                     </div>
//                 )}
//             </div>
//             <style jsx global>{`
//                 .swiper-button-next, .swiper-button-prev {
//                     color: #1f2937; background-color: rgba(255, 255, 255, 0.8);
//                     border-radius: 50%; width: 32px !important; height: 32px !important;
//                     top: 45% !important; /* Điều chỉnh vị trí để không che sản phẩm quá nhiều */
//                 }
//                 .swiper-button-next::after, .swiper-button-prev::after { font-size: 14px !important; }
//                 .swiper-button-next { right: 0px !important; }
//                 .swiper-button-prev { left: 0px !important; }
//                 .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
//                 .no-scrollbar::-webkit-scrollbar { display: none; }
//                 .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
//             `}</style>
//         </div>
//     );
// }
"use client";

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import Image from 'next/image';

import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

// --- INTERFACES ---
interface FlashSaleProduct {
    FlashSaleID: number;
    UserID?: number; // Optional từ JSON của bạn
    UserName?: string; // Optional từ JSON của bạn
    ProductID: number;
    ProductName: string;
    OriginalPrice: string;
    Discount: string;
    Quantity: number;
    StartTime: string;
    EndTime: string;
    ProductImage: string | null;
    SoldQuantity?: number; // Dữ liệu thực tế từ API là tốt nhất
    // Thêm trường để mock ổn định nếu API không có SoldQuantity
    mockedSoldQuantity?: number;
}

interface FlashSaleSlot {
    slot_display_time: string;
    slot_effective_start: string;
    slot_effective_end: string;
    status: string;
    flash_sales: FlashSaleProduct[];
}

interface FlashSaleDate {
    date: string;
    slots_on_date: FlashSaleSlot[];
}

interface FlashSaleApiResponse {
    initial_requested_date_or_today: string;
    current_server_time_hcm: string;
    daily_flash_sales_slots: FlashSaleDate[];
}

const mainTabsData = [
    { id: 'flashsale', label: 'FLASH SALE', subLabel: 'GIÁ SỐC', special: true },
    { id: 'maylanh', label: 'MÁY LẠNH', subLabel: 'GIẢM SỐC', special: true },
    { id: 'tulanh', label: 'TỦ LẠNH', subLabel: 'GIẢM LỚN', special: true },
];

const FlashSalesPage: React.FC = () => {
    const [apiData, setApiData] = useState<FlashSaleApiResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [activeMainTab, setActiveMainTab] = useState(mainTabsData[0].id);
    const [selectedSlot, setSelectedSlot] = useState<FlashSaleSlot | null>(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isUserSelection, setIsUserSelection] = useState(false);

    useEffect(() => {
        async function fetchFlashSaleData() {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch('http://localhost:8001/api/flash-sales/active');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const result: FlashSaleApiResponse = await response.json();
                setApiData(result);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
                setError(`Failed to fetch data: ${errorMessage}`);
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchFlashSaleData();
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const allValidSlotsWithClientStatus = useMemo(() => {
        if (!apiData) return [];
        const nowMs = currentTime.getTime();
        return apiData.daily_flash_sales_slots
            .flatMap(dateEntry => dateEntry.slots_on_date.map(slot => {
                let clientStatus = 'Đã kết thúc';
                const startMs = new Date(slot.slot_effective_start).getTime();
                const endMs = new Date(slot.slot_effective_end).getTime();
                if (nowMs < startMs) clientStatus = 'Sắp diễn ra';
                else if (nowMs >= startMs && nowMs < endMs) clientStatus = 'Đang diễn ra';
                return { ...slot, status: clientStatus };
            }))
            .filter(slot => slot.status === 'Đang diễn ra' || slot.status === 'Sắp diễn ra')
            .sort((a, b) => new Date(a.slot_effective_start).getTime() - new Date(b.slot_effective_start).getTime());
    }, [apiData, currentTime]);

    const activeSlotBasedOnTime = useMemo(() => {
        return allValidSlotsWithClientStatus.find(slot => slot.status === 'Đang diễn ra');
    }, [allValidSlotsWithClientStatus]);

    useEffect(() => {
        if (loading || !apiData) return;

        if (isUserSelection) {
            // setIsUserSelection(false) sẽ được gọi trong một useEffect riêng để đảm bảo nó chạy sau render này
            return;
        }

        if (allValidSlotsWithClientStatus.length === 0) {
            if (selectedSlot !== null) setSelectedSlot(null);
            return;
        }

        if (activeSlotBasedOnTime) {
            if (!selectedSlot ||
                (selectedSlot.slot_effective_start !== activeSlotBasedOnTime.slot_effective_start &&
                    (selectedSlot.status !== 'Sắp diễn ra' || currentTime.getTime() >= new Date(selectedSlot.slot_effective_start).getTime())
                )
            ) {
                setSelectedSlot(activeSlotBasedOnTime);
            }
        } else {
            if (!selectedSlot) {
                const firstProductive = allValidSlotsWithClientStatus.find(s => s.status === 'Sắp diễn ra' && s.flash_sales.length > 0);
                const firstAny = allValidSlotsWithClientStatus.find(s => s.status === 'Sắp diễn ra');
                setSelectedSlot(firstProductive || firstAny || null);
            } else if (selectedSlot.status === 'Đang diễn ra') { // Status "Đang diễn ra" này là từ lần render trước, giờ nó đã kết thúc
                const nextProductive = allValidSlotsWithClientStatus.find(s =>
                    s.status === 'Sắp diễn ra' &&
                    new Date(s.slot_effective_start) >= new Date(selectedSlot.slot_effective_end) &&
                    s.flash_sales.length > 0
                );
                const anyNext = allValidSlotsWithClientStatus.find(s =>
                    s.status === 'Sắp diễn ra' &&
                    new Date(s.slot_effective_start) >= new Date(selectedSlot.slot_effective_end)
                );
                setSelectedSlot(nextProductive || anyNext || null);
            }
        }
    }, [allValidSlotsWithClientStatus, activeSlotBasedOnTime, loading, apiData, currentTime]); // currentTime cần thiết ở đây

    useEffect(() => {
        if (isUserSelection) {
            const timeoutId = setTimeout(() => setIsUserSelection(false), 0);
            return () => clearTimeout(timeoutId);
        }
    }, [isUserSelection]);


    const handleSelectSlotByUser = useCallback((slot: FlashSaleSlot) => {
        setSelectedSlot(slot);
        setIsUserSelection(true);
    }, []);

    const productsToDisplayWithStableMockSold = useMemo(() => {
        if (!selectedSlot || !selectedSlot.flash_sales) return [];
        return selectedSlot.flash_sales.map(p => ({
            ...p,
            mockedSoldQuantity: p.SoldQuantity ?? Math.floor(((p.ProductID + p.FlashSaleID) % 70 + 10) / 100 * p.Quantity) // Logic mock ổn định hơn
        }));
    }, [selectedSlot]);


    const calculateTimeLeft = useCallback((targetTime: string, isStartTime: boolean = false) => {
        const targetDate = new Date(targetTime);
        const now = currentTime.getTime();
        let difference = targetDate.getTime() - now;
        let text = '', ended = false;

        if (isStartTime) {
            if (difference > 0) text = 'BẮT ĐẦU SAU';
            else text = 'ĐANG DIỄN RA';
        } else {
            if (difference > 0) text = 'KẾT THÚC SAU';
            else { text = 'ĐÃ KẾT THÚC'; ended = true; }
        }
        if (difference < 0) difference = 0;
        return {
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24).toString().padStart(2, '0'),
            minutes: Math.floor((difference / 1000 / 60) % 60).toString().padStart(2, '0'),
            seconds: Math.floor((difference / 1000) % 60).toString().padStart(2, '0'),
            ended, text
        };
    }, [currentTime]);

    const formatPrice = (price: number | string) => {
        const numericPrice = typeof price === 'string' ? parseFloat(price.replace(/,/g, '')) : price;
        if (isNaN(numericPrice)) return 'N/A';
        return new Intl.NumberFormat('vi-VN').format(numericPrice) + '₫';
    };

    const calculateSoldPercentage = (sold: number | undefined, total: number) => {
        if (typeof sold === 'undefined' || total === 0) return 0;
        return Math.min(100, Math.max(0, (sold / total) * 100));
    };

    if (loading) return <div className="py-10 px-4 text-center">Đang tải dữ liệu Flash Sale...</div>;
    if (error) return <div className="py-10 px-4 text-center text-red-500">{error}</div>;
    if (!apiData || (allValidSlotsWithClientStatus.length === 0 && activeMainTab === 'flashsale')) {
        return (
            <div className="bg-gray-100 min-h-screen">
                <div className="container mx-auto px-2 py-5">
                    <h1 className="text-2xl font-bold mb-3 text-gray-800">Khuyến mãi Online</h1>
                    <div className="flex items-center space-x-1 overflow-x-auto pb-2 mb-4 no-scrollbar">
                        {mainTabsData.map(tab => (
                            <button key={tab.id} onClick={() => setActiveMainTab(tab.id)}
                                className={`py-2 px-3 rounded-md whitespace-nowrap text-sm transition-all duration-200 ${tab.special ? 'font-semibold text-white' : 'text-gray-700 hover:bg-gray-200'} ${activeMainTab === tab.id && tab.special ? (tab.id === 'giadung' ? 'bg-pink-600' : 'bg-red-500') : !tab.special && activeMainTab === tab.id ? 'bg-gray-300 font-semibold' : tab.special ? (tab.id === 'giadung' ? 'bg-pink-500 hover:bg-pink-600' : 'bg-orange-500 hover:bg-red-600') : 'bg-white'}`}>
                                {tab.label}
                                {(tab as any).subLabel && <span className={`block text-xs ${tab.id === 'giadung' ? 'opacity-90' : 'opacity-75'}`}>{(tab as any).subLabel}</span>}
                            </button>
                        ))}
                    </div>
                    {activeMainTab === 'flashsale' && <div className="text-center py-10 text-gray-500">Không có chương trình Flash Sale nào.</div>}
                    {activeMainTab !== 'flashsale' && <div className="text-center py-10 text-gray-600">Nội dung cho tab "{mainTabsData.find(t => t.id === activeMainTab)?.label}" ở đây.</div>}
                </div>
            </div>
        );
    }

    const displaySlot = selectedSlot || activeSlotBasedOnTime || allValidSlotsWithClientStatus[0];
    let countdownDetails;
    if (displaySlot) {
        if (displaySlot.status === 'Đang diễn ra') {
            countdownDetails = calculateTimeLeft(displaySlot.slot_effective_end, false);
        } else if (displaySlot.status === 'Sắp diễn ra') {
            countdownDetails = calculateTimeLeft(displaySlot.slot_effective_start, true);
        } else {
            countdownDetails = { hours: '00', minutes: '00', seconds: '00', ended: true, text: 'ĐÃ KẾT THÚC' };
        }
    }


    return (
        <div className="bg-gray-100 min-h-screen">
            <div className="container mx-auto px-2 py-5">
                <h1 className="text-2xl font-bold mb-3 text-gray-800">Khuyến mãi Online</h1>
                <div className="flex items-center space-x-1 overflow-x-auto pb-2 mb-4 no-scrollbar">
                    {mainTabsData.map(tab => (
                        <button key={tab.id} onClick={() => setActiveMainTab(tab.id)}
                            className={`py-2 px-3 rounded-md whitespace-nowrap text-sm transition-all duration-200 ${tab.special ? 'font-semibold text-white' : 'text-gray-700 hover:bg-gray-200'} ${activeMainTab === tab.id && tab.special ? (tab.id === 'giadung' ? 'bg-pink-600' : 'bg-red-500') : !tab.special && activeMainTab === tab.id ? 'bg-gray-300 font-semibold' : tab.special ? (tab.id === 'giadung' ? 'bg-pink-500 hover:bg-pink-600' : 'bg-orange-500 hover:bg-red-600') : 'bg-white'}`}>
                            {tab.label}
                            {(tab as any).subLabel && <span className={`block text-xs ${tab.id === 'giadung' ? 'opacity-90' : 'opacity-75'}`}>{(tab as any).subLabel}</span>}
                        </button>
                    ))}
                </div>

                {activeMainTab === 'flashsale' && (
                    <>
                        <div className="flex flex-wrap items-center justify-start gap-2 mb-5">
                            {displaySlot && countdownDetails && !countdownDetails.ended ? (
                                <div className="bg-blue-500 text-white rounded-lg px-4 py-2 flex items-center space-x-1.5 shadow">
                                    <span className="font-medium text-sm">{countdownDetails.text.replace('ĐANG DIỄN RA', 'Chỉ còn').replace('KẾT THÚC SAU', 'Kết thúc sau')}:</span>
                                    <span className="font-bold text-lg bg-white text-blue-600 px-1.5 py-0.5 rounded text-center min-w-[30px]">{countdownDetails.hours}</span>:
                                    <span className="font-bold text-lg bg-white text-blue-600 px-1.5 py-0.5 rounded text-center min-w-[30px]">{countdownDetails.minutes}</span>:
                                    <span className="font-bold text-lg bg-white text-blue-600 px-1.5 py-0.5 rounded text-center min-w-[30px]">{countdownDetails.seconds}</span>
                                </div>
                            ) : (
                                <div className="bg-gray-400 text-white rounded-lg px-4 py-2 flex items-center space-x-1.5 shadow">
                                    <span className="font-medium text-sm">{displaySlot ? `Slot ${displaySlot.slot_display_time} đã kết thúc` : 'Không có slot'}</span>
                                </div>
                            )}
                            {allValidSlotsWithClientStatus.map(slot => (
                                <button
                                    key={slot.slot_effective_start}
                                    onClick={() => handleSelectSlotByUser(slot)}
                                    className={`px-4 py-2 rounded-lg text-sm transition-colors duration-200 shadow-sm
                                        ${selectedSlot?.slot_effective_start === slot.slot_effective_start
                                            ? 'bg-gray-200 text-gray-800 font-semibold ring-2 ring-blue-400'
                                            : slot.status === 'Đang diễn ra'
                                                ? 'bg-red-100 text-red-700 hover:bg-red-200 animate-pulse'
                                                : 'bg-white text-gray-600 hover:bg-gray-50'
                                        }
                                        ${slot.flash_sales.length === 0 ? 'opacity-60 cursor-not-allowed' : ''}
                                    `}
                                    title={slot.status}
                                    disabled={slot.flash_sales.length === 0 && selectedSlot?.slot_effective_start !== slot.slot_effective_start}
                                >
                                    {slot.status === 'Đang diễn ra' && <span className="block text-xs text-red-500">ĐANG DIỄN RA</span>}
                                    {slot.status === 'Sắp diễn ra' && <span className="block text-xs">Sắp diễn ra</span>}
                                    <span className="font-bold text-base">{slot.slot_display_time}</span>
                                </button>
                            ))}
                        </div>

                        {productsToDisplayWithStableMockSold.length > 0 && displaySlot ? (
                            <Swiper
                                modules={[Navigation, Pagination, Autoplay]}
                                spaceBetween={12} slidesPerView={2} navigation
                                autoplay={{ delay: 4000, disableOnInteraction: false }}
                                breakpoints={{
                                    640: { slidesPerView: 2, spaceBetween: 12 },
                                    768: { slidesPerView: 3, spaceBetween: 16 },
                                    1024: { slidesPerView: 4, spaceBetween: 16 },
                                    1280: { slidesPerView: 5, spaceBetween: 16 },
                                    1536: { slidesPerView: 6, spaceBetween: 20 },
                                }}
                                className="pb-8"
                            >
                                {productsToDisplayWithStableMockSold.map((product) => {
                                    const originalPrice = parseFloat(product.OriginalPrice);
                                    const discountAmount = parseFloat(product.Discount);
                                    const finalPrice = originalPrice * (1 - discountAmount / 100);
                                    const stockTotal = product.Quantity;
                                    const stockSold = product.mockedSoldQuantity!; // Đã mock ở trên

                                    return (
                                        <SwiperSlide key={`${product.FlashSaleID}-${product.ProductID}-${displaySlot.slot_effective_start}`} className="h-full">
                                            <div className="bg-white border border-gray-200 rounded-lg p-3 h-full flex flex-col shadow hover:shadow-lg transition-shadow">
                                                <div className="relative w-full h-[140px] mb-2">
                                                    <Image
                                                        src={product.ProductImage || "/placeholder-product.png"}
                                                        alt={product.ProductName}
                                                        layout="fill" objectFit="contain" className="rounded"
                                                        unoptimized={product.ProductImage?.startsWith('http')}
                                                    />
                                                    <div className="absolute top-1 left-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-sm font-semibold z-10">
                                                        -{product.Discount}%
                                                    </div>
                                                </div>
                                                <h3 className="text-xs font-medium text-gray-800 mb-1 h-8 leading-tight overflow-hidden line-clamp-2">
                                                    {product.ProductName}
                                                </h3>
                                                <div className="mt-auto">
                                                    <div className="mb-1">
                                                        <span className="text-red-600 font-bold text-base mr-1.5">
                                                            {formatPrice(finalPrice)}
                                                        </span>
                                                        <div className="flex items-center">
                                                            <span className="text-gray-500 line-through text-[11px]">
                                                                {formatPrice(originalPrice)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {stockTotal > 0 && (
                                                        <div className="w-full bg-gray-200 rounded-full h-1.5 my-1.5">
                                                            <div
                                                                className="bg-gradient-to-r from-orange-400 to-red-500 h-1.5 rounded-full text-center"
                                                                style={{ width: `${calculateSoldPercentage(stockSold, stockTotal)}%` }}
                                                            ></div>
                                                        </div>
                                                    )}
                                                    <div className="text-xs text-gray-500 mb-1.5">
                                                        {stockSold < stockTotal ? `Đã bán ${stockSold}` : 'Hết hàng'}
                                                    </div>
                                                    {displaySlot.status === 'Đang diễn ra' ? (
                                                        <button className="w-full bg-sky-500 text-white py-1.5 rounded-md mt-1 hover:bg-sky-600 transition-colors duration-200 font-semibold text-sm">
                                                            Mua ngay
                                                        </button>
                                                    ) : (
                                                        <button className="w-full bg-gray-300 text-gray-500 py-1.5 rounded-md mt-1 cursor-not-allowed font-semibold text-sm">
                                                            Sắp mở bán
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </SwiperSlide>
                                    );
                                })}
                            </Swiper>
                        ) : (
                            !loading && <div className="text-center py-10 text-gray-500">
                                {displaySlot ? "Không có sản phẩm nào trong khung giờ này." : "Vui lòng chọn một khung giờ Flash Sale."}
                            </div>
                        )}
                    </>
                )}
                {activeMainTab !== 'flashsale' && (
                    <div className="text-center py-10 text-gray-600">
                        Nội dung cho tab "{mainTabsData.find(t => t.id === activeMainTab)?.label}" sẽ được hiển thị ở đây.
                    </div>
                )}
            </div>
            <style jsx global>{`
                .swiper-button-next, .swiper-button-prev { color: #1f2937; background-color: rgba(255, 255, 255, 0.8); border-radius: 50%; width: 32px !important; height: 32px !important; top: 45% !important; }
                .swiper-button-next::after, .swiper-button-prev::after { font-size: 14px !important; }
                .swiper-button-next { right: 0px !important; } .swiper-button-prev { left: 0px !important; }
                .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
                .no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
};

export default FlashSalesPage;