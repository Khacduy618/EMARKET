// utils/imageHelpers.ts
import { getFullImageUrl, getVariantImage } from '@/services/api';
import { ProductVariant } from '@/types/product.interface';

interface ProductWithImages {
    images?: Array<{ImageURL: string; IsPrimary: boolean}>;
    ImageURL?: string | null;
    PrimaryImageURL?: string | null;
}

/**
 * Hàm helper để lấy URL hình ảnh hiển thị cho sản phẩm
 * Ưu tiên: Variant Image > Primary Image > First Image > Placeholder
 */
export const getProductDisplayImage = (
    product: ProductWithImages,
    selectedVariant?: ProductVariant
): string => {
    // 1. Nếu có variant được chọn và variant có hình ảnh riêng
    if (selectedVariant?.ImageURL) {
        return getVariantImage(selectedVariant, { images: product.images });
    }
    
    // 2. Nếu sản phẩm có PrimaryImageURL (từ API suggestions)
    if (product.PrimaryImageURL) {
        return getFullImageUrl(product.PrimaryImageURL);
    }
    
    // 3. Nếu sản phẩm có ImageURL (từ API khác)
    if (product.ImageURL) {
        return getFullImageUrl(product.ImageURL);
    }
    
    // 4. Tìm ảnh primary trong danh sách images
    if (product.images && product.images.length > 0) {
        const primaryImage = product.images.find(img => img.IsPrimary);
        if (primaryImage) {
            return getFullImageUrl(primaryImage.ImageURL);
        }
        
        // 5. Nếu không có ảnh primary, lấy ảnh đầu tiên
        return getFullImageUrl(product.images[0].ImageURL);
    }
    
    // 6. Fallback cuối cùng
    return getFullImageUrl(null);
};

/**
 * Hàm helper để lấy danh sách tất cả hình ảnh của sản phẩm
 * Bao gồm cả ảnh từ variants
 */
export const getAllProductImages = (
    product: ProductWithImages & { variants?: ProductVariant[] }
): string[] => {
    const images: string[] = [];
    
    // Thêm ảnh chính của sản phẩm
    if (product.PrimaryImageURL) {
        images.push(getFullImageUrl(product.PrimaryImageURL));
    }
    
    if (product.ImageURL && product.ImageURL !== product.PrimaryImageURL) {
        images.push(getFullImageUrl(product.ImageURL));
    }
    
    // Thêm ảnh từ danh sách images
    if (product.images) {
        product.images.forEach(img => {
            const imageUrl = getFullImageUrl(img.ImageURL);
            if (!images.includes(imageUrl)) {
                images.push(imageUrl);
            }
        });
    }
    
    // Thêm ảnh từ variants
    if (product.variants) {
        product.variants.forEach(variant => {
            if (variant.ImageURL) {
                const imageUrl = getFullImageUrl(variant.ImageURL);
                if (!images.includes(imageUrl)) {
                    images.push(imageUrl);
                }
            }
        });
    }
    
    return images.length > 0 ? images : [getFullImageUrl(null)];
};

/**
 * Hàm helper để format currency theo định dạng Việt Nam
 */
export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN').format(amount);
};

/**
 * Hàm helper để tính phần trăm giảm giá
 */
export const calculateDiscountPercent = (originalPrice: number, finalPrice: number): number => {
    if (originalPrice <= 0 || finalPrice >= originalPrice) return 0;
    return Math.round(((originalPrice - finalPrice) / originalPrice) * 100);
};

/**
 * Interface cho thông tin giá sản phẩm
 */
export interface PricingInfo {
    finalPrice: number | null;
    originalPrice: number | null;
    discountPercent: number;
    stockText: string;
    priceRange?: string; // Cho trường hợp hiển thị khoảng giá
}

/**
 * Hàm helper để tính toán thông tin giá cho sản phẩm
 * @param product - Sản phẩm với variants
 * @param selectedVariant - Variant được chọn (nếu có)
 * @param productDiscount - Phần trăm giảm giá của sản phẩm
 * @returns Thông tin giá đã được tính toán
 */
