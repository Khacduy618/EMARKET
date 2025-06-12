import { CartItem } from './cartItem.interface';

export interface Cart {
    CartID: number | null; // Backend returns null if cart is empty
    UserID: number; // Backend uses UserID, not UserID_Buyer
    CreatedAt: string | null; // Backend returns null if cart is empty
    UpdatedAt: string | null; // Backend returns null if cart is empty
    cartItems: CartItem[]; // Include the related cart items
}
