"use client" // Bắt buộc đối với component sử dụng hooks

import axios, { type AxiosError } from "axios"
import Link from "next/link"
import type { NextPage } from "next"
import type React from "react"
import { useState, useEffect } from "react"

//=========== TYPE DEFINITIONS (trong cùng file) ===========
interface RefundRequestSummary {
    ReturnRequestID: number
    RequestCode: string
    Status: string
    RequestedAt: string
    user: { FullName: string }
    shop: { ShopName: string }
    RefundAmount: string
}

interface PaginatedResponse {
    data: RefundRequestSummary[]
    total: number
}
//=========================================================

//=========== HELPER FUNCTIONS (trong cùng file) ===========
const formatCurrency = (amount: string | number): string => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(Number(amount))
}
const formatDateTime = (dateTimeString: string): string => {
    return new Date(dateTimeString).toLocaleString("vi-VN")
}
//=========================================================

//=========== REUSABLE COMPONENT: RefundCard (trong cùng file) ===========
interface RefundCardProps {
    request: RefundRequestSummary
}
const RefundCard: React.FC<RefundCardProps> = ({ request }) => (
    <div className="bg-white shadow-md rounded-lg p-6 mb-4 transition-transform hover:scale-105">
        <div className="flex justify-between items-start">
            <div>
                <h2 className="text-lg font-bold text-gray-800">
                    Yêu cầu: <span className="text-indigo-600">{request.RequestCode}</span>
                </h2>
                <p className="text-sm text-gray-500">Ngày yêu cầu: {formatDateTime(request.RequestedAt)}</p>
            </div>
            <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                {request.Status}
            </span>
        </div>
        <div className="mt-4 border-t pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                    <p className="font-semibold text-gray-600">Người mua (Buyer)</p>
                    <p>{request.user.FullName}</p>
                </div>
                <div>
                    <p className="font-semibold text-gray-600">Cửa hàng (Seller)</p>
                    <p>{request.shop.ShopName}</p>
                </div>
                <div className="text-right">
                    <p className="font-semibold text-gray-600">Số tiền cần hoàn</p>
                    <p className="text-xl font-bold text-red-600">{formatCurrency(request.RefundAmount)}</p>
                </div>
            </div>
        </div>
        <div className="mt-4 text-right">
            <Link href={`/admin/refunds/${request.ReturnRequestID}`} passHref>
                Xem chi tiết & Xử lý
            </Link>
        </div>
    </div>
)
//======================================================================

//=========== MAIN PAGE COMPONENT ===========
const AdminRefundListPage: NextPage = () => {
    const [requests, setRequests] = useState<RefundRequestSummary[]>([])
    const [total, setTotal] = useState<number>(0)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchRefundRequests = async () => {
            setIsLoading(true)
            setError(null)
            try {
                // Tạo một instance axios tạm thời với cấu hình cần thiết
                const apiClient = axios.create({
                    baseURL: "http://localhost:8001", // URL gốc của Laravel backend
                    headers: {
                        "X-Requested-With": "XMLHttpRequest",
                        Accept: "application/json",
                    },
                    withCredentials: true, // Bắt buộc để gửi cookie session
                })

                // Lấy CSRF cookie trước (bước quan trọng của Sanctum SPA)
                await apiClient.get("/sanctum/csrf-cookie")

                // Bây giờ mới gọi API chính
                const response = await apiClient.get<PaginatedResponse>("/api/admin/return-requests/pending-refunds")

                setRequests(response.data.data)
                setTotal(response.data.total)
            } catch (err) {
                const error = err as AxiosError
                if (error.response?.status === 401) {
                    setError("Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.")
                } else {
                    setError(error.message || "Không thể tải dữ liệu.")
                }
            } finally {
                setIsLoading(false)
            }
        }

        fetchRefundRequests()
    }, []) // Mảng rỗng đảm bảo useEffect chỉ chạy 1 lần

    if (isLoading) return <div className="p-8 text-center">Đang tải danh sách yêu cầu...</div>
    if (error) return <div className="p-8 text-center text-red-500">Lỗi: {error}</div>

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Yêu cầu chờ Hoàn tiền ({total})</h1>
                {total > 0 ? (
                    requests.map((request) => <RefundCard key={request.ReturnRequestID} request={request} />)
                ) : (
                    <div className="text-center p-10 bg-white rounded-lg shadow">
                        <p className="text-gray-500">Không có yêu cầu nào đang chờ xử lý.</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default AdminRefundListPage
