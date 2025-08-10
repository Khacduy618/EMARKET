// /shop/components/shop-content-skeleton.tsx
import { Card, CardContent } from "@/components/ui/card"

function ProductCardSkeleton() {
  return (
    <Card className="border-gray-200">
      <CardContent className="p-0">
        <div className="bg-gray-200 animate-pulse w-full aspect-square rounded-t" />
        <div className="p-3 space-y-3">
          <div className="bg-gray-200 animate-pulse h-4 w-full rounded" />
          <div className="bg-gray-200 animate-pulse h-4 w-3/4 rounded" />
          <div className="bg-gray-200 animate-pulse h-3 w-1/4 rounded" />
          <div className="bg-gray-200 animate-pulse h-5 w-1/2 rounded" />
          <div className="bg-gray-200 animate-pulse h-3 w-1/3 rounded" />
        </div>
      </CardContent>
    </Card>
  )
}

export function ShopContentSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  )
}