'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaFacebookF, FaInstagram, FaLinkedinIn } from 'react-icons/fa';

// Hàm helper để tạo URL picsum.photos dựa trên một keyword
const getPicsumUrl = (keyword: string, width = 60, height = 30) => {
  let hash = 0;
  for (let i = 0; i < keyword.length; i++) {
    hash = keyword.charCodeAt(i) + ((hash << 5) - hash);
  }
  const id = Math.abs(hash) % 1000; // Sử dụng một ID ngẫu nhiên dựa trên keyword
  return `https://picsum.photos/id/${id}/${width}/${height}`;
};

const Footer = () => {
  return (
    <footer className="bg-gray-100 text-gray-700 pt-10 pb-8 mt-12 border-t border-gray-200">
      {/* Phần trên cùng: COPYRIGHT và KHU VỰC */}
      <div className="container mx-auto max-w-6xl px-4 text-xs">
        {/* Border dưới và padding dưới cho phần này */}
        <div className="flex flex-wrap justify-center md:justify-between items-center border-b border-gray-200 pb-4 mb-4">
          <p className="text-gray-500 mb-2 md:mb-0">
            © 2025 Shopee. Tất cả các quyền được bảo lưu.
          </p>
          <div className="flex flex-wrap justify-center items-center text-gray-600 gap-x-3 gap-y-1">
            <span className="mr-1">Quốc gia & Khu vực:</span>
            {['Singapore', 'Indonesia', 'Thái Lan', 'Malaysia', 'Việt Nam', 'Philippines', 'Brazil', 'México', 'Colombia', 'Chile', 'Đài Loan'].map((country, index) => (
              <React.Fragment key={country}>
                <Link href="#" className="hover:text-orange-500 whitespace-nowrap">{country}</Link>
                {index < 11 && <span className="text-gray-400">|</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Phần giữa: CÁC CỘT THÔNG TIN */}
      <div className="container mx-auto max-w-6xl px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-y-8 lg:gap-y-0 text-sm">
        {/* Cột 1: DỊCH VỤ KHÁCH HÀNG */}
        <div>
          <h3 className="font-bold mb-4 uppercase text-gray-800">Dịch vụ khách hàng</h3>
          <ul className="space-y-2">
            <li><Link href="#" className="hover:text-orange-500">Trung Tâm Trợ Giúp Shopee</Link></li>
            <li><Link href="#" className="hover:text-orange-500">Shopee Blog</Link></li>
            <li><Link href="#" className="hover:text-orange-500">Shopee Mall</Link></li>
            <li><Link href="#" className="hover:text-orange-500">Hướng Dẫn Mua Hàng/Đặt Hàng</Link></li>
            <li><Link href="#" className="hover:text-orange-500">Hướng Dẫn Bán Hàng</Link></li>
            <li><Link href="#" className="hover:text-orange-500">Ví ShopeePay</Link></li>
            <li><Link href="#" className="hover:text-orange-500">Shopee Xu</Link></li>
            <li><Link href="#" className="hover:text-orange-500">Đơn Hàng</Link></li>
            <li><Link href="#" className="hover:text-orange-500">Trả Hàng/Hoàn Tiền</Link></li>
            <li><Link href="#" className="hover:text-orange-500">Liên Hệ Shopee</Link></li>
            <li><Link href="#" className="hover:text-orange-500">Chính Sách Bảo Hành</Link></li>
          </ul>
        </div>

        {/* Cột 2: SHOPEE VIỆT NAM */}
        <div>
          <h3 className="font-bold mb-4 uppercase text-gray-800">Shopee Việt Nam</h3>
          <ul className="space-y-2">
            <li><Link href="#" className="hover:text-orange-500">Về Shopee</Link></li>
            <li><Link href="#" className="hover:text-orange-500">Tuyển Dụng</Link></li>
            <li><Link href="#" className="hover:text-orange-500">Điều Khoản Shopee</Link></li>
            <li><Link href="#" className="hover:text-orange-500">Chính Sách Bảo Mật</Link></li>
            <li><Link href="#" className="hover:text-orange-500">Shopee Mall</Link></li>
            <li><Link href="#" className="hover:text-orange-500">Kênh Người Bán</Link></li>
            <li><Link href="#" className="hover:text-orange-500">Flash Sale</Link></li>
            <li><Link href="#" className="hover:text-orange-500">Tiếp Thị Liên Kết</Link></li>
            <li><Link href="#" className="hover:text-orange-500">Liên Hệ Truyền Thông</Link></li>
          </ul>
        </div>

        {/* Cột 3 & 4 (ghép chung trong layout này): THANH TOÁN & ĐƠN VỊ VẬN CHUYỂN */}
        <div className="lg:col-span-2">
          {/* THANH TOÁN */}
          <h3 className="font-bold mb-4 uppercase text-gray-800">Thanh toán</h3>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-3 gap-2 mb-8 items-center">
            {['visa', 'mastercard', 'jcb', 'american-express', 'cod', 'tragop', 'shopeepay', 'spaylater'].map((method) => (
              <div key={method} className="flex-shrink-0 w-20 h-9 bg-white border border-gray-200 rounded-sm flex items-center justify-center overflow-hidden">
                <Image
                  src={getPicsumUrl(method)} // SỬ DỤNG HÀM HELPER VỚI PICSUM.PHOTOS
                  alt={method}
                  width={60}
                  height={30}
                  className="object-contain"
                />
              </div>
            ))}
          </div>

          {/* ĐƠN VỊ VẬN CHUYỂN */}
          <h3 className="font-bold mb-4 uppercase text-gray-800">Đơn vị vận chuyển</h3>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-3 gap-2 items-center">
            {['spx', 'ghn', 'viettelpost', 'j-t', 'grabexpress', 'ninjavan', 'best-express', 'ahamove'].map((carrier) => (
              <div key={carrier} className="flex-shrink-0 w-20 h-9 bg-white border border-gray-200 rounded-sm flex items-center justify-center overflow-hidden">
                <Image
                  src={getPicsumUrl(carrier)} // SỬ DỤNG HÀM HELPER VỚI PICSUM.PHOTOS
                  alt={carrier}
                  width={60}
                  height={30}
                  className="object-contain"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Cột 5: THEO DÕI SHOPEE & TẢI ỨNG DỤNG */}
        <div>
          {/* THEO DÕI SHOPEE */}
          <h3 className="font-bold mb-4 uppercase text-gray-800">Theo dõi Shopee</h3>
          <div className="flex space-x-4 mb-8">
            <Link href="#" className="text-gray-700 hover:text-orange-500"><FaFacebookF size={20} /></Link>
            <Link href="#" className="text-gray-700 hover:text-orange-500"><FaInstagram size={20} /></Link>
            <Link href="#" className="text-gray-700 hover:text-orange-500"><FaLinkedinIn size={20} /></Link>
          </div>

          {/* TẢI ỨNG DỤNG SHOPEE */}
          <h3 className="font-bold mb-4 uppercase text-gray-800">Tải ứng dụng Shopee</h3>
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-20 h-20 border border-gray-200 rounded-sm overflow-hidden">
              {/* QR Code có thể vẫn dùng link shopee */}
              <Image src="https://down-vn.img.susercontent.com/file/shopee-qr-code.png" alt="QR Code" width={80} height={80} className="object-contain" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Link href="https://play.google.com/store/apps/details?id=com.shopee.vn" target="_blank" rel="noopener noreferrer" className="block relative w-24 h-8">
                <Image src="https://down-vn.img.susercontent.com/file/google-play-badge.png" alt="Google Play" layout="fill" objectFit="contain" />
              </Link>
              <Link href="https://apps.apple.com/vn/app/shopee-mua-s%E1%BA%AFm-tr%E1%BB%B1c-tuy%E1%BA%BFn/id959885063" target="_blank" rel="noopener noreferrer" className="block relative w-24 h-8">
                <Image src="https://down-vn.img.susercontent.com/file/app-store-badge.png" alt="App Store" layout="fill" objectFit="contain" />
              </Link>
              <Link href="https://appgallery.huawei.com/#/app/C100650951" target="_blank" rel="noopener noreferrer" className="block relative w-24 h-8">
                <Image src="https://down-vn.img.susercontent.com/file/app-gallery-badge.png" alt="AppGallery" layout="fill" objectFit="contain" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Phần cuối: CHÍNH SÁCH VÀ THÔNG TIN CÔNG TY */}
      <div className="container mx-auto max-w-6xl px-4 mt-8 pt-6 border-t border-gray-200 text-xs text-gray-600">
        <div className="flex flex-wrap justify-center md:justify-center gap-x-4 gap-y-2 mb-4">
          <Link href="#" className="hover:text-orange-500">CHÍNH SÁCH BẢO MẬT</Link>
          <span className="text-gray-400">|</span>
          <Link href="#" className="hover:text-orange-500">QUY CHẾ HOẠT ĐỘNG</Link>
          <span className="text-gray-400">|</span>
          <Link href="#" className="hover:text-orange-500">CHÍNH SÁCH VẬN CHUYỂN</Link>
          <span className="text-400">|</span> {/* Đã sửa text-gray-400 */}
          <Link href="#" className="hover:text-orange-500">CHÍNH SÁCH TRẢ HÀNG VÀ HOÀN TIỀN</Link>
        </div>

        <div className="flex flex-col items-center md:items-center text-center md:text-left space-y-2">
          <div className="flex gap-4 mb-2">
            <Image src="https://down-vn.img.susercontent.com/file/vn-e-commerce-portal.png" alt="Đã Đăng Ký Bộ Công Thương" width={120} height={45} className="object-contain" />
            <Image src="https://down-vn.img.susercontent.com/file/vn-ministry-of-industry-and-trade-certification.png" alt="Đã Đăng Ký Bộ Công Thương" width={120} height={45} className="object-contain" />
          </div>
          <p className="text-center">
            Địa chỉ: Tầng 4-5-6, Tòa nhà Capital Place, số 29 đường Liễu Giai, Phường Ngọc Khánh, Quận Ba Đình, Thành phố Hà Nội, Việt Nam. Chăm sóc khách hàng: Gọi tổng đài Shopee (miễn phí) hoặc Trò chuyện với Shopee ngay trên Trung tâm trợ giúp
          </p>
          <p>
            Chịu Trách Nhiệm Quản Lý Nội Dung: Nguyễn Bùi Anh Tuấn
          </p>
          <p>
            Mã số doanh nghiệp: 0106773786 do Sở Kế hoạch và Đầu tư TP Hà Nội cấp lần đầu ngày 10/02/2015
          </p>
          <p>
            © 2015 - Bản quyền thuộc về Công ty TNHH Shopee
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;