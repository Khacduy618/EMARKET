// services/auth.service.ts

import { LoginPayload, User, ApiError, RegisterPayload, ForgotPasswordPayload, ResetPasswordPayload } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
const WEB_URL = process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:8000';

// Tiện ích để đọc cookie từ trình duyệt bằng JS
function getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        return parts.pop()?.split(';').shift() || null;
    }
    return null;
}

// Hàm này dùng để xử lý response từ fetch, ném lỗi nếu không ok
async function handleResponse<T>(response: Response): Promise<T> {
    if (response.status === 204) {
        // Trường hợp 204 No Content, không có body để parse, trả về một đối tượng rỗng
        return {} as T;
    }

    const data = await response.json();
    if (!response.ok) {
        // Nếu response không thành công, ném lỗi với dữ liệu từ body
        const error: ApiError = {
            message: data.message || `Request failed with status ${response.status}`,
            errors: data.errors,
        };
        // Tạo một đối tượng lỗi có cấu trúc giống lỗi của Axios để context xử lý
        const fetchError = new Error(error.message);
        (fetchError as any).response = { data: error };
        throw fetchError;
    }
    return data;
}


export const getCsrfCookie = async (): Promise<void> => {
    await fetch(`${WEB_URL}/sanctum/csrf-cookie`, {
        credentials: 'include', // Tương đương với withCredentials: true
    });
};

export const login = async (credentials: LoginPayload): Promise<void> => {
    // Với fetch, chúng ta phải đọc cookie XSRF-TOKEN và đặt header thủ công
    const xsrfToken = getCookie('XSRF-TOKEN');
    if (!xsrfToken) {
        throw new Error("CSRF token not found. Please refresh the page.");
    }

    // URL decode token trước khi gửi, giống như `cURL`
    const decodedXsrfToken = decodeURIComponent(xsrfToken);

    const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            // Đặt header X-XSRF-TOKEN thủ công
            'X-XSRF-TOKEN': decodedXsrfToken,
        },
        body: JSON.stringify(credentials),
    });

    await handleResponse(response);
};

export const getMe = async (): Promise<User> => {
    const response = await fetch(`${API_URL}/me`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Accept': 'application/json',
        },
    });

    return handleResponse<User>(response);
};

export const logout = async (): Promise<void> => {
    const xsrfToken = getCookie('XSRF-TOKEN');
    const decodedXsrfToken = xsrfToken ? decodeURIComponent(xsrfToken) : undefined;

    const response = await fetch(`${API_URL}/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-XSRF-TOKEN': decodedXsrfToken || '',
        },
    });

    await handleResponse(response);
};

export const register = async (payload: RegisterPayload): Promise<void> => {
    const xsrfToken = getCookie('XSRF-TOKEN');
    if (!xsrfToken) {
        throw new Error("Không tìm thấy CSRF token. Vui lòng tải lại trang.");
    }

    const decodedXsrfToken = decodeURIComponent(xsrfToken);

    const response = await fetch(`${API_URL}/register`, { // Endpoint là /register
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-XSRF-TOKEN': decodedXsrfToken,
        },
        body: JSON.stringify(payload), // Gửi đi payload đăng ký
    });

    // Dùng lại handleResponse để xử lý kết quả
    await handleResponse(response);
};

// Hàm yêu cầu gửi link reset mật khẩu
export const forgotPassword = async (payload: ForgotPasswordPayload): Promise<void> => {
    // Vì đây là request POST, chúng ta vẫn cần CSRF token để bảo vệ
    const xsrfToken = getCookie('XSRF-TOKEN');
    if (!xsrfToken) {
        throw new Error("Không tìm thấy CSRF token. Vui lòng tải lại trang.");
    }

    const decodedXsrfToken = decodeURIComponent(xsrfToken);

    const response = await fetch(`${API_URL}/forgot-password`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-XSRF-TOKEN': decodedXsrfToken,
        },
        body: JSON.stringify(payload),
    });

    await handleResponse(response);
};

export const resetPassword = async (payload: ResetPasswordPayload): Promise<void> => {
    // Request POST này không yêu cầu user phải login, nhưng vẫn cần CSRF
    const xsrfToken = getCookie('XSRF-TOKEN');
    if (!xsrfToken) {
        throw new Error("Không tìm thấy CSRF token. Vui lòng tải lại trang.");
    }
    const decodedXsrfToken = decodeURIComponent(xsrfToken);

    const response = await fetch(`${API_URL}/reset-password`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-XSRF-TOKEN': decodedXsrfToken,
        },
        body: JSON.stringify(payload),
    });

    await handleResponse(response);
};
