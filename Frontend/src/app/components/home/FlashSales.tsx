// "use client";

// import React, { useEffect, useState, useMemo, useCallback } from 'react';
// import Image from 'next/image';
// import Link from 'next/link';

// import { Swiper, SwiperSlide } from 'swiper/react';
// import 'swiper/css';
// import 'swiper/css/navigation';
// import 'swiper/css/autoplay';
// import { Navigation, Autoplay } from 'swiper/modules';
// import type { IHome } from '@/types/Ihome';

// // --- BƯỚC 1: CẬP NHẬT INTERFACE ĐỂ CHẤP NHẬN NULL ---



// const FlashSaleSection: React.FC = () => {
//     // --- State và Logic (Giữ nguyên) ---
//     const [apiData, setApiData] = useState<IHome.FlashSaleApiResponse | null>(null);
//     const [loading, setLoading] = useState<boolean>(true);
//     const [error, setError] = useState<string | null>(null);
//     const [selectedSlot, setSelectedSlot] = useState<IHome.FlashSaleSlot | null>(null);
//     const [currentTime, setCurrentTime] = useState(new Date());
//     const [isUserSelection, setIsUserSelection] = useState(false);

//     useEffect(() => {
//         async function fetchFlashSaleData() {
//             setLoading(true);
//             setError(null);
//             try {
//                 const response = await fetch('http://localhost/api/flash-sales/active');
//                 if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
//                 const result: IHome.FlashSaleApiResponse = await response.json();
//                 setApiData(result);
//             } catch (err) {
//                 const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
//                 setError(`Lỗi tải dữ liệu Flash Sale: ${errorMessage}`);
//             } finally {
//                 setLoading(false);
//             }
//         }
//         fetchFlashSaleData();
//         const timer = setInterval(() => setCurrentTime(new Date()), 1000);
//         return () => clearInterval(timer);
//     }, []);

//     const allValidSlotsWithClientStatus = useMemo(() => {
//         if (!apiData) return [];
//         const nowMs = currentTime.getTime();
//         return apiData.daily_flash_sales_slots.flatMap(dateEntry => dateEntry.slots_on_date.map(slot => {
//             let clientStatus = 'Đã kết thúc';
//             const startMs = new Date(slot.slot_effective_start).getTime();
//             const endMs = new Date(slot.slot_effective_end).getTime();
//             if (nowMs < startMs) clientStatus = 'Sắp diễn ra';
//             else if (nowMs >= startMs && nowMs < endMs) clientStatus = 'Đang diễn ra';
//             return { ...slot, status: clientStatus };
//         })).filter(slot => slot.status === 'Đang diễn ra' || slot.status === 'Sắp diễn ra').sort((a, b) => new Date(a.slot_effective_start).getTime() - new Date(b.slot_effective_start).getTime());
//     }, [apiData, currentTime]);

//     const activeSlotBasedOnTime = useMemo(() => allValidSlotsWithClientStatus.find(slot => slot.status === 'Đang diễn ra'), [allValidSlotsWithClientStatus]);

//     useEffect(() => {
//         if (loading || isUserSelection || !allValidSlotsWithClientStatus.length) return;
//         if (activeSlotBasedOnTime) {
//             if (!selectedSlot || selectedSlot.slot_effective_start !== activeSlotBasedOnTime.slot_effective_start) {
//                 setSelectedSlot(activeSlotBasedOnTime);
//             }
//         } else if (!selectedSlot || selectedSlot.status !== 'Sắp diễn ra') {
//             const nextSlot = allValidSlotsWithClientStatus.find(s => s.status === 'Sắp diễn ra' && s.flash_sales.length > 0) || allValidSlotsWithClientStatus.find(s => s.status === 'Sắp diễn ra');
//             setSelectedSlot(nextSlot || null);
//         }
//     }, [allValidSlotsWithClientStatus, activeSlotBasedOnTime, loading, selectedSlot, isUserSelection]);

