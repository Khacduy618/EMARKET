import { Suspense } from 'react';
import OrderManagement from './components/OrderManagement';

export default function AdminOrdersPage() {
  return (
    // Suspense là cần thiết khi một component con sử dụng hook `useSearchParams`
    <Suspense fallback={<div className="flex justify-center items-center h-screen">Đang tải trang quản lý đơn hàng...</div>}>
      <OrderManagement />
    </Suspense>
  );
}