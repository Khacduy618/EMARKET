"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import axios from "axios";
import { ReviewTable } from "./components/review-table";
import { type AdminReview, type ReviewStatus } from "@/types";
import { Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function AdminReviewsList() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [reviews, setReviews] = useState<AdminReview[]>([]);
    const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1, total: 0, from: 0, to: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [query, setQuery] = useState(searchParams.get('query') || "");
    const [status, setStatus] = useState(searchParams.get('status') || "all");
    const [minRating, setMinRating] = useState(searchParams.get('minRating') || "all");
    const [onlyRequests, setOnlyRequests] = useState(searchParams.get('onlyRequests') === 'true');
    const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
    const [pageSize, setPageSize] = useState(Number(searchParams.get('pageSize')) || 10);

    const fetchReviews = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        const params = new URLSearchParams({ page: page.toString(), pageSize: pageSize.toString() });
        if (query) params.set('query', query);
        if (status !== 'all') params.set('status', status);
        if (minRating !== 'all') params.set('minRating', minRating);
        if (onlyRequests) params.set('onlyRequests', 'true');

        try {
            const response = await axios.get(`http://localhost:8001/api/admin/reviews?${params.toString()}`, {
                headers: { 'Accept': 'application/json' },
                withCredentials: true,
            });
            const { data, current_page, last_page, total, from, to } = response.data.data;
            setReviews(data);
            setPagination({ currentPage: current_page, lastPage: last_page, total, from, to });
        } catch (err) {
            setError("Không thể tải danh sách đánh giá. Vui lòng thử lại.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [page, pageSize, query, status, minRating, onlyRequests]);

    useEffect(() => { fetchReviews(); }, [fetchReviews]);
    
    useEffect(() => {
        const params = new URLSearchParams();
        if (query) params.set('query', query);
        if (status !== 'all') params.set('status', status);
        if (minRating !== 'all') params.set('minRating', minRating);
        if (onlyRequests) params.set('onlyRequests', 'true');
        if (page > 1) params.set('page', page.toString());
        if (pageSize !== 10) params.set('pageSize', pageSize.toString());
        router.replace(`${pathname}?${params.toString()}`);
    }, [query, status, minRating, onlyRequests, page, pageSize, pathname, router]);

    // ▼▼▼ THÊM HÀM NÀY ĐỂ CẬP NHẬT STATE ▼▼▼
    // Component con (dialog) sẽ gọi hàm này sau khi API update thành công.
    const handleUpdateReviewState = (updatedReview: AdminReview) => {
        setReviews(prevReviews => 
            // Duyệt qua mảng reviews cũ, tìm và thay thế review đã được cập nhật
            prevReviews.map(r => r.id === updatedReview.id ? updatedReview : r)
        );
    };

    if (isLoading) return <div className="text-center p-8">Đang tải...</div>;
    if (error) return <div className="text-red-500 text-center p-8">{error}</div>;
    
    return (
        <Card className="shadow-sm">
            <CardHeader>
                <CardTitle>Quản lý đánh giá (Admin)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex flex-col md:flex-row gap-3 md:items-center">
                    <div className="relative flex-1">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <Input
                            placeholder="Tìm kiếm..."
                            className="pl-9"
                            value={query}
                            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <Label className="text-sm text-gray-600">Trạng thái</Label>
                        <Select value={status} onValueChange={(v: string) => {setStatus(v); setPage(1);}}>
                          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Tất cả" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Tất cả</SelectItem>
                            <SelectItem value="pending">Chờ duyệt</SelectItem>
                            <SelectItem value="approved">Đã duyệt</SelectItem>
                            <SelectItem value="rejected">Từ chối</SelectItem>
                            <SelectItem value="under_review">Đang xem xét</SelectItem>
                            <SelectItem value="hidden">Đã ẩn</SelectItem>
                            <SelectItem value="flagged">Đã gắn cờ</SelectItem>
                          </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center gap-2">
                        <Label className="text-sm text-gray-600">Tối thiểu</Label>
                        <Select value={minRating} onValueChange={(v: string) => {setMinRating(v); setPage(1);}}>
                          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Rating" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Không lọc</SelectItem>
                            <SelectItem value="1">Từ 1★</SelectItem><SelectItem value="2">Từ 2★</SelectItem>
                            <SelectItem value="3">Từ 3★</SelectItem><SelectItem value="4">Từ 4★</SelectItem>
                            <SelectItem value="5">Chỉ 5★</SelectItem>
                          </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center gap-2">
                        <Checkbox id="only-req" checked={onlyRequests} onCheckedChange={(v) => {setOnlyRequests(Boolean(v)); setPage(1);}} />
                        <Label htmlFor="only-req">Chỉ hiển thị có yêu cầu xem xét</Label>
                    </div>

                    <div className="flex items-center gap-2 ml-auto">
                        <Label className="text-sm text-gray-600">Hiển thị</Label>
                        <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}>
                          <SelectTrigger className="w-[110px]"><SelectValue placeholder="10" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="5">5</SelectItem><SelectItem value="10">10</SelectItem>
                            <SelectItem value="20">20</SelectItem><SelectItem value="50">50</SelectItem>
                          </SelectContent>
                        </Select>
                    </div>
                </div>

                <ReviewTable
                    data={reviews}
                    page={pagination.currentPage}
                    totalPages={pagination.lastPage}
                    totalResults={pagination.total}
                    pageSize={pageSize}
                    onPageChange={setPage}
                    showingFrom={pagination.from}
                    showingTo={pagination.to}
                    groupByShop
                    // ▼▼▼ TRUYỀN HÀM CALLBACK VÀO ĐÂY ▼▼▼
                    onUpdateSingleReview={handleUpdateReviewState} 
                />
            </CardContent>
        </Card>
    );
}