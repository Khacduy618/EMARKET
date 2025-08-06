// services/admin.service.ts

// 1. Import các types và các hàm helper đã có từ các file khác
import { User, UserPayload, PaginatedResponse, ApiError } from '@/types';

// Giả định các hàm/biến này đã được export từ `auth.service.ts`.
// Nếu chưa, bạn cần thêm `export` trước chúng trong file đó.
import {
    handleResponse,
    API_URL,
    getDecodedXsrfToken
} from './auth';

// 2. API để lấy danh sách người dùng (có phân trang và filter)
// url sẽ là một chuỗi như `/admin/users?page=1&search=...`
export const getUsers = async (url: string): Promise<PaginatedResponse<User>> => {
    const response = await fetch(`${API_URL}${url}`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Accept': 'application/json' },
    });
    return handleResponse<PaginatedResponse<User>>(response);
};

// 3. API để cập nhật trạng thái (kích hoạt/vô hiệu)
export const updateUserStatus = async (userId: number, isActive: boolean): Promise<User> => {
    const response = await fetch(`${API_URL}/admin/users/${userId}/status`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-XSRF-TOKEN': getDecodedXsrfToken(),
        },
        body: JSON.stringify({ is_active: isActive }),
    });
    return handleResponse<User>(response);
};

// 4. API để tạo người dùng mới
export const createUser = async (payload: UserPayload): Promise<User> => {
    const response = await fetch(`${API_URL}/admin/users`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-XSRF-TOKEN': getDecodedXsrfToken(),
        },
        body: JSON.stringify(payload),
    });
    return handleResponse<User>(response);
};

// 5. API để cập nhật thông tin người dùng
export const updateUser = async (userId: number, payload: Partial<UserPayload>): Promise<User> => {
    const response = await fetch(`${API_URL}/admin/users/${userId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-XSRF-TOKEN': getDecodedXsrfToken(),
        },
        body: JSON.stringify(payload),
    });
    return handleResponse<User>(response);
};

// 6. API để xóa người dùng
export const deleteUser = async (userId: number): Promise<void> => {
    const response = await fetch(`${API_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
            'Accept': 'application/json',
            'X-XSRF-TOKEN': getDecodedXsrfToken(),
        },
    });
    // Hàm này trả về Promise<void> vì API DELETE trả về 204 No Content
    await handleResponse<void>(response);
};
