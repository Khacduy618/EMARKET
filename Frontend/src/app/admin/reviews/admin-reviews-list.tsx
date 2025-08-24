'use client';


import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


import { ReviewTable } from "./components/review-table";
import { type AdminReview, type ShopFilter } from "@/types";
import { Search, Star, Filter, FileSpreadsheet, X, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { API_URL } from "@/lib/config";


const formatDateToYyyyMmDd = (date: Date): string => date.toISOString().split('T')[0];


const reviewStatuses = [
   { value: "all", label: "Tất cả trạng thái" }, { value: "Pending", label: "Chờ duyệt" },
   { value: "Approved", label: "Đã duyệt" }, { value: "Rejected", label: "Từ chối" },
   { value: "Needs Attention", label: "Cần chú ý" }, { value: "Hidden", label: "Đã ẩn" },
];


const datePresets = [
   { key: 'all', label: 'Tất cả'}, { key: 'today', label: 'Hôm nay' }, { key: 'yesterday', label: 'Hôm qua' },
   { key: '7days', label: '7 ngày qua' }, { key: '30days', label: '30 ngày qua' }, { key: 'thisMonth', label: 'Tháng này' }, { key: 'custom', label: 'Tùy chọn' },
];


export default function AdminReviewsList() {
   const router = useRouter();
   const pathname = usePathname();
   const searchParams = useSearchParams();


   const [reviews, setReviews] = useState<AdminReview[]>([]);
   const [shops, setShops] = useState<ShopFilter[]>([]);
   const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1, total: 0, from: 0, to: 0 });
   const [isLoading, setIsLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);


   const [query, setQuery] = useState(searchParams.get('query') || "");
   const [status, setStatus] = useState(searchParams.get('status') || "all");
   const [rating, setRating] = useState(searchParams.get('rating') || "all"); // Đã đổi tên
   const [onlyRequests, setOnlyRequests] = useState(searchParams.get('onlyRequests') === 'true');
   const [filterShop, setFilterShop] = useState(searchParams.get('shop_id') || "all");
   const [dateFilter, setDateFilter] = useState({
       start_date: searchParams.get('start_date') || "",
       end_date: searchParams.get('end_date') || ""
   });
   const [activeDatePreset, setActiveDatePreset] = useState<string>(searchParams.get('preset') || 'all');
   const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
   const [pageSize, setPageSize] = useState(Number(searchParams.get('pageSize')) || 10);


   const fetchReviews = useCallback(async () => {
       setIsLoading(true);
       setError(null);
       const params = new URLSearchParams({ page: page.toString(), pageSize: pageSize.toString() });
       if (query) params.set('query', query);
       if (status !== 'all') params.set('status', status);
       if (rating !== 'all') params.set('rating', rating); // Gửi tham số 'rating'
       if (onlyRequests) params.set('onlyRequests', 'true');
       if (filterShop !== 'all') params.set('shop_id', filterShop);
       if (dateFilter.start_date) params.set('start_date', dateFilter.start_date);
       if (dateFilter.end_date) params.set('end_date', dateFilter.end_date);
       if (activeDatePreset !== 'all') params.set('preset', activeDatePreset);


       router.replace(`${pathname}?${params.toString()}`);


       try {
           const response = await axios.get(`${API_URL}/admin/reviews?${params.toString()}`, {
               headers: { 'Accept': 'application/json' },
               withCredentials: true,
           });
           const { data, current_page, last_page, total, from, to } = response.data.data;
           setReviews(data);
           setPagination({ currentPage: current_page, lastPage: last_page, total, from, to });
       } catch (err) {
           setError("Không thể tải danh sách đánh giá. Vui lòng thử lại.");
           toast.error("Không thể tải danh sách đánh giá.");
           console.error(err);
       } finally {
           setIsLoading(false);
       }
   }, [page, pageSize, query, status, rating, onlyRequests, filterShop, dateFilter, activeDatePreset, pathname, router]);
  
   useEffect(() => { fetchReviews(); }, [fetchReviews]);


   useEffect(() => {
       const fetchShopFilters = async () => {
           try {
               const res = await axios.get(`${API_URL}/admin/reviews/shop-filters`, { withCredentials: true });
               setShops(res.data);
           } catch {
               toast.error("Lỗi khi tải danh sách cửa hàng.");
           }
       };
       fetchShopFilters();
   }, []);


   const handleUpdateReviewState = (updatedReview: AdminReview) => {
       setReviews(prevReviews => prevReviews.map(r => r.id === updatedReview.id ? updatedReview : r));
   };


   const isFiltered = useMemo(() => {
       return query !== "" || status !== "all" || rating !== "all" || filterShop !== "all" || dateFilter.start_date !== "" || dateFilter.end_date !== "";
   }, [query, status, rating, filterShop, dateFilter]);


   const handleClearFilters = () => {
       setQuery(""); setStatus("all"); setRating("all");
       setFilterShop("all"); setDateFilter({ start_date: "", end_date: "" });
       setActiveDatePreset("all"); setPage(1);
       toast.success("Đã xóa tất cả bộ lọc");
   };
  
   const handleDatePresetClick = (preset: string) => {
       setActiveDatePreset(preset); setPage(1);
       const today = new Date();
       let startDate = new Date(), endDate = new Date(today);
       switch (preset) {
           case 'today': break;
           case 'yesterday': startDate.setDate(today.getDate() - 1); endDate.setDate(today.getDate() - 1); break;
           case '7days': startDate.setDate(today.getDate() - 6); break;
           case '30days': startDate.setDate(today.getDate() - 29); break;
           case 'thisMonth': startDate = new Date(today.getFullYear(), today.getMonth(), 1); endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0); break;
           default: setDateFilter({ start_date: "", end_date: "" }); return;
       }
       setDateFilter({ start_date: formatDateToYyyyMmDd(startDate), end_date: formatDateToYyyyMmDd(endDate) });
   };


   const handleCustomDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
       setDateFilter(prev => ({ ...prev, [e.target.name]: e.target.value }));
       setPage(1);
   };


   if (isLoading && reviews.length === 0) return <div className="text-center p-8">Đang tải...</div>;
   if (error) return <div className="text-red-500 text-center p-8">{error}</div>;
  
   return (
   <>
       <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
       <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm overflow-hidden">
           <CardHeader className="bg-gradient-to-r from-blue-100 via-indigo-50 to-cyan-100 border-b-2 border-blue-200">
               <CardTitle className="flex items-center gap-3 text-lg text-blue-800">
                   <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-2 rounded-full"><Star className="w-4 h-4 text-white" /></div>
                   Quản lý Đánh giá
               </CardTitle>
           </CardHeader>
           <CardContent className="p-6 space-y-6">
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                   <div className="lg:col-span-2">
                       <Label htmlFor="search" className="text-sm font-bold text-blue-700 mb-2 block">Tìm kiếm</Label>
                       <Input id="search" placeholder="Tên sản phẩm, người dùng, nội dung..." value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} className="h-11 text-base"/>
                   </div>
                   <div>
                       <Label htmlFor="shop_filter" className="text-sm font-bold text-blue-700 mb-2 block">Cửa hàng</Label>
                       <Select value={filterShop} onValueChange={(v) => { setFilterShop(v); setPage(1); }}>
                           <SelectTrigger id="shop_filter" className="h-11 text-base"><SelectValue /></SelectTrigger>
                           <SelectContent><SelectItem value="all">Tất cả cửa hàng</SelectItem>{shops.map(shop => <SelectItem key={shop.ShopID} value={String(shop.ShopID)}>{shop.ShopName}</SelectItem>)}</SelectContent>
                       </Select>
                   </div>
                   
                   <div>
                       <Label htmlFor="rating" className="text-sm font-bold text-blue-700 mb-2 block">Rating</Label>
                       <Select value={rating} onValueChange={(v: string) => { setRating(v); setPage(1); }}>
                         <SelectTrigger id="rating" className="h-11 text-base"><SelectValue /></SelectTrigger>
                         <SelectContent>
                           <SelectItem value="all">Tất cả Rating</SelectItem>
                           <SelectItem value="1">1 sao</SelectItem>
                           <SelectItem value="2">2 sao</SelectItem>
                           <SelectItem value="3">3 sao</SelectItem>
                           <SelectItem value="4">4 sao</SelectItem>
                           <SelectItem value="5">5 sao</SelectItem>
                         </SelectContent>
                       </Select>
                   </div>
               </div>


               <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 pt-4 border-t border-blue-100">
                   <div>
                       <Label className="text-sm font-bold text-blue-700 mb-2 block">Lọc theo ngày đánh giá</Label>
                       <div className="flex flex-wrap items-center gap-2">
                           {datePresets.map(preset => (<Button key={preset.key} variant={activeDatePreset === preset.key ? "default" : "outline"} size="sm" onClick={() => handleDatePresetClick(preset.key)} className={`text-base py-2 px-4 h-auto ${activeDatePreset === preset.key ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md" : "bg-white border-2 border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-400"}`}>{preset.label}</Button>))}
                       </div>
                       {activeDatePreset === 'custom' && (<div className="flex flex-col sm:flex-row gap-2 mt-2">
                               <Input type="date" name="start_date" value={dateFilter.start_date} onChange={handleCustomDateChange} className="h-11 text-base"/>
                               <Input type="date" name="end_date" value={dateFilter.end_date} onChange={handleCustomDateChange} className="h-11 text-base"/>
                       </div>)}
                   </div>
                   <div className="flex items-center gap-4 flex-shrink-0">
                    
                        <Button onClick={fetchReviews} className="h-11 text-base bg-gray-800 text-white hover:bg-gray-900">
                            <RefreshCw className="w-4 h-4 mr-2" />Làm mới
                        </Button>
                        {isFiltered && (
                            <Button onClick={handleClearFilters} variant="destructive" className="h-11 text-base">
                                <X className="w-4 h-4 mr-2" />Xóa bộ lọc
                            </Button>
                        )}
                   </div>
               </div>
           </CardContent>
       </Card>


       <div className="mt-8">
           <ReviewTable
               data={reviews} page={pagination.currentPage} totalPages={pagination.lastPage}
               totalResults={pagination.total} pageSize={pageSize} onPageChange={setPage}
               showingFrom={pagination.from} showingTo={pagination.to} groupByShop
               onUpdateSingleReview={handleUpdateReviewState}
           />
       </div>
   </>
   );
}
