
"use client"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import useSWR from "swr"
import { Search, Filter, Star, ChevronDown, ChevronLeft, ChevronRight, Heart, ShoppingCart } from "lucide-react"
import PriceRangeFilter from "../categoryDetail/components/PriceRangeFilter"
import Link from "next/link"
import { API_URL } from "@/lib/config"
import { getStorageImageUrl } from "@/services/api"

const fetcher = (url: string) => fetch(url, {
                    method: 'GET',
                    headers: { 'Accept': 'application/json' },
                    credentials: 'include', // Quan trọng để gửi cookie
                }).then((res) => res.json())

// Modern Product Card Component
const ProductCard = ({ product }: { product: any }) => (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group border border-gray-100 overflow-hidden">
        <div className="relative overflow-hidden">
            <div className="aspect-square bg-gray-50 flex items-center justify-center relative">
                {product.ImageURL ? (
                    <img
                        src={getStorageImageUrl(product.ImageURL) || "/placeholder.svg"}
                        alt={product.Name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 text-sm">No Image</span>
                    </div>
                )}

                {/* Discount Badge */}
                {product.discount && (
                    <div className="absolute top-2 left-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-2 py-1 rounded-md shadow-lg">
                        -{product.discount}%
                    </div>
                )}

            </div>
        </div>

        <div className="p-4">
            <Link href={`/productdetail/${product.ProductID}`} className="block group-hover:text-red-500 transition-colors">
                <h3 className="text-sm font-medium text-gray-900 line-clamp-2 h-12 leading-6 mb-2 hover:text-red-500 transition-colors duration-200 group-hover:text-red-600">
                    {product.Name}
                </h3>
            </Link>

            {/* Rating */}
            <div className="flex items-center gap-1 mb-3">
                <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                        <Star
                            key={i}
                            className={`w-3 h-3 ${i < Math.floor(product.rating || 4.5)
                                ? "fill-yellow-400 text-yellow-400"
                                : "fill-gray-200 text-gray-200"
                                }`}
                        />
                    ))}
                </div>
                <span className="text-xs text-gray-500 ml-1">({product.rating || "4.5"})</span>
                {product.SoldCount > 0 && (
                    <span className="text-xs text-gray-400 ml-auto">
                        Đã bán {product.SoldCount > 1000 ? `${(product.SoldCount / 1000).toFixed(1)}k` : product.SoldCount}
                    </span>
                )}
            </div>

            {/* Price Section */}
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <span className="text-red-500 font-bold text-lg">
                        ₫{new Intl.NumberFormat("vi-VN").format(product.Price)}
                    </span>
                    {product.originalPrice && (
                        <span className="text-gray-400 text-sm line-through">
                            ₫{new Intl.NumberFormat("vi-VN").format(product.originalPrice)}
                        </span>
                    )}
                </div>

                {/* Free Shipping Badge */}
                <div className="flex items-center gap-2">
                    <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full font-medium">
                        Miễn phí vận chuyển
                    </span>
                </div>
            </div>
        </div>

        {/* Bottom Gradient Border */}
        <div className="h-1 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </div>
)

