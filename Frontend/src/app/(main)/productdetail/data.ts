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
}

// --- DỮ LIỆU GIẢ LẬP ---

const mockUsers: Record<string, User> = {
    buyer1: { id: 'buyer1', name: 'Trần Thị Bình', avatarUrl: 'https://i.pravatar.cc/150?u=buyer1', role: 'Buyer' },
    seller1: { id: 'seller1', name: 'Hoco Official Store', avatarUrl: 'https://i.pravatar.cc/150?u=seller1', role: 'Seller' },
    buyer2: { id: 'buyer2', name: 'Nguyễn Văn An', avatarUrl: 'https://i.pravatar.cc/150?u=buyer2', role: 'Buyer' },
};

export const mockProduct: Product = {
    id: 'prod01',
    name: 'Tai nghe Bluetooth không dây chống ồn Hoco EW04 Plus',
    imageUrl: 'https://picsum.photos/seed/prod01/300/300'
};

// Dữ liệu bình luận có cả trả lời
const mockComments: Comment[] = [
    {
        id: 'cmt1',
        user: mockUsers.buyer1,
        text: 'Tai nghe dùng rất thích, pin trâu, âm thanh trong trẻo. Rất đáng tiền!',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        replies: [
            {
                id: 'cmt1_reply1',
                user: mockUsers.seller1, // Seller trả lời
                text: 'Cảm ơn bạn đã tin tưởng và ủng hộ sản phẩm của shop ạ!',
                createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
                replies: []
            }
        ]
    },
    {
        id: 'cmt2',
        user: mockUsers.buyer2,
        text: 'Chất lượng quá tệ, không nên mua.',
        createdAt: new Date().toISOString(),
        replies: []
    }
];

// Hàm lấy danh sách bình luận
export async function getMockComments(productId: string): Promise<Comment[]> {
    console.log(`Fetching comments for product: ${productId}`);
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockComments;
}

// Lấy thông tin người dùng hiện tại (để biết ai đang bình luận)
export const getCurrentUser = (): User => {
    // Trong thực tế, bạn sẽ lấy từ session hoặc context
    return mockUsers.buyer1;
}