'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react'; // <--- Added useCallback here
import axios from 'axios';
import Image from 'next/image';
import { Loader2, Heart, Star, ChevronRight, ShoppingCart, Check, Truck, Shield, RotateCw } from 'lucide-react';
import RelatedItems from './RelatedItems';
import { toast } from 'react-toastify';
import { getFullImageUrl } from '@/services/api'; 
import { addCartItem } from '@/services/cart';
import ConfirmModal from '@/app/components/ConfirmModal';

// --- INTERFACES ---
// Define the Attribute interface first, as it's nested inside AttributeValue
interface Attribute {
    AttributeID: number;
    Name: string;
    CreatedAt?: string;
    UpdatedAt?: string;
}

interface AttributeValue {
    AttributeValueID?: number;
    AttributeID: number;
    Value: string;
    CreatedAt?: string;
    UpdatedAt?: string;
    pivot?: { VariantID: number; AttributeValueID: number; };
    attribute?: Attribute; // <--- This was missing, now added
}

interface ProductImage {
    ImageID: number;
    ProductID: number;
    ImageURL: string;
    IsPrimary: number;
    CreatedAt?: string;
    UpdatedAt?: string;
}

interface Variant {
    VariantID: number;
    ProductID: number;
    SKU: string;
    Price: number;
    CompareAtPrice: number | null; // Can be null
    StockQuantity: number;
    ImageURL: string | null;
    IsActive: number; // Assuming 0 or 1 for boolean like in DB
    CreatedAt?: string;
    UpdatedAt?: string;
    attribute_values: AttributeValue[];
}

interface Product {
    ProductID: number;
    ShopID: number;
    CategoryID?: number | null;
    Name: string;
    Description: string;
    Discount: number;
    viewCount?: number | null;
    IsActive: boolean;
    AdminApprovalStatus: 'Pending' | 'Approved' | 'Rejected';
    ReasonForRejection?: string | null;
    CreatedAt: string;
    UpdatedAt: string;
    images: ProductImage[];
    variants: Variant[];
    min_overall_compare_at_price: number | null;
    total_overall_stock_quantity: number;
}

// Props of the Component
interface ProductDetailProps {
    productId: number;
    descriptionSlot: React.ReactNode;
    sidebarSlot: React.ReactNode;
}


const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

