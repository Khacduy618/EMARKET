//  'use client';
// import React, { useEffect, useState, useRef, useCallback } from 'react';
// import { useRouter } from 'next/navigation';
// import { fetchCart, updateCartItemQuantity, removeCartItem, addCartItem } from '@/services/cart'; // Add addCartItem if you plan to use it
// import { getProductAttributes } from '@/services/api'; // Import getProductAttributes from services/api
// import { Cart, CartItem, AttributeValue } from '@/types';
// import AttributeSelectionDropdown from '@/app/components/AttributeSelectionDropdown';

// // Define a type for your notification
// interface Notification {
//     message: string;
//     type: 'success' | 'error' | 'warning';
// }

// const CartPage: React.FC = () => {
//     const [cart, setCart] = useState<Cart | null>(null);
//     const router = useRouter();
//     const [loading, setLoading] = useState(true);
//     // Renamed 'error' to 'localError' to distinguish from notification error
//     const [localError, setLocalError] = useState<string | null>(null);
//     const [openDropdownItemId, setOpenDropdownItemId] = useState<number | null>(null);
//     const [attributeOptions, setAttributeOptions] = useState<{ [key: string]: any } | null>(null);

//     // New state for notifications
//     const [notification, setNotification] = useState<Notification | null>(null);

//     // State to keep track of selected CartItem IDs
//     const [selectedCartItemIds, setSelectedCartItemIds] = useState<Set<number>>(new Set());

//     // Ref for the currently active dropdown button (to prevent closing on button click)
//     const currentDropdownButtonRef = useRef<HTMLButtonElement>(null);

//     // Map to store refs for each shop checkbox to handle indeterminate state
//     const shopCheckboxRefs = useRef<Map<number, HTMLInputElement>>(new Map());

//     // Helper function to show notifications
//     const showNotification = useCallback((message: string, type: 'success' | 'error' | 'warning', duration: number = 3000) => {
//         setNotification({ message, type });
//         const timer = setTimeout(() => {
//             setNotification(null);
//         }, duration);
//         // Clear any previous timeout if a new notification comes in quickly
//         return () => clearTimeout(timer); // Return cleanup function
//     }, []); // Empty dependency array means this function is stable and won't re-create

//     // Refetch cart function (to be called after successful mutations)
//     const refreshCart = useCallback(async () => {
//         try {
//             setLoading(true);
//             const cartData = await fetchCart();
//             setCart(cartData);
//             // Re-evaluate selected items to ensure consistency (e.g., if an item was removed)
//             setSelectedCartItemIds(prev => {
//                 const newSet = new Set<number>();
//                 if (cartData && Array.isArray(cartData.cartItems)) {
//                     cartData.cartItems.forEach(item => {
//                         if (prev.has(item.CartItemID)) {
//                             newSet.add(item.CartItemID);
//                         }
//                     });
//                 }
//                 return newSet;
//             });
//             setLocalError(null); // Clear any previous local errors
//             return cartData; // Return updated cart data
//         } catch (err) {
//             console.error('Error fetching cart:', err);
//             const errorMessage = (err as any).response?.data?.message || 'Failed to load cart.';
//             setLocalError(errorMessage);
//             showNotification(errorMessage, 'error'); // Show as a notification
//             return null;
//         } finally {
//             setLoading(false);
//         }
//     }, [showNotification]); // showNotification is stable due to useCallback

//     useEffect(() => {
//         const authToken = localStorage.getItem('authToken');
//         if (!authToken) {
//             router.push('/login');
//             return;
//         }
//         refreshCart();
//     }, [router, refreshCart]); // refreshCart is stable due to useCallback

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
//                     newSet.add(item.CartItemID);
//                 });
//             }
//             return newSet;
//         });
//     };

//     // NEW: Handle shop-level checkbox change
//     const handleShopCheckboxChange = (shopId: number, isChecked: boolean) => {
//         setSelectedCartItemIds(prev => {
//             const newSet = new Set(prev);
//             const itemsInShop = groupedItems[shopId]; // Use groupedItems to get items for this shop

//             if (itemsInShop) {
//                 itemsInShop.forEach(item => {
//                     if (isChecked) {
//                         newSet.add(item.CartItemID);
//                     } else {
//                         newSet.delete(item.CartItemID);
//                     }
//                 });
//             }
//             return newSet;
//         });
//     };

//     const handleUpdateQuantity = async (cartItemId: number, quantity: number) => {
//         try {
//             const newQuantity = Math.max(1, quantity);
//             const updatedCart = await updateCartItemQuantity(cartItemId, newQuantity);
//             setCart(updatedCart); // Update local cart state immediately with the response
//             setLocalError(null); // Clear local error on success
//             // Check if the API response includes a message
//             if ((updatedCart as any).message) {
//                 showNotification((updatedCart as any).message, 'success');
//             } else {
//                 showNotification('Số lượng sản phẩm đã được cập nhật.', 'success');
//             }
//         } catch (err: any) {
//             console.error('Error updating quantity:', err);
//             let errorMessage = 'Không thể cập nhật số lượng sản phẩm.';
//             // Check if it's an Axios/Fetch error with response data
//             if (err.response && err.response.data) {
//                 if (err.response.data.message) {
//                     errorMessage = err.response.data.message;
//                 }
//                 if (err.response.data.available_stock !== undefined) {
//                     errorMessage = `Số lượng yêu cầu vượt quá số lượng sản phẩm có sẵn trong kho. Chỉ còn ${err.response.data.available_stock} sản phẩm.`;
//                 }
//             }
//             setLocalError(errorMessage); // Keep local error for persistent display if needed
//             showNotification(errorMessage, 'error', 5000); // Show as a notification for 5 seconds
//         }
//     };

