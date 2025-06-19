


// src/app/cart/page.tsx
// 'use client';

// import React, { useEffect, useState, useRef, useCallback } from 'react';
// import { useRouter } from 'next/navigation';
// import { fetchCart, updateCartItemQuantity, removeCartItem } from '@/services/cart';
// import { getProductAttributes } from '@/services/api';
// import { Cart, CartItem, AttributeValue, AppliedVoucher } from '@/types';
// import AttributeSelectionDropdown from '@/app/components/AttributeSelectionDropdown';
// import ConfirmModal from '@/app/components/ConfirmModal';
// import VoucherSelectModal from '@/app/components/VoucherSelectModal'; // Import modal mới
// import { toast } from 'react-toastify';
// import axios from 'axios';
// import { Loader2, Tag } from 'lucide-react';


// const CartPage: React.FC = () => {
//     const [cart, setCart] = useState<Cart | null>(null);
//     const router = useRouter();
//     const [loading, setLoading] = useState(true);
//     const [localError, setLocalError] = useState<string | null>(null);
//     const [openDropdownItemId, setOpenDropdownItemId] = useState<number | null>(null);
//     const [attributeOptions, setAttributeOptions] = useState<{ [key: string]: any } | null>(null);

//     // State for deletion confirmation modal
//     const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
//     const [itemToDelete, setItemToDelete] = useState<CartItem | null>(null);

//     // State for large quantity confirmation modal
//     const [showLargeQuantityConfirm, setShowLargeQuantityConfirm] = useState<boolean>(false);
//     const [itemForLargeQuantity, setItemForLargeQuantity] = useState<CartItem | null>(null);

//     // NEW: State for voucher selection modal
//     const [showVoucherSelectModal, setShowVoucherSelectModal] = useState(false);
//     const [appliedVoucher, setAppliedVoucher] = useState<AppliedVoucher | null>(null); // State để lưu voucher đã chọn

//     // State to keep track of selected CartItem IDs
//     const [selectedCartItemIds, setSelectedCartItemIds] = useState<Set<number>>(new Set());

//     // Ref for the currently active dropdown button (to prevent closing on button click)
//     const currentDropdownButtonRef = useRef<HTMLButtonElement>(null);

//     // Map to store refs for each shop checkbox to handle indeterminate state
//     const shopCheckboxRefs = useRef<Map<number, HTMLInputElement>>(new Map());

//     const showNotification = useCallback((message: string, type: 'success' | 'error' | 'warning' | 'info', duration: number = 3000) => {
//         switch (type) {
//             case 'success':
//                 toast.success(message, { autoClose: duration });
//                 break;
//             case 'error':
//                 toast.error(message, { autoClose: duration });
//                 break;
//             case 'warning':
//                 toast.warn(message, { autoClose: duration });
//                 break;
//             case 'info':
//                 toast.info(message, { autoClose: duration });
//                 break;
//             default:
//                 toast.info(message, { autoClose: duration });
//         }
//     }, []);


//     // Refetch cart function (to be called after successful mutations)
//     const refreshCart = useCallback(async () => {
//         try {
//             setLoading(true);
//             const cartData = await fetchCart();

//             const hardLimit = 10;
//             let notificationsOnLoad: { message: string; type: 'error' | 'warning' }[] = [];

//             const processedCartItems = cartData.cartItems.map(item => {
//                 let currentQuantity = item.Quantity;
//                 const maxStock = item.productVariant?.StockQuantity || 0;

//                 if (maxStock === 0) {
//                     if (currentQuantity > 0) {
//                         notificationsOnLoad.push({
//                             message: `Sản phẩm "${item.productVariant?.product?.Name}" hiện đã hết hàng. Số lượng được điều chỉnh về 0.`,
//                             type: 'error'
//                         });
//                     }
//                     currentQuantity = 0;
//                 } else {
//                     currentQuantity = Math.max(1, currentQuantity); // Ensure minimum 1 if not out of stock

//                     const ultimateMax = Math.min(hardLimit, maxStock);
                    
//                     if (currentQuantity > ultimateMax) {
//                         if (ultimateMax === hardLimit) {
//                             notificationsOnLoad.push({
//                                 message: `Số lượng của sản phẩm "${item.productVariant?.product?.Name}" đã được giới hạn về ${hardLimit} (số lượng tối đa cho phép).`,
//                                 type: 'warning'
//                             });
//                         } else {
//                             notificationsOnLoad.push({
//                                 message: `Số lượng của sản phẩm "${item.productVariant?.product?.Name}" đã được giới hạn về ${maxStock} (do tồn kho).`,
//                                 type: 'warning'
//                             });
//                         }
//                         currentQuantity = ultimateMax;
//                     }
//                 }
//                 return { ...item, Quantity: currentQuantity };
//             });

//             const modifiedCartData = { ...cartData, cartItems: processedCartItems };

//             setCart(modifiedCartData);

//             const uniqueNotifications: { message: string; type: 'error' | 'warning' }[] = [];
//             const seenMessages = new Set<string>();

//             notificationsOnLoad.forEach(notif => {
//                 if (!seenMessages.has(notif.message)) {
//                     uniqueNotifications.push(notif);
//                     seenMessages.add(notif.message);
//                 }
//             });

//             uniqueNotifications.forEach((notification, index) => {
//                 setTimeout(() => {
//                     showNotification(notification.message, notification.type, 7000);
//                 }, 100 * index);
//             });

//             setSelectedCartItemIds(prev => {
//                 const newSet = new Set<number>();
//                 if (modifiedCartData && Array.isArray(modifiedCartData.cartItems)) {
//                     modifiedCartData.cartItems.forEach(item => {
//                         if (prev.has(item.CartItemID) && item.Quantity > 0) {
//                             newSet.add(item.CartItemID);
//                         }
//                     });
//                 }
//                 return newSet;
//             });
//             setLocalError(null);
//             return modifiedCartData;
//         } catch (err) {
//             console.error('Error fetching cart:', err);
//             const errorMessage = (err as any).response?.data?.message || 'Failed to load cart.';
//             setLocalError(errorMessage);
//             showNotification(errorMessage, 'error');
//             return null;
//         } finally {
//             setLoading(false);
//         }
//     }, [showNotification]);

//     useEffect(() => {
//         const authToken = localStorage.getItem('authToken');
//         if (!authToken) {
//             router.push('/login');
//             return;
//         }
//         refreshCart();
//     }, [router, refreshCart]);

//     // Handle individual item checkbox changes
//     const handleItemCheckboxChange = (cartItemId: number, isChecked: boolean) => {
//         setSelectedCartItemIds(prev => {
//             const newSet = new Set(prev);
//             if (isChecked) {
//                 newSet.add(cartItemId);
//             } else {
//                 newSet.delete(cartItemId);
//             }
//             return newSet;
//         });
//     };

//     // Handle "Select All" checkbox change (global)
//     const handleSelectAllChange = (isChecked: boolean) => {
//         setSelectedCartItemIds(prev => {
//             const newSet = new Set<number>();
//             if (isChecked && cart && Array.isArray(cart.cartItems)) {
//                 cart.cartItems.forEach(item => {
//                     if (item.Quantity > 0) {
//                         newSet.add(item.CartItemID);
//                     }
//                 });
//             }
//             return newSet;
//         });
//     };

//     // Handle shop-level checkbox change
//     const handleShopCheckboxChange = (shopId: number, isChecked: boolean) => {
//         setSelectedCartItemIds(prev => {
//             const newSet = new Set(prev);
//             const itemsInShop = groupedItems[shopId];

//             if (itemsInShop) {
//                 itemsInShop.forEach(item => {
//                     if (isChecked && item.Quantity > 0) {
//                         newSet.add(item.CartItemID);
//                     } else {
//                         newSet.delete(item.CartItemID);
//                     }
//                 });
//             }
//             return newSet;
//         });
//     };

//     // --- Confirmation Modal Handlers (for deletion) ---
//     const handleConfirmDelete = async () => {
//         if (itemToDelete) {
//             try {
//                 const updatedCart = await removeCartItem(itemToDelete.CartItemID);
//                 setCart(updatedCart);
//                 setSelectedCartItemIds(prev => {
//                     const newSet = new Set(prev);
//                     newSet.delete(itemToDelete.CartItemID);
//                     return newSet;
//                 });
//                 setLocalError(null);
//                 showNotification((updatedCart as any).message || 'Sản phẩm đã được xóa khỏi giỏ hàng.', 'success');
//             } catch (err: any) {
//                 console.error('Error removing item:', err);
//                 const errorMessage = (err as any).response?.data?.message || 'Failed to remove item.';
//                 setLocalError(errorMessage);
//                 showNotification(errorMessage, 'error');
//             } finally {
//                 setShowDeleteConfirm(false);
//                 setItemToDelete(null);
//             }
//         }
//     };

//     const handleCancelDelete = () => {
//         if (itemToDelete) {
//             setCart(prevCart => {
//                 if (!prevCart) return null;
//                 const updatedItems = prevCart.cartItems.map(cartItem =>
//                     cartItem.CartItemID === itemToDelete.CartItemID
//                         ? { ...cartItem, Quantity: 1 }
//                         : cartItem
//                 );
//                 return { ...prevCart, cartItems: updatedItems };
//             });
//         }
//         setShowDeleteConfirm(false);
//         setItemToDelete(null);
//         showNotification('Thao tác xóa đã bị hủy. Số lượng sản phẩm đã được đặt lại về 1.', 'warning');
//     };
//     // --- End Confirmation Modal Handlers (for deletion) ---

//     // Handlers for large quantity confirmation modal
//     const handleConfirmLargeQuantity = () => {
//         setShowLargeQuantityConfirm(false);
//         setItemForLargeQuantity(null);
//         showNotification("Cảm ơn quý khách đã quan tâm! Vui lòng liên hệ cửa hàng để được hỗ trợ đặt số lượng lớn hơn 10.", 'info');
//     };

//     const handleCancelLargeQuantity = () => {
//         setShowLargeQuantityConfirm(false);
//         setItemForLargeQuantity(null);
//         showNotification("Số lượng đã được giới hạn về mức tối đa cho phép là 10.", 'info');
//     };

//     // --- Modified handleUpdateQuantity ---
//     const handleUpdateQuantity = async (item: CartItem, newQuantityInput: number | string) => {
//         let newQuantity = typeof newQuantityInput === 'string' ? parseInt(newQuantityInput) : newQuantityInput;

//         if (isNaN(newQuantity)) {
//             newQuantity = 0;
//         }

//         if (newQuantity <= 0) {
//             setItemToDelete(item);
//             setShowDeleteConfirm(true);
//             return;
//         }

//         const maxStock = item.productVariant?.StockQuantity || 0;
//         const hardLimit = 10;
//         const originalItemQuantity = item.Quantity;

//         let finalQuantity = Math.max(1, newQuantity);

//         if (maxStock === 0) {
//             finalQuantity = 0;
//             if (newQuantity > 0) {
//                 showNotification("Sản phẩm này hiện đã hết hàng.", 'error');
//             }
//         } else {
//             if (newQuantity > hardLimit && originalItemQuantity <= hardLimit) {
//                 setItemForLargeQuantity(item);
//                 setShowLargeQuantityConfirm(true);
//                 finalQuantity = hardLimit;
//             }
            
//             const ultimateMax = Math.min(hardLimit, maxStock);
            
//             if (finalQuantity > ultimateMax) {
//                 if (newQuantity > ultimateMax) {
//                     if (ultimateMax === hardLimit) {
//                         showNotification(`Số lượng tối đa cho phép mỗi mặt hàng là ${hardLimit} sản phẩm.`, 'warning');
//                     } else {
//                         showNotification(`Số lượng không thể vượt quá tồn kho (${maxStock}).`, 'warning');
//                     }
//                 }
//                 finalQuantity = ultimateMax;
//             }
//         }

//         if (originalItemQuantity !== finalQuantity) {
//             setCart(prevCart => {
//                 if (!prevCart) return null;
//                 return {
//                     ...prevCart,
//                     cartItems: prevCart.cartItems.map(cartItem =>
//                         cartItem.CartItemID === item.CartItemID
//                             ? { ...cartItem, Quantity: finalQuantity }
//                             : cartItem
//                     )
//                 };
//             });
//         }
        
//         if (finalQuantity === originalItemQuantity) {
//             return;
//         }

//         try {
//             const updatedCart = await updateCartItemQuantity(item.CartItemID, finalQuantity);
//             setCart(updatedCart);
//             setLocalError(null);
//             showNotification((updatedCart as any).message || 'Số lượng sản phẩm đã được cập nhật.', 'success');
//         } catch (err: any) {
//             console.error('Error updating quantity:', err);
//             let errorMessage = 'Không thể cập nhật số lượng sản phẩm.';
//             if (axios.isAxiosError(err) && err.response && err.response.data) {
//                 errorMessage = err.response.data.message || errorMessage;
//                 if (err.response.data.available_stock !== undefined) {
//                     errorMessage = `Số lượng yêu cầu vượt quá số lượng sản phẩm có sẵn trong kho. Chỉ còn ${err.response.data.available_stock} sản phẩm.`;
//                 }
//             }
//             setLocalError(errorMessage);
//             showNotification(errorMessage, 'error', 5000);

//             setCart(prevCart => {
//                 if (!prevCart) return null;
//                 const updatedItems = prevCart.cartItems.map(cartItem =>
//                     cartItem.CartItemID === item.CartItemID
//                         ? { ...cartItem, Quantity: originalItemQuantity }
//                         : cartItem
//                 );
//                 return { ...prevCart, cartItems: updatedItems };
//             });
//         }
//     };
//     // --- End Modified handleUpdateQuantity ---


//     const handleRemoveItem = async (cartItemId: number) => {
//         try {
//             const updatedCart = await removeCartItem(cartItemId);
//             setCart(updatedCart);
//             setSelectedCartItemIds(prev => {
//                 const newSet = new Set(prev);
//                 newSet.delete(cartItemId);
//                 return newSet;
//             });
//             setLocalError(null);
//             showNotification((updatedCart as any).message || 'Sản phẩm đã được xóa khỏi giỏ hàng.', 'success');
//         } catch (err: any) {
//             console.error('Error removing item:', err);
//             const errorMessage = (err as any).response?.data?.message || 'Failed to remove item.';
//             setLocalError(errorMessage);
//             showNotification(errorMessage, 'error');
//         }
//     };

//     const handleAttributeClick = async (item: CartItem) => {
//         if (openDropdownItemId === item.CartItemID) {
//             handleCloseDropdown();
//             return;
//         }

