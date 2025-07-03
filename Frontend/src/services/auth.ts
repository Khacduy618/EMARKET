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

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
const WEB_URL = process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:8000';

// Tiện ích để đọc cookie
function getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
}

// Tiện ích lấy và giải mã XSRF token
function getDecodedXsrfToken(): string {
    const xsrfToken = getCookie('XSRF-TOKEN');
    if (!xsrfToken) {
        // Có thể ném lỗi hoặc trả về chuỗi rỗng và để API xử lý
        console.warn('CSRF token not found in cookies.');
        return '';
    }
    return decodeURIComponent(xsrfToken);
}

// Hàm xử lý response chung, ném lỗi nếu không ok
async function handleResponse<T>(response: Response): Promise<T> {
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

export const twoFactorChallenge = async (code: string): Promise<void> => {
    const response = await fetch(`${API_URL}/two-factor-challenge`, {
        method: 'POST', body: JSON.stringify({ code }), credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-XSRF-TOKEN': getDecodedXsrfToken() },
    });
    await handleResponse(response);
};
