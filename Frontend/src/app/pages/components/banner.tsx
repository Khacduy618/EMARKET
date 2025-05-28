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

interface Banner {
    BannerID: number;
    Title?: string | null;
    ImageURL: string;
    LinkURL?: string | null;
    Position?: string | null;
    SortOrder?: number | null;
    IsActive: boolean; // Trong JSON là true/false, khớp với boolean
    StartDate?: string | null;
    EndDate?: string | null;
}

// API Endpoint (đã khớp với thông tin bạn cung cấp)
const API_URL = 'http://localhost:8001/api/banners';

const HeroBannerSlider: React.FC = () => {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBanners = async () => {
            setLoading(true);
            setError(null);
            try {
                // Nếu API của bạn cần lọc 'position' từ client, bạn có thể thêm query param:
                // const response = await axios.get<{ data: Banner[] }>(`${API_URL}?position=hero`);
                const response = await axios.get<{ data: Banner[] }>(API_URL);
                const now = new Date();

                const activeBanners = response.data.data // Truy cập đúng vào mảng banner
                    .filter(banner => {
                        // Logic lọc vẫn giữ nguyên và hoạt động với dữ liệu JSON
                        if (!banner.IsActive) return false;
                        if (banner.StartDate && new Date(banner.StartDate) > now) return false;
                        if (banner.EndDate && new Date(banner.EndDate) < now) return false;
                        return true;
                    })
                    .sort((a, b) => (a.SortOrder || 0) - (b.SortOrder || 0));

                setBanners(activeBanners);
            } catch (err) {
                console.error("Error fetching banners:", err);
                let errorMessage = "Không thể tải danh sách banner. Vui lòng thử lại sau.";
                if (axios.isAxiosError(err) && err.response) {
                    errorMessage += ` (Lỗi: ${err.response.status})`;
                }
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        fetchBanners();
    }, []); // useEffect chạy một lần khi component mount

    const getFullImageUrl = (imageUrl: string) => {
        // Logic này vẫn đúng để xử lý cả URL đầy đủ và tương đối
        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
            return imageUrl;
        }
        // Nếu API luôn trả về URL đầy đủ từ Laravel (như trong dữ liệu mẫu),
        // bạn có thể không cần dòng này, nhưng giữ lại không sao.
        const imageBaseUrl = process.env.NEXT_PUBLIC_IMAGE_BASE_URL || 'http://localhost:8001';
        return `${imageBaseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
    };

    if (loading) {
        return (
            <div className="w-full h-[300px] sm:h-[400px] md:h-[500px] bg-sky-100 animate-pulse flex items-center justify-center rounded-lg">
                <p className="text-sky-700">Đang tải banner...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full h-[300px] sm:h-[400px] md:h-[500px] bg-red-100 text-red-700 flex items-center justify-center rounded-lg p-4 text-center">
                {error}
            </div>
        );
    }

    if (banners.length === 0) {
        return (
            <div className="w-full h-[300px] sm:h-[400px] md:h-[500px] bg-slate-100 text-slate-600 flex items-center justify-center rounded-lg p-4 text-center">
                Hiện không có banner nào để hiển thị.
            </div>
        );
    }

    return (
        <section className="w-full max-w-[1500px] mx-auto mb-8 sm:mb-12">
            <Swiper
                modules={[Navigation, Pagination, Autoplay, EffectFade]}
                spaceBetween={0}
                slidesPerView={1}
                navigation
                pagination={{ clickable: true }}
                loop={banners.length > 1}
                autoplay={{
                    delay: 5000,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true,
                }}
                effect="fade"
                fadeEffect={{ crossFade: true }}
                className="hero-banner-swiper rounded-xl overflow-hidden shadow-lg"
            >
                {banners.map((banner, index) => (
                    <SwiperSlide key={banner.BannerID}>
                        <div className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] group">
                            {banner.LinkURL ? (
                                <Link
                                    href={banner.LinkURL}
                                    target={banner.LinkURL.startsWith('http') ? '_blank' : '_self'}
                                    rel={banner.LinkURL.startsWith('http') ? 'noopener noreferrer' : undefined}
                                    className="block w-full h-full"
                                >
                                    <Image
                                        src={getFullImageUrl(banner.ImageURL)}
                                        alt={banner.Title || `Banner ${banner.BannerID}`}
                                        layout="fill"
                                        objectFit="cover"
                                        priority={index === 0}
                                        className="transition-transform duration-500 ease-in-out group-hover:scale-105"
                                        unoptimized={banner.ImageURL.endsWith('.gif')}
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.onerror = null; // Ngăn lặp lỗi
                                            target.src = '/images/placeholder-banner-error.jpg'; // Cần có ảnh này trong public/images
                                            target.srcset = ""; // Xóa srcset nếu có
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
                                    unoptimized={banner.ImageURL.endsWith('.gif')}
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.onerror = null;
                                        target.src = '/images/placeholder-banner-error.jpg';
                                        target.srcset = "";
                                    }}
                                />
                            )}
                            {banner.Title && (
                                <div className="absolute bottom-0 left-0 w-full p-4 sm:p-6 bg-gradient-to-t from-black/70 via-black/50 to-transparent">
                                    <h2 className="text-white text-lg sm:text-xl md:text-2xl font-bold drop-shadow-md">
                                        {banner.Title} {/* Hiển thị Title từ JSON */}
                                    </h2>
                                </div>
                            )}
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
            <style jsx global>{`
                .hero-banner-swiper .swiper-button-next,
                .hero-banner-swiper .swiper-button-prev {
                    color: #ffffff;
                    background-color: rgba(14, 165, 233, 0.4); /* sky-500 with adjusted opacity */
                    border-radius: 50%;
                    width: 38px; /* Slightly smaller */
                    height: 38px;
                    transition: background-color 0.3s ease, opacity 0.3s ease;
                    opacity: 0.6; /* Slightly more transparent by default */
                }
                .hero-banner-swiper:hover .swiper-button-next,
                .hero-banner-swiper:hover .swiper-button-prev {
                    opacity: 1;
                }
                .hero-banner-swiper .swiper-button-next:hover,
                .hero-banner-swiper .swiper-button-prev:hover {
                    background-color: rgba(14, 165, 233, 0.6); /* sky-500 with more opacity */
                }
                .hero-banner-swiper .swiper-button-next::after,
                .hero-banner-swiper .swiper-button-prev::after {
                    font-size: 16px; /* Slightly smaller icon */
                    font-weight: bold;
                }
                .hero-banner-swiper .swiper-pagination-bullet {
                    background-color: rgba(255, 255, 255, 0.7);
                    opacity: 0.8;
                    width: 8px; /* Slightly smaller bullets */
                    height: 8px;
                    transition: background-color 0.3s ease, opacity 0.3s ease, width 0.3s ease, height 0.3s ease;
                }
                .hero-banner-swiper .swiper-pagination-bullet-active {
                    background-color: #0ea5e9; /* sky-500 */
                    opacity: 1;
                    width: 10px; /* Slightly adjusted active bullet */
                    height: 10px;
                }
            `}</style>
        </section>
    );
};

export default HeroBannerSlider;