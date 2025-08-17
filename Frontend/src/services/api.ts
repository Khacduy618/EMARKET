import { ProductVariant, ProductImage } from "@/types";
import { getCookie } from "./auth";

export const API_BASE_URL = 'http://localhost/api';
export const BASE_URL = 'http://localhost';
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
            credentials: 'include', // Include cookies for CSRF protection
        });
        return handleResponse(response);
    },
};

/**
 * HÀM 1: Lấy URL đầy đủ cho các ảnh do người dùng UPLOAD (trong thư mục storage).
 * Ví dụ: ảnh đại diện, ảnh sản phẩm.
 * @param storagePath - Đường dẫn tương đối trong thư mục storage (ví dụ: 'avatars/user1.png')
 * @returns URL đầy đủ (ví dụ: 'http://localhost/storage/avatars/user1.png')
 */
export const getStorageImageUrl = (storagePath: string | null | undefined): string => {
    if (!storagePath) {
        return '/placeholder.png'; // Trả về ảnh placeholder của Next.js
    }

    if (storagePath.startsWith('http')) {
        return storagePath;
    }

    const path = storagePath.startsWith('/') ? storagePath.substring(1) : storagePath;
    return `${BASE_URL}/storage/${path}`;
};
/**
 * HÀM 2 (MỚI): Lấy URL đầy đủ cho các ảnh TĨNH (trong thư mục public).
 * Ví dụ: ảnh banner, ảnh category mặc định.
 * @param publicPath - Đường dẫn tương đối trong thư mục public (ví dụ: 'images/categories/category_amthanh.png')
 * @returns URL đầy đủ (ví dụ: 'http://localhost/images/categories/category_amthanh.png')
 */
export const getPublicImageUrl = (publicPath: string | null | undefined): string => {
    if (!publicPath) {
        return '/placeholder.png';
    }

    if (publicPath.startsWith('http')) {
        return publicPath;
    }

    // File trong public được truy cập trực tiếp từ URL gốc
    const path = publicPath.startsWith('/') ? publicPath.substring(1) : publicPath;
    return `${BASE_URL}:8001/${path}`;
};


/**
 * HÀM ĐA DỤNG (CŨ): Giờ được đổi tên thành getStorageImageUrl để rõ ràng hơn.
 * Tôi vẫn giữ lại hàm cũ getFullImageUrl để tương thích ngược, nó sẽ gọi đến hàm mới.
 */
export const getFullImageUrl = getStorageImageUrl;

export const getPrimaryImage = (product: ProductWithImages): string => {
    const primaryImg = product.images?.find((img) => img.IsPrimary);
    const imagePath = primaryImg?.ImageURL || product.images?.[0]?.ImageURL;
    // Ảnh sản phẩm do người dùng tải lên, nên dùng getStorageImageUrl
    return getStorageImageUrl(imagePath);
}

export const getVariantImage = (variant: ProductVariant, product: ProductWithImages): string => {
    const imagePath = variant.ImageURL;
    if (!imagePath) {
        return getPrimaryImage(product);
    }
    // Ảnh variant cũng do người dùng tải lên
    return getStorageImageUrl(imagePath);
}