const API_BASE_URL = 'http://localhost/api';

export const handleResponse = async (response: Response) => {
    if (!response.ok) {
        let errorDetails = 'Something went wrong';
        const contentType = response.headers.get('content-type');

        if (contentType && contentType.includes('application/json')) {
            try {
                const error = await response.json();
                errorDetails = error.message || JSON.stringify(error) || error.available_stock;
                
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

export const getProductAttributes = async (productId: number) => {
    try {
        const data = await api.get(`/product-attributes/${productId}`);
        return data;
    } catch (error) {
        console.error('Error fetching product attributes:', error);
        throw error; // Re-throw the error to be handled by the calling component
    }
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
    get: async (endpoint: string) => { // Add get method
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        });
        return handleResponse(response);
    },
};
