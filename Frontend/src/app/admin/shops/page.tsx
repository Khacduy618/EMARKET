'use client'

import { useEffect, useState } from 'react'
import Swal from 'sweetalert2'
import ShopDetailModal from './components/ShopDetailModal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { API_URL } from "@/lib/config"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { ArrowDown, ArrowUp, Loader2 } from 'lucide-react'
import { Label } from '@/components/ui/label'

type Shop = {
  ShopID: number
  UserID: number
  ShopName: string
  Description: string
  LogoURL: string
  CoverImageURL: string
  AddressStreet: string
  AddressWard: string
  AddressDistrict: string
  AddressCity: string
  ShopPhone: string
  Level: string
  Status: string
  RepresentativeName: string
  CreatedAt: string
}

const statusOptions = [
  { value: 'PendingApproval', label: 'Chờ xác nhận', tooltip: 'Chờ admin phê duyệt' },
  { value: 'Approved', label: 'Đã được chấp nhận', tooltip: 'Shop hoạt động bình thường' },
  { value: 'Suspended', label: 'Tạm ngưng', tooltip: 'Shop bị tạm dừng' },
  { value: 'Rejected', label: 'Bị từ chối', tooltip: 'Shop không được duyệt' },
]

type SortableThProps = {
  label: string
  sortColumn: string
  columnKey: string
  sortType: 'asc' | 'desc'
  onSort: (col: string, newSortType: 'asc' | 'desc') => void
}

