'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getProducts, deleteProduct } from '@/services/seller-category';
import Swal from 'sweetalert2';
import { FiPlus, FiChevronDown, FiInfo, FiPackage, FiSearch, FiMoreHorizontal } from 'react-icons/fi';

// --- INTERFACE (Cập nhật để khớp với dữ liệu từ controller) ---
interface ProductImage {
    ImageID: number;
    ProductID: number;
    ImageURL: string;
    IsPrimary: boolean; 
    SortOrder: number;
}

interface ProductVariant {
    VariantID: number;
    ProductID: number;
    SKU: string | null;
    Price: number;
    StockQuantity: number;
    // ... các trường khác của variant
}

// --- Giữ nguyên các Interface ---
interface Product {
    ProductID: number;
    Name: string;
    StockQuantity: number; // Tổng tồn kho
    SoldCount: number;
    images: ProductImage[];
    variants: ProductVariant[];
    AdminApprovalStatus: 'Pending' | 'Approved' | 'Rejected';
    // ... các trường khác nếu cần
}


export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            // ... (xử lý unauthorized)
            return;
        }
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const productsData = await getProducts();
            setProducts(productsData);
        } catch (err: any) {
            Swal.fire('Lỗi!', err.response?.data?.message || 'Không thể tải dữ liệu sản phẩm', 'error');
        } finally {
            setLoading(false);
        }
    };

    // --- HANDLERS ---
    const handleEdit = (productID: number) => {
        router.push(`/seller-dashboard/products/edit/${productID}`);
    };

    const handleDelete = async (productID: number) => {
        // ... (logic Swal của bạn đã rất tốt, giữ nguyên)
    };

    // --- HELPER FUNCTIONS ---
    const formatCurrency = (amount: number) => {
        if (typeof amount !== 'number') return 'N/A';
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };
    const BACKEND_URL = 'http://localhost:8001';
    const getPrimaryImage = (product: Product): string => {
        const primaryImg = product.images.find(img => img.IsPrimary);
        const imagePath = primaryImg?.ImageURL || product.images[0]?.ImageURL;

        if (imagePath) {
        return `${BACKEND_URL}/storage/${imagePath}`;
    }


        return `https://via.placeholder.com/150/f0f0f0/999999?text=No+Image`;
    };

    const getDisplayPrice = (product: Product): string => {
        if (!product.variants || product.variants.length === 0) return 'N/A';

        const prices = product.variants.map(v => v.Price);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);

        if (minPrice === maxPrice) {
            return formatCurrency(minPrice);
        }
        return `${formatCurrency(minPrice)} - ${formatCurrency(maxPrice)}`;
    };

    // --- RENDER ---
    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen font-sans">
            {/* Header */}
            <header className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
                <h1 className="text-2xl font-bold text-gray-800">Tất Cả Sản Phẩm</h1>
                <div className="flex flex-wrap items-center gap-2">
                    <Link
                        href="/seller-dashboard/products/add"
                        className="bg-orange-600 text-white px-4 py-2 rounded-sm text-sm flex items-center font-medium shadow-sm hover:bg-orange-700 transition-colors duration-200"
                    >
                        <FiPlus className="h-5 w-5 mr-1.5" />
                        Thêm Sản Phẩm Mới
                    </Link>
                </div>
            </header>

            {/* Main Content Card */}
            <main className="bg-white rounded-lg shadow-sm border border-gray-200">
                {/* Tabs */}
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-6 px-6 -mb-px overflow-x-auto">
                        <a href="#" className="whitespace-nowrap py-4 px-1 border-b-2 border-orange-500 text-orange-500 font-medium text-sm">Tất cả</a>
                        {/* Các tab khác */}
                    </nav>
                </div>

                {/* Filters */}
                <div className="p-4 md:p-6 flex flex-wrap gap-4 items-center bg-gray-50 border-b border-gray-200">
                    <div className="relative flex-grow">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Tên sản phẩm, SKU sản phẩm"
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-sm text-sm focus:ring-orange-500 focus:border-orange-500"
                        />
                    </div>
                </div>

                {/* Product List Section */}
                <div>
                    {/* List Header */}
                    <div className="flex justify-between items-center p-4">
                        <div className="flex items-center space-x-3 text-sm">
                            <p className="text-gray-800"><span className="font-medium">{products.length}</span> Sản Phẩm</p>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                                <tr>
                                    <th scope="col" className="p-4"><input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500" /></th>
                                    <th scope="col" className="px-6 py-3">Sản phẩm</th>
                                    <th scope="col" className="px-6 py-3 text-center">Đã bán</th>
                                    <th scope="col" className="px-6 py-3 text-center">Giá</th>
                                    <th scope="col" className="px-6 py-3 text-center">Kho hàng</th>
                                    <th scope="col" className="px-6 py-3 text-center">Trạng thái</th>
                                    <th scope="col" className="px-6 py-3 text-center">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={7} className="text-center py-24 text-gray-500">Đang tải sản phẩm...</td></tr>
                                ) : products.length === 0 ? (
                                    <tr><td colSpan={7} className="text-center py-24"><FiPackage className="mx-auto text-gray-300 text-5xl mb-2" /><p className="text-gray-500">Chưa có sản phẩm nào.</p></td></tr>
                                ) : (
                                    products.map((product) => (
                                        <tr key={product.ProductID} className="bg-white border-b hover:bg-gray-50">
                                            <td className="w-4 p-4"><input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500" /></td>
                                            <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <img src={getPrimaryImage(product)} alt={product.Name} className="w-12 h-12 object-cover rounded border border-gray-200" />
                                                    <span className="line-clamp-2">{product.Name}</span>
                                                </div>
                                            </th>
                                            <td className="px-6 py-4 text-center">{product.SoldCount || 0}</td>
                                            <td className="px-6 py-4 text-center">{getDisplayPrice(product)}</td>
                                            <td className="px-6 py-4 text-center">{product.StockQuantity}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${product.AdminApprovalStatus === 'Approved' ? 'bg-green-100 text-green-800' :
                                                        product.AdminApprovalStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-red-100 text-red-800'
                                                    }`}>
                                                    {product.AdminApprovalStatus}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center space-x-4">
                                                    <button onClick={() => handleEdit(product.ProductID)} className="font-medium text-blue-600 hover:underline">Sửa</button>
                                                    <button onClick={() => handleDelete(product.ProductID)} className="font-medium text-red-600 hover:underline">Xóa</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}