//         if (!item.productVariant?.ProductID) {
//             console.warn('Product ID is missing');
//             showNotification('Không thể lấy thông tin thuộc tính: Thiếu ID sản phẩm.', 'warning');
//             return;
//         }
//         try {
//             const responseData = await getProductAttributes(item.productVariant.ProductID);
//             const actualAttributes = responseData.attributes;

//             const transformedAttributes: {
//                 [key: string]: { AttributeValueID: number; Value: string; AttributeID: number }[]
//             } = {};

//             if (actualAttributes && typeof actualAttributes === 'object') {
//                 for (const attributeName in actualAttributes) {
//                     if (actualAttributes.hasOwnProperty(attributeName) && Array.isArray(actualAttributes[attributeName])) {
//                         transformedAttributes[attributeName] = actualAttributes[attributeName];
//                     }
//                 }
//             }
//             setAttributeOptions(transformedAttributes);
//             setOpenDropdownItemId(item.CartItemID);
//             setLocalError(null);
//             if (responseData.message) {
//                 showNotification(responseData.message, 'success');
//             }
//         } catch (error: any) {
//             console.error('Error fetching attributes:', error);
//             const errorMessage = (error as any).response?.data?.message || 'Failed to fetch attributes.';
//             setLocalError(errorMessage);
//             showNotification(errorMessage, 'error');
//         }
//     };

//     const handleCloseDropdown = () => {
//         setOpenDropdownItemId(null);
//         setAttributeOptions(null);
//     };

//     // Group items by shop first, as it's needed for shop-level checkboxes and rendering
//     const groupedItems = cart && Array.isArray(cart.cartItems)
//         ? cart.cartItems.reduce((acc, item) => {
//             const shopId = item.ShopID;
//             if (!acc[shopId]) {
//                 acc[shopId] = [];
//             }
//             acc[shopId].push(item);
//             return acc;
//         }, {} as Record<number, CartItem[]>)
//         : {};

//     // Calculate total amount of selected items
//     const calculateTotalAmount = () => {
//         if (!cart || !Array.isArray(cart.cartItems) || selectedCartItemIds.size === 0) {
//             return 0;
//         }

//         let total = 0;
//         cart.cartItems.forEach(item => {
//             if (selectedCartItemIds.has(item.CartItemID)) {
//                 total += (item.productVariant?.Price || 0) * item.Quantity;
//             }
//         });
//         return total;
//     };

//     // Determine the state of the "Select All" checkbox (global)
//     const isAllItemsSelected = !!(cart && Array.isArray(cart.cartItems) && cart.cartItems.length > 0 && selectedCartItemIds.size === cart.cartItems.length);
//     // Determine the number of selected items to display
//     const numberOfSelectedItems = selectedCartItemIds.size;

//     // Effect to set indeterminate state for shop checkboxes
//     useEffect(() => {
//         Object.entries(groupedItems).forEach(([shopIdStr, items]) => {
//             const shopId = parseInt(shopIdStr);
//             const checkbox = shopCheckboxRefs.current.get(shopId);
//             if (checkbox) {
//                 const itemsWithQuantity = items.filter(item => item.Quantity > 0);
//                 const selectedCount = itemsWithQuantity.filter(item => selectedCartItemIds.has(item.CartItemID)).length;
//                 const totalCount = itemsWithQuantity.length;

//                 const isShopFullySelected = totalCount > 0 && selectedCount === totalCount;
//                 const isShopPartiallySelected = selectedCount > 0 && selectedCount < totalCount;

//                 checkbox.checked = isShopFullySelected;
//                 checkbox.indeterminate = isShopPartiallySelected;
//             }
//         });
//     }, [selectedCartItemIds, groupedItems]);

//     // NEW: Hàm callback khi voucher được chọn từ modal
//     const handleApplyVoucherFromModal = useCallback((voucher: AppliedVoucher | null) => {
//         setAppliedVoucher(voucher);
//         setShowVoucherSelectModal(false); // Đóng modal sau khi chọn
//         if (voucher) {
//             showNotification(`Voucher "${voucher.Code}" đã được áp dụng.`, 'success');
//             // TODO: Ở đây bạn sẽ cần tính toán lại tổng tiền dựa trên voucher đã áp dụng
//             // và cập nhật UI. Đây là một logic phức tạp hơn có thể cần API riêng.
//         } else {
//             showNotification("Bạn đã hủy hoặc không chọn voucher nào.", 'info');
//         }
//     }, [showNotification]);

//     // Tính toán tổng tiền của các sản phẩm ĐƯỢC CHỌN trong giỏ hàng
//     // Điều này là cần thiết để truyền vào modal voucher để kiểm tra điều kiện MinOrderValue
//     const currentSelectedCartTotal = calculateTotalAmount();

//     // Hiển thị tổng giảm giá từ voucher
//     const getVoucherDiscountDisplay = () => {
//         if (!appliedVoucher) return null;

//         let discountText = '';
//         if (appliedVoucher.DiscountType === 'Percentage') {
//             discountText = `${appliedVoucher.DiscountValue}%`;
//             if (appliedVoucher.MaxValueForPercentage && appliedVoucher.MaxValueForPercentage > 0) {
//                 discountText += ` (tối đa ${appliedVoucher.MaxValueForPercentage.toLocaleString('vi-VN')}₫)`;
//             }
//         } else { // FixedAmount
//             discountText = `${appliedVoucher.DiscountValue.toLocaleString('vi-VN')}₫`;
//         }

//         return (
//             <div className="flex justify-between items-center text-sm text-gray-700 mt-2">
//                 <span>Mã giảm giá đã áp dụng ({appliedVoucher.Code}):</span>
//                 <span className="font-semibold text-red-500">- {discountText}</span>
//             </div>
//         );
//     };


//     if (loading) {
//         return <div className="flex justify-center items-center h-screen bg-white">
//                 <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
//             </div>;
//     }

//     if (!cart || !Array.isArray(cart.cartItems) || cart.cartItems.length === 0) {
//         return <div className="text-center py-8 text-gray-600">Giỏ hàng của bạn đang trống.</div>;
//     }

//     return (
//             <div className="container mx-auto px-4">
//             {/* Confirmation Modal for Deletion */}
//             {showDeleteConfirm && itemToDelete && (
//                 <ConfirmModal
//                     isOpen={showDeleteConfirm}
//                     message={`Bạn có chắc chắn muốn xoá sản phẩm "${itemToDelete.productVariant?.product?.Name}" khỏi giỏ hàng?`}
//                     onConfirm={handleConfirmDelete}
//                     onCancel={handleCancelDelete}
//                 />
//             )}

//             {/* Confirmation Modal for Large Quantity */}
//             {showLargeQuantityConfirm && itemForLargeQuantity && (
//                 <ConfirmModal
//                     isOpen={showLargeQuantityConfirm}
//                     message={`Quý khách muốn đặt số lượng lớn cho sản phẩm "${itemForLargeQuantity.productVariant?.product?.Name}"? Vui lòng liên hệ cửa hàng: ${itemForLargeQuantity.shop?.ShopPhone || 'Chưa có SĐT'}`}
//                     onConfirm={handleConfirmLargeQuantity}
//                     onCancel={handleCancelLargeQuantity}
//                 />
//             )}

//             {/* NEW: Voucher Selection Modal */}
//             <VoucherSelectModal
//                 isOpen={showVoucherSelectModal}
//                 onClose={() => setShowVoucherSelectModal(false)}
//                 onApplyVoucher={handleApplyVoucherFromModal}
//                 initialAppliedVoucher={appliedVoucher}
//                 currentCartTotal={currentSelectedCartTotal}
//             />

//             {/* Persistent error banner (optional, can remove if floating notification is enough) */}
//            {localError && (
//                 <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
//                     <strong className="font-bold">Lỗi!</strong>
//                     <span className="block sm:inline"> {localError}</span>
//                     <span className="absolute top-0 bottom-0 right-0 px-4 py-3 cursor-pointer" onClick={() => setLocalError(null)}>
//                         <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.03a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15L6.252 6.1a1.2 1.2 0 1 1 1.697-1.697l2.758 3.15 2.651-3.03a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.15 2.758 3.15a1.2 1.2 0 0 1 0 1.697z"/></svg>
//                     </span>
//                 </div>
//             )}

//                 {/* Cart Items List */}
//                 <div className="mb-6">
//                     {/* Table Header */}
//                     <div className="bg-white shadow-box mt-4 mb-4 grid grid-cols-12 rounded-sm text-gray-500 text-xs uppercase px-4 py-4">
//                         <div className="col-span-4 flex items-center gap-2">
//                             {/* "Select All" checkbox in header */}
//                             <input
//                                 type="checkbox"
//                                 className="form-checkbox text-red-500 rounded"
//                                 checked={isAllItemsSelected}
//                                 onChange={(e) => handleSelectAllChange(e.target.checked)}
//                                 disabled={cart.cartItems.length === 0}
//                             />
//                             Sản Phẩm
//                         </div>
//                         <div className="col-span-2 text-center"></div>
//                         <div className="col-span-2 text-center">Đơn Giá</div>
//                         <div className="col-span-2 text-center">Số Lượng</div>
//                         <div className="col-span-1 text-center">Số Tiền</div>
//                         <div className="col-span-1 text-center">Thao Tác</div>
//                     </div>

//                     {/* Grouped Cart Items */}
//                     {Object.entries(groupedItems).map(([shopIdStr, items]) => {
//                         const shopId = parseInt(shopIdStr);
//                         const shopName = items[0]?.shop?.ShopName;

//                         return (
//                             <div key={shopId} className="shop-group bg-white rounded-sm shadow-sm last:border-b-0 mb-4">
//                                 {/* Shop Header */}
//                                 <div className="flex items-center gap-2 px-4 py-2 border-b border-opacity-50">
//                                     <input
//                                         type="checkbox"
//                                         className="form-checkbox text-red-500 rounded"
//                                         ref={el => {
//                                             if (el) {
//                                                 shopCheckboxRefs.current.set(shopId, el);
//                                             } else {
//                                                 shopCheckboxRefs.current.delete(shopId);
//                                             }
//                                         }}
//                                         onChange={(e) => handleShopCheckboxChange(shopId, e.target.checked)}
//                                     />
//                                     <span className="text-lg text-red-500">🏪</span>
//                                     <span className="font-bold text-sm text-gray-800">{shopName || `Shop ID: ${shopId}`}</span>
//                                 </div>
//                                 {/* Cart Items for this shop */}
//                                 {items.map((item: CartItem) => (
//                                     <div key={item.CartItemID} className="grid grid-cols-12 items-center px-4 py-3 border-b last:border-b-0">
//                                         {/* Product */}
//                                         <div className="col-span-4 flex items-center gap-3">
//                                             <input
//                                                 type="checkbox"
//                                                 className="form-checkbox text-red-500 rounded"
//                                                 checked={!!selectedCartItemIds.has(item.CartItemID)}
//                                                 onChange={(e) => handleItemCheckboxChange(item.CartItemID, e.target.checked)}
//                                                 disabled={item.Quantity === 0}
//                                             />
//                                             <div className="w-16 h-16 bg-gray-100 rounded-sm flex items-center justify-center text-gray-500 overflow-hidden border">
//                                                 <img src={item.productVariant?.ImageURL || '/images/placeholder.png'} alt={item.productVariant?.product?.Name || 'Product Image'} className="object-cover w-full h-full" />
//                                             </div>
//                                             <div className="flex flex-col">
//                                                 <span className="font-semibold text-sm text-gray-800">{item.productVariant?.product?.Name}</span>
//                                             </div>
//                                         </div>

//                                         {/* Attributes/Classification */}
//                                         <div className="col-span-2 text-sm text-gray-700 relative">
//                                             {item.productVariant?.attributeValues && item.productVariant.attributeValues.length > 0 ? (
//                                                 <div className="flex flex-col">
//                                                     <div className="flex items-center gap-1">
//                                                         <button
//                                                             ref={openDropdownItemId === item.CartItemID ? currentDropdownButtonRef : null}
//                                                             className="flex items-center gap-1 px-2 py-1 rounded-sm text-xs text-gray-700 hover:border-red-500"
//                                                             onClick={() => handleAttributeClick(item)}
//                                                         >
//                                                             <div className="flex flex-col items-center">
//                                                                  <div className="w-full"><span className="text-xs text-gray-500">Phân Loại Hàng:</span>
//                                                                  <span className="text-gray-400 text-xs">▼</span></div>
//                                                                  <div className="text-gray-500 text-xs">{item.productVariant?.attributeValues?.map(attrValue => attrValue.Value).join(' - ') || 'Chọn phân loại'}</div>
//                                                             </div>
//                                                         </button>
//                                                     </div>
//                                                     {openDropdownItemId === item.CartItemID && (
//                                                         <AttributeSelectionDropdown
//                                                             productId={item.productVariant?.ProductID || 0}
//                                                             attributeOptions={attributeOptions}
//                                                             onAttributeSelected={() => {}}
//                                                             onClose={handleCloseDropdown}
//                                                             excludedButtonRef={currentDropdownButtonRef}
//                                                         />
//                                                     )}
//                                                 </div>
//                                             ) : (
//                                                 <span className="text-xs text-gray-500">Chọn phân loại</span>
//                                             )}
//                                         </div>
//                                         {/* End Attributes/Classification */}


//                                         {/* Price */}
//                                         <div className="col-span-2 text-sm text-gray-700 text-center">
//                                             {item.productVariant?.CompareAtPrice && item.productVariant.CompareAtPrice > item.productVariant.Price ? (
//                                                 <div className="flex flex-col items-center">
//                                                     <span className="line-through text-gray-500 text-xs">₫{item.productVariant.CompareAtPrice.toLocaleString('vi-VN')}</span>
//                                                     <span className="text-red-500 font-semibold">₫{item.productVariant?.Price?.toLocaleString('vi-VN') || '0'}</span>
//                                                 </div>
//                                             ) : (
//                                                 <span className="text-red-500 font-semibold">₫{item.productVariant?.Price?.toLocaleString('vi-VN') || '0'}</span>
//                                             )}
//                                         </div>

//                                         {/* Quantity */}
//                                         <div className="col-span-2 flex items-center justify-center">
//                                             <div className="flex items-center border rounded-sm w-24">
//                                                 <button
//                                                     onClick={() => handleUpdateQuantity(item, item.Quantity - 1)}
//                                                     className="px-2 py-1 text-gray-600 hover:text-gray-800"
//                                                     disabled={item.Quantity <= 0}
//                                                 >
//                                                     -
//                                                 </button>
//                                                 <input
//                                                     type="text"
//                                                     value={item.Quantity}
//                                                     onChange={(e) => handleUpdateQuantity(item, e.target.value)}
//                                                     className="w-full text-center text-black text-sm border-l border-r outline-none"
//                                                     disabled={item.Quantity === 0}
//                                                 />
//                                                 <button
//                                                     onClick={() => handleUpdateQuantity(item, item.Quantity + 1)}
//                                                     className="px-2 py-1 text-gray-600 hover:text-gray-800"
//                                                     disabled={item.Quantity >= (item.productVariant?.StockQuantity || 0) || item.Quantity >= 10 || item.Quantity === 0}
//                                                 >
//                                                     +
//                                                 </button>
//                                             </div>
//                                         </div>