//     const handleRemoveItem = async (cartItemId: number) => {
//         try {
//             const updatedCart = await removeCartItem(cartItemId);
//             setCart(updatedCart);
//             // Also remove from selected items if it was selected
//             setSelectedCartItemIds(prev => {
//                 const newSet = new Set(prev);
//                 newSet.delete(cartItemId);
//                 return newSet;
//             });
//             setLocalError(null); // Clear local error on success
//             // Check if the API response includes a message
//             if ((updatedCart as any).message) {
//                 showNotification((updatedCart as any).message, 'success');
//             } else {
//                 showNotification('Sản phẩm đã được xóa khỏi giỏ hàng.', 'success');
//             }
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
//             setLocalError(null); // Clear local error on success
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

//     // NEW: Effect to set indeterminate state for shop checkboxes
//     useEffect(() => {
//         Object.entries(groupedItems).forEach(([shopIdStr, items]) => {
//             const shopId = parseInt(shopIdStr);
//             const checkbox = shopCheckboxRefs.current.get(shopId);
//             if (checkbox) {
//                 const selectedCount = items.filter(item => selectedCartItemIds.has(item.CartItemID)).length;
//                 const totalCount = items.length;

//                 const isShopFullySelected = totalCount > 0 && selectedCount === totalCount;
//                 const isShopPartiallySelected = selectedCount > 0 && selectedCount < totalCount;

//                 checkbox.checked = isShopFullySelected; // Set checked state
//                 checkbox.indeterminate = isShopPartiallySelected; // Set indeterminate state
//             }
//         });
//     }, [selectedCartItemIds, groupedItems]); // Re-run when selections or grouped items change


//     if (loading) {
//         return <div className="text-center py-8">Đang tải giỏ hàng...</div>;
//     }

//     if (!cart || !Array.isArray(cart.cartItems) || cart.cartItems.length === 0) {
//         return <div className="text-center py-8 text-gray-600">Giỏ hàng của bạn đang trống.</div>;
//     }

//     // Notification Component (can be extracted to a separate file, e.g., Notification.tsx)
//     const NotificationComponent: React.FC<{ notification: Notification | null }> = ({ notification }) => {
//         if (!notification) return null;

//         let bgColor = '';
//         let textColor = '';
//         let borderColor = '';
//         switch (notification.type) {
//             case 'success':
//                 bgColor = 'bg-green-100';
//                 textColor = 'text-green-700';
//                 borderColor = 'border-green-400';
//                 break;
//             case 'error':
//                 bgColor = 'bg-red-100';
//                 textColor = 'text-red-700';
//                 borderColor = 'border-red-400';
//                 break;
//             case 'warning':
//                 bgColor = 'bg-yellow-100';
//                 textColor = 'text-yellow-700';
//                 borderColor = 'border-yellow-400';
//                 break;
//             default:
//                 bgColor = 'bg-gray-100';
//                 textColor = 'text-gray-700';
//                 borderColor = 'border-gray-400';
//         }

//         return (
//             <div className={`fixed top-4 right-4 z-50 p-4 border rounded-md shadow-lg ${bgColor} ${textColor} ${borderColor} transition-all duration-300 ease-in-out transform ${notification ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
//                 <div className="flex items-center">
//                     {notification.type === 'success' && <svg className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
//                     {notification.type === 'error' && <svg className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2A9 9 0 111 10a9 9 0 0118 0z" /></svg>}
//                     {notification.type === 'warning' && <svg className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
//                     <span className="font-semibold">{notification.message}</span>
//                 </div>
//             </div>
//         );
//     };


//     return (
//             <div className="container mx-auto px-4">
//             {/* Notification display */}
//             <NotificationComponent notification={notification} />

//             {/* Persistent error banner (optional, can remove if floating notification is enough) */}
//             {localError && (
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
//                         const shopId = parseInt(shopIdStr); // Convert string key back to number
//                         const shopName = items[0]?.shop?.ShopName;

