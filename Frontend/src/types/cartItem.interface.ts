import { ProductVariantSummary } from './product.interface';
import { ShopSummary } from './shop.interface';

export interface CartItem {
    CartItemID: number;
    CartID: number;
    VariantID: number;
    ShopID: number;
    Quantity: number;
    AddedAt: string;
    UpdatedAt: string;
    productVariant: ProductVariantSummary;
    shop: ShopSummary;
    ShopName?: string;
}
