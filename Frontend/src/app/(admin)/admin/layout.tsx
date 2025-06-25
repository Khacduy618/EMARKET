import Link from 'next/link';
import 'bootstrap/dist/css/bootstrap.min.css';

import './style.css';
import { LayoutDashboard, ShoppingCart, Package, Settings } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-50">

  
      {/* --- NỘI DUNG CHÍNH --- */}
      <main className="flex-1 p-6 md:p-8 lg:p-10 overflow-y-auto">
        {children}
      </main>
      
    </div>
  );
}