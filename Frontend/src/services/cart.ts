import { Cart, AddCartItemResponse } from '../types';
import {handleResponse,getAuthToken, API_BASE_URL } from '../services/api';

// Helper function to get the auth token (replace with your actual auth logic)




export const fetchCart = async (): Promise<Cart> => {
    
    const response = await fetch(`${API_BASE_URL}/cart`, {
         method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json',
            'Accept': 'application/json',
         },
    });
    console.log(response)
    return handleResponse(response);
};

export async function updateCartItemQuantity(cartItemId: number, quantity: number): Promise<Cart> {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/cart/items/${cartItemId}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity }),
    });
    return handleResponse(response);
}

export const removeCartItem = async (cartItemId: number): Promise<Cart> => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/cart/items/${cartItemId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });
    return handleResponse(response);
};

export const updateCartItemVariant = async (cartItemId: number, newVariantId: number): Promise<Cart> => {
    const token = getAuthToken();
    if (!token) {
        // Xử lý trường hợp không có token nếu cần
        return Promise.reject(new Error('Authentication token not found.'));
    }

    const response = await fetch(`${API_BASE_URL}/cart/items/${cartItemId}/variant`, {
        
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({ new_variant_id: newVariantId }),
    });

    // handleResponse sẽ ném lỗi nếu response.ok là false
    return handleResponse(response);
};

export const addCartItem = async (variantId: number, quantity: number, shopId: number): Promise<AddCartItemResponse> => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/cart/items`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ variant_id: variantId, quantity, shop_id: shopId }),
    });
    // handleResponse sẽ tự động parse JSON và ném lỗi nếu status không OK
    return handleResponse(response); // Trả về AddCartItemResponse
};


export const fetchProductAttributes = async (productId: number) => {
    try {
        const response = await fetch(`${API_BASE_URL}/products/${productId}/attributes`);
        if (!response.ok) {
            throw new Error(`Failed to fetch attributes: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching product attributes:", error);
        throw error;
    }
};

/**
 * Removes multiple items from the user's cart.
 * @param cartItemIds An array of CartItemIDs to remove.
 * @returns A promise that resolves with the updated cart data.
 */
export const removeMultipleCartItems = async (cartItemIds: number[]): Promise<Cart> => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/cart/items`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        // Gửi mảng các ID trong body của request
        body: JSON.stringify({ cart_item_ids: cartItemIds }),
    });
    return handleResponse(response);
};


