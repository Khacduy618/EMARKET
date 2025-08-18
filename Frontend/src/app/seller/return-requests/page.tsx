"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import Head from "next/head"

// Import các component và kiểu dữ liệu
import type { PaginatedResponse, ReturnRequest } from "@/types/return-request"
import FilterTabs from "./components/FilterTabs"
import ReturnRequestTable from "./components/ReturnRequestList"
import Pagination from "./components/Pagination"
import { API_URL } from "@/lib/config"

const SellerReturnRequestsPage = () => {
    // === 1. STATE MANAGEMENT ===
    const [requests, setRequests] = useState<ReturnRequest[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [statusFilter, setStatusFilter] = useState<string>("")
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [totalPages, setTotalPages] = useState<number>(1)

    // === 2. API FETCHING LOGIC ===
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true)
            setError(null)

            try {
                // Lấy token từ localStorage nếu bạn dùng Bearer Token
               

                // Gọi API bằng axios
                const response = await axios.get<PaginatedResponse<ReturnRequest>>(
                    `${API_URL}/seller/return-requests?status=${statusFilter}&page=${currentPage}`,
                    {
                        headers: { 'Content-Type': 'application/json' },
                        withCredentials: true, // Quan trọng: Để trình duyệt tự gửi cookie
                    },
                )

                // Cập nhật state với dữ liệu từ API
                setRequests(response.data.data)
                setTotalPages(response.data.last_page)
                setCurrentPage(response.data.current_page)
            } catch (err) {
                console.error("Lỗi khi fetch dữ liệu:", err)
                setError("Không thể tải dữ liệu. Vui lòng thử lại.")
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [currentPage, statusFilter]) // Chạy lại khi trang hoặc filter thay đổi

    // === 3. RENDER UI ===
    return (
        <>
            <Head>
                <title>Quản lý Trả hàng/Hoàn tiền</title>
            </Head>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
                {/* Background decorative elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-cyan-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-400/10 to-pink-600/10 rounded-full blur-3xl animate-pulse delay-500"></div>
                </div>

                <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="backdrop-blur-sm bg-white/30 rounded-3xl p-8 mb-8 shadow-2xl border border-white/20">
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-2">
                            Quản lý Trả hàng/Hoàn tiền
                        </h1>
                        <p className="text-slate-600 text-lg">Theo dõi và xử lý các yêu cầu trả hàng một cách hiệu quả</p>
                    </div>

                    <div className="backdrop-blur-sm bg-white/40 rounded-2xl p-6 mb-8 shadow-xl border border-white/30">
                        <FilterTabs
                            currentFilter={statusFilter}
                            onFilterChange={(newStatus: string) => {
                                setStatusFilter(newStatus)
                                setCurrentPage(1)
                            }}
                        />
                    </div>

                    <div className="mt-8">
                        {isLoading && (
                            <div className="backdrop-blur-sm bg-white/30 rounded-2xl p-16 text-center shadow-xl border border-white/20">
                                <div className="inline-flex items-center gap-3">
                                    <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                                    <span className="text-xl text-slate-700 font-medium">Đang tải dữ liệu...</span>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="backdrop-blur-sm bg-red-50/80 border border-red-200/50 rounded-2xl p-8 text-center shadow-xl">
                                <div className="text-red-600 text-lg font-medium">{error}</div>
                            </div>
                        )}

                        {!isLoading && !error && (
                            <>
                                <ReturnRequestTable requests={requests} />
                                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

export default SellerReturnRequestsPage