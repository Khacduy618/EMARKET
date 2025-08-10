import { ProductVariant, ProductImage } from "@/types";
import { getCookie } from "./auth";

export const API_BASE_URL = 'http://localhost:8001/api';
export const BASE_URL = 'http://localhost:8001';
interface ProductWithImages {
    images?: ProductImage[] | null;
}

export const getAuthToken = (): string | null => {

    const xsrfToken = getCookie('XSRF-TOKEN');

    if (!xsrfToken) {
        // Có thể ném lỗi hoặc trả về chuỗi rỗng và để API xử lý
        console.warn('CSRF token not found in cookies.');
        return '';
    }
    return decodeURIComponent(xsrfToken);
};
// export const handleResponse = async (response: Response) => {
//     if (!response.ok) {
//         let errorData: any = { message: 'An unknown error occurred.' };
//         try {
//             // Try to parse JSON from error response
//             errorData = await response.json();
//         } catch (e) {
//             // If parsing fails, use a generic message
//             console.error('Failed to parse error response JSON:', e);
//             errorData = { message: 'An unknown error occurred on the server.' };
//         }

//         const error = new Error(errorData.message || 'Something went wrong.');
//         // Attach the full response details to the error object
//         // This is what allows your component to access err.response.data
//         (error as any).response = {
//             status: response.status,
//             data: errorData,
//         };
//         throw error;
//     }
//     return response.json();
// };
export const handleResponse = async (response: Response) => {
    if (!response.ok) {
        let errorData = { message: 'An unknown error occurred.' };
        try {
            errorData = await response.json();
        } catch (e) {
            // Body lỗi không phải là JSON
        }
        const error = new Error(errorData.message || `HTTP error! status: ${response.status}`);
        (error as any).response = { status: response.status, data: errorData };
        throw error;
    }

    // --- LOGIC MỚI ĐỂ XỬ LÝ BODY RỖNG ---
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
        // Nếu có header JSON, hãy thử parse nó
        return response.json();
    } else {
        // Nếu không có body JSON (ví dụ: status 204 No Content, hoặc chỉ là text)
        // trả về một giá trị thành công mà không cần parse.
        // Bạn có thể trả về `true` hoặc một đối tượng cho biết thành công.
        return { success: true, message: "Operation successful" };
    }
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
/**
 * HÀM MỚI ĐA DỤNG: Chuyển đổi một đường dẫn ảnh tương đối từ API thành một URL hoàn chỉnh.
 * Xử lý các trường hợp: URL tuyệt đối, URL tương đối, và URL null/undefined.
 * @param relativePath - Đường dẫn ảnh từ API (ví dụ: 'product_images/abc.png')
 * @returns - Đường dẫn ảnh hợp lệ cho thẻ <Image> (ví dụ: '/storage/product_images/abc.png')
 */
export const getFullImageUrl = (relativePath: string | null | undefined): string => {
    if (!relativePath) {
        return '/placeholder.png'; // Trả về ảnh mặc định
    }

    // Nếu đã là URL đầy đủ, trả về luôn
    if (relativePath.startsWith('http')) {
        return relativePath;
    }

    // Xây dựng đường dẫn đúng mà server có thể hiểu
    const path = relativePath.startsWith('/') ? relativePath.substring(1) : relativePath;
    return `${BASE_URL}/storage/${path}`;
};

// export const getPrimaryImage = (product: ProductWithImages): string => {
//     const primaryImg = product.images?.find((img) => img.IsPrimary);
//     const imagePath = primaryImg?.ImageURL || product.images?.[0]?.ImageURL;

//     if (imagePath) {
//       return `/storage/${imagePath.startsWith('/') ? imagePath.substring(1) : imagePath}`;
//     }
//     return "/placeholder.svg";
// }
export const getPrimaryImage = (product: ProductWithImages): string => {
    const primaryImg = product.images?.find((img) => img.IsPrimary);
    const imagePath = primaryImg?.ImageURL || product.images?.[0]?.ImageURL;
    return getFullImageUrl(imagePath); // Gọi hàm mới
}

export const getVariantImage = (variant: ProductVariant, product: ProductWithImages): string => {
    const imagePath = variant.ImageURL;
    if (!imagePath) {
        return getPrimaryImage(product);
    }
    return getFullImageUrl(imagePath); // Gọi hàm mới
}