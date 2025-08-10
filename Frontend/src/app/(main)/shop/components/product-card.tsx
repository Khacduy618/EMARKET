// // /shop/components/product-card.tsx
"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"
import Link from "next/link"; 
import type { ProductForUI as Product } from "@/types"
import { getFullImageUrl } from "@/services/api"; 

interface Props {
  product: Product
}

export function ProductCard({ product }: Props) {
  // Toàn bộ logic và JSX giữ nguyên vì tên trường đã khớp
   const hasDiscount = !!product.discountPercent && product.discountPercent > 0;

   return (
    <Link href={`/product/${product.id}`} className="block group"> 
    <Card className="hover:shadow-md transition-shadow border-gray-200">
      <CardContent className="p-0">
        <div className="relative">
          <img
              src={getFullImageUrl(product.image)} // Áp dụng hàm ở đây
              alt={product.name}
              className="w-full aspect-square object-cover rounded-t"
            />
          {/* Badge Yêu thích và Giảm giá có thể cùng tồn tại */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
             {/* Bạn có thể thêm logic cho badge Yêu thích ở đây nếu cần */}
             {/* <Badge className="bg-red-500 text-white">Yêu thích</Badge> */}
          </div>

         {hasDiscount && (
            <div className="absolute top-2 right-2">
              <Badge className="bg-yellow-400 text-yellow-900 font-bold">-{product.discountPercent}%</Badge>
            </div>
          )}
          {product.badge && (
            <div className="absolute top-2 right-2">
              <Badge variant="secondary">{product.badge}</Badge>
            </div>
          )}
        </div>

        <div className="p-3 space-y-2">
          <h3 className="text-sm font-medium line-clamp-2 min-h-[2.5rem]">{product.name}</h3>

          <div className="flex items-center gap-1 text-xs text-gray-600">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${i <= Math.round(product.rating ?? 0) ? "fill-orange-500 text-orange-500" : "text-gray-300"}`}
              />
            ))}
            <span className="ml-1">({product.ratingCount?.toLocaleString() ?? 0})</span>
          </div>

          <div className="flex items-baseline gap-2">
            <div className="text-orange-500 font-bold text-base">₫{product.price.toLocaleString()}</div>
            {/* Vẫn hiển thị giá gốc nếu có */}
            {product.originalPrice && product.originalPrice > product.price && (
              <div className="text-gray-400 line-through text-xs">₫{product.originalPrice.toLocaleString()}</div>
            )}
          </div>

          <div className="text-xs text-gray-600">Đã bán {product.sold?.toLocaleString() ?? 0}</div>
        </div>
      </CardContent>
    </Card>
    </Link>
  )
}