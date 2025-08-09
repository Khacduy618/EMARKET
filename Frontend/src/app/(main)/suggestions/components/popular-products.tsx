"use client"
import { useEffect, useState, useCallback } from "react"
import axios from "axios"
import Link from "next/link"
import { Filter, Grid3X3, List, Star } from "lucide-react"

// Interface cho một sản phẩm từ API
interface ApiProduct {
    ProductID: number
    Name: string
    Description: string
    Discount: number
    viewCount: number
    Price: number
    PrimaryImageURL: string | null
}

// Interface cho đối tượng phân trang từ API
interface PaginatedApiResponse {
    current_page: number;
    data: ApiProduct[];
    last_page: number;
    total: number;
}

// Interface cho sản phẩm đã được xử lý để hiển thị
interface ProcessedProduct {
    ProductID: number
    name: string
    ImageURL: string | null
    originalPrice: number | null
    finalPrice: number
    discountPercent: number
    soldCount: string
    rating: number
}

// Skeleton Component
const ProductCardSkeleton = () => (
    <div className="bg-white rounded-sm overflow-hidden shadow-sm flex flex-col animate-pulse">
        <div className="relative w-full aspect-square bg-gray-200"></div>
        <div className="p-3 flex flex-col flex-grow space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-5 bg-gray-200 rounded w-1/2 mt-auto"></div>
        </div>
    </div>
)

