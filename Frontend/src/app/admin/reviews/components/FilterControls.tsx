// Frontend/src/app/admin/reviews/components/FilterControls.tsx
"use client"

import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Search, Filter, X, CalendarIcon, ChevronDown, Star } from "lucide-react";

// --- HÀM TIỆN ÍCH ---
const formatDateForAPI = (date: Date): string => date.toISOString().split("T")[0];

// --- COMPONENT CHÍNH ---
export function FilterControls() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // State cục bộ để quản lý UI, nhưng nguồn dữ liệu chính là URL (searchParams)
    const [localSearch, setLocalSearch] = useState(searchParams.get("search") || "");
    const [isStatusOpen, setStatusOpen] = useState(false);
    const [isDateOpen, setDateOpen] = useState(false);
    const statusRef = useRef<HTMLDivElement>(null);
    const dateRef = useRef<HTMLDivElement>(null);

    // Xử lý debounce cho ô tìm kiếm
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            const params = new URLSearchParams(searchParams.toString());
            if (localSearch) {
                params.set("search", localSearch);
            } else {
                params.delete("search");
            }
            params.set('page', '1'); // Reset về trang 1 khi tìm kiếm
            router.push(`${pathname}?${params.toString()}`);
        }, 500); // Debounce 500ms
        return () => clearTimeout(timeoutId);
    }, [localSearch, pathname, router, searchParams]);
    
    // Đồng bộ state cục bộ với URL params khi người dùng back/forward trình duyệt
    useEffect(() => {
        setLocalSearch(searchParams.get("search") || "");
    }, [searchParams]);
    
    // Hàm cập nhật URL params
    const updateQueryParam = (key: string, value: string | null) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value && value !== 'all') {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        params.set('page', '1');
        router.push(`${pathname}?${params.toString()}`);
    };
    
    const handleStatusToggle = (status: string) => {
        const currentStatuses = searchParams.get("status")?.split(",") || [];
        const newStatuses = currentStatuses.includes(status)
            ? currentStatuses.filter((s) => s !== status)
            : [...currentStatuses, status];
        updateQueryParam('status', newStatuses.length > 0 ? newStatuses.join(',') : null);
    };

    const setDatePreset = (days: number | 'month' | 'last_month') => {
        let to = new Date();
        let from = new Date();
        if (typeof days === 'number') {
            from.setDate(to.getDate() - days);
        } else if (days === 'month') {
            from.setDate(1);
        } else if (days === 'last_month') {
            from = new Date(to.getFullYear(), to.getMonth() - 1, 1);
            to = new Date(to.getFullYear(), to.getMonth(), 0);
        }
        
        const params = new URLSearchParams(searchParams.toString());
        params.set('date_from', formatDateForAPI(from));
        params.set('date_to', formatDateForAPI(to));
        params.set('page', '1');
        router.push(`${pathname}?${params.toString()}`);
        setDateOpen(false);
    };
    
    const handleResetFilters = () => {
        router.push(pathname); // Quay về URL gốc không có params
    };

    // Theo dõi click bên ngoài để đóng dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (statusRef.current && !statusRef.current.contains(event.target as Node)) setStatusOpen(false);
            if (dateRef.current && !dateRef.current.contains(event.target as Node)) setDateOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Lấy giá trị hiện tại từ URL
    const currentStatus = searchParams.get("status")?.split(",") || [];
    const currentRating = searchParams.get("rating") || "all";
    const currentDateFrom = searchParams.get("date_from") || "";
    const currentDateTo = searchParams.get("date_to") || "";
    const hasActiveFilters = searchParams.toString().length > 0 && !(searchParams.has('page') && searchParams.size === 1);

    const reviewStatuses = ["pending", "approved", "rejected", "needsAttention"];
    const statusLabels: Record<string, string> = {
        pending: "Chờ duyệt",
        approved: "Đã duyệt",
        rejected: "Từ chối",
        needsAttention: "Cần xem xét"
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
                {/* Search Bar */}
                <div className="relative flex-grow">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Tìm theo tên người dùng, sản phẩm, nội dung..."
                        value={localSearch}
                        onChange={(e) => setLocalSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="flex flex-wrap gap-3">
                    {/* Status Filter */}
                    <div className="relative" ref={statusRef}>
                        <button onClick={() => setStatusOpen(!isStatusOpen)} className={`w-full md:w-auto flex items-center gap-2 px-4 py-3 border rounded-lg transition-all ${currentStatus.length > 0 ? "bg-blue-50 border-blue-200 text-blue-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                            <Filter className="w-4 h-4" /> Trạng thái {currentStatus.length > 0 && `(${currentStatus.length})`}
                            <ChevronDown className={`w-4 h-4 transition-transform ${isStatusOpen ? "rotate-180" : ""}`} />
                        </button>
                        {isStatusOpen && (
                            <div className="absolute top-full mt-2 left-0 w-64 bg-white border rounded-xl shadow-xl z-20 p-2">
                                {reviewStatuses.map((status) => (
                                    <label key={status} className="flex items-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                                        <input type="checkbox" checked={currentStatus.includes(status)} onChange={() => handleStatusToggle(status)} className="h-4 w-4 rounded border-gray-300 text-blue-600" />
                                        <span className="ml-3 text-sm">{statusLabels[status]}</span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Rating Filter */}
                    <select value={currentRating} onChange={(e) => updateQueryParam('rating', e.target.value)} className="w-full md:w-auto px-4 py-3 border border-gray-200 rounded-lg bg-white text-gray-600 hover:bg-gray-50">
                        <option value="all">Tất cả đánh giá</option>
                        {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{r} sao</option>)}
                    </select>
                    
                    {/* Date Filter */}
                    <div className="relative" ref={dateRef}>
                        <button onClick={() => setDateOpen(!isDateOpen)} className={`w-full md:w-auto flex items-center gap-2 px-4 py-3 border rounded-lg transition-all ${currentDateFrom || currentDateTo ? "bg-blue-50 border-blue-200 text-blue-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                            <CalendarIcon className="w-4 h-4" /> Ngày tạo
                            <ChevronDown className={`w-4 h-4 transition-transform ${isDateOpen ? "rotate-180" : ""}`} />
                        </button>
                        {isDateOpen && (
                            <div className="absolute top-full mt-2 right-0 w-80 bg-white border rounded-xl shadow-xl z-20 p-4">
                                <div className="space-y-4">
                                    <div className="grid grid-cols-3 gap-2">
                                        <button onClick={() => setDatePreset(6)} className="p-2 text-sm bg-gray-50 rounded-lg hover:bg-blue-50 hover:text-blue-600">7 ngày</button>
                                        <button onClick={() => setDatePreset(29)} className="p-2 text-sm bg-gray-50 rounded-lg hover:bg-blue-50 hover:text-blue-600">30 ngày</button>
                                        <button onClick={() => setDatePreset('month')} className="p-2 text-sm bg-gray-50 rounded-lg hover:bg-blue-50 hover:text-blue-600">Tháng này</button>
                                    </div>
                                    <hr />
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Từ ngày</label>
                                            <input type="date" value={currentDateFrom} onChange={(e) => updateQueryParam('date_from', e.target.value)} className="w-full p-2 border rounded-lg"/>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Đến ngày</label>
                                            <input type="date" value={currentDateTo} onChange={(e) => updateQueryParam('date_to', e.target.value)} className="w-full p-2 border rounded-lg"/>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Clear Filters */}
                    {hasActiveFilters && (
                        <button onClick={handleResetFilters} className="flex items-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                            <X className="w-4 h-4" /> Xóa lọc
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}