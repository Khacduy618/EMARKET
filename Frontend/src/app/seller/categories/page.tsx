"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getPlatformCategories, getShopCategories, registerCategory, deleteCategory } from "@/services/seller-category"
import Swal from "sweetalert2"

interface PlatformCategory {
    CategoryID: number
    Name: string
    ParentName: string | null
}

interface ShopCategory {
    ShopCategoryID: number
    CategoryID: number
    CategoryName: string
    Status: "PendingApproval" | "Approved" | "Rejected"
    RequestedAt: string
    ApprovedAt: string | null
    RejectedReason: string | null
}

export default function CategoriesPage() {
    const router = useRouter()
    const [platformCategories, setPlatformCategories] = useState<PlatformCategory[]>([])
    const [shopCategories, setShopCategories] = useState<ShopCategory[]>([])
    const [selectedCategoryID, setSelectedCategoryID] = useState<number | null>(null)
    const [loading, setLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")

    useEffect(() => {
       egories()
    }, [router])

    const fetchCategories = async () => {
        setLoading(true)
        try {
            const [platformCats, shopCats] = await Promise.all([getPlatformCategories(), getShopCategories()])
            setPlatformCategories(platformCats)
            setShopCategories(shopCats)
        } catch (err: any) {
            Swal.fire("Error!", err.response?.data?.message || "Failed to fetch categories", "error")
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedCategoryID) {
            Swal.fire("Error!", "Vui lòng chọn một ngành hàng", "error")
            return
        }

        // Check if category is already registered
        const isAlreadyRegistered = shopCategories.some((cat) => cat.CategoryID === selectedCategoryID)
        if (isAlreadyRegistered) {
            Swal.fire("Warning!", "Ngành hàng này đã được đăng ký trước đó", "warning")
            return
        }

        setLoading(true)
        try {
            await registerCategory(selectedCategoryID)
            Swal.fire("Success!", "Yêu cầu đăng ký ngành hàng đã được gửi thành công", "success")
            setSelectedCategoryID(null)
            await fetchCategories()
        } catch (err: any) {
            Swal.fire("Error!", err.response?.data?.message || "Failed to register category", "error")
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (shopCategoryID: number, categoryName: string) => {
        const result = await Swal.fire({
            title: "Xác nhận xóa",
            text: `Bạn có chắc muốn xóa yêu cầu đăng ký ngành hàng "${categoryName}"?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Xóa",
            cancelButtonText: "Hủy",
        })

        if (result.isConfirmed) {
            setLoading(true)
            try {
                await deleteCategory(shopCategoryID)
                Swal.fire("Deleted!", "Yêu cầu đăng ký ngành hàng đã được xóa", "success")
                await fetchCategories()
            } catch (err: any) {
                Swal.fire("Error!", err.response?.data?.message || "Failed to delete category", "error")
            } finally {
                setLoading(false)
            }
        }
    }

    const filteredPlatformCategories = platformCategories.filter((category) =>
        category.Name.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    const getStatusStats = () => {
        const approved = shopCategories.filter((cat) => cat.Status === "Approved").length
        const pending = shopCategories.filter((cat) => cat.Status === "PendingApproval").length
        const rejected = shopCategories.filter((cat) => cat.Status === "Rejected").length
        return { approved, pending, rejected, total: shopCategories.length }
    }

    const stats = getStatusStats()

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Shopee Header */}
            <div className="bg-white border-b shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="text-2xl font-bold text-orange-500">Shopee</div>
                        <div className="text-gray-400">|</div>
                        <div className="text-lg text-gray-700">Kênh Người Bán</div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-12h5v12z" />
                        </svg>
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                            />
                        </svg>
                        <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <span className="text-sm text-gray-700">duynguykhc8</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="grid grid-cols-12 gap-6">
                    {/* Left Sidebar - Guidelines */}
                    <div className="col-span-3">
                        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                            <div className="bg-blue-50 p-4 border-b border-blue-100">
                                <h3 className="font-medium text-blue-800">Hướng dẫn Đăng ký Ngành hàng</h3>
                            </div>
                            <div className="p-4 space-y-3">
                                <div className="flex items-start space-x-3">
                                    <div className="w-5 h-5 rounded-full bg-orange-500 flex-shrink-0 mt-0.5 flex items-center justify-center">
                                        <span className="text-white text-xs font-bold">1</span>
                                    </div>
                                    <span className="text-sm text-gray-600">Chọn ngành hàng phù hợp với sản phẩm bạn muốn bán</span>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <div className="w-5 h-5 rounded-full bg-orange-500 flex-shrink-0 mt-0.5 flex items-center justify-center">
                                        <span className="text-white text-xs font-bold">2</span>
                                    </div>
                                    <span className="text-sm text-gray-600">Gửi yêu cầu đăng ký và chờ admin phê duyệt</span>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <div className="w-5 h-5 rounded-full bg-orange-500 flex-shrink-0 mt-0.5 flex items-center justify-center">
                                        <span className="text-white text-xs font-bold">3</span>
                                    </div>
                                    <span className="text-sm text-gray-600">
                                        Sau khi được phê duyệt, bạn có thể tạo sản phẩm trong ngành hàng đó
                                    </span>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <div className="w-5 h-5 rounded-full bg-yellow-500 flex-shrink-0 mt-0.5 flex items-center justify-center">
                                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path
                                                fillRule="evenodd"
                                                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </div>
                                    <span className="text-sm text-gray-600">
                                        Chỉ có thể xóa yêu cầu khi đang ở trạng thái chờ phê duyệt
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="col-span-6">
                        {/* Register New Category */}
                        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
                            <div className="bg-orange-50 p-4 border-b border-orange-100">
                                <h3 className="font-medium text-orange-800">Đăng ký Ngành hàng Mới</h3>
                            </div>
                            <div className="p-6">
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <span className="text-red-500">*</span> Tìm kiếm và chọn ngành hàng
                                        </label>
                                        <div className="relative mb-3">
                                            <input
                                                type="text"
                                                placeholder="Tìm kiếm ngành hàng..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                            />
                                            <svg
                                                className="absolute right-3 top-3 w-5 h-5 text-gray-400"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                                />
                                            </svg>
                                        </div>
                                        <select
                                            value={selectedCategoryID || ""}
                                            onChange={(e) => setSelectedCategoryID(Number(e.target.value) || null)}
                                            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                            disabled={loading}
                                            required
                                        >
                                            <option value="">Chọn ngành hàng</option>
                                            {filteredPlatformCategories.map((category) => (
                                                <option key={category.CategoryID} value={category.CategoryID}>
                                                    {category.Name} {category.ParentName ? `(Danh mục cha: ${category.ParentName})` : ""}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading || !selectedCategoryID}
                                        className="w-full bg-orange-500 text-white py-3 px-4 rounded-md hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                                    >
                                        {loading ? "Đang gửi yêu cầu..." : "Gửi yêu cầu đăng ký"}
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Registered Categories */}
                        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                            <div className="bg-gray-50 p-4 border-b">
                                <h3 className="font-medium text-gray-800">Ngành hàng đã đăng ký</h3>
                            </div>
                            <div className="p-6">
                                {loading && (
                                    <div className="flex items-center justify-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                                        <span className="ml-2 text-gray-500">Đang tải...</span>
                                    </div>
                                )}
                                {!loading && shopCategories.length === 0 ? (
                                    <div className="text-center py-8">
                                        <svg
                                            className="w-16 h-16 text-gray-300 mx-auto mb-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={1}
                                                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                                            />
                                        </svg>
                                        <p className="text-gray-500">Chưa có ngành hàng nào được đăng ký</p>
                                        <p className="text-sm text-gray-400 mt-1">Hãy đăng ký ngành hàng đầu tiên để bắt đầu bán hàng</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-gray-200">
                                                    <th className="text-left py-3 px-4 font-medium text-gray-700">Tên ngành hàng</th>
                                                    <th className="text-left py-3 px-4 font-medium text-gray-700">Trạng thái</th>
                                                    <th className="text-left py-3 px-4 font-medium text-gray-700">Ngày đăng ký</th>
                                                    <th className="text-left py-3 px-4 font-medium text-gray-700">Thao tác</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {shopCategories.map((category) => (
                                                    <tr key={category.ShopCategoryID} className="border-b border-gray-100 hover:bg-gray-50">
                                                        <td className="py-4 px-4">
                                                            <div className="font-medium text-gray-900">{category.CategoryName}</div>
                                                        </td>
                                                        <td className="py-4 px-4">
                                                            <div className="flex flex-col">
                                                                <span
                                                                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full w-fit ${category.Status === "Approved"
                                                                            ? "bg-green-100 text-green-800"
                                                                            : category.Status === "Rejected"
                                                                                ? "bg-red-100 text-red-800"
                                                                                : "bg-yellow-100 text-yellow-800"
                                                                        }`}
                                                                >
                                                                    {category.Status === "Approved"
                                                                        ? "Đã phê duyệt"
                                                                        : category.Status === "Rejected"
                                                                            ? "Bị từ chối"
                                                                            : "Chờ phê duyệt"}
                                                                </span>
                                                                {category.RejectedReason && (
                                                                    <p className="text-red-600 text-xs mt-1 max-w-xs">{category.RejectedReason}</p>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-4 text-sm text-gray-500">
                                                            {new Date(category.RequestedAt).toLocaleDateString("vi-VN")}
                                                        </td>
                                                        <td className="py-4 px-4">
                                                            {category.Status === "PendingApproval" && (
                                                                <button
                                                                    onClick={() => handleDelete(category.ShopCategoryID, category.CategoryName)}
                                                                    className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors"
                                                                    title="Xóa yêu cầu đăng ký"
                                                                    disabled={loading}
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                            strokeWidth={2}
                                                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                                        />
                                                                    </svg>
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar - Statistics */}
                    <div className="col-span-3">
                        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                            <div className="bg-green-50 p-4 border-b border-green-100">
                                <h3 className="font-medium text-green-800">Thống kê Ngành hàng</h3>
                            </div>
                            <div className="p-4 space-y-4">
                                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                    <div>
                                        <p className="text-sm text-blue-600">Tổng số ngành hàng</p>
                                        <p className="text-2xl font-bold text-blue-800">{stats.total}</p>
                                    </div>
                                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                                            />
                                        </svg>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                    <div>
                                        <p className="text-sm text-green-600">Đã phê duyệt</p>
                                        <p className="text-2xl font-bold text-green-800">{stats.approved}</p>
                                    </div>
                                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                                    <div>
                                        <p className="text-sm text-yellow-600">Chờ phê duyệt</p>
                                        <p className="text-2xl font-bold text-yellow-800">{stats.pending}</p>
                                    </div>
                                    <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                        </svg>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                                    <div>
                                        <p className="text-sm text-red-600">Bị từ chối</p>
                                        <p className="text-2xl font-bold text-red-800">{stats.rejected}</p>
                                    </div>
                                    <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white rounded-lg shadow-sm overflow-hidden mt-6">
                            <div className="bg-purple-50 p-4 border-b border-purple-100">
                                <h3 className="font-medium text-purple-800">Thao tác nhanh</h3>
                            </div>
                            <div className="p-4 space-y-3">
                                <button
                                    onClick={() => router.push("/seller-dashboard/add-product")}
                                    className="w-full flex items-center justify-center space-x-2 bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    <span>Thêm sản phẩm mới</span>
                                </button>
                                <button
                                    onClick={() => router.push("/seller-dashboard/products")}
                                    className="w-full flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                                        />
                                    </svg>
                                    <span>Quản lý sản phẩm</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