//                         return (
//                             <div key={shopId} className="shop-group bg-white rounded-sm shadow-sm last:border-b-0 mb-4"> {/* Added mb-4 for spacing between shops */}
//                                 {/* Shop Header */}
//                                 <div className="flex items-center gap-2 px-4 py-2 border-b border-opacity-50">
//                                     {/* Shop-level checkbox */}
//                                     <input
//                                         type="checkbox"
//                                         className="form-checkbox text-red-500 rounded"
//                                         // Use ref to manage indeterminate state directly on DOM
//                                         ref={el => {
//                                             if (el) {
//                                                 shopCheckboxRefs.current.set(shopId, el);
//                                             } else {
//                                                 shopCheckboxRefs.current.delete(shopId);
//                                             }
//                                         }}
//                                         onChange={(e) => handleShopCheckboxChange(shopId, e.target.checked)}
//                                         // Checked state is controlled by useEffect, so no 'checked' prop here
//                                         // unless you want to explicitly set it based on initial load
//                                     />
//                                     <span className="text-lg text-red-500">🏪</span>
//                                     <span className="font-bold text-sm text-gray-800">{shopName || `Shop ID: ${shopId}`}</span>
//                                 </div>
//                                 {/* Cart Items for this shop */}
//                                 {items.map((item: CartItem) => (
//                                     <div key={item.CartItemID} className="grid grid-cols-12 items-center px-4 py-3 border-b last:border-b-0">
//                                         {/* Product */}
//                                         <div className="col-span-4 flex items-center gap-3">
//                                             {/* Individual product checkbox */}
//                                             <input
//                                                 type="checkbox"
//                                                 className="form-checkbox text-red-500 rounded"
//                                                 checked={!!selectedCartItemIds.has(item.CartItemID)}
//                                                 onChange={(e) => handleItemCheckboxChange(item.CartItemID, e.target.checked)}
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
//                                                                 <div className="w-full"><span className="text-xs text-gray-500">Phân Loại Hàng:</span>
//                                                                 <span className="text-gray-400 text-xs">▼</span></div>
//                                                                 <div className="text-gray-500 text-xs">{item.productVariant?.attributeValues?.map(attrValue => attrValue.Value).join(' - ') || 'Chọn phân loại'}</div>
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
//                                                     onClick={() => handleUpdateQuantity(item.CartItemID, item.Quantity - 1)}
//                                                     className="px-2 py-1 text-gray-600 hover:text-gray-800"
//                                                 >
//                                                     -
//                                                 </button>
//                                                 <input
//                                                     type="text"
//                                                     value={item.Quantity}
//                                                     onChange={(e) => handleUpdateQuantity(item.CartItemID, parseInt(e.target.value) || 1)}
//                                                     className="w-full text-center text-black text-sm border-l border-r outline-none"
//                                                 />
//                                                 <button
//                                                     onClick={() => handleUpdateQuantity(item.CartItemID, item.Quantity + 1)}
//                                                     className="px-2 py-1 text-gray-600 hover:text-gray-800"
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
//                                                 onClick={() => handleRemoveItem(item.CartItemID)}
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
//                                 {/* Voucher and Shipping sections */}
//                                 <div className="rounded-md p-4 mb-6">
//                                     <div className="flex items-center gap-2 text-red-500 mb-2">
//                                         <span className="text-lg">🎁</span>
//                                         <span>Voucher giảm đến ₫30k</span>
//                                         <button className="text-blue-500 text-sm hover:underline">Xem thêm voucher</button>
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
//                     <div className="w-full flex flex-row border-b"><a href="" className="w-50 text-red ms-auto py-2">Thêm mã giảm giá</a></div>
//                     <div className="container mx-auto px-4 py-3 flex items-center justify-between">
//                         <div className="flex items-center gap-6">
//                             <div className="flex items-center gap-2">
//                                 {/* "Select All" checkbox in sticky footer */}
//                                 <input
//                                     type="checkbox"
//                                     className="form-checkbox text-red-500 rounded"
//                                     checked={isAllItemsSelected}
//                                     onChange={(e) => handleSelectAllChange(e.target.checked)}
//                                     disabled={cart.cartItems.length === 0}
//                                 />
//                                 <span className="text-sm text-gray-800">Chọn Tất Cả ({cart.cartItems.length})</span>
//                             </div>
//                             <button className="text-gray-600 hover:text-gray-800 text-sm">Xóa</button>
//                             <button className="text-blue-500 hover:underline text-sm">Lưu vào mục Đã thích</button>
//                         </div>
//                         <div className="flex items-center gap-4">
//                             <span className="text-sm text-gray-600">Tổng thanh toán ({numberOfSelectedItems}) Sản phẩm:</span>
//                             <span className="text-xl text-red-500 font-bold">
//                                 ₫{calculateTotalAmount().toLocaleString('vi-VN')}
//                             </span>
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


//*********************
////
//**********


// 'use client';

// import React, { useEffect, useState, useRef, useCallback } from 'react';
// import { useRouter } from 'next/navigation';
// import { fetchCart, updateCartItemQuantity, removeCartItem } from '@/services/cart';
// import { getProductAttributes } from '@/services/api';
// import { Cart, CartItem, AttributeValue } from '@/types';
// import AttributeSelectionDropdown from '@/app/components/AttributeSelectionDropdown';
// import ConfirmModal from '@/app/components/ConfirmModal'; // Import ConfirmModal

// // Define a type for your notification
// interface Notification {
//     message: string;
//     type: 'success' | 'error' | 'warning';
// }

// const CartPage: React.FC = () => {
//     const [cart, setCart] = useState<Cart | null>(null);
//     const router = useRouter();
//     const [loading, setLoading] = useState(true);
//     const [localError, setLocalError] = useState<string | null>(null);
//     const [openDropdownItemId, setOpenDropdownItemId] = useState<number | null>(null);
//     const [attributeOptions, setAttributeOptions] = useState<{ [key: string]: any } | null>(null);

//     // State for notifications
//     const [notification, setNotification] = useState<Notification | null>(null);

//     // State for confirmation modal
//     const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
//     const [itemToDelete, setItemToDelete] = useState<CartItem | null>(null); // To store the item being considered for deletion

