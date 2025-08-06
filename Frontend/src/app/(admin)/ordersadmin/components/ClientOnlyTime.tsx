// components/shared/ClientOnlyTime.tsx
'use client';

import { useState, useEffect } from 'react';

export default function ClientOnlyTime() {
  const [currentTime, setCurrentTime] = useState('');
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    // Component đã được mount ở client
    setHasMounted(true);

    // Cập nhật thời gian ban đầu
    setCurrentTime(new Date().toLocaleTimeString('vi-VN'));

    // (Tùy chọn) Cập nhật thời gian mỗi giây
    const intervalId = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('vi-VN'));
    }, 1000);

    // Dọn dẹp interval khi component unmount
    return () => clearInterval(intervalId);
  }, []); // Chạy một lần duy nhất sau khi mount

  // Nếu chưa mount, không render gì cả để tránh lỗi hydration
  if (!hasMounted) {
    return <span className="font-medium">--:--:--</span>; // Hoặc render một placeholder
  }

  // Sau khi đã mount, render thời gian của client
  return <span className="font-medium">{currentTime}</span>;
}