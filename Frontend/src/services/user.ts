import { getAuthToken, handleResponse } from './api';
import { Address, AddressPayload } from '../types'; // Import Address interface
import { API_URL } from './auth';
import axios from 'axios';

const API_BASE_URL = 'http://localhost/api';


export interface FetchAddressesResponse {
    addresses: Address[];
    default_address: Address | null;
}

export interface UpdateAddressResponse {
    message: string;
    address: Address;
}
/**
 * Fetches all addresses for the authenticated user.
 * @returns A promise that resolves with the user's addresses.
 */
export const fetchUserAddresses = async (): Promise<FetchAddressesResponse> => {
    const response = await fetch(`${API_BASE_URL}/addresses`, {
        headers: {
            
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
    });
    return handleResponse(response);
};

// export const fetchAddressDetails = async (addressId: number): Promise<Address> => {
//     const token = getAuthToken();
//     const response = await fetch(`${API_BASE_URL}/addresses/${addressId}`, { 
//         headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json',
//             'Accept': 'application/json',
//         },
//      });
//     return handleResponse(response);
// };

// export const updateAddress = async (addressId: number, data: Partial<Address>): Promise<UpdateAddressResponse> => {
//     const token = getAuthToken();
//     const response = await fetch(`${API_BASE_URL}/addresses/${addressId}`, {
//         method: 'PUT',
//         headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json',
//             'Accept': 'application/json',
//         },
//         body: JSON.stringify(data),
//     });
    
//     // handleResponse giờ sẽ xử lý đúng
//     // và API của bạn đang trả về một JSON object, nên logic này vẫn hoạt động
//     return handleResponse(response); 
// };
// export const updateAddress = async (addressId: number, data: AddressPayload): Promise<UpdateAddressResponse> => {
//     const token = getAuthToken();
//     const response = await fetch(`${API_BASE_URL}/addresses/${addressId}`, {
//         method: 'PUT',
//         headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json',
//             'Accept': 'application/json',
//         },
//         body: JSON.stringify(data),
//     });
//     return handleResponse(response); 
// };

// export const createAddress = async (data: Omit<Address, 'AddressID'>): Promise<{ message: string; address: Address }> => {
//     const token = getAuthToken();
//     const response = await fetch(`${API_BASE_URL}/addresses`, {
//         method: 'POST',
//         headers: { 'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json',
//             'Accept': 'application/json',
//         },
//         body: JSON.stringify(data),
//     });
//     return handleResponse(response);
// };

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    },
});

// Thêm một "interceptor" để tự động gắn token vào mỗi request
apiClient.interceptors.request.use(
    (config) => {
        const token = getAuthToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);


export const createAddress = async (payload: AddressPayload) => {
    // KHÔNG CẦN gọi getAuthToken() ở đây nữa
    const response = await apiClient.post('/addresses', payload);
    return response.data;
};



export const deleteAddress = async (addressId: number): Promise<{ message: string }> => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/addresses/${addressId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
    });
    return handleResponse(response);
};
export const updateAddress = async (addressId: number, payload: AddressPayload) => {
    const response = await apiClient.put(`/addresses/${addressId}`, payload);
    return response.data;
};

export const fetchAddressDetails = async (addressId: number) => {
    const response = await apiClient.get(`/addresses/${addressId}`);
    return response.data;
};

export const setDefaultAddress = async (addressId: number): Promise<{ message: string; address: Address }> => {
    const token = getAuthToken();
    // API endpoint này thường là một hành động PUT hoặc POST riêng biệt
    // Ví dụ: /addresses/{id}/set-default
    const response = await fetch(`${API_BASE_URL}/addresses/${addressId}/set-default`, {
        method: 'PUT', // Hoặc 'POST' tùy theo thiết kế API của bạn
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
    });
    return handleResponse(response);
};