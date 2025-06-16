// // Định nghĩa VoucherScope (enum 'Scope' trong DB)
// export type VoucherScope = 'Platform' | 'Shop';

// // Định nghĩa DiscountType (enum 'DiscountType' trong DB)
// export type DiscountType = 'Percentage' | 'FixedAmount';

// // NEW: Định nghĩa VoucherCouponType (enum 'VoucherType' trong DB)
// export type VoucherCouponType = 'FreeShip' | 'SaleOff';

// // Định nghĩa interface cho Voucher dựa trên schema DB của bạn
// export interface Voucher {
//     VoucherID: number;
//     Code: string;
//     Description?: string | null;
//     VoucherType: VoucherCouponType; // Sử dụng enum mới từ DB
//     DiscountType: DiscountType;
//     DiscountValue: number;
//     MaxValueForPercentage?: number | null;
//     MinOrderValue: number;
//     StartDate: string;
//     EndDate: string;
//     UsageLimitPerUser?: number | null;
//     UsageLimitTotal?: number | null;
//     TimesUsed: number; // Tổng số lượt đã dùng của voucher này (từ bảng Vouchers)
//     Scope: VoucherScope;
//     ShopID?: number | null;
//     IsActive: boolean;
//     CreatedBy: 'Admin' | 'Seller';
//     UserID?: number | null; // ID của người tạo voucher
//     CreatedAt: string;
//     UpdatedAt: string;
//     shopName?: string; // Tên shop, được thêm vào từ JOIN nếu là shop voucher (từ controller)

//     // Thuộc tính từ UserVouchers cho kiểm tra UsageLimitPerUser
//     TimesUsedByUser?: number; // Số lần user hiện tại đã dùng voucher này (từ JOIN trong Controller)
// }

// // Cập nhật interface cho phản hồi khi fetch vouchers
// export interface FetchVouchersResponse {
//     platformVouchers: Voucher[];
//     shopVouchers: Voucher[];
//     message?: string;
// }

// // Interface cho dữ liệu một voucher CỤ THỂ được chọn để áp dụng
// export interface SingleAppliedVoucher {
//     VoucherID: number;
//     Code: string;
//     DiscountType: DiscountType;
//     DiscountValue: number;
//     MaxValueForPercentage?: number | null;
//     MinOrderValue: number;
//     Scope: VoucherScope;
//     ShopID?: number | null;
//     VoucherType: VoucherCouponType;
// }

// // NEW: Interface cho dữ liệu voucher TỔNG HỢP được chọn để áp dụng
// export interface AppliedVouchersCombined {
//     freeShipVoucher: SingleAppliedVoucher | null;
//     saleOffVoucher: SingleAppliedVoucher | null;
// }
// export type VoucherScope = 'Platform' | 'Shop';
// export type DiscountType = 'Percentage' | 'FixedAmount';
// export type VoucherCouponType = 'FreeShip' | 'SaleOff';

// export interface Voucher {
//     VoucherID: number;
//     Code: string;
//     Description?: string | null;
//     VoucherType: VoucherCouponType;
//     DiscountType: DiscountType;
//     DiscountValue: number;
//     MaxValueForPercentage?: number | null;
//     MinOrderValue: number;
//     StartDate: string;
//     EndDate: string;
//     UsageLimitPerUser?: number | null;
//     UsageLimitTotal?: number | null;
//     TimesUsed: number;
//     Scope: VoucherScope;
//     ShopID?: number | null;
//     IsActive: boolean;
//     CreatedBy: 'Admin' | 'Seller';
//     UserID?: number | null;
//     CreatedAt: string;
//     UpdatedAt: string;
//     shopName?: string;
//     TimesUsedByUser?: number;

//     visualType?: 'VOUCHER_XTRA' | 'SHOPEE' | 'XA_HANG' | 'SHOPEE_LIVE' | 'ONLY_LIVE';
// }

// export interface FetchVouchersResponse {
//     platformVouchers: Voucher[];
//     shopVouchers: Voucher[];
//     message?: string;
// }

// // Interface cho dữ liệu một voucher CỤ THỂ được chọn
// export interface SingleAppliedVoucher {
//     VoucherID: number;
//     Code: string;
//     DiscountType: DiscountType;
//     DiscountValue: number;
//     MaxValueForPercentage?: number | null;
//     MinOrderValue: number;
//     Scope: VoucherScope;
//     ShopID?: number | null;
//     VoucherType: VoucherCouponType;
//     // Có thể thêm shopName nếu muốn hiển thị chi tiết hơn trong CartPage
// }

// // NEW: Interface cho dữ liệu voucher TỔNG HỢP được chọn để áp dụng
// export interface AppliedVouchersCombined {
//     freeShipVoucher: SingleAppliedVoucher | null;
//     saleOffVoucher: SingleAppliedVoucher | null;
// }

// types/voucher.interface.ts

export type VoucherScope = 'Platform' | 'Shop';
export type DiscountType = 'Percentage' | 'FixedAmount';
export type VoucherCouponType = 'FreeShip' | 'SaleOff';

export interface Voucher {
    VoucherID: number;
    Code: string;
    Description?: string | null;
    VoucherType: VoucherCouponType;
    DiscountType: DiscountType;
    DiscountValue: number;
    MaxValueForPercentage?: number | null;
    MinOrderValue: number;
    StartDate: string;
    EndDate: string;
    UsageLimitPerUser?: number | null;
    UsageLimitTotal?: number | null;
    TimesUsed: number;
    Scope: VoucherScope;
    ShopID?: number | null;
    IsActive: boolean;
    CreatedBy: 'Admin' | 'Seller';
    UserID?: number | null;
    CreatedAt: string;
    UpdatedAt: string;
    shopName?: string;
    TimesUsedByUser?: number;

    // Cập nhật visualType để bao gồm các loại mới
    visualType?: 'VOUCHER_XTRA' | 'SHOPEE' | 'XA_HANG' | 'SHOPEE_LIVE' | 'ONLY_LIVE' | 'EMARKET' | 'FREESHIP';
}

export interface FetchVouchersResponse {
    platformVouchers: Voucher[];
    shopVouchers: Voucher[];
    message?: string;
}

export interface SingleAppliedVoucher {
    VoucherID: number;
    Code: string;
    DiscountType: DiscountType;
    DiscountValue: number;
    MaxValueForPercentage?: number | null;
    MinOrderValue: number;
    Scope: VoucherScope;
    ShopID?: number | null;
    VoucherType: VoucherCouponType;
}

export interface AppliedVouchersCombined {
    freeShipVoucher: SingleAppliedVoucher | null;
    saleOffVoucher: SingleAppliedVoucher | null;
}