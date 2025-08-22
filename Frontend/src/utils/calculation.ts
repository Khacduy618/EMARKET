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
    platformVouchers: AppliedVouchersCombined | null // Cho phép null
): CheckoutSummaryDetails => {
    
    const totalProductsPrice = shopOrders.reduce((sum, so) => 
        sum + so.items.reduce((itemSum, item) => itemSum + item.subtotal, 0), 0);

    const totalShippingFee = shopOrders.reduce((sum, so) => sum + so.shippingFee, 0);

    const totalShopVoucherDiscount = shopOrders.reduce((sum, so) => {
        if (!so.appliedVoucher) return sum;
        const shopSubtotal = so.items.reduce((s, item) => s + item.subtotal, 0);
        return sum + calculateDiscountForVoucher(so.appliedVoucher, shopSubtotal);
    }, 0);

    // --- LOGIC TÍNH TOÁN VOUCHER TOÀN SÀN ĐÃ SỬA ---
    const subtotalForPlatformCalc = totalProductsPrice - totalShopVoucherDiscount;

    let totalSaleoff = 0;
    if (platformVouchers?.saleOffVoucher && subtotalForPlatformCalc > 0) {
        // Voucher giảm giá của sàn được tính trên tổng tiền hàng (sau khi trừ voucher shop)
        totalSaleoff = calculateDiscountForVoucher(platformVouchers.saleOffVoucher, subtotalForPlatformCalc);
    }
    
    let totalFreeship = 0;
    if (platformVouchers?.freeShipVoucher && totalProductsPrice > 0) {
        // **SỬA LỖI Ở ĐÂY:**
        // Điều kiện MinOrderValue của voucher freeship được kiểm tra với `totalProductsPrice`.
        // Nhưng giá trị giảm giá của nó được áp dụng cho `totalShippingFee`.
        const potentialFreeshipDiscount = calculateDiscountForVoucher(
            platformVouchers.freeShipVoucher, 
            totalProductsPrice // Dùng tổng tiền hàng để check điều kiện
        );
        
        // Giảm giá không thể lớn hơn phí vận chuyển thực tế
        totalFreeship = Math.min(potentialFreeshipDiscount, totalShippingFee);
    }
    
    const totalPlatformVoucherDiscount = totalSaleoff + totalFreeship;
    
    const totalDiscount = totalShopVoucherDiscount + totalPlatformVoucherDiscount;
    const finalTotal = totalProductsPrice + totalShippingFee - totalDiscount;

    return {
        totalProductsPrice,
        totalShippingFee,
        totalShopVoucherDiscount,
        totalPlatformVoucherDiscount,
        totalFreeship, // <-- Giá trị này giờ sẽ đúng
        totalSaleoff,
        totalDiscount,
        finalTotal: finalTotal > 0 ? finalTotal : 0,
        address: null 
    };
};