//     useEffect(() => {
//         if (isUserSelection) {
//             const timeoutId = setTimeout(() => setIsUserSelection(false), 5000);
//             return () => clearTimeout(timeoutId);
//         }
//     }, [isUserSelection]);

//     const handleSelectSlotByUser = useCallback((slot: IHome.FlashSaleSlot) => {
//         setSelectedSlot(slot);
//         setIsUserSelection(true);
//     }, []);

//     const productsToDisplay = useMemo(() => selectedSlot?.flash_sales.map(p => ({
//         ...p,
//         mockedSoldQuantity: p.SoldQuantity ?? Math.floor(((p.ProductID + p.FlashSaleID) % 80 + 10) / 100 * p.Quantity)
//     })) || [], [selectedSlot]);

//     const calculateTimeLeft = useCallback((targetTime: string) => {
//         const difference = new Date(targetTime).getTime() - currentTime.getTime();
//         if (difference <= 0) return { hours: '00', minutes: '00', seconds: '00', ended: true };
//         return {
//             hours: Math.floor((difference / (1000 * 60 * 60)) % 24).toString().padStart(2, '0'),
//             minutes: Math.floor((difference / 1000 / 60) % 60).toString().padStart(2, '0'),
//             seconds: Math.floor((difference / 1000) % 60).toString().padStart(2, '0'),
//             ended: false,
//         };
//     }, [currentTime]);

//     const formatPrice = (priceInput: string | number) => {
//         const numericPrice = typeof priceInput === 'string' ? parseFloat(priceInput) : priceInput;
//         if (isNaN(numericPrice)) return 'N/A';
//         return new Intl.NumberFormat('vi-VN').format(numericPrice) + '₫';
//     };

//     const calculateSoldPercentage = (sold: number | undefined, total: number) => {
//         if (typeof sold === 'undefined' || total <= 0) return 0;
//         return Math.min(100, (sold / total) * 100);
//     };

//     if (loading) return <div className="py-10 px-4 text-center text-gray-700">Đang tải Flash Sale...</div>;
//     if (error) return <div className="py-10 px-4 text-center text-red-500">{error}</div>;
//     if (!selectedSlot && !activeSlotBasedOnTime && allValidSlotsWithClientStatus.length === 0) return null;

//     const displaySlot = selectedSlot || allValidSlotsWithClientStatus[0];
//     const countdownDetails = displaySlot ? calculateTimeLeft(displaySlot.slot_effective_end) : null;

//     return (
//         <div className="w-full mx-auto py-6 sm:py-8">
//             <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-orange-200">
//                 {/* Header và Time Slot Buttons (Giữ nguyên) */}
//                 <div className="bg-gradient-to-r from-orange-500 to-red-500 p-3 sm:p-4 text-white">
//                     <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
//                         <h2 className="font-bold text-lg sm:text-2xl uppercase tracking-wider">FLASH SALE</h2>
//                         {displaySlot && countdownDetails && !countdownDetails.ended && displaySlot.status === 'Đang diễn ra' && (
//                             <div className="flex items-center gap-2">
//                                 <span className="text-xs sm:text-sm font-semibold text-white/90">Kết thúc trong</span>
//                                 <div className="flex items-center gap-1">
//                                     <span className="bg-black text-white px-1.5 sm:px-2 py-1 rounded-md font-mono text-sm sm:text-base">{countdownDetails.hours}</span>:
//                                     <span className="bg-black text-white px-1.5 sm:px-2 py-1 rounded-md font-mono text-sm sm:text-base">{countdownDetails.minutes}</span>:
//                                     <span className="bg-black text-white px-1.5 sm:px-2 py-1 rounded-md font-mono text-sm sm:text-base">{countdownDetails.seconds}</span>
//                                 </div>
//                             </div>
//                         )}
//                     </div>
//                 </div>
//                 {allValidSlotsWithClientStatus.length > 0 && (
//                     <div className=" py-2.5 px-2 sm:px-4 border-b border-orange-200">
//                         <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
//                             {allValidSlotsWithClientStatus.map(slot => (
//                                 <button
//                                     key={slot.slot_effective_start}
//                                     onClick={() => handleSelectSlotByUser(slot)}
//                                     className={`px-2.5 py-1.5 rounded-md text-xs transition-all duration-300 shadow-sm whitespace-nowrap flex flex-col items-center justify-center min-w-[85px] sm:min-w-[110px] ${selectedSlot?.slot_effective_start === slot.slot_effective_start ? 'bg-orange-500 text-white font-bold ring-2 ring-orange-300' : slot.status === 'Đang diễn ra' ? 'bg-white text-orange-600 border border-orange-300 font-semibold animate-pulse_subtle_orange' : 'bg-white text-gray-700 border border-gray-300 hover:border-orange-400 hover:text-orange-600'} ${slot.flash_sales.length === 0 ? 'opacity-60 cursor-not-allowed' : 'hover:scale-105'}`}
//                                     disabled={slot.flash_sales.length === 0}
//                                 >
//                                     <span className="font-bold text-sm">{slot.slot_display_time.split('-')[0].trim()}</span>
//                                     <span className="text-[10px] mt-0.5 font-medium uppercase">{slot.status}</span>
//                                 </button>
//                             ))}
//                         </div>
//                     </div>
//                 )}

