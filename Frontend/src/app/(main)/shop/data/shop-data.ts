import type { ShopInfo, Product } from "../types/shop"

export const shopInfo: ShopInfo = {
  name: "Shop Thời Trang Official",
  avatar: "/placeholder.svg?height=120&width=120",
  rating: 4.8,
  ratingCount: 32540,
  followers: 189000,
  productsCount: 426,
  joinedAt: "06/2020",
  chatResponseRate: 98,
  responseSpeed: "Trong vài phút",
  onTimeDeliveryRate: 96,
  isVerified: true,
  isFollowing: false,
}

export const categories = [
  { key: "all", label: "Tất cả" },
  { key: "ao-thun", label: "Áo thun" },
  { key: "quan-jean", label: "Quần jean" },
  { key: "giay-sneaker", label: "Giày sneaker" },
  { key: "phu-kien", label: "Phụ kiện" },
]

function p(id: number, override: Partial<Product> = {}): Product {
  const base: Product = {
    id: String(id),
    name: "Áo thun unisex form rộng chất cotton thoáng mát",
    image: `/placeholder.svg?height=300&width=300&query=product ${id}`,
    price: 99000 + (id % 5) * 10000,
    originalPrice: 159000 + (id % 4) * 10000,
    badge: id % 7 === 0 ? "Mall" : undefined,
    rating: 4 + (id % 5) / 10,
    ratingCount: 120 + id * 3,
    sold: 1000 + id * 57,
    category: ["ao-thun", "quan-jean", "giay-sneaker", "phu-kien"][id % 4],
    createdAt: new Date(Date.now() - id * 86400000).toISOString(),
  }
  return { ...base, ...override }
}

export const products: Product[] = [
  p(1),
  p(2),
  p(3),
  p(4),
  p(5),
  p(6),
  p(7),
  p(8),
  p(9),
  p(10),
  p(11),
  p(12),
  p(13),
  p(14),
  p(15),
  p(16),
]