function SortableTh({ label, sortColumn, columnKey, sortType, onSort }: SortableThProps) {
  const isActive = sortColumn === columnKey
  const nextSortType = isActive && sortType === 'asc' ? 'desc' : 'asc'

  return (
    <TableHead
      className="cursor-pointer select-none whitespace-nowrap"
      onClick={() => onSort(columnKey, nextSortType)}
      title={`Sắp xếp theo ${label} (${nextSortType === 'asc' ? 'Tăng dần' : 'Giảm dần'})`}
    >
      <div className="flex items-center gap-1">
        {label}
        {isActive && (
          <span className="ml-1">
            {sortType === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
          </span>
        )}
      </div>
    </TableHead>
  )
}

function formatDate(isoDate: string) {
  const d = new Date(isoDate)
  return isNaN(d.getTime()) ? '' : d.toLocaleDateString('vi-VN')
}

export default function ShopTable() {
  const [shops, setShops] = useState<Shop[]>([])
  const [loading, setLoading] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [sortColumn, setSortColumn] = useState('ShopID')
  const [sortType, setSortType] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [limitItem, setLimitItem] = useState(10)
  const [totalPage, setTotalPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [selectedShopId, setSelectedShopId] = useState<number | null>(null)

  const fetchShops = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        keyword,
        sort_column: sortColumn,
        sort_type: sortType,
        current_page: currentPage.toString(),
        display_quantity: limitItem.toString(),
      })

      const res = await fetch(API_URL + `/admin/shops?${params.toString()}`, {
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
      })

      const json = await res.json()
      if (json.status) {
        setShops(json.data)
        setTotalPage(json.pagination.totalPage || 1)
      } else {
        Swal.fire({ icon: 'error', title: 'Lỗi!', text: 'Không thể tải danh sách shop' })
      }
    } catch (err) {
      console.error('Lỗi fetch:', err)
      Swal.fire({ icon: 'error', title: 'Lỗi mạng!', text: 'Lỗi khi tải danh sách shop' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchShops()
  }, [keyword, sortColumn, sortType, currentPage, limitItem])

  const setSortColumnAndType = (col: string, newSortType: 'asc' | 'desc') => {
    setSortColumn(col)
    setSortType(newSortType)
    setCurrentPage(1)
  }

  const handleStatusChange = async (shopId: number, newStatus: string) => {
    const shop = shops.find((s) => s.ShopID === shopId)
    const statusLabel = statusOptions.find((opt) => opt.value === newStatus)?.label || newStatus

    const result = await Swal.fire({
      title: 'Xác nhận thay đổi',
      text: `Bạn có chắc muốn đổi trạng thái của shop "${shop?.ShopName}" sang "${statusLabel}" không?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Xác nhận',
      cancelButtonText: 'Hủy',
    })

    if (!result.isConfirmed) return

    try {
      const res = await fetch(API_URL + `/admin/shops/${shopId}/status`, {
        method: 'POST', // Or PUT, depending on your API
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify({ _method: 'PUT', status: newStatus }), // _method for Laravel-style PUT via POST
      })
      const json = await res.json()
      if (json.status) {
        setShops((prev) => prev.map((shop) => (shop.ShopID === shopId ? { ...shop, Status: newStatus } : shop)))
        Swal.fire({ icon: 'success', title: 'Cập nhật thành công!', timer: 1500, showConfirmButton: false })
      } else {
        Swal.fire({ icon: 'error', title: 'Cập nhật thất bại!', text: json.message || 'Có lỗi xảy ra' })
      }
    } catch (err) {
      console.error('Lỗi cập nhật trạng thái:', err)
      Swal.fire({ icon: 'error', title: 'Lỗi mạng!', text: 'Không thể kết nối đến máy chủ' })
    }
  }

  return (
    <TooltipProvider delayDuration={0}>
      <div className="container mx-auto px-4 py-8">
        <h2 className="mb-6 text-3xl font-bold">Danh sách shop</h2>

        {/* Filter and Search Section */}
        <div className="mb-6 rounded-lg border bg-muted/50 p-4">
          <h4 className="mb-4 text-lg font-semibold text-foreground">Bộ lọc và tìm kiếm</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            {/* Search by Shop Name */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="shop-name-search" className="text-sm font-normal text-muted-foreground">Tìm kiếm theo tên shop</Label>
              <Input
                id="shop-name-search"
                type="text"
                placeholder="Nhập tên shop..."
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full"
              />
            </div>

            {/* Sort by Column */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="sort-column" className="text-sm font-normal text-muted-foreground">Sắp xếp theo</Label>
              <Select
                value={sortColumn}
                onValueChange={(value) => setSortColumnAndType(value, sortType)}
              >
                <SelectTrigger id="sort-column" className="w-full">
                  <SelectValue placeholder="Chọn cột" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ShopID">ShopID</SelectItem>
                  <SelectItem value="ShopName">Tên Shop</SelectItem>
                  <SelectItem value="RepresentativeName">Đại diện</SelectItem>
                  <SelectItem value="ShopPhone">Điện thoại</SelectItem>
                  <SelectItem value="AddressCity">Địa chỉ (TP)</SelectItem>
                  <SelectItem value="Level">Level</SelectItem>
                  <SelectItem value="Status">Trạng thái</SelectItem>
                  <SelectItem value="CreatedAt">Ngày đăng ký</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort Order */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="sort-order" className="text-sm font-normal text-muted-foreground">Thứ tự</Label>
              <Select
                value={sortType}
                onValueChange={(value) => setSortColumnAndType(sortColumn, value as 'asc' | 'desc')}
              >
                <SelectTrigger id="sort-order" className="w-full">
                  <SelectValue placeholder="Chọn thứ tự" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Tăng dần</SelectItem>
                  <SelectItem value="desc">Giảm dần</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Items per page */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="items-per-page" className="text-sm font-normal text-muted-foreground">Hiển thị</Label>
              <Select
                value={String(limitItem)}
                onValueChange={(value) => {
                  setLimitItem(parseInt(value, 10))
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger id="items-per-page" className="w-full">
                  <SelectValue placeholder="Số lượng" />
                </SelectTrigger>
                <SelectContent>
                  {[5, 10, 20, 50].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <SortableTh label="Logo" columnKey="LogoURL" {...{ sortColumn, sortType, onSort: setSortColumnAndType }} />
                    <SortableTh label="Tên Shop" columnKey="ShopName" {...{ sortColumn, sortType, onSort: setSortColumnAndType }} />
                    <SortableTh label="Đại diện" columnKey="RepresentativeName" {...{ sortColumn, sortType, onSort: setSortColumnAndType }} />
                    <SortableTh label="Điện thoại" columnKey="ShopPhone" {...{ sortColumn, sortType, onSort: setSortColumnAndType }} />
                    <SortableTh label="Level" columnKey="Level" {...{ sortColumn, sortType, onSort: setSortColumnAndType }} />
                    <SortableTh label="Ngày đăng ký" columnKey="CreatedAt" {...{ sortColumn, sortType, onSort: setSortColumnAndType }} />
                    <SortableTh label="Trạng thái" columnKey="Status" {...{ sortColumn, sortType, onSort: setSortColumnAndType }} />
                    <TableHead>Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shops.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                        Không có dữ liệu
                      </TableCell>
                    </TableRow>
                  )}
                  {shops.map((shop) => (
                    <TableRow key={shop.ShopID}>
                      <TableCell>
                        <img
                          src={shop.LogoURL || '/placeholder.svg?height=50&width=50&text=Logo'}
                          alt="Logo"
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      </TableCell>
                      <TableCell className="font-medium">{shop.ShopName}</TableCell>
                      <TableCell className="text-muted-foreground">{shop.RepresentativeName}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{shop.ShopPhone}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{shop.Level}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDate(shop.CreatedAt)}</TableCell>
                      <TableCell>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Select
                              value={shop.Status}
                              onValueChange={(value) => handleStatusChange(shop.ShopID, value)}
                            >
                              <SelectTrigger className="w-[160px]">
                                <SelectValue placeholder="Trạng thái" />
                              </SelectTrigger>
                              <SelectContent>
                                {statusOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TooltipTrigger>
                          <TooltipContent>Trạng thái hiện tại: {shop.Status}</TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedShopId(shop.ShopID)
                            setShowModal(true)
                          }}
                        >
                          Chi tiết
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="mt-6 flex justify-center">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Trước
                </Button>
                {Array.from({ length: totalPage }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={page === currentPage ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPage))}
                  disabled={currentPage === totalPage}
                >
                  Sau
                </Button>
              </div>
            </div>

            {/* Shop Detail Modal */}
            <ShopDetailModal
              show={showModal}
              onHide={() => setShowModal(false)}
              shopId={selectedShopId}
            />
          </>
        )}
      </div>
    </TooltipProvider>
  )
}