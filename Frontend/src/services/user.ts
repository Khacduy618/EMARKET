import { handleResponse } from './api';
import { Address } from '../types'; // Import Address interface

const API_BASE_URL = 'http://localhost/api';

const getAuthToken = (): string | null => {
    return localStorage.getItem('authToken');
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

export const updateAddress = async (addressId: number, data: Partial<Address>): Promise<UpdateAddressResponse> => {
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
    
    // handleResponse giờ sẽ xử lý đúng
    // và API của bạn đang trả về một JSON object, nên logic này vẫn hoạt động
    return handleResponse(response); 
};

export const createAddress = async (data: Omit<Address, 'AddressID'>): Promise<{ message: string; address: Address }> => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/addresses`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify(data),
    });
    return handleResponse(response);
};