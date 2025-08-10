"use client"

import React from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ProductCard } from "./product-card"
import { Search, Filter } from "lucide-react"
import type { ProductForUI as Product, ShopCategoryForUI as ShopCategory } from "@/types"

interface Props {
  products: Product[]
  categories: ShopCategory[]
  query: string
  onQueryChange: (v: string) => void
  category: string
  onCategoryChange: (v: string) => void
  sortBy: "popular" | "newest" | "price-asc" | "price-desc"
  onSortByChange: (v: "popular" | "newest" | "price-asc" | "price-desc") => void
  priceMin: string
  priceMax: string
  onPriceMinChange: (v: string) => void
  onPriceMaxChange: (v: string) => void
  // THAY ĐỔI: Thêm prop isLoading để kiểm soát trạng thái tải sản phẩm
  isLoading?: boolean;
  // THAY ĐỔI: Sử dụng children để nhận skeleton component
  children?: React.ReactNode; 
}

export function ShopContent({
  products,
  categories,
  query,
  onQueryChange,
  category,
  onCategoryChange,
  sortBy,
  onSortByChange,
  priceMin,
  priceMax,
  onPriceMinChange,
  onPriceMaxChange,
  // Nhận các props mới
  isLoading = false,
  children
}: Props) {
  return (
    <div className="space-y-4">
      {/* Toolbar - Phần này luôn được hiển thị */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col md:flex-row gap-3 md:items-center">
            {/* Search */}
            <div className="flex-1 flex">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  placeholder="Tìm trong shop..."
                  className="pl-9"
                  value={query}
                  onChange={(e) => onQueryChange(e.target.value)}
                />
              </div>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Sắp xếp:</span>
              <Select value={sortBy} onValueChange={(v) => onSortByChange(v as any)}>
                <SelectTrigger className="w-[170px]">
                  <SelectValue placeholder="Phổ biến" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Phổ biến</SelectItem>
                  <SelectItem value="newest">Mới nhất</SelectItem>
                  <SelectItem value="price-asc">Giá: Thấp đến Cao</SelectItem>
                  <SelectItem value="price-desc">Giá: Cao đến Thấp</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Categories (quick) */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
            <span className="text-sm text-gray-600 flex-shrink-0">
              <Filter className="w-4 h-4 inline mr-1" />
              Danh mục:
            </span>
            {categories.map((c) => (
              <Button
                key={c.key}
                variant={category === c.key ? "default" : "outline"}
                className={`h-8 rounded-full px-3 ${category === c.key ? "bg-orange-500 hover:bg-orange-600 text-white" : ""}`}
                onClick={() => onCategoryChange(c.key)}
              >
                {c.label}
              </Button>
            ))}
          </div>

          {/* Price range */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Khoảng giá:</span>
            <Input
              type="number"
              placeholder="Từ"
              value={priceMin}
              onChange={(e) => onPriceMinChange(e.target.value)}
              className="w-28"
              min={0}
            />
            <span className="text-gray-400">-</span>
            <Input
              type="number"
              placeholder="Đến"
              value={priceMax}
              onChange={(e) => onPriceMaxChange(e.target.value)}
              className="w-28"
              min={0}
            />
            <Button
              variant="ghost"
              onClick={() => {
                onPriceMinChange("")
                onPriceMaxChange("")
              }}
            >
              Xóa
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Grid - Logic hiển thị đã được cập nhật */}
      {isLoading ? (
        // Nếu đang tải, hiển thị children (chính là Skeleton component)
        children
      ) : products.length === 0 ? (
        // Nếu không tải và không có sản phẩm, hiển thị thông báo
        <Card>
          <CardContent className="p-8 text-center text-gray-600">Không tìm thấy sản phẩm phù hợp.</CardContent>
        </Card>
      ) : (
        // Nếu có sản phẩm, render grid
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  )
}