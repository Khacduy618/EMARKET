// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Hàm middleware chính
export function middleware(request: NextRequest) {
    // 1. Lấy session cookie từ request
    // Tên cookie này phải khớp với tên session của Laravel bạn
    const sessionToken = request.cookies.get('laravel_session');

    // 2. Kiểm tra xem người dùng có đang cố gắng truy cập vào một trang được bảo vệ không
    // Ở đây, chúng ta muốn bảo vệ tất cả các route bắt đầu bằng '/account'
    const isAccessingProtectedArea = request.nextUrl.pathname.startsWith('/account');

    // 3. Logic bảo vệ
    if (isAccessingProtectedArea && !sessionToken) {
        // Nếu họ đang vào khu vực cần đăng nhập và không có session token,
        // chuyển hướng họ về trang login.
        // Chúng ta cũng có thể thêm một query param `redirect` để đưa họ trở lại sau khi login.
        const loginUrl = new URL('/signin', request.url);
        loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
        return NextResponse.redirect(loginUrl);
    }

    // 4. Cho phép request đi tiếp nếu không có vấn đề gì
    return NextResponse.next();
}

// Cấu hình matcher để middleware này chỉ chạy trên các path cần thiết,
// giúp tối ưu hóa hiệu suất.
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes của Next.js)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
        // Chỉ cần dòng trên là đủ, logic kiểm tra `startsWith('/account')` đã xử lý việc này.
    ],
};
