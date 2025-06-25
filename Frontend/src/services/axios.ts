// services/api.ts
import axios from 'axios';

const api = axios.create({
    // Sử dụng biến môi trường. Chắc chắn rằng chúng đang trỏ đến https nếu bạn đã làm ở bước trước
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://localhost:8000/api',

    // Ba dòng này là tất cả những gì bạn cần cho việc xác thực
    withCredentials: true,
    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN',

    // Headers mặc định
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    },
});

// KHÔNG CẦN BẤT KỲ INTERCEPTOR NÀO Ở ĐÂY
// Axios sẽ tự động xử lý XSRF token.

export default api;
