'use client';

import React, { useState, ChangeEvent } from 'react';
import Image from 'next/image';

// Placeholder image nếu bạn muốn dùng một ảnh mặc định khi chưa upload
const DEFAULT_PROFILE_IMAGE = '/images/user-default.png'; // Đặt một ảnh default trong thư mục public/images

export default function ProfileDetails() {
  const [profile, setProfile] = useState({
    name: '',
    gender: 'female', // Mặc định Nữ theo ảnh
  });
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfileImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Profile saved:', profile, 'Image:', profileImage);
    // Logic để gửi dữ liệu lên server
  };

  return (
    <div className="bg-white"> {/* Thẻ chính của phần chi tiết hồ sơ */}
      <h1 className="text-2xl font-bold mb-1 text-black">Hồ Sơ Của Tôi</h1>
      <p className="text-sm text-gray-600 mb-8">Quản lý thông tin hồ sơ để bảo mật tài khoản</p>

      <div className="flex gap-10 pt-5 border-t border-gray-200"> {/* Phần nội dung chính, chia 2 cột */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-4 pr-10"> {/* Form thông tin */}
          <div className="flex items-center mb-2">
            <label className="w-32 text-gray-600 text-sm">Tên đăng nhập</label>
            <span className="flex-1 text-gray-800 text-sm">lenguyenhiendieu</span>
          </div>

          <div className="flex items-center mb-2">
            <label htmlFor="name" className="w-32 text-gray-600 text-sm">Tên</label>
            <input
              type="text"
              id="name"
              name="name"
              value={profile.name}
              onChange={handleChange}
              className="flex-1 py-2 px-3 border border-gray-300 rounded-md text-sm max-w-xs text-black
                         focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
              placeholder="Nhập tên của bạn"
            />
          </div>

          <div className="flex items-center mb-2">
            <label className="w-32 text-gray-600 text-sm">Email</label>
            <span className="flex-1 text-gray-800 text-sm">di**********@gmail.com
              <a href="#" className="text-blue-500 ml-3 text-sm hover:underline">Thay Đổi</a>
            </span>
          </div>

          <div className="flex items-center mb-2">
            <label className="w-32 text-gray-600 text-sm">Số điện thoại</label>
            <span className="flex-1 text-gray-800 text-sm">**********36
              <a href="#" className="text-blue-500 ml-3 text-sm hover:underline">Thay Đổi</a>
            </span>
          </div>

          <div className="flex items-center mb-2">
            <label className="w-32 text-gray-600 text-sm">Giới tính</label>
            <div className="flex gap-5 flex-1">
              <label className="flex items-center text-sm cursor-pointer">
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={profile.gender === 'male'}
                  onChange={handleChange}
                  className="mr-2 accent-blue-500 w-4 h-4 text-black"
                /> Nam
              </label>
              <label className="flex items-center text-sm cursor-pointer">
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={profile.gender === 'female'}
                  onChange={handleChange}
                  className="mr-2 accent-blue-500 w-4 h-4 text-black"
                /> Nữ
              </label>
              <label className="flex items-center text-sm cursor-pointer">
                <input
                  type="radio"
                  name="gender"
                  value="other"
                  checked={profile.gender === 'other'}
                  onChange={handleChange}
                  className="mr-2 accent-blue-500 w-4 h-4 text-black"
                /> Khác
              </label>
            </div>
          </div>

          <div className="flex items-center mb-2">
            <label className="w-32 text-gray-600 text-sm">Ngày sinh</label>
            <span className="flex-1 text-gray-800 text-sm">**/**/2000
              <a href="#" className="text-blue-500 ml-3 text-sm hover:underline">Thay Đổi</a>
            </span>
          </div>

          <div className="mt-5 pl-32"> {/* Nút lưu, căn chỉnh */}
            <button
              type="submit"
              className="bg-orange-500 text-white py-2 px-8 rounded-md text-base
                         cursor-pointer transition-colors duration-200 hover:bg-orange-600"
            >
              Lưu
            </button>
          </div>
        </form>

        <div className="flex-shrink-0 w-64 flex flex-col items-center justify-center pl-5 border-l border-gray-200"> {/* Phần upload ảnh */}
          {profileImage ? (
            <Image
              src={profileImage}
              alt="Profile"
              width={96} // 96px = w-24
              height={96} // 96px = h-24
              className="w-24 h-24 rounded-full object-cover mb-5 border border-gray-200 shadow-md"
            />
          ) : (
            <div className="w-24 h-24 p-3 rounded-full bg-gray-300 mb-5 border border-gray-200">
                <img src={DEFAULT_PROFILE_IMAGE} alt="Avatar" />
            </div>
          )}
          <input
            type="file"
            id="imageUpload"
            accept="image/jpeg, image/png"
            onChange={handleImageChange}
            className="hidden" // Ẩn input file mặc định
          />
          <button
            type="button"
            onClick={() => document.getElementById('imageUpload')?.click()}
            className="bg-white text-gray-700 border border-gray-300 py-2 px-5 rounded-md
                       cursor-pointer mb-3 transition-colors duration-200 hover:bg-gray-100 hover:border-gray-400"
          >
            Chọn Ảnh
          </button>
          <p className="text-xs text-gray-500 my-0.5">Dụng lượng file tối đa 1 MB</p>
          <p className="text-xs text-gray-500 my-0.5">Định dạng:.JPEG, .PNG</p>
        </div>
      </div>
    </div>
  );
}