export type ShopInfo = {
  name: string
  avatar?: string
  rating: number
  ratingCount: number
  followers: number
  productsCount: number
  joinedAt: string
  chatResponseRate: number
  responseSpeed: string
  onTimeDeliveryRate: number
  isVerified?: boolean
  isFollowing?: boolean
}

export type Product = {
  id: string
  name: string
  image?: string
  price: number
  originalPrice?: number
  badge?: string
  rating?: number
  ratingCount?: number
  sold?: number
  category: string
  createdAt: string // ISO date
}
