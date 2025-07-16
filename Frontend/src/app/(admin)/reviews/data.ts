// 1. ĐỊNH NGHĨA CÁC TYPE
export interface User {
  id: string;
  name: string;
  avatarUrl: string;
}

export interface Product {
  id: string;
  name: string;
  imageUrl: string;
  shopName: string;
}

export type ReviewStatus = "Đã duyệt" | "Bị từ chối";

export interface Review {
  id: string;
  user: User;
  product: Product;
  rating: number; 
  comment: string;
  createdAt: string; // Chuỗi ISO 8601 Date
  status: ReviewStatus;
  isReported: boolean;
  reportReason?: string;
}

// 2. TẠO DỮ LIỆU GỐC (Người dùng, Shop, Sản phẩm)

const mockUsers: Record<string, User> = {
    user01: { id: "user01", name: "Nguyễn Văn An", avatarUrl: "https://i.pravatar.cc/150?u=user01" },
    user02: { id: "user02", name: "Trần Thị Lan", avatarUrl: "https://i.pravatar.cc/150?u=user02" },
    user03: { id: "user03", name: "Lê Minh Cường", avatarUrl: "https://i.pravatar.cc/150?u=user03" },
    user04: { id: "user04", name: "Phạm Thuý Hằng", avatarUrl: "https://i.pravatar.cc/150?u=user04" },
    user05: { id: "user05", name: "Vũ Đình Long", avatarUrl: "https://i.pravatar.cc/150?u=user05" },
    user06: { id: "user06", name: "Đặng Thị Mai", avatarUrl: "https://i.pravatar.cc/150?u=user06" },
};

const mockProducts: Record<string, Omit<Product, 'shopName'>> = {
    prod01: { id: "prod01", name: "Tai nghe Bluetooth không dây chống ồn Hoco EW04 Plus", imageUrl: "https://picsum.photos/seed/prod01/300/300" },
    prod02: { id: "prod02", name: "Áo thun nam Cotton co giãn 4 chiều", imageUrl: "https://picsum.photos/seed/prod02/300/300" },
    prod03: { id: "prod03", name: "Bàn phím cơ không dây E-DRA EK387W", imageUrl: "https://picsum.photos/seed/prod03/300/300" },
    prod04: { id: "prod04", name: "Sạc dự phòng 20000mAh Anker PowerCore", imageUrl: "https://picsum.photos/seed/prod04/300/300" },
};

const mockShops = {
    shop01: { name: "Hoco Official Store" },
    shop02: { name: "Coolmate" },
    shop03: { name: "GearVN" },
};


// 3. TẠO DANH SÁCH ĐÁNH GIÁ (initialReviews)
const allReviews: Review[] = [
  {
    id: "rv1",
    user: mockUsers.user01,
    product: { ...mockProducts.prod01, shopName: mockShops.shop01.name },
    rating: 5,
    comment: "Sản phẩm tuyệt vời, âm thanh trong trẻo, pin trâu. Giao hàng rất nhanh.",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    status: "Đã duyệt",
    isReported: false,
  },
  {
    id: "rv2",
    user: mockUsers.user03,
    product: { ...mockProducts.prod01, shopName: mockShops.shop01.name },
    rating: 4,
    comment: "Shop giao hàng chậm quá, cần thì gọi cho tôi 0987654321 để giải quyết. Sản phẩm thì ok.",
    createdAt: new Date().toISOString(),
    status: "Đã duyệt",
    isReported: true,     
    reportReason: "Người dùng để lại thông tin cá nhân (số điện thoại) trong bình luận.",
  },
  {
    id: "rv3",
    user: mockUsers.user04,
    product: { ...mockProducts.prod03, shopName: mockShops.shop03.name },
    rating: 1,
    comment: "Sản phẩm dùng từ ngữ không phù hợp, shop lừa đảo!",
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    status: "Bị từ chối",
    isReported: true,
    reportReason: "Người dùng sử dụng ngôn từ gây thù ghét, không phù hợp.",
  },
  {
    id: "rv4",
    user: mockUsers.user05,
    product: { ...mockProducts.prod02, shopName: mockShops.shop02.name },
    rating: 1,
    comment: "Đánh giá này không đúng sự thật. Tôi chưa hề nhận được hàng mà hệ thống đã báo giao thành công.",
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    status: "Đã duyệt",
    isReported: true,
    reportReason: "Shop cho rằng người dùng này là đối thủ cạnh tranh, cố tình phá hoại uy tín.",
  },
  {
    id: "rv5",
    user: mockUsers.user02,
    product: { ...mockProducts.prod04, shopName: mockShops.shop01.name },
    rating: 5,
    comment: "Sạc nhanh, dung lượng chuẩn, rất hài lòng với sản phẩm này.",
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    status: "Đã duyệt",
    isReported: false,
  },
  {
    id: "rv6",
    user: mockUsers.user06,
    product: { ...mockProducts.prod02, shopName: mockShops.shop02.name },
    rating: 2,
    comment: "Vải áo khá mỏng, không như mong đợi. Mọi người nên cân nhắc trước khi mua.",
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    status: "Đã duyệt",
    isReported: false,
  },
  {
    id: "rv7",
    user: mockUsers.user01,
    product: { ...mockProducts.prod03, shopName: mockShops.shop03.name },
    rating: 3,
    comment: "Bàn phím gõ cũng được, không quá xuất sắc. Tầm giá này thì chấp nhận được. Link mua hàng giá tốt hơn: shopee.vn/abcxyz",
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    status: "Đã duyệt",
    isReported: true,
    reportReason: "Spam, chèn link của shop khác vào đánh giá.",
  },
  {
    id: "rv8",
    user: mockUsers.user03,
    product: { ...mockProducts.prod04, shopName: mockShops.shop01.name },
    rating: 5,
    comment: "Shop tư vấn nhiệt tình, đóng gói cẩn thận. 10 điểm!",
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
    status: "Đã duyệt",
    isReported: false,
  },
];

// 4. HÀM LẤY DỮ LIỆU (để Server Component gọi)
export async function getMockReviews(): Promise<Review[]> {
  // Giả lập độ trễ của mạng/API
  await new Promise(resolve => setTimeout(resolve, 300));
  return allReviews;
}