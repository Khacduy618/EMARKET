import { Review, RatingStats } from "../types"

export const reviewsData: Review[] = [
  {
    id: 1,
    user: "Nguyễn Thị Mai",
    avatar: "/placeholder.svg?height=40&width=40",
    rating: 5,
    date: "2024-01-15",
    content: "Sản phẩm rất tốt, chất lượng vượt mong đợi. Giao hàng nhanh, đóng gói cẩn thận. Sẽ mua lại lần sau!",
    images: [
      "/placeholder.svg?height=100&width=100",
      "/placeholder.svg?height=100&width=100"
    ],
    helpful: 12,
    variant: "Màu đỏ, Size M"
  },
  {
    id: 2,
    user: "Trần Văn Nam",
    avatar: "/placeholder.svg?height=40&width=40",
    rating: 4,
    date: "2024-01-10",
    content: "Sản phẩm ổn, đúng như mô tả. Chỉ có điều giao hàng hơi chậm một chút. Nhìn chung vẫn hài lòng.",
    images: [],
    helpful: 8,
    variant: "Màu xanh, Size L",
    shopReply: {
      content: "Cảm ơn bạn đã đánh giá! Shop sẽ cải thiện thời gian giao hàng trong tương lai.",
      date: "2024-01-11"
    }
  },
  {
    id: 3,
    user: "Lê Thị Hoa",
    avatar: "/placeholder.svg?height=40&width=40",
    rating: 5,
    date: "2024-01-08",
    content: "Chất lượng tuyệt vời! Đúng như hình ảnh mô tả. Shop tư vấn nhiệt tình. Recommend!",
    images: [
      "/placeholder.svg?height=100&width=100"
    ],
    helpful: 15,
    variant: "Màu trắng, Size S"
  },
  {
    id: 4,
    user: "Phạm Minh Tuấn",
    avatar: "/placeholder.svg?height=40&width=40",
    rating: 3,
    date: "2024-01-05",
    content: "Sản phẩm bình thường, không có gì đặc biệt. Giá cả hợp lý nhưng chất lượng chỉ ở mức trung bình.",
    images: [],
    helpful: 3,
    variant: "Màu đen, Size M"
  }
]

export const ratingStats: RatingStats = {
  average: 4.3,
  total: 1247,
  distribution: {
    5: 65,
    4: 20,
    3: 10,
    2: 3,
    1: 2
  }
}
