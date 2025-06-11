// export default function BannerSlider() {
//     return (
//         <div className="w-full p-4">
//             <div className="overflow-hidden rounded-lg">
//                 <img
//                     src="https://cf.shopee.vn/file/vn-11134258-7ras8-mas3epwuamyp44_xhdpi"
//                     alt="iPhone"
//                     className="w-full h-auto object-cover"
//                 />
//             </div>
//         </div>
//     );
// }
// src/components/BannerSlider.tsx

export default function BannerSlider() {
    // Giả sử bạn có 2 ảnh này
    const desktopBannerUrl = "https://cf.shopee.vn/file/vn-11134258-7ras8-mas3epwuamyp44_xhdpi";
    const mobileBannerUrl = "https://treobangron.com.vn/wp-content/uploads/2023/01/banner-shopee-12.jpg"; // Một ảnh khác, có thể là ảnh vuông

    return (
        <div className="w-full">
            <div className="overflow-hidden rounded-lg shadow-sm">
                <picture>
                    <source media="(max-width: 767px)" srcSet={mobileBannerUrl} />
                    <source media="(min-width: 768px)" srcSet={desktopBannerUrl} />
                    <img
                        src={desktopBannerUrl}
                        alt="Khuyến mãi đặc biệt"
                        className="w-full h-auto object-cover"
                    />
                </picture>
            </div>
        </div>
    );
}