//                 {/* Products Swiper */}
//                 <div className="p-2 sm:p-4">
//                     <div className="container mx-auto">
//                         {productsToDisplay.length > 0 && displaySlot ? (
//                             <Swiper
//                                 modules={[Navigation, Autoplay]}
//                                 spaceBetween={10}
//                                 slidesPerView={2.3}
//                                 navigation
//                                 loop={productsToDisplay.length > 6}
//                                 autoplay={{ delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true }}
//                                 breakpoints={{ 640: { slidesPerView: 3.5, spaceBetween: 12 }, 768: { slidesPerView: 4.5, spaceBetween: 16 }, 1024: { slidesPerView: 5.5, spaceBetween: 16 } }}
//                                 className="py-2"
//                             >
//                                 {productsToDisplay.map((product) => {
//                                     // --- BƯỚC 2: XỬ LÝ GIÁ TRỊ NULL KHI TÍNH TOÁN ---
//                                     // Dùng `|| '0'` để `parseFloat` không bị lỗi với `null`
//                                     const originalPrice = parseFloat(product.Price || '0');
//                                     const discountPercent = parseFloat(product.Discount || '0');
//                                     const finalPrice = originalPrice * (1 - discountPercent / 100);
//                                     const stockSold = product.mockedSoldQuantity!;

