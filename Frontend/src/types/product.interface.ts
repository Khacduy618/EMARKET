// src/types/product.interface.ts
import { Shop } from './shop.interface'; // Nếu bạn muốn Product có thông tin Shop
import { AttributeValue } from './attributeValue.interface';

// Đảm bảo ProductVariant được EXPORT
export interface ProductVariant {
    VariantID: number;
    ProductID: number;
    SKU: string | null;
    Price: number;
    CompareAtPrice: number | null;
    StockQuantity: number;
    ImageURL: string | null; // Ảnh của phiên bản cụ thể
    IsActive?: boolean;
    // SỬA LỖI: Thêm '?' và '| null' để làm cho kiểu dữ liệu tương thích
    CreatedAt?: string | null; 
    UpdatedAt?: string | null;
    attribute_values?: AttributeValue[]; // Các thuộc tính của phiên bản này
    // Thêm trường product nếu ProductVariant cần tham chiếu ngược lại Product đầy đủ
    // product?: Product; // Tránh vòng lặp nếu Product cũng có productVariants
}
export interface ProductImage {
    ImageID: number;
    ProductID: number;
    ImageURL: string;
    IsPrimary: boolean; // tinyint(1) trong DB tương ứng với boolean
    SortOrder?: number;
    CreatedAt: string;
}
// Đảm bảo Product được EXPORT và CÓ TRƯỜNG productVariants
// export interface Product {
//     ProductID: number;
//     ShopID: number;
//     CategoryID?: number | null;
//     Name: string;
//     Description?: string | null;
//     Discount?: number; // Discount ở cấp sản phẩm
//     // SKU, Price, StockQuantity, ImageURL ở cấp Product là redundant nếu có ProductVariants
//     // Thay vào đó, chúng thuộc về ProductVariant
//     // SKU?: string; // Xóa
//     // Price: number; // Xóa
//     // StockQuantity: number; // Xóa
//     IsActive: boolean;
//     AdminApprovalStatus: 'Pending' | 'Approved' | 'Rejected';
//     ReasonForRejection?: string | null;
//     AverageRating?: number | null;
//     ViewCount?: number;
//     SoldCount?: number | null;
//     ImageURL?: string | null; // Hình ảnh chính của sản phẩm (nếu có)
//     CreatedAt: string;
//     UpdatedAt: string;
//     images: ProductImage[];
//     // Quan trọng: Thêm trường productVariants
//     productVariants?: ProductVariant[];
//     shop?: Shop; // Thông tin shop liên quan
// }
export interface Product {
    ProductID: number;
    ShopID: number;
    CategoryID?: number | null;
    Name: string;
    Description?: string | null;
    Discount?: number;
    IsActive: boolean;
    AdminApprovalStatus: 'Pending' | 'Approved' | 'Rejected';
    ReasonForRejection?: string | null;
    AverageRating?: number | null;
    ViewCount?: number;
    SoldCount?: number | null;
    ImageURL?: string | null;
    CreatedAt: string;
    UpdatedAt: string;
    images: ProductImage[];
    
    // SỬA ĐỔI QUAN TRỌNG: Đổi tên từ 'productVariants' thành 'variants'
    variants?: ProductVariant[]; 
    
    shop?: Shop;
    category?: { // Thêm trường category để khớp với JSON
        CategoryID: number;
        Name: string;
    };
}

// Các interface tóm tắt (ProductSummary, ProductVariantSummary) nếu bạn dùng chúng
// Chúng không bắt buộc phải export nếu chỉ dùng nội bộ trong CartItem.interface.ts
export interface ProductSummary {
    ProductID: number;
    Name: string;
    Description: string | null;
    Discount: number;
    ImageURL?: string | null; // Ảnh đại diện chính (nếu có)
    images: ProductImage[];   //
     AdminApprovalStatus: 'Pending' | 'Approved' | 'Rejected';
     IsActive: boolean;
    
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
    attribute_values: AttributeValue[]; // Sử dụng AttributeValue
}
