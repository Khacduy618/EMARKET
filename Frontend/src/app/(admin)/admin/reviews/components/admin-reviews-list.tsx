
"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import axios, { AxiosError } from "axios";
import { AdminReviewCard, type AdminReview } from "./ReviewCard";
import { FilterControls } from "./FilterControls";
import { StatsHeader, type StatsData } from "./StatsHeader";
import { Loader2, MessageSquare, CheckCircle, RefreshCw, FileDown, AlertTriangle } from "lucide-react";
import Image from "next/image";
import { getAuthToken } from "@/services/api";

// --- INTERFACES & UTILITY FUNCTIONS ---
interface ShopInfo {
    ShopID: number | null;
    ShopName: string;
    LogoURL: string | null;
}
interface GroupedReviewData {
    shop_info: ShopInfo;
    reviews: AdminReview[];
}


const getAuthConfig = (params?: URLSearchParams, responseType: 'json' | 'blob' = 'json') => ({
     headers: {
        "Accept": "application/json",
        },
        credentials: 'include', 
    params,
    responseType
});

export const getFullImageUrl = (path: string | null | undefined): string => {
    if (!path) return '/placeholder.png';
    if (path.startsWith('http')) return path;
    const baseUrl = 'http://localhost:8001';
    return `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
};

const Toast = ({ message, type, onDismiss }: { message: string, type: 'success' | 'error', onDismiss: () => void }) => {
    useEffect(() => { const timer = setTimeout(onDismiss, 5000); return () => clearTimeout(timer); }, [onDismiss]);
    const isSuccess = type === 'success';
    return (
        <div className={`fixed top-5 right-5 z-[100] flex items-center p-4 rounded-lg shadow-lg text-white ${isSuccess ? 'bg-green-600' : 'bg-red-600'}`}>
            {isSuccess ? <CheckCircle className="w-5 h-5 mr-3" /> : <AlertTriangle className="w-5 h-5 mr-3" />}
            <span>{message}</span>
        </div>
    );
};

// --- MAIN COMPONENT ---
export default function AdminReviewsList() {
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => { setIsMounted(true); }, []);

    const searchParams = useSearchParams();
    const [groupedReviews, setGroupedReviews] = useState<GroupedReviewData[]>([]);
    const [stats, setStats] = useState<StatsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isExporting, setIsExporting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
    const [updatingReviewId, setUpdatingReviewId] = useState<number | null>(null);

    const laravelApiBaseUrl = 'http://localhost:8001/api';

    const fetchData = useCallback(async (showLoadingSpinner = true) => {
        if (showLoadingSpinner) setIsLoading(true);
        setError(null);
        
        const params = new URLSearchParams(searchParams.toString());
        try {
            const [reviewsRes, statsRes] = await Promise.all([
                axios.get(`${laravelApiBaseUrl}/admin/reviews`, getAuthConfig(params)),
                axios.get(`${laravelApiBaseUrl}/admin/reviews/stats`, getAuthConfig(params))
            ]);
            setGroupedReviews(reviewsRes.data.success && Array.isArray(reviewsRes.data.data) ? reviewsRes.data.data.filter(Boolean) : []);
            setStats(statsRes.data);
        } catch (err) {
            const axiosError = err as AxiosError;
            const errorMessage = (axiosError.response?.data as any)?.message || "Đã xảy ra lỗi không xác định khi tải dữ liệu.";
            setError(errorMessage);
        } finally {
            if (showLoadingSpinner) setIsLoading(false);
        }
    }, [searchParams, laravelApiBaseUrl]);

    useEffect(() => {
        if (isMounted) {
            fetchData();
        }
    }, [isMounted, fetchData]); 

    const handleAction = async (action: 'approve' | 'reject' | 'reply' | 'delete' | 'set-pending' | 'set-needs-review', reviewId: number, payload?: object) => {
        if (updatingReviewId) return;
        setUpdatingReviewId(reviewId);

        const previousGroupedReviews = JSON.parse(JSON.stringify(groupedReviews));

        const newGroupedReviews = previousGroupedReviews.map((group: { reviews: any[]; }) => ({
            ...group,
            reviews: group.reviews.map(review => {
                if (review.ReviewID !== reviewId) return review;
                switch (action) {
                    case 'approve': return { ...review, status: 1 };
                    case 'reject': return { ...review, status: 0 };
                    case 'set-pending': return { ...review, status: 2 };
                    case 'set-needs-review': return { ...review, status: 3 };
                    case 'reply': return { ...review, AdminReply: (payload as any).replyText };
                    case 'delete': return null;
                    default: return review;
                }
            }).filter(Boolean)
        })).filter((group: { reviews: string | any[]; }) => group.reviews.length > 0);

        setGroupedReviews(newGroupedReviews);

        try {
            const baseUrl = `${laravelApiBaseUrl}/admin/reviews/${reviewId}`;
            const url = action === 'delete' ? baseUrl : `${baseUrl}/${action}`;

            await axios({
                method: action === 'delete' ? 'DELETE' : 'POST',
                url, data: payload, ...getAuthConfig()
            });

            const successMessages = {
                approve: 'Đã duyệt review thành công!',
                reject: 'Đã từ chối review.',
                reply: 'Đã gửi phản hồi.',
                delete: 'Đã xóa review.',
                'set-pending': 'Đã chuyển review về trạng thái "Chờ duyệt".',
                'set-needs-review': 'Đã chuyển review sang "Cần xem xét".'
            };
            setToast({ message: successMessages[action], type: 'success' });
            axios.get(`${laravelApiBaseUrl}/admin/reviews/stats`, getAuthConfig(new URLSearchParams(searchParams.toString()))).then(res => setStats(res.data));

        } catch (err) {
            console.error(`Hành động ${action} thất bại, đang hoàn tác giao diện!`, err);
            setGroupedReviews(previousGroupedReviews);

            const axiosError = err as AxiosError;
            const errorMessage = (axiosError.response?.data as any)?.message || `Hành động "${action}" thất bại.`;
            setToast({ message: `Lỗi: ${errorMessage}. Đã hoàn tác.`, type: 'error' });
        } finally {
            setUpdatingReviewId(null);
        }
    };

    const handleExport = async () => {
        setIsExporting(true);
        setToast(null);

        try {
            const params = new URLSearchParams(searchParams.toString());
            const response = await axios.get(`${laravelApiBaseUrl}/admin/reviews/export`, getAuthConfig(params, 'blob'));

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;

            const contentDisposition = response.headers['content-disposition'];
            let fileName = `danh-sach-reviews-${new Date().toISOString().slice(0, 10)}.xlsx`;
            if (contentDisposition) {
                const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
                if (fileNameMatch?.[1]) fileName = fileNameMatch[1];
            }

            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            
            setToast({ message: "Đang tải file Excel...", type: 'success' });

        } catch (err) {
            const error = err as AxiosError;
            let errorMessage = "Xuất file Excel thất bại. Lỗi không xác định.";

            if (error.response && error.response.data instanceof Blob && error.response.data.type === 'application/json') {
                const reader = new FileReader();
                reader.onload = () => {
                    try {
                        const errorJson = JSON.parse(reader.result as string);
                        errorMessage = errorJson.message || "Lỗi không xác định từ server.";
                    } catch (parseError) {
                        errorMessage = "Không thể phân tích phản hồi lỗi từ server.";
                    }
                    setToast({ message: errorMessage, type: 'error' });
                };
                reader.onerror = () => {
                    setToast({ message: "Không thể đọc phản hồi lỗi từ server.", type: 'error' });
                };
                reader.readAsText(error.response.data);
            } else {
                errorMessage = (error.response?.data as any)?.message || error.message;
                setToast({ message: errorMessage, type: 'error' });
            }
            console.error("Lỗi khi xuất Excel:", err);

        } finally {
            setIsExporting(false);
        }
    };

    if (!isMounted) {
        return (
            <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
                <div className="text-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto" />
                    <p className="mt-2">Đang tải giao diện...</p>
                </div>
            </div>
        );
    }

    const hasReviews = !isLoading && !error && groupedReviews.some(g => g?.reviews?.length > 0);

    return (
        <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
            {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
            
            <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Quản lý Reviews</h1>
                    <p className="text-gray-600 mt-1">Quản lý và kiểm duyệt các đánh giá sản phẩm</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => fetchData(true)} disabled={isLoading || !!updatingReviewId} className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none bg-white border border-gray-300 text-gray-900 hover:bg-gray-100 h-10 py-2 px-4">
                        <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        Làm mới
                    </button>
                    <button onClick={handleExport} disabled={isExporting || !hasReviews || !!updatingReviewId} className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none bg-blue-600 text-white hover:bg-blue-700 h-10 py-2 px-4">
                        {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileDown className="mr-2 h-4 w-4" />}
                        Xuất Excel
                    </button>
                </div>
            </div>
            
            <StatsHeader stats={stats} />
            <FilterControls />
            
            <div className="mt-6">
                {isLoading ? ( <div className="text-center py-20"><Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto" /><p className="mt-2">Đang tải dữ liệu...</p></div> ) 
                : error ? ( <div className="text-center py-20 bg-white rounded-lg border border-red-200 p-8"><AlertTriangle className="h-12 w-12 mx-auto text-red-400" /><p className="mt-4 font-semibold text-red-600">Lỗi: {error}</p><p className="text-gray-500 mt-2">Vui lòng thử làm mới trang hoặc kiểm tra lại bộ lọc.</p></div> ) 
                : hasReviews ? (
                    <div className="space-y-8">
                        {groupedReviews.map((group) => (
                           group?.reviews?.length > 0 && (
                            <div key={group.shop_info.ShopID || 'shop-deleted'} className="bg-white rounded-xl shadow-sm border">
                                <div className="p-4 border-b flex items-center space-x-3 bg-gray-50/70 rounded-t-xl">
                                    <Image src={getFullImageUrl(group.shop_info.LogoURL)} alt={group.shop_info.ShopName || 'Shop Logo'} width={40} height={40} className="rounded-full object-cover border bg-white" onError={(e) => { e.currentTarget.src = '/placeholder.png'; }} />
                                    <h2 className="text-lg font-bold text-gray-800">{group.shop_info.ShopName}</h2>
                                </div>
                                <div className="divide-y">
                                    {group.reviews.map(review => (
                                        <div className="p-4" key={review.ReviewID}>
                                            <AdminReviewCard 
                                                review={review} 
                                                isUpdating={updatingReviewId === review.ReviewID}
                                                onApprove={(id) => handleAction('approve', id)} 
                                                onReject={(id) => handleAction('reject', id)} 
                                                onDelete={(id) => handleAction('delete', id)} 
                                                onReply={(id, text) => handleAction('reply', id, { replyText: text })}
                                                onSetPending={(id) => handleAction('set-pending', id)}
                                                onSetNeedsReview={(id) => handleAction('set-needs-review', id)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                           )
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-lg border">
                        <MessageSquare className="h-12 w-12 mx-auto text-gray-400" />
                        <p className="mt-4 font-medium text-gray-700">Không tìm thấy review nào.</p>
                        <p className="text-sm text-gray-500">Hãy thử thay đổi bộ lọc hoặc làm mới trang.</p>
                    </div>
                )}
            </div>
        </div>
    );
}