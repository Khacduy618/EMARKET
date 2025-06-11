// // import CategoryMenu from "./components/home/CategorySlider"; // <-- THAY ĐỔI: Sử dụng component menu dọc mới
// // import FlashSaleSection from "./components/home/FlashSales";
// // import BestSellingProducts from "./components/home/BestSellingProducts";
// // import HeroBannerSlider from "./components/home/banner";
// // import ProductsCart from "./components/home/ProductCard";
// // import NewArrivalsSection from "./components/home/NewArrivalSection";
// // import BannerSlider from "./components/BannerSlider";

// // export default function Home() {
// //   return (
// //     <div>
// //       <div className="w-[1440px] mx-auto px-4 sm:px-6 py-8">
// //         <div className="flex flex-row gap-6">
// //           <aside className="w-60 flex-shrink-0 hidden lg:block sticky top-18 h-screen overflow-y-auto">
// //             <CategoryMenu />
// //           </aside>
// //           <main className="flex-grow w-[1160px] ml-10">
// //             <div className="space-y-8 w-[1160px]">
// //               <BannerSlider />
// //               <FlashSaleSection />
// //               <BestSellingProducts />
// //               <HeroBannerSlider />
// //               <ProductsCart />
// //               <NewArrivalsSection />
// //             </div>
// //           </main>

// //         </div>
// //       </div>
// //     </div>
// //   );
// // }
// // // src/app/page.tsx

// // src/app/page.tsx

// 'use client'; // <-- BƯỚC 1.1: CHUYỂN THÀNH CLIENT COMPONENT

// import { useState } from 'react'; // <-- BƯỚC 1.2: IMPORT useState
// import CategoryMenu from "./components/home/CategorySlider";
// import FlashSaleSection from "./components/home/FlashSales";
// import BestSellingProducts from "./components/home/BestSellingProducts";
// import HeroBannerSlider from "./components/home/banner";
// import ProductsCart from "./components/home/ProductCard";
// import NewArrivalsSection from "./components/home/NewArrivalSection";
// import BannerSlider from "./components/BannerSlider";
// // Giả sử bạn đã tạo component menu responsive theo Bước 2
// import ResponsiveCategoryMenu from './components/home/ResponsiveCategoryMenu';

// export default function Home() {
//   // BƯỚC 1.3: THÊM STATE ĐỂ QUẢN LÝ MENU TRÊN MOBILE
//   const [isMenuOpen, setIsMenuOpen] = useState(false);

//   return (
//     <div>
//       {/* BƯỚC 1.4: THÊM MENU RESPONSIVE VÀO ĐÂY */}
//       {/* Component này sẽ là một lớp phủ (overlay) trên mobile và tự ẩn đi trên desktop */}
//       <ResponsiveCategoryMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

//       <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 py-8">
//         <div className="flex flex-row gap-6">
//           {/* Menu cho DESKTOP (giữ nguyên, không sửa) */}
//           <aside className="w-60 flex-shrink-0 hidden lg:block sticky top-18 h-screen overflow-y-auto">
//             <CategoryMenu />
//           </aside>

//           <main className="flex-grow min-w-0"> {/* Sửa nhẹ: thêm min-w-0 để tránh lỗi flexbox */}
//             {/* BƯỚC 1.5: THÊM NÚT BẤM "HAMBURGER" CHỈ HIỆN TRÊN MOBILE */}
//             <div className="lg:hidden mb-4">
//               <button
//                 onClick={() => setIsMenuOpen(true)}
//                 className="flex items-center gap-2 p-2 border rounded-md bg-white text-gray-700 font-semibold"
//                 aria-label="Mở danh mục"
//               >
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
//                 </svg>
//                 <span>Danh mục</span>
//               </button>
//             </div>

//             {/* Phần nội dung chính (giữ nguyên, không sửa) */}
//             <div className="w-[1160px] space-y-8">
//               <BannerSlider />
//               <FlashSaleSection />
//               <BestSellingProducts />
//               <HeroBannerSlider />
//               <ProductsCart />
//               <NewArrivalsSection />
//             </div>
//           </main>
//         </div>
//       </div>
//     </div>
//   );
// }
// src/app/page.tsx

'use client';

import { useState } from 'react';
import CategoryMenu from "./components/home/CategorySlider";
import ResponsiveCategoryMenu from './components/home/ResponsiveCategoryMenu'; // Menu cho mobile
import FlashSaleSection from "./components/home/FlashSales";
import BestSellingProducts from "./components/home/BestSellingProducts";
import HeroBannerSlider from "./components/home/banner";
import ProductsCart from "./components/home/ProductCard";
import NewArrivalsSection from "./components/home/NewArrivalSection";
import BannerSlider from "./components/BannerSlider";

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div>
      {/* Menu responsive cho mobile (giữ nguyên) */}
      <ResponsiveCategoryMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      {/* 
        SỬA ĐỔI CHÍNH Ở ĐÂY:
        - Bỏ `w-[1440px]` cố định, thay bằng `w-full max-w-[1440px]` để nó linh hoạt
          nhưng không vượt quá 1440px.
        - `px-4 sm:px-6` để có padding hợp lý trên mọi thiết bị.
      */}
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-row gap-6">

          {/* Menu cho DESKTOP (giữ nguyên) */}
          <aside className="w-60 flex-shrink-0 hidden lg:sticky top-[144px] self-start   lg:block sticky h-screen-minus-header">
            <CategoryMenu />
          </aside>

          {/* 
            SỬA ĐỔI KHỐI MAIN:
            - Bỏ `w-[1160px]` và `ml-10`.
            - Thêm `flex-grow` để nó tự động chiếm hết không gian còn lại.
            - Thêm `min-w-0` để tránh lỗi co giãn của flexbox khi nội dung bên trong quá lớn.
          */}
          <main className="flex-grow min-w-0">
            {/* Nút "Hamburger" cho tablet và mobile (giữ nguyên) */}
            <div className="lg:hidden mb-4">
              <button
                onClick={() => setIsMenuOpen(true)}
                className="flex items-center gap-2 p-2 border rounded-md bg-white text-gray-700 font-semibold"
                aria-label="Mở danh mục"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
                <span>Danh mục</span>
              </button>
            </div>

            {/* Bỏ div `w-[1160px]` bao bọc bên ngoài */}
            <div className="space-y-8">
              <BannerSlider />
              <FlashSaleSection />
              <BestSellingProducts />
              <HeroBannerSlider />
              <ProductsCart />
              <NewArrivalsSection />
            </div>
          </main>
        </div>
      </div>

      {/* Thêm class tiện ích vào global CSS nếu cần */}
      <style jsx global>{`
        .h-screen-minus-header {
          height: calc(100vh - 80px); /* Giả sử header cao 80px */
        }
      `}</style>
    </div>
  );
}