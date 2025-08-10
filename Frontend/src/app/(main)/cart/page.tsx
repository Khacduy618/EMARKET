// src/app/cart/page.tsx
'use client';

import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { fetchCart, updateCartItemQuantity, removeCartItem, updateCartItemVariant, removeMultipleCartItems } from '@/services/cart';
import { getAuthToken, getProductAttributes, getVariantImage } from '@/services/api';
import { Cart, CartItem, AppliedVouchersCombined, AppliedShopVouchers, Voucher} from '@/types'; 
import AttributeSelectionDropdown from '@/app/components/cart/AttributeSelectionDropdown';
import ConfirmModal from '@/app/components/ConfirmModal';
import VoucherSelectModal from '@/app/components/cart/VoucherSelectModal'; // Import modal mới
import { toast } from 'react-toastify';
import axios from 'axios';
import { Loader2, Tag, ShoppingCart, Ticket, ChevronRight, Minus, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import VoucherSelectionModal from '@/app/components/cart/VoucherSelectionModal';
import { fetchAvailableVouchers } from '@/services/voucher';

//format giá
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

// --- Hàm Helper tính toán giảm giá (có thể đặt ở ngoài component) ---
const calculateDiscountForVoucher = (voucher: Voucher, subtotal: number): number => {
    if (!voucher || subtotal < voucher.MinOrderValue) {
        return 0;
    }
    let discount = 0;
    if (voucher.DiscountType === 'FixedAmount') {
        discount = voucher.DiscountValue;
    } else if (voucher.DiscountType === 'Percentage') {
        discount = subtotal * (voucher.DiscountValue / 100);
        console.log(subtotal);
        console.log(voucher.DiscountValue);
        console.log(discount);
        if (voucher.MaxValueForPercentage != null && discount > voucher.MaxValueForPercentage) {
            discount = voucher.MaxValueForPercentage;
        }
        console.log(discount);
    }
    return Math.round(discount);
};

const CartPage: React.FC = () => {
    //khai báo biến
    const [cart, setCart] = useState<Cart | null>(null);
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    const [localError, setLocalError] = useState<string | null>(null);
    const [openDropdownItemId, setOpenDropdownItemId] = useState<number | null>(null);
    const [attributeOptions, setAttributeOptions] = useState<{ [key: string]: any } | null>(null);

    // State for deletion confirmation modal
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
    const [itemToDelete, setItemToDelete] = useState<CartItem | null>(null);

    // State for large quantity confirmation modal
    const [showLargeQuantityConfirm, setShowLargeQuantityConfirm] = useState<boolean>(false);
    const [itemForLargeQuantity, setItemForLargeQuantity] = useState<CartItem | null>(null);

    // NEW: State for voucher selection modal
    const [showVoucherSelectModal, setShowVoucherSelectModal] = useState(false);
    // Thay đổi kiểu dữ liệu để lưu trữ cả FreeShip và SaleOff voucher
    const [appliedVouchers, setAppliedVouchers] = useState<AppliedVouchersCombined>({
        freeShipVoucher: null,
        saleOffVoucher: null,
    }); 

    const [allShopVouchers, setAllShopVouchers] = useState<Voucher[]>([]);

    // State to keep track of selected CartItem IDs
    const [selectedCartItemIds, setSelectedCartItemIds] = useState<Set<number>>(new Set());

    const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState<boolean>(false);

    // Ref for the currently active dropdown button (to prevent closing on button click)
    const currentDropdownButtonRef = useRef<HTMLButtonElement>(null);

    // Map to store refs for each shop checkbox to handle indeterminate state
    const shopCheckboxRefs = useRef<Map<number, HTMLInputElement>>(new Map());

    //newwwwww 
    const [editingItemId, setEditingItemId] = useState<number | null>(null);
    const [variantOptions, setVariantOptions] = useState<any>(null); // Giữ data từ API filter
    const [isSwapping, setIsSwapping] = useState(false); // Loading khi xác nhận

    const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
    const [selectedShopIdForVoucher, setSelectedShopIdForVoucher] = useState<number | null>(null);
    const [appliedShopVouchers, setAppliedShopVouchers] = useState<AppliedShopVouchers>({});

    // thông báo toastr
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
                break;
            default:
                toast.info(message, { autoClose: duration });
        }
    }, []);


    // Refetch cart function (to be called after successful mutations)
    const refreshCart = useCallback(async () => {
        try {
            setLoading(true);
            // const cartData = await fetchCart();
            const [cartData, voucherData] = await Promise.all([
                fetchCart(),
                fetchAvailableVouchers()
            ]);
            setAllShopVouchers(voucherData.shopVouchers || []);
            const hardLimit = 10;
            let notificationsOnLoad: { message: string; type: 'error' | 'warning' }[] = [];

            const processedCartItems = cartData.cartItems.map(item => {
                let currentQuantity = item.Quantity;
                const maxStock = item.productVariant?.StockQuantity || 0;

                if (maxStock === 0) {
                    if (currentQuantity > 0) {
                        notificationsOnLoad.push({
                            message: `Sản phẩm "${item.productVariant?.product?.Name}" hiện đã hết hàng. Số lượng được điều chỉnh về 0.`,
                            type: 'error'
                        });
                    }
                    currentQuantity = 0;
                } else {
                    currentQuantity = Math.max(1, currentQuantity); 

                    const ultimateMax = Math.min(hardLimit, maxStock);
                    
                    if (currentQuantity > ultimateMax) {
                        if (ultimateMax === hardLimit) {
                            notificationsOnLoad.push({
                                message: `Số lượng của sản phẩm "${item.productVariant?.product?.Name}" đã được giới hạn về ${hardLimit} (số lượng tối đa cho phép).`,
                                type: 'warning'
                            });
                        } else {
                            notificationsOnLoad.push({
                                message: `Số lượng của sản phẩm "${item.productVariant?.product?.Name}" đã được giới hạn về ${maxStock} (do tồn kho).`,
                                type: 'warning'
                            });
                        }
                        currentQuantity = ultimateMax;
                    }
                }
                return { ...item, Quantity: currentQuantity };
            });

            const modifiedCartData = { ...cartData, cartItems: processedCartItems };

            setCart(modifiedCartData);

            const uniqueNotifications: { message: string; type: 'error' | 'warning' }[] = [];
            const seenMessages = new Set<string>();

            notificationsOnLoad.forEach(notif => {
                if (!seenMessages.has(notif.message)) {
                    uniqueNotifications.push(notif);
                    seenMessages.add(notif.message);
                }
            });

            uniqueNotifications.forEach((notification, index) => {
                setTimeout(() => {
                    showNotification(notification.message, notification.type, 7000);
                }, 100 * index);
            });

            setSelectedCartItemIds(prev => {
                const newSet = new Set<number>();
                if (modifiedCartData && Array.isArray(modifiedCartData.cartItems)) {
                    modifiedCartData.cartItems.forEach(item => {
                        if (prev.has(item.CartItemID) && item.Quantity > 0) {
                            newSet.add(item.CartItemID);
                        }
                    });
                }
                return newSet;
            });
            setLocalError(null);
            return modifiedCartData;
        } catch (err) {
            console.error('Error fetching cart:', err);
            const errorMessage = (err as any).response?.data?.message || 'Failed to load cart.';
            setLocalError(errorMessage);
            showNotification(errorMessage, 'error');
            return null;
        } finally {
            setLoading(false);
        }
    }, [showNotification]);


    useEffect(() => {
        const authToken = getAuthToken();
        if (!authToken) {
            router.push('/login');
            return;
        }

        refreshCart();
    }, [router, refreshCart]);


    // Handle individual item checkbox changes
    const handleItemCheckboxChange = (cartItemId: number, isChecked: boolean) => {
        setSelectedCartItemIds(prev => {
            const newSet = new Set(prev);
            if (isChecked) {
                newSet.add(cartItemId);
            } else {
                newSet.delete(cartItemId);
            }
            return newSet;
        });
    };

    // Handle "Select All" checkbox change (global)
    const handleSelectAllChange = (isChecked: boolean) => {
        setSelectedCartItemIds(prev => {
            const newSet = new Set<number>();
            if (isChecked && cart && Array.isArray(cart.cartItems)) {
                cart.cartItems.forEach(item => {

                    if (item.Quantity > 0) {
                        newSet.add(item.CartItemID);
                    }

                });
            }
            return newSet;
        });
    };


    // Handle shop-level checkbox change
    const handleShopCheckboxChange = (shopId: number, isChecked: boolean) => {
        setSelectedCartItemIds(prev => {
            const newSet = new Set(prev);
            const itemsInShop = groupedItems[shopId];

            if (itemsInShop) {
                itemsInShop.forEach(item => {
                    if (isChecked && item.Quantity > 0) {

                        newSet.add(item.CartItemID);
                    } else {
                        newSet.delete(item.CartItemID);
                    }
                });
            }
            return newSet;
        });
    };


    // --- Confirmation Modal Handlers (for deletion) ---
    const handleConfirmDelete = async () => {
        if (itemToDelete) {
            try {
                const updatedCart = await removeCartItem(itemToDelete.CartItemID);
                setCart(updatedCart);
                setSelectedCartItemIds(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(itemToDelete.CartItemID);
                    return newSet;
                });
                setLocalError(null);
                showNotification((updatedCart as any).message || 'Sản phẩm đã được xóa khỏi giỏ hàng.', 'success');
            } catch (err: any) {
                console.error('Error removing item:', err);
                const errorMessage = (err as any).response?.data?.message || 'Failed to remove item.';
                setLocalError(errorMessage);
                showNotification(errorMessage, 'error');
            } finally {
                setShowDeleteConfirm(false);
                setItemToDelete(null);
            }
        }
    };

    const handleCancelDelete = () => {
        if (itemToDelete) {
            setCart(prevCart => {
                if (!prevCart) return null;
                const updatedItems = prevCart.cartItems.map(cartItem =>
                    cartItem.CartItemID === itemToDelete.CartItemID
                        ? { ...cartItem }
                        : cartItem
                );
                return { ...prevCart, cartItems: updatedItems };
            });
        }
        setShowDeleteConfirm(false);
        setItemToDelete(null);
        showNotification('Thao tác xóa đã bị hủy. Số lượng sản phẩm đã được đặt lại về 1.', 'warning');
    };
    // --- End Confirmation Modal Handlers (for deletion) ---

    // Handlers for large quantity confirmation modal
    const handleConfirmLargeQuantity = () => {
        setShowLargeQuantityConfirm(false);
        setItemForLargeQuantity(null);
        showNotification("Cảm ơn quý khách đã quan tâm! Vui lòng liên hệ cửa hàng để được hỗ trợ đặt số lượng lớn hơn 10.", 'info');
    };

    const handleCancelLargeQuantity = () => {
        setShowLargeQuantityConfirm(false);
        setItemForLargeQuantity(null);
        showNotification("Số lượng đã được giới hạn về mức tối đa cho phép là 10.", 'info');
    };


    const handleOpenVoucherModal = (shopId: number) => {
        setSelectedShopIdForVoucher(shopId);
        setIsVoucherModalOpen(true);
    };

    // const handleApplyShopVoucher = (voucherCode: string | null) => {
    //     if (selectedShopIdForVoucher) {
    //         setAppliedShopVouchers(prev => ({
    //             ...prev,
    //             [selectedShopIdForVoucher]: voucherCode,
    //         }));
    //     }
    // };
    const handleApplyShopVoucher = (voucher: Voucher | null) => {
        if (selectedShopIdForVoucher) {
            setAppliedShopVouchers(prev => ({
                ...prev,
                [selectedShopIdForVoucher]: voucher,
            }));
        }
    };


    //newwww
    const filterVariantsForEditing = useCallback(async (productId: number, selectedValueIds: number[]) => {
        // KHÔNG setVariantOptions(null) ở đây nữa để tránh nháy
        try {
            const response = await axios.get(`http://localhost/api/products/${productId}/variants/filter?attribute_values=${selectedValueIds.join(',')}`);
            setVariantOptions(response.data.data);
        } catch (error) {
            showNotification('Không thể tải các tùy chọn phân loại.', 'error');
            handleCancelVariantChange(); // Vẫn đóng dropdown nếu có lỗi
        }
    }, []);

    const handleStartVariantChange = useCallback((item: CartItem) => {
        if (editingItemId === item.CartItemID) {
            handleCancelVariantChange();
            return;
        }
        setVariantOptions(null); // CHỈ set null ở đây để lần đầu mở ra có loading
        const initialValueIds = item.productVariant.attributeValues.map(av => av.AttributeValueID);
        setEditingItemId(item.CartItemID);
        filterVariantsForEditing(item.productVariant.ProductID, initialValueIds);
    }, [editingItemId, filterVariantsForEditing]);


    // src/app/cart/page.tsx

    const handleNewOptionSelect = (attributeId: number, attributeValueId: number) => {
        if (!variantOptions || !editingItemId) return;
        
        const currentItem = cart?.cartItems.find(item => item.CartItemID === editingItemId);
        if (!currentItem) return;

        const currentSelections = variantOptions.current_selected_attribute_value_ids;
        const currentAttributeGroup = variantOptions.available_attributes_options.find((g: any) => g.attribute_id === attributeId);
        if (!currentAttributeGroup) return;

        let newSelectedValueIds: number[];

        // --- LOGIC MỚI ĐỂ BỎ CHỌN ---
        // Kiểm tra xem giá trị được click có phải là giá trị đang được chọn trong nhóm đó không
        const isCurrentlySelected = currentAttributeGroup.values.find(
            (v: any) => v.attribute_value_id === attributeValueId
        )?.is_selected;

        if (isCurrentlySelected) {
            // Nếu đúng, hãy BỎ CHỌN nó bằng cách loại bỏ nó khỏi danh sách
            newSelectedValueIds = currentSelections.filter((id: number) => id !== attributeValueId);
        } else {
            // Nếu không, hãy thực hiện logic CHỌN MỚI như cũ
            // 1. Lọc ra các ID từ các nhóm thuộc tính khác
            const otherGroupIds = currentSelections.filter((id: number) => 
                !currentAttributeGroup.values.some((v: any) => v.attribute_value_id === id)
            );
            // 2. Kết hợp các ID cũ với ID mới được chọn
            newSelectedValueIds = [...otherGroupIds, attributeValueId];
        }
        
        // Gọi lại API filter với danh sách ID đã được cập nhật
        filterVariantsForEditing(currentItem.productVariant.ProductID, newSelectedValueIds);
    };

    const handleCancelVariantChange = () => {
        setEditingItemId(null);
        setVariantOptions(null);
    };

    const handleConfirmVariantChange = async () => {
        if (!editingItemId || !variantOptions?.exact_matched_variant) {
            showNotification('Vui lòng chọn đầy đủ phân loại.', 'warning');
            return;
        }
        setIsSwapping(true);
        try {
            const newVariantId = variantOptions.exact_matched_variant.variant_id;
            // Gọi API mới để cập nhật
            console.log(`variantID: ${newVariantId}, cartItemID: ${editingItemId}`);
            const update = await updateCartItemVariant(editingItemId, newVariantId);
            console.log(`${update}`);
            showNotification('Đã cập nhật phân loại sản phẩm!', 'success');
            // Tải lại toàn bộ giỏ hàng để đảm bảo dữ liệu nhất quán
            await refreshCart(); 
            handleCancelVariantChange();
        } catch (error) {
            showNotification('Có lỗi xảy ra khi thay đổi phân loại.', 'error');
        } finally {
            setIsSwapping(false);
        }
    };
    

    // --- Modified handleUpdateQuantity ---
    const handleUpdateQuantity = async (item: CartItem, newQuantityInput: number | string) => {
        let newQuantity = typeof newQuantityInput === 'string' ? parseInt(newQuantityInput) : newQuantityInput;

        if (isNaN(newQuantity)) {
            newQuantity = 0;
        }

        if (newQuantity <= 0) {
            setItemToDelete(item);
            setShowDeleteConfirm(true);
            return;
        }

        const maxStock = item.productVariant?.StockQuantity || 0;
        const hardLimit = 10;
        const originalItemQuantity = item.Quantity;

        let finalQuantity = Math.max(1, newQuantity);

        if (maxStock === 0) {
            finalQuantity = 0;
            if (newQuantity > 0) {
                showNotification("Sản phẩm này hiện đã hết hàng.", 'error');
            }
        } else {
            if (newQuantity > hardLimit && originalItemQuantity <= hardLimit) {
                setItemForLargeQuantity(item);
                setShowLargeQuantityConfirm(true);
                finalQuantity = hardLimit;
            }
            
            const ultimateMax = Math.min(hardLimit, maxStock);
            
            if (finalQuantity > ultimateMax) {
                if (newQuantity > ultimateMax) {
                    if (ultimateMax === hardLimit) {
                        showNotification(`Số lượng tối đa cho phép mỗi mặt hàng là ${hardLimit} sản phẩm.`, 'warning');
                    } else {
                        showNotification(`Số lượng không thể vượt quá tồn kho (${maxStock}).`, 'warning');
                    }
                }
                finalQuantity = ultimateMax;
            }
        }

        if (originalItemQuantity !== finalQuantity) {
            setCart(prevCart => {
                if (!prevCart) return null;
                return {
                    ...prevCart,
                    cartItems: prevCart.cartItems.map(cartItem =>
                        cartItem.CartItemID === item.CartItemID
                            ? { ...cartItem, Quantity: finalQuantity }
                            : cartItem
                    )
                };
            });
        }
        
        if (finalQuantity === originalItemQuantity) {
            return;
        }

        try {
            const updatedCart = await updateCartItemQuantity(item.CartItemID, finalQuantity);
            setCart(updatedCart);
            setLocalError(null);
            showNotification((updatedCart as any).message || 'Số lượng sản phẩm đã được cập nhật.', 'success');
        } catch (err: any) {
            console.error('Error updating quantity:', err);
            let errorMessage = 'Không thể cập nhật số lượng sản phẩm.';
            if (axios.isAxiosError(err) && err.response && err.response.data) {
                errorMessage = err.response.data.message || errorMessage;
                if (err.response.data.available_stock !== undefined) {
                    errorMessage = `Số lượng yêu cầu vượt quá số lượng sản phẩm có sẵn trong kho. Chỉ còn ${err.response.data.available_stock} sản phẩm.`;
                }
            }
            setLocalError(errorMessage);
            showNotification(errorMessage, 'error', 5000);

            setCart(prevCart => {
                if (!prevCart) return null;
                const updatedItems = prevCart.cartItems.map(cartItem =>
                    cartItem.CartItemID === item.CartItemID
                        ? { ...cartItem, Quantity: originalItemQuantity }
                        : cartItem
                );
                return { ...prevCart, cartItems: updatedItems };
            });
        }
    };
    // --- End Modified handleUpdateQuantity ---


    const handleAttributeClick = async (item: CartItem) => {
        if (openDropdownItemId === item.CartItemID) {
            handleCloseDropdown();
            return;
        }

        if (!item.productVariant?.ProductID) {
            console.warn('Product ID is missing');

            showNotification('Không thể lấy thông tin thuộc tính: Thiếu ID sản phẩm.', 'warning');

            return;
        }
        try {
            const responseData = await getProductAttributes(item.productVariant.ProductID);
            const actualAttributes = responseData.attributes;

            const transformedAttributes: {
                [key: string]: { AttributeValueID: number; Value: string; AttributeID: number }[]
            } = {};

            if (actualAttributes && typeof actualAttributes === 'object') {
                for (const attributeName in actualAttributes) {
                    if (actualAttributes.hasOwnProperty(attributeName) && Array.isArray(actualAttributes[attributeName])) {
                        transformedAttributes[attributeName] = actualAttributes[attributeName];
                    }
                }
            }
            setAttributeOptions(transformedAttributes);
            setOpenDropdownItemId(item.CartItemID);

            setLocalError(null);
            if (responseData.message) {
                showNotification(responseData.message, 'success');
            }
        } catch (error: any) {
            console.error('Error fetching attributes:', error);
            const errorMessage = (error as any).response?.data?.message || 'Failed to fetch attributes.';
            setLocalError(errorMessage);
            showNotification(errorMessage, 'error');

        }
    };

    const handleCloseDropdown = () => {
        setOpenDropdownItemId(null);
        setAttributeOptions(null);
    };

    // =======================================================================
    // --- HÀM MỚI: XỬ LÝ SỰ KIỆN CLICK NÚT XÓA HÀNG LOẠT ---
    // =======================================================================
    const handleDeleteSelectedClick = () => {
        if (selectedCartItemIds.size === 0) {
            toast.warn('Vui lòng chọn ít nhất một sản phẩm để xóa.');
            return;
        }
        setShowBulkDeleteConfirm(true); // Mở modal xác nhận
    };

    // --- HÀM MỚI: Xử lý khi xác nhận xóa hàng loạt ---
    const handleConfirmBulkDelete = async () => {
        const idsToDelete = Array.from(selectedCartItemIds);
        if (idsToDelete.length === 0) {
            setShowBulkDeleteConfirm(false);
            return;
        }

        try {
            const updatedCart = await removeMultipleCartItems(idsToDelete);
            setCart(updatedCart);
            setSelectedCartItemIds(new Set()); // Xóa tất cả lựa chọn sau khi xóa thành công
            refreshCart();
            toast.success(`Đã xóa ${idsToDelete.length} sản phẩm khỏi giỏ hàng.`);
        } catch (err: any) {
            console.error('Error removing multiple items:', err);
            toast.error(err.response?.data?.message || 'Xóa sản phẩm thất bại.');
        } finally {
            setShowBulkDeleteConfirm(false);
        }
    };

    // Group items by shop first, as it's needed for shop-level checkboxes and rendering
    const groupedItems = cart && Array.isArray(cart.cartItems)
        ? cart.cartItems.reduce((acc, item) => {
            const shopId = item.ShopID;
            if (!acc[shopId]) {
                acc[shopId] = [];
            }
            acc[shopId].push(item);
            return acc;
        }, {} as Record<number, CartItem[]>)
        : {};
    

    const subtotalByShop = useMemo(() => {
        const subtotals: { [shopId: number]: number } = {};
        if (!cart) return subtotals;

        // Lặp qua các shop đã được nhóm
        for (const shopId in groupedItems) {
            subtotals[shopId] = 0; // Khởi tạo tổng tiền cho shop
            const itemsInShop = groupedItems[shopId];

            itemsInShop.forEach(item => {
                // Chỉ cộng vào tổng nếu item này có trong danh sách đã chọn
                if (selectedCartItemIds.has(item.CartItemID)) {
                    // Sử dụng giá bán thực tế (Price), không phải CompareAtPrice
                    // Vì CompareAtPrice là giá gốc trước khi giảm giá
                    const price = item.productVariant.CompareAtPrice ? Math.floor(item.productVariant?.CompareAtPrice * (1 - item.productVariant?.product.Discount / 100)) : 0 ;
                    subtotals[shopId] += item.Quantity * price;
                }
            });
        }
        return subtotals;
    }, [groupedItems, selectedCartItemIds]); 
    
    
    // Calculate total amount of selected items
    const calculateTotalAmount = () => {
        if (!cart || !Array.isArray(cart.cartItems) || selectedCartItemIds.size === 0) {
            return 0;
        }

        let total = 0;
        let finalprice= 0;
        
        cart.cartItems.forEach(item => {
            if (selectedCartItemIds.has(item.CartItemID)) {
                finalprice = (item.productVariant?.CompareAtPrice || item.productVariant?.Price) * (1 - item.productVariant?.product.Discount / 100);
                // console.log(`price:${price}`);
                total += (Math.floor(finalprice) || 0) * item.Quantity;
            }
        });
        return total;
    };

    //Tính tổn thanh toán đã áp mã voucher
    const calculationResults = useMemo(() => {
        let totalSubtotal = 0;
        let totalShopVoucherDiscount = 0;
        let totalPlatformVoucherDiscount = 0;
        let platformSaleOffDiscount = 0;
        let platformFreeShipDiscount= 0;

        // 1. Tính tổng tiền hàng (totalSubtotal)
        // Object.values(subtotalByShop).forEach(shopSubtotal => {
        //     totalSubtotal += shopSubtotal;
        // });
        totalSubtotal = calculateTotalAmount();
        
        // 2. Tính tổng giảm giá từ VOUCHER CỦA TỪNG SHOP
        for (const shopId in appliedShopVouchers) {
            const voucher = appliedShopVouchers[shopId];
            const shopSubtotal = subtotalByShop[shopId] || 0;
            if (voucher && shopSubtotal > 0) {
                totalShopVoucherDiscount += calculateDiscountForVoucher(voucher, shopSubtotal);
                console.log(totalShopVoucherDiscount);
            }
             platformSaleOffDiscount = (appliedVouchers.saleOffVoucher)
            ? calculateDiscountForVoucher(appliedVouchers.saleOffVoucher, shopSubtotal)
            : 0;

             platformFreeShipDiscount = (appliedVouchers.freeShipVoucher)
            ? calculateDiscountForVoucher(appliedVouchers.freeShipVoucher, shopSubtotal)
            : 0;
            
        }
        
        // 3. Tính giảm giá từ VOUCHER TOÀN SÀN
        // Voucher giảm giá của sàn được tính trên tổng tiền hàng SAU KHI đã áp dụng voucher của shop
        const subtotalAfterShopVouchers = totalSubtotal - totalShopVoucherDiscount;

        if (appliedVouchers.saleOffVoucher && subtotalAfterShopVouchers > 0) {
            totalPlatformVoucherDiscount = calculateDiscountForVoucher(appliedVouchers.saleOffVoucher, subtotalAfterShopVouchers);
            
        }
        // const totalFreeShip = getVoucherDiscountDisplay() ;
        // 4. Xử lý voucher FreeShip
        if (appliedVouchers.freeShipVoucher && subtotalAfterShopVouchers > 0) {
            totalPlatformVoucherDiscount += calculateDiscountForVoucher(appliedVouchers.freeShipVoucher, subtotalAfterShopVouchers); 
            console.log(totalPlatformVoucherDiscount);
        }

        // 5. Tính toán cuối cùng
        const totalDiscount = totalShopVoucherDiscount + totalPlatformVoucherDiscount ;
        const finalTotal = totalSubtotal - totalDiscount;

        return { 
            totalSubtotal, 
            totalDiscount,
            finalTotal: finalTotal > 0 ? finalTotal : 0,
            // --- GIÁ TRỊ MỚI ĐỂ HIỂN THỊ ---
            platformSaleOffDiscount,
            platformFreeShipDiscount,
            totalPlatformDiscount: totalPlatformVoucherDiscount,
            totalShopVoucherDiscount,      // Đảm bảo có giá trị này
            totalPlatformVoucherDiscount,
        };
    }, [subtotalByShop, appliedShopVouchers, appliedVouchers]);


    // Determine the state of the "Select All" checkbox (global)
    const isAllItemsSelected = !!(cart && Array.isArray(cart.cartItems) && cart.cartItems.length > 0 && selectedCartItemIds.size === cart.cartItems.length);
    // Determine the number of selected items to display
    const numberOfSelectedItems = selectedCartItemIds.size;

    // Effect to set indeterminate state for shop checkboxes

    useEffect(() => {
        Object.entries(groupedItems).forEach(([shopIdStr, items]) => {
            const shopId = parseInt(shopIdStr);
            const checkbox = shopCheckboxRefs.current.get(shopId);
            if (checkbox) {

                const itemsWithQuantity = items.filter(item => item.Quantity > 0);
                const selectedCount = itemsWithQuantity.filter(item => selectedCartItemIds.has(item.CartItemID)).length;
                const totalCount = itemsWithQuantity.length;


                const isShopFullySelected = totalCount > 0 && selectedCount === totalCount;
                const isShopPartiallySelected = selectedCount > 0 && selectedCount < totalCount;

                checkbox.checked = isShopFullySelected;
                checkbox.indeterminate = isShopPartiallySelected;
            }
        });
    }, [selectedCartItemIds, groupedItems]);

        // NEW: Hàm xử lý khi bấm nút "Mua Hàng"
    const handleProceedToCheckout = () => {
        if (selectedCartItemIds.size === 0) {
            showNotification("Vui lòng chọn ít nhất một sản phẩm để mua hàng.", 'warning');
            return;
        }

        const selectedItems = cart?.cartItems.filter(item => selectedCartItemIds.has(item.CartItemID)) || [];

        // Lọc ra các voucher của shop đã được áp dụng cho các shop có sản phẩm được chọn
        const appliedShopVouchersForCheckout: AppliedShopVouchers = {};
        const selectedShopIds = new Set(selectedItems.map(item => item.ShopID));
        
        for (const shopId of selectedShopIds) {
            if (appliedShopVouchers[shopId]) {
                appliedShopVouchersForCheckout[shopId] = appliedShopVouchers[shopId];
            }
        }
        
        // Đóng gói tất cả dữ liệu cần thiết
        const checkoutData = {
            selectedItems: selectedItems,
            appliedShopVouchers: appliedShopVouchersForCheckout,
            appliedPlatformVouchers: appliedVouchers, // Voucher toàn sàn
            summary: {
                totalSubtotal: calculationResults.totalSubtotal,
                totalDiscount: calculationResults.totalDiscount,
                finalTotal: calculationResults.finalTotal,
                totalFreeship: calculationResults.platformFreeShipDiscount,
                totalSaleoff: calculationResults.platformSaleOffDiscount,
                totalShopVoucherDiscount: calculationResults.totalShopVoucherDiscount,
                totalPlatformVoucherDiscount: calculationResults.totalPlatformVoucherDiscount,
                
            }
        };
        console.log(checkoutData);
        // Lưu vào localStorage để trang checkout đọc
        localStorage.setItem('checkoutData', JSON.stringify(checkoutData));
        
        // Điều hướng đến trang checkout
        router.push('/checkout');
    };
    

    // NEW: Hàm callback khi voucher được chọn từ modal
    const handleApplyVoucherFromModal = useCallback((vouchers: AppliedVouchersCombined | null) => {
        // Cập nhật state với đối tượng AppliedVouchersCombined
        setAppliedVouchers(vouchers || { freeShipVoucher: null, saleOffVoucher: null });
        setShowVoucherSelectModal(false); // Đóng modal sau khi chọn

        if (vouchers?.freeShipVoucher || vouchers?.saleOffVoucher) {
            let msg = "Đã áp dụng các voucher:";
            if (vouchers.freeShipVoucher) msg += ` FreeShip (${vouchers.freeShipVoucher.Code})`;
            if (vouchers.saleOffVoucher) msg += ` SaleOff (${vouchers.saleOffVoucher.Code})`;
            showNotification(msg, 'success');
            // TODO: Ở đây bạn sẽ cần tính toán lại tổng tiền dựa trên voucher đã áp dụng
            // và cập nhật UI. Đây là một logic phức tạp hơn có thể cần API riêng.
        } else {
            showNotification("Đã hủy bỏ áp dụng voucher.", 'info');
        }
    }, [showNotification]);


    // Tính toán tổng tiền của các sản phẩm ĐƯỢC CHỌN trong giỏ hàng
    // Điều này là cần thiết để truyền vào modal voucher để kiểm tra điều kiện MinOrderValue
    const currentSelectedCartTotal = calculateTotalAmount();



    if (loading) {
        return <div className="flex justify-center items-center h-screen bg-white">
                <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
            </div>;
    }

    if (!cart || !Array.isArray(cart.cartItems) || cart.cartItems.length === 0) {
        return  <div className="text-center py-8 text-gray-500 font-bold">
                <img src={`http://localhost/public/uploads/shopping.png`} alt="" />
                <p>
                    Giỏ hàng của bạn đang trống.
                </p>
                </div>;
    }

    return (
            <div className="container mx-auto px-4">
            {/* Confirmation Modal for Deletion */}
            {showDeleteConfirm && itemToDelete && (
                <ConfirmModal
                    isOpen={showDeleteConfirm}
                    message={`Bạn có chắc chắn muốn xoá sản phẩm "${itemToDelete.productVariant?.product?.Name}" khỏi giỏ hàng?`}
                    onConfirm={handleConfirmDelete}
                    onCancel={handleCancelDelete}
                />
            )}

            {/* Confirmation Modal for Large Quantity */}
            {showLargeQuantityConfirm && itemForLargeQuantity && (
                <ConfirmModal
                    isOpen={showLargeQuantityConfirm}
                    message={`Quý khách muốn đặt số lượng lớn cho sản phẩm "${itemForLargeQuantity.productVariant?.product?.Name}"? Vui lòng liên hệ cửa hàng: ${itemForLargeQuantity.shop?.ShopPhone || 'Chưa có SĐT'}`}
                    onConfirm={handleConfirmLargeQuantity}
                    onCancel={handleCancelLargeQuantity}
                />
            )}

            <ConfirmModal
                isOpen={showBulkDeleteConfirm}
                message={`Bạn có chắc chắn muốn xóa ${selectedCartItemIds.size} sản phẩm đã chọn?`}
                onConfirm={handleConfirmBulkDelete}
                onCancel={() => setShowBulkDeleteConfirm(false)}
            />
            

            {/* NEW: Voucher Selection Modal */}
            <VoucherSelectModal
                isOpen={showVoucherSelectModal}
                onClose={() => setShowVoucherSelectModal(false)}
                onApplyVouchers={handleApplyVoucherFromModal} // Truyền hàm mới
                initialAppliedVouchers={appliedVouchers} // Truyền object voucher đã áp dụng
                currentCartTotal={currentSelectedCartTotal}
            />

            {/* <VoucherSelectionModal
                isOpen={isVoucherModalOpen}
                onClose={() => setIsVoucherModalOpen(false)}
                shopId={selectedShopIdForVoucher}
                // Prop quan trọng: Lấy tổng tiền của shop đang được chọn từ `subtotalByShop`
                selectedItemsSubtotal={selectedShopIdForVoucher ? (subtotalByShop[selectedShopIdForVoucher] || 0) : 0}
                currentAppliedVoucherCode={selectedShopIdForVoucher ? appliedShopVouchers[selectedShopIdForVoucher] : null}
                onApplyVoucher={handleApplyShopVoucher}
            /> */}
            <VoucherSelectionModal
                isOpen={isVoucherModalOpen}
                onClose={() => setIsVoucherModalOpen(false)}
                shopId={selectedShopIdForVoucher}
                selectedItemsSubtotal={selectedShopIdForVoucher ? (subtotalByShop[selectedShopIdForVoucher] || 0) : 0}
                currentAppliedVoucher={selectedShopIdForVoucher ? appliedShopVouchers[selectedShopIdForVoucher] : null} // Sửa ở đây
                onApplyVoucher={handleApplyShopVoucher} // Sửa ở đây
            />

            {/* Persistent error banner (optional, can remove if floating notification is enough) */}
           {localError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <strong className="font-bold">Lỗi!</strong>
                    <span className="block sm:inline"> {localError}</span>
                    <span className="absolute top-0 bottom-0 right-0 px-4 py-3 cursor-pointer" onClick={() => setLocalError(null)}>
                        <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.03a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15L6.252 6.1a1.2 1.2 0 1 1 1.697-1.697l2.758 3.15 2.651-3.03a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.15 2.758 3.15a1.2 1.2 0 0 1 0 1.697z"/></svg>
                    </span>
                </div>
            )}

                {/* Cart Items List */}
                <div className="mb-6">
                    {/* Table Header */}
                    <div className="sticky z-50 top-[120px] bg-white shadow-sm mt-4 mb-4 grid grid-cols-12 rounded-sm text-gray-500 text-xs uppercase px-4 py-4">

                        <div className="col-span-4 flex items-center gap-2">
                            {/* "Select All" checkbox in header */}
                            <input
                                type="checkbox"
                                className="form-checkbox text-red-500 rounded"
                                checked={isAllItemsSelected}
                                onChange={(e) => handleSelectAllChange(e.target.checked)}
                                disabled={cart.cartItems.length === 0}
                            />
                            Sản Phẩm
                        </div>
                        <div className="col-span-2 text-center"></div>
                        <div className="col-span-2 text-center">Đơn Giá</div>
                        <div className="col-span-2 text-center">Số Lượng</div>
                        <div className="col-span-1 text-center">Số Tiền</div>
                        <div className="col-span-1 text-center">Thao Tác</div>
                    </div>

                    {/* Grouped Cart Items */}
                    {Object.entries(groupedItems).map(([shopIdStr, items]) => {
                        const shopId = parseInt(shopIdStr);
                        const shopName = items[0]?.shop?.ShopName;
                        
                        const appliedVoucherForShop = appliedShopVouchers[shopId];
                        const latestShopVouchers = allShopVouchers
                            .filter(v => v.ShopID === shopId)
                            // Giả sử API chưa sắp xếp, chúng ta sắp xếp ở đây
                            .sort((a, b) => new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime())
                            .slice(0, 3);
                            
                        return (
                            <div key={shopId} className="shop-group bg-white rounded-sm shadow-sm last:border-b-0 mb-4">
                                {/* Shop Header */}
                                <div className="flex items-center gap-2 px-4 py-2 border-b border-opacity-50">
                                    <input
                                        type="checkbox"
                                        className="form-checkbox text-red-500 rounded"

                                        ref={el => {
                                            if (el) {
                                                shopCheckboxRefs.current.set(shopId, el);
                                            } else {
                                                shopCheckboxRefs.current.delete(shopId);
                                            }
                                        }}
                                        onChange={(e) => handleShopCheckboxChange(shopId, e.target.checked)}

                                    />
                                    <span className="text-lg text-red-500">🏪</span>
                                    <span className="font-bold text-sm text-gray-800">{shopName || `Shop ID: ${shopId}`}</span>
                                </div>
                                {/* Cart Items for this shop */}
                                {items.map((item: CartItem) => (
                                    
                                    <div
                                        key={item.CartItemID}
                                        // Điều kiện để áp dụng hiệu ứng: chỉ khi item này KHÔNG đang được sửa
                                        className={`group bg-white rounded-sm border border-transparent flex flex-col
                                            ${editingItemId !== item.CartItemID
                                                ? 'hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:border-orange-500'
                                                : ''
                                            }
                                        `}
                                    >
                                        <div className="grid grid-cols-12 items-center px-4 py-3 border-b hover:border-b-0">
                                                {/* Product */}
                                                
                                            <div className="flex items-center gap-3 col-span-4">

                                                <input
                                                    type="checkbox"
                                                    className="form-checkbox text-red-500 rounded"
                                                    checked={!!selectedCartItemIds.has(item.CartItemID)}
                                                    onChange={(e) => handleItemCheckboxChange(item.CartItemID, e.target.checked)}

                                                    disabled={item.Quantity === 0}

                                                />
                                                <Link href={`/productdetail/${item.productVariant.product.ProductID}`} // Sửa lại slug thành ProductID nếu trang chi tiết dùng ID
                                                    key={item.productVariant.VariantID}
                                                    className="flex items-center"
                                                    >
                                                        <div className="w-16 h-16 bg-gray-100 rounded-sm mr-4 flex items-center justify-center text-gray-500 overflow-hidden border">
                                                            {/* <img src={item.productVariant?.ImageURL || '/images/placeholder.png'} alt={item.productVariant?.product?.Name || 'Product Image'} className="object-cover w-full h-full" /> */}
                                                             <img 
                                                                src={getVariantImage(item.productVariant, item.productVariant.product)} 
                                                                alt={item.productVariant?.product?.Name || 'Product Image'}
                                                                className="object-cover w-full h-full"
                                                            />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="font-semibold text-sm text-gray-800">{item.productVariant?.product?.Name}</span>
                                                        </div>
                                                </Link>
                                            </div>
                                                

                                                {/* Attributes/Classification */}
                                            <div className="col-span-2 text-sm text-gray-700 bg-white relative">
                                                {item.productVariant?.attributeValues && item.productVariant.attributeValues.length > 0 ? (
                                                    <div className="flex flex-col">
                                                        <div className="flex items-center gap-1">
                                                            <button
                                                                className="flex flex-col items-start gap-1 p-1 -ml-1 rounded-sm hover:bg-gray-50 w-full"
                                                                onClick={() => handleStartVariantChange(item)}
                                                                        >
                                                                            <span className="text-xs text-gray-500">Phân Loại Hàng:</span>
                                                                <div className="flex items-center text-xs text-gray-600">
                                                                    <span className="truncate">
                                                                        {item.productVariant?.attributeValues?.map(attrValue => attrValue.Value).join(' - ') || 'N/A'}
                                                                    </span>
                                                                    <span className="text-gray-400 ml-1">▼</span>
                                                                </div>
                                                            </button>
                                                        </div>
                                                        {editingItemId === item.CartItemID && (
                                                            <AttributeSelectionDropdown
                                                            optionsData={variantOptions}
                                                            onSelectOption={handleNewOptionSelect}
                                                            onConfirm={handleConfirmVariantChange}
                                                            onCancel={handleCancelVariantChange}
                                                            isConfirming={isSwapping}
                                                        />
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-500">Chọn phân loại</span>
                                                )}
                                            </div>
                                                {/* End Attributes/Classification */}
                                                {/* Newwww */}

                                                {/* <div className="col-span-2 text-sm text-gray-700 relative">
                                                    
                                                {editingItemId === item.CartItemID ? (
                                                    <AttributeSelectionDropdown
                                                        optionsData={variantOptions}
                                                        onSelectOption={handleNewOptionSelect}
                                                        onConfirm={handleConfirmVariantChange}
                                                        onCancel={handleCancelVariantChange}
                                                        isConfirming={isSwapping}
                                                    />
                                                    
                                                    
                                                ) : (
                                                    <button
                                                        className="flex flex-col items-start gap-1 p-1 -ml-1 rounded-sm hover:bg-gray-50 w-full"
                                                        onClick={() => handleStartVariantChange(item)}
                                                    >
                                                        <span className="text-xs text-gray-500">Phân Loại Hàng:</span>
                                                        <div className="flex items-center text-xs text-gray-600">
                                                            <span className="truncate">
                                                                {item.productVariant?.attributeValues?.map(attrValue => attrValue.Value).join(' - ') || 'N/A'}
                                                            </span>
                                                            <span className="text-gray-400 ml-1">▼</span>
                                                        </div>
                                                    </button>
                                                )}
                                            </div> */}

                                            {/* end neww */}
                                            {/* Price */}
                                            <div className="col-span-2 text-sm text-gray-700 text-center">
                                                {item.productVariant?.CompareAtPrice && item.productVariant.CompareAtPrice > item.productVariant.Price ? (
                                                    <div className="flex flex-col items-center">
                                                        {item.productVariant?.product.Discount != 0 ? <span className="line-through text-gray-500 text-xs">{Math.floor(item.productVariant.CompareAtPrice).toLocaleString('vi-VN')}₫</span> : ''}
                                                        <span className="text-red-500 font-semibold">{Math.floor(item.productVariant?.CompareAtPrice * (1 - item.productVariant?.product.Discount / 100)).toLocaleString('vi-VN') || '0'}₫</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center">
                                                    {item.productVariant?.product.Discount != 0 ? <span className="line-through text-gray-500 text-xs">{Math.floor(item.productVariant.Price).toLocaleString('vi-VN')}₫</span> : ''}
                                                        <span className="text-red-500 font-semibold">{Math.floor(item.productVariant?.Price * (1 - item.productVariant?.product.Discount / 100)).toLocaleString('vi-VN') || '0'}₫</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Quantity */}
                                            <div className="col-span-2 flex items-center justify-center">
                                                <div className="flex items-center border rounded-sm w-24">
                                                    <button

                                                        onClick={() => handleUpdateQuantity(item, item.Quantity - 1)}
                                                        className="px-2 py-1 text-gray-600 hover:text-gray-800"
                                                        disabled={item.Quantity <= 0}

                                                    >
                                                        -
                                                    </button>
                                                    <input
                                                        type="text"
                                                        value={item.Quantity}

                                                        onChange={(e) => handleUpdateQuantity(item, e.target.value)}
                                                        className="w-full text-center text-black text-sm border-l border-r outline-none"
                                                        disabled={item.Quantity === 0}
                                                    />
                                                    <button
                                                        onClick={() => handleUpdateQuantity(item, item.Quantity + 1)}
                                                        className="px-2 py-1 text-gray-600 hover:text-gray-800"
                                                        disabled={item.Quantity >= (item.productVariant?.StockQuantity || 0) || item.Quantity >= 10 || item.Quantity === 0}

                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Subtotal */}
                                            <div className="col-span-1 text-red-500 font-semibold text-sm text-center">
                                                {item.productVariant?.CompareAtPrice && item.productVariant.CompareAtPrice > item.productVariant.Price ? (
                                                    <div className="flex flex-col items-center">
                                                        
                                                        <span className="text-red-500 font-semibold">{Math.floor(item.productVariant?.CompareAtPrice * (1 - item.productVariant?.product.Discount / 100) * item.Quantity).toLocaleString('vi-VN') || '0'}₫</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center">
                                                        
                                                        <span className="text-red-500 font-semibold">{Math.floor(item.productVariant?.Price * (1 - item.productVariant?.product.Discount / 100) * item.Quantity).toLocaleString('vi-VN') || '0'}₫</span>
                                                    </div>
                                                    
                                                )}
                                                
                                            </div>

                                            {/* Action */}
                                            <div className="col-span-1 text-center flex flex-col items-center gap-1">
                                                <button

                                                    onClick={() => handleUpdateQuantity(item, 0)} // Trigger delete confirm on clicking 0

                                                    className="text-gray-500 hover:text-red-500 text-sm"
                                                >
                                                    Xóa
                                                </button>
                                                <button className="text-blue-500 hover:underline text-xs">
                                                    Tìm sản phẩm tương tự
                                                </button>
                                            </div>
                                        </div>  
                                    </div>
                                ))}

                                {/* Khuyến mãi tĩnh của Shop - Sửa lại để không báo lỗi */}
                                {latestShopVouchers.length > 0 && (<div className=" p-4 border-b ">
                                    <div className="flex items-center gap-2 text-red-500 text-sm">
                                        <span className="text-lg">🎁</span>
                                        <span>Giảm giá đặc biệt từ {shopName || 'cửa hàng'} chỉ trong hôm nay.</span>
                                         {/* <button className="ms-5 text-blue-500 text-sm hover:underline">Xem thêm voucher</button> */}
                                         <button
                                            onClick={() => handleOpenVoucherModal(shopId)} // GỌI ĐÚNG HÀM
                                            className="ms-5 text-blue-500 text-sm hover:underline flex items-center"
                                            >
                                            {/* <Tag size={14} className="mr-1"/>
                                            {appliedShopVouchers[shopId]
                                                ? `Đã chọn: ${appliedShopVouchers[shopId]}`
                                                : 'Xem Voucher của Shop'
                                            } */}
                                            {appliedVoucherForShop ? (
                                                <div className="flex items-center text-green-600 ">
                                                    <Ticket size={16} className="mr-1.5" />
                                                    <span>
                                                        Giảm -{formatPrice(calculateDiscountForVoucher(appliedVoucherForShop, subtotalByShop[shopId] || 0))}
                                                    </span>
                                                </div>
                                            ) : (
                                                <>
                                                    <Tag size={16} className="mr-1.5" />
                                                    <span>Xem Voucher của Shop</span>
                                                </>
                                            )}
                                            <ChevronRight size={16} className="ml-1" />
                                        </button>
                                    </div>
                                </div>) }
                                { latestShopVouchers.length > 0 && (
                                    <div className="rounded-md p-4 mb-6">
                                        <div className="flex items-center gap-2 text-green-600">
                                            <Ticket size={16} className="text-red-500 mt-0.5 flex-shrink-0"/>
                                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                                {latestShopVouchers.map(voucher => (
                                                    <span key={voucher.VoucherID} className="bg-red-50 text-red-700 px-2 py-0.5 rounded-sm text-xs">
                                                        {voucher.Description || `Giảm giá ${voucher.Code}`}
                                                    </span>
                                                ))}
                                            </div>
                                            <button className="text-blue-500 text-sm hover:underline">Tìm hiểu thêm</button>
                                        </div>
                                        
                                    </div>
                                )}
                                
                            </div>
                        );
                    })}
                    
                </div>

                {/* Sticky Footer for Total */}
                <div className="sticky border-t bottom-0 left-0 right-0 bg-white rounded-sm shadow-md z-10 flex flex-col">

                    {/* Nút "Thêm mã giảm giá" */}
                    <div className="w-full flex flex-row border-b p-2 justify-end">
                        <div className="flex items-center font-semibold"><Ticket className="text-red-500" size={18}/><p className="ms-2 text-black">E-Market Voucher</p></div>
                        {/* <button
                            onClick={() => setShowVoucherSelectModal(true)} // Mở modal khi click
                            className="px-4 py-2 ms-30 text-sky-700 cursor-pointer"
                        >
                            
                            {appliedVouchers.freeShipVoucher?.Code && appliedVouchers.saleOffVoucher?.Code ? 
                                `${appliedVouchers.freeShipVoucher.Code}, ${appliedVouchers.saleOffVoucher.Code}` :
                                appliedVouchers.freeShipVoucher?.Code || appliedVouchers.saleOffVoucher?.Code || 'Chọn hoặc nhập mã'
                            }
                        </button> */}
                        <button
                            onClick={() => setShowVoucherSelectModal(true)}
                            className="text-sm ms-30 flex items-center font-medium "
                        >
                            {calculationResults.totalPlatformDiscount > 0 ? (
                                <div className="flex items-center text-green-600">
                                    <Ticket size={16} className="mr-1.5" />
                                    <span>Giảm -{formatPrice(calculationResults.totalPlatformDiscount)}</span>
                                </div>
                            ) : (
                                <div className="flex items-center  text-blue-600 cursor-pointer">
                                    <Tag size={16} className="mr-1.5" />
                                    <span>Chọn hoặc nhập mã</span>
                                </div>
                            )}
                            <ChevronRight size={16} className="ml-1 text-gray-400" />
                        </button>
                    </div>
                    
                    <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <input
                                type="checkbox"
                                className="form-checkbox text-red-500 rounded"
                                checked={isAllItemsSelected}
                                onChange={(e) => handleSelectAllChange(e.target.checked)}
                                disabled={cart.cartItems.length === 0}
                            />
                            <span className="text-sm text-gray-800">Chọn Tất Cả ({cart.cartItems.length})</span>
                            <button  onClick={handleDeleteSelectedClick}
                                disabled={selectedCartItemIds.size === 0}
                                className="text-gray-600 hover:text-red-500 text-sm disabled:opacity-50">Xóa</button>
                            <button className="text-blue-500 hover:underline text-sm">Lưu vào mục Đã thích</button>
                        </div>
                        <div className="flex flex-col items-end">
                            <div className="flex items-center gap-2 flex-row">
                                {/* <span className="text-sm text-gray-600">Tổng thanh toán ({numberOfSelectedItems}) Sản phẩm:</span>
                                <span className="text-xl text-red-500 font-bold">
                                    ₫{calculateTotalAmount().toLocaleString('vi-VN')}
                                </span> */}
                                <div className="text-gray-600 text-right flex flex-col">
                                    <div className="text-md">Tổng thanh toán ({selectedCartItemIds.size} sản phẩm):</div>
                                    {calculationResults.totalDiscount > 0 && (
                                            <div className="text-green-600">Tiết kiệm:</div>
                                        )}
                                </div>
                                    <div className="flex flex-col">
                                        
                                        <div className="text-black font-bold">
                                        {formatPrice(calculationResults.finalTotal)}
                                    </div>
                                        {calculationResults.totalDiscount > 0 && (
                                        <div className="text-sm font-semibold text-green-600">
                                            -{formatPrice(calculationResults.totalDiscount)}
                                        </div>
                                    )}
                                    </div>
                                    
                                </div>
                            </div>
                            
                            {/* {getVoucherDiscountDisplay()} */}
                            <div className="text-right">
                            
                        </div>
                       <button
                            onClick={handleProceedToCheckout} // Gắn hàm xử lý checkout

                            className={`px-8 py-2 rounded-sm font-semibold text-sm
                                ${numberOfSelectedItems > 0
                                    ? 'bg-red-500 text-white hover:bg-red-600'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50'
                                }`}
                            disabled={numberOfSelectedItems === 0}
                        >
                            Mua Hàng
                        </button>
                    </div>
                </div>
            </div>
    );
};

export default CartPage;