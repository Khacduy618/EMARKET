// services/api.ts
import axios from 'axios';

const api = axios.create({
    // baseURL phải trỏ đến thư mục /api của backend
    baseURL: process.env.NEXT_PUBLIC_API_URL,

    // RẤT QUAN TRỌNG: Cho phép gửi cookie đi
    withCredentials: true,

    // CÁC DÒNG QUAN TRỌNG NHẤT:
    // Yêu cầu axios TỰ ĐỘNG đọc cookie tên là 'XSRF-TOKEN'...
    xsrfCookieName: 'XSRF-TOKEN',

    // ...và TỰ ĐỘNG đặt giá trị của nó vào header 'X-XSRF-TOKEN'
    xsrfHeaderName: 'X-XSRF-TOKEN',

    // Các header mặc định khác
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    },
});

// KHÔNG CẦN BẤT KỲ INTERCEPTOR NÀO Ở ĐÂY
// Axios đã tự xử lý XSRF một cách thông minh.

export default api;
