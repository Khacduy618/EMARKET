// services/auth.service.ts
import api from './axios';
import { LoginPayload, User } from '@/types';

/**
 * Hàm này chỉ có một nhiệm vụ: Kích hoạt một request BẤT KỲ đến backend
 * để backend có cơ hội set cookie `XSRF-TOKEN` đầu tiên.
 * Chúng ta sẽ dùng một endpoint giả lập không có thật trong baseURL của api.
 * Lời gọi này có thể thất bại (404), và ĐIỀU ĐÓ HOÀN TOÀN BÌNH THƯỜNG.
 * Mục đích của nó là chỉ để "đánh thức" session.
 */
export const getCsrfCookie = async (): Promise<void> => {
    try {
        // Chúng ta không gọi đến /sanctum/csrf-cookie nữa.
        // Chúng ta sẽ gọi một route không cần xác thực trong file api.php của bạn.
        // Nếu bạn chưa có, hãy tạo một route đơn giản. Nếu đã có rồi (ví dụ /products), dùng nó.
        // Lời gọi này chỉ nhằm mục đích lấy cookie.
        await api.get('/csrf-init'); // Hoặc bất kỳ route GET công khai nào trong api.php
    } catch (error: any) {
        // Chúng ta phớt lờ lỗi ở đây. Request này được phép thất bại (ví dụ 404).
        // Miễn là nó đã được gửi đi, cookie sẽ được thiết lập nếu cần.
        console.log("CSRF init call completed (error is acceptable).");
    }
};


export const login = async (credentials: LoginPayload): Promise<void> => {
    // Axios sẽ tự động xử lý X-XSRF-TOKEN vì chúng ta đã cấu hình nó trong api.ts
    await api.post('/login', credentials);
};

export const logout = async (): Promise<void> => {
    // Không cần getCsrfCookie trước khi logout vì session đã tồn tại
    await api.post('/logout');
}

export const getMe = async (): Promise<User> => {
    const { data } = await api.get<User>('/me');
    return data;
};
