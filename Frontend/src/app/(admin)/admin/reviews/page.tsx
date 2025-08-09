import { Suspense } from 'react';
import AdminReviewsList from './components/admin-reviews-list';

export default function AdminReviewsPage() {
  return (
    <Suspense 
      fallback={
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <span className="ml-3">Đang tải trang quản lý reviews...</span>
        </div>
      }
    >
      <AdminReviewsList/>
    </Suspense>
  );
}