const SortBar = ({ totalResults }: { totalResults?: number }) => {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const currentSort = searchParams.get("sort") || "relevant"

    const sortOptions = [
        { value: "relevant", label: "Liên quan" },
        { value: "newest", label: "Mới nhất" },
        { value: "bestselling", label: "Bán chạy" },
        { value: "price_asc", label: "Giá thấp đến cao" },
        { value: "price_desc", label: "Giá cao đến thấp" },
    ]

    const handleSortChange = (sortValue: string) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set("sort", sortValue)
        params.delete("page")
        router.push(`${pathname}?${params.toString()}`)
    }

    return (
        <div className="bg-white p-4 rounded-lg mb-6 flex flex-wrap items-center justify-between gap-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
                <span className="text-gray-600 text-sm font-medium">Sắp xếp theo</span>
                <div className="flex flex-wrap gap-2">
                    {sortOptions.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => handleSortChange(option.value)}
                            className={`px-4 py-2 text-sm rounded-lg transition-all duration-200 font-medium ${currentSort === option.value
                                ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg transform scale-105"
                                : "bg-gray-50 text-gray-700 border border-gray-200 hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                                }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>
            {totalResults && (
                <div className="text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
                    <span className="font-medium text-red-500">{totalResults.toLocaleString()}</span> kết quả
                </div>
            )}
        </div>
    )
}

// Enhanced Pagination Component
const Pagination = ({ data, onPageChange }: { data: any; onPageChange: (page: number) => void }) => {
    if (!data || data.last_page <= 1) return null

    const currentPage = data.current_page
    const lastPage = data.last_page
    const maxVisiblePages = 5

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    const endPage = Math.min(lastPage, startPage + maxVisiblePages - 1)

    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    const pages = []
    for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
    }

    return (
        <div className="flex justify-center items-center space-x-2 mt-8 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="flex items-center px-4 py-2 text-sm text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Trước
            </button>

            {startPage > 1 && (
                <>
                    <button
                        onClick={() => onPageChange(1)}
                        className="px-4 py-2 text-sm text-gray-700 bg-gray-50 rounded-lg hover:bg-red-50 hover:text-red-500 transition-all duration-200"
                    >
                        1
                    </button>
                    {startPage > 2 && <span className="px-2 text-gray-400">...</span>}
                </>
            )}

            {pages.map((page) => (
                <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`px-4 py-2 text-sm rounded-lg transition-all duration-200 font-medium ${page === currentPage
                        ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg transform scale-105"
                        : "text-gray-700 bg-gray-50 hover:bg-red-50 hover:text-red-500"
                        }`}
                >
                    {page}
                </button>
            ))}

            {endPage < lastPage && (
                <>
                    {endPage < lastPage - 1 && <span className="px-2 text-gray-400">...</span>}
                    <button
                        onClick={() => onPageChange(lastPage)}
                        className="px-4 py-2 text-sm text-gray-700 bg-gray-50 rounded-lg hover:bg-red-50 hover:text-red-500 transition-all duration-200"
                    >
                        {lastPage}
                    </button>
                </>
            )}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= lastPage}
                className="flex items-center px-4 py-2 text-sm text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
                Sau
                <ChevronRight className="w-4 h-4 ml-1" />
            </button>
        </div>
    )
}

// Main Search Page Component
export default function SearchPage() {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [isClient, setIsClient] = useState(false)
    const [showMobileFilters, setShowMobileFilters] = useState(false)

    useEffect(() => {
        setIsClient(true)
    }, [])

    const handlePageChange = (page: number) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set("page", String(page))
        router.push(`${pathname}?${params.toString()}`)
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    const apiUrl = isClient ? `${API_URL}/searchAll?${searchParams.toString()}` : null
    const { data, error, isLoading } = useSWR(apiUrl, fetcher, {
        keepPreviousData: true,
    })

    if (!isClient) {
        return (
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-500 border-t-transparent mx-auto mb-6"></div>
                    <p className="text-gray-600 text-lg font-medium">Đang khởi tạo trang...</p>
                </div>
            </div>
        )
    }

    const searchQuery = searchParams.get("q")

    return (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
            <div className="container mx-auto max-w-7xl px-4 py-6">
                {/* Enhanced Breadcrumb */}
                <div className="text-sm text-gray-500 mb-6 bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                    <span className="hover:text-red-500 cursor-pointer transition-colors">Trang chủ</span>
                    <span className="mx-2 text-gray-300">{">"}</span>
                    <span className="text-red-500 font-medium">Kết quả tìm kiếm cho '{searchQuery}'</span>
                </div>

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Mobile Filter Toggle */}
                    <div className="lg:hidden">
                        <button
                            onClick={() => setShowMobileFilters(!showMobileFilters)}
                            className="flex items-center justify-center w-full bg-white border border-gray-200 rounded-lg py-3 mb-4 hover:bg-gray-50 transition-colors shadow-sm"
                        >
                            <Filter className="w-4 h-4 mr-2" />
                            <span className="font-medium">Bộ lọc</span>
                            <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showMobileFilters ? "rotate-180" : ""}`} />
                        </button>
                    </div>

                    {/* Enhanced Sidebar Filters */}
                    <aside className={`w-full lg:w-1/5 ${showMobileFilters ? "block" : "hidden lg:block"}`}>
                        <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4 border border-gray-100">
                            <div className="flex items-center justify-between mb-6 lg:mb-4">
                                <h2 className="font-bold text-gray-800 text-lg">Bộ lọc tìm kiếm</h2>
                                <button
                                    onClick={() => setShowMobileFilters(false)}
                                    className="lg:hidden text-gray-500 hover:text-red-500 transition-colors"
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="mt-4">
                                <PriceRangeFilter />
                            </div>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="w-full lg:w-4/5">
                        <SortBar totalResults={data?.total} />

                        {isLoading && (
                            <div className="bg-white rounded-lg p-20 text-center shadow-sm border border-gray-100">
                                <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-500 border-t-transparent mx-auto mb-6"></div>
                                <p className="text-gray-600 text-lg font-medium">Đang tải kết quả...</p>
                            </div>
                        )}

                        {error && (
                            <div className="bg-white rounded-lg p-20 text-center shadow-sm border border-gray-100">
                                <p className="text-red-500 text-lg font-medium">Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại.</p>
                            </div>
                        )}

                        {data && data.data?.length > 0 ? (
                            <>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    {data.data.map((product: any) => (
                                        <ProductCard key={product.ProductID} product={product} />
                                    ))}
                                </div>
                                <Pagination data={data} onPageChange={handlePageChange} />
                            </>
                        ) : (
                            !isLoading && (
                                <div className="bg-white rounded-lg p-20 text-center shadow-sm border border-gray-100">
                                    <div className="text-gray-300 mb-6">
                                        <Search className="w-20 h-20 mx-auto mb-4" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-700 mb-3">Không tìm thấy kết quả nào</h3>
                                    <p className="text-gray-500 mb-6 text-lg">Hãy thử sử dụng các từ khóa chung chung hơn</p>
                                    <button
                                        onClick={() => router.push("/search")}
                                        className="bg-gradient-to-r from-red-500 to-red-600 text-white px-8 py-3 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium shadow-lg transform hover:scale-105"
                                    >
                                        Tìm kiếm lại
                                    </button>
                                </div>
                            )
                        )}
                    </main>
                </div>
            </div>
        </div>
    )
}
