// import { CartItem } from './cartItem.interface';

// export interface Cart {
//     CartID: number | null; // Backend returns null if cart is empty
//     UserID: number; // Backend uses UserID, not UserID_Buyer
//     CreatedAt: string | null; // Backend returns null if cart is empty
//     UpdatedAt: string | null; // Backend returns null if cart is empty
//     cartItems: CartItem[]; // Include the related cart items
// }

// src/types/cart.interface.ts
import { CartItem } from './cartItem.interface';

export interface Cart {
    CartID: number | null;
    UserID: number;
    CreatedAt: string | null;
    UpdatedAt: string | null;
    cartItems: CartItem[];
    message?: string;
}

export interface AddCartItemResponse {
    cart: Cart; // Toàn bộ dữ liệu giỏ hàng đã cập nhật
    message: string;
    shouldShowLargeQuantityPrompt?: boolean; // Cờ để frontend biết có nên hiển thị modal
    productName?: string; // Tên sản phẩm để hiển thị trên modal
    shopPhone?: string; // Số điện thoại cửa hàng
    finalQuantityInCart?: number; // Tổng số lượng của variant đó trong giỏ hàng sau khi thêm
    availableStock?: number; // Tồn kho thực tế của variant
}