//                                         {/* Subtotal */}
//                                         <div className="col-span-1 text-red-500 font-semibold text-sm text-center">
//                                             ₫{((item.productVariant?.Price || 0) * item.Quantity).toLocaleString('vi-VN')}
//                                         </div>

//                                         {/* Action */}
//                                         <div className="col-span-1 text-center flex flex-col items-center gap-1">
//                                             <button
//                                                 onClick={() => handleUpdateQuantity(item, 0)} // Trigger delete confirm on clicking 0
//                                                 className="text-gray-500 hover:text-red-500 text-sm"
//                                             >
//                                                 Xóa
//                                             </button>
//                                             <button className="text-blue-500 hover:underline text-xs">
//                                                 Tìm sản phẩm tương tự
//                                             </button>
//                                         </div>
//                                     </div>
//                                 ))}
//                                 {/* Khuyến mãi tĩnh của Shop - Có thể bỏ hoặc sửa tùy ý */}
//                                 <div className="rounded-md p-4 mb-6">
//                                     <div className="flex items-center gap-2 text-red-500 mb-2">
//                                         <span className="text-lg">🎁</span>
//                                         {/* SỬA ĐỔI: Thay thế bằng thông báo tĩnh hoặc dựa trên shopName */}
//                                         <span>Giảm giá đặc biệt từ {shopName || 'cửa hàng'} chỉ trong hôm nay.</span>
//                                     </div>
//                                     <div className="flex items-start">
//                                         <Tag className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
//                                         <span>Tặng kèm ốp lưng và dán màn hình trị giá 300.000đ.</span>
//                                     </div>
//                                     <div className="flex items-start">
//                                         <Tag className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
//                                         <span>Hỗ trợ trả góp 0% qua thẻ tín dụng.</span>
//                                     </div>
//                                     <div className="flex items-center gap-2 text-green-600">
//                                         <span className="text-lg">🚚</span>
//                                         <span>Giảm ₫500.000 phí vận chuyển đơn tối thiểu ₫0</span>
//                                         <button className="text-blue-500 text-sm hover:underline">Tìm hiểu thêm</button>
//                                     </div>
//                                 </div>
//                             </div>
//                         );
//                     })}
//                 </div>

//                 {/* Sticky Footer for Total */}
//                 <div className="sticky bottom-0 left-0 right-0 bg-white shadow-md z-10 flex flex-col">
//                     {/* Nút "Thêm mã giảm giá" */}
//                     <div className="w-full flex flex-row border-b">
//                         <button
//                             onClick={() => setShowVoucherSelectModal(true)} // Mở modal khi click
//                             className="ml-auto px-4 py-2 text-red-500 hover:underline font-semibold"
//                         >
//                             {appliedVoucher ? `Voucher đã áp dụng: ${appliedVoucher.Code}` : 'Thêm mã giảm giá'}
//                         </button>
//                     </div>
                    
//                     <div className="container mx-auto px-4 py-3 flex items-center justify-between">
//                         <div className="flex items-center gap-6">
//                             <input
//                                 type="checkbox"
//                                 className="form-checkbox text-red-500 rounded"
//                                 checked={isAllItemsSelected}
//                                 onChange={(e) => handleSelectAllChange(e.target.checked)}
//                                 disabled={cart.cartItems.length === 0}
//                             />
//                             <span className="text-sm text-gray-800">Chọn Tất Cả ({cart.cartItems.length})</span>
//                             <button className="text-gray-600 hover:text-gray-800 text-sm">Xóa</button>
//                             <button className="text-blue-500 hover:underline text-sm">Lưu vào mục Đã thích</button>
//                         </div>
//                         <div className="flex flex-col items-end">
//                             <div className="flex items-center gap-4">
//                                 <span className="text-sm text-gray-600">Tổng thanh toán ({numberOfSelectedItems}) Sản phẩm:</span>
//                                 <span className="text-xl text-red-500 font-bold">
//                                     ₫{calculateTotalAmount().toLocaleString('vi-VN')}
//                                 </span>
//                             </div>
//                             {getVoucherDiscountDisplay()} {/* Hiển thị thông tin giảm giá nếu có */}
//                         </div>
//                         <button
//                             className={`px-8 py-2 rounded-sm font-semibold text-sm
//                                 ${numberOfSelectedItems > 0
//                                     ? 'bg-red-500 text-white hover:bg-red-600'
//                                     : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50'
//                                 }`}
//                             disabled={numberOfSelectedItems === 0}
//                         >
//                             Mua Hàng
//                         </button>
//                     </div>
//                 </div>
//             </div>
//     );
// };

// export default CartPage;
// 'use client';

// import React, { useEffect, useState, useRef, useCallback } from 'react';
// import { useRouter } from 'next/navigation';
// import { fetchCart, updateCartItemQuantity, removeCartItem } from '@/services/cart';
// import { getProductAttributes } from '@/services/api';
// import { Cart, CartItem, AttributeValue, AppliedVoucher } from '@/types'; // Import AppliedVoucher
// import AttributeSelectionDropdown from '@/app/components/AttributeSelectionDropdown';
// import ConfirmModal from '@/app/components/ConfirmModal';
// import VoucherSelectModal from '@/app/components/VoucherSelectModal'; // Import modal mới
// import { toast } from 'react-toastify';
// import axios from 'axios';
// import { Loader2, Tag } from 'lucide-react'; // Đảm bảo Loader2 và Tag được import


// const CartPage: React.FC = () => {
//     const [cart, setCart] = useState<Cart | null>(null);
//     const router = useRouter();
//     const [loading, setLoading] = useState(true);
//     const [localError, setLocalError] = useState<string | null>(null);
//     const [openDropdownItemId, setOpenDropdownItemId] = useState<number | null>(null);
//     const [attributeOptions, setAttributeOptions] = useState<{ [key: string]: any } | null>(null);

//     // State for deletion confirmation modal
//     const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
//     const [itemToDelete, setItemToDelete] = useState<CartItem | null>(null);

//     // State for large quantity confirmation modal
//     const [showLargeQuantityConfirm, setShowLargeQuantityConfirm] = useState<boolean>(false);
//     const [itemForLargeQuantity, setItemForLargeQuantity] = useState<CartItem | null>(null);

//     // NEW: State for voucher selection modal
//     const [showVoucherSelectModal, setShowVoucherSelectModal] = useState(false);
//     const [appliedVoucher, setAppliedVoucher] = useState<AppliedVoucher | null>(null); // State để lưu voucher đã chọn

//     // State to keep track of selected CartItem IDs
//     const [selectedCartItemIds, setSelectedCartItemIds] = useState<Set<number>>(new Set());

//     // Ref for the currently active dropdown button (to prevent closing on button click)
//     const currentDropdownButtonRef = useRef<HTMLButtonElement>(null);

//     // Map to store refs for each shop checkbox to handle indeterminate state
//     const shopCheckboxRefs = useRef<Map<number, HTMLInputElement>>(new Map());

//     const showNotification = useCallback((message: string, type: 'success' | 'error' | 'warning' | 'info', duration: number = 3000) => {
//         switch (type) {
//             case 'success':
//                 toast.success(message, { autoClose: duration });
//                 break;
//             case 'error':
//                 toast.error(message, { autoClose: duration });
//                 break;
//             case 'warning':
//                 toast.warn(message, { autoClose: duration });
//                 break;
//             case 'info':
//                 toast.info(message, { autoClose: duration });
//                 break;
//             default:
//                 toast.info(message, { autoClose: duration });
//         }
//     }, []);


//     // Refetch cart function (to be called after successful mutations)
//     const refreshCart = useCallback(async () => {
//         try {
//             setLoading(true);
//             const cartData = await fetchCart();

//             const hardLimit = 10;
//             let notificationsOnLoad: { message: string; type: 'error' | 'warning' }[] = [];

//             const processedCartItems = cartData.cartItems.map(item => {
//                 let currentQuantity = item.Quantity;
//                 const maxStock = item.productVariant?.StockQuantity || 0;

//                 if (maxStock === 0) {
//                     if (currentQuantity > 0) {
//                         notificationsOnLoad.push({
//                             message: `Sản phẩm "${item.productVariant?.product?.Name}" hiện đã hết hàng. Số lượng được điều chỉnh về 0.`,
//                             type: 'error'
//                         });
//                     }
//                     currentQuantity = 0;
//                 } else {
//                     currentQuantity = Math.max(1, currentQuantity); // Ensure minimum 1 if not out of stock

//                     const ultimateMax = Math.min(hardLimit, maxStock);
                    
//                     if (currentQuantity > ultimateMax) {
//                         if (ultimateMax === hardLimit) {
//                             notificationsOnLoad.push({
//                                 message: `Số lượng của sản phẩm "${item.productVariant?.product?.Name}" đã được giới hạn về ${hardLimit} (số lượng tối đa cho phép).`,
//                                 type: 'warning'
//                             });
//                         } else {
//                             notificationsOnLoad.push({
//                                 message: `Số lượng của sản phẩm "${item.productVariant?.product?.Name}" đã được giới hạn về ${maxStock} (do tồn kho).`,
//                                 type: 'warning'
//                             });
//                         }
//                         currentQuantity = ultimateMax;
//                     }
//                 }
//                 return { ...item, Quantity: currentQuantity };
//             });

//             const modifiedCartData = { ...cartData, cartItems: processedCartItems };

//             setCart(modifiedCartData);

//             const uniqueNotifications: { message: string; type: 'error' | 'warning' }[] = [];
//             const seenMessages = new Set<string>();

//             notificationsOnLoad.forEach(notif => {
//                 if (!seenMessages.has(notif.message)) {
//                     uniqueNotifications.push(notif);
//                     seenMessages.add(notif.message);
//                 }
//             });

//             uniqueNotifications.forEach((notification, index) => {
//                 setTimeout(() => {
//                     showNotification(notification.message, notification.type, 7000);
//                 }, 100 * index);
//             });

//             setSelectedCartItemIds(prev => {
//                 const newSet = new Set<number>();
//                 if (modifiedCartData && Array.isArray(modifiedCartData.cartItems)) {
//                     modifiedCartData.cartItems.forEach(item => {
//                         if (prev.has(item.CartItemID) && item.Quantity > 0) {
//                             newSet.add(item.CartItemID);
//                         }
//                     });
//                 }
//                 return newSet;
//             });
//             setLocalError(null);
//             return modifiedCartData;
//         } catch (err) {
//             console.error('Error fetching cart:', err);
//             const errorMessage = (err as any).response?.data?.message || 'Failed to load cart.';
//             setLocalError(errorMessage);
//             showNotification(errorMessage, 'error');
//             return null;
//         } finally {
//             setLoading(false);
//         }
//     }, [showNotification]);

//     useEffect(() => {
//         const authToken = localStorage.getItem('authToken');
//         if (!authToken) {
//             router.push('/login');
//             return;
//         }
//         refreshCart();
//     }, [router, refreshCart]);

//     // Handle individual item checkbox changes
//     const handleItemCheckboxChange = (cartItemId: number, isChecked: boolean) => {
//         setSelectedCartItemIds(prev => {
//             const newSet = new Set(prev);
//             if (isChecked) {
//                 newSet.add(cartItemId);
//             } else {
//                 newSet.delete(cartItemId);
//             }
//             return newSet;
//         });
//     };

//     // Handle "Select All" checkbox change (global)
//     const handleSelectAllChange = (isChecked: boolean) => {
//         setSelectedCartItemIds(prev => {
//             const newSet = new Set<number>();
//             if (isChecked && cart && Array.isArray(cart.cartItems)) {
//                 cart.cartItems.forEach(item => {
//                     if (item.Quantity > 0) {
//                         newSet.add(item.CartItemID);
//                     }
//                 });
//             }
//             return newSet;
//         });
//     };

//     // Handle shop-level checkbox change
//     const handleShopCheckboxChange = (shopId: number, isChecked: boolean) => {
//         setSelectedCartItemIds(prev => {
//             const newSet = new Set(prev);
//             const itemsInShop = groupedItems[shopId];

//             if (itemsInShop) {
//                 itemsInShop.forEach(item => {
//                     if (isChecked && item.Quantity > 0) {
//                         newSet.add(item.CartItemID);
//                     } else {
//                         newSet.delete(item.CartItemID);
//                     }
//                 });
//             }
//             return newSet;
//         });
//     };

//     // --- Confirmation Modal Handlers (for deletion) ---
//     const handleConfirmDelete = async () => {
//         if (itemToDelete) {
//             try {
//                 const updatedCart = await removeCartItem(itemToDelete.CartItemID);
//                 setCart(updatedCart);
//                 setSelectedCartItemIds(prev => {
//                     const newSet = new Set(prev);
//                     newSet.delete(itemToDelete.CartItemID);
//                     return newSet;
//                 });
//                 setLocalError(null);
//                 showNotification((updatedCart as any).message || 'Sản phẩm đã được xóa khỏi giỏ hàng.', 'success');
//             } catch (err: any) {
//                 console.error('Error removing item:', err);
//                 const errorMessage = (err as any).response?.data?.message || 'Failed to remove item.';
//                 setLocalError(errorMessage);
//                 showNotification(errorMessage, 'error');
//             } finally {
//                 setShowDeleteConfirm(false);
//                 setItemToDelete(null);
//             }
//         }
//     };

//     const handleCancelDelete = () => {
//         if (itemToDelete) {
//             setCart(prevCart => {
//                 if (!prevCart) return null;
//                 const updatedItems = prevCart.cartItems.map(cartItem =>
//                     cartItem.CartItemID === itemToDelete.CartItemID
//                         ? { ...cartItem, Quantity: 1 }
//                         : cartItem
//                 );
//                 return { ...prevCart, cartItems: updatedItems };
//             });
//         }
//         setShowDeleteConfirm(false);
//         setItemToDelete(null);
//         showNotification('Thao tác xóa đã bị hủy. Số lượng sản phẩm đã được đặt lại về 1.', 'warning');
//     };
//     // --- End Confirmation Modal Handlers (for deletion) ---

//     // Handlers for large quantity confirmation modal
//     const handleConfirmLargeQuantity = () => {
//         setShowLargeQuantityConfirm(false);
//         setItemForLargeQuantity(null);
//         showNotification("Cảm ơn quý khách đã quan tâm! Vui lòng liên hệ cửa hàng để được hỗ trợ đặt số lượng lớn hơn 10.", 'info');
//     };

