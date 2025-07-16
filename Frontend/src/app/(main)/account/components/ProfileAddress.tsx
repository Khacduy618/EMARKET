'use client';

import React from 'react';
import { FaPlus } from 'react-icons/fa';

// Định nghĩa interface cho Địa chỉ
interface Address {
  id: string;
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  isDefault: boolean;
  isPickup: boolean;
  isReturn: boolean;
}

export default function ProfileAddress() {
  // Dữ liệu giả định cho danh sách địa chỉ
  const addresses: Address[] = [
    {
      id: '1',
      name: 'Hiển Diệu',
      phone: '(+84) 916 452 436',
      addressLine1: 'Số 19, Đường Hoàng Trung Thông',
      addressLine2: 'Phường Hòa Minh, Quận Liên Chiểu, Đà Nẵng',
      isDefault: true,
      isPickup: false,
      isReturn: false,
    },
    {
      id: '2',
      name: 'Hiển Diệu',
      phone: '(+84) 916 452 436',
      addressLine1: 'Số 24, Nguyễn Chí Thanh',
      addressLine2: 'Phường Thạch Thang, Quận Hải Châu, Đà Nẵng',
      isDefault: false,
      isPickup: true,
      isReturn: true,
    },
    {
      id: '3',
      name: 'Hiển Diệu',
      phone: '(+84) 916 452 436',
      addressLine1: 'Số 33, Mai Lão Bạng',
      addressLine2: 'Phường Thuận Phước, Quận Hải Châu, Đà Nẵng',
      isDefault: false,
      isPickup: false,
      isReturn: false,
    },
  ];

  return (
    <div> {/* Không cần bg-white ở đây vì layout đã có */}
      {/* Header của trang địa chỉ */}
      <div className="flex justify-between items-center pb-6">
        <h1 className="text-2xl font-bold text-black">Địa chỉ của tôi</h1>
        <button className="bg-orange-500 text-white py-2 px-4 rounded-md flex items-center transition-colors duration-200 hover:bg-orange-600">
          <FaPlus className="mr-2" /> Thêm địa chỉ mới
        </button>
      </div>

      {/* Phần tiêu đề "Địa chỉ" và danh sách */}
      <div className="pt-6 border-t border-gray-200">
        <h2 className="text-xl font-bold mb-6 text-black">Địa chỉ</h2>

        {addresses.map((address, index) => (
          <div key={address.id} className={`py-6 ${index < addresses.length - 1 ? 'border-b border-gray-200' : ''}`}>
            <div className="flex justify-between items-start mb-2">
              {/* Tên và số điện thoại */}
              <div>
                <span className="font-semibold text-lg text-black">{address.name}</span>
                <span className="text-gray-700 ml-3">{address.phone}</span>
              </div>
              {/* Các nút hành động */}
              <div className="flex items-center text-sm">
                <a href="#" className="text-blue-500 hover:underline">Cập nhật</a>
                {!address.isDefault && ( // Chỉ hiển thị Xóa nếu không phải địa chỉ mặc định
                    <span className="mx-2 text-gray-300">|</span> // Dấu chia
                )}
                {!address.isDefault && (
                  <a href="#" className="text-red-500 hover:underline">Xóa</a>
                )}
              </div>
            </div>

            {/* Dòng địa chỉ */}
            <p className="text-gray-700 text-sm">{address.addressLine1}</p>
            <p className="text-gray-700 text-sm mb-4">{address.addressLine2}</p>

            {/* Các tag trạng thái */}
            <div className="flex gap-2 mb-4">
              {address.isDefault && (
                <span className="text-xs border border-red-400 text-red-500 px-2 py-0.5 rounded-full">
                  Mặc định
                </span>
              )}
              {address.isPickup && (
                <span className="text-xs border border-gray-300 text-gray-700 px-2 py-0.5 rounded-full">
                  Địa chỉ lấy hàng
                </span>
              )}
              {address.isReturn && (
                <span className="text-xs border border-gray-300 text-gray-700 px-2 py-0.5 rounded-full">
                  Địa chỉ trả hàng
                </span>
              )}
            </div>

            {/* Nút Thiết lập mặc định */}
            {!address.isDefault && (
              <button className="bg-gray-100 text-gray-700 py-2 px-4 rounded-md text-sm transition-colors duration-200 hover:bg-gray-200">
                Thiết lập mặc định
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}