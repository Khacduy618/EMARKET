import { Cart } from '../types';

const API_BASE_URL = 'http://localhost:8001/api'; // Assuming your backend runs on localhost:8000

// Helper function to get the auth token (replace with your actual auth logic)
const getAuthToken = (): string | null => {
    // Example: Get token from localStorage
    // return localStorage.getItem('authToken');
    // For now, returning a placeholder. You need to implement actual token retrieval.
    console.warn("Authentication token retrieval not implemented. Using placeholder.");
    return 'YOUR_AUTH_TOKEN'; // Replace with actual token retrieval
};

const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Something went wrong');
    }
    return response.json();
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

export const updateCartItemQuantity = async (cartItemId: number, quantity: number): Promise<Cart> => {
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
};

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

// You might also need an addItem function
/*
export const addCartItem = async (productId: number, quantity: number, shopId: number): Promise<Cart> => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/cart/items`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ product_id: productId, quantity, shop_id: shopId }),
    });
    return handleResponse(response);
};
*/
