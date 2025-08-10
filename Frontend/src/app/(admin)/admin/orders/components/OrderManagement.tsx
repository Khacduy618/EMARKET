// Trong file: app/(admin)/admin/ordersadmin/components/OrderManagement.tsx

"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import {
  ChevronDown, ChevronsUpDown, Eye, Package, Truck, CheckCircle, XCircle, Clock, AlertCircle, RefreshCw,
  ChevronUp,

} from "lucide-react"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TableBody, TableCell, TableHead, TableHeader, TableRow, Table } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { getAuthToken } from "@/services/api"

// --- TYPESCRIPT & HÀM TIỆN ÍCH (Giữ nguyên) ---
export interface User { UserID: number; FullName: string; Email: string; avatar?: string; }
export interface OrderItem { OrderItemID: number; VariantID: number; Quantity: number; PriceAtPurchase: number; }
export interface Order { OrderID: number; OrderCode: string; UserID: number; OrderDate: string; TotalAmount: number; PaymentMethod: "COD" | "BankTransfer" | "OnlineGateway"; PaymentStatus: "Pending" | "Paid" | "Failed" | "Refunded"; OverallStatus: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled" | "Completed"; user: User; items: OrderItem[]; }
export interface PaginatedOrders { current_page: number; data: Order[]; last_page: number; total: number; }
const formatCurrency = (amount: number): string => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount)
const formatDateForDisplay = (dateString: string): string => new Date(dateString).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
const getStatusBadgeClass = (status: string) => {
  const map: Record<string, string> = {
    paid: "bg-green-50 text-green-700 border-green-200",
    delivered: "bg-green-50 text-green-700 border-green-200",
    completed: "bg-green-50 text-green-700 border-green-200",
    pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
    processing: "bg-blue-50 text-blue-700 border-blue-200",
    shipped: "bg-purple-50 text-purple-700 border-purple-200",
    failed: "bg-red-50 text-red-700 border-red-200",
    cancelled: "bg-red-50 text-red-700 border-red-200",
  };
  return map[status.toLowerCase()] || "bg-gray-50 text-gray-700 border-gray-200";
};
const getStatusIcon = (status: string) => {
  const iconClass = "w-4 h-4";
  switch (status.toLowerCase()) {
    case "completed": case "delivered": return <CheckCircle className={`${iconClass} text-green-600`} />;
    case "shipped": return <Truck className={`${iconClass} text-purple-600`} />;
    case "processing": return <Package className={`${iconClass} text-blue-600`} />;
    case "pending": return <Clock className={`${iconClass} text-yellow-600`} />;
    case "cancelled": case "failed": return <XCircle className={`${iconClass} text-red-600`} />;
    default: return <AlertCircle className={`${iconClass} text-gray-600`} />;
  }
};