//     // State to keep track of selected CartItem IDs
//     const [selectedCartItemIds, setSelectedCartItemIds] = useState<Set<number>>(new Set());

//     // Ref for the currently active dropdown button (to prevent closing on button click)
//     const currentDropdownButtonRef = useRef<HTMLButtonElement>(null);

//     // Map to store refs for each shop checkbox to handle indeterminate state
//     const shopCheckboxRefs = useRef<Map<number, HTMLInputElement>>(new Map());

//     // Helper function to show notifications
//     const showNotification = useCallback((message: string, type: 'success' | 'error' | 'warning', duration: number = 3000) => {
//         setNotification({ message, type });
//         const timer = setTimeout(() => {
//             setNotification(null);
//         }, duration);
//         return () => clearTimeout(timer); // Return cleanup function
//     }, []);

//     // Refetch cart function (to be called after successful mutations)
//     const refreshCart = useCallback(async () => {
//         try {
//             setLoading(true);
//             const cartData = await fetchCart();
//             setCart(cartData);
//             setSelectedCartItemIds(prev => {
//                 const newSet = new Set<number>();
//                 if (cartData && Array.isArray(cartData.cartItems)) {
//                     cartData.cartItems.forEach(item => {
//                         if (prev.has(item.CartItemID)) {
//                             newSet.add(item.CartItemID);
//                         }
//                     });
//                 }
//                 return newSet;
//             });
//             setLocalError(null);
//             return cartData;
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
//                     newSet.add(item.CartItemID);
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
//                     if (isChecked) {
//                         newSet.add(item.CartItemID);
//                     } else {
//                         newSet.delete(item.CartItemID);
//                     }
//                 });
//             }
//             return newSet;
//         });
//     };

//     // --- New Confirmation Modal Handlers ---
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
//                 setItemToDelete(null); // Clear the item after action
//             }
//         }
//     };

//     const handleCancelDelete = () => {
//         // If canceled, revert the quantity to 1 for the specific item
//         if (itemToDelete) {
//             setCart(prevCart => {
//                 if (!prevCart) return null;
//                 const updatedItems = prevCart.cartItems.map(cartItem =>
//                     cartItem.CartItemID === itemToDelete.CartItemID
//                         ? { ...cartItem, Quantity: 1 } // Revert to 1
//                         : cartItem
//                 );
//                 return { ...prevCart, cartItems: updatedItems };
//             });
//         }
//         setShowDeleteConfirm(false);
//         setItemToDelete(null); // Clear the item
//         showNotification('Thao tác xóa đã bị hủy.', 'warning');
//     };
//     // --- End Confirmation Modal Handlers ---

//     // --- Modified handleUpdateQuantity ---
//     const handleUpdateQuantity = async (item: CartItem, newQuantityInput: number | string) => {
//         let newQuantity = typeof newQuantityInput === 'string' ? parseInt(newQuantityInput) : newQuantityInput;

//         // Ensure quantity is a valid number, default to 0 if not
//         if (isNaN(newQuantity)) {
//             newQuantity = 0;
//         }

//         // --- Step 1: Handle Zero/Negative Quantity (Deletion Confirmation) ---
//         if (newQuantity <= 0) {
//             setItemToDelete(item); // Store the item to be deleted
//             setShowDeleteConfirm(true); // Show the confirmation modal
//             return; // Exit early, wait for user confirmation
//         }

//         // --- Step 2: Client-side Quantity Clamping (Max 10 or Stock Quantity) ---
//         const maxStock = item.productVariant?.StockQuantity || 1; // Default to 1 if stock is undefined or 0
//         const hardLimit = 10; // The arbitrary hard limit as per requirement

//         let finalQuantity = newQuantity;

//         // Apply max stock limit first
//         if (finalQuantity > maxStock) {
//             finalQuantity = maxStock;
//             showNotification(`Số lượng không thể vượt quá tồn kho (${maxStock}).`, 'warning');
//         }

//         // Apply arbitrary hard limit of 10 if stock allows for more than 10
//         // (i.e., don't exceed 10 if the effective max (considering stock) is 10 or more)
//         if (finalQuantity > hardLimit && maxStock >= hardLimit) {
//             finalQuantity = hardLimit;
//             // Only show warning if the user *tried* to go above 10 and it was clamped
//             if (newQuantity > hardLimit) { // Check original input, not current finalQuantity
//                showNotification(`Số lượng tối đa cho phép là ${hardLimit} sản phẩm.`, 'warning');
//             }
//         }

//         // If the quantity hasn't actually changed after clamping, and it's not a zero input that got clamped (which is handled above)
//         // AND the current quantity in UI is already what we want, don't make API call.
//         // Also, if the user typed something invalid that got clamped, update the UI without API call.
//         if (finalQuantity === item.Quantity) {
//              // If user typed 'abc' -> 0 -> 1 or '15' -> 10, update the UI to reflect the clamped value
//             if (newQuantityInput !== finalQuantity && typeof newQuantityInput === 'string') {
//                 setCart(prevCart => {
//                     if (!prevCart) return null;
//                     const updatedItems = prevCart.cartItems.map(cartItem =>
//                         cartItem.CartItemID === item.CartItemID
//                             ? { ...cartItem, Quantity: finalQuantity } // Update local state for UI
//                             : cartItem
//                     );
//                     return { ...prevCart, cartItems: updatedItems };
//                 });
//             }
//             return; // No change, no API call
//         }

