import { Cart } from '../types';
import {handleResponse} from '../services/api';
const API_BASE_URL = 'http://localhost/api'; // Assuming your backend is accessible via Nginx on localhost:80

// Helper function to get the auth token (replace with your actual auth logic)
const getAuthToken = (): string | null => {
    // Get token from localStorage
    return localStorage.getItem('authToken');
};



export const fetchCart = async (): Promise<Cart> => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/cart`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });
    return handleResponse(response);
};

export async function updateCartItemQuantity(cartItemId: number, quantity: number): Promise<Cart> {
    const token = localStorage.getItem('authToken');
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


export const addCartItem = async (variantId: number, quantity: number, shopId: number): Promise<Cart> => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/cart/items`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        // Truyền variant_id thay vì product_id
        body: JSON.stringify({ variant_id: variantId, quantity, shop_id: shopId }),
    });
    return handleResponse(response);
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


