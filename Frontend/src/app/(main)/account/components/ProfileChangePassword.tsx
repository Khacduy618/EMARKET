// app/(main)/(account)/components/ProfileChangePassword.tsx
'use client';

import React, { useState } from 'react';

export default function ProfileChangePassword() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setError('Vui lòng điền đầy đủ tất cả các trường.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError('Mật khẩu mới và xác nhận mật khẩu không khớp.');
      return;
    }

    // Gửi yêu cầu đổi mật khẩu đến API
    console.log({ currentPassword, newPassword });
    // Giả lập API call
    setTimeout(() => {
      setSuccess('Mật khẩu của bạn đã được thay đổi thành công!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    }, 1000);
  };

  return (
    <div>
      {/* Header của trang đổi mật khẩu */}
      <div className="pb-6">
        <h1 className="text-2xl font-bold mb-1 text-black">Đổi Mật Khẩu</h1>
        <p className="text-sm text-gray-600">Để bảo mật tài khoản, vui lòng không chia sẻ mật khẩu cho người khác</p>
      </div>

      {/* Đường kẻ ngang và form đổi mật khẩu */}
      <div className="pt-6 border-t border-gray-200">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-lg"> {/* Giới hạn chiều rộng form */}

          {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
          {success && <p className="text-green-500 text-sm mb-2">{success}</p>}

          <div className="flex items-center">
            <label htmlFor="currentPassword" className="w-40 text-gray-600 text-sm">Mật khẩu hiện tại</label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="flex-1 py-2 px-3 border border-gray-300 rounded-md text-sm
                         focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
              required
            />
          </div>

          <div className="flex items-center">
            <label htmlFor="newPassword" className="w-40 text-gray-600 text-sm">Mật khẩu mới</label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="flex-1 py-2 px-3 border border-gray-300 rounded-md text-sm
                         focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
              required
            />
          </div>

          <div className="flex items-center">
            <label htmlFor="confirmNewPassword" className="w-40 text-gray-600 text-sm">Xác nhận mật khẩu</label>
            <input
              type="password"
              id="confirmNewPassword"
              name="confirmNewPassword"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              className="flex-1 py-2 px-3 border border-gray-300 rounded-md text-sm
                         focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
              required
            />
          </div>

          <div className="mt-5 pl-40"> {/* Nút xác nhận, căn chỉnh */}
            <button
              type="submit"
              className="bg-orange-500 text-white py-2 px-8 rounded-md text-base
                         cursor-pointer transition-colors duration-200 hover:bg-orange-600"
            >
              Xác nhận
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}