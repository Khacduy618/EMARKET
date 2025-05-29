"use client";

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import Image from 'next/image'; // Đảm bảo bạn đã cài đặt Next.js nếu sử dụng

import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
// import 'swiper/css/pagination'; // Bỏ qua nếu không dùng pagination
import 'swiper/css/autoplay';
import { Navigation, Autoplay } from 'swiper/modules'; // Chỉ import module cần thiết

// --- INTERFACES (Khớp với JSON response của bạn) ---
interface FlashSaleProduct {
    FlashSaleID: number;
    UserID?: number;
    UserName?: string;
    ProductID: number;
    ProductName: string;
    OriginalPrice: string;
    Discount: string; // Phần trăm giảm giá, ví dụ "15.00"
    Quantity: number; // Tổng số lượng của sản phẩm trong flash sale này
    StartTime: string;
    EndTime: string;
    ProductImage: string | null;
    SoldQuantity?: number; // Dữ liệu thực tế từ API là tốt nhất
    mockedSoldQuantity?: number; // Để mock nếu API không có SoldQuantity
}

interface FlashSaleSlot {
    slot_display_time: string;
    slot_effective_start: string;
    slot_effective_end: string;
    status: string; // Status này sẽ được cập nhật ở client dựa trên currentTime
    flash_sales: FlashSaleProduct[];
}

interface FlashSaleDateEntry { // Đổi tên để tránh trùng với kiểu Date của JS
    date: string;
    slots_on_date: FlashSaleSlot[];
}

interface FlashSaleApiResponse {
    initial_requested_date_or_today: string;
    current_server_time_hcm: string;
    daily_flash_sales_slots: FlashSaleDateEntry[];
}


