import axios from 'axios';

// Giả sử bạn lưu token trong localStorage sau khi đăng nhập
const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api', // URL tới backend Laravel
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Thêm token vào mỗi request nếu có
if (token) {
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

export default axiosInstance;