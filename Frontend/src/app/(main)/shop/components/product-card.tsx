// /shop/components/product-card.tsx
"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"
import type { Product } from "../types/shop"

interface Props {
  product: Product
}

export function ProductCard({ product }: Props) {
  const hasDiscount = product.originalPrice && product.originalPrice > product.price
  const discountPercent = hasDiscount
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0

  return (
    <Card className="hover:shadow-md transition-shadow border-gray-200">
      <CardContent className="p-0">
        <div className="relative">
          <img
            src={product.image || "/placeholder.svg?height=300&width=300&query=product image"}
            alt={product.name}
            className="w-full aspect-square object-cover rounded-t"
          />
          {hasDiscount && (
            <div className="absolute top-2 left-2">
              <Badge className="bg-orange-500 text-white">-{discountPercent}%</Badge>
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
            {hasDiscount && (
              <div className="text-gray-400 line-through text-xs">₫{product.originalPrice!.toLocaleString()}</div>
            )}
          </div>

          <div className="text-xs text-gray-600">Đã bán {product.sold?.toLocaleString() ?? 0}</div>
        </div>
      </CardContent>
    </Card>
  )
}
