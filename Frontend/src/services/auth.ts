// services/auth.service.ts

// 1. IMPORT CÁC TYPES CẦN THIẾT
import {
    LoginPayload,
    User,
    ApiError,
    RegisterPayload,
    ForgotPasswordPayload,
    ResetPasswordPayload,
    UpdatePasswordPayload,
    UpdateProfilePayload,
    LoginResponse, // << Thêm LoginResponse
    TwoFactorQrCodeResponse,
} from '@/types';


// --- 2. CÁC BIẾN MÔI TRƯỜNG VÀ HÀM HELPER CƠ BẢN ---

export const API_URL = 'http://localhost:8001/api';
const WEB_URL = 'http://localhost:8001';

// Tiện ích để đọc cookie
export function getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
}

// Tiện ích lấy và giải mã XSRF token
export function getDecodedXsrfToken(): string {
    const xsrfToken = getCookie('XSRF-TOKEN');
    if (!xsrfToken) {
        // Có thể ném lỗi hoặc trả về chuỗi rỗng và để API xử lý
        console.warn('CSRF token not found in cookies.');
        return '';
    }
    return decodeURIComponent(xsrfToken);
}

// Hàm xử lý response chung, ném lỗi nếu không ok
export async function handleResponse<T>(response: Response): Promise<T> {
    if (response.status === 204 || response.status === 201) {
        return {} as T;
    }
    if (!response.ok) {
        const errorData: ApiError = await response.json().catch(() => ({ message: response.statusText }));
        const error = new Error(errorData.message || `Request failed with status ${response.status}`);
        (error as any).response = { data: errorData };
        throw error;
    }
    return response.json();
}


// --- 3. CÁC HÀM API CHÍNH ---

export const getCsrfCookie = async (): Promise<void> => {
    await fetch(`${WEB_URL}/sanctum/csrf-cookie`, { credentials: 'include' });
};

// HÀM LOGIN ĐÃ ĐƯỢC SỬA LẠI ĐỂ XỬ LÝ 2FA
export const login = async (credentials: LoginPayload): Promise<LoginResponse> => {
    const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-XSRF-TOKEN': getDecodedXsrfToken(),
        },
        body: JSON.stringify(credentials),
    });

    // Nếu không ok (ví dụ 422 sai pass), ném lỗi
    if (!response.ok) {
        const errorData = await response.json();
        const error = new Error(errorData.message || 'Login failed');
        (error as any).response = { data: errorData };
        throw error;
    }

    // Nếu OK (200), thử parse JSON để lấy `two_factor: true`
    try {
        return await response.json();
    } catch (e) {
        // Nếu không có body (login thành công không cần 2FA), trả về object rỗng
        return {};
    }
};

export const getMe = async (): Promise<User> => {
    const response = await fetch(`${API_URL}/me`, {
        method: 'GET', credentials: 'include', headers: { 'Accept': 'application/json' },
    });
    return handleResponse<User>(response);
};

export const logout = async (): Promise<void> => {
    await fetch(`${API_URL}/logout`, {
        method: 'POST', credentials: 'include', headers: { 'X-XSRF-TOKEN': getDecodedXsrfToken() }
    });
};

export const register = async (payload: RegisterPayload): Promise<void> => {
    await fetch(`${API_URL}/register`, {
        method: 'POST', body: JSON.stringify(payload), credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-XSRF-TOKEN': getDecodedXsrfToken() },
    });
};

export const forgotPassword = async (payload: ForgotPasswordPayload): Promise<void> => {
    await fetch(`${API_URL}/forgot-password`, {
        method: 'POST', body: JSON.stringify(payload), credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-XSRF-TOKEN': getDecodedXsrfToken() },
    });
};

export const resetPassword = async (payload: ResetPasswordPayload): Promise<void> => {
    await fetch(`${API_URL}/reset-password`, {
        method: 'POST', body: JSON.stringify(payload), credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-XSRF-TOKEN': getDecodedXsrfToken() },
    });
};

export const updatePassword = async (payload: UpdatePasswordPayload): Promise<void> => {
    const response = await fetch(`${API_URL}/user/password`, {
        method: 'PUT', body: JSON.stringify(payload), credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-XSRF-TOKEN': getDecodedXsrfToken() },
    });
    await handleResponse(response);
};

export const updateProfile = async (payload: UpdateProfilePayload): Promise<User> => {
    const response = await fetch(`${API_URL}/user/profile-information`, {
        method: 'PUT', body: JSON.stringify(payload), credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-XSRF-TOKEN': getDecodedXsrfToken() },
    });
    return handleResponse<User>(response);
};


// --- CÁC HÀM 2FA ---

export const enableTwoFactorAuth = async (): Promise<void> => {
    const response = await fetch(`${API_URL}/user/two-factor-authentication`, {
        method: 'POST', credentials: 'include', headers: { 'X-XSRF-TOKEN': getDecodedXsrfToken() }
    });
    await handleResponse(response);
};

export const getTwoFactorQrCode = async (): Promise<TwoFactorQrCodeResponse> => {
    const response = await fetch(`${API_URL}/user/two-factor-qr-code`, {
        credentials: 'include', headers: { 'Accept': 'application/json' },
    });
    return handleResponse<TwoFactorQrCodeResponse>(response);
};

export const getRecoveryCodes = async (): Promise<string[]> => {
    const response = await fetch(`${API_URL}/user/two-factor-recovery-codes`, {
        credentials: 'include', headers: { 'Accept': 'application/json' },
    });
    return handleResponse<string[]>(response);
};

