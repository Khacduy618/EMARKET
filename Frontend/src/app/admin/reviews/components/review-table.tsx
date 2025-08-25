// Frontend/src/app/admin/reviews/components/review-table.tsx

"use client";

import { useMemo, useState, Fragment } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Eye, ChevronLeft, ChevronRight, Store } from "lucide-react";
import { ReviewDetailDialog } from "./review-detail-dialog";
import { AdminReview, ReviewStatus } from "@/types";
import { getStorageImageUrl } from "@/services/api";

// Định nghĩa kiểu cho các props mà component này nhận
interface ReviewTableProps {
  data: AdminReview[];
  onUpdateSingleReview: (updatedReview: AdminReview) => void;
  // Pagination props
  page: number;
  totalPages: number;
  totalResults: number;
  pageSize: number;
  onPageChange: (v: number) => void;
  // Grouping & display props
  groupByShop?: boolean;
  showingFrom?: number;
  showingTo?: number;
}

export function ReviewTable({
  data,
  onUpdateSingleReview,
  page,
  totalPages,
  totalResults,
  pageSize,
  onPageChange,
  groupByShop = false,
  showingFrom,
  showingTo,
}: ReviewTableProps) {
  // State để quản lý dialog nào đang mở, sử dụng 'number' để khớp với ID
  const [openId, setOpenId] = useState<number | null>(null);

  // Nhóm các review theo shop để hiển thị
  const groups = useMemo(() => {
    if (!groupByShop) return { __all__: data };
    const grouped: Record<string, AdminReview[]> = {};
    for (const r of data) {
      const key = `${r.shopId}|||${r.shopName}`;
      grouped[key] = grouped[key] || [];
      grouped[key].push(r);
    }
    return grouped;
  }, [data, groupByShop]);

  // Tìm review hiện tại đang được chọn để xem chi tiết
  const currentReview = useMemo(() => data.find((r) => r.id === openId), [data, openId]);

  // Hàm helper để hiển thị badge trạng thái với màu sắc tương ứng
  function statusBadge(status: ReviewStatus) {
    const map: Record<ReviewStatus, { label: string; className: string }> = {
      pending: { label: "Chờ duyệt", className: "bg-blue-100 text-blue-800" },
      approved: { label: "Đã duyệt", className: "bg-green-100 text-green-800" },
      rejected: { label: "Từ chối", className: "bg-red-100 text-red-800" },
      hidden: { label: "Đã ẩn", className: "bg-gray-200 text-gray-800" },
      under_review: { label: "Đang xem xét", className: "bg-yellow-100 text-yellow-800" }, // Đổi sang màu vàng cho dễ nhìn
      flagged: { label: "Đã gắn cờ", className: "bg-purple-100 text-purple-800" },
    };
    const s = map[status as ReviewStatus] || { 
        label: `Không xác định (${status})`, // Hiển thị trạng thái lạ để dễ debug
        className: "bg-gray-500 text-white" // Một màu trung tính
    };
    
    return (
      <Badge className={s.className} variant="secondary">
        {s.label}
      </Badge>
    );
  }

  // NOTE: Các hàm handleMarkReviewed và handleRejectRequest đã được xóa khỏi đây.
  // Logic cập nhật giờ nằm hoàn toàn trong ReviewDetailDialog.

  return (
    <>
      <div className="overflow-x-auto bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[200px]">Sản phẩm</TableHead>
              <TableHead className="min-w-[180px]">Người đánh giá</TableHead>
              <TableHead className="min-w-[120px]">Rating</TableHead>
              <TableHead>Ngày</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.keys(groups).length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-sm text-gray-500 py-8">
                  Không có đánh giá phù hợp với bộ lọc.
                </TableCell>
              </TableRow>
            ) : (
              Object.entries(groups).map(([groupKey, rows]) => {
                const [shopId, shopName] = groupKey.split("|||");
                return (
                  <Fragment key={groupKey}>
                    {groupByShop && (
                      <TableRow className="hover:bg-gray-50">
                        <TableCell colSpan={7} className="bg-gray-50 py-2.5">
                          <div className="flex items-center gap-2">
                            <Store className="w-4 h-4 text-gray-600" />
                            <span className="font-semibold text-gray-900">{shopName}</span>
                            <span className="text-xs text-gray-500">(ID: {shopId})</span>
                            <span className="text-xs text-gray-500">• {rows.length} đánh giá</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}

                    {rows.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="align-top">
                          <div className="flex items-start gap-3">
                            <img
                              src={getStorageImageUrl(r.productImage) || "/placeholder.svg?height=60&width=60"}
                              alt={r.productName}
                              className="w-14 h-14 rounded-md object-cover border"
                            />
                            <div>
                              <p className="font-semibold text-sm line-clamp-2 max-w-[280px]">{r.productName}</p>
                              <p className="text-xs text-gray-500 line-clamp-1 max-w-[280px] italic mt-1">"{r.content}"</p>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="align-top">
                          <div className="flex items-center gap-2">
                            <Avatar className="w-9 h-9">
                              <AvatarImage src={r.reviewerAvatar || undefined} />
                              <AvatarFallback>{r.reviewerName?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-sm">{r.reviewerName}</span>
                          </div>
                        </TableCell>

                        <TableCell className="align-top">
                          <div className="flex items-center gap-1 text-orange-400">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={`w-4 h-4 ${i < r.rating ? "fill-orange-400" : "text-gray-300"}`} />
                            ))}
                          </div>
                        </TableCell>

                        <TableCell className="align-top text-sm text-gray-600">{r.date}</TableCell>
                        
                        <TableCell className="align-top text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => setOpenId(r.id)}>
                              <Eye className="w-4 h-4 mr-1.5" />
                              Xem
                            </Button>
                            
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </Fragment>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-4">
        <div className="text-sm text-gray-600">
          Hiển thị từ {showingFrom ?? 0} đến {showingTo ?? 0} trên tổng số {totalResults.toLocaleString()}
        </div>
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {/* Logic hiển thị các nút trang có thể được cải thiện thêm nếu cần */}
            <span className="px-2 text-sm">Trang {page} / {totalPages}</span>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Dialog được render ở đây, nhận vào review hiện tại và hàm callback onUpdateSingleReview */}
      <ReviewDetailDialog
        open={!!openId}
        onOpenChange={(v) => !v && setOpenId(null)}
        review={currentReview}
        onUpdate={onUpdateSingleReview}
      />
    </>
  );
}