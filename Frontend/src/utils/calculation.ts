// In src/utils/calculation.ts

import { 
    CheckoutShopOrder, 
    AppliedVouchersCombined, 
    Voucher,
    CheckoutSummaryDetails 
} from '@/types';


// HÀM HELPER 1: TÍNH GIÁ CUỐI CÙNG CỦA SẢN PHẨM (SAU KHI TRỪ DISCOUNT GỐC)
export const calculateFinalItemPrice = (price: number, originalPrice: number | null, discount: number | undefined): number => {
    const basePrice = originalPrice ?? price;
    return Math.floor(basePrice * (1 - (discount ?? 0) / 100));
};


/**
 * Tính toán giảm giá từ một voucher cụ thể dựa trên tổng tiền.
 */
export const calculateDiscountForVoucher = (voucher: Voucher, subtotal: number): number => {
    if (!voucher || subtotal < voucher.MinOrderValue) {
        return 0;
    }
    let discount = 0;
    if (voucher.DiscountType === 'FixedAmount') {
        discount = voucher.DiscountValue;
    } else if (voucher.DiscountType === 'Percentage') {
        discount = subtotal * (voucher.DiscountValue / 100);
        if (voucher.MaxValueForPercentage != null && discount > voucher.MaxValueForPercentage) {
            discount = voucher.MaxValueForPercentage;
        }
    }
    return Math.round(discount);
};

/**
 * Tính toán lại toàn bộ chi tiết thanh toán (summary).
 * Hàm này sẽ là nguồn chân lý duy nhất cho cả Cart và Checkout.
 */
export const recalculateSummary = (
    shopOrders: CheckoutShopOrder[], 
    platformVouchers: AppliedVouchersCombined
): CheckoutSummaryDetails => {
    
    // 1. Tính tổng tiền hàng ban đầu từ các item
    const totalProductsPrice = shopOrders.reduce((sum, so) => 
        sum + so.items.reduce((itemSum, item) => itemSum + item.subtotal, 0), 0);

    // 2. Tính tổng phí vận chuyển
    const totalShippingFee = shopOrders.reduce((sum, so) => sum + so.shippingFee, 0);

    // 3. Tính tổng giảm giá từ VOUCHER CỦA TỪNG SHOP
    const totalShopVoucherDiscount = shopOrders.reduce((sum, so) => {
        if (!so.appliedVoucher) return sum;
        const shopSubtotal = so.items.reduce((s, item) => s + item.subtotal, 0);
        return sum + calculateDiscountForVoucher(so.appliedVoucher, shopSubtotal);
    }, 0);

    // 4. Tính giảm giá từ VOUCHER TOÀN SÀN
    let totalSaleoff = 0;
    if (platformVouchers.saleOffVoucher) {
        // Voucher giảm giá của sàn được tính trên tổng tiền hàng
        totalSaleoff = calculateDiscountForVoucher(platformVouchers.saleOffVoucher, totalProductsPrice);
    }
    
    let totalFreeship = 0;
    if (platformVouchers.freeShipVoucher) {
        // Voucher freeship được tính trên tổng phí vận chuyển
        const freeshipDiscount = calculateDiscountForVoucher(platformVouchers.freeShipVoucher, totalShippingFee);
        // Đảm bảo không giảm nhiều hơn phí vận chuyển thực tế
        totalFreeship = Math.min(freeshipDiscount, totalShippingFee);
    }
    
    const totalPlatformVoucherDiscount = totalSaleoff + totalFreeship;
    
    // 5. Tính toán các giá trị tổng cuối cùng
    const totalDiscount = totalShopVoucherDiscount + totalPlatformVoucherDiscount;
    const finalTotal = totalProductsPrice + totalShippingFee - totalDiscount;

    return {
        totalProductsPrice,
        totalShippingFee,
        totalShopVoucherDiscount,
        totalPlatformVoucherDiscount,
        totalFreeship,
        totalSaleoff,
        totalDiscount,
        finalTotal: finalTotal > 0 ? finalTotal : 0, // Đảm bảo tổng tiền không bị âm
        address: null // address sẽ được thêm vào sau
    };
};