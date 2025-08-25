'use client'; // <-- BƯỚC 1: Chuyển thành Client Component

import React, { useState, useEffect } from 'react'; // <-- Import hooks
import axios from 'axios'; // <-- Import axios
import Link from 'next/link'; // <-- Import Link để điều hướng tốt hơn

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from "lucide-react"
import { API_URL } from '@/lib/config'; // <-- Import API_URL
import type { IHome } from '@/types/Ihome'; 
import { getStorageImageUrl } from '@/services/api';

const Footer = () => {
  const [categories, setCategories] = useState<IHome.Category[]>([]);
  useEffect(() => {
    axios.get(`${API_URL}/categorySubMenu`, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true
    })
    .then((response) => {
        // Lọc và chỉ lấy các danh mục đang hoạt động (IsActive)
        const activeCategories = response.data.filter((cat: IHome.Category) => cat.IsActive);
        setCategories(activeCategories);
    })
    .catch((error) => console.error('Lỗi khi tải danh mục cho Footer:', error));
  }, []);
  return (
     <footer className="bg-gradient-to-r from-slate-500 via-slate-600 to-orange-500 text-white mt-20">
      {/* Main footer content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <Link href="/">
                <img
                  src={getStorageImageUrl("/logo/logo.png") || "/placeholder.svg"}
                  alt="emarket logo"
                  className="w-60 h-20 object-cover bg-none hover:scale-105 transition-transform duration-200"
                />
              </Link>
            <p className="text-gray-300 text-sm leading-relaxed">
              Sàn thương mại điện tử hàng đầu Việt Nam, mang đến trải nghiệm mua sắm tuyệt vời với hàng triệu sản phẩm
              chất lượng.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <MapPin className="w-4 h-4 text-orange-400" />
                <span>123 Nguyễn Huệ, Quận 1, TP.HCM</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <Phone className="w-4 h-4 text-orange-400" />
                <span>1900 1234</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <Mail className="w-4 h-4 text-orange-400" />
                <span>support@emarket.vn</span>
              </div>
            </div>
          </div>

          {/* Product Categories */}
          <div className="space-y-4">
            <h4 className="font-semibold text-orange-400">Danh mục sản phẩm</h4>
            <ul className="space-y-2 text-sm">
              {/* BƯỚC 4: Render danh sách danh mục từ state */}
              {categories.length > 0 ? (
                categories.map((cat) => (
                  <li key={cat.CategoryID}>
                    <Link
                      href={`/categoryDetail/${cat.CategoryID}`}
                      className="text-gray-300 hover:text-orange-400 transition-colors"
                    >
                      {cat.Name}
                    </Link>
                  </li>
                ))
              ) : (
                // Hiển thị placeholder trong khi chờ tải hoặc nếu không có dữ liệu
                <li>
                  <span className="text-gray-400">Đang tải...</span>
                </li>
              )}
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h4 className="font-semibold text-orange-400">Chăm sóc khách hàng</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-gray-300 hover:text-orange-400 transition-colors">
                  Trung tâm trợ giúp
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-orange-400 transition-colors">
                  Hướng dẫn mua hàng
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-orange-400 transition-colors">
                  Chính sách đổi trả
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-orange-400 transition-colors">
                  Chính sách bảo hành
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-orange-400 transition-colors">
                  Chính sách vận chuyển
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-orange-400 transition-colors">
                  Chính sách thanh toán
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-orange-400 transition-colors">
                  Chính sách bảo mật
                </a>
              </li>
            </ul>
          </div>

          {/* Account & Newsletter */}
          <div className="space-y-4">
            <h4 className="font-semibold text-orange-400">Tài khoản của tôi</h4>
            <ul className="space-y-2 text-sm mb-4">
              <li>
                <a href="/signin" className="text-gray-300 hover:text-orange-400 transition-colors">
                  Đăng nhập
                </a>
              </li>
              <li>
                <a href="/signup" className="text-gray-300 hover:text-orange-400 transition-colors">
                  Đăng ký
                </a>
              </li>
              <li>
                <a href="/account/profile" className="text-gray-300 hover:text-orange-400 transition-colors">
                  Thông tin tài khoản
                </a>
              </li>
              <li>
                <a href="/account/purchase" className="text-gray-300 hover:text-orange-400 transition-colors">
                  Lịch sử đơn hàng
                </a>
              </li>
              
            </ul>

            {/* <div className="space-y-3">
              <h5 className="font-medium text-orange-400">Đăng ký nhận tin</h5>
              <div className="flex gap-2">
                <Input
                  placeholder="Email của bạn"
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-gray-400"
                />
                <Button className="bg-orange-500 hover:bg-orange-600">Đăng ký</Button>
              </div>
            </div> */}
          </div>
        </div>

        <Separator className="my-8 bg-slate-700" />

        {/* Payment methods and social */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
          {/* Payment methods */}
          <div className="space-y-3">
            <h5 className="font-medium text-orange-400">Phương thức thanh toán</h5>
            <div className="flex flex-wrap gap-3">
              <div className="bg-white rounded p-2">
                <img src={getStorageImageUrl('images/visa-logo-generic.png')} alt="Visa" className="h-6" />
              </div>
              <div className="bg-white rounded p-2">
                <img src={getStorageImageUrl('images/mastercard-logo.png')} alt="Mastercard" className="h-6" />
              </div>
              <div className="bg-white rounded p-2">
                <img src={getStorageImageUrl('images/generic-dumpling-logo.png')} alt="MoMo" className="h-6" />
              </div>
              <div className="bg-white rounded p-2">
                <img src={getStorageImageUrl('images/zalopay-logo.png')} alt="ZaloPay" className="h-6" />
              </div>
              <div className="bg-white rounded p-2">
                <img src={getStorageImageUrl('images/generic-payment-gateway-logo.png')} alt="VNPay" className="h-6" />
              </div>
              <div className="bg-white rounded p-2">
                <img src={getStorageImageUrl('images/atm-card-logo.png')} alt="ATM" className="h-6" />
              </div>
            </div>
          </div>

          {/* Social media */}
          <div className="space-y-3">
            <h5 className="font-medium text-orange-400">Kết nối với chúng tôi</h5>
            <div className="flex gap-3">
              <a href="#" className="bg-slate-800 p-2 rounded hover:bg-orange-500 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="bg-slate-800 p-2 rounded hover:bg-orange-500 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="bg-slate-800 p-2 rounded hover:bg-orange-500 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="bg-slate-800 p-2 rounded hover:bg-orange-500 transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <Separator className="my-6 bg-slate-700" />

        {/* Copyright */}
        <div className="text-center text-sm text-gray-400">
          <p>&copy; 2024 EMarket. Tất cả quyền được bảo lưu.</p>
          <p className="mt-1">
            <a href="#" className="hover:text-orange-400 transition-colors">
              Điều khoản sử dụng
            </a>
            {" | "}
            <a href="#" className="hover:text-orange-400 transition-colors">
              Chính sách riêng tư
            </a>
            {" | "}
            <a href="#" className="hover:text-orange-400 transition-colors">
              Quy chế hoạt động
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;