// src/types/product.interface.ts
import { Shop } from './shop.interface'; // Nếu bạn muốn Product có thông tin Shop
import { AttributeValue } from './attributeValue.interface';

// Đảm bảo ProductVariant được EXPORT
export interface ProductVariant {
    VariantID: number;
    ProductID: number;
    SKU: string | null;
    Price: number; // Giá của phiên bản cụ thể
    CompareAtPrice: number | null;
    StockQuantity: number;
    ImageURL: string | null; // Ảnh của phiên bản cụ thể
    IsActive: boolean;
    CreatedAt: string;
    UpdatedAt: string;
    attributeValues?: AttributeValue[]; // Các thuộc tính của phiên bản này
    // Thêm trường product nếu ProductVariant cần tham chiếu ngược lại Product đầy đủ
    // product?: Product; // Tránh vòng lặp nếu Product cũng có productVariants
}

// Đảm bảo Product được EXPORT và CÓ TRƯỜNG productVariants
export interface Product {
    ProductID: number;
    ShopID: number;
    CategoryID?: number | null;
    Name: string;
    Description?: string | null;
    Discount?: number; // Discount ở cấp sản phẩm
    // SKU, Price, StockQuantity, ImageURL ở cấp Product là redundant nếu có ProductVariants
    // Thay vào đó, chúng thuộc về ProductVariant
    // SKU?: string; // Xóa
    // Price: number; // Xóa
    // StockQuantity: number; // Xóa
    IsActive: boolean;
    AdminApprovalStatus: 'Pending' | 'Approved' | 'Rejected';
    ReasonForRejection?: string | null;
    AverageRating?: number | null;
    ViewCount?: number;
    SoldCount?: number | null;
    ImageURL?: string | null; // Hình ảnh chính của sản phẩm (nếu có)
    CreatedAt: string;
    UpdatedAt: string;
    // Quan trọng: Thêm trường productVariants
    productVariants?: ProductVariant[];
    shop?: Shop; // Thông tin shop liên quan
}

// Các interface tóm tắt (ProductSummary, ProductVariantSummary) nếu bạn dùng chúng
// Chúng không bắt buộc phải export nếu chỉ dùng nội bộ trong CartItem.interface.ts
export interface ProductSummary {
    ProductID: number;
    Name: string;
    Description: string | null;
    Discount: number;
    // Các trường khác từ Product cần trong tóm tắt
}

export interface ProductVariantSummary {
    VariantID: number;
    ProductID: number;
    SKU: string | null;
    Price: number;
    CompareAtPrice: number | null;
    StockQuantity: number;
    ImageURL: string | null;
    IsActive?: boolean;
    CreatedAt?: string | null;
    UpdatedAt?: string | null;
    product: ProductSummary; // Sử dụng ProductSummary
    attributeValues: AttributeValue[]; // Sử dụng AttributeValue
}