//         // --- Step 3: Make API Call for Valid Quantity Change ---
//         try {
//             const updatedCart = await updateCartItemQuantity(item.CartItemID, finalQuantity);
//             setCart(updatedCart);
//             setLocalError(null);
//             showNotification((updatedCart as any).message || 'Số lượng sản phẩm đã được cập nhật.', 'success');
//         } catch (err: any) {
//             console.error('Error updating quantity:', err);
//             let errorMessage = 'Không thể cập nhật số lượng sản phẩm.';
//             if (err.response && err.response.data) {
//                 errorMessage = err.response.data.message || errorMessage;
//                 if (err.response.data.available_stock !== undefined) {
//                     errorMessage = `Số lượng yêu cầu vượt quá số lượng sản phẩm có sẵn trong kho. Chỉ còn ${err.response.data.available_stock} sản phẩm.`;
//                 }
//             }
//             setLocalError(errorMessage);
//             showNotification(errorMessage, 'error', 5000);

//             // Revert quantity in UI to previous valid state if API call failed
//             setCart(prevCart => {
//                 if (!prevCart) return null;
//                 const updatedItems = prevCart.cartItems.map(cartItem =>
//                     cartItem.CartItemID === item.CartItemID
//                         ? { ...cartItem, Quantity: item.Quantity } // Revert to original quantity
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

//     // NEW: Effect to set indeterminate state for shop checkboxes
//     useEffect(() => {
//         Object.entries(groupedItems).forEach(([shopIdStr, items]) => {
//             const shopId = parseInt(shopIdStr);
//             const checkbox = shopCheckboxRefs.current.get(shopId);
//             if (checkbox) {
//                 const selectedCount = items.filter(item => selectedCartItemIds.has(item.CartItemID)).length;
//                 const totalCount = items.length;

//                 const isShopFullySelected = totalCount > 0 && selectedCount === totalCount;
//                 const isShopPartiallySelected = selectedCount > 0 && selectedCount < totalCount;

//                 checkbox.checked = isShopFullySelected;
//                 checkbox.indeterminate = isShopPartiallySelected;
//             }
//         });
//     }, [selectedCartItemIds, groupedItems]);


//     if (loading) {
//         return <div className="text-center py-8">Đang tải giỏ hàng...</div>;
//     }

//     if (!cart || !Array.isArray(cart.cartItems) || cart.cartItems.length === 0) {
//         return <div className="text-center py-8 text-gray-600">Giỏ hàng của bạn đang trống.</div>;
//     }

//     // Notification Component (can be extracted to a separate file, e.g., Notification.tsx)
//     const NotificationComponent: React.FC<{ notification: Notification | null }> = ({ notification }) => {
//         if (!notification) return null;

//         let bgColor = '';
//         let textColor = '';
//         let borderColor = '';
//         switch (notification.type) {
//             case 'success':
//                 bgColor = 'bg-green-100';
//                 textColor = 'text-green-700';
//                 borderColor = 'border-green-400';
//                 break;
//             case 'error':
//                 bgColor = 'bg-red-100';
//                 textColor = 'text-red-700';
//                 borderColor = 'border-red-400';
//                 break;
//             case 'warning':
//                 bgColor = 'bg-yellow-100';
//                 textColor = 'text-yellow-700';
//                 borderColor = 'border-yellow-400';
//                 break;
//             default:
//                 bgColor = 'bg-gray-100';
//                 textColor = 'text-gray-700';
//                 borderColor = 'border-gray-400';
//         }

//         return (
//             <div className={`fixed top-4 right-4 z-50 p-4 border rounded-md shadow-lg ${bgColor} ${textColor} ${borderColor} transition-all duration-300 ease-in-out transform ${notification ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
//                 <div className="flex items-center">
//                     {notification.type === 'success' && <svg className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
//                     {notification.type === 'error' && <svg className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2A9 9 0 111 10a9 9 0 0118 0z" /></svg>}
//                     {notification.type === 'warning' && <svg className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
//                     <span className="font-semibold">{notification.message}</span>
//                 </div>
//             </div>
//         );
//     };


//     return (
//             <div className="container mx-auto px-4">
//             {/* Notification display */}
//             <NotificationComponent notification={notification} />

//             {/* Confirmation Modal */}
//             {showDeleteConfirm && itemToDelete && (
//                 <ConfirmModal
//                     isOpen={showDeleteConfirm}
//                     message={`Bạn có chắc chắn muốn xoá sản phẩm "${itemToDelete.productVariant?.product?.Name}" khỏi giỏ hàng?`}
//                     onConfirm={handleConfirmDelete}
//                     onCancel={handleCancelDelete}
//                 />
//             )}

//             {/* Persistent error banner (optional, can remove if floating notification is enough) */}
//             {localError && (
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
//                         const shopId = parseInt(shopIdStr); // Convert string key back to number
//                         const shopName = items[0]?.shop?.ShopName;

