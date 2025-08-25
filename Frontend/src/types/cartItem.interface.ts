import { ProductVariantSummary } from './product.interface';
import { Shop, ShopSummary } from './shop.interface';

export interface CartItem {
    CartItemID: number;
    CartID: number;
    VariantID: number;
    ShopID: number;
    Quantity: number;
    AddedAt: string;
    UpdatedAt: string;
    product_variant: ProductVariantSummary;
    shop: Shop;
    ShopName?: string;
}
