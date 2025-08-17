// app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials, req) {
                if (!credentials) return null;

                // Gọi API login của Laravel
                const res = await fetch(`${process.env.LARAVEL_API_URL}/login`, {
                    method: 'POST',
                    body: JSON.stringify({
                        email: credentials.email,
                        password: credentials.password,
                    }),
                    headers: { "Content-Type": "application/json" }
                });

                const data = await res.json();

                // Nếu login thành công, Laravel trả về thông tin user và token
                if (res.ok && data.user) {
                    // Trả về đối tượng user để NextAuth lưu vào session
                    // Thêm token vào đối tượng user để có thể truy cập sau này
                    return {
                        id: data.user.id.toString(),
                        name: data.user.name,
                        email: data.user.email,
                        accessToken: data.token, // Token từ Laravel
                    };
                }
                // Trả về null nếu login thất bại
                return null;
            }
        })
    ],
    session: {
        strategy: "jwt",
    },
    callbacks: {
        // Gắn thêm thông tin vào JWT token của NextAuth
        async jwt({ token, user }) {
            // user chỉ tồn tại ở lần đăng nhập đầu tiên
            if (user) {
                // Ép kiểu `user` thành kiểu `User` mà chúng ta đã mở rộng
                // để TypeScript hiểu rằng nó có các thuộc tính id và accessToken
                const u = user as any; // Hoặc một kiểu cụ thể hơn nếu bạn đã định nghĩa
                return {
                    ...token,
                    id: u.id,
                    accessToken: u.accessToken,
                };
            }
            // Ở các lần gọi sau, token đã có sẵn thông tin, chỉ cần trả về nó
            return token;
        },

        // Gắn thêm thông tin vào đối tượng session từ token
        async session({ session, token }) {
            // `token` ở đây là kết quả từ hàm `jwt` ở trên
            // nên nó đã có sẵn `id` và `accessToken`
            return {
                ...session,
                user: {
                    ...session.user,
                    id: token.id, // Lấy id từ token
                },
                accessToken: token.accessToken, // Lấy accessToken từ token
            };
        }
    },
    pages: {
        signIn: '/login', // Trang đăng nhập tùy chỉnh của bạn
    }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };