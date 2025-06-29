// src/services/product.ts
import { Product } from '@/types'; // Đảm bảo import type Product nếu chưa có
import {API_BASE_URL} from '@/services/api';

export async function fetchProductById(id: number): Promise<Product | null> {
    try {
        if (isNaN(id)) {
            // Ném lỗi rõ ràng nếu ID không phải là số
            throw new Error("Invalid Product ID provided to fetchProductById: ID is NaN.");
        }

        const url = `${API_BASE_URL}/products/${id}`; // Đảm bảo endpoint là /products/:id
        console.log("Attempting to fetch product from URL:", url);

        const response = await fetch(url, {
            cache: 'no-store' // Rất quan trọng cho server components để đảm bảo fetch mới mỗi lần
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`HTTP error fetching product ID ${id}: Status ${response.status}, Body: ${errorBody}`);
            if (response.status === 404) {
                return null; // Trả về null để `page.tsx` có thể gọi `notFound()`
            }
            throw new Error(`Failed to fetch product (status: ${response.status}): ${errorBody}`);
        }

        const data: Product = await response.json();
        return data;

    } catch (error: any) {
        console.error("Error in fetchProductById service:", error.message || error);
        throw error;
    }
}