//                                     return (
//                                         <SwiperSlide key={`${product.FlashSaleID}-${product.ProductID}`} className="h-auto">
//                                             <div className="bg-white rounded-lg p-2 h-full flex flex-col shadow hover:shadow-md transition-shadow duration-300">
//                                                 <div className="relative w-full aspect-square mb-2">
//                                                     <Link href={`/products/${product.ProductID}`} passHref>
//                                                         <p className="block w-full h-full">
//                                                             <Image src={product.ProductImage ? (product.ProductImage.startsWith('http') ? product.ProductImage : `http://localhost/${product.ProductImage}`) : "/placeholder-product.png"} alt={product.ProductName} layout="fill" objectFit="contain" className="rounded-md" />
//                                                         </p>
//                                                     </Link>
//                                                     {/* --- BƯỚC 3.1: ẨN TAG GIẢM GIÁ NẾU DISCOUNT LÀ NULL --- */}
//                                                     {discountPercent > 0 && product.Discount !== null && (
//                                                         <div className="absolute top-0 right-0 bg-yellow-300 text-red-600 text-[10px] sm:text-[11px] font-bold px-1 py-1.5 sm:px-1.5 sm:py-2 z-10 flex flex-col items-center leading-none">
//                                                             <span className="text-sm sm:text-base">-{discountPercent.toFixed(0)}%</span>
//                                                             <span className="text-[8px] sm:text-[9px]">GIẢM</span>
//                                                         </div>
//                                                     )}
//                                                 </div>
//                                                 <h3 className="text-xs sm:text-sm font-normal text-gray-800 mb-1.5 h-8 sm:h-10 leading-tight line-clamp-2">
//                                                     {product.ProductName}
//                                                 </h3>
//                                                 <div className="mt-auto">
//                                                     {/* --- BƯỚC 3.2: HIỂN THỊ GIÁ HOẶC CHỮ "SẮP BẬT MÍ" --- */}
//                                                     <div className="mb-1.5 min-h-[24px] flex items-center">
//                                                         {product.Price !== null ? (
//                                                             <>
//                                                                 <span className="text-red-600 font-bold text-sm sm:text-base mr-1.5">{formatPrice(finalPrice)}</span>
//                                                                 {discountPercent > 0 && (
//                                                                     <span className="text-gray-400 line-through text-[10px] sm:text-xs">{formatPrice(originalPrice)}</span>
//                                                                 )}
//                                                             </>
//                                                         ) : (
//                                                             <span className="text-orange-600 font-bold text-sm sm:text-base">
//                                                                 SẮP BẬT MÍ
//                                                             </span>
//                                                         )}
//                                                     </div>
//                                                     {/* Thanh "Đã bán" */}
//                                                     {product.Quantity > 0 && (
//                                                         <div className="w-full bg-orange-100 rounded-full h-4 sm:h-5 relative overflow-hidden">
//                                                             <div className="absolute top-0 left-0 bg-gradient-to-r from-orange-500 to-red-600 h-full rounded-full" style={{ width: `${calculateSoldPercentage(stockSold, product.Quantity)}%` }}></div>
//                                                             {/* Thay đổi text dựa vào trạng thái */}
//                                                             <span className="absolute inset-0 text-center text-[10px] sm:text-xs font-semibold text-white leading-tight flex items-center justify-center drop-shadow">
//                                                                 {displaySlot.status === 'Sắp diễn ra'
//                                                                     ? 'SẮP MỞ BÁN'
//                                                                     : (stockSold < product.Quantity ? `Đã bán ${stockSold}` : 'CHÁY HÀNG')}
//                                                             </span>
//                                                         </div>
//                                                     )}

//                                                     {/* Nút bấm (giữ nguyên logic cũ) */}
//                                                     <div className="mt-2">
//                                                         {displaySlot.status === 'Đang diễn ra' && (
//                                                             <button className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition-colors duration-200 font-semibold text-sm shadow">MUA NGAY</button>
//                                                         )}
//                                                         {displaySlot.status === 'Sắp diễn ra' && (
//                                                             <Link href={`/products/${product.ProductID}`} passHref>
//                                                                 <p className="block w-full text-center bg-white text-orange-600 border border-orange-500 py-2 rounded-md hover:bg-orange-50 transition-colors duration-200 font-semibold text-sm">XEM CHI TIẾT</p>
//                                                             </Link>
//                                                         )}
//                                                     </div>
//                                                 </div>
//                                             </div>
//                                         </SwiperSlide>
//                                     );
//                                 })}
//                             </Swiper>
//                         ) : (
//                             !loading && (<div className="text-center py-16 text-gray-500 min-h-[200px] flex flex-col items-center justify-center"><p>Khung giờ này hiện chưa có sản phẩm.</p></div>)
//                         )}
//                     </div>
//                 </div>
//             </div>