//                         return (
//                             <div key={shopId} className="shop-group bg-white rounded-sm shadow-sm last:border-b-0 mb-4">
//                                 {/* Shop Header */}
//                                 <div className="flex items-center gap-2 px-4 py-2 border-b border-opacity-50">
//                                     {/* Shop-level checkbox */}
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
//                                             {/* Individual product checkbox */}
//                                             <input
//                                                 type="checkbox"
//                                                 className="form-checkbox text-red-500 rounded"
//                                                 checked={!!selectedCartItemIds.has(item.CartItemID)}
//                                                 onChange={(e) => handleItemCheckboxChange(item.CartItemID, e.target.checked)}
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
//                                                                 <div className="w-full"><span className="text-xs text-gray-500">Phân Loại Hàng:</span>
//                                                                 <span className="text-gray-400 text-xs">▼</span></div>
//                                                                 <div className="text-gray-500 text-xs">{item.productVariant?.attributeValues?.map(attrValue => attrValue.Value).join(' - ') || 'Chọn phân loại'}</div>
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
//                                                 >
//                                                     -
//                                                 </button>
//                                                 <input
//                                                     type="text"
//                                                     value={item.Quantity}
//                                                     onChange={(e) => handleUpdateQuantity(item, e.target.value)}
//                                                     className="w-full text-center text-black text-sm border-l border-r outline-none"
//                                                 />
//                                                 <button
//                                                     onClick={() => handleUpdateQuantity(item, item.Quantity + 1)}
//                                                     className="px-2 py-1 text-gray-600 hover:text-gray-800"
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
//                                 {/* Voucher and Shipping sections */}
//                                 <div className="rounded-md p-4 mb-6">
//                                     <div className="flex items-center gap-2 text-red-500 mb-2">
//                                         <span className="text-lg">🎁</span>
//                                         <span>Voucher giảm đến ₫30k</span>
//                                         <button className="text-blue-500 text-sm hover:underline">Xem thêm voucher</button>
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
//                     <div className="w-full flex flex-row border-b"><a href="" className="w-50 text-red ms-auto py-2">Thêm mã giảm giá</a></div>
//                     <div className="container mx-auto px-4 py-3 flex items-center justify-between">
//                         <div className="flex items-center gap-6">
//                             <div className="flex items-center gap-2">
//                                 {/* "Select All" checkbox in sticky footer */}
//                                 <input
//                                     type="checkbox"
//                                     className="form-checkbox text-red-500 rounded"
//                                     checked={isAllItemsSelected}
//                                     onChange={(e) => handleSelectAllChange(e.target.checked)}
//                                     disabled={cart.cartItems.length === 0}
//                                 />
//                                 <span className="text-sm text-gray-800">Chọn Tất Cả ({cart.cartItems.length})</span>
//                             </div>
//                             <button className="text-gray-600 hover:text-gray-800 text-sm">Xóa</button>
//                             <button className="text-blue-500 hover:underline text-sm">Lưu vào mục Đã thích</button>
//                         </div>
//                         <div className="flex items-center gap-4">
//                             <span className="text-sm text-gray-600">Tổng thanh toán ({numberOfSelectedItems}) Sản phẩm:</span>
//                             <span className="text-xl text-red-500 font-bold">
//                                 ₫{calculateTotalAmount().toLocaleString('vi-VN')}
//                             </span>
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
import { Cart, CartItem, AttributeValue } from '@/types';
import AttributeSelectionDropdown from '@/app/components/AttributeSelectionDropdown';
import ConfirmModal from '@/app/components/ConfirmModal';
import NotificationModal from '@/app/components/NotificationModal'; // <-- Import NotificationModal mới

// Định nghĩa lại type Notification nếu bạn chưa làm ở file này
// (hoặc nếu bạn muốn tách hoàn toàn interface này ra một file types chung)
interface Notification {
    message: string;
    type: 'success' | 'error' | 'warning';
}

