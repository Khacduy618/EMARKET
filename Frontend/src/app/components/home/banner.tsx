// src/components/HeroBannerSlider.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import axios from 'axios';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';
import 'swiper/css/effect-fade';
import type { IHome } from '@/types/Ihome';

// API Endpoint đã được định nghĩa rõ ràng
const API_URL = 'http://localhost/api/banners?position=homepage_carousel';

const HeroBannerSlider: React.FC = () => {
    const [banners, setBanners] = useState<IHome.Banner[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBanners = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get<{ data: IHome.Banner[] }>(API_URL);
                const now = new Date();

                // Dữ liệu từ API đã là { data: [...] }
                // Backend đã lọc theo position và currentlyActive,
                // nhưng client có thể lọc lại để đảm bảo hoặc nếu có logic cache phức tạp.
                // Trong trường hợp này, giả sử backend đã làm tốt việc lọc.
                const fetchedBanners = response.data.data
                    .filter(banner => {
                        // Nếu backend đã làm tốt việc lọc, có thể không cần lọc lại ở đây.
                        // Tuy nhiên, giữ lại để an toàn hoặc nếu có yêu cầu cache phía client.
                        if (!banner.IsActive) return false; // IsActive từ JSON là boolean
                        if (banner.StartDate && new Date(banner.StartDate) > now) return false;
                        if (banner.EndDate && new Date(banner.EndDate) < now) return false;
                        return true;
                    })
                    .sort((a, b) => (a.SortOrder || 0) - (b.SortOrder || 0));

                setBanners(fetchedBanners);

            } catch (err) {
                console.error("Error fetching banners:", err);
                let errorMessage = "Không thể tải danh sách banner. Vui lòng thử lại sau.";
                if (axios.isAxiosError(err) && err.response) {
                    errorMessage += ` (Lỗi: ${err.response.status} ${err.response.statusText || ''})`;
                } else if (err instanceof Error) {
                    errorMessage += ` (${err.message})`;
                }
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        fetchBanners();
    }, []); // useEffect chạy một lần khi component mount

    // Hàm này vẫn hữu ích nếu API có thể trả về URL tương đối
    const getFullImageUrl = (imageUrl: string) => {
        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
            return imageUrl;
        }
        // Nếu ImageURL luôn là path tương đối, ví dụ: /images/banners/mybanner.jpg
        const imageBaseUrl = process.env.NEXT_PUBLIC_IMAGE_BASE_URL || 'http://localhost';
        return `${imageBaseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
    };

    if (loading) {
        return (
            <div className="w-full aspect-[16/7] sm:aspect-[16/6] md:aspect-[16/5] bg-sky-100 animate-pulse flex items-center justify-center rounded-lg shadow-md">
                <p className="text-sky-700 font-semibold">Đang tải banner...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full aspect-[16/7] sm:aspect-[16/6] md:aspect-[16/5] bg-red-100 text-red-700 flex flex-col items-center justify-center rounded-lg p-4 text-center shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-3 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="font-semibold">Lỗi khi tải banner</p>
                <p className="text-sm">{error}</p>
            </div>
        );
    }

    if (banners.length === 0) {
        return (
            <div className="w-full aspect-[16/7] sm:aspect-[16/6] md:aspect-[16/5] bg-slate-100 text-slate-600 flex flex-col items-center justify-center rounded-lg p-4 text-center shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 3h16a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2zM4 7v10M20 7v10M7 3v4M17 3v4M4 11h16" />
                </svg>
                <p className="font-semibold">Không có banner nào để hiển thị</p>
                <p className="text-sm">Vui lòng kiểm tra lại sau.</p>
            </div>
        );
    }

    return (
        <section className="w-full max-w-[1600px] mx-auto mb-8 sm:mb-12 px-2 sm:px-0"> {/* Thêm max-width và padding */}
            <Swiper
                modules={[Navigation, Pagination, Autoplay, EffectFade]}
                spaceBetween={0} // Không có khoảng cách giữa các slide khi dùng effect fade
                slidesPerView={1}
                navigation
                pagination={{ clickable: true, dynamicBullets: true }} // dynamicBullets cho pagination đẹp hơn
                loop={banners.length > 1}
                autoplay={{
                    delay: 5000,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true,
                }}
                effect="fade" // Hiệu ứng mờ dần
                fadeEffect={{ crossFade: true }} // Cho phép chuyển mượt mà hơn
                className="hero-banner-swiper rounded-xl overflow-hidden shadow-xl border border-slate-200/50" // Thêm border nhẹ
            >
                {banners.map((banner, index) => (
                    <SwiperSlide key={banner.BannerID}>
                        <div className="relative w-full aspect-[16/7] sm:aspect-[16/6] md:aspect-[16/5] group">
                            {/* Sử dụng aspect ratio để chiều cao tự điều chỉnh theo chiều rộng */}
                            {banner.LinkURL ? (
                                <Link
                                    href={banner.LinkURL}
                                    target={banner.LinkURL.startsWith('http') ? '_blank' : '_self'}
                                    rel={banner.LinkURL.startsWith('http') ? 'noopener noreferrer' : undefined}
                                    className="block w-full h-full cursor-pointer"
                                    aria-label={banner.Title || `Banner ${banner.BannerID}`}
                                >
                                    <Image
                                        src={getFullImageUrl(banner.ImageURL)}
                                        alt={banner.Title || `Banner ${banner.BannerID}`}
                                        layout="fill"
                                        objectFit="cover" // 'cover' thường đẹp hơn cho banner
                                        priority={index === 0} // Ưu tiên tải ảnh đầu tiên
                                        className="transition-transform duration-500 ease-in-out group-hover:scale-105"
                                        // Unoptimize nếu ảnh là GIF hoặc từ localhost (nếu không muốn Next.js xử lý)
                                        unoptimized={banner.ImageURL.endsWith('.gif') || banner.ImageURL.startsWith('http://localhost')}
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.onerror = null;
                                            target.src = '/images/placeholder-banner-error.jpg'; // Cần có ảnh này
                                            target.srcset = "";
                                        }}
                                    />
                                </Link>
                            ) : (
                                <Image
                                    src={getFullImageUrl(banner.ImageURL)}
                                    alt={banner.Title || `Banner ${banner.BannerID}`}
                                    layout="fill"
                                    objectFit="cover"
                                    priority={index === 0}
                                    className="transition-transform duration-500 ease-in-out group-hover:scale-105"
                                    unoptimized={banner.ImageURL.endsWith('.gif') || banner.ImageURL.startsWith('http://localhost')}
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.onerror = null;
                                        target.src = '/images/placeholder-banner-error.jpg';
                                        target.srcset = "";
                                    }}
                                />
                            )}
                            {banner.Title && (
                                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-t from-black/75 via-black/40 to-transparent pointer-events-none">
                                    {/* pointer-events-none để không cản trở click vào Link */}
                                    <h2 className="text-white text-xl sm:text-2xl md:text-3xl font-bold drop-shadow-lg leading-tight">
                                        {banner.Title}
                                    </h2>
                                </div>
                            )}
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
            <style jsx global>{`
                .hero-banner-swiper {
                    --swiper-navigation-color: #ffffff;
                    --swiper-pagination-color: #0ea5e9; /* sky-500 */
                    --swiper-navigation-size: 28px; /* Điều chỉnh kích thước icon mũi tên */
                }

                .hero-banner-swiper .swiper-button-next,
                .hero-banner-swiper .swiper-button-prev {
                    background-color: rgba(0, 0, 0, 0.25);
                    border-radius: 50%;
                    width: 44px; /* Tăng kích thước vùng click */
                    height: 44px;
                    transition: background-color 0.3s ease, opacity 0.3s ease;
                    opacity: 0.7;
                    top: 50%;
                    transform: translateY(-50%);
                }
                .hero-banner-swiper:hover .swiper-button-next,
                .hero-banner-swiper:hover .swiper-button-prev {
                    opacity: 1;
                }
                .hero-banner-swiper .swiper-button-next:hover,
                .hero-banner-swiper .swiper-button-prev:hover {
                    background-color: rgba(0, 0, 0, 0.4);
                }

                .hero-banner-swiper .swiper-pagination-bullet {
                    background-color: rgba(255, 255, 255, 0.7); /* Màu trắng mờ cho bullet không active */
                    opacity: 0.8;
                    width: 10px;
                    height: 10px;
                    transition: all 0.3s ease;
                    margin: 0 5px !important; /* Thêm khoảng cách giữa các bullet */
                }
                .hero-banner-swiper .swiper-pagination-bullet-active {
                    background-color: var(--swiper-pagination-color); /* Sử dụng biến CSS */
                    opacity: 1;
                    width: 12px; /* Bullet active to hơn chút */
                    height: 12px;
                }
                .hero-banner-swiper .swiper-pagination-bullets-dynamic .swiper-pagination-bullet {
                     transform: scale(0.8); /* Thu nhỏ các bullet không active khi dynamic */
                }
                .hero-banner-swiper .swiper-pagination-bullets-dynamic .swiper-pagination-bullet-active-main {
                    transform: scale(1.1); /* Phóng to bullet chính */
                }

                /* Custom class cho banner title để đảm bảo hiển thị tốt */
                .banner-title-gradient {
                    background: linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0) 100%);
                }
            `}</style>
        </section>
    );
};

export default HeroBannerSlider;