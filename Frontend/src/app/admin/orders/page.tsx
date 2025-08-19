import { Suspense } from 'react';
import OrderManagement from './components/OrderManagement';

export default function AdminOrdersPage() {
  return (
    // Suspense là cần thiết để các component con có thể sử dụng hook như useSearchParams
    <Suspense fallback={<div className="flex justify-center items-center h-screen">Đang tải trang quản lý...</div>}>
      <OrderManagement />
    </Suspense>
  );
}