// Định nghĩa vai trò người dùng
export type UserRole = 'Buyer' | 'Seller';

// Định nghĩa cấu trúc User
export interface User {
  id: string;
  name: string;
  avatarUrl: string;
  role: UserRole;
}

// Định nghĩa cấu trúc Product
export interface Product {
  id: string;
  name: string;
  imageUrl: string;
}

// Định nghĩa cấu trúc Comment, có thể lồng nhau
export interface Comment {
  id: string;
  user: User;
  text: string;
  createdAt: string;
  replies: Comment[]; // Mảng chứa các bình luận trả lời
  rating?: number;    // Thuộc tính tùy chọn, chỉ có ở các đánh giá
}

// --- DỮ LIỆU GIẢ LẬP ---

const mockUsers: Record<string, User> = {
    buyer1: { id: 'buyer1', name: 'Trần Thị Bình', avatarUrl: 'https://i.pravatar.cc/150?u=buyer1', role: 'Buyer' },
    buyer2: { id: 'buyer2', name: 'Nguyễn Văn An', avatarUrl: 'https://i.pravatar.cc/150?u=buyer2', role: 'Buyer' },
    buyer3: { id: 'buyer3', name: 'Lê Minh Cường', avatarUrl: 'https://i.pravatar.cc/150?u=buyer3', role: 'Buyer' },
    seller1: { id: 'seller1', name: 'Hoco Official Store', avatarUrl: 'https://i.pravatar.cc/150?u=seller1', role: 'Seller' },
};

export const mockProduct: Product = {
    id: 'prod01',
    name: 'Tai nghe Bluetooth không dây chống ồn Hoco EW04 Plus',
    imageUrl: 'https://picsum.photos/seed/prod01/300/300'
};

const mockComments: Comment[] = [
    {
        id: 'cmt1', user: mockUsers.buyer1, text: 'Tai nghe dùng rất thích, pin trâu, âm thanh trong trẻo. Rất đáng tiền!', rating: 5,
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        replies: [
            { id: 'cmt1_reply1', user: mockUsers.seller1, text: 'Cảm ơn bạn đã tin tưởng và ủng hộ sản phẩm của shop ạ!', createdAt: new Date(Date.now() - 86400000 * 4).toISOString(), replies: [] },
            { id: 'cmt1_reply2', user: mockUsers.buyer2, text: 'Mình cũng mới mua, công nhận tốt thật.', createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), replies: [] }
        ]
    },
    { id: 'cmt2', user: mockUsers.buyer2, text: 'Chất lượng quá tệ, không nên mua.', rating: 1, createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), replies: [] },
    { id: 'cmt3', user: mockUsers.buyer3, text: 'Sản phẩm có chống nước không shop ơi?', createdAt: new Date(Date.now() - 86400000 * 2.5).toISOString(), replies: [] }
];

// Hàm lấy danh sách bình luận
export async function getMockComments(productId: string): Promise<Comment[]> {
    console.log(`Fetching comments for product: ${productId}`);
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockComments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// Lấy thông tin người dùng hiện tại (để biết ai đang bình luận)
export const getCurrentUser = (): User => {
    return mockUsers.buyer3; // Giả lập người dùng 'Lê Minh Cường' đang đăng nhập
}