const FlashSaleSection: React.FC = () => {
    const [apiData, setApiData] = useState<FlashSaleApiResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<FlashSaleSlot | null>(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isUserSelection, setIsUserSelection] = useState(false);

    // --- DATA FETCHING ---
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
                console.log("test img:", result);
                setApiData(result);
                setApiData(result);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
                setError(`Lỗi tải dữ liệu Flash Sale: ${errorMessage}`);
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchFlashSaleData();
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // --- MEMOIZED SLOT CALCULATIONS ---
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

    // --- EFFECT FOR MANAGING SELECTED SLOT ---
    useEffect(() => {
        if (loading || !apiData) return;
        if (isUserSelection) return;

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
            } else if (selectedSlot.status === 'Đang diễn ra') {
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
    }, [allValidSlotsWithClientStatus, activeSlotBasedOnTime, loading, apiData, currentTime, isUserSelection, selectedSlot]);

    useEffect(() => {
        if (isUserSelection) {
            const timeoutId = setTimeout(() => setIsUserSelection(false), 0);
            return () => clearTimeout(timeoutId);
        }
    }, [isUserSelection]);

    // --- HANDLERS ---
    const handleSelectSlotByUser = useCallback((slot: FlashSaleSlot) => {
        setSelectedSlot(slot);
        setIsUserSelection(true);
    }, []);

    // --- STABLE MOCKED SOLD QUANTITY ---
    const productsToDisplayWithStableMockSold = useMemo(() => {
        if (!selectedSlot || !selectedSlot.flash_sales) return [];
        return selectedSlot.flash_sales.map(p => ({
            ...p,
            mockedSoldQuantity: p.SoldQuantity ?? Math.floor(((p.ProductID + p.FlashSaleID) % 70 + 10) / 100 * p.Quantity)
        }));
    }, [selectedSlot]);

    // --- UTILITY FUNCTIONS ---
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

    const formatPrice = (priceInput: number | string) => {
        let numericPrice: number;
        if (typeof priceInput === 'string') {
            numericPrice = parseFloat(priceInput.replace(/,/g, ''));
        } else {
            numericPrice = priceInput;
        }
        if (isNaN(numericPrice)) return 'N/A';
        return new Intl.NumberFormat('vi-VN').format(numericPrice) + '₫';
    };

    const calculateSoldPercentage = (sold: number | undefined, total: number) => {
        if (typeof sold === 'undefined' || total === 0) return 0;
        return Math.min(100, Math.max(0, (sold / total) * 100));
    };

    // --- RENDER LOGIC ---
    if (loading) return <div className="py-10 px-4 text-center text-gray-700">Đang tải Flash Sale...</div>;
    if (error) return <div className="py-10 px-4 text-center text-red-500">{error}</div>; // Giữ màu đỏ cho lỗi
    if (!apiData || allValidSlotsWithClientStatus.length === 0) {
        return <div className="py-10 px-4 text-center text-gray-500">Hiện không có chương trình Flash Sale nào.</div>;
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
        <div className=" py-8 sm:py-12"> {/* Nền chính màu xanh đậm */}
            <div
                className="bg-white rounded-xl shadow-2xl overflow-hidden mx-auto border border-blue-300" // Viền xanh nhạt
                style={{ maxWidth: '1500px' }}
            >
                {/* Header Flash Sale */}
                <div className="bg-blue-600 from-blue-700 to-sky-500 p-4 text-white sm:p-5"> {/* Gradient xanh */}
                    <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3 bg-blue-600 border-2 border-blue-600 rounded-xl ">
                            <div className="bg-white/25 p-2.5 rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <h2 className="font-bold text-xl sm:text-2xl md:text-3xl uppercase tracking-wider">Flash Sale</h2>
                        </div>
                        {displaySlot && countdownDetails && !countdownDetails.ended ? (
                            <div className="flex items-center gap-3 sm:gap-4">
                                <div className="flex items-center gap-1.5 sm:gap-2 bg-white px-3 sm:px-4 py-2 rounded-lg shadow-inner"> {/* Nền tối hơn cho countdown */}
                                    <span className="font-mono text-lg sm:text-xl text-black font-bold">{countdownDetails.hours}</span><span className="text-lg sm:text-xl text-black opacity-80">:</span>
                                    <span className="font-mono text-lg sm:text-xl text-black font-bold">{countdownDetails.minutes}</span><span className="text-lg sm:text-xl text-black opacity-80">:</span>
                                    <span className="font-mono text-lg sm:text-xl text-black font-bold">{countdownDetails.seconds}</span>
                                </div>
                                <span className="hidden sm:inline text-xs sm:text-sm text-black font-medium opacity-90">
                                    {countdownDetails.text} • {displaySlot.slot_display_time}
                                </span>
                            </div>
                        ) : (
                            displaySlot ? <span className="text-sm font-medium bg-black/20 px-3 py-1.5 rounded">{displaySlot.status === 'Đã kết thúc' ? 'SLOT ĐÃ KẾT THÚC' : 'SLOT KẾT THÚC'} • {displaySlot.slot_display_time}</span> : <span className="text-sm font-medium">Không có slot</span>
                        )}
                    </div>
                </div>

                {/* Time Slot Buttons */}
                {allValidSlotsWithClientStatus.length > 0 && (
                    <div className="bg-sky-50 py-3 px-2 sm:px-6 border-b border-sky-200"> {/* Nền xanh nhạt */}
                        <div className="container mx-auto">
                            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                                {allValidSlotsWithClientStatus.map(slot => (
                                    <button
                                        key={slot.slot_effective_start}
                                        onClick={() => handleSelectSlotByUser(slot)}
                                        className={`px-3 py-2 rounded-lg text-xs sm:text-sm transition-all duration-300 shadow-sm whitespace-nowrap flex flex-col items-center justify-center min-w-[85px] sm:min-w-[110px] hover:scale-105
                                            ${selectedSlot?.slot_effective_start === slot.slot_effective_start
                                                ? 'bg-blue-600 text-white font-semibold ring-2' // Nút được chọn màu xanh đậm
                                                : slot.status === 'Đang diễn ra'
                                                    ? 'bg-white text-blue-600 border-2 border-blue-50 font-medium animate-pulse_subtle_blue' // Nút đang diễn ra
                                                    : 'bg-white text-slate-700 border border-slate-300 hover:border-blue-400 hover:text-blue-600'
                                            }
                                            ${slot.flash_sales.length === 0 ? 'opacity-50 cursor-not-allowed hover:scale-100' : ''}
                                        `}
                                        title={slot.status}
                                        disabled={slot.flash_sales.length === 0 && selectedSlot?.slot_effective_start !== slot.slot_effective_start}
                                    >
                                        <span className="font-bold text-sm sm:text-base">{slot.slot_display_time.split('-')[0].trim()}</span>
                                        <span className={`text-[10px] sm:text-xs mt-0.5 font-medium
                                            ${selectedSlot?.slot_effective_start === slot.slot_effective_start ? 'text-white/90' : slot.status === 'Đang diễn ra' ? 'text-blue-600' : 'text-slate-500'}`}>
                                            {slot.status.toUpperCase()}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Products Swiper */}
                <div className="p-3 sm:p-6 bg-sky-100"> {/* Nền xanh nhạt hơn cho sản phẩm */}
                    <div className="container mx-auto">
                        {productsToDisplayWithStableMockSold.length > 0 && displaySlot ? (
                            <Swiper
                                modules={[Navigation, Autoplay]}
                                spaceBetween={16}
                                slidesPerView={2.2}
                                navigation
                                loop={productsToDisplayWithStableMockSold.length > 6}
                                autoplay={{ delay: 4500, disableOnInteraction: false, pauseOnMouseEnter: true }}
                                breakpoints={{
                                    640: { slidesPerView: 2.5, spaceBetween: 16 },
                                    768: { slidesPerView: 3.5, spaceBetween: 16 },
                                    1024: { slidesPerView: 4.5, spaceBetween: 20 },
                                    1280: { slidesPerView: 5.5, spaceBetween: 20 },
                                }}
                                className="py-4 -mx-2 sm:-mx-0"
                            >
                                {productsToDisplayWithStableMockSold.map((product) => {
                                    const originalPrice = parseFloat(product.OriginalPrice);
                                    const discountPercent = parseFloat(product.Discount);
                                    const finalPrice = originalPrice * (1 - discountPercent / 100);
                                    const stockTotal = product.Quantity;
                                    const stockSold = product.mockedSoldQuantity!;

                                    return (
                                        <SwiperSlide
                                            key={`${product.FlashSaleID}-${product.ProductID}-${displaySlot.slot_effective_start}-${product.ProductName}`}
                                            className="h-auto pb-1 flex justify-center items-center" // Added flex justify-center items-center
                                        >
                                            <div className="bg-white border border-slate-200/80 rounded-xl p-3 h-full flex flex-col  shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                                <div className="relative w-full aspect-[1/1] mb-3 group">
                                                    <Image
                                                        src={
                                                            product.ProductImage
                                                                ? product.ProductImage.startsWith('http')
                                                                    ? product.ProductImage // link đầy đủ URL
                                                                    : `http://localhost:8001/${product.ProductImage}` // link backend + path tương đối
                                                                : "/placeholder-product.png" // ảnh mặc định
                                                        }
                                                        alt={product.ProductName}
                                                        layout="fill"
                                                        objectFit="contain"
                                                        className="rounded-md group-hover:scale-105 transition-transform duration-300"
                                                        unoptimized={product.ProductImage?.startsWith('http')}
                                                    />
                                                    {discountPercent > 0 && (
                                                        <div className="absolute top-2 left-2 bg-gradient-to-br from-sky-500 to-blue-600 text-white text-[10px] sm:text-xs font-bold px-2 py-1 rounded-full shadow-md z-10"> {/* Badge màu xanh */}
                                                            -{discountPercent.toFixed(0)}%
                                                        </div>
                                                    )}
                                                </div>
                                                <h3 className="text-xs sm:text-sm font-semibold text-slate-800 mb-1.5 h-10 leading-tight line-clamp-2 group-hover:text-blue-600">
                                                    {product.ProductName}
                                                </h3>
                                                <div className="mt-auto pt-1.5">
                                                    <div className="mb-1.5">
                                                        <span className="text-blue-600 font-bold text-sm sm:text-base md:text-lg mr-2"> {/* Giá màu xanh */}
                                                            {formatPrice(finalPrice)}
                                                        </span>
                                                        {discountPercent > 0 && (
                                                            <span className="text-gray-400 line-through text-[10px] sm:text-xs">
                                                                {formatPrice(originalPrice)}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {stockTotal > 0 && (
                                                        <div className="w-full bg-sky-100 rounded-full h-4 my-2 relative overflow-hidden border border-sky-200">
                                                            <div
                                                                className="absolute top-0 left-0 bg-gradient-to-r from-sky-400 to-blue-500 h-full rounded-full transition-all duration-500 ease-out" // Thanh tiến trình màu xanh
                                                                style={{ width: `${calculateSoldPercentage(stockSold, stockTotal)}%` }}
                                                            ></div>
                                                            <span className="absolute inset-0 text-center text-[10px] sm:text-xs font-semibold text-white/90 leading-tight flex items-center justify-center px-1 drop-shadow-sm">
                                                                {stockSold < stockTotal ? `Đã bán ${stockSold}` : 'CHÁY HÀNG'}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {displaySlot.status === 'Đang diễn ra' ? (
                                                        <button className="w-full bg-blue-600 text-white py-2.5 rounded-lg mt-1.5 hover:bg-blue-700 transition-colors duration-200 font-semibold text-xs sm:text-sm shadow-md hover:shadow-lg"> {/* Nút mua màu xanh */}
                                                            MUA NGAY
                                                        </button>
                                                    ) : (
                                                        <button className="w-full bg-slate-300 text-slate-600 py-2.5 rounded-lg mt-1.5 cursor-not-allowed font-semibold text-xs sm:text-sm">
                                                            SẮP MỞ BÁN
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </SwiperSlide>
                                    );
                                })}
                            </Swiper>
                        ) : (
                            !loading && (
                                <div className="text-center py-16 text-gray-500 min-h-[200px] flex flex-col items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
                                    <p>{displaySlot ? "Khung giờ này hiện chưa có sản phẩm." : "Vui lòng chọn một khung giờ Flash Sale."}</p>
                                    {displaySlot && <p className="text-xs mt-1">Hãy quay lại sau hoặc xem các khung giờ khác.</p>}
                                </div>
                            )
                        )}
                    </div>
                </div>
                {/* Footer */}
                <div className="bg-gradient-to-t from-sky-100 to-white text-center py-6 border-t border-sky-200"> {/* Gradient xanh */}
                    <div className="container mx-auto">
                        <p className="text-blue-600 font-bold text-lg sm:text-xl flex items-center justify-center gap-2 animate-bounce_slow">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-7 sm:w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            SĂN SALE NGAY KẺO LỠ!
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-7 sm:w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </p>
                    </div>
                </div>
            </div>
            <style jsx global>{`
                .swiper-button-next, .swiper-button-prev {
                    color: #0284c7 !important; /* sky-600 */
                    background-color: rgba(255, 255, 255, 0.95) !important;
                    border-radius: 50%;
                    width: 38px !important; height: 38px !important;
                    top: 50% !important;
                    transform: translateY(-160%) !important;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
                    transition: all 0.2s ease-in-out !important;
                }
                .swiper-button-next:hover, .swiper-button-prev:hover {
                    background-color: white !important;
                    color: #0369a1 !important; /* sky-700 */
                    transform: translateY(-160%) scale(1.1) !important;
                }
                .swiper-button-next::after, .swiper-button-prev::after { font-size: 18px !important; font-weight: bold !important; }
                .swiper-button-next { right: -10px !important; }
                .swiper-button-prev { left: -10px !important; }
                
                .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

                @keyframes pulse_subtle_blue { /* Đổi tên animation */
                    0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); } /* blue-500 */
                    50% { opacity: 0.95; box-shadow: 0 0 0 5px rgba(59, 130, 246, 0); }
                }
                .animate-pulse_subtle_blue { /* Đổi tên class */
                    animation: pulse_subtle_blue 2s infinite;
                }
                 @keyframes bounce_slow {
                    0%, 100% { transform: translateY(-3%); animation-timing-function: cubic-bezier(0.8,0,1,1); }
                    50% { transform: translateY(0); animation-timing-function: cubic-bezier(0,0,0.2,1); }
                }
                .animate-bounce_slow { animation: bounce_slow 2s infinite; }
            `}</style>
        </div>
    );
};

export default FlashSaleSection;