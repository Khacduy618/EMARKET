'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    getProducts,
    deleteProduct,
    // getShopCategories, // Bạn có thể bỏ đi nếu không dùng trong giao diện này
} from '@/services/seller-category';
import Swal from 'sweetalert2';

// --- Giữ nguyên các Interface ---
interface Product {
    ProductID: number;
    ShopID: number;
    CategoryID: number;
    CategoryName: string;
    Name: string;
    Description: string | null;
    SKU: string | null;
    Price: number;
    Discount: number;
    StockQuantity: number;
    ImageURLs: Array<{ ImageURL: string; IsPrimary: boolean; SortOrder: number }>;
    IsActive: boolean;
    AdminApprovalStatus: 'Pending' | 'Approved' | 'Rejected';
    ReasonForRejection: string | null;
    AverageRating: number;
    ViewCount: number;
    SoldCount: number;
    CreatedAt: string;
    UpdatedAt: string;
}

interface ShopCategory {
    ShopCategoryID: number;
    CategoryID: number;
    CategoryName: string;
    Status: 'PendingApproval' | 'Approved' | 'Rejected';
    RequestedAt: string;
    ApprovedAt: string | null;
    RejectedReason: string | null;
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    // const [shopCategories, setShopCategories] = useState<ShopCategory[]>([]); // Bạn có thể bỏ đi nếu không dùng
    const [loading, setLoading] = useState(true); // Bắt đầu với loading = true
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            Swal.fire({
                title: 'Unauthorized!',
                text: 'Please log in to access the dashboard',
                icon: 'error',
                draggable: true,
            }).then(() => {
                router.push('/login');
            });
            return;
        }

        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Chỉ chạy một lần

    const fetchData = async () => {
        setLoading(true);
        try {
            // Chỉ fetch product nếu không cần category ở đây
            const productsData = await getProducts();
            setProducts(productsData);
        } catch (err: any) {
            Swal.fire({
                title: 'Error!',
                text: err.response?.data?.message || 'Failed to fetch data',
                icon: 'error',
                draggable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (product: Product) => {
        router.push(`/seller-dashboard/products/edit/${product.ProductID}`);
    };

    const handleDelete = async (productID: number) => {
        const result = await Swal.fire({
            title: 'Bạn chắc chứ?',
            text: 'Bạn có muốn xóa sản phẩm này không?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Có, xóa nó!',
            cancelButtonText: 'Hủy',
            draggable: true,
        });

        if (!result.isConfirmed) return;

        try {
            await deleteProduct(productID);
            Swal.fire({
                title: 'Thành công!',
                text: 'Sản phẩm đã được xóa.',
                icon: 'success',
                draggable: true,
            });
            await fetchData(); // Tải lại dữ liệu sau khi xóa
        } catch (err: any) {
            Swal.fire({
                title: 'Lỗi!',
                text: err.response?.data?.message || 'Không thể xóa sản phẩm',
                icon: 'error',
                draggable: true,
            });
        }
    };

    // Hàm format tiền tệ
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-gray-100 min-h-screen">
            {/* Header */}
            <header className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
                <h1 className="text-2xl font-semibold text-gray-800">Sản phẩm</h1>
                <div className="flex flex-wrap items-center gap-2">
                    <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm flex items-center shadow-sm hover:bg-gray-50">
                        Cài đặt sản phẩm
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm flex items-center shadow-sm hover:bg-gray-50">
                        Công cụ xử lý hàng loạt
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    <Link
                        href="/seller-dashboard/products/add"
                        className="bg-[#F05D40] text-white px-4 py-2 rounded-md text-sm flex items-center font-medium shadow-sm hover:bg-orange-600"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        Thêm 1 sản phẩm mới
                    </Link>
                </div>
            </header>

            {/* Main Content Card */}
            <main className="bg-white rounded-lg shadow-sm">
                {/* Tabs */}
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-6 px-6 -mb-px overflow-x-auto">
                        <a href="#" className="whitespace-nowrap py-4 px-1 border-b-2 border-orange-500 text-orange-500 font-medium text-sm">Tất cả</a>
                        <a href="#" className="whitespace-nowrap py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 text-sm">Đang hoạt động (0)</a>
                        <a href="#" className="whitespace-nowrap py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 text-sm">Vi phạm (0)</a>
                        <a href="#" className="whitespace-nowrap py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 text-sm">Chờ duyệt bởi Shopee (0)</a>
                        <a href="#" className="whitespace-nowrap py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 text-sm">Chưa được đăng (0)</a>
                    </nav>
                </div>

                {/* Filters */}
                {/* TODO: Add state and handlers for these filters */}
                <div className="p-6 space-y-4">
                    {/* ... (Phần filter giữ nguyên như cũ, chưa có logic) ... */}
                </div>

                {/* Product List Section */}
                <div className="p-6">
                    <div className="bg-gray-50 rounded-md">
                        {/* List Header */}
                        <div className="flex justify-between items-center p-4">
                            <div className="flex items-center space-x-3 text-sm">
                                <p className="text-gray-800"><span className="font-medium">{products.length} Sản Phẩm</span></p>
                                <div className="text-gray-500 bg-gray-200 px-2 py-0.5 rounded-sm flex items-center">
                                    Hạn mức đăng bán: 1000
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.79 4 4s-1.79 4-4 4c-1.742 0-3.223-.835-3.772-2M12 18.5v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                            {/* ... (View toggles) ... */}
                        </div>

                        {/* Table Header */}
                        <div className="hidden md:grid grid-cols-[40px_minmax(300px,_1fr)_100px_120px_100px_150px_120px] gap-4 items-center px-4 py-2 text-sm text-gray-500 font-medium border-t border-b border-gray-200">
                            <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500" />
                           
                            <span>Tên sản phẩm</span>
                            <span className="text-center">Đã bán</span>
                            <span className="text-center">Giá</span>
                            <span className="text-center">Kho hàng</span>
                            <span className="text-center">Đánh giá</span>
                            <span className="text-center">Thao tác</span>
                        </div>

                        {/* Conditional Rendering: Loading / Empty / List */}
                        {loading ? (
                            <div className="text-center py-24 text-gray-500">
                                Đang tải sản phẩm...
                            </div>
                        ) : products.length === 0 ? (
                            <div className="text-center py-24 border-t border-gray-200">
                                <div className="flex justify-center mb-4">
                                    <svg width="64" height="64" viewBox="0 0 100 100" className="text-gray-200">
                                        <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5">
                                            <path d="M14.2 30.2h71.6v45.2H14.2z"></path>
                                            <path d="M14.2 30.2L50 51.5l35.8-21.3"></path>
                                            <path d="M34.9 14.2h30.2v16H34.9z"></path>
                                        </g>
                                    </svg>
                                </div>
                                <p className="text-gray-500">Không tìm thấy sản phẩm</p>
                            </div>
                        ) : (
                            <div>
                                {products.map((product) => (
                                    <div key={product.ProductID} className="grid grid-cols-[40px_minmax(300px,_1fr)_100px_120px_100px_150px_120px] gap-4 items-center px-4 py-3 border-b border-gray-200 text-sm hover:bg-gray-50">
                                        <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500" />
                                        <div className="flex items-center gap-3">
                                            <img
                                                // Tìm ảnh chính, nếu không có thì lấy ảnh đầu tiên hoặc ảnh placeholder
                                                src={product.ImageURLs.find(img => img.IsPrimary)?.ImageURL || product.ImageURLs[0]?.ImageURL || 'https://via.placeholder.com/150'}
                                                alt={product.Name}
                                                className="w-12 h-12 object-cover rounded"
                                            />
                                            <span className="text-gray-800 line-clamp-2">{product.Name}</span>
                                        </div>
                                        <span className="text-gray-600 text-center">{product.SoldCount}</span>
                                        <span className="text-gray-600 text-center">{formatCurrency(product.Price)}</span>
                                        <span className="text-gray-600 text-center">{product.StockQuantity}</span>
                                        
                                        <span className="text-gray-600 text-center">5.0</span> 
                                        <div className="flex items-center justify-center space-x-4">
                                            <button onClick={() => handleEdit(product)} className="text-blue-600 hover:text-blue-800 font-medium">Sửa</button>
                                            <button onClick={() => handleDelete(product.ProductID)} className="text-red-500 hover:text-red-700 font-medium">Xóa</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}