//             {/* --- CSS (giữ nguyên) --- */}
//             <style jsx global>{`
//                 .swiper-button-next, .swiper-button-prev { display: none !important; }
//                 @media (min-width: 768px) { .swiper-button-next, .swiper-button-prev { display: flex !important; color: #f97316 !important; background-color: rgba(255, 255, 255, 0.9) !important; border-radius: 50%; width: 40px !important; height: 40px !important; top: 50% !important; transform: translateY(-80%) !important; box-shadow: 0 4px 10px rgba(0,0,0,0.1) !important; transition: all 0.2s ease !important; } .swiper-button-next:hover, .swiper-button-prev:hover { background-color: white !important; color: #ea580c !important; transform: translateY(-80%) scale(1.1) !important; } .swiper-button-next::after, .swiper-button-prev::after { font-size: 20px !important; font-weight: bold !important; } }
//                 .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
//                 .no-scrollbar::-webkit-scrollbar { display: none; }
//                 .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
//                 @keyframes pulse_subtle_orange { 0%, 100% { box-shadow: 0 0 0 0 rgba(249, 115, 22, 0.4); } 50% { box-shadow: 0 0 0 6px rgba(249, 115, 22, 0); } }
//                 .animate-pulse_subtle_orange { animation: pulse_subtle_orange 2.5s infinite; }
//             `}</style>
//         </div>
//     );
// };

// export default FlashSaleSection;
"use client";

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/autoplay';
import { Navigation, Autoplay } from 'swiper/modules';
import type { IHome } from '@/types/Ihome';
import { getFullImageUrl } from '@/services/api';

