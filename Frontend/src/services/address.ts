// services/address.service.ts

// Import các types và các hàm helper đã có
import { Address, AddressPayload, ApiError } from '@/types';
import { getCookie, handleResponse, API_URL, getDecodedXsrfToken } from './auth'; // Giả sử các hàm này đã được export từ auth.service

// 1. LẤY DANH SÁCH ĐỊA CHỈ
export const getAddresses = async (url: string): Promise<Address[]> => {
    // url được truyền vào bởi SWR, nó chính là '/api/addresses'
    const response = await fetch(`${API_URL}/addresses`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Accept': 'application/json' },
    });
    return handleResponse<Address[]>(response);
};

// 2. THÊM ĐỊA CHỈ MỚI
export const addAddress = async (payload: Partial<AddressPayload>): Promise<Address> => {
    const response = await fetch(`${API_URL}/addresses`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-XSRF-TOKEN': getDecodedXsrfToken(),
        },
        body: JSON.stringify(payload),
    });
    return handleResponse<Address>(response);
};

// 3. CẬP NHẬT ĐỊA CHỈ
export const updateAddress = async (addressId: number, payload: Partial<AddressPayload>): Promise<Address> => {
    const response = await fetch(`${API_URL}/addresses/${addressId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-XSRF-TOKEN': getDecodedXsrfToken(),
        },
        body: JSON.stringify(payload),
    });
    return handleResponse<Address>(response);
};

// 4. XÓA ĐỊA CHỈ
export const deleteAddress = async (addressId: number): Promise<void> => {
    const response = await fetch(`${API_URL}/addresses/${addressId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
            'Accept': 'application/json',
            'X-XSRF-TOKEN': getDecodedXsrfToken(),
        },
    });
    // Trả về void vì API trả về 204 No Content
    await handleResponse<void>(response);
};

// 5. ĐẶT LÀM MẶC ĐỊNH
export const setDefaultAddress = async (addressId: number): Promise<void> => {
    const response = await fetch(`${API_URL}/addresses/${addressId}/set-default`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Accept': 'application/json',
            'X-XSRF-TOKEN': getDecodedXsrfToken(),
        },
    });
    // Trả về void vì API trả về message thành công
    await handleResponse<void>(response);
};