export const calculatePricingInfo = (
    product: {
        variants?: Array<{ Price: number; CompareAtPrice: number | null; StockQuantity: number }>;
        min_overall_compare_at_price?: number | null;
        total_overall_stock_quantity?: number;
    },
    selectedVariant?: { Price: number; CompareAtPrice: number | null; StockQuantity: number } | null,
    productDiscount: number = 0
): PricingInfo => {
    // Giá trị mặc định
    if (!product) {
        return { 
            finalPrice: null, 
            originalPrice: null, 
            discountPercent: 0, 
            stockText: 'Đang tải...',
            priceRange: undefined
        };
    }

    let basePrice: number | null = null;
    let stockText = `${product.total_overall_stock_quantity || 0} sản phẩm có sẵn`;

    // Xác định giá bán gốc và tồn kho dựa trên việc đã chọn biến thể hay chưa
    if (selectedVariant) {
        // Đã chọn variant cụ thể - hiển thị giá chính xác
        basePrice = selectedVariant.CompareAtPrice || selectedVariant.Price;
        stockText = `${selectedVariant.StockQuantity} sản phẩm có sẵn`;
    } else if (product.variants && product.variants.length > 0) {
        // Chưa chọn variant - hiển thị giá nhỏ nhất
        const activePrices = product.variants
            .filter(v => v.StockQuantity > 0)
            .map(v => v.CompareAtPrice || v.Price)
            .filter(price => price > 0);
        
        if (activePrices.length > 0) {
            const minPrice = Math.min(...activePrices);
            const maxPrice = Math.max(...activePrices);
            basePrice = minPrice;
            
            // Nếu có nhiều giá khác nhau, hiển thị khoảng giá
            if (minPrice !== maxPrice) {
                const minFinalPrice = productDiscount > 0 ? minPrice * (1 - productDiscount / 100) : minPrice;
                const maxFinalPrice = productDiscount > 0 ? maxPrice * (1 - productDiscount / 100) : maxPrice;
                return {
                    finalPrice: minFinalPrice,
                    originalPrice: productDiscount > 0 ? minPrice : null,
                    discountPercent: productDiscount,
                    stockText,
                    priceRange: `${formatCurrency(minFinalPrice)} - ${formatCurrency(maxFinalPrice)}`
                };
            }
        } else {
            basePrice = product.min_overall_compare_at_price;
        }
    } else {
        // Sản phẩm không có variants
        basePrice = product.min_overall_compare_at_price;
    }

    // Nếu không có giá bán gốc (dữ liệu lỗi hoặc sản phẩm chưa có giá)
    if (!basePrice || basePrice <= 0) {
        return { 
            finalPrice: null, 
            originalPrice: null, 
            discountPercent: 0, 
            stockText,
            priceRange: undefined
        };
    }

    // Áp dụng logic giảm giá
    const discountPercent = productDiscount;
    let finalPrice = basePrice;
    let originalPrice: number | null = null;

    if (discountPercent > 0) {
        // Nếu có giảm giá, giá gốc chính là giá bán niêm yết
        originalPrice = basePrice;
        // Giá cuối cùng là giá sau khi đã trừ đi % giảm giá
        finalPrice = basePrice * (1 - discountPercent / 100);
    }

    return { 
        finalPrice, 
        originalPrice, 
        discountPercent, 
        stockText,
        priceRange: undefined
    };
};

/**
 * Hàm helper để hiển thị giá trong UI
 * @param pricingInfo - Thông tin giá đã được tính toán
 * @param showPriceRange - Có hiển thị khoảng giá không
 * @returns String để hiển thị giá
 */
export const displayPrice = (pricingInfo: PricingInfo, showPriceRange: boolean = false): string => {
    if (showPriceRange && pricingInfo.priceRange) {
        return pricingInfo.priceRange;
    }
    
    if (pricingInfo.finalPrice) {
        return formatCurrency(pricingInfo.finalPrice);
    }
    
    return 'Liên hệ để biết giá';
};

/**
 * Hàm helper để lấy giá nhỏ nhất từ danh sách variants
 */
export const getMinPriceFromVariants = (
    variants: Array<{ Price: number; CompareAtPrice: number | null; StockQuantity: number }>,
    discount: number = 0
): number | null => {
    const activePrices = variants
        .filter(v => v.StockQuantity > 0)
        .map(v => {
            const basePrice = v.CompareAtPrice || v.Price;
            return discount > 0 ? basePrice * (1 - discount / 100) : basePrice;
        })
        .filter(price => price > 0);
    
    return activePrices.length > 0 ? Math.min(...activePrices) : null;
};