// --- MAIN COMPONENT ---
const ProductDetail: React.FC<ProductDetailProps> = ({ productId, descriptionSlot, sidebarSlot }) => {
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // --- REFACTORED STATE ---
    const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({}); // Starts empty
    const [quantity, setQuantity] = useState<number>(1);
    
    // Other states remain the same...
    const [showLargeQuantityConfirm, setShowLargeQuantityConfirm] = useState(false);
    const [largeQuantityPromptInfo, setLargeQuantityPromptInfo] = useState<{ productName: string; shopPhone: string } | null>(null);


    // showNotification is now wrapped in useCallback and imported
    const showNotification = useCallback((message: string, type: 'success' | 'error' | 'warning' | 'info', duration: number = 3000) => {
        switch (type) {
            case 'success':
                toast.success(message, { autoClose: duration });
                break;
            case 'error':
                toast.error(message, { autoClose: duration });
                break;
            case 'warning':
                toast.warn(message, { autoClose: duration });
                break;
            case 'info':
                toast.info(message, { autoClose: duration });
                break; // Added break for 'info'
            default: // This default case is now effectively unreachable but good for type safety
                toast.info(message, { autoClose: duration });
        }
    }, []); // Empty dependency array means it's created once

    
// --- REFACTORED: Initial Data Fetch ---
    useEffect(() => {
        if (!productId) return;
        const fetchProduct = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get(`http://localhost:8001/api/productDetail/${productId}`);
                const productData: Product = response.data;
                setProduct(productData);

                // Set initial image to the product's primary image
                const primaryImage = productData.images?.find(img => img.IsPrimary === 1)?.ImageURL || productData.images?.[0]?.ImageURL;
                setSelectedImage(primaryImage || null);
                
                // Reset states for the new product
                setSelectedOptions({});
                setSelectedVariant(null);
                setQuantity(1);

            } catch (err) {
                console.error("Failed to fetch product:", err);
                setError("Không thể tải thông tin sản phẩm.");
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [productId]);

    

    const attributeStructure = useMemo(() => {
        if (!product) return {};
        const attributes: Record<string, Set<string>> = {};
        product.variants.forEach(variant => {
            variant.attribute_values.forEach(attrValue => {
                const attrName = attrValue.attribute?.Name;
                if (attrName) {
                    if (!attributes[attrName]) {
                        attributes[attrName] = new Set();
                    }
                    attributes[attrName].add(attrValue.Value);
                }
            });
        });
        const result: Record<string, string[]> = {};
        for (const key in attributes) {
            result[key] = Array.from(attributes[key]);
        }
        return result;
    }, [product]);

    const availableOptionsAndTheirStatus = useMemo(() => {
        if (!product || Object.keys(attributeStructure).length === 0) {
            return { available: {}, allSelected: false };
        }

        // 1. Find all variants that match the *currently selected* options
        const potentiallyMatchingVariants = product.variants.filter(variant => {
            if (!variant.IsActive || variant.StockQuantity <= 0) return false; // Exclude inactive/OOS variants
            return Object.entries(selectedOptions).every(([attrName, attrValue]) =>
                variant.attribute_values.some(v_attr =>
                    v_attr.attribute?.Name === attrName && v_attr.Value === attrValue
                )
            );
        });
        
        // 2. From these matching variants, determine what other options are still possible
        const available: Record<string, Set<string>> = {};
        for (const attrName in attributeStructure) {
            available[attrName] = new Set();
        }

        potentiallyMatchingVariants.forEach(variant => {
            variant.attribute_values.forEach(attrValue => {
                if (attrValue.attribute?.Name) {
                    available[attrValue.attribute.Name].add(attrValue.Value);
                }
            });
        });
        
        // 3. Check if a full, unique variant has been selected
        const allAttributes = Object.keys(attributeStructure);
        const allSelected = allAttributes.every(attrName => selectedOptions[attrName]);
        
        return { available, allSelected };

    }, [product, selectedOptions, attributeStructure]);



     useEffect(() => {
        if (!product || !availableOptionsAndTheirStatus.allSelected) {
            setSelectedVariant(null); // Not enough options selected, so no specific variant
            return;
        }

        // Find the single variant that exactly matches the complete set of selected options
        const finalVariant = product.variants.find(variant =>
            Object.entries(selectedOptions).length === variant.attribute_values.length &&
            Object.entries(selectedOptions).every(([attrName, attrValue]) =>
                variant.attribute_values.some(v_attr =>
                    v_attr.attribute?.Name === attrName && v_attr.Value === attrValue
                )
            )
        );

        if (finalVariant) {
            setSelectedVariant(finalVariant);
            if (finalVariant.ImageURL) {
                setSelectedImage(finalVariant.ImageURL);
            }
            // Reset quantity to 1 unless the selected variant is out of stock
            setQuantity(finalVariant.StockQuantity > 0 ? 1 : 0);
        } else {
            setSelectedVariant(null);
        }

    }, [product, selectedOptions, availableOptionsAndTheirStatus.allSelected]);


    const handleOptionClick = (attributeName: string, value: string) => {
        setSelectedOptions(prev => {
            const newOptions = { ...prev };
            if (newOptions[attributeName] === value) {
                // If clicking the same option again, deselect it
                delete newOptions[attributeName];
            } else {
                // Otherwise, select the new option
                newOptions[attributeName] = value;
            }
            return newOptions;
        });
    };


    // Memoize the maximum quantity allowed in the UI for clarity
    const currentMaxQuantityForUI = useMemo(() => {
        const hardLimit = 10;
        if (!selectedVariant || selectedVariant.StockQuantity <= 0) return 0; // If no variant or out of stock
        return Math.min(selectedVariant.StockQuantity, hardLimit);
    }, [selectedVariant]);
 const pricingInfo = useMemo(() => {
        // Giá trị mặc định
        if (!product) {
            return { finalPrice: null, originalPrice: null, discountPercent: 0, stockText: 'Đang tải...' };
        }

        let basePrice: number | null = null;
        let stockText = `${product.total_overall_stock_quantity} sản phẩm có sẵn`;

        // Xác định giá bán gốc và tồn kho dựa trên việc đã chọn biến thể hay chưa
        if (selectedVariant) {
            basePrice = selectedVariant.CompareAtPrice;
            stockText = `${selectedVariant.StockQuantity} sản phẩm có sẵn`;
        } else {
            basePrice = product.min_overall_compare_at_price;
        }

        // Nếu không có giá bán gốc (dữ liệu lỗi hoặc sản phẩm chưa có giá)
        if (!basePrice || basePrice <= 0) {
            return { finalPrice: null, originalPrice: null, discountPercent: 0, stockText };
        }

        // Áp dụng logic giảm giá
        const discountPercent = product.Discount;
        let finalPrice = basePrice;
        let originalPrice: number | null = null;

        if (discountPercent > 0) {
            // Nếu có giảm giá, giá gốc chính là giá bán niêm yết
            originalPrice = basePrice;
            // Giá cuối cùng là giá sau khi đã trừ đi % giảm giá
            finalPrice = basePrice * (1 - discountPercent / 100);
        }

        return { finalPrice, originalPrice, discountPercent, stockText };

    }, [product, selectedVariant]);
    // Handle quantity changes with clamping and notifications
    const handleQuantityChange = (type: 'increase' | 'decrease' | 'input', value?: string) => {
        if (!selectedVariant || selectedVariant.StockQuantity === 0) {
            showNotification("Sản phẩm này hiện đã hết hàng.", 'error');
            setQuantity(0); // Ensure quantity is 0 if product is out of stock
            return;
        }

        let newQuantity = quantity;

        if (type === 'increase') {
            newQuantity = quantity + 1;
        } else if (type === 'decrease') {
            newQuantity = quantity - 1;
        } else if (type === 'input' && value !== undefined) {
            const parsedValue = parseInt(value, 10);
            newQuantity = isNaN(parsedValue) || parsedValue < 1 ? 1 : parsedValue;
        }

        let clampedQuantity = Math.min(Math.max(newQuantity, 1), currentMaxQuantityForUI);

        // Notify if quantity was clamped by the UI hard limit or stock
        if (newQuantity > currentMaxQuantityForUI) {
            if (currentMaxQuantityForUI > 0) {
                 showNotification(`Số lượng không thể vượt quá ${currentMaxQuantityForUI} sản phẩm.`, 'warning');
            } else {
                 showNotification("Sản phẩm này hiện đã hết hàng.", 'error');
                 clampedQuantity = 0; // Set to 0 if stock became 0 unexpectedly
            }
        } else if (newQuantity < 1 && type === 'input') {
            showNotification("Số lượng phải lớn hơn 0.", 'warning');
            clampedQuantity = 1;
        }


        if (clampedQuantity !== quantity) {
            setQuantity(clampedQuantity);
        }
    };

    // Handlers for ConfirmModal for large quantity
    const handleConfirmLargeQuantity = () => {
        setShowLargeQuantityConfirm(false);
        setLargeQuantityPromptInfo(null);
        // The message about contacting the shop is already in the modal.
        // No further action is needed here as the backend has already processed the cart item.
    };

    const handleCancelLargeQuantity = () => {
        setShowLargeQuantityConfirm(false);
        setLargeQuantityPromptInfo(null);
        // User cancelled, no specific action here as the quantity was already adjusted by backend if needed.
    };

    // Add to cart function
    const handleAddToCart = async () => {
        if (!product || !selectedVariant) { // Check for selectedVariant now
            showNotification("Vui lòng chọn đầy đủ các tùy chọn (màu sắc, kích thước, v.v.) của sản phẩm.", 'error');
            return;
        }
        if (quantity <= 0) {
            showNotification("Số lượng phải lớn hơn 0.", 'error');
            return;
        }
        if (selectedVariant.StockQuantity === 0) {
            showNotification("Sản phẩm này hiện đã hết hàng.", 'error');
            setQuantity(0); // Ensure UI reflects out of stock
            return;
        }
        if (quantity > selectedVariant.StockQuantity) {
            showNotification(`Số lượng yêu cầu vượt quá số lượng sản phẩm có sẵn trong kho. Chỉ còn ${selectedVariant.StockQuantity} sản phẩm.`, 'error');
            setQuantity(selectedVariant.StockQuantity); // Adjust UI quantity to max available
            return;
        }

        try {
            const variantID = selectedVariant.VariantID;
            const shopID = product.ShopID;

            if (!variantID || !shopID) {
                showNotification("Thiếu thông tin cần thiết để thêm vào giỏ hàng. Vui lòng thử lại.", 'error');
                return;
            }

            // Call addCartItem service
            const response = await addCartItem(variantID, quantity, shopID);

            // Check backend response for large quantity prompt
            if (response.shouldShowLargeQuantityPrompt && response.productName && response.shopPhone) {
                setLargeQuantityPromptInfo({
                    productName: response.productName,
                    shopPhone: response.shopPhone
                });
                setShowLargeQuantityConfirm(true);
            } else {
                showNotification(response.message || "Sản phẩm đã được thêm vào giỏ hàng!", 'success');
            }

            // Update quantity input after successful addition (reset to 1 or clamped value)
            if (response.finalQuantityInCart !== undefined) {
                 if (response.finalQuantityInCart < quantity && response.finalQuantityInCart > 0) {
                     setQuantity(response.finalQuantityInCart); // If backend clamped quantity, update UI
                } else {
                    setQuantity(1); // Reset to 1 after successful addition
                }
            } else {
                setQuantity(1); // Default reset to 1
            }


        } catch (error: any) {
            console.error("Lỗi khi thêm vào giỏ hàng:", error);
            const errorMessage = error.response?.data?.message || "Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng.";
            if (error.response?.data?.available_stock !== undefined) {
                showNotification(`${errorMessage} (Tồn kho: ${error.response.data.available_stock})`, 'error');
                setQuantity(error.response.data.available_stock > 0 ? error.response.data.available_stock : 0);
            } else {
                showNotification(errorMessage, 'error');
            }
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center min-h-[50vh]"><Loader2 className="h-12 w-12 animate-spin text-orange-500" /></div>;
    }
    if (error) {
        return <div className="flex justify-center items-center min-h-[50vh]"><p className="text-red-500 text-xl">{error}</p></div>;
    }
    if (!product) { // Only check for product here. selectedVariant and selectedImage might be null if product has no variants/images initially.
        return <div className="flex justify-center items-center min-h-[50vh]"><p className="text-gray-500 text-xl">Không tìm thấy sản phẩm.</p></div>;
    }

    
    // --- THAY THẾ TOÀN BỘ HOOK useMemo HIỆN TẠI BẰNG ĐOẠN NÀY ---

   
    const canAddToCart = !!selectedVariant && selectedVariant.StockQuantity > 0 && quantity > 0;

    return (
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans bg-white">

            {showLargeQuantityConfirm && largeQuantityPromptInfo && (
                <ConfirmModal
                    isOpen={showLargeQuantityConfirm}
                    message={`Quý khách muốn đặt số lượng lớn cho sản phẩm "${largeQuantityPromptInfo.productName}"? Vui lòng liên hệ cửa hàng: ${largeQuantityPromptInfo.shopPhone || 'Chưa có SĐT'}`}
                    onConfirm={handleConfirmLargeQuantity}
                    onCancel={handleCancelLargeQuantity}
                />
            )}
            {/* Breadcrumb */}
            <div className="flex items-center text-sm text-gray-500 mb-6">
                <span className="hover:text-orange-500 cursor-pointer">Trang chủ</span>
                <ChevronRight size={16} className="mx-2" />
                <span className="hover:text-orange-500 cursor-pointer">Danh mục</span>
                <ChevronRight size={16} className="mx-2" />
                <span className="text-orange-500">{product.Name}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Image Gallery */}
                <div className="lg:col-span-7 flex flex-row gap-4">
                    <div className="flex flex-col gap-3 w-20">
                        {product.images.slice(0, 4).map((image) => (
                            <div key={image.ImageID} onClick={() => setSelectedImage(image.ImageURL)}
                                className={`w-20 h-20 bg-gray-50 rounded flex items-center justify-center cursor-pointer p-1 border transition-all ${selectedImage === image.ImageURL ? 'border-orange-500' : 'border-gray-200 hover:border-orange-300'}`}>
                                 <img
                                    // SỬ DỤNG HÀM MỚI Ở ĐÂY
                                    src={getFullImageUrl(image.ImageURL)}
                                    alt="thumbnail"
                                    width={80}
                                    height={80}
                                    className="object-contain max-h-full max-w-full"
                                />
                            </div>
                        ))}
                    </div>
                    <div className="flex-1 bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                        <div className="relative aspect-square w-full">
                            {selectedImage && ( // Render image only if selectedImage is not null
                                <img
                                    key={selectedImage} // Add key to force re-render Image component when src changes
                                    src={getFullImageUrl(selectedImage)}
                                    alt={product.Name}
                                    
                                    className="object-contain w-full h-full p-4"
                                    
                                />
                            )}
                           {pricingInfo.discountPercent > 0 && (
                                <div className="absolute top-4 left-4 bg-orange-500 text-white text-sm font-bold px-2 py-1 rounded-sm">
                                    -{pricingInfo.discountPercent}%
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Product Info */}
                <div className="lg:col-span-5 flex flex-col space-y-4">
                    <h1 className="text-2xl font-semibold text-gray-800">{product.Name}</h1>

                    <div className="flex items-center space-x-4">
                        <div className="flex items-center bg-orange-50 px-2 py-1 rounded">
                            <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={16} className="text-orange-400 fill-current" />
                                ))}
                            </div>
                            <span className="ml-2 text-sm text-orange-600">5.0</span>
                        </div>
                        <div className="h-4 w-px bg-gray-300"></div>
                        <span className="text-sm text-gray-600">150 Đánh giá</span>
                        <div className="h-4 w-px bg-gray-300"></div>
                        <span className="text-sm text-gray-600">500 Đã bán</span>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                        {pricingInfo.originalPrice && (
                            <div className="flex items-center">
                                <span className="text-gray-500 line-through mr-2">
                                    {formatPrice(pricingInfo.originalPrice)}
                                </span>
                                <span className="bg-orange-100 text-orange-500 text-sm px-1 rounded">
                                    -{pricingInfo.discountPercent}%
                                </span>
                            </div>
                        )}
                        <p className="text-3xl font-bold text-orange-500">
                            {pricingInfo.finalPrice ? formatPrice(pricingInfo.finalPrice) : 'Vui lòng chọn tùy chọn'}
                        </p>
                    </div>
                    
                    <div className="pt-2 space-y-5">
                        {Object.entries(attributeStructure).map(([attributeName, options]) => (
                            <div key={attributeName} className="flex flex-col space-y-2">
                                <h3 className="text-base font-medium text-gray-800">
                                    {attributeName}:
                                    {selectedOptions[attributeName] && <span className="ml-2 font-normal text-orange-500">{selectedOptions[attributeName]}</span>}
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {options.map(value => {
                                        const isSelected = selectedOptions[attributeName] === value;
                                        // An option is disabled if it's not in the set of currently available options for its attribute
                                        const isDisabled = !availableOptionsAndTheirStatus.available[attributeName]?.has(value);
                                        
                                        return (
                                            <button
                                                key={value}
                                                onClick={() => handleOptionClick(attributeName, value)}
                                                disabled={isDisabled && !isSelected} // Can't click if disabled, unless it's the one that's already selected (to allow deselecting)
                                                className={`px-3 py-1.5 text-sm rounded transition-all
                                                    ${isSelected ? 'bg-orange-500 text-white border-orange-500 shadow-sm' 
                                                                 : 'bg-white text-gray-700 border border-gray-300'}
                                                    ${isDisabled && !isSelected ? 'opacity-50 cursor-not-allowed bg-gray-100' 
                                                                      : 'hover:border-orange-400'}
                                                `}
                                            >
                                                {value}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center space-x-4 pt-2">
                        <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                            <button
                                onClick={() => handleQuantityChange('decrease')}
                                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-l-md"
                                disabled={quantity <= 1 || !selectedVariant || selectedVariant.StockQuantity === 0}
                            >
                                -
                            </button>
                            <input
                                type="number"
                                value={quantity}
                                onChange={(e) => handleQuantityChange('input', e.target.value)}
                                min="1"
                                max={currentMaxQuantityForUI > 0 ? currentMaxQuantityForUI : 1} // Ensure max is at least 1 even if stock is 0 for input type="number" behavior
                                className="w-16 text-center border-l border-r outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                disabled={!selectedVariant||selectedVariant.StockQuantity === 0}
                            />
                            <button
                                onClick={() => handleQuantityChange('increase')}
                                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-r-md"
                                disabled={quantity >= currentMaxQuantityForUI || !selectedVariant || selectedVariant.StockQuantity === 0}
                            >
                                +
                            </button>
                        </div>
                        <span className="text-sm text-gray-500">{pricingInfo.stockText}</span>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button className="flex-1 bg-orange-100 border border-orange-500 text-orange-500 font-medium py-3 px-6 rounded hover:bg-orange-50 transition-colors flex items-center justify-center">
                            <Heart size={20} className="mr-2" />
                            Yêu thích
                        </button>
                        
                        <button
                            onClick={handleAddToCart}
                            className={`w-1/2 rounded-lg py-3 font-bold transition flex items-center justify-center space-x-2
                                ${!canAddToCart
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                            disabled={!canAddToCart}
                        >
                            <ShoppingCart className="h-5 w-5" />
                            <span>{selectedVariant ? 'Thêm vào giỏ' : 'Chọn tùy chọn'}</span>
                        </button>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center">
                                <Truck size={18} className="text-gray-500 mr-2" />
                                <div>
                                    <p className="text-sm font-medium">Miễn phí vận chuyển</p>
                                    <p className="text-xs text-gray-500">Cho đơn hàng từ 100k</p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <RotateCw size={18} className="text-gray-500 mr-2" />
                                <div>
                                    <p className="text-sm font-medium">7 ngày đổi trả</p>
                                    <p className="text-xs text-gray-500">Miễn phí đổi trả</p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <Shield size={18} className="text-gray-500 mr-2" />
                                <div>
                                    <p className="text-sm font-medium">Bảo hành chính hãng</p>
                                    <p className="text-xs text-gray-500">12 tháng</p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <Check size={18} className="text-gray-500 mr-2" />
                                <div>
                                    <p className="text-sm font-medium">Hàng chính hãng</p>
                                    <p className="text-xs text-gray-500">100%</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Related Products */}
            <div className="mt-12">
                <h2 className="text-xl font-semibold mb-6 text-gray-800">Sản phẩm tương tự</h2>
                <RelatedItems currentProductId={productId} />
            </div>
            {/* Product Description and Sidebar */}
            <div className="mt-12 flex flex-col lg:flex-row lg:gap-x-8">
                <div className="w-full lg:flex-1">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h2 className="text-xl font-semibold mb-4 text-gray-800">Mô tả sản phẩm</h2>
                        {descriptionSlot}
                    </div>
                </div>
                <aside className="w-full lg:w-80 flex-shrink-0 mt-8 lg:mt-0">
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        {sidebarSlot}
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default ProductDetail;
