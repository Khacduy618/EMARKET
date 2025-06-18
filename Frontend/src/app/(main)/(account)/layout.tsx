// app/(main)/(account)/layout.tsx
import React from 'react';
import ProfileSidebar from './components/ProfileSidebar'; // Đường dẫn import của ProfileSidebar không thay đổi

interface AccountLayoutProps { // Đổi tên interface cho phù hợp
  children: React.ReactNode;
}

export default function AccountLayout({ children }: AccountLayoutProps) { // Đổi tên component
  return (
    <div className="flex justify-center py-8 px-4 bg-gray-100 min-h-[calc(100vh-100px)]">
      <div className="flex w-full max-w-6xl gap-5 bg-white rounded-lg shadow-sm border border-gray-200">
        <ProfileSidebar />
        <main className="flex-1 p-6"> {/* Padding áp dụng cho toàn bộ nội dung chính */}
          {children}
        </main>
      </div>
    </div>
  );
}