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