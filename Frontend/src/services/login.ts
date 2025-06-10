import { Cart } from '../types';

const API_BASE_URL = 'http://localhost/api'; // Assuming your backend is accessible via Nginx on localhost:80

// Helper function to get the auth token (replace with your actual auth logic)
const getAuthToken = (): string | null => {
    // Get token from localStorage
    return localStorage.getItem('authToken');
};

const handleResponse = async (response: Response) => {
    if (!response.ok) {
        let errorDetails = 'Something went wrong';
        const contentType = response.headers.get('content-type');

        if (contentType && contentType.includes('application/json')) {
            try {
                const error = await response.json();
                errorDetails = error.message || JSON.stringify(error);
            } catch (jsonError) {
                console.error('Failed to parse error response as JSON:', jsonError);
                errorDetails = `Failed to parse error response as JSON. Status: ${response.status}`;
            }
        } else {
            try {
                errorDetails = await response.text();
            } catch (textError) {
                console.error('Failed to read error response as text:', textError);
                errorDetails = `Failed to read error response. Status: ${response.status}`;
            }
        }
        throw new Error(`API Error: ${response.status} - ${errorDetails}`);
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

export const fetchProductVariantsWithAttributes = async (productId: number): Promise<{ groupedAttributes: { [key: string]: any[] } }> => {
    try {
        const response = await fetch(`${API_BASE_URL}/products/${productId}/variants-with-attributes`, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch product variants');
        }

        const data = await response.json();
        return data;

    } catch (error: any) {
        console.error("Error fetching product variants with attributes:", error);
        throw error; // Re-throw the error to be handled by the calling function
    }
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

export const updateCartItem = async (cartItemId: number, productVariantId: number): Promise<Cart> => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/cart/items/${cartItemId}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ product_variant_id: productVariantId }),
    });
    return handleResponse(response);
};

export const api = {
    post: async (endpoint: string, data: any) => {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json', // Add Accept header
            },
            body: JSON.stringify(data),
        });
        return handleResponse(response);
    },
    // Add other HTTP methods (get, put, delete, etc.) as needed
};