const FlashSaleSection: React.FC = () => {
    // --- State và Logic (Không thay đổi) ---
    const [apiData, setApiData] = useState<IHome.FlashSaleApiResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<IHome.FlashSaleSlot | null>(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isUserSelection, setIsUserSelection] = useState(false);

    useEffect(() => {
        async function fetchFlashSaleData() {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch('http://localhost/api/flash-sales/active');
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const result: IHome.FlashSaleApiResponse = await response.json();
                setApiData(result);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
                setError(`Lỗi tải dữ liệu Flash Sale: ${errorMessage}`);
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
        return apiData.daily_flash_sales_slots.flatMap(dateEntry => dateEntry.slots_on_date.map(slot => {
            let clientStatus = 'Đã kết thúc';
            const startMs = new Date(slot.slot_effective_start).getTime();
            const endMs = new Date(slot.slot_effective_end).getTime();
            if (nowMs < startMs) clientStatus = 'Sắp diễn ra';
            else if (nowMs >= startMs && nowMs < endMs) clientStatus = 'Đang diễn ra';
            return { ...slot, status: clientStatus };
        })).filter(slot => slot.status === 'Đang diễn ra' || slot.status === 'Sắp diễn ra').sort((a, b) => new Date(a.slot_effective_start).getTime() - new Date(b.slot_effective_start).getTime());
    }, [apiData, currentTime]);

    const activeSlotBasedOnTime = useMemo(() => allValidSlotsWithClientStatus.find(slot => slot.status === 'Đang diễn ra'), [allValidSlotsWithClientStatus]);

    useEffect(() => {
        if (loading || isUserSelection || !allValidSlotsWithClientStatus.length) return;
        if (activeSlotBasedOnTime) {
            if (!selectedSlot || selectedSlot.slot_effective_start !== activeSlotBasedOnTime.slot_effective_start) {
                setSelectedSlot(activeSlotBasedOnTime);
            }
        } else if (!selectedSlot || selectedSlot.status !== 'Sắp diễn ra') {
            const nextSlot = allValidSlotsWithClientStatus.find(s => s.status === 'Sắp diễn ra' && s.flash_sales.length > 0) || allValidSlotsWithClientStatus.find(s => s.status === 'Sắp diễn ra');
            setSelectedSlot(nextSlot || null);
        }
    }, [allValidSlotsWithClientStatus, activeSlotBasedOnTime, loading, selectedSlot, isUserSelection]);

    useEffect(() => {
        if (isUserSelection) {
            const timeoutId = setTimeout(() => setIsUserSelection(false), 5000);
            return () => clearTimeout(timeoutId);
        }
    }, [isUserSelection]);

    const handleSelectSlotByUser = useCallback((slot: IHome.FlashSaleSlot) => {
        setSelectedSlot(slot);
        setIsUserSelection(true);
    }, []);

    const productsToDisplay = useMemo(() => selectedSlot?.flash_sales.map(p => ({
        ...p,
        mockedSoldQuantity: p.SoldQuantity ?? Math.floor(((p.ProductID + p.FlashSaleID) % 80 + 10) / 100 * p.Quantity)
    })) || [], [selectedSlot]);

    const calculateTimeLeft = useCallback((targetTime: string) => {
        const difference = new Date(targetTime).getTime() - currentTime.getTime();
        if (difference <= 0) return { hours: '00', minutes: '00', seconds: '00', ended: true };
        return {
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24).toString().padStart(2, '0'),
            minutes: Math.floor((difference / 1000 / 60) % 60).toString().padStart(2, '0'),
            seconds: Math.floor((difference / 1000) % 60).toString().padStart(2, '0'),
            ended: false,
        };
    }, [currentTime]);

    const formatPrice = (priceInput: string | number) => {
        const numericPrice = typeof priceInput === 'string' ? parseFloat(priceInput) : priceInput;
        if (isNaN(numericPrice)) return 'N/A';
        return new Intl.NumberFormat('vi-VN').format(numericPrice) + '₫';
    };

    const calculateSoldPercentage = (sold: number | undefined, total: number) => {
        if (typeof sold === 'undefined' || total <= 0) return 0;
        return Math.min(100, (sold / total) * 100);
    };

    if (loading) return <div className="py-10 px-4 text-center text-gray-700">Đang tải Flash Sale...</div>;
    if (error) return <div className="py-10 px-4 text-center text-red-500">{error}</div>;
    if (!selectedSlot && !activeSlotBasedOnTime && allValidSlotsWithClientStatus.length === 0) return null;

    const displaySlot = selectedSlot || allValidSlotsWithClientStatus[0];
    const countdownDetails = displaySlot ? calculateTimeLeft(displaySlot.slot_effective_end) : null;

    return (
        <div className="w-full mx-auto py-6 sm:py-8">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-orange-200">
                {/* Header và Time Slot Buttons (Không thay đổi) */}
                <div className="bg-gradient-to-r from-orange-500 to-red-500 p-3 sm:p-4 text-white">
                    <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
                        <h2 className="font-bold text-lg sm:text-2xl uppercase tracking-wider">FLASH SALE</h2>
                        {displaySlot && countdownDetails && !countdownDetails.ended && displaySlot.status === 'Đang diễn ra' && (
                            <div className="flex items-center gap-2">
                                <span className="text-xs sm:text-sm font-semibold text-white/90">Kết thúc trong</span>
                                <div className="flex items-center gap-1">
                                    <span className="bg-black text-white px-1.5 sm:px-2 py-1 rounded-md font-mono text-sm sm:text-base">{countdownDetails.hours}</span>:
                                    <span className="bg-black text-white px-1.5 sm:px-2 py-1 rounded-md font-mono text-sm sm:text-base">{countdownDetails.minutes}</span>:
                                    <span className="bg-black text-white px-1.5 sm:px-2 py-1 rounded-md font-mono text-sm sm:text-base">{countdownDetails.seconds}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                {allValidSlotsWithClientStatus.length > 0 && (
                    <div className=" py-2.5 px-2 sm:px-4 border-b border-orange-200">
                        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                            {allValidSlotsWithClientStatus.map(slot => (
                                <button
                                    key={slot.slot_effective_start}
                                    onClick={() => handleSelectSlotByUser(slot)}
                                    className={`px-2.5 py-1.5 rounded-md text-xs transition-all duration-300 shadow-sm whitespace-nowrap flex flex-col items-center justify-center min-w-[85px] sm:min-w-[110px] ${selectedSlot?.slot_effective_start === slot.slot_effective_start ? 'bg-orange-500 text-white font-bold ring-2 ring-orange-300' : slot.status === 'Đang diễn ra' ? 'bg-white text-orange-600 border border-orange-300 font-semibold animate-pulse_subtle_orange' : 'bg-white text-gray-700 border border-gray-300 hover:border-orange-400 hover:text-orange-600'} ${slot.flash_sales.length === 0 ? 'opacity-60 cursor-not-allowed' : 'hover:scale-105'}`}
                                    disabled={slot.flash_sales.length === 0}
                                >
                                    <span className="font-bold text-sm">{slot.slot_display_time.split('-')[0].trim()}</span>
                                    <span className="text-[10px] mt-0.5 font-medium uppercase">{slot.status}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Products Swiper */}
                <div className="p-2 sm:p-4">
                    <div className="container mx-auto">
                        {productsToDisplay.length > 0 && displaySlot ? (
                            <Swiper
                                modules={[Navigation, Autoplay]}
                                spaceBetween={10}
                                slidesPerView={2.3}
                                navigation
                                loop={productsToDisplay.length > 6}
                                autoplay={{ delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true }}
                                breakpoints={{ 640: { slidesPerView: 3.5, spaceBetween: 12 }, 768: { slidesPerView: 4.5, spaceBetween: 16 }, 1024: { slidesPerView: 5.5, spaceBetween: 16 } }}
                                className="py-2"
                            >
                                {productsToDisplay.map((product) => {
                                    const originalPrice = parseFloat(product.Price || '0');
                                    const discountPercent = parseFloat(product.Discount || '0');
                                    const finalPrice = originalPrice * (1 - discountPercent / 100);
                                    const stockSold = product.mockedSoldQuantity!;

                                    // SỬA 1: Tạo biến để kiểm tra tình trạng hết hàng, giúp code dễ đọc hơn
                                    const isSoldOut = stockSold >= product.Quantity;

                                    return (
                                        <SwiperSlide key={`${product.FlashSaleID}-${product.ProductID}`} className="h-auto">
                                            {/* SỬA 2: Thêm class `relative` để định vị lớp phủ (overlay) */}
                                            <div className="relative bg-white rounded-lg p-2 h-full flex flex-col shadow hover:shadow-md transition-shadow duration-300">
                                                <div className="relative w-full aspect-square mb-2">
                                                    <Link href={`/productdetail/${product.ProductID}`} passHref>
                                                        {/* SỬA 3: Vô hiệu hóa click khi hết hàng */}
                                                        <div className={`block w-full h-full ${isSoldOut ? 'pointer-events-none' : ''}`}>
                                                            <img src={getFullImageUrl(product.ProductImage)} alt={product.ProductName} className="rounded-md" />
                                                        </div>
                                                    </Link>
                                                    {discountPercent > 0 && product.Discount !== null && (
                                                        <div className="absolute top-0 right-0 bg-yellow-300 text-red-600 text-[10px] sm:text-[11px] font-bold px-1 py-1.5 sm:px-1.5 sm:py-2 z-10 flex flex-col items-center leading-none">
                                                            <span className="text-sm sm:text-base">-{discountPercent.toFixed(0)}%</span>
                                                            <span className="text-[8px] sm:text-[9px]">GIẢM</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <h3 className="text-xs sm:text-sm font-normal text-gray-800 mb-1.5 h-8 sm:h-10 leading-tight line-clamp-2">
                                                    {product.ProductName}
                                                </h3>
                                                <div className="mt-auto">
                                                    <div className="mb-1.5 min-h-[24px] flex items-center">
                                                        {product.Price !== null ? (
                                                            <>
                                                                <span className="text-red-600 font-bold text-sm sm:text-base mr-1.5">{formatPrice(finalPrice)}</span>
                                                                {discountPercent > 0 && (
                                                                    <span className="text-gray-400 line-through text-[10px] sm:text-xs">{formatPrice(originalPrice)}</span>
                                                                )}
                                                            </>
                                                        ) : (
                                                            <span className="text-orange-600 font-bold text-sm sm:text-base">
                                                                SẮP BẬT MÍ
                                                            </span>
                                                        )}
                                                    </div>
                                                    {product.Quantity > 0 && (
                                                        <div className="w-full bg-orange-100 rounded-full h-4 sm:h-5 relative overflow-hidden">
                                                            <div className="absolute top-0 left-0 bg-gradient-to-r from-orange-500 to-red-600 h-full rounded-full" style={{ width: `${calculateSoldPercentage(stockSold, product.Quantity)}%` }}></div>
                                                            <span className="absolute inset-0 text-center text-[10px] sm:text-xs font-semibold text-white leading-tight flex items-center justify-center drop-shadow">
                                                                {displaySlot.status === 'Sắp diễn ra'
                                                                    ? 'SẮP MỞ BÁN'
                                                                    // SỬA 4: Thay đổi text từ 'CHÁY HÀNG' thành 'HẾT HÀNG'
                                                                    : (isSoldOut ? 'HẾT HÀNG' : `Đã bán ${stockSold}`)}
                                                            </span>
                                                        </div>
                                                    )}

                                                    <div className="mt-2">
                                                        {displaySlot.status === 'Đang diễn ra' && (
                                                            // SỬA 5: Vô hiệu hóa nút và thay đổi style khi hết hàng
                                                            <button
                                                                disabled={isSoldOut}
                                                                className={`w-full py-2 rounded-md transition-colors duration-200 font-semibold text-sm shadow ${isSoldOut ? 'bg-gray-400 text-gray-200 cursor-not-allowed' : 'bg-red-600 text-white hover:bg-red-700'}`}
                                                            >
                                                                {isSoldOut ? 'HẾT HÀNG' : 'MUA NGAY'}
                                                            </button>
                                                        )}
                                                        {displaySlot.status === 'Sắp diễn ra' && (
                                                            <Link href={`/productdetail/${product.ProductID}`} passHref>
                                                                <p className="block w-full text-center bg-white text-orange-600 border border-orange-500 py-2 rounded-md hover:bg-orange-50 transition-colors duration-200 font-semibold text-sm">XEM CHI TIẾT</p>
                                                            </Link>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* SỬA 6: Thêm lớp phủ (overlay) khi sản phẩm hết hàng */}
                                                {isSoldOut && (
                                                    <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] z-20 flex items-center justify-center rounded-lg">
                                                        <span className="px-4 py-2 bg-red-600 text-white font-bold text-sm rounded-md uppercase shadow-lg">
                                                            Hết Hàng
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </SwiperSlide>
                                    );
                                })}
                            </Swiper>
                        ) : (
                            !loading && (<div className="text-center py-16 text-gray-500 min-h-[200px] flex flex-col items-center justify-center"><p>Khung giờ này hiện chưa có sản phẩm.</p></div>)
                        )}
                    </div>
                </div>
            </div>

            {/* CSS (Không thay đổi) */}
            <style jsx global>{`
                .swiper-button-next, .swiper-button-prev { display: none !important; }
                @media (min-width: 768px) { .swiper-button-next, .swiper-button-prev { display: flex !important; color: #f97316 !important; background-color: rgba(255, 255, 255, 0.9) !important; border-radius: 50%; width: 40px !important; height: 40px !important; top: 50% !important; transform: translateY(-80%) !important; box-shadow: 0 4px 10px rgba(0,0,0,0.1) !important; transition: all 0.2s ease !important; } .swiper-button-next:hover, .swiper-button-prev:hover { background-color: white !important; color: #ea580c !important; transform: translateY(-80%) scale(1.1) !important; } .swiper-button-next::after, .swiper-button-prev::after { font-size: 20px !important; font-weight: bold !important; } }
                .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                @keyframes pulse_subtle_orange { 0%, 100% { box-shadow: 0 0 0 0 rgba(249, 115, 22, 0.4); } 50% { box-shadow: 0 0 0 6px rgba(249, 115, 22, 0); } }
                .animate-pulse_subtle_orange { animation: pulse_subtle_orange 2.5s infinite; }
            `}</style>
        </div>
    );
};

export default FlashSaleSection;