// src/services/voucher.ts

import { Voucher } from '@/types'; // Import Voucher interface
import { handleResponse, getAuthToken } from './api'; // handleResponse from your existing api service
import { API_URL } from '@/lib/config';

interface FetchVouchersResponse {
    platformVouchers: Voucher[];
    shopVouchers: Voucher[];
    message?: string;
}

export const fetchAvailableVouchers = async (): Promise<FetchVouchersResponse> => {

    const response = await fetch(`${API_URL}/platform-eligible`, {
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', // Ensure cookies are sent if needed
    });
    return handleResponse(response);
};

export interface FetchShopVouchersResponse {
    vouchers: Voucher[]; // Voucher bây giờ đã có sẵn 'TimesUsed' và 'times_used_by_user'
    message: string;
}

/**
 * Fetches all collected vouchers for a specific shop for the current user.
 * @param shopId The ID of the shop to fetch vouchers for.
 * @returns A promise that resolves with the user's collected vouchers for that shop.
 */
export const fetchUserShopVouchers = async (shopId: number): Promise<FetchShopVouchersResponse> => {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/shops/${shopId}/eligible-vouchers`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
    });
    return handleResponse(response);
};