export const confirmTwoFactorAuth = async (code: string): Promise<void> => {
    const response = await fetch(`${API_URL}/user/confirmed-two-factor-authentication`, {
        method: 'POST', body: JSON.stringify({ code }), credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-XSRF-TOKEN': getDecodedXsrfToken() },
    });
    await handleResponse(response);
};

export const disableTwoFactorAuth = async (): Promise<void> => {
    await fetch(`${API_URL}/user/two-factor-authentication`, {
        method: 'DELETE', credentials: 'include', headers: { 'X-XSRF-TOKEN': getDecodedXsrfToken() }
    });
};

export const confirmPassword = async (password: string): Promise<void> => {
    const response = await fetch(`${API_URL}/user/confirm-password`, {
        method: 'POST', body: JSON.stringify({ password }), credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-XSRF-TOKEN': getDecodedXsrfToken() },
    });
    await handleResponse(response);
};

export const twoFactorChallenge = async (payload: { code?: string; recovery_code?: string }): Promise<void> => {
    const xsrfToken = getCookie('XSRF-TOKEN');
    const decodedXsrfToken = xsrfToken ? decodeURIComponent(xsrfToken) : undefined;

    const response = await fetch(`${API_URL}/two-factor-challenge`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-XSRF-TOKEN': decodedXsrfToken || '',
        },
        body: JSON.stringify(payload) // Gửi đi payload chứa code hoặc recovery_code
    });

    await handleResponse(response);
};

export const regenerateRecoveryCodes = async (): Promise<void> => {
    const xsrfToken = getCookie('XSRF-TOKEN');
    const decodedXsrfToken = xsrfToken ? decodeURIComponent(xsrfToken) : undefined;

    // Fortify dùng chính API này để tạo lại
    await fetch(`${API_URL}/user/two-factor-recovery-codes`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'X-XSRF-TOKEN': decodedXsrfToken || '',
            'Accept': 'application/json'
        },
    });
};

// API cho Seller Dashboard
export const getSellerDashboard = async (): Promise<any> => {
    const response = await fetch(`${API_URL}/seller/dashboard`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Accept': 'application/json' },
    });
    return handleResponse<any>(response);
};

// API cho Admin xem danh sách Users
export const getAdminUsers = async (): Promise<any[]> => {
    const response = await fetch(`${API_URL}/admin/users`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Accept': 'application/json' },
    });
    return handleResponse<any[]>(response);
};

export const resendVerificationEmail = async (email: string): Promise<void> => {

    // BƯỚC 1: LẤY COOKIE MỚI VÀ "LÀM SẠCH" SESSION.
    // Đây là bước quan trọng nhất để đảm bảo CSRF token luôn hợp lệ.
    await getCsrfCookie();

    // Sau khi đã có cookie mới, chúng ta mới lấy giá trị của nó.
    const xsrfToken = getCookie('XSRF-TOKEN');
    const decodedXsrfToken = xsrfToken ? decodeURIComponent(xsrfToken) : undefined;

    // BƯỚC 2: GỬI REQUEST VỚI TOKEN MỚI
    const response = await fetch(`${API_URL}/email/resend`, {
        method: 'POST',
        credentials: 'include', // Giữ lại để đảm bảo session được xử lý nhất quán
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-XSRF-TOKEN': decodedXsrfToken || '',
        },
        body: JSON.stringify({ email: email })
    });

    await handleResponse(response);
};

export const checkPhoneAvailability = async (phone: string): Promise<{ isAvailable: boolean }> => {
    await getCsrfCookie();

    const xsrfToken = getCookie('XSRF-TOKEN');
    const decodedXsrfToken = xsrfToken ? decodeURIComponent(xsrfToken) : undefined;

    // BƯỚC 2: GỬI REQUEST VỚI TOKEN HỢP LỆ
    const response = await fetch(`${API_URL}/check-phone-availability`, {
        method: 'POST',
        credentials: 'include', // Giữ lại để đảm bảo tính nhất quán
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            // Gửi header CSRF đã được làm mới
            'X-XSRF-TOKEN': decodedXsrfToken || '',
        },
        body: JSON.stringify({ Phone: phone }),
    });

    return handleResponse<{ isAvailable: boolean }>(response);
};

export const checkUsernameAvailability = async (username: string): Promise<{ isAvailable: boolean }> => {
    await getCsrfCookie();

    const xsrfToken = getCookie('XSRF-TOKEN');
    const decodedXsrfToken = xsrfToken ? decodeURIComponent(xsrfToken) : undefined;

    const response = await fetch(`${API_URL}/check-username-availability`, {
        method: 'POST',
        credentials: 'include', // Giữ lại để đảm bảo tính nhất quán
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            // Gửi header CSRF đã được làm mới
            'X-XSRF-TOKEN': decodedXsrfToken || '',
        },
        body: JSON.stringify({ Username: username })
    });
    return handleResponse(response);
}
export const checkEmailAvailability = async (email: string): Promise<{ isAvailable: boolean }> => {
    await getCsrfCookie();

    const xsrfToken = getCookie('XSRF-TOKEN');
    const decodedXsrfToken = xsrfToken ? decodeURIComponent(xsrfToken) : undefined;

    const response = await fetch(`${API_URL}/check-email-availability`, {
        method: 'POST',
        credentials: 'include', // Giữ lại để đảm bảo tính nhất quán
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            // Gửi header CSRF đã được làm mới
            'X-XSRF-TOKEN': decodedXsrfToken || '',
        },
        body: JSON.stringify({ Email: email })
    });
    return handleResponse(response);
}
