// services/admin.service.ts

// 1. Import các types và các hàm helper đã có từ các file khác
import { User, UserPayload, PaginatedResponse, ApiError } from '@/types';

// Giả định các hàm/biến này đã được export từ `auth.service.ts`.
// Nếu chưa, bạn cần thêm `export` trước chúng trong file đó.
import {
    handleResponse,

    getDecodedXsrfToken
} from './auth';
import { API_URL } from '@/lib/config';

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

export const adminDisableTwoFactor = async (userId: number): Promise<void> => {
    await fetch(`${API_URL}/admin/users/${userId}/two-factor-authentication`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
            'Accept': 'application/json',
            'X-XSRF-TOKEN': getDecodedXsrfToken(),
        },
    });
};

/**
 * Gửi yêu cầu để cập nhật trạng thái (active/inactive) cho một danh sách user.
 * @param userIds - Mảng chứa các UserID cần cập nhật.
 * @param isActive - Trạng thái mới (true: kích hoạt, false: vô hiệu hóa).
 */
export const bulkUpdateUserStatus = async (userIds: number[], isActive: boolean): Promise<any> => {
    const response = await fetch(`${API_URL}/admin/users/bulk-update-status`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-XSRF-TOKEN': getDecodedXsrfToken(),
        },
        // Backend mong đợi một object chứa `userIds` (một mảng) và `status` (boolean)
        body: JSON.stringify({
            userIds: userIds,
            status: isActive
        }),
    });

    // API này thường chỉ trả về một message, nên chúng ta dùng handleResponse chung
    return handleResponse<any>(response);
};


/**
 * Gửi yêu cầu để "xóa thông minh" một danh sách user.
 * Backend sẽ tự quyết định xóa vĩnh viễn hay chỉ vô hiệu hóa.
 * @param userIds - Mảng chứa các UserID cần xử lý.
 */
export const bulkDeleteUsers = async (userIds: number[]): Promise<any> => {
    const response = await fetch(`${API_URL}/admin/users/bulk-delete`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-XSRF-TOKEN': getDecodedXsrfToken(),
        },
        // Backend chỉ cần một mảng `userIds`
        body: JSON.stringify({
            userIds: userIds
        }),
    });

    // API này cũng trả về một message, handleResponse sẽ xử lý
    return handleResponse<any>(response);
};

// API MỚI ĐỂ ADMIN TẮT 2FA HÀNG LOẠT
export const bulkDisable2FA = async (userIds: number[]): Promise<any> => {
    return fetch(`${API_URL}/admin/users/bulk-disable-2fa`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-XSRF-TOKEN': getDecodedXsrfToken(),
        },
        body: JSON.stringify({ userIds }),
    }).then(handleResponse);
};
