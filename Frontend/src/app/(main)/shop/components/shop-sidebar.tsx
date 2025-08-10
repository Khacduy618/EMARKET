// /shop/components/shop-sidebar.tsx
"use client"

import { Card, CardContent } from "@/components/ui/card"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShopInfo } from "../types/shop"

interface Props {
  info: ShopInfo
  categories: { key: string; label: string; count?: number }[]
  activeCategory?: string
  onSelectCategory?: (key: string) => void
}

export function ShopSidebar({ info, categories, activeCategory = "all", onSelectCategory }: Props) {
  return (
    <div className="sticky top-35 space-y-4">
      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold">Thông tin Shop</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Info label="Người theo dõi" value={info.followers.toLocaleString()} />
            <Info label="Đánh giá" value={`${info.rating.toFixed(1)} (${info.ratingCount.toLocaleString()})`} />
            <Info label="Sản phẩm" value={`${info.productsCount}`} />
            <Info label="Tham gia" value={info.joinedAt} />
            <Info label="Tỉ lệ phản hồi" value={`${info.chatResponseRate}%`} />
            <Info label="Giao đúng hạn" value={`${info.onTimeDeliveryRate}%`} />
          </div>
          {info.isVerified && <Badge className="bg-green-500 hover:bg-green-600">Chính hãng</Badge>}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold">Danh mục</h3>
          <div className="space-y-1">
            {categories.map((c) => (
              <Button
                key={c.key}
                variant={activeCategory === c.key ? "default" : "ghost"}
                className={`w-full justify-between ${activeCategory === c.key ? "bg-orange-500 hover:bg-orange-600 text-white" : "text-gray-700"}`}
                onClick={() => onSelectCategory?.(c.key)}
              >
                <span>{c.label}</span>
                {typeof c.count === "number" && <span className="text-xs opacity-75">{c.count}</span>}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-gray-500">{label}</div>
      <div className="font-medium text-gray-900">{value}</div>
    </div>
  )
}
