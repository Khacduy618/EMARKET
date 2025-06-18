'use client'
import { ArrowUpRight, DollarSign, Users, CreditCard, Activity, Package, AlertCircle } from 'lucide-react';
import Link from 'next/link';

// Component Card để tái sử dụng
const StatCard = ({ title, value, icon: Icon, change, changeType }: { title: string, value: string, icon: React.ElementType, change?: string, changeType?: 'increase' | 'decrease' }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <Icon className="w-5 h-5 text-gray-400" />
        </div>
        <div className="mt-2">
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {change && (
                <p className={`mt-1 text-xs ${changeType === 'increase' ? 'text-green-600' : 'text-red-600'} flex items-center`}>
                    <ArrowUpRight className={`w-4 h-4 mr-1 ${changeType === 'decrease' ? 'transform rotate-180' : ''}`} />
                    <span>{change} so với tháng trước</span>
                </p>
            )}
        </div>
    </div>
);

// Component Danh sách Đơn hàng
const OrderListItem = ({ id, customer, date, total, status }: { id: string, customer: string, date: string, total: string, status: 'Processing' | 'Shipped' | 'Delivered' }) => {
    const statusClasses = {
        Processing: 'bg-yellow-100 text-yellow-800',
        Shipped: 'bg-blue-100 text-blue-800',
        Delivered: 'bg-green-100 text-green-800',
    };
    return (
        <tr className="border-b hover:bg-gray-50">
            <td className="p-4 font-medium text-blue-600"><Link href={`/admin/orders/${id}`}>{id}</Link></td>
            <td className="p-4 text-gray-700">{customer}</td>
            <td className="p-4 text-gray-500">{date}</td>
            <td className="p-4 font-medium text-gray-900">{total}</td>
            <td className="p-4">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusClasses[status]}`}>
                    {status}
                </span>
            </td>
        </tr>
    );
};

// Component chính của trang
export default function DashboardPage() {
    return (
        <div className="space-y-8">
            {/* Header của trang */}
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Tổng quan</h1>
                    <p className="mt-1 text-gray-500">Chào mừng trở lại, đây là những gì đang diễn ra với cửa hàng của bạn.</p>
                </div>
                <div>
                    <button className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg shadow-sm hover:bg-red-600">
                        Thêm sản phẩm mới
                    </button>
                </div>
            </header>
            {/* Lưới các thẻ thống kê */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Tổng doanh thu" value="$45,231.89" icon={DollarSign} change="+20.1%" changeType="increase" />
                <StatCard title="Số đơn hàng" value="2,350" icon={CreditCard} change="+18.2%" changeType="increase" />
                <StatCard title="Khách hàng mới" value="1,204" icon={Users} change="+5.7%" changeType="increase" />
                <StatCard title="Tỷ lệ chuyển đổi" value="12.5%" icon={Activity} change="-1.9%" changeType="decrease" />
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                {/* Phần danh sách đơn hàng gần đây */}
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Đơn hàng gần đây</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-xs text-gray-600 uppercase">
                                <tr>
                                    <th className="p-4">Order ID</th>
                                    <th className="p-4">Khách hàng</th>
                                    <th className="p-4">Ngày</th>
                                    <th className="p-4">Tổng tiền</th>
                                    <th className="p-4">Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                <OrderListItem id="#3066" customer="Liam Johnson" date="Nov 23, 2023" total="$250.00" status="Shipped" />
                                <OrderListItem id="#3065" customer="Olivia Smith" date="Nov 22, 2023" total="$150.00" status="Processing" />
                                <OrderListItem id="#3064" customer="Noah Williams" date="Nov 21, 2023" total="$350.00" status="Delivered" />
                                <OrderListItem id="#3063" customer="Emma Brown" date="Nov 20, 2023" total="$450.00" status="Delivered" />
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Phần tóm tắt kho hàng */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Tóm tắt kho hàng</h2>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <Package className="w-5 h-5 text-green-500 inline-block mr-2" />
                                <span className="font-medium">Sản phẩm còn hàng</span>
                            </div>
                            </div>
                            <span className="font-bold text-lg">1,230</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <div>
                                <AlertCircle className="w-5 h-5 text-yellow-500 inline-block mr-2" />
                                <span className="font-medium">Sắp hết hàng</span>
                            </div>
                            <span className="font-bold text-lg">52</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <div>
                                <Package className="w-5 h-5 text-red-500 line-through inline-block mr-2" />
                                <span className="font-medium">Hết hàng</span>
                            </div>
                            <span className="font-bold text-lg">15</span>
                        </div>
                        <div className="pt-4">
                            <Link href="/admin/products" className="w-full text-center block px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50">
                                Quản lý kho hàng
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
    );
}