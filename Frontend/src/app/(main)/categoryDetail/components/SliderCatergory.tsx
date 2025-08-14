// app/components/HeroSlider.tsx
'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';

// Import các module và component cần thiết của Swiper
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, A11y } from 'swiper/modules';

// Import các file CSS của Swiper để có style cơ bản
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';
import { API_URL } from '@/lib/config';

// Định nghĩa kiểu dữ liệu cho Banner để code an toàn hơn
interface Banner {
    BannerID: number;
    Title: string | null;
    ImageURL: string;
    LinkURL: string | null;
}

export default function CategorySlider() {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                setIsLoading(true);
                // Gọi API để lấy banner cho vị trí 'homepage_slider'
                const response = await axios.get<Banner[]>(`${API_URL}/category_banner`, {
                    headers: {
        'ngrok-skip-browser-warning': 'true'
    },      
                    params: { position: 'homepage_slider' }
                });
                setBanners(response.data);
            } catch (error) {
                console.error("Lỗi không thể tải banner:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchBanners();
    }, []); // Mảng rỗng đảm bảo useEffect chỉ chạy một lần

    // Hiển thị giao diện tạm thời khi đang tải để tránh giật layout
    if (isLoading) {
        return (
            <div className="aspect-[2.5/1] w-full bg-gray-200 animate-pulse rounded-lg"></div>
        );
    }

    // Không hiển thị gì nếu không có banner nào
    if (banners.length === 0) {
        return null;
    }

    return (
        <div className="w-[1200px] h-[300px] mx-auto rounded-lg overflow-hidden relative group">
            <Swiper
                // Kích hoạt các module đã import
                modules={[Navigation, Pagination, Autoplay, A11y]}
                spaceBetween={0}
                slidesPerView={1}
                loop={true} // Cho phép lặp vô tận
                autoplay={{
                    delay: 4000, // Tự động chuyển slide sau 4 giây
                    disableOnInteraction: false, // Vẫn tự chạy sau khi người dùng tương tác
                }}
                pagination={{
                    clickable: true, // Cho phép click vào các chấm tròn
                }}
                navigation={{ // Sử dụng các nút tùy chỉnh
                    nextEl: '.swiper-button-next-custom',
                    prevEl: '.swiper-button-prev-custom',
                }}
            >
                {banners.map((banner) => (
                    <SwiperSlide key={banner.BannerID}>
                        {banner.LinkURL ? (
                            <Link href={banner.LinkURL} className="block">
                                <img
                                    src={banner.ImageURL}
                                    alt={banner.Title || 'Banner quảng cáo'}
                                    className="w-full h-full object-cover"
                                />
                            </Link>
                        ) : (
                            <img
                                src={banner.ImageURL}
                                alt={banner.Title || 'Banner quảng cáo'}
                                className="w-full h-full object-cover"
                            />
                        )}
                    </SwiperSlide>
                ))}
            </Swiper>

            {/* Các nút Next/Prev tùy chỉnh, chỉ hiện khi hover */}
            <div className="swiper-button-prev-custom absolute top-1/2 -translate-y-1/2 left-4 z-10 p-2 bg-black bg-opacity-30 rounded-full cursor-pointer text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </div>
            <div className="swiper-button-next-custom absolute top-1/2 -translate-y-1/2 right-4 z-10 p-2 bg-black bg-opacity-30 rounded-full cursor-pointer text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </div>
        </div>
    );
}