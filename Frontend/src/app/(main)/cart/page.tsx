'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { fetchCart, updateCartItemQuantity, removeCartItem } from '@/services/cart';
import { Cart, CartItem, AttributeValue } from '@/types';
import { getProductAttributes } from '@/services/api';
import AttributeSelectionDropdown from '@/app/components/AttributeSelectionDropdown';

const CartPage: React.FC = () => {
    const [cart, setCart] = useState<Cart | null>(null);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [openDropdownItemId, setOpenDropdownItemId] = useState<number | null>(null);
    const [attributeOptions, setAttributeOptions] = useState<{ [key: string]: any } | null>(null);

    // State to keep track of selected CartItem IDs
    const [selectedCartItemIds, setSelectedCartItemIds] = useState<Set<number>>(new Set());

    // Ref for the currently active dropdown button (to prevent closing on button click)
    const currentDropdownButtonRef = useRef<HTMLButtonElement>(null);

    // Map to store refs for each shop checkbox to handle indeterminate state
    const shopCheckboxRefs = useRef<Map<number, HTMLInputElement>>(new Map());

    useEffect(() => {
        const authToken = localStorage.getItem('authToken');
        if (!authToken) {
            router.push('/login');
            return;
        }

        const getCart = async () => {
            try {
                setLoading(true);
                const cartData = await fetchCart();
                setCart(cartData);
                // Ensure no items are selected by default when cart loads
                setSelectedCartItemIds(new Set());
            } catch (err) {
                console.error('Error fetching cart:', err);
                setError('Failed to load cart.');
            } finally {
                setLoading(false);
            }
        };

        getCart();
    }, [router]);

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

    // NEW: Handle shop-level checkbox change
    const handleShopCheckboxChange = (shopId: number, isChecked: boolean) => {
        setSelectedCartItemIds(prev => {
            const newSet = new Set(prev);
            const itemsInShop = groupedItems[shopId]; // Use groupedItems to get items for this shop

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

    const handleUpdateQuantity = async (cartItemId: number, quantity: number) => {
        try {
            const newQuantity = Math.max(1, quantity);
            const updatedCart = await updateCartItemQuantity(cartItemId, newQuantity);
            setCart(updatedCart);
        } catch (err) {
            setError('Failed to update item quantity.');
            console.error(err);
        }
    };

    const handleRemoveItem = async (cartItemId: number) => {
        try {
            const updatedCart = await removeCartItem(cartItemId);
            setCart(updatedCart);
            // Also remove from selected items if it was selected
            setSelectedCartItemIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(cartItemId);
                return newSet;
            });
        } catch (err) {
            setError('Failed to remove item.');
            console.error(err);
        }
    };

    const handleAttributeClick = async (item: CartItem) => {
        if (openDropdownItemId === item.CartItemID) {
            handleCloseDropdown();
            return;
        }

        if (!item.productVariant?.ProductID) {
            console.warn('Product ID is missing');
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
        } catch (error) {
            setError('Failed to fetch attributes.');
            console.error('Error fetching attributes:', error);
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

                checkbox.checked = isShopFullySelected; // Set checked state
                checkbox.indeterminate = isShopPartiallySelected; // Set indeterminate state
            }
        });
    }, [selectedCartItemIds, groupedItems]); // Re-run when selections or grouped items change


    if (loading) {
        return <div>Đang tải giỏ hàng...</div>;
    }

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    if (!cart || !Array.isArray(cart.cartItems) || cart.cartItems.length === 0) {
        return <div>Giỏ hàng của bạn đang trống.</div>;
    }


    return (
            <div className="container mx-auto px-4">
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
                            <div key={shopId} className="shop-group bg-white rounded-sm shadow-sm last:border-b-0">
                                {/* Shop Header */}
                                <div className="flex items-center gap-2 px-4 py-2 border-b border-opacity-50">
                                    {/* Shop-level checkbox */}
                                    <input
                                        type="checkbox"
                                        className="form-checkbox text-red-500 rounded"
                                        // Use ref to manage indeterminate state directly on DOM
                                        ref={el => {
                                            if (el) {
                                                shopCheckboxRefs.current.set(shopId, el);
                                            } else {
                                                shopCheckboxRefs.current.delete(shopId);
                                            }
                                        }}
                                        onChange={(e) => handleShopCheckboxChange(shopId, e.target.checked)}
                                        // Checked state is controlled by useEffect, so no 'checked' prop here
                                        // unless you want to explicitly set it based on initial load
                                    />
                                    <span className="text-lg text-red-500">🏪</span>
                                    <span className="font-bold text-sm text-gray-800">{shopName || `Shop ID: ${shopId}`}</span>
                                </div>
                                {/* Cart Items for this shop */}
                                {items.map((item: CartItem) => (
                                    <div key={item.CartItemID} className="grid grid-cols-12 items-center px-4 py-3 last:border-b-0">
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
                                                    onClick={() => handleUpdateQuantity(item.CartItemID, item.Quantity - 1)}
                                                    className="px-2 py-1 text-gray-600 hover:text-gray-800"
                                                >
                                                    -
                                                </button>
                                                <input
                                                    type="text"
                                                    value={item.Quantity}
                                                    onChange={(e) => handleUpdateQuantity(item.CartItemID, parseInt(e.target.value) || 1)}
                                                    className="w-full text-center text-black text-sm border-l border-r outline-none"
                                                />
                                                <button
                                                    onClick={() => handleUpdateQuantity(item.CartItemID, item.Quantity + 1)}
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
                                                onClick={() => handleRemoveItem(item.CartItemID)}
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