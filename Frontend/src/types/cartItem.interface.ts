// export interface CartItem {
//     CartItemID: number;
//     CartID: number;
//     ShopID: number;
//     Quantity: number;
//     AddedAt: string;
//     CartItemUpdatedAt: string;
//     // Remove the direct 'product: Product' field
//     // Add nested structure based on backend DB query output
//     productVariant: {
//         VariantID: number;
//         ProductID: number;
//         SKU: string | null;
//         Price: number; // This is the variant price
//         CompareAtPrice: number | null;
//         StockQuantity: number;
//         ImageURL: string | null; // This is the variant image
//         IsActive?: boolean; // Backend assumes active, not explicitly fetched
//         CreatedAt?: string | null; // Not fetched
//         UpdatedAt?: string | null; // Not fetched
//         attributeValues: { // Added attribute values
//             AttributeValueID: number;
//             AttributeID: number;
//             Value: string;
//             attribute: {
//                 AttributeID: number;
//                 Name: string;
//             };
//         }[];
//         product: { // Nested product details
//             ProductID: number;
//             ShopID: number;
//             CategoryID?: number | null; // Not fetched
//             Name: string; // This is the product name
//             Description: string | null;
//             Discount: number;
//             IsActive?: boolean; // Backend assumes active
//             AdminApprovalStatus?: 'Pending' | 'Approved' | 'Rejected'; // Backend assumes approved
//             ReasonForRejection?: string | null;
//             CreatedAt?: string | null; // Not fetched
//             UpdatedAt?: string | null; // Not fetched
//             variants?: any[];
//         };
//     };
//     shop: { // Nested shop details
//         ShopID: number;
//         ShopName: string; // Added ShopName to nested shop object
//     };
//     // Keep flat ShopName as it's used directly in frontend grouping
//     ShopName: string; // This flat ShopName might be redundant now, but keeping as per original file structure
// }
// src/types/cartItem.interface.ts
import { ProductVariantSummary } from './product.interface'; // Quan trọng: import từ đây
import { ShopSummary } from './shop.interface'; // Quan trọng: import từ đây
import { AttributeValue } from './attributeValue.interface'; // Để đảm bảo AttributeValue khớp

export interface CartItem {
    CartItemID: number;
    CartID: number;
    VariantID: number;
    ShopID: number;
    Quantity: number;
    AddedAt: string;
    CartItemUpdatedAt: string;

    // Sử dụng ProductVariantSummary để khớp với cấu trúc bạn muốn từ backend
    productVariant: ProductVariantSummary;

    // Sử dụng ShopSummary để khớp với cấu trúc bạn muốn từ backend
    shop: ShopSummary;

    // `ShopName` phẳng này có thể redundant nếu đã có shop.ShopName.
    // Cân nhắc xóa nó nếu bạn luôn dùng `item.shop.ShopName`
    ShopName?: string; // Có thể để optional hoặc xóa
}