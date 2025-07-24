'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
// Import các icon từ react-icons
import { FaUser, FaMapMarkerAlt, FaLock, FaTicketAlt, FaShoppingBag, FaPencilAlt } from 'react-icons/fa';
import { usePathname } from 'next/navigation';
import { RiPassPendingLine } from 'react-icons/ri';
import { MdOutlineSecurity } from "react-icons/md";
import { useAuth } from '@/context/AuthContext';
import { UpdateProfilePayload } from '@/types';
import { getFullImageUrl } from '@/services/api';


export default function ProfileSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  
      // State của form, khởi tạo rỗng
      const [formData, setFormData] = useState<UpdateProfilePayload>({
          FullName: '',
          Username: '',
          Email: '',
          Phone: '',
          Avatar: ''
      });
  useEffect(() => {
        if (user) {
            setFormData({
                FullName: user.FullName,
                Username: user.Username,
                Email: user.Email,
                Phone: user.Phone,
                Avatar: user.Avatar || '',
            });
        }
    }, [user]); // Chạy lại khi user thay đổi
  const navItems = [
    { name: 'Hồ sơ', icon: FaUser, href: '/account/profile' },
    { name: 'Địa chỉ', icon: FaMapMarkerAlt, href: '/account/address' },
    { name: 'Đổi mật khẩu', icon: FaLock, href: '/account/password' },
    { name: 'Kho voucher', icon: FaTicketAlt, href: '/account/vouchers' },
    { name: 'Đơn mua', icon: FaShoppingBag, href: '/account/purchase' },
    { name: 'Chi tiêu', icon: RiPassPendingLine, href: '/account/spending'},
    { name: 'Bảo mật', icon: MdOutlineSecurity,href:'/account/security'}
  ];
  const DEFAULT_PROFILE_IMAGE = '/images/user-default.png';

  return (
    <aside className="w-55 p-5 border-r min-w-[200px] border-gray-200"> {/* Sidebar cố định width, padding, border phải */}
      <div className="flex items-center mb-8"> {/* Header của sidebar */}
        {/* Placeholder avatar */}
        <div className="w-12 h-12 rounded-full bg-gray-300 mr-4 overflow-hidden">
          <img 
            src={formData.Avatar ? getFullImageUrl(formData.Avatar) : DEFAULT_PROFILE_IMAGE} 
            alt="Avatar"
            className="w-full h-full object-cover" // object-cover để ảnh không bị méo
          />
        </div>
        <div className="flex flex-col">
          <p className="font-bold text-gray-800">{formData.FullName}</p>
          <Link href="/account/profile" className="flex items-center text-sm text-gray-600 hover:text-blue-600">
            <FaPencilAlt className="mr-1 text-xs" /> Sửa hồ sơ
          </Link>
        </div>
      </div>
      <nav className="mt-8"> {/* Navigation menu */}
        <p className="font-bold text-gray-700 mb-4 pl-1">Tài khoản của tôi</p>
        <ul>
          {navItems.map((item) => {
            // Sửa logic check active pathname
            const isActive = pathname === item.href;
            return (
              <li key={item.name} className="mb-2">
                <Link
                  href={item.href}
                  className={`flex items-center py-2 px-4 rounded-md text-gray-800 transition-colors duration-200
                  ${isActive ? 'bg-blue-50 text-blue-600 font-bold ' : 'hover:bg-gray-100 hover:text-blue-600'}`}
                >
                  <item.icon className={`mr-3 text-lg ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}