export default function PopularProducts() {
    // State
    const [products, setProducts] = useState<ProcessedProduct[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [sortBy, setSortBy] = useState<string>("popular")
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [totalProducts, setTotalProducts] = useState(0)
    const [showFilters, setShowFilters] = useState(false)
    const productsPerPage = 24

    // Hàm gọi API, được bọc trong useCallback để tối ưu hóa
    const fetchProducts = useCallback(async (page: number, sort: string) => {
        setLoading(true)
        try {
            const response = await axios.get<PaginatedApiResponse>("http://localhost/api/products/popular", {
                params: {
                    page: page,
                    limit: productsPerPage,
                    sortBy: sort,
                },
            })

            const apiResponse = response.data
            setTotalPages(apiResponse.last_page)
            setTotalProducts(apiResponse.total)

            // Xử lý dữ liệu (bao gồm cả Math.random) sau khi đã nhận được response từ API
            const processedData = apiResponse.data.map((apiProd): ProcessedProduct => {
                const finalPriceNum = apiProd.Price
                const discountPercentNum = apiProd.Discount
                let originalPriceNum: number | null = null
                if (discountPercentNum > 0 && discountPercentNum < 100) {
                    originalPriceNum = Math.round(finalPriceNum / (1 - discountPercentNum / 100))
                }

                // Dữ liệu ngẫu nhiên chỉ được tạo ở đây, bên trong logic của client
                const soldCount = Math.floor(Math.random() * 10000) + 100
                const soldCountDisplay = soldCount > 1000 ? `Đã bán ${(soldCount / 1000).toFixed(1)}k`.replace(".0", "") : `Đã bán ${soldCount}`
                const rating = Math.round((Math.random() * 2 + 3) * 10) / 10

                return {
                    ProductID: Number(apiProd.ProductID),
                    name: apiProd.Name,
                    ImageURL: apiProd.PrimaryImageURL,
                    originalPrice: originalPriceNum,
                    finalPrice: finalPriceNum,
                    discountPercent: discountPercentNum,
                    soldCount: soldCountDisplay,
                    rating: rating,
                }
            })

            setProducts(processedData)
        } catch (error) {
            console.error("Error fetching popular products:", error)
            setProducts([])
        } finally {
            setLoading(false)
        }
    }, [productsPerPage])

    // useEffect chỉ chạy ở client, sau khi component đã mount
    useEffect(() => {
        // Cuộn lên đầu trang khi chuyển trang hoặc sắp xếp
        window.scrollTo({ top: 0, behavior: "smooth" });
        fetchProducts(currentPage, sortBy)
    }, [currentPage, sortBy, fetchProducts])

    // Hàm xử lý khi thay đổi kiểu sắp xếp
    const handleSortChange = (newSortBy: string) => {
        setSortBy(newSortBy)
        setCurrentPage(1) // Reset về trang 1
    }

    const formatCurrency = (amount: number) => new Intl.NumberFormat("vi-VN").format(amount)

    const sortOptions = [
        { value: "popular", label: "Phổ biến" },
        { value: "newest", label: "Mới nhất" },
        { value: "best-selling", label: "Bán chạy" },
        { value: "price-low", label: "Giá Thấp - Cao" },
        { value: "price-high", label: "Giá Cao - Thấp" },
    ]

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <div className="bg-white shadow-sm  top-0 z-20">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-xl font-medium text-gray-800">Sản Phẩm Phổ Biến</h1>
                            <p className="text-sm text-gray-500 mt-1">
                                {loading ? "Đang tìm kiếm..." : `Tìm thấy ${totalProducts} sản phẩm`}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setViewMode("grid")}
                                className={`p-2 rounded ${viewMode === "grid" ? "bg-orange-100 text-orange-500" : "text-gray-500"}`}
                            >
                                <Grid3X3 size={20} />
                            </button>
                            <button
                                onClick={() => setViewMode("list")}
                                className={`p-2 rounded ${viewMode === "list" ? "bg-orange-100 text-orange-500" : "text-gray-500"}`}
                            >
                                <List size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-sm hover:bg-gray-50"
                            >
                                <Filter size={16} />
                                Bộ lọc
                            </button>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <span>Sắp xếp theo:</span>
                                <div className="flex gap-2 flex-wrap">
                                    {sortOptions.map((option) => (
                                        <button
                                            key={option.value}
                                            onClick={() => handleSortChange(option.value)}
                                            className={`px-3 py-1.5 rounded-sm text-sm transition-colors ${sortBy === option.value
                                                ? "bg-orange-500 text-white"
                                                : "bg-white border border-gray-300 hover:bg-gray-50"
                                                }`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Products Grid */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5">
                        {Array.from({ length: productsPerPage }).map((_, index) => (
                            <ProductCardSkeleton key={index} />
                        ))}
                    </div>
                ) : products.length > 0 ? (
                    <>
                        <div
                            className={`grid gap-2.5 ${viewMode === "grid"
                                ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
                                : "grid-cols-1"
                                }`}
                        >
                            {products.map((product) => (
                                <Link
                                    href={`/productdetail/${product.ProductID}`}
                                    key={product.ProductID}
                                    className="group bg-white rounded-sm overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 hover:border-orange-300 flex flex-col"
                                >
                                    <div className="relative w-full aspect-square overflow-hidden bg-gray-50">
                                        <img
                                            src={product.ImageURL || "/placeholder.svg"}
                                            alt={product.name}
                                            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                                            loading="lazy"
                                        />
                                        <div className="absolute top-0 left-0 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-br-sm font-medium">
                                            Yêu thích
                                        </div>
                                        {product.discountPercent > 0 && (
                                            <div className="absolute top-0 right-0 bg-yellow-400 text-red-600 text-xs font-bold px-1 py-0.5 rounded-bl-sm min-w-[32px] text-center">
                                                -{product.discountPercent.toFixed(0)}%
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-3 flex flex-col flex-grow">
                                        <h3 className="text-sm text-gray-800 mb-2 line-clamp-2 leading-5 min-h-[40px]">{product.name}</h3>
                                        <div className="flex items-center gap-1 mb-2">
                                            <div className="flex items-center">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        size={12}
                                                        className={`${i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                                                    />
                                                ))}
                                            </div>
                                            <span className="text-xs text-gray-500">({product.rating.toFixed(1)})</span>
                                        </div>
                                        <div className="mt-auto">
                                            <div className="flex items-baseline mb-1">
                                                <span className="text-orange-500 text-xs mr-0.5">₫</span>
                                                <span className="text-orange-500 font-medium text-base">
                                                    {formatCurrency(product.finalPrice)}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between text-xs">
                                                {product.originalPrice && product.discountPercent > 0 && (
                                                    <span className="text-gray-400 line-through">₫{formatCurrency(product.originalPrice)}</span>
                                                )}
                                                <span className="text-gray-500 text-[11px] ml-auto">{product.soldCount}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2 mt-8">
                                <button
                                    onClick={() => setCurrentPage(c => Math.max(1, c - 1))}
                                    disabled={currentPage === 1 || loading}
                                    className="px-4 py-2 border bg-white border-gray-300 rounded-sm text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                >
                                    Trước
                                </button>
                                <span className="text-sm text-gray-700">
                                    Trang {currentPage} / {totalPages}
                                </span>
                                <button
                                    onClick={() => setCurrentPage(c => Math.min(totalPages, c + 1))}
                                    disabled={currentPage === totalPages || loading}
                                    className="px-4 py-2 border bg-white border-gray-300 rounded-sm text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                >
                                    Sau
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-20">
                        <p className="text-gray-500">Không tìm thấy sản phẩm nào.</p>
                    </div>
                )}
            </div>

            <style jsx>{`
                .line-clamp-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
            `}</style>
        </div>
    )
}