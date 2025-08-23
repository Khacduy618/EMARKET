
'use client';

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { 
  ChevronDown, ChevronsUpDown, Eye, Package, Truck, CheckCircle, XCircle, Clock, 
  AlertCircle, RefreshCw, ChevronUp, FileSpreadsheet, Store, X, CreditCard, 
  Banknote, Search, Filter, Calendar, DollarSign, ShoppingBag,
  Users, ChevronLeft, ChevronRight, Download
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { getFullImageUrl } from "@/services/api";
import { SellerOrder, OrderStats, Shop, ShopFilter } from "@/types";
import { API_URL } from "@/lib/config";

// --- HÀM TIỆN ÍCH ---
const formatCurrency = (amount?: number): string => {
    if (typeof amount !== 'number' || isNaN(amount)) return '0 ₫';
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
};
const formatDateForDisplay = (dateString: string): string => new Date(dateString).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

const getStatusBadgeClass = (status?: string, type: 'order' | 'payment' = 'order') => {
    if (!status) return "bg-gray-100 text-gray-700 border-gray-200";
    const lowerStatus = status.toLowerCase().replace(/\s/g, '');
    let map: Record<string, string> = {
        completed: "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-300 shadow-sm", 
        rated: "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-300 shadow-sm", 
        delivered: "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-300 shadow-sm",
        pending: "bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 border-orange-300 shadow-sm", 
        processing: "bg-gradient-to-r from-blue-100 to-sky-100 text-blue-800 border-blue-300 shadow-sm",
        shipped: "bg-gradient-to-r from-purple-100 to-violet-100 text-purple-800 border-purple-300 shadow-sm", 
        outfordelivery: "bg-gradient-to-r from-purple-100 to-violet-100 text-purple-800 border-purple-300 shadow-sm",
        returned: "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 border-gray-300 shadow-sm", 
        returninprogress: "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 border-gray-300 shadow-sm",
        cancelledbybuyer: "bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-red-300 shadow-sm", 
        cancelledbyseller: "bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-red-300 shadow-sm",
    };
    if (type === 'payment') {
        map = {
            paid: "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-300 shadow-sm",
            pending: "bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 border-orange-300 shadow-sm",
            failed: "bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-red-300 shadow-sm",
            refunded: "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 border-gray-300 shadow-sm",
            partiallyrefunded: "bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-800 border-orange-400 shadow-sm",
        };
    }
    return map[lowerStatus] || "bg-gray-100 text-gray-700 border-gray-200";
};

const getStatusIcon = (status?: string, type: 'order' | 'payment' = 'order') => {
    if (!status) return <AlertCircle className="w-4 h-4 text-gray-600" />;
    const iconClass = "w-4 h-4"; 
    const lowerStatus = status.toLowerCase();
    if (type === 'order') {
        if (lowerStatus.includes("completed") || lowerStatus.includes("delivered") || lowerStatus.includes("rated")) return <CheckCircle className={`${iconClass} text-green-600`} />;
        if (lowerStatus.includes("shipped") || lowerStatus.includes("outfordelivery")) return <Truck className={`${iconClass} text-purple-600`} />;
        if (lowerStatus.includes("processing")) return <Package className={`${iconClass} text-blue-600`} />;
        if (lowerStatus.includes("pending")) return <Clock className={`${iconClass} text-orange-600`} />;
        if (lowerStatus.startsWith("cancelled")) return <XCircle className={`${iconClass} text-red-600`} />;
        return <AlertCircle className={`${iconClass} text-gray-600`} />;
    } else {
        if (lowerStatus === "paid") return <CheckCircle className={`${iconClass} text-green-600`} />;
        if (lowerStatus === "pending") return <Clock className={`${iconClass} text-orange-600`} />;
        if (lowerStatus === "failed") return <XCircle className={`${iconClass} text-red-600`} />;
        return <Banknote className={`${iconClass} text-gray-600`} />;
    }
};

const formatDateToYyyyMmDd = (date: Date): string => date.toISOString().split('T')[0];

const translateOrderStatus = (status?: string): string => {
    if (!status) return 'Không rõ';
    const map: Record<string, string> = {
        'Pending': 'Chờ xử lý', 'Processing': 'Đang xử lý', 'Shipped': 'Đang giao',
        'OutForDelivery': 'Đang giao hàng', 'Delivered': 'Đã giao', 'Completed': 'Hoàn thành',
        'Rated': 'Đã đánh giá', 'CancelledByBuyer': 'Khách hủy', 'CancelledBySeller': 'Shop hủy',
        'Returned': 'Trả hàng', 'ReturnInProgress': 'Đang trả hàng',
    };
    return map[status] || status;
};

const translatePaymentStatus = (status?: string): string => {
    if (!status) return 'Không rõ';
    const map: Record<string, string> = {
        'Pending': 'Chờ thanh toán', 'Paid': 'Đã thanh toán', 'Failed': 'Thất bại',
        'Refunded': 'Đã hoàn tiền', 'PartiallyRefunded': 'Hoàn tiền 1 phần'
    };
    return map[status] || status;
}

export default function OrderManagement() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [shops, setShops] = useState<ShopFilter[]>([]);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [keyword, setKeyword] = useState(searchParams.get('search') || "");
  const [sortColumn, setSortColumn] = useState(searchParams.get('sort_by') || "OrderDate");
  const [sortType, setSortType] = useState<'asc' | 'desc'>((searchParams.get('sort_order') as 'asc' | 'desc') || "desc");
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get('page')) || 1);
  const [limitItem, setLimitItem] = useState(Number(searchParams.get('per_page')) || 10);
  const [totalPage, setTotalPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState(searchParams.get('status') || "all");
  const [filterShop, setFilterShop] = useState(searchParams.get('shop_id') || "all");
  const [dateFilter, setDateFilter] = useState({ 
    start_date: searchParams.get('start_date') || "", 
    end_date: searchParams.get('end_date') || "" 
  });
  const [activeDatePreset, setActiveDatePreset] = useState<string>(searchParams.get('preset') || 'all');
  const [paymentMethod, setPaymentMethod] = useState(searchParams.get('payment_method') || "all");
  const [paymentStatus, setPaymentStatus] = useState(searchParams.get('payment_status') || "all");
  
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set('page', currentPage.toString());
    params.set('per_page', limitItem.toString());
    if (keyword) params.set('search', keyword);
    if (filterStatus !== 'all') params.set('status', filterStatus);
    if (filterShop !== 'all') params.set('shop_id', filterShop);
    if (dateFilter.start_date) params.set('start_date', dateFilter.start_date);
    if (dateFilter.end_date) params.set('end_date', dateFilter.end_date);
    if (activeDatePreset !== 'all') params.set('preset', activeDatePreset);
    if (sortColumn !== 'OrderDate') params.set('sort_by', sortColumn);
    if (sortType !== 'desc') params.set('sort_order', sortType);
    if (paymentMethod !== 'all') params.set('payment_method', paymentMethod);
    if (paymentStatus !== 'all') params.set('payment_status', paymentStatus);

    router.replace(`${pathname}?${params.toString()}`);

    try {
      const res = await fetch(`${API_URL}/admin/orders?${params.toString()}`, { headers: { "Accept": "application/json" }, credentials: 'include' });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const json = await res.json();
      setOrders(json.data || []);
      setTotalPage(json.last_page || 1);
      setTotalOrders(json.total || 0);
    } catch (err) { 
        toast.error("Không thể tải danh sách đơn hàng.");
    } finally { 
        setLoading(false); 
    }
  }, [keyword, sortColumn, sortType, currentPage, limitItem, filterStatus, filterShop, dateFilter, activeDatePreset, paymentMethod, paymentStatus, pathname, router]);
  
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);
  
  useEffect(() => {
    const fetchInitialData = async () => {
        try {
            const [shopsRes, statsRes] = await Promise.all([
                fetch(`${API_URL}/admin/orders/shop-filters`, { credentials: 'include' }),
                fetch(`${API_URL}/admin/orders/stats`, { credentials: 'include' })
            ]);
            if(shopsRes.ok) setShops(await shopsRes.json());
            if(statsRes.ok) setStats(await statsRes.json());
        } catch (error) {
            toast.error("Lỗi khi tải dữ liệu ban đầu.");
        }
    }
    fetchInitialData();
  }, []);

  const isFiltered = useMemo(() => {
    return keyword !== "" || filterStatus !== "all" || filterShop !== "all" || dateFilter.start_date !== "" || dateFilter.end_date !== "" || paymentMethod !== "all" || paymentStatus !== "all";
  }, [keyword, filterStatus, filterShop, dateFilter, paymentMethod, paymentStatus]);

  const handleClearFilters = () => {
    setKeyword("");
    setFilterStatus("all");
    setFilterShop("all");
    setDateFilter({ start_date: "", end_date: "" });
    setActiveDatePreset("all");
    setPaymentMethod("all");
    setPaymentStatus("all");
    setCurrentPage(1);
    toast.success("Đã xóa tất cả bộ lọc");
  };

  const handleExportExcel = () => {
    const params = new URLSearchParams({ search: keyword, sort_by: sortColumn, sort_order: sortType });
    if (filterStatus !== "all") params.set("status", filterStatus);
    if (filterShop !== "all") params.set("shop_id", filterShop);
    if (dateFilter.start_date) params.set('start_date', dateFilter.start_date);
    if (dateFilter.end_date) params.set('end_date', dateFilter.end_date);
    if (paymentMethod !== "all") params.set("payment_method", paymentMethod);
    if (paymentStatus !== "all") params.set("payment_status", paymentStatus);
    const exportUrl = `${API_URL}/admin/orders/export?${params.toString()}`;
    window.open(exportUrl, '_blank');
    toast.info("Đang chuẩn bị file báo cáo...");
  };
  
  const groupedOrders = useMemo(() => {
    if (!orders) return {};
    return orders.reduce<Record<string, SellerOrder[]>>((acc, order) => {
      const shopId = order.shop.ShopID.toString();
      if (!acc[shopId]) acc[shopId] = [];
      acc[shopId].push(order);
      return acc;
    }, {});
  }, [orders]);

  const handleSort = (col: string) => {
    if (col === sortColumn) setSortType(sortType === 'asc' ? 'desc' : 'asc');
    else { setSortColumn(col); setSortType('desc'); }
    setCurrentPage(1);
  };
  
  const renderSortIcon = (col: string) => {
    if (sortColumn !== col) return <ChevronsUpDown className="w-4 h-4 text-gray-400" />;
    return sortType === "asc" ? <ChevronUp className="w-4 h-4 text-blue-600" /> : <ChevronDown className="w-4 h-4 text-blue-600" />;
  };

  const handleDatePresetClick = (preset: string) => {
    setActiveDatePreset(preset);
    setCurrentPage(1); 
    const today = new Date();
    let startDate = new Date();
    let endDate = new Date(today);
    switch (preset) {
        case 'today': break;
        case 'yesterday': startDate.setDate(today.getDate() - 1); endDate.setDate(today.getDate() - 1); break;
        case '7days': startDate.setDate(today.getDate() - 6); break;
        case '30days': startDate.setDate(today.getDate() - 29); break;
        case 'thisMonth': startDate = new Date(today.getFullYear(), today.getMonth(), 1); endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0); break;
        case 'custom': setDateFilter({ start_date: '', end_date: '' }); return;
        default: setDateFilter({ start_date: "", end_date: "" }); return;
    }
    setDateFilter({ start_date: formatDateToYyyyMmDd(startDate), end_date: formatDateToYyyyMmDd(endDate) });
  };
  
  const handleCustomDateChange = (e: React.ChangeEvent<HTMLInputElement>) => { 
    setDateFilter(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setCurrentPage(1);
  };

  const datePresets = [ 
    { key: 'all', label: 'Tất cả'}, { key: 'today', label: 'Hôm nay' }, { key: 'yesterday', label: 'Hôm qua' }, 
    { key: '7days', label: '7 ngày qua' }, { key: '30days', label: '30 ngày qua' }, { key: 'thisMonth', label: 'Tháng này' }, { key: 'custom', label: 'Tùy chọn' }, 
  ];
  
  const orderStatuses = [
      { value: "all", label: "Tất cả trạng thái" }, { value: "Pending", label: "Chờ xử lý" }, { value: "Processing", label: "Đang xử lý" },
      { value: "Shipped,OutForDelivery", label: "Đang giao" }, { value: "Delivered", label: "Đã giao" }, { value: "Completed,Rated", label: "Hoàn thành" },
      { value: "CancelledByBuyer,CancelledBySeller", label: "Đã hủy" }, { value: "Returned,ReturnInProgress", label: "Trả hàng/Hoàn tiền" },
  ];
  // --- KẾT THÚC PHẦN THÊM LẠI ---


  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/30 to-cyan-50/30">
        <div className="max-w-screen-2xl mx-auto p-4 md:p-8">
          
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 bg-clip-text text-transparent">
                  🛒 Quản lý đơn hàng
                </h1>
                <p className="text-gray-700 mt-2">Theo dõi, lọc và quản lý tất cả đơn hàng theo từng nhà bán hàng</p>
              </div>
              <div className="hidden lg:flex items-center gap-4">
                <div className="bg-gradient-to-r from-blue-100 to-indigo-100 px-3 py-2 rounded-full">
                  <div className="flex items-center gap-2 text-sm text-blue-700 font-medium">
                    <Clock className="w-4 h-4" />
                    Cập nhật: {new Date().toLocaleTimeString('vi-VN')}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* ... Stats Cards */}
          </div>
         <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm mb-8 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-100 via-indigo-50 to-cyan-100 border-b-2 border-blue-200">
              <CardTitle className="flex items-center gap-3 text-lg text-blue-800">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-2 rounded-full"><Filter className="w-4 h-4 text-white" /></div>
                Bộ lọc và tìm kiếm
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
                {/* ▼▼▼ GIAO DIỆN BỘ LỌC ĐÃ CẬP NHẬT FONT VÀ KÍCH THƯỚC ▼▼▼ */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="sm:col-span-2 lg:col-span-5 xl:col-span-2">
                        <label htmlFor="search" className="text-sm font-bold text-blue-700 mb-2 block">Tìm kiếm</label>
                        <Input id="search" placeholder="Mã đơn, tên khách, tên shop..." value={keyword} onChange={(e) => { setKeyword(e.target.value); setCurrentPage(1); }} className="h-11 text-base"/>
                    </div>
                    <div>
                        <label htmlFor="shop_filter" className="text-sm font-bold text-blue-700 mb-2 block">Cửa hàng</label>
                        <Select value={filterShop} onValueChange={(v) => { setFilterShop(v); setCurrentPage(1); }}>
                            <SelectTrigger id="shop_filter" className="h-11 text-base"><SelectValue /></SelectTrigger>
                            <SelectContent><SelectItem value="all">Tất cả cửa hàng</SelectItem>{shops.map(shop => <SelectItem key={shop.ShopID} value={String(shop.ShopID)}>{shop.ShopName}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                    <div>
                        <label htmlFor="status" className="text-sm font-bold text-blue-700 mb-2 block">Trạng thái ĐH</label>
                        <Select value={filterStatus} onValueChange={(v) => { setFilterStatus(v); setCurrentPage(1); }}>
                            <SelectTrigger id="status" className="h-11 text-base"><SelectValue /></SelectTrigger>
                            <SelectContent>{orderStatuses.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                    <div>
                        <label htmlFor="payment_method" className="text-sm font-bold text-blue-700 mb-2 block">PT Thanh toán</label>
                        <Select value={paymentMethod} onValueChange={(v) => { setPaymentMethod(v); setCurrentPage(1); }}>
                            <SelectTrigger id="payment_method" className="h-11 text-base"><SelectValue /></SelectTrigger>
                            <SelectContent><SelectItem value="all">Tất cả PTTT</SelectItem><SelectItem value="COD">COD</SelectItem><SelectItem value="Paypal">Paypal</SelectItem><SelectItem value="VNPay">VNPay</SelectItem></SelectContent>
                        </Select>
                    </div>
                    <div>
                        <label htmlFor="payment_status" className="text-sm font-bold text-blue-700 mb-2 block">TT Thanh toán</label>
                        <Select value={paymentStatus} onValueChange={(v) => { setPaymentStatus(v); setCurrentPage(1); }}>
                            <SelectTrigger id="payment_status" className="h-11 text-base"><SelectValue /></SelectTrigger>
                            <SelectContent><SelectItem value="all">Tất cả TT</SelectItem><SelectItem value="Pending">Chờ thanh toán</SelectItem><SelectItem value="Paid">Đã thanh toán</SelectItem><SelectItem value="Failed">Thất bại</SelectItem><SelectItem value="Refunded">Đã hoàn tiền</SelectItem></SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 pt-4 border-t border-blue-100">
                    <div className="flex-1">
                        <label className="text-sm font-bold text-blue-700 mb-2 block">Lọc theo ngày đặt hàng</label>
                        <div className="flex flex-wrap items-center gap-2">
                            {datePresets.map(preset => (<Button key={preset.key} variant={activeDatePreset === preset.key ? "default" : "outline"} size="sm" onClick={() => handleDatePresetClick(preset.key)} className={`text-base py-2 px-4 h-auto ${activeDatePreset === preset.key ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md" : "bg-white border-2 border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-400"}`}>{preset.label}</Button>))}
                        </div>
                        {activeDatePreset === 'custom' && (<div className="flex flex-col sm:flex-row gap-2 mt-2">
                                <Input type="date" name="start_date" value={dateFilter.start_date} onChange={handleCustomDateChange} className="h-11 text-base"/>
                                <Input type="date" name="end_date" value={dateFilter.end_date} onChange={handleCustomDateChange} className="h-11 text-base"/>
                        </div>)}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button onClick={() => fetchOrders()} className="h-11 text-base bg-gray-800 text-white hover:bg-gray-900"><RefreshCw className="w-4 h-4 mr-2" />Làm mới</Button>
                      <Button onClick={handleExportExcel} variant="outline" className="h-11 text-base text-green-600 border-green-500 hover:bg-green-50 hover:text-green-700"><FileSpreadsheet className="w-4 h-4 mr-2" />Xuất Excel</Button>
                      {isFiltered && (<Button onClick={handleClearFilters} variant="destructive" className="h-11 text-base"><X className="w-4 h-4 mr-2" />Xóa bộ lọc</Button>)}
                    </div>
                </div>
            </CardContent>
          </Card>
          
          <div className="mt-8">
            {loading ? <div className="text-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div><p className="mt-2 text-blue-700">Đang tải đơn hàng...</p></div> : <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm overflow-hidden">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table className="text-base"> {/* <-- Tăng font chữ cho bảng */}
                      <TableHeader>
                        <TableRow className="bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 border-b-2 border-blue-200">
                          <TableHead className="w-[20%] font-bold text-blue-800 py-4 px-4">Khách hàng</TableHead>
                          <TableHead className="w-[15%] font-bold text-blue-800 py-4">Mã đơn shop</TableHead>
                          <TableHead className="cursor-pointer hover:bg-blue-100/70 font-bold text-blue-800 py-4" onClick={() => handleSort('OrderDate')}><div className="flex items-center gap-1">Ngày đặt {renderSortIcon('OrderDate')}</div></TableHead>
                          <TableHead className="text-right cursor-pointer hover:bg-blue-100/70 font-bold text-blue-800 py-4" onClick={() => handleSort('TotalAmount')}><div className="flex items-center gap-1 justify-end">Thành tiền {renderSortIcon('TotalAmount')}</div></TableHead>
                          <TableHead className="text-center w-[12%] font-bold text-blue-800 py-4">Thanh toán</TableHead>
                          <TableHead className="text-center w-[12%] font-bold text-blue-800 py-4">Trạng thái ĐH</TableHead>
                          <TableHead className="text-center font-bold text-blue-800 py-4">Hành động</TableHead>
                      </TableRow>
                    </TableHeader>
                      <TableBody>
                        {Object.keys(groupedOrders).length > 0 ? (
                          Object.keys(groupedOrders).map(shopId => (
                            <React.Fragment key={shopId}>
                              <TableRow className="bg-blue-50 border-b-2 border-blue-200">
                                <TableCell colSpan={7} className="font-bold text-blue-800 py-3 px-4 text-lg"> {/* <-- Tăng font */}
                                  <div className="flex items-center gap-2"><Store className="h-5 w-5"/><span>{groupedOrders[shopId][0].shop.ShopName}</span></div>
                                </TableCell>
                              </TableRow>
                              {groupedOrders[shopId].map(order => (
                                <TableRow key={order.SellerOrderID} className="hover:bg-blue-50/50 border-b border-blue-100">
                                  <TableCell className="py-3 px-4"><div className="flex items-center gap-3">
                                      <img className="h-12 w-12 rounded-full object-cover border-2 border-blue-200" src={getFullImageUrl(order.order_buyer.user.Avatar)} alt="Avatar" />
                                      <div><p className="font-semibold text-gray-800">{order.order_buyer.user.FullName}</p><p className="text-sm text-gray-500">{order.order_buyer.user.Email}</p></div>
                                    </div>
                                  </TableCell>
                                  <TableCell className="py-3"><code className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm font-mono">{order.SellerOrderCode}</code></TableCell> {/* <-- Tăng font */}
                                  <TableCell className="py-3 text-base text-gray-600">{formatDateForDisplay(order.order_buyer.OrderDate)}</TableCell> {/* <-- Tăng font */}
                                  <TableCell className="text-right py-3 font-bold text-lg text-emerald-600">{formatCurrency(order.TotalAmount)}</TableCell> {/* <-- Tăng font */}
                                  <TableCell className="text-center py-3">
                                    <div className="flex flex-col items-center gap-1">
                                        <div className="text-base font-medium text-gray-700">{order.order_buyer.PaymentMethod || 'N/A'}</div> {/* <-- Tăng font */}
                                        <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${getStatusBadgeClass(order.order_buyer.PaymentStatus, 'payment')}`}>
                                            {translatePaymentStatus(order.order_buyer.PaymentStatus)}
                                        </span>
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-center py-3">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-full ${getStatusBadgeClass(order.Status, 'order')}`}>
                                        {translateOrderStatus(order.Status)}
                                    </span>
                                  </TableCell>
                                  <TableCell className="text-center py-3">
                                      <Link href={`/admin/orders/seller/${order.SellerOrderID}`} className="text-blue-600 hover:text-indigo-600">
                                        <Eye className="w-6 h-6 inline-block" /> {/* <-- Tăng kích thước icon */}
                                      </Link>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </React.Fragment>
                          ))
                        ) : ( 
                          <TableRow><TableCell colSpan={7} className="text-center py-16 text-gray-500">Không tìm thấy đơn hàng nào.</TableCell></TableRow> 
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="flex items-center justify-between mt-4 px-4 pb-4">
                        <div className="text-sm text-gray-600">
                            Hiển thị {orders.length > 0 ? ((currentPage - 1) * limitItem) + 1 : 0} - {Math.min(currentPage * limitItem, totalOrders)} trên tổng số {totalOrders}
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Trước</Button>
                            <span className="text-sm">Trang {currentPage} / {totalPage}</span>
                            <Button variant="outline" size="sm" disabled={currentPage >= totalPage} onClick={() => setCurrentPage(p => p + 1)}>Sau</Button>
                        </div>
                  </div>
                </CardContent>
              </Card>}
          </div>
        </div>
      </div>
    </>
  );
}