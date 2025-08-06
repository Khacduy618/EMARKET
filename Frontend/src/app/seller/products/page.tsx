"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { getProducts, deleteProduct } from "@/services/seller-category"
import Swal from "sweetalert2"

// --- INTERFACES ---
interface ProductImage {
  ImageID: number
  ProductID: number
  ImageURL: string
  IsPrimary: boolean
  SortOrder: number
}

interface ProductVariant {
  VariantID: number
  ProductID: number
  SKU: string | null
  Price: number
  StockQuantity: number
}

interface Product {
  ProductID: number
  Name: string
  StockQuantity: number
  SoldCount: number
  images: ProductImage[]
  variants: ProductVariant[]
  AdminApprovalStatus: "Pending" | "Approved" | "Rejected"
}

export default function ShopeeProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedProducts, setSelectedProducts] = useState<number[]>([])
  const [activeTab, setActiveTab] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("authToken")
    if (!token) {
      Swal.fire("Unauthorized!", "Please log in to access the dashboard.", "error").then(() => router.push("/login"))
      return
    }
    fetchData()
  }, [router])

  const fetchData = async () => {
    setLoading(true)
    try {
      const productsData = await getProducts()
      setProducts(productsData)
    } catch (err: any) {
      Swal.fire("Lỗi!", err.response?.data?.message || "Không thể tải dữ liệu sản phẩm", "error")
    } finally {
      setLoading(false)
    }
  }

  // --- HANDLERS ---
  const handleEdit = (productID: number) => {
    router.push(`/seller/products/edit/${productID}`)
  }

  const handleDelete = async (productID: number) => {
    const result = await Swal.fire({
      title: "Xác nhận xóa",
      text: "Bạn có chắc chắn muốn xóa sản phẩm này?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    })

    if (result.isConfirmed) {
      try {
        await deleteProduct(productID)
        setProducts((prev) => prev.filter((p) => p.ProductID !== productID))
        Swal.fire("Đã xóa!", "Sản phẩm đã được xóa thành công.", "success")
      } catch (err: any) {
        Swal.fire("Lỗi!", err.response?.data?.message || "Không thể xóa sản phẩm", "error")
      }
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(filteredProducts.map((p) => p.ProductID))
    } else {
      setSelectedProducts([])
    }
  }

  const handleSelectProduct = (productID: number, checked: boolean) => {
    if (checked) {
      setSelectedProducts((prev) => [...prev, productID])
    } else {
      setSelectedProducts((prev) => prev.filter((id) => id !== productID))
    }
  }

  // --- HELPER FUNCTIONS ---
  const formatCurrency = (amount: number) => {
    if (typeof amount !== "number") return "N/A"
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount)
  }

  const BACKEND_URL = "http://localhost:8001"
  const getPrimaryImage = (product: Product): string => {
    const primaryImg = product.images.find((img) => img.IsPrimary)
    const imagePath = primaryImg?.ImageURL || product.images[0]?.ImageURL

    if (imagePath) {
      return `${BACKEND_URL}/storage/${imagePath}`
    }

    return "https://via.placeholder.com/150/f0f0f0/999999?text=No+Image"
  }

  const getDisplayPrice = (product: Product): string => {
    if (!product.variants || product.variants.length === 0) return "N/A"

    const prices = product.variants.map((v) => v.Price)
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)

    if (minPrice === maxPrice) {
      return formatCurrency(minPrice)
    }
    return `${formatCurrency(minPrice)} - ${formatCurrency(maxPrice)}`
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Approved":
        return { bg: "bg-green-100", text: "text-green-800", label: "Đã duyệt" }
      case "Pending":
        return { bg: "bg-yellow-100", text: "text-yellow-800", label: "Chờ duyệt" }
      case "Rejected":
        return { bg: "bg-red-100", text: "text-red-800", label: "Từ chối" }
      default:
        return { bg: "bg-gray-100", text: "text-gray-800", label: status }
    }
  }

  // Filter products based on search and tab
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.Name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "active" && product.AdminApprovalStatus === "Approved") ||
      (activeTab === "pending" && product.AdminApprovalStatus === "Pending") ||
      (activeTab === "rejected" && product.AdminApprovalStatus === "Rejected")
    return matchesSearch && matchesTab
  })

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage)

  const tabs = [
    { id: "all", label: "Tất cả", count: products.length },
    {
      id: "active",
      label: "Đang hoạt động",
      count: products.filter((p) => p.AdminApprovalStatus === "Approved").length,
    },
    { id: "pending", label: "Chờ duyệt", count: products.filter((p) => p.AdminApprovalStatus === "Pending").length },
    { id: "rejected", label: "Từ chối", count: products.filter((p) => p.AdminApprovalStatus === "Rejected").length },
  ]

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý Sản phẩm</h1>
            <p className="text-gray-600 mt-1">Quản lý tất cả sản phẩm của shop</p>
          </div>
          <Link
            href="/seller/products/add"
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-md font-medium transition-colors flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Thêm Sản phẩm</span>
          </Link>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id)
                    setCurrentPage(1)
                  }}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                      ? "border-orange-500 text-orange-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                >
                  {tab.label}
                  <span
                    className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === tab.id ? "bg-orange-100 text-orange-600" : "bg-gray-100 text-gray-600"
                      }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          {/* Search and Filters */}
          <div className="p-6 bg-gray-50 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
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
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên sản phẩm, SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div className="flex space-x-2">
                <button className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors">
                  <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z"
                    />
                  </svg>
                  Bộ lọc
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors">
                  <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Xuất file
                </button>
              </div>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedProducts.length > 0 && (
            <div className="px-6 py-3 bg-blue-50 border-b border-blue-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-800">
                  Đã chọn <strong>{selectedProducts.length}</strong> sản phẩm
                </span>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors">
                    Xóa hàng loạt
                  </button>
                  <button className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors">
                    Cập nhật trạng thái
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Products Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="w-12 px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sản phẩm
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Đã bán
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Giá
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kho hàng
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                        <span className="ml-2 text-gray-500">Đang tải...</span>
                      </div>
                    </td>
                  </tr>
                ) : paginatedProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <svg
                          className="w-16 h-16 text-gray-300 mb-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                          />
                        </svg>
                        <p className="text-gray-500 text-lg">Không có sản phẩm nào</p>
                        <p className="text-gray-400 text-sm mt-1">Hãy thêm sản phẩm đầu tiên của bạn</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedProducts.map((product) => {
                    const statusBadge = getStatusBadge(product.AdminApprovalStatus)
                    return (
                      <tr key={product.ProductID} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedProducts.includes(product.ProductID)}
                            onChange={(e) => handleSelectProduct(product.ProductID, e.target.checked)}
                            className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                              <img
                                src={getPrimaryImage(product)}
                                alt={product.Name}
                                className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                              // onError={(e) => {
                              //   e.currentTarget.src = "/placeholder.svg?height=64&width=64"
                              // }}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 line-clamp-2">{product.Name}</p>
                              <p className="text-sm text-gray-500 mt-1">ID: {product.ProductID}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-sm font-medium text-gray-900">{product.SoldCount || 0}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-sm font-medium text-gray-900">{getDisplayPrice(product)}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`text-sm font-medium ${product.StockQuantity > 10
                                ? "text-green-600"
                                : product.StockQuantity > 0
                                  ? "text-yellow-600"
                                  : "text-red-600"
                              }`}
                          >
                            {product.StockQuantity}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusBadge.bg} ${statusBadge.text}`}
                          >
                            {statusBadge.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => handleEdit(product.ProductID)}
                              className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
                            >
                              Sửa
                            </button>
                            <span className="text-gray-300">|</span>
                            <button
                              onClick={() => handleDelete(product.ProductID)}
                              className="text-red-600 hover:text-red-800 font-medium text-sm transition-colors"
                            >
                              Xóa
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Hiển thị <span className="font-medium">{startIndex + 1}</span> đến{" "}
                  <span className="font-medium">{Math.min(startIndex + itemsPerPage, filteredProducts.length)}</span>{" "}
                  trong tổng số <span className="font-medium">{filteredProducts.length}</span> sản phẩm
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Trước
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 text-sm font-medium rounded-md ${currentPage === page
                          ? "bg-orange-500 text-white"
                          : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                        }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sau
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
