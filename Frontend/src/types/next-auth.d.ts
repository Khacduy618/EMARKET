import 'next-auth';
import 'next-auth/jwt';

// Mở rộng các module gốc của NextAuth
declare module 'next-auth' {
    /**
     * Mở rộng kiểu Session để thêm thuộc tính `id` của chúng ta.
     * Giờ đây, mỗi khi bạn dùng `useSession` hoặc `getServerSession`,
     * TypeScript sẽ biết rằng `session.user` có thuộc tính `id`.
     */
    interface Session {
        user: {
            id: string;
        } & DefaultSession['user']; // Giữ lại các thuộc tính mặc định: name, email, image
    }
}

declare module 'next-auth/jwt' {
    /**
     * Mở rộng kiểu JWT để thêm `id`.
     * Token này sẽ được dùng để truyền `id` giữa các callback.
     */
    interface JWT {
        id: string;
    }
}