export interface Review {
  id: number
  user: string
  avatar: string
  rating: number
  date: string
  content: string
  images: string[]
  helpful: number
  variant: string
  shopReply?: {
    content: string
    date: string
  }
}

export interface RatingStats {
  average: number
  total: number
  distribution: {
    [key: number]: number
  }
}