const CartPage: React.FC = () => {
    const [cart, setCart] = useState<Cart | null>(null);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [localError, setLocalError] = useState<string | null>(null);
    const [openDropdownItemId, setOpenDropdownItemId] = useState<number | null>(null);
    const [attributeOptions, setAttributeOptions] = useState<{ [key: string]: any } | null>(null);

    // State for notifications
    const [notification, setNotification] = useState<Notification | null>(null);

    // State for confirmation modal
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
    const [itemToDelete, setItemToDelete] = useState<CartItem | null>(null);

    // State to keep track of selected CartItem IDs
    const [selectedCartItemIds, setSelectedCartItemIds] = useState<Set<number>>(new Set());

    // Ref for the currently active dropdown button (to prevent closing on button click)
    const currentDropdownButtonRef = useRef<HTMLButtonElement>(null);

    // Map to store refs for each shop checkbox to handle indeterminate state
    const shopCheckboxRefs = useRef<Map<number, HTMLInputElement>>(new Map());

    // Helper function to show notifications
    const showNotification = useCallback((message: string, type: 'success' | 'error' | 'warning', duration: number = 3000) => {
        setNotification({ message, type });
        const timer = setTimeout(() => {
            setNotification(null);
        }, duration);
        // Clean up previous timer if a new notification is shown quickly
        return () => clearTimeout(timer);
    }, []);

    // Refetch cart function (to be called after successful mutations)
    const refreshCart = useCallback(async () => {
        try {
            setLoading(true);
            const cartData = await fetchCart();
            setCart(cartData);
            setSelectedCartItemIds(prev => {
                const newSet = new Set<number>();
                if (cartData && Array.isArray(cartData.cartItems)) {
                    cartData.cartItems.forEach(item => {
                        if (prev.has(item.CartItemID)) {
                            newSet.add(item.CartItemID);
                        }
                    });
                }
                return newSet;
            });
            setLocalError(null);
            return cartData;
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
                    newSet.add(item.CartItemID);
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
                    if (isChecked) {
                        newSet.add(item.CartItemID);
                    } else {
                        newSet.delete(item.CartItemID);
                    }
                });
            }
            return newSet;
        });
    };

    // --- Confirmation Modal Handlers ---
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
        // If canceled, revert the quantity to 1 for the specific item
        if (itemToDelete) {
            setCart(prevCart => {
                if (!prevCart) return null;
                const updatedItems = prevCart.cartItems.map(cartItem =>
                    cartItem.CartItemID === itemToDelete.CartItemID
                        ? { ...cartItem, Quantity: 1 } // Revert to 1
                        : cartItem
                );
                return { ...prevCart, cartItems: updatedItems };
            });
        }
        setShowDeleteConfirm(false);
        setItemToDelete(null);
        showNotification('Thao tác xóa đã bị hủy. Số lượng sản phẩm đã được đặt lại về 1.', 'warning');
    };
    // --- End Confirmation Modal Handlers ---

    // --- Modified handleUpdateQuantity ---
    const handleUpdateQuantity = async (item: CartItem, newQuantityInput: number | string) => {
        let newQuantity = typeof newQuantityInput === 'string' ? parseInt(newQuantityInput) : newQuantityInput;

        if (isNaN(newQuantity)) {
            newQuantity = 0; // Treat invalid input as 0 for deletion prompt
        }

        // --- Step 1: Handle Zero/Negative Quantity (Deletion Confirmation) ---
        if (newQuantity <= 0) {
            setItemToDelete(item);
            setShowDeleteConfirm(true);
            return;
        }

        // --- Step 2: Client-side Quantity Clamping (Max 10 or Stock Quantity) ---
        const maxStock = item.productVariant?.StockQuantity || 1;
        const hardLimit = 10;

        let finalQuantity = newQuantity;

        // Apply max stock limit
        if (finalQuantity > maxStock) {
            finalQuantity = maxStock;
            showNotification(`Số lượng không thể vượt quá tồn kho (${maxStock}).`, 'warning');
        }

        // Apply arbitrary hard limit of 10 if stock allows
        if (finalQuantity > hardLimit && maxStock >= hardLimit) {
            finalQuantity = hardLimit;
            if (newQuantity > hardLimit) {
               showNotification(`Số lượng tối đa cho phép là ${hardLimit} sản phẩm.`, 'warning');
            }
        }

        // If the quantity hasn't actually changed after clamping, or if it's an invalid string input
        // that got clamped to the current quantity, simply update the UI and return.
        if (finalQuantity === item.Quantity) {
            // This is for cases like typing "abc" which becomes 0, then clamped to current Quantity (e.g., 1)
            // or typing "15" which is clamped to 10, but Quantity was already 10.
            // In these cases, we want to update the UI to reflect the clamped value without an API call.
            if (typeof newQuantityInput === 'string' || newQuantity !== finalQuantity) {
                setCart(prevCart => {
                    if (!prevCart) return null;
                    const updatedItems = prevCart.cartItems.map(cartItem =>
                        cartItem.CartItemID === item.CartItemID
                            ? { ...cartItem, Quantity: finalQuantity }
                            : cartItem
                    );
                    return { ...prevCart, cartItems: updatedItems };
                });
            }
            return;
        }

        // --- Step 3: Make API Call for Valid Quantity Change ---
        try {
            const updatedCart = await updateCartItemQuantity(item.CartItemID, finalQuantity);
            setCart(updatedCart);
            setLocalError(null);
            showNotification((updatedCart as any).message || 'Số lượng sản phẩm đã được cập nhật.', 'success');
        } catch (err: any) {
            console.error('Error updating quantity:', err);
            let errorMessage = 'Không thể cập nhật số lượng sản phẩm.';
            if (err.response && err.response.data) {
                errorMessage = err.response.data.message || errorMessage;
                if (err.response.data.available_stock !== undefined) {
                    errorMessage = `Số lượng yêu cầu vượt quá số lượng sản phẩm có sẵn trong kho. Chỉ còn ${err.response.data.available_stock} sản phẩm.`;
                }
            }
            setLocalError(errorMessage);
            showNotification(errorMessage, 'error', 5000);

            // Revert quantity in UI to previous valid state if API call failed
            setCart(prevCart => {
                if (!prevCart) return null;
                const updatedItems = prevCart.cartItems.map(cartItem =>
                    cartItem.CartItemID === item.CartItemID
                        ? { ...cartItem, Quantity: item.Quantity } // Revert to original quantity
                        : cartItem
                );
                return { ...prevCart, cartItems: updatedItems };
            });
        }
    };
    // --- End Modified handleUpdateQuantity ---


    const handleRemoveItem = async (cartItemId: number) => {
        // This function is now typically called via handleConfirmDelete after modal confirmation
        // Keeping it separate in case of direct calls (e.g., "Remove selected items")
        try {
            const updatedCart = await removeCartItem(cartItemId);
            setCart(updatedCart);
            setSelectedCartItemIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(cartItemId);
                return newSet;
            });
            setLocalError(null);
            showNotification((updatedCart as any).message || 'Sản phẩm đã được xóa khỏi giỏ hàng.', 'success');
        } catch (err: any) {
            console.error('Error removing item:', err);
            const errorMessage = (err as any).response?.data?.message || 'Failed to remove item.';
            setLocalError(errorMessage);
            showNotification(errorMessage, 'error');
        }
    };

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

    // NEW: Effect to set indeterminate state for shop checkboxes
    useEffect(() => {
        Object.entries(groupedItems).forEach(([shopIdStr, items]) => {
            const shopId = parseInt(shopIdStr);
            const checkbox = shopCheckboxRefs.current.get(shopId);
            if (checkbox) {
                const selectedCount = items.filter(item => selectedCartItemIds.has(item.CartItemID)).length;
                const totalCount = items.length;

                const isShopFullySelected = totalCount > 0 && selectedCount === totalCount;
                const isShopPartiallySelected = selectedCount > 0 && selectedCount < totalCount;

                checkbox.checked = isShopFullySelected;
                checkbox.indeterminate = isShopPartiallySelected;
            }
        });
    }, [selectedCartItemIds, groupedItems]);


    if (loading) {
        return <div className="text-center py-8">Đang tải giỏ hàng...</div>;
    }

    if (!cart || !Array.isArray(cart.cartItems) || cart.cartItems.length === 0) {
        return <div className="text-center py-8 text-gray-600">Giỏ hàng của bạn đang trống.</div>;
    }

    return (
            <div className="container mx-auto px-4">
            {/* Notification display sử dụng NotificationModal */}
            <NotificationModal
                isOpen={!!notification} // Mở nếu notification không null
                message={notification?.message || ''}
                type={notification?.type || 'success'}
                onClose={() => setNotification(null)} // Cho phép đóng thủ công
            />

            {/* Confirmation Modal */}
            {showDeleteConfirm && itemToDelete && (
                <ConfirmModal
                    isOpen={showDeleteConfirm}
                    message={`Bạn có chắc chắn muốn xoá sản phẩm "${itemToDelete.productVariant?.product?.Name}" khỏi giỏ hàng?`}
                    onConfirm={handleConfirmDelete}
                    onCancel={handleCancelDelete}
                />
            )}

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
                    <div className="bg-white shadow-box mt-4 mb-4 grid grid-cols-12 rounded-sm text-gray-500 text-xs uppercase px-4 py-4">
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
                        const shopId = parseInt(shopIdStr); // Convert string key back to number
                        const shopName = items[0]?.shop?.ShopName;

                        return (
                            <div key={shopId} className="shop-group bg-white rounded-sm shadow-sm last:border-b-0 mb-4">
                                {/* Shop Header */}
                                <div className="flex items-center gap-2 px-4 py-2 border-b border-opacity-50">
                                    {/* Shop-level checkbox */}
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
                                            {/* Individual product checkbox */}
                                            <input
                                                type="checkbox"
                                                className="form-checkbox text-red-500 rounded"
                                                checked={!!selectedCartItemIds.has(item.CartItemID)}
                                                onChange={(e) => handleItemCheckboxChange(item.CartItemID, e.target.checked)}
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
                                                >
                                                    -
                                                </button>
                                                <input
                                                    type="text"
                                                    value={item.Quantity}
                                                    onChange={(e) => handleUpdateQuantity(item, e.target.value)}
                                                    className="w-full text-center text-black text-sm border-l border-r outline-none"
                                                />
                                                <button
                                                    onClick={() => handleUpdateQuantity(item, item.Quantity + 1)}
                                                    className="px-2 py-1 text-gray-600 hover:text-gray-800"
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
                                {/* Voucher and Shipping sections */}
                                <div className="rounded-md p-4 mb-6">
                                    <div className="flex items-center gap-2 text-red-500 mb-2">
                                        <span className="text-lg">🎁</span>
                                        <span>Voucher giảm đến ₫30k</span>
                                        <button className="text-blue-500 text-sm hover:underline">Xem thêm voucher</button>
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
                    <div className="w-full flex flex-row border-b"><a href="" className="w-50 text-red ms-auto py-2">Thêm mã giảm giá</a></div>
                    <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                {/* "Select All" checkbox in sticky footer */}
                                <input
                                    type="checkbox"
                                    className="form-checkbox text-red-500 rounded"
                                    checked={isAllItemsSelected}
                                    onChange={(e) => handleSelectAllChange(e.target.checked)}
                                    disabled={cart.cartItems.length === 0}
                                />
                                <span className="text-sm text-gray-800">Chọn Tất Cả ({cart.cartItems.length})</span>
                            </div>
                            <button className="text-gray-600 hover:text-gray-800 text-sm">Xóa</button>
                            <button className="text-blue-500 hover:underline text-sm">Lưu vào mục Đã thích</button>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-600">Tổng thanh toán ({numberOfSelectedItems}) Sản phẩm:</span>
                            <span className="text-xl text-red-500 font-bold">
                                ₫{calculateTotalAmount().toLocaleString('vi-VN')}
                            </span>
                        </div>
                        <button
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