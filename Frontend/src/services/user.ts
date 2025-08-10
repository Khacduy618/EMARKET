import { handleResponse } from './api';
import { Address, AddressPayload } from '../types'; // Import Address interface

const API_BASE_URL = 'http://localhost:8001/api';

const getAuthToken = (): string | null => {
    return getAuthToken()
};

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

export const fetchAddressDetails = async (addressId: number): Promise<Address> => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/addresses/${addressId}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
    });
    return handleResponse(response);
};

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
export const updateAddress = async (addressId: number, data: AddressPayload): Promise<UpdateAddressResponse> => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/addresses/${addressId}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify(data),
    });
    return handleResponse(response);
};

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
export const createAddress = async (data: AddressPayload): Promise<{ message: string; address: Address }> => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/addresses`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify(data),
    });
    return handleResponse(response);
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