// --- COMPONENT CHÍNH ---
export default function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [keyword, setKeyword] = useState("");
  const [sortColumn, setSortColumn] = useState("OrderDate");
  const [sortType, setSortType] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [limitItem, setLimitItem] = useState(10);
  const [totalPage, setTotalPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");

  // Hàm fetch dữ liệu được tái cấu trúc để giống hệt ProductListPage
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search: keyword, // Sử dụng state 'keyword' thay vì 'filters.search'
        sort_by: sortColumn,
        sort_order: sortType,
        page: currentPage.toString(),
        per_page: limitItem.toString(),
      });

      if (filterStatus !== "all") {
        params.set("status", filterStatus);
      }

      const authToken = getAuthToken()
      if (!authToken) {
        toast.error("Không tìm thấy token xác thực")
        return
      }

      const res = await fetch(`http://localhost:8001/api/admin/orders?${params.toString()}`, {
        headers: {
          "Accept": "application/json",
        },
        credentials: 'include',
      });

      if (!res.ok) {
        if (res.status === 401) {
          toast.error("Phiên đăng nhập không hợp lệ hoặc hết hạn. Vui lòng đăng nhập lại.");
        } else {
          toast.error(`Lỗi máy chủ: ${res.statusText}`);
        }
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const json = await res.json();
      setOrders(json.data || []);
      // Cập nhật để khớp với key của Laravel Pagination
      setTotalPage(json.last_page || 1);
      setTotalOrders(json.total || 0);
      setCurrentPage(json.current_page || 1);


    } catch (err) {
      console.error("Lỗi khi fetch đơn hàng:", err);
      // Toast error đã được xử lý ở trên
    } finally {
      setLoading(false);
    }
  }, [keyword, sortColumn, sortType, currentPage, limitItem, filterStatus]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);


  const handleSort = (col: string) => {
    if (col === sortColumn) {
      setSortType(sortType === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(col);
      setSortType("desc"); // Mặc định sort giảm dần khi đổi cột
    }
    setCurrentPage(1); // Reset về trang 1 khi sort
  };

  const renderSortIcon = (col: string) => {
    if (sortColumn !== col) return <ChevronsUpDown className="w-4 h-4 text-gray-300" />;
    return sortType === "asc" ? <ChevronUp className="w-4 h-4 text-orange-600" /> : <ChevronDown className="w-4 h-4 text-orange-600" />;
  };

  const orderStatuses: { value: Order["OverallStatus"] | 'all'; label: string }[] = [
    { value: "all", label: "Tất cả trạng thái" },
    { value: "Pending", label: "Chờ xử lý" },
    { value: "Processing", label: "Đang xử lý" },
    { value: "Shipped", label: "Đang giao" },
    { value: "Delivered", label: "Đã giao" },
    { value: "Completed", label: "Hoàn thành" },
    { value: "Cancelled", label: "Đã hủy" },
  ];

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      <div className="w-auto bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-8xl mx-auto p-4 md:p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Quản lý đơn hàng</h1>
            <p className="text-gray-600">Theo dõi và quản lý tất cả đơn hàng của bạn</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Bộ lọc và tìm kiếm</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-grow">
                <label className="text-sm font-medium">Tìm kiếm</label>
                <Input
                  placeholder="Mã đơn, tên khách hàng..."
                  value={keyword}
                  onChange={(e) => { setKeyword(e.target.value); setCurrentPage(1); }}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Trạng thái</label>
                <Select
                  value={filterStatus}
                  onValueChange={(value) => { setFilterStatus(value); setCurrentPage(1); }}
                >
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    {orderStatuses.map(status => (
                      <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Mục/Trang</label>
                <Select
                  value={limitItem.toString()}
                  onValueChange={(value) => { setLimitItem(Number(value)); setCurrentPage(1); }}
                >
                  <SelectTrigger className="w-full md:w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[10, 20, 50].map((n) => <SelectItem key={n} value={n.toString()}>{n}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => fetchOrders()}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Làm mới
              </Button>
            </CardContent>
          </Card>

          <div className="mt-6">
            {loading ? (
              <div className="text-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div><p className="mt-2">Đang tải...</p></div>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="w-[25%]">Khách hàng</TableHead>
                          <TableHead className="w-[15%]">Mã đơn hàng</TableHead>
                          <TableHead className="cursor-pointer hover:bg-gray-100" onClick={() => handleSort('OrderDate')}>
                            <div className="flex items-center gap-2">Ngày đặt {renderSortIcon('OrderDate')}</div>
                          </TableHead>
                          <TableHead className="text-right cursor-pointer hover:bg-gray-100" onClick={() => handleSort('TotalAmount')}>
                            <div className="flex items-center gap-2 justify-end">Thành tiền {renderSortIcon('TotalAmount')}</div>
                          </TableHead>
                          <TableHead className="text-center">Trạng thái</TableHead>
                          <TableHead className="text-center">Hành động</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.length > 0 ? (
                          orders.map((order) => (
                            <TableRow key={order.OrderID} className="hover:bg-orange-50/50">
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <img className="h-10 w-10 rounded-full object-cover" src={order.user.avatar || `https://i.pravatar.cc/40?u=${order.user.Email}`} alt="Avatar" />
                                  <div>
                                    <p className="font-semibold text-gray-900">{order.user.FullName}</p>
                                    <p className="text-sm text-gray-500">{order.user.Email}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell><code className="bg-gray-100 px-2 py-1 rounded text-xs">{order.OrderCode}</code></TableCell>
                              <TableCell>{formatDateForDisplay(order.OrderDate)}</TableCell>
                              <TableCell className="text-right font-bold text-orange-600">{formatCurrency(order.TotalAmount)}</TableCell>
                              <TableCell className="text-center"><span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border ${getStatusBadgeClass(order.OverallStatus)}`}>{getStatusIcon(order.OverallStatus)} {order.OverallStatus}</span></TableCell>
                              <TableCell className="text-center">
                                <Link href={`/admin/orders/${order.OrderID}`} className="text-orange-600 hover:text-orange-800"><Eye className="w-5 h-5 inline-block" /></Link>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow><TableCell colSpan={6} className="text-center py-16 text-gray-500">Không tìm thấy đơn hàng nào.</TableCell></TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-gray-600">Hiển thị {orders.length} trên tổng số {totalOrders} đơn hàng</p>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Trước</Button>
                      <span className="text-sm">Trang {currentPage} / {totalPage}</span>
                      <Button variant="outline" size="sm" disabled={currentPage === totalPage} onClick={() => setCurrentPage(p => p + 1)}>Sau</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  );
}