//     const handleCancelLargeQuantity = () => {
//         setShowLargeQuantityConfirm(false);
//         setItemForLargeQuantity(null);
//         showNotification("Số lượng đã được giới hạn về mức tối đa cho phép là 10.", 'info');
//     };

//     // --- Modified handleUpdateQuantity ---
//     const handleUpdateQuantity = async (item: CartItem, newQuantityInput: number | string) => {
//         let newQuantity = typeof newQuantityInput === 'string' ? parseInt(newQuantityInput) : newQuantityInput;

//         if (isNaN(newQuantity)) {
//             newQuantity = 0;
//         }

//         if (newQuantity <= 0) {
//             setItemToDelete(item);
//             setShowDeleteConfirm(true);
//             return;
//         }

//         const maxStock = item.productVariant?.StockQuantity || 0;
//         const hardLimit = 10;
//         const originalItemQuantity = item.Quantity;

//         let finalQuantity = Math.max(1, newQuantity);

//         if (maxStock === 0) {
//             finalQuantity = 0;
//             if (newQuantity > 0) {
//                 showNotification("Sản phẩm này hiện đã hết hàng.", 'error');
//             }
//         } else {
//             if (newQuantity > hardLimit && originalItemQuantity <= hardLimit) {
//                 setItemForLargeQuantity(item);
//                 setShowLargeQuantityConfirm(true);
//                 finalQuantity = hardLimit;
//             }
            
//             const ultimateMax = Math.min(hardLimit, maxStock);
            
//             if (finalQuantity > ultimateMax) {
//                 if (newQuantity > ultimateMax) {
//                     if (ultimateMax === hardLimit) {
//                         showNotification(`Số lượng tối đa cho phép mỗi mặt hàng là ${hardLimit} sản phẩm.`, 'warning');
//                     } else {
//                         showNotification(`Số lượng không thể vượt quá tồn kho (${maxStock}).`, 'warning');
//                     }
//                 }
//                 finalQuantity = ultimateMax;
//             }
//         }

//         if (originalItemQuantity !== finalQuantity) {
//             setCart(prevCart => {
//                 if (!prevCart) return null;
//                 return {
//                     ...prevCart,
//                     cartItems: prevCart.cartItems.map(cartItem =>
//                         cartItem.CartItemID === item.CartItemID
//                             ? { ...cartItem, Quantity: finalQuantity }
//                             : cartItem
//                     )
//                 };
//             });
//         }
        
//         if (finalQuantity === originalItemQuantity) {
//             return;
//         }

//         try {
//             const updatedCart = await updateCartItemQuantity(item.CartItemID, finalQuantity);
//             setCart(updatedCart);
//             setLocalError(null);
//             showNotification((updatedCart as any).message || 'Số lượng sản phẩm đã được cập nhật.', 'success');
//         } catch (err: any) {
//             console.error('Error updating quantity:', err);
//             let errorMessage = 'Không thể cập nhật số lượng sản phẩm.';
//             if (axios.isAxiosError(err) && err.response && err.response.data) {
//                 errorMessage = err.response.data.message || errorMessage;
//                 if (err.response.data.available_stock !== undefined) {
//                     errorMessage = `Số lượng yêu cầu vượt quá số lượng sản phẩm có sẵn trong kho. Chỉ còn ${err.response.data.available_stock} sản phẩm.`;
//                 }
//             }
//             setLocalError(errorMessage);
//             showNotification(errorMessage, 'error', 5000);

//             setCart(prevCart => {
//                 if (!prevCart) return null;
//                 const updatedItems = prevCart.cartItems.map(cartItem =>
//                     cartItem.CartItemID === item.CartItemID
//                         ? { ...cartItem, Quantity: originalItemQuantity }
//                         : cartItem
//                 );
//                 return { ...prevCart, cartItems: updatedItems };
//             });
//         }
//     };
//     // --- End Modified handleUpdateQuantity ---


//     const handleRemoveItem = async (cartItemId: number) => {
//         try {
//             const updatedCart = await removeCartItem(cartItemId);
//             setCart(updatedCart);
//             setSelectedCartItemIds(prev => {
//                 const newSet = new Set(prev);
//                 newSet.delete(cartItemId);
//                 return newSet;
//             });
//             setLocalError(null);
//             showNotification((updatedCart as any).message || 'Sản phẩm đã được xóa khỏi giỏ hàng.', 'success');
//         } catch (err: any) {
//             console.error('Error removing item:', err);
//             const errorMessage = (err as any).response?.data?.message || 'Failed to remove item.';
//             setLocalError(errorMessage);
//             showNotification(errorMessage, 'error');
//         }
//     };

//     const handleAttributeClick = async (item: CartItem) => {
//         if (openDropdownItemId === item.CartItemID) {
//             handleCloseDropdown();
//             return;
//         }

//         if (!item.productVariant?.ProductID) {
//             console.warn('Product ID is missing');
//             showNotification('Không thể lấy thông tin thuộc tính: Thiếu ID sản phẩm.', 'warning');
//             return;
//         }
//         try {
//             const responseData = await getProductAttributes(item.productVariant.ProductID);
//             const actualAttributes = responseData.attributes;

//             const transformedAttributes: {
//                 [key: string]: { AttributeValueID: number; Value: string; AttributeID: number }[]
//             } = {};

//             if (actualAttributes && typeof actualAttributes === 'object') {
//                 for (const attributeName in actualAttributes) {
//                     if (actualAttributes.hasOwnProperty(attributeName) && Array.isArray(actualAttributes[attributeName])) {
//                         transformedAttributes[attributeName] = actualAttributes[attributeName];
//                     }
//                 }
//             }
//             setAttributeOptions(transformedAttributes);
//             setOpenDropdownItemId(item.CartItemID);
//             setLocalError(null);
//             if (responseData.message) {
//                 showNotification(responseData.message, 'success');
//             }
//         } catch (error: any) {
//             console.error('Error fetching attributes:', error);
//             const errorMessage = (error as any).response?.data?.message || 'Failed to fetch attributes.';
//             setLocalError(errorMessage);
//             showNotification(errorMessage, 'error');
//         }
//     };

//     const handleCloseDropdown = () => {
//         setOpenDropdownItemId(null);
//         setAttributeOptions(null);
//     };

//     // Group items by shop first, as it's needed for shop-level checkboxes and rendering
//     const groupedItems = cart && Array.isArray(cart.cartItems)
//         ? cart.cartItems.reduce((acc, item) => {
//             const shopId = item.ShopID;
//             if (!acc[shopId]) {
//                 acc[shopId] = [];
//             }
//             acc[shopId].push(item);
//             return acc;
//         }, {} as Record<number, CartItem[]>)
//         : {};

//     // Calculate total amount of selected items
//     const calculateTotalAmount = () => {
//         if (!cart || !Array.isArray(cart.cartItems) || selectedCartItemIds.size === 0) {
//             return 0;
//         }

//         let total = 0;
//         cart.cartItems.forEach(item => {
//             if (selectedCartItemIds.has(item.CartItemID)) {
//                 total += (item.productVariant?.Price || 0) * item.Quantity;
//             }
//         });
//         return total;
//     };

//     // Determine the state of the "Select All" checkbox (global)
//     const isAllItemsSelected = !!(cart && Array.isArray(cart.cartItems) && cart.cartItems.length > 0 && selectedCartItemIds.size === cart.cartItems.length);
//     // Determine the number of selected items to display
//     const numberOfSelectedItems = selectedCartItemIds.size;

//     // Effect to set indeterminate state for shop checkboxes
//     useEffect(() => {
//         Object.entries(groupedItems).forEach(([shopIdStr, items]) => {
//             const shopId = parseInt(shopIdStr);
//             const checkbox = shopCheckboxRefs.current.get(shopId);
//             if (checkbox) {
//                 const itemsWithQuantity = items.filter(item => item.Quantity > 0);
//                 const selectedCount = itemsWithQuantity.filter(item => selectedCartItemIds.has(item.CartItemID)).length;
//                 const totalCount = itemsWithQuantity.length;

//                 const isShopFullySelected = totalCount > 0 && selectedCount === totalCount;
//                 const isShopPartiallySelected = selectedCount > 0 && selectedCount < totalCount;

//                 checkbox.checked = isShopFullySelected;
//                 checkbox.indeterminate = isShopPartiallySelected;
//             }
//         });
//     }, [selectedCartItemIds, groupedItems]);

//     // NEW: Hàm callback khi voucher được chọn từ modal
//     const handleApplyVoucherFromModal = useCallback((voucher: AppliedVoucher | null) => {
//         setAppliedVoucher(voucher);
//         setShowVoucherSelectModal(false); // Đóng modal sau khi chọn
//         if (voucher) {
//             showNotification(`Voucher "${voucher.Code}" đã được áp dụng.`, 'success');
//             // TODO: Ở đây bạn sẽ cần tính toán lại tổng tiền dựa trên voucher đã áp dụng
//             // và cập nhật UI. Đây là một logic phức tạp hơn có thể cần API riêng.
//         } else {
//             showNotification("Bạn đã hủy hoặc không chọn voucher nào.", 'info');
//         }
//     }, [showNotification]);

//     // Tính toán tổng tiền của các sản phẩm ĐƯỢC CHỌN trong giỏ hàng
//     // Điều này là cần thiết để truyền vào modal voucher để kiểm tra điều kiện MinOrderValue
//     const currentSelectedCartTotal = calculateTotalAmount();

//     // Hiển thị tổng giảm giá từ voucher
//     const getVoucherDiscountDisplay = () => {
//         if (!appliedVoucher) return null;

//         let discountText = '';
//         if (appliedVoucher.DiscountType === 'Percentage') {
//             discountText = `${appliedVoucher.DiscountValue}%`;
//             if (appliedVoucher.MaxValueForPercentage && appliedVoucher.MaxValueForPercentage > 0) {
//                 discountText += ` (tối đa ${appliedVoucher.MaxValueForPercentage.toLocaleString('vi-VN')}₫)`;
//             }
//         } else { // FixedAmount
//             discountText = `${appliedVoucher.DiscountValue.toLocaleString('vi-VN')}₫`;
//         }

//         return (
//             <div className="flex justify-between items-center text-sm text-gray-700 mt-2">
//                 <span>Mã giảm giá đã áp dụng ({appliedVoucher.Code}):</span>
//                 <span className="font-semibold text-red-500">- {discountText}</span>
//             </div>
//         );
//     };


//     if (loading) {
//         return <div className="flex justify-center items-center h-screen bg-white">
//                 <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
//             </div>;
//     }

//     if (!cart || !Array.isArray(cart.cartItems) || cart.cartItems.length === 0) {
//         return <div className="text-center py-8 text-gray-600">Giỏ hàng của bạn đang trống.</div>;
//     }

//     return (
//             <div className="container mx-auto px-4">
//             {/* Confirmation Modal for Deletion */}
//             {showDeleteConfirm && itemToDelete && (
//                 <ConfirmModal
//                     isOpen={showDeleteConfirm}
//                     message={`Bạn có chắc chắn muốn xoá sản phẩm "${itemToDelete.productVariant?.product?.Name}" khỏi giỏ hàng?`}
//                     onConfirm={handleConfirmDelete}
//                     onCancel={handleCancelDelete}
//                 />
//             )}

//             {/* Confirmation Modal for Large Quantity */}
//             {showLargeQuantityConfirm && itemForLargeQuantity && (
//                 <ConfirmModal
//                     isOpen={showLargeQuantityConfirm}
//                     message={`Quý khách muốn đặt số lượng lớn cho sản phẩm "${itemForLargeQuantity.productVariant?.product?.Name}"? Vui lòng liên hệ cửa hàng: ${itemForLargeQuantity.shop?.ShopPhone || 'Chưa có SĐT'}`}
//                     onConfirm={handleConfirmLargeQuantity}
//                     onCancel={handleCancelLargeQuantity}
//                 />
//             )}

//             {/* NEW: Voucher Selection Modal */}
//             <VoucherSelectModal
//                 isOpen={showVoucherSelectModal}
//                 onClose={() => setShowVoucherSelectModal(false)}
//                 onApplyVoucher={handleApplyVoucherFromModal}
//                 initialAppliedVoucher={appliedVoucher}
//                 currentCartTotal={currentSelectedCartTotal}
//             />

//             {/* Persistent error banner (optional, can remove if floating notification is enough) */}
//            {localError && (
//                 <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
//                     <strong className="font-bold">Lỗi!</strong>
//                     <span className="block sm:inline"> {localError}</span>
//                     <span className="absolute top-0 bottom-0 right-0 px-4 py-3 cursor-pointer" onClick={() => setLocalError(null)}>
//                         <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.03a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15L6.252 6.1a1.2 1.2 0 1 1 1.697-1.697l2.758 3.15 2.651-3.03a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.15 2.758 3.15a1.2 1.2 0 0 1 0 1.697z"/></svg>
//                     </span>
//                 </div>
//             )}

//                 {/* Cart Items List */}
//                 <div className="mb-6">
//                     {/* Table Header */}
//                     <div className="bg-white shadow-box mt-4 mb-4 grid grid-cols-12 rounded-sm text-gray-500 text-xs uppercase px-4 py-4">
//                         <div className="col-span-4 flex items-center gap-2">
//                             {/* "Select All" checkbox in header */}
//                             <input
//                                 type="checkbox"
//                                 className="form-checkbox text-red-500 rounded"
//                                 checked={isAllItemsSelected}
//                                 onChange={(e) => handleSelectAllChange(e.target.checked)}
//                                 disabled={cart.cartItems.length === 0}
//                             />
//                             Sản Phẩm
//                         </div>
//                         <div className="col-span-2 text-center"></div>
//                         <div className="col-span-2 text-center">Đơn Giá</div>
//                         <div className="col-span-2 text-center">Số Lượng</div>
//                         <div className="col-span-1 text-center">Số Tiền</div>
//                         <div className="col-span-1 text-center">Thao Tác</div>
//                     </div>

//                     {/* Grouped Cart Items */}
//                     {Object.entries(groupedItems).map(([shopIdStr, items]) => {
//                         const shopId = parseInt(shopIdStr);
//                         const shopName = items[0]?.shop?.ShopName;

