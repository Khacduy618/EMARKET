"use client"

import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import useSWR from "swr"
import { Search, Filter, Star, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"
import PriceRangeFilter from '../categoryDetail/components/PriceRangeFilter';
import Link from "next/link"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

// Product Card Component (Giữ nguyên)
const ProductCard = ({ product }: { product: any }) => (
    <div className="bg-white border border-gray-200 rounded-sm hover:shadow-lg transition-all duration-200 cursor-pointer group">
        <div className="relative overflow-hidden">
            <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                {product.ImageURL ? (
                    <img
                        src={product.ImageURL || "/placeholder.svg"}
                        alt={product.Name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                ) : (
                    <span className="text-gray-400 text-sm">No Image</span>
                )}
            </div>
            {product.discount && (
                <div className="absolute top-0 right-0 bg-red-500 text-white text-xs px-2 py-1 rounded-bl-md">
                    -{product.discount}%
                </div>
            )}
        </div>
        <div className="p-3">
            <Link
                href={`/productdetail/${product.ProductID}`}
                key={product.ProductID}
                className="group bg-white overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300  hover:border-orange-500 flex flex-col transform hover:-translate-y-1"
            >
                <h3 className="text-sm text-gray-800 line-clamp-2 h-10 mb-2 group-hover:text-orange-500 transition-colors">
                    {product.Name}
                </h3>
            </Link>

            <div className="flex items-center justify-between">
                <div className="flex flex-col">
                    <span className="text-orange-500 font-semibold text-base">
                        ₫{new Intl.NumberFormat("vi-VN").format(product.Price)}
                    </span>
                    {product.originalPrice && (
                        <span className="text-gray-400 text-xs line-through">
                            ₫{new Intl.NumberFormat("vi-VN").format(product.originalPrice)}
                        </span>
                    )}
                </div>
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                <div className="flex items-center">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 mr-1" />
                    <span>{product.rating || "4.5"}</span>
                </div>
                <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                    {/* Dòng code được sửa đổi ở đây */}
                    {product.SoldCount > 0 && (
                        <span>Đã bán {product.SoldCount}</span>
                    )}
                </div>
            </div>
        </div>
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
        <div className="bg-white p-4 rounded-sm mb-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <span className="text-gray-600 text-sm">Sắp xếp theo</span>
                <div className="flex flex-wrap gap-2">
                    {sortOptions.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => handleSortChange(option.value)}
                            className={`px-4 py-2 text-sm rounded-sm transition-colors ${currentSort === option.value
                                ? "bg-orange-500 text-white"
                                : "bg-white text-gray-700 border border-gray-300 hover:border-orange-500"
                                }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>
            {totalResults && <div className="text-sm text-gray-500">{totalResults.toLocaleString()} kết quả</div>}
        </div>
    )
}

// Pagination Component (Giữ nguyên)
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
        <div className="flex justify-center items-center space-x-1 mt-8 bg-white p-4 rounded-sm">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="flex items-center px-3 py-2 text-sm text-gray-500 hover:text-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Trước
            </button>

            {startPage > 1 && (
                <>
                    <button onClick={() => onPageChange(1)} className="px-3 py-2 text-sm text-gray-700 hover:text-orange-500">
                        1
                    </button>
                    {startPage > 2 && <span className="px-2 text-gray-400">...</span>}
                </>
            )}

            {pages.map((page) => (
                <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`px-3 py-2 text-sm rounded transition-colors ${page === currentPage ? "bg-orange-500 text-white" : "text-gray-700 hover:text-orange-500 hover:bg-orange-50"
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
                        className="px-3 py-2 text-sm text-gray-700 hover:text-orange-500"
                    >
                        {lastPage}
                    </button>
                </>
            )}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= lastPage}
                className="flex items-center px-3 py-2 text-sm text-gray-500 hover:text-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Sau
                <ChevronRight className="w-4 h-4 ml-1" />
            </button>
        </div>
    )
}

// Main Search Page Component (Giữ nguyên)
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

    const apiUrl = isClient ? `http://localhost:8001/api/search?${searchParams.toString()}` : null
    const { data, error, isLoading } = useSWR(apiUrl, fetcher, {
        keepPreviousData: true,
    })

    if (!isClient) {
        return (
            <div className="bg-gray-50 min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                    <p className="text-gray-500">Đang khởi tạo trang...</p>
                </div>
            </div>
        )
    }

    const searchQuery = searchParams.get("q")

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="container mx-auto px-4 py-6">
                {/* Breadcrumb */}
                <div className="text-sm text-gray-500 mb-4">
                    <span>Trang chủ</span>
                    <span className="mx-2">{">"}</span>
                    <span>Kết quả tìm kiếm cho '{searchQuery}'</span>
                </div>

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Mobile Filter Toggle */}
                    <div className="lg:hidden">
                        <button
                            onClick={() => setShowMobileFilters(!showMobileFilters)}
                            className="flex items-center justify-center w-full bg-white border border-gray-300 rounded-sm py-3 mb-4"
                        >
                            <Filter className="w-4 h-4 mr-2" />
                            Bộ lọc
                            <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showMobileFilters ? "rotate-180" : ""}`} />
                        </button>
                    </div>

                    {/* Sidebar Filters */}
                    <aside className={`w-full lg:w-1/5 ${showMobileFilters ? "block" : "hidden lg:block"}`}>
                        <div className="bg-white rounded-sm shadow-sm p-4 sticky top-4">
                            <div className="flex items-center justify-between mb-4 lg:mb-0">
                                <h2 className="font-semibold text-gray-800 text-lg">Bộ lọc tìm kiếm</h2>
                                <button onClick={() => setShowMobileFilters(false)} className="lg:hidden text-gray-500">
                                    ✕
                                </button>
                            </div>

                            <div className="mt-4">
                                {/* ================================================================= */}
                                {/* BƯỚC 3: GỌI COMPONENT ĐÃ IMPORT */}
                                <PriceRangeFilter />
                                {/* ================================================================= */}
                            </div>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="w-full lg:w-4/5">
                        <SortBar totalResults={data?.total} />

                        {isLoading && (
                            <div className="bg-white rounded-sm p-20 text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                                <p className="text-gray-500">Đang tải kết quả...</p>
                            </div>
                        )}

                        {error && (
                            <div className="bg-white rounded-sm p-20 text-center">
                                <p className="text-red-500">Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại.</p>
                            </div>
                        )}

                        {data && data.data?.length > 0 ? (
                            <>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4">
                                    {data.data.map((product: any) => (
                                        <ProductCard key={product.ProductID} product={product} />
                                    ))}
                                </div>
                                <Pagination data={data} onPageChange={handlePageChange} />
                            </>
                        ) : (
                            !isLoading && (
                                <div className="bg-white rounded-sm p-20 text-center">
                                    <div className="text-gray-400 mb-4">
                                        <Search className="w-16 h-16 mx-auto mb-4" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-600 mb-2">Không tìm thấy kết quả nào</h3>
                                    <p className="text-gray-500 mb-4">Hãy thử sử dụng các từ khóa chung chung hơn</p>
                                    <button
                                        onClick={() => router.push("/search")}
                                        className="bg-orange-500 text-white px-6 py-2 rounded-sm hover:bg-orange-600 transition-colors"
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