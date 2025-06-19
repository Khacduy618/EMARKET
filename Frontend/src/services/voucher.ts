// src/services/voucher.ts

import { Voucher } from '@/types'; // Import Voucher interface
import { handleResponse } from './api'; // handleResponse from your existing api service

const API_BASE_URL = 'http://localhost/api';

const getAuthToken = (): string | null => {
    return localStorage.getItem('authToken');
};

interface FetchVouchersResponse {
    platformVouchers: Voucher[];
    shopVouchers: Voucher[];
    message?: string;
}

export const fetchAvailableVouchers = async (): Promise<FetchVouchersResponse> => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/vouchers`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });
    return handleResponse(response);
};