//                         return (
//                             <div key={shopId} className="shop-group bg-white rounded-sm shadow-sm last:border-b-0 mb-4">
//                                 {/* Shop Header */}
//                                 <div className="flex items-center gap-2 px-4 py-2 border-b border-opacity-50">
//                                     <input
//                                         type="checkbox"
//                                         className="form-checkbox text-red-500 rounded"
//                                         ref={el => {
//                                             if (el) {
//                                                 shopCheckboxRefs.current.set(shopId, el);
//                                             } else {
//                                                 shopCheckboxRefs.current.delete(shopId);
//                                             }
//                                         }}
//                                         onChange={(e) => handleShopCheckboxChange(shopId, e.target.checked)}
//                                     />
//                                     <span className="text-lg text-red-500">🏪</span>
//                                     <span className="font-bold text-sm text-gray-800">{shopName || `Shop ID: ${shopId}`}</span>
//                                 </div>
//                                 {/* Cart Items for this shop */}
//                                 {items.map((item: CartItem) => (
//                                     <div key={item.CartItemID} className="grid grid-cols-12 items-center px-4 py-3 border-b last:border-b-0">
//                                         {/* Product */}
//                                         <div className="col-span-4 flex items-center gap-3">
//                                             <input
//                                                 type="checkbox"
//                                                 className="form-checkbox text-red-500 rounded"
//                                                 checked={!!selectedCartItemIds.has(item.CartItemID)}
//                                                 onChange={(e) => handleItemCheckboxChange(item.CartItemID, e.target.checked)}
//                                                 disabled={item.Quantity === 0}
//                                             />
//                                             <div className="w-16 h-16 bg-gray-100 rounded-sm flex items-center justify-center text-gray-500 overflow-hidden border">
//                                                 <img src={item.productVariant?.ImageURL || '/images/placeholder.png'} alt={item.productVariant?.product?.Name || 'Product Image'} className="object-cover w-full h-full" />
//                                             </div>
//                                             <div className="flex flex-col">
//                                                 <span className="font-semibold text-sm text-gray-800">{item.productVariant?.product?.Name}</span>
//                                             </div>
//                                         </div>

//                                         {/* Attributes/Classification */}
//                                         <div className="col-span-2 text-sm text-gray-700 relative">
//                                             {item.productVariant?.attributeValues && item.productVariant.attributeValues.length > 0 ? (
//                                                 <div className="flex flex-col">
//                                                     <div className="flex items-center gap-1">
//                                                         <button
//                                                             ref={openDropdownItemId === item.CartItemID ? currentDropdownButtonRef : null}
//                                                             className="flex items-center gap-1 px-2 py-1 rounded-sm text-xs text-gray-700 hover:border-red-500"
//                                                             onClick={() => handleAttributeClick(item)}
//                                                         >
//                                                             <div className="flex flex-col items-center">
//                                                                  <div className="w-full"><span className="text-xs text-gray-500">Phân Loại Hàng:</span>
//                                                                  <span className="text-gray-400 text-xs">▼</span></div>
//                                                                  <div className="text-gray-500 text-xs">{item.productVariant?.attributeValues?.map(attrValue => attrValue.Value).join(' - ') || 'Chọn phân loại'}</div>
//                                                             </div>
//                                                         </button>
//                                                     </div>
//                                                     {openDropdownItemId === item.CartItemID && (
//                                                         <AttributeSelectionDropdown
//                                                             productId={item.productVariant?.ProductID || 0}
//                                                             attributeOptions={attributeOptions}
//                                                             onAttributeSelected={() => {}}
//                                                             onClose={handleCloseDropdown}
//                                                             excludedButtonRef={currentDropdownButtonRef}
//                                                         />
//                                                     )}
//                                                 </div>
//                                             ) : (
//                                                 <span className="text-xs text-gray-500">Chọn phân loại</span>
//                                             )}
//                                         </div>
//                                         {/* End Attributes/Classification */}


//                                         {/* Price */}
//                                         <div className="col-span-2 text-sm text-gray-700 text-center">
//                                             {item.productVariant?.CompareAtPrice && item.productVariant.CompareAtPrice > item.productVariant.Price ? (
//                                                 <div className="flex flex-col items-center">
//                                                     <span className="line-through text-gray-500 text-xs">₫{item.productVariant.CompareAtPrice.toLocaleString('vi-VN')}</span>
//                                                     <span className="text-red-500 font-semibold">₫{item.productVariant?.Price?.toLocaleString('vi-VN') || '0'}</span>
//                                                 </div>
//                                             ) : (
//                                                 <span className="text-red-500 font-semibold">₫{item.productVariant?.Price?.toLocaleString('vi-VN') || '0'}</span>
//                                             )}
//                                         </div>

//                                         {/* Quantity */}
//                                         <div className="col-span-2 flex items-center justify-center">
//                                             <div className="flex items-center border rounded-sm w-24">
//                                                 <button
//                                                     onClick={() => handleUpdateQuantity(item, item.Quantity - 1)}
//                                                     className="px-2 py-1 text-gray-600 hover:text-gray-800"
//                                                     disabled={item.Quantity <= 0}
//                                                 >
//                                                     -
//                                                 </button>
//                                                 <input
//                                                     type="text"
//                                                     value={item.Quantity}
//                                                     onChange={(e) => handleUpdateQuantity(item, e.target.value)}
//                                                     className="w-full text-center text-black text-sm border-l border-r outline-none"
//                                                     disabled={item.Quantity === 0}
//                                                 />
//                                                 <button
//                                                     onClick={() => handleUpdateQuantity(item, item.Quantity + 1)}
//                                                     className="px-2 py-1 text-gray-600 hover:text-gray-800"
//                                                     disabled={item.Quantity >= (item.productVariant?.StockQuantity || 0) || item.Quantity >= 10 || item.Quantity === 0}
//                                                 >
//                                                     +
//                                                 </button>
//                                             </div>
//                                         </div>

//                                         {/* Subtotal */}
//                                         <div className="col-span-1 text-red-500 font-semibold text-sm text-center">
//                                             ₫{((item.productVariant?.Price || 0) * item.Quantity).toLocaleString('vi-VN')}
//                                         </div>

//                                         {/* Action */}
//                                         <div className="col-span-1 text-center flex flex-col items-center gap-1">
//                                             <button
//                                                 onClick={() => handleUpdateQuantity(item, 0)} // Trigger delete confirm on clicking 0
//                                                 className="text-gray-500 hover:text-red-500 text-sm"
//                                             >
//                                                 Xóa
//                                             </button>
//                                             <button className="text-blue-500 hover:underline text-xs">
//                                                 Tìm sản phẩm tương tự
//                                             </button>
//                                         </div>
//                                     </div>
//                                 ))}
//                                 {/* Khuyến mãi tĩnh của Shop - Sửa lại để không báo lỗi */}
//                                 <div className="rounded-md p-4 mb-6">
//                                     <div className="flex items-center gap-2 text-red-500 mb-2">
//                                         <span className="text-lg">🎁</span>
//                                         <span>Giảm giá đặc biệt từ {shopName || 'cửa hàng'} chỉ trong hôm nay.</span>
//                                     </div>
//                                     <div className="flex items-start">
//                                         <Tag className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
//                                         <span>Tặng kèm ốp lưng và dán màn hình trị giá 300.000đ.</span>
//                                     </div>
//                                     <div className="flex items-start">
//                                         <Tag className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
//                                         <span>Hỗ trợ trả góp 0% qua thẻ tín dụng.</span>
//                                     </div>
//                                     <div className="flex items-center gap-2 text-green-600">
//                                         <span className="text-lg">🚚</span>
//                                         <span>Giảm ₫500.000 phí vận chuyển đơn tối thiểu ₫0</span>
//                                         <button className="text-blue-500 text-sm hover:underline">Tìm hiểu thêm</button>
//                                     </div>
//                                 </div>
//                             </div>
//                         );
//                     })}
//                 </div>

//                 {/* Sticky Footer for Total */}
//                 <div className="sticky bottom-0 left-0 right-0 bg-white shadow-md z-10 flex flex-col">
//                     {/* Nút "Thêm mã giảm giá" */}
//                     <div className="w-full flex flex-row border-b">
//                         <button
//                             onClick={() => setShowVoucherSelectModal(true)} // Mở modal khi click
//                             className="ml-auto px-4 py-2 text-red-500 hover:underline font-semibold"
//                         >
//                             {appliedVoucher ? `Voucher đã áp dụng: ${appliedVoucher.Code}` : 'Thêm mã giảm giá'}
//                         </button>
//                     </div>
                    
//                     <div className="container mx-auto px-4 py-3 flex items-center justify-between">
//                         <div className="flex items-center gap-6">
//                             <input
//                                 type="checkbox"
//                                 className="form-checkbox text-red-500 rounded"
//                                 checked={isAllItemsSelected}
//                                 onChange={(e) => handleSelectAllChange(e.target.checked)}
//                                 disabled={cart.cartItems.length === 0}
//                             />
//                             <span className="text-sm text-gray-800">Chọn Tất Cả ({cart.cartItems.length})</span>
//                             <button className="text-gray-600 hover:text-gray-800 text-sm">Xóa</button>
//                             <button className="text-blue-500 hover:underline text-sm">Lưu vào mục Đã thích</button>
//                         </div>
//                         <div className="flex flex-col items-end">
//                             <div className="flex items-center gap-4">
//                                 <span className="text-sm text-gray-600">Tổng thanh toán ({numberOfSelectedItems}) Sản phẩm:</span>
//                                 <span className="text-xl text-red-500 font-bold">
//                                     ₫{calculateTotalAmount().toLocaleString('vi-VN')}
//                                 </span>
//                             </div>
//                             {getVoucherDiscountDisplay()} {/* Hiển thị thông tin giảm giá nếu có */}
//                         </div>
//                         <button
//                             className={`px-8 py-2 rounded-sm font-semibold text-sm
//                                 ${numberOfSelectedItems > 0
//                                     ? 'bg-red-500 text-white hover:bg-red-600'
//                                     : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50'
//                                 }`}
//                             disabled={numberOfSelectedItems === 0}
//                         >
//                             Mua Hàng
//                         </button>
//                     </div>
//                 </div>
//             </div>
//     );
// };

// export default CartPage;


// src/app/cart/page.tsx
// 'use client';

// import React, { useEffect, useState, useRef, useCallback } from 'react';
// import { useRouter } from 'next/navigation';
// import { fetchCart, updateCartItemQuantity, removeCartItem } from '@/services/cart';
// import { getProductAttributes } from '@/services/api';
// import { Cart, CartItem, AttributeValue, SingleAppliedVoucher, AppliedVouchersCombined } from '@/types'; // Import các interface voucher mới
// import AttributeSelectionDropdown from '@/app/components/AttributeSelectionDropdown';
// import ConfirmModal from '@/app/components/ConfirmModal';
// import VoucherSelectModal from '@/app/components/VoucherSelectModal';
// import { toast } from 'react-toastify';
// import axios from 'axios';
// import { Loader2, Tag } from 'lucide-react';


// const CartPage: React.FC = () => {
//     const [cart, setCart] = useState<Cart | null>(null);
//     const router = useRouter();
//     const [loading, setLoading] = useState(true);
//     const [localError, setLocalError] = useState<string | null>(null);
//     const [openDropdownItemId, setOpenDropdownItemId] = useState<number | null>(null);
//     const [attributeOptions, setAttributeOptions] = useState<{ [key: string]: any } | null>(null);

//     // State for deletion confirmation modal
//     const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
//     const [itemToDelete, setItemToDelete] = useState<CartItem | null>(null);

//     // State for large quantity confirmation modal
//     const [showLargeQuantityConfirm, setShowLargeQuantityConfirm] = useState<boolean>(false);
//     const [itemForLargeQuantity, setItemForLargeQuantity] = useState<CartItem | null>(null);

//     // NEW: State for voucher selection modal
//     const [showVoucherSelectModal, setShowVoucherSelectModal] = useState(false);
//     // Thay đổi kiểu dữ liệu để lưu trữ cả FreeShip và SaleOff voucher
//     const [appliedVouchers, setAppliedVouchers] = useState<AppliedVouchersCombined>({
//         freeShipVoucher: null,
//         saleOffVoucher: null,
//     }); 

//     // State to keep track of selected CartItem IDs
//     const [selectedCartItemIds, setSelectedCartItemIds] = useState<Set<number>>(new Set());

//     // Ref for the currently active dropdown button (to prevent closing on button click)
//     const currentDropdownButtonRef = useRef<HTMLButtonElement>(null);

//     // Map to store refs for each shop checkbox to handle indeterminate state
//     const shopCheckboxRefs = useRef<Map<number, HTMLInputElement>>(new Map());

//     const showNotification = useCallback((message: string, type: 'success' | 'error' | 'warning' | 'info', duration: number = 3000) => {
//         switch (type) {
//             case 'success':
//                 toast.success(message, { autoClose: duration });
//                 break;
//             case 'error':
//                 toast.error(message, { autoClose: duration });
//                 break;
//             case 'warning':
//                 toast.warn(message, { autoClose: duration });
//                 break;
//             case 'info':
//                 toast.info(message, { autoClose: duration });
//                 break;
//             default:
//                 toast.info(message, { autoClose: duration });
//         }
//     }, []);


//     // Refetch cart function (to be called after successful mutations)
//     const refreshCart = useCallback(async () => {
//         try {
//             setLoading(true);
//             const cartData = await fetchCart();

//             const hardLimit = 10;
//             let notificationsOnLoad: { message: string; type: 'error' | 'warning' }[] = [];

//             const processedCartItems = cartData.cartItems.map(item => {
//                 let currentQuantity = item.Quantity;
//                 const maxStock = item.productVariant?.StockQuantity || 0;

//                 if (maxStock === 0) {
//                     if (currentQuantity > 0) {
//                         notificationsOnLoad.push({
//                             message: `Sản phẩm "${item.productVariant?.product?.Name}" hiện đã hết hàng. Số lượng được điều chỉnh về 0.`,
//                             type: 'error'
//                         });
//                     }
//                     currentQuantity = 0;
//                 } else {
//                     currentQuantity = Math.max(1, currentQuantity); // Ensure minimum 1 if not out of stock

//                     const ultimateMax = Math.min(hardLimit, maxStock);
                    
//                     if (currentQuantity > ultimateMax) {
//                         if (ultimateMax === hardLimit) {
//                             notificationsOnLoad.push({
//                                 message: `Số lượng của sản phẩm "${item.productVariant?.product?.Name}" đã được giới hạn về ${hardLimit} (số lượng tối đa cho phép).`,
//                                 type: 'warning'
//                             });
//                         } else {
//                             notificationsOnLoad.push({
//                                 message: `Số lượng của sản phẩm "${item.productVariant?.product?.Name}" đã được giới hạn về ${maxStock} (do tồn kho).`,
//                                 type: 'warning'
//                             });
//                         }
//                         currentQuantity = ultimateMax;
//                     }
//                 }
//                 return { ...item, Quantity: currentQuantity };
//             });

//             const modifiedCartData = { ...cartData, cartItems: processedCartItems };

//             setCart(modifiedCartData);

//             const uniqueNotifications: { message: string; type: 'error' | 'warning' }[] = [];
//             const seenMessages = new Set<string>();

//             notificationsOnLoad.forEach(notif => {
//                 if (!seenMessages.has(notif.message)) {
//                     uniqueNotifications.push(notif);
//                     seenMessages.add(notif.message);
//                 }
//             });

//             uniqueNotifications.forEach((notification, index) => {
//                 setTimeout(() => {
//                     showNotification(notification.message, notification.type, 7000);
//                 }, 100 * index);
//             });

//             setSelectedCartItemIds(prev => {
//                 const newSet = new Set<number>();
//                 if (modifiedCartData && Array.isArray(modifiedCartData.cartItems)) {
//                     modifiedCartData.cartItems.forEach(item => {
//                         if (prev.has(item.CartItemID) && item.Quantity > 0) {
//                             newSet.add(item.CartItemID);
//                         }
//                     });
//                 }
//                 return newSet;
//             });
//             setLocalError(null);
//             return modifiedCartData;
//         } catch (err) {
//             console.error('Error fetching cart:', err);
//             const errorMessage = (err as any).response?.data?.message || 'Failed to load cart.';
//             setLocalError(errorMessage);
//             showNotification(errorMessage, 'error');
//             return null;
//         } finally {
//             setLoading(false);
//         }
//     }, [showNotification]);

//     useEffect(() => {
//         const authToken = localStorage.getItem('authToken');
//         if (!authToken) {
//             router.push('/login');
//             return;
//         }
//         refreshCart();
//     }, [router, refreshCart]);

//     // Handle individual item checkbox changes
//     const handleItemCheckboxChange = (cartItemId: number, isChecked: boolean) => {
//         setSelectedCartItemIds(prev => {
//             const newSet = new Set(prev);
//             if (isChecked) {
//                 newSet.add(cartItemId);
//             } else {
//                 newSet.delete(cartItemId);
//             }
//             return newSet;
//         });
//     };

//     // Handle "Select All" checkbox change (global)
//     const handleSelectAllChange = (isChecked: boolean) => {
//         setSelectedCartItemIds(prev => {
//             const newSet = new Set<number>();
//             if (isChecked && cart && Array.isArray(cart.cartItems)) {
//                 cart.cartItems.forEach(item => {
//                     if (item.Quantity > 0) {
//                         newSet.add(item.CartItemID);
//                     }
//                 });
//             }
//             return newSet;
//         });
//     };

//     // Handle shop-level checkbox change
//     const handleShopCheckboxChange = (shopId: number, isChecked: boolean) => {
//         setSelectedCartItemIds(prev => {
//             const newSet = new Set(prev);
//             const itemsInShop = groupedItems[shopId];

//             if (itemsInShop) {
//                 itemsInShop.forEach(item => {
//                     if (isChecked && item.Quantity > 0) {
//                         newSet.add(item.CartItemID);
//                     } else {
//                         newSet.delete(item.CartItemID);
//                     }
//                 });
//             }
//             return newSet;
//         });
//     };

//     // --- Confirmation Modal Handlers (for deletion) ---
//     const handleConfirmDelete = async () => {
//         if (itemToDelete) {
//             try {
//                 const updatedCart = await removeCartItem(itemToDelete.CartItemID);
//                 setCart(updatedCart);
//                 setSelectedCartItemIds(prev => {
//                     const newSet = new Set(prev);
//                     newSet.delete(itemToDelete.CartItemID);
//                     return newSet;
//                 });
//                 setLocalError(null);
//                 showNotification((updatedCart as any).message || 'Sản phẩm đã được xóa khỏi giỏ hàng.', 'success');
//             } catch (err: any) {
//                 console.error('Error removing item:', err);
//                 const errorMessage = (err as any).response?.data?.message || 'Failed to remove item.';
//                 setLocalError(errorMessage);
//                 showNotification(errorMessage, 'error');
//             } finally {
//                 setShowDeleteConfirm(false);
//                 setItemToDelete(null);
//             }
//         }
//     };

//     const handleCancelDelete = () => {
//         if (itemToDelete) {
//             setCart(prevCart => {
//                 if (!prevCart) return null;
//                 const updatedItems = prevCart.cartItems.map(cartItem =>
//                     cartItem.CartItemID === itemToDelete.CartItemID
//                         ? { ...cartItem, Quantity: 1 }
//                         : cartItem
//                 );
//                 return { ...prevCart, cartItems: updatedItems };
//             });
//         }
//         setShowDeleteConfirm(false);
//         setItemToDelete(null);
//         showNotification('Thao tác xóa đã bị hủy. Số lượng sản phẩm đã được đặt lại về 1.', 'warning');
//     };
//     // --- End Confirmation Modal Handlers (for deletion) ---

//     // Handlers for large quantity confirmation modal
//     const handleConfirmLargeQuantity = () => {
//         setShowLargeQuantityConfirm(false);
//         setItemForLargeQuantity(null);
//         showNotification("Cảm ơn quý khách đã quan tâm! Vui lòng liên hệ cửa hàng để được hỗ trợ đặt số lượng lớn hơn 10.", 'info');
//     };

//     const handleCancelLargeQuantity = () => {
//         setShowLargeQuantityConfirm(false);
//         setItemForLargeQuantity(null);
//         showNotification("Số lượng đã được giới hạn về mức tối đa cho phép là 10.", 'info');
//     };

//     // --- Modified handleUpdateQuantity ---
//     const handleUpdateQuantity = async (item: CartItem, newQuantityInput: number | string) => {
//         let newQuantity = typeof newQuantityInput === 'string' ? parseInt(newQuantityInput) : newQuantityInput;

//         if (isNaN(newQuantity)) {
//             newQuantity = 0;
//         }

//         if (newQuantity <= 0) {
//             setItemToDelete(item);
//             setShowDeleteConfirm(true);
//             return;
//         }

//         const maxStock = item.productVariant?.StockQuantity || 0;
//         const hardLimit = 10;
//         const originalItemQuantity = item.Quantity;

//         let finalQuantity = Math.max(1, newQuantity);

//         if (maxStock === 0) {
//             finalQuantity = 0;
//             if (newQuantity > 0) {
//                 showNotification("Sản phẩm này hiện đã hết hàng.", 'error');
//             }
//         } else {
//             if (newQuantity > hardLimit && originalItemQuantity <= hardLimit) {
//                 setItemForLargeQuantity(item);
//                 setShowLargeQuantityConfirm(true);
//                 finalQuantity = hardLimit;
//             }
            
//             const ultimateMax = Math.min(hardLimit, maxStock);
            
//             if (finalQuantity > ultimateMax) {
//                 if (newQuantity > ultimateMax) {
//                     if (ultimateMax === hardLimit) {
//                         showNotification(`Số lượng tối đa cho phép mỗi mặt hàng là ${hardLimit} sản phẩm.`, 'warning');
//                     } else {
//                         showNotification(`Số lượng không thể vượt quá tồn kho (${maxStock}).`, 'warning');
//                     }
//                 }
//                 finalQuantity = ultimateMax;
//             }
//         }

//         if (originalItemQuantity !== finalQuantity) {
//             setCart(prevCart => {
//                 if (!prevCart) return null;
//                 return {
//                     ...prevCart,
//                     cartItems: prevCart.cartItems.map(cartItem =>
//                         cartItem.CartItemID === item.CartItemID
//                             ? { ...cartItem, Quantity: finalQuantity }
//                             : cartItem
//                     )
//                 };
//             });
//         }
        
//         if (finalQuantity === originalItemQuantity) {
//             return;
//         }

//         try {
//             const updatedCart = await updateCartItemQuantity(item.CartItemID, finalQuantity);
//             setCart(updatedCart);
//             setLocalError(null);
//             showNotification((updatedCart as any).message || 'Số lượng sản phẩm đã được cập nhật.', 'success');
//         } catch (err: any) {
//             console.error('Error updating quantity:', err);
//             let errorMessage = 'Không thể cập nhật số lượng sản phẩm.';
//             if (axios.isAxiosError(err) && err.response && err.response.data) {
//                 errorMessage = err.response.data.message || errorMessage;
//                 if (err.response.data.available_stock !== undefined) {
//                     errorMessage = `Số lượng yêu cầu vượt quá số lượng sản phẩm có sẵn trong kho. Chỉ còn ${err.response.data.available_stock} sản phẩm.`;
//                 }
//             }
//             setLocalError(errorMessage);
//             showNotification(errorMessage, 'error', 5000);

//             setCart(prevCart => {
//                 if (!prevCart) return null;
//                 const updatedItems = prevCart.cartItems.map(cartItem =>
//                     cartItem.CartItemID === item.CartItemID
//                         ? { ...cartItem, Quantity: originalItemQuantity }
//                         : cartItem
//                 );
//                 return { ...prevCart, cartItems: updatedItems };
//             });
//         }
//     };
//     // --- End Modified handleUpdateQuantity ---


//     const handleRemoveItem = async (cartItemId: number) => {
//         try {
//             const updatedCart = await removeCartItem(cartItemId);
//             setCart(updatedCart);
//             setSelectedCartItemIds(prev => {
//                 const newSet = new Set(prev);
//                 newSet.delete(cartItemId);
//                 return newSet;
//             });
//             setLocalError(null);
//             showNotification((updatedCart as any).message || 'Sản phẩm đã được xóa khỏi giỏ hàng.', 'success');
//         } catch (err: any) {
//             console.error('Error removing item:', err);
//             const errorMessage = (err as any).response?.data?.message || 'Failed to remove item.';
//             setLocalError(errorMessage);
//             showNotification(errorMessage, 'error');
//         }
//     };

//     const handleAttributeClick = async (item: CartItem) => {
//         if (openDropdownItemId === item.CartItemID) {
//             handleCloseDropdown();
//             return;
//         }

//         if (!item.productVariant?.ProductID) {
//             console.warn('Product ID is missing');
//             showNotification('Không thể lấy thông tin thuộc tính: Thiếu ID sản phẩm.', 'warning');
//             return;
//         }
//         try {
//             const responseData = await getProductAttributes(item.productVariant.ProductID);
//             const actualAttributes = responseData.attributes;

//             const transformedAttributes: {
//                 [key: string]: { AttributeValueID: number; Value: string; AttributeID: number }[]
//             } = {};

//             if (actualAttributes && typeof actualAttributes === 'object') {
//                 for (const attributeName in actualAttributes) {
//                     if (actualAttributes.hasOwnProperty(attributeName) && Array.isArray(actualAttributes[attributeName])) {
//                         transformedAttributes[attributeName] = actualAttributes[attributeName];
//                     }
//                 }
//             }
//             setAttributeOptions(transformedAttributes);
//             setOpenDropdownItemId(item.CartItemID);
//             setLocalError(null);
//             if (responseData.message) {
//                 showNotification(responseData.message, 'success');
//             }
//         } catch (error: any) {
//             console.error('Error fetching attributes:', error);
//             const errorMessage = (error as any).response?.data?.message || 'Failed to fetch attributes.';
//             setLocalError(errorMessage);
//             showNotification(errorMessage, 'error');
//         }
//     };

//     const handleCloseDropdown = () => {
//         setOpenDropdownItemId(null);
//         setAttributeOptions(null);
//     };

//     // Group items by shop first, as it's needed for shop-level checkboxes and rendering
//     const groupedItems = cart && Array.isArray(cart.cartItems)
//         ? cart.cartItems.reduce((acc, item) => {
//             const shopId = item.ShopID;
//             if (!acc[shopId]) {
//                 acc[shopId] = [];
//             }
//             acc[shopId].push(item);
//             return acc;
//         }, {} as Record<number, CartItem[]>)
//         : {};

//     // Calculate total amount of selected items
//     const calculateTotalAmount = () => {
//         if (!cart || !Array.isArray(cart.cartItems) || selectedCartItemIds.size === 0) {
//             return 0;
//         }

//         let total = 0;
//         cart.cartItems.forEach(item => {
//             if (selectedCartItemIds.has(item.CartItemID)) {
//                 total += (item.productVariant?.Price || 0) * item.Quantity;
//             }
//         });
//         return total;
//     };

//     // Determine the state of the "Select All" checkbox (global)
//     const isAllItemsSelected = !!(cart && Array.isArray(cart.cartItems) && cart.cartItems.length > 0 && selectedCartItemIds.size === cart.cartItems.length);
//     // Determine the number of selected items to display
//     const numberOfSelectedItems = selectedCartItemIds.size;

//     // Effect to set indeterminate state for shop checkboxes
//     useEffect(() => {
//         Object.entries(groupedItems).forEach(([shopIdStr, items]) => {
//             const shopId = parseInt(shopIdStr);
//             const checkbox = shopCheckboxRefs.current.get(shopId);
//             if (checkbox) {
//                 const itemsWithQuantity = items.filter(item => item.Quantity > 0);
//                 const selectedCount = itemsWithQuantity.filter(item => selectedCartItemIds.has(item.CartItemID)).length;
//                 const totalCount = itemsWithQuantity.length;

//                 const isShopFullySelected = totalCount > 0 && selectedCount === totalCount;
//                 const isShopPartiallySelected = selectedCount > 0 && selectedCount < totalCount;

//                 checkbox.checked = isShopFullySelected;
//                 checkbox.indeterminate = isShopPartiallySelected;
//             }
//         });
//     }, [selectedCartItemIds, groupedItems]);

//     // NEW: Hàm callback khi voucher được chọn từ modal
//     const handleApplyVoucherFromModal = useCallback((vouchers: AppliedVouchersCombined | null) => {
//         setAppliedVouchers(vouchers || { freeShipVoucher: null, saleOffVoucher: null }); // Luôn đặt về object nếu null
//         setShowVoucherSelectModal(false); // Đóng modal sau khi chọn
//         if (vouchers?.freeShipVoucher || vouchers?.saleOffVoucher) {
//             let msg = "Đã áp dụng các voucher:";
//             if (vouchers.freeShipVoucher) msg += ` FreeShip (${vouchers.freeShipVoucher.Code})`;
//             if (vouchers.saleOffVoucher) msg += ` SaleOff (${vouchers.saleOffVoucher.Code})`;
//             showNotification(msg, 'success');
//         } else {
//             showNotification("Đã hủy bỏ áp dụng voucher.", 'info');
//         }
//     }, [showNotification]);


//     // Tính toán tổng tiền của các sản phẩm ĐƯỢC CHỌN trong giỏ hàng
//     // Điều này là cần thiết để truyền vào modal voucher để kiểm tra điều kiện MinOrderValue
//     const currentSelectedCartTotal = calculateTotalAmount();

//     // Hiển thị tổng giảm giá từ voucher
//     const getVoucherDiscountDisplay = () => {
//         if (!appliedVouchers.freeShipVoucher && !appliedVouchers.saleOffVoucher) return null;

//         let totalDiscountValue = 0;
//         let discountDetails: string[] = [];

//         // Calculate discount from FreeShip voucher (if applicable)
//         if (appliedVouchers.freeShipVoucher) {
//             const voucher = appliedVouchers.freeShipVoucher;
//             if (voucher.DiscountType === 'FixedAmount') {
//                 totalDiscountValue += voucher.DiscountValue;
//                 discountDetails.push(`FreeShip (${voucher.Code}): -${voucher.DiscountValue.toLocaleString('vi-VN')}₫`);
//             }
//             // For percentage FreeShip, you'd apply it to shipping cost.
//             // For now, let's assume it contributes to total discount visually.
//             // In a real system, FreeShip is usually applied to shipping_fee.
//         }

//         // Calculate discount from SaleOff voucher (if applicable)
//         if (appliedVouchers.saleOffVoucher) {
//             const voucher = appliedVouchers.saleOffVoucher;
//             let currentDiscount = 0;
//             if (voucher.DiscountType === 'FixedAmount') {
//                 currentDiscount = voucher.DiscountValue;
//             } else if (voucher.DiscountType === 'Percentage') {
//                 // Apply percentage to currentSelectedCartTotal
//                 currentDiscount = currentSelectedCartTotal * (voucher.DiscountValue / 100);
//                 if (typeof voucher.MaxValueForPercentage === 'number' && currentDiscount > voucher.MaxValueForPercentage) {
//                     currentDiscount = voucher.MaxValueForPercentage;
//                 }
//             }
//             totalDiscountValue += currentDiscount;
//             discountDetails.push(`Giảm giá (${voucher.Code}): -${Math.round(currentDiscount).toLocaleString('vi-VN')}₫`);
//         }
        
//         return (
//             <div className="flex flex-col items-end text-sm text-gray-700 mt-2">
//                 {discountDetails.map((detail, index) => (
//                     <span key={index} className="font-semibold text-red-500">{detail}</span>
//                 ))}
//                 <span className="font-bold text-red-600">Tổng giảm giá: -{Math.round(totalDiscountValue).toLocaleString('vi-VN')}₫</span>
//             </div>
//         );
//     };


//     if (loading) {
//         return <div className="flex justify-center items-center h-screen bg-white">
//                 <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
//             </div>;
//     }

//     if (!cart || !Array.isArray(cart.cartItems) || cart.cartItems.length === 0) {
//         return <div className="text-center py-8 text-gray-600">Giỏ hàng của bạn đang trống.</div>;
//     }

//     return (
//             <div className="container mx-auto px-4">
//             {/* Confirmation Modal for Deletion */}
//             {showDeleteConfirm && itemToDelete && (
//                 <ConfirmModal
//                     isOpen={showDeleteConfirm}
//                     message={`Bạn có chắc chắn muốn xoá sản phẩm "${itemToDelete.productVariant?.product?.Name}" khỏi giỏ hàng?`}
//                     onConfirm={handleConfirmDelete}
//                     onCancel={handleCancelDelete}
//                 />
//             )}

//             {/* Confirmation Modal for Large Quantity */}
//             {showLargeQuantityConfirm && itemForLargeQuantity && (
//                 <ConfirmModal
//                     isOpen={showLargeQuantityConfirm}
//                     message={`Quý khách muốn đặt số lượng lớn cho sản phẩm "${itemForLargeQuantity.productVariant?.product?.Name}"? Vui lòng liên hệ cửa hàng: ${itemForLargeQuantity.shop?.ShopPhone || 'Chưa có SĐT'}`}
//                     onConfirm={handleConfirmLargeQuantity}
//                     onCancel={handleCancelLargeQuantity}
//                 />
//             )}

//             {/* NEW: Voucher Selection Modal */}
//             <VoucherSelectModal
//                 isOpen={showVoucherSelectModal}
//                 onClose={() => setShowVoucherSelectModal(false)}
//                 onApplyVouchers={handleApplyVoucherFromModal} // Truyền hàm mới
//                 initialAppliedVouchers={appliedVouchers} // Truyền object voucher đã áp dụng
//                 currentCartTotal={currentSelectedCartTotal}
//             />

//             {/* Persistent error banner (optional, can remove if floating notification is enough) */}
//            {localError && (
//                 <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
//                     <strong className="font-bold">Lỗi!</strong>
//                     <span className="block sm:inline"> {localError}</span>
//                     <span className="absolute top-0 bottom-0 right-0 px-4 py-3 cursor-pointer" onClick={() => setLocalError(null)}>
//                         <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.03a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15L6.252 6.1a1.2 1.2 0 1 1 1.697-1.697l2.758 3.15 2.651-3.03a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.15 2.758 3.15a1.2 1.2 0 0 1 0 1.697z"/></svg>
//                     </span>
//                 </div>
//             )}

//                 {/* Cart Items List */}
//                 <div className="mb-6">
//                     {/* Table Header */}
//                     <div className="bg-white shadow-box mt-4 mb-4 grid grid-cols-12 rounded-sm text-gray-500 text-xs uppercase px-4 py-4">
//                         <div className="col-span-4 flex items-center gap-2">
//                             {/* "Select All" checkbox in header */}
//                             <input
//                                 type="checkbox"
//                                 className="form-checkbox text-red-500 rounded"
//                                 checked={isAllItemsSelected}
//                                 onChange={(e) => handleSelectAllChange(e.target.checked)}
//                                 disabled={cart.cartItems.length === 0}
//                             />
//                             Sản Phẩm
//                         </div>
//                         <div className="col-span-2 text-center"></div>
//                         <div className="col-span-2 text-center">Đơn Giá</div>
//                         <div className="col-span-2 text-center">Số Lượng</div>
//                         <div className="col-span-1 text-center">Số Tiền</div>
//                         <div className="col-span-1 text-center">Thao Tác</div>
//                     </div>

//                     {/* Grouped Cart Items */}
//                     {Object.entries(groupedItems).map(([shopIdStr, items]) => {
//                         const shopId = parseInt(shopIdStr);
//                         const shopName = items[0]?.shop?.ShopName;

//                         return (
//                             <div key={shopId} className="shop-group bg-white rounded-sm shadow-sm last:border-b-0 mb-4">
//                                 {/* Shop Header */}
//                                 <div className="flex items-center gap-2 px-4 py-2 border-b border-opacity-50">
//                                     <input
//                                         type="checkbox"
//                                         className="form-checkbox text-red-500 rounded"
//                                         ref={el => {
//                                             if (el) {
//                                                 shopCheckboxRefs.current.set(shopId, el);
//                                             } else {
//                                                 shopCheckboxRefs.current.delete(shopId);
//                                             }
//                                         }}
//                                         onChange={(e) => handleShopCheckboxChange(shopId, e.target.checked)}
//                                     />
//                                     <span className="text-lg text-red-500">🏪</span>
//                                     <span className="font-bold text-sm text-gray-800">{shopName || `Shop ID: ${shopId}`}</span>
//                                 </div>
//                                 {/* Cart Items for this shop */}
//                                 {items.map((item: CartItem) => (
//                                     <div key={item.CartItemID} className="grid grid-cols-12 items-center px-4 py-3 border-b last:border-b-0">
//                                         {/* Product */}
//                                         <div className="col-span-4 flex items-center gap-3">
//                                             <input
//                                                 type="checkbox"
//                                                 className="form-checkbox text-red-500 rounded"
//                                                 checked={!!selectedCartItemIds.has(item.CartItemID)}
//                                                 onChange={(e) => handleItemCheckboxChange(item.CartItemID, e.target.checked)}
//                                                 disabled={item.Quantity === 0}
//                                             />
//                                             <div className="w-16 h-16 bg-gray-100 rounded-sm flex items-center justify-center text-gray-500 overflow-hidden border">
//                                                 <img src={item.productVariant?.ImageURL || '/images/placeholder.png'} alt={item.productVariant?.product?.Name || 'Product Image'} className="object-cover w-full h-full" />
//                                             </div>
//                                             <div className="flex flex-col">
//                                                 <span className="font-semibold text-sm text-gray-800">{item.productVariant?.product?.Name}</span>
//                                             </div>
//                                         </div>

//                                         {/* Attributes/Classification */}
//                                         <div className="col-span-2 text-sm text-gray-700 relative">
//                                             {item.productVariant?.attributeValues && item.productVariant.attributeValues.length > 0 ? (
//                                                 <div className="flex flex-col">
//                                                     <div className="flex items-center gap-1">
//                                                         <button
//                                                             ref={openDropdownItemId === item.CartItemID ? currentDropdownButtonRef : null}
//                                                             className="flex items-center gap-1 px-2 py-1 rounded-sm text-xs text-gray-700 hover:border-red-500"
//                                                             onClick={() => handleAttributeClick(item)}
//                                                         >
//                                                             <div className="flex flex-col items-center">
//                                                                  <div className="w-full"><span className="text-xs text-gray-500">Phân Loại Hàng:</span>
//                                                                  <span className="text-gray-400 text-xs">▼</span></div>
//                                                                  <div className="text-gray-500 text-xs">{item.productVariant?.attributeValues?.map(attrValue => attrValue.Value).join(' - ') || 'Chọn phân loại'}</div>
//                                                             </div>
//                                                         </button>
//                                                     </div>
//                                                     {openDropdownItemId === item.CartItemID && (
//                                                         <AttributeSelectionDropdown
//                                                             productId={item.productVariant?.ProductID || 0}
//                                                             attributeOptions={attributeOptions}
//                                                             onAttributeSelected={() => {}}
//                                                             onClose={handleCloseDropdown}
//                                                             excludedButtonRef={currentDropdownButtonRef}
//                                                         />
//                                                     )}
//                                                 </div>
//                                             ) : (
//                                                 <span className="text-xs text-gray-500">Chọn phân loại</span>
//                                             )}
//                                         </div>
//                                         {/* End Attributes/Classification */}


//                                         {/* Price */}
//                                         <div className="col-span-2 text-sm text-gray-700 text-center">
//                                             {item.productVariant?.CompareAtPrice && item.productVariant.CompareAtPrice > item.productVariant.Price ? (
//                                                 <div className="flex flex-col items-center">
//                                                     <span className="line-through text-gray-500 text-xs">₫{item.productVariant.CompareAtPrice.toLocaleString('vi-VN')}</span>
//                                                     <span className="text-red-500 font-semibold">₫{item.productVariant?.Price?.toLocaleString('vi-VN') || '0'}</span>
//                                                 </div>
//                                             ) : (
//                                                 <span className="text-red-500 font-semibold">₫{item.productVariant?.Price?.toLocaleString('vi-VN') || '0'}</span>
//                                             )}
//                                         </div>

//                                         {/* Quantity */}
//                                         <div className="col-span-2 flex items-center justify-center">
//                                             <div className="flex items-center border rounded-sm w-24">
//                                                 <button
//                                                     onClick={() => handleUpdateQuantity(item, item.Quantity - 1)}
//                                                     className="px-2 py-1 text-gray-600 hover:text-gray-800"
//                                                     disabled={item.Quantity <= 0}
//                                                 >
//                                                     -
//                                                 </button>
//                                                 <input
//                                                     type="text"
//                                                     value={item.Quantity}
//                                                     onChange={(e) => handleUpdateQuantity(item, e.target.value)}
//                                                     className="w-full text-center text-black text-sm border-l border-r outline-none"
//                                                     disabled={item.Quantity === 0}
//                                                 />
//                                                 <button
//                                                     onClick={() => handleUpdateQuantity(item, item.Quantity + 1)}
//                                                     className="px-2 py-1 text-gray-600 hover:text-gray-800"
//                                                     disabled={item.Quantity >= (item.productVariant?.StockQuantity || 0) || item.Quantity >= 10 || item.Quantity === 0}
//                                                 >
//                                                     +
//                                                 </button>
//                                             </div>
//                                         </div>

//                                         {/* Subtotal */}
//                                         <div className="col-span-1 text-red-500 font-semibold text-sm text-center">
//                                             ₫{((item.productVariant?.Price || 0) * item.Quantity).toLocaleString('vi-VN')}
//                                         </div>

//                                         {/* Action */}
//                                         <div className="col-span-1 text-center flex flex-col items-center gap-1">
//                                             <button
//                                                 onClick={() => handleUpdateQuantity(item, 0)} // Trigger delete confirm on clicking 0
//                                                 className="text-gray-500 hover:text-red-500 text-sm"
//                                             >
//                                                 Xóa
//                                             </button>
//                                             <button className="text-blue-500 hover:underline text-xs">
//                                                 Tìm sản phẩm tương tự
//                                             </button>
//                                         </div>
//                                     </div>
//                                 ))}
//                                 {/* Khuyến mãi tĩnh của Shop - Sửa lại để không báo lỗi */}
//                                 <div className="rounded-md p-4 mb-6">
//                                     <div className="flex items-center gap-2 text-red-500 mb-2">
//                                         <span className="text-lg">🎁</span>
//                                         <span>Giảm giá đặc biệt từ {shopName || 'cửa hàng'} chỉ trong hôm nay.</span>
//                                     </div>
//                                     <div className="flex items-start">
//                                         <Tag className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
//                                         <span>Tặng kèm ốp lưng và dán màn hình trị giá 300.000đ.</span>
//                                     </div>
//                                     <div className="flex items-start">
//                                         <Tag className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
//                                         <span>Hỗ trợ trả góp 0% qua thẻ tín dụng.</span>
//                                     </div>
//                                     <div className="flex items-center gap-2 text-green-600">
//                                         <span className="text-lg">🚚</span>
//                                         <span>Giảm ₫500.000 phí vận chuyển đơn tối thiểu ₫0</span>
//                                         <button className="text-blue-500 text-sm hover:underline">Tìm hiểu thêm</button>
//                                     </div>
//                                 </div>
//                             </div>
//                         );
//                     })}
//                 </div>

//                 {/* Sticky Footer for Total */}
//                 <div className="sticky bottom-0 left-0 right-0 bg-white shadow-md z-10 flex flex-col">
//                     {/* Nút "Thêm mã giảm giá" */}
//                     <div className="w-full flex flex-row border-b">
//                         <button
//                             onClick={() => setShowVoucherSelectModal(true)} // Mở modal khi click
//                             className="ml-auto px-4 py-2 text-red-500 hover:underline font-semibold"
//                         >
//                             {/* Hiển thị mã FreeShip hoặc SaleOff nếu được áp dụng */}
//                             {appliedVouchers.freeShipVoucher?.Code && appliedVouchers.saleOffVoucher?.Code ? 
//                                 `Voucher: ${appliedVouchers.freeShipVoucher.Code}, ${appliedVouchers.saleOffVoucher.Code}` :
//                                 appliedVouchers.freeShipVoucher?.Code || appliedVouchers.saleOffVoucher?.Code || 'Thêm mã giảm giá'
//                             }
//                         </button>
//                     </div>
                    
//                     <div className="container mx-auto px-4 py-3 flex items-center justify-between">
//                         <div className="flex items-center gap-6">
//                             <input
//                                 type="checkbox"
//                                 className="form-checkbox text-red-500 rounded"
//                                 checked={isAllItemsSelected}
//                                 onChange={(e) => handleSelectAllChange(e.target.checked)}
//                                 disabled={cart.cartItems.length === 0}
//                             />
//                             <span className="text-sm text-gray-800">Chọn Tất Cả ({cart.cartItems.length})</span>
//                             <button className="text-gray-600 hover:text-gray-800 text-sm">Xóa</button>
//                             <button className="text-blue-500 hover:underline text-sm">Lưu vào mục Đã thích</button>
//                         </div>
//                         <div className="flex flex-col items-end">
//                             <div className="flex items-center gap-4">
//                                 <span className="text-sm text-gray-600">Tổng thanh toán ({numberOfSelectedItems}) Sản phẩm:</span>
//                                 <span className="text-xl text-red-500 font-bold">
//                                     ₫{calculateTotalAmount().toLocaleString('vi-VN')}
//                                 </span>
//                             </div>
//                             {getVoucherDiscountDisplay()} {/* Hiển thị thông tin giảm giá nếu có */}
//                         </div>
//                         <button
//                             className={`px-8 py-2 rounded-sm font-semibold text-sm
//                                 ${numberOfSelectedItems > 0
//                                     ? 'bg-red-500 text-white hover:bg-red-600'
//                                     : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50'
//                                 }`}
//                             disabled={numberOfSelectedItems === 0}
//                         >
//                             Mua Hàng
//                         </button>
//                     </div>
//                 </div>
//             </div>
//     );
// };

// export default CartPage;

// src/app/cart/page.tsx
'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { fetchCart, updateCartItemQuantity, removeCartItem } from '@/services/cart';
import { getProductAttributes } from '@/services/api';
import { Cart, CartItem, AttributeValue, SingleAppliedVoucher, AppliedVouchersCombined } from '@/types'; // Import các interface voucher mới
import AttributeSelectionDropdown from '@/app/components/AttributeSelectionDropdown';
import ConfirmModal from '@/app/components/ConfirmModal';
import VoucherSelectModal from '@/app/components/VoucherSelectModal'; // Import modal mới
import { toast } from 'react-toastify';
import axios from 'axios';
import { Loader2, Tag } from 'lucide-react';



const CartPage: React.FC = () => {
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

    // State to keep track of selected CartItem IDs
    const [selectedCartItemIds, setSelectedCartItemIds] = useState<Set<number>>(new Set());

    // Ref for the currently active dropdown button (to prevent closing on button click)
    const currentDropdownButtonRef = useRef<HTMLButtonElement>(null);

    // Map to store refs for each shop checkbox to handle indeterminate state
    const shopCheckboxRefs = useRef<Map<number, HTMLInputElement>>(new Map());


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
            const cartData = await fetchCart();

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
                    currentQuantity = Math.max(1, currentQuantity); // Ensure minimum 1 if not out of stock

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
        const authToken = localStorage.getItem('authToken');
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
                        ? { ...cartItem, Quantity: 1 }
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

    // Calculate total amount of selected items
    const calculateTotalAmount = () => {
        if (!cart || !Array.isArray(cart.cartItems) || selectedCartItemIds.size === 0) {
            return 0;
        }

        let total = 0;
        cart.cartItems.forEach(item => {
            if (selectedCartItemIds.has(item.CartItemID)) {
                total += (item.productVariant?.Price || 0) * item.Quantity;
            }
        });
        return total;
    };

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
            if (numberOfSelectedItems === 0) {
                showNotification("Vui lòng chọn ít nhất một sản phẩm để mua hàng.", 'warning');
                return;
            }

            // Lấy danh sách các cart item đã được chọn
            const selectedItemsForCheckout = cart?.cartItems.filter(item => selectedCartItemIds.has(item.CartItemID)) || [];

            // Tạo một đối tượng chứa dữ liệu cần thiết để truyền sang trang checkout
            const checkoutData = {
                selectedItems: selectedItemsForCheckout,
                appliedVouchers: appliedVouchers,
                cartTotal: currentSelectedCartTotal,
                // Bạn có thể thêm các thông tin khác nếu cần, ví dụ: estimatedShippingFee, etc.
            };

            // Lưu dữ liệu vào localStorage hoặc sessionStorage để trang checkout có thể lấy được
            // Hoặc truyền qua query parameters nếu dữ liệu nhỏ gọn (nhưng thường không khuyến khích cho dữ liệu lớn)
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

    // Hiển thị tổng giảm giá từ voucher
    const getVoucherDiscountDisplay = () => {
        if (!appliedVouchers.freeShipVoucher && !appliedVouchers.saleOffVoucher) return null;

        let totalDiscountValue = 0;
        let discountDetails: string[] = [];

        // Tính giảm giá từ FreeShip voucher (nếu có)
        if (appliedVouchers.freeShipVoucher) {
            const voucher = appliedVouchers.freeShipVoucher;
            // FreeShip thường được áp dụng cho phí vận chuyển.
            // Để đơn giản hiển thị, chúng ta vẫn cộng vào tổng giảm giá ở đây.
            // Trong hệ thống thực, bạn sẽ tính toán phí ship giảm đi.
            if (voucher.DiscountType === 'FixedAmount') {
                totalDiscountValue += voucher.DiscountValue;
                discountDetails.push(`FreeShip (${voucher.Code}): -${voucher.DiscountValue.toLocaleString('vi-VN')}₫`);
            } else if (voucher.DiscountType === 'Percentage') {
                // Nếu là percentage freeship, nó có thể áp dụng tối đa MaxValueForPercentage của shipping fee.
                // Để demo, giả sử áp dụng vào tổng tiền hoặc cố định MaxValueForPercentage.
                // Bạn cần định nghĩa rõ logic này. Ví dụ, ta dùng MaxValueForPercentage như 1 FixedAmount nếu freeship là percentage.
                const freeShipAmount = voucher.MaxValueForPercentage || 0; // Giả sử MaxValueForPercentage là số tiền tối đa được miễn
                totalDiscountValue += freeShipAmount;
                discountDetails.push(`Miễn phí ship (${voucher.Code}): -${freeShipAmount.toLocaleString('vi-VN')}₫`);
            }
        }

        // Tính giảm giá từ SaleOff voucher (nếu có)
        if (appliedVouchers.saleOffVoucher) {
            const voucher = appliedVouchers.saleOffVoucher;
            let currentDiscount = 0;
            if (voucher.DiscountType === 'FixedAmount') {
                currentDiscount = voucher.DiscountValue;
            } else if (voucher.DiscountType === 'Percentage') {
                currentDiscount = currentSelectedCartTotal * (voucher.DiscountValue / 100);
                if (typeof voucher.MaxValueForPercentage === 'number' && currentDiscount > voucher.MaxValueForPercentage) {
                    currentDiscount = voucher.MaxValueForPercentage;
                }
            }
            totalDiscountValue += currentDiscount;
            discountDetails.push(`Giảm giá (${voucher.Code}): -${Math.round(currentDiscount).toLocaleString('vi-VN')}₫`);
        }
        
        return (
            <div className="flex flex-col items-end text-sm text-gray-700 mt-2">
                {discountDetails.map((detail, index) => (
                    <span key={index} className="font-semibold text-red-500">{detail}</span>
                ))}
                <span className="font-bold text-red-600">Tổng giảm giá: -{Math.round(totalDiscountValue).toLocaleString('vi-VN')}₫</span>
            </div>
        );
    };


    if (loading) {
        return <div className="flex justify-center items-center h-screen bg-white">
                <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
            </div>;
    }

    if (!cart || !Array.isArray(cart.cartItems) || cart.cartItems.length === 0) {
        return <div className="text-center py-8 text-gray-600">Giỏ hàng của bạn đang trống.</div>;
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

            {/* NEW: Voucher Selection Modal */}
            <VoucherSelectModal
                isOpen={showVoucherSelectModal}
                onClose={() => setShowVoucherSelectModal(false)}
                onApplyVouchers={handleApplyVoucherFromModal} // Truyền hàm mới
                initialAppliedVouchers={appliedVouchers} // Truyền object voucher đã áp dụng
                currentCartTotal={currentSelectedCartTotal}
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
                    <div className="bg-white shadow-sm mt-4 mb-4 grid grid-cols-12 rounded-sm text-gray-500 text-xs uppercase px-4 py-4">

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

                                    <div key={item.CartItemID} className="grid grid-cols-12 items-center px-4 py-3 border-b last:border-b-0">
                                        {/* Product */}
                                        <div className="col-span-4 flex items-center gap-3">

                                            <input
                                                type="checkbox"
                                                className="form-checkbox text-red-500 rounded"
                                                checked={!!selectedCartItemIds.has(item.CartItemID)}
                                                onChange={(e) => handleItemCheckboxChange(item.CartItemID, e.target.checked)}

                                                disabled={item.Quantity === 0}

                                            />
                                            <div className="w-16 h-16 bg-gray-100 rounded-sm flex items-center justify-center text-gray-500 overflow-hidden border">
                                                <img src={item.productVariant?.ImageURL || '/images/placeholder.png'} alt={item.productVariant?.product?.Name || 'Product Image'} className="object-cover w-full h-full" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-sm text-gray-800">{item.productVariant?.product?.Name}</span>
                                            </div>
                                        </div>

                                        {/* Attributes/Classification */}
                                        <div className="col-span-2 text-sm text-gray-700 relative">
                                            {item.productVariant?.attributeValues && item.productVariant.attributeValues.length > 0 ? (
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            ref={openDropdownItemId === item.CartItemID ? currentDropdownButtonRef : null}
                                                            className="flex items-center gap-1 px-2 py-1 rounded-sm text-xs text-gray-700 hover:border-red-500"
                                                            onClick={() => handleAttributeClick(item)}
                                                        >
                                                            <div className="flex flex-col items-center">

                                                                 <div className="w-full"><span className="text-xs text-gray-500">Phân Loại Hàng:</span>
                                                                 <span className="text-gray-400 text-xs">▼</span></div>
                                                                 <div className="text-gray-500 text-xs">{item.productVariant?.attributeValues?.map(attrValue => attrValue.Value).join(' - ') || 'Chọn phân loại'}</div>

                                                            </div>
                                                        </button>
                                                    </div>
                                                    {openDropdownItemId === item.CartItemID && (
                                                        <AttributeSelectionDropdown
                                                            productId={item.productVariant?.ProductID || 0}
                                                            attributeOptions={attributeOptions}
                                                            onAttributeSelected={() => {}}
                                                            onClose={handleCloseDropdown}
                                                            excludedButtonRef={currentDropdownButtonRef}
                                                        />
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-500">Chọn phân loại</span>
                                            )}
                                        </div>
                                        {/* End Attributes/Classification */}


                                        {/* Price */}
                                        <div className="col-span-2 text-sm text-gray-700 text-center">
                                            {item.productVariant?.CompareAtPrice && item.productVariant.CompareAtPrice > item.productVariant.Price ? (
                                                <div className="flex flex-col items-center">
                                                    <span className="line-through text-gray-500 text-xs">₫{item.productVariant.CompareAtPrice.toLocaleString('vi-VN')}</span>
                                                    <span className="text-red-500 font-semibold">₫{item.productVariant?.Price?.toLocaleString('vi-VN') || '0'}</span>
                                                </div>
                                            ) : (
                                                <span className="text-red-500 font-semibold">₫{item.productVariant?.Price?.toLocaleString('vi-VN') || '0'}</span>
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
                                            ₫{((item.productVariant?.Price || 0) * item.Quantity).toLocaleString('vi-VN')}
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
                                ))}

                                {/* Khuyến mãi tĩnh của Shop - Sửa lại để không báo lỗi */}
                                <div className="rounded-md p-4 mb-6">
                                    <div className="flex items-center gap-2 text-red-500 mb-2">
                                        <span className="text-lg">🎁</span>
                                        <span>Giảm giá đặc biệt từ {shopName || 'cửa hàng'} chỉ trong hôm nay.</span>
                                    </div>
                                    <div className="flex items-start">
                                        <Tag className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                                        <span>Tặng kèm ốp lưng và dán màn hình trị giá 300.000đ.</span>
                                    </div>
                                    <div className="flex items-start">
                                        <Tag className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                                        <span>Hỗ trợ trả góp 0% qua thẻ tín dụng.</span>

                                    </div>
                                    <div className="flex items-center gap-2 text-green-600">
                                        <span className="text-lg">🚚</span>
                                        <span>Giảm ₫500.000 phí vận chuyển đơn tối thiểu ₫0</span>
                                        <button className="text-blue-500 text-sm hover:underline">Tìm hiểu thêm</button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Sticky Footer for Total */}
                <div className="sticky bottom-0 left-0 right-0 bg-white shadow-md z-10 flex flex-col">

                    {/* Nút "Thêm mã giảm giá" */}
                    <div className="w-full flex flex-row border-b">
                        <button
                            onClick={() => setShowVoucherSelectModal(true)} // Mở modal khi click
                            className="ml-auto px-4 py-2 text-red-500 hover:underline font-semibold"
                        >
                            {/* Hiển thị mã FreeShip hoặc SaleOff nếu được áp dụng */}
                            {appliedVouchers.freeShipVoucher?.Code && appliedVouchers.saleOffVoucher?.Code ? 
                                `Voucher: ${appliedVouchers.freeShipVoucher.Code}, ${appliedVouchers.saleOffVoucher.Code}` :
                                appliedVouchers.freeShipVoucher?.Code || appliedVouchers.saleOffVoucher?.Code || 'Thêm mã giảm giá'
                            }
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
                            <button className="text-gray-600 hover:text-gray-800 text-sm">Xóa</button>
                            <button className="text-blue-500 hover:underline text-sm">Lưu vào mục Đã thích</button>
                        </div>
                        <div className="flex flex-col items-end">
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-gray-600">Tổng thanh toán ({numberOfSelectedItems}) Sản phẩm:</span>
                                <span className="text-xl text-red-500 font-bold">
                                    ₫{calculateTotalAmount().toLocaleString('vi-VN')}
                                </span>
                            </div>
                            {getVoucherDiscountDisplay()} {/* Hiển thị thông